import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Buffer "mo:base/Buffer";

persistent actor PetID {
    // Tipo para representar um Pet
    public type Pet = {
        id: Nat;
        photo: Text; // CID da imagem no IPFS
        nickname: Text;
        birthDate: Text;
        species: Text; // dog, cat, bird, snake, hamster
        gender: Text; // male, female
        color: Text; // main pet colors
        isLost: Bool; // lost status flag
        owner: Principal;
        createdAt: Int; // Timestamp
    };

    // Tipo para entrada de dados do formulário
    public type PetPayload = {
        photo: Text; // CID da imagem no IPFS
        nickname: Text;
        birthDate: Text;
        species: Text;
        gender: Text;
        color: Text;
        isLost: Bool;
    };

    // Tipo para representar um Registro Médico
    public type HealthRecord = {
        id: Nat;
        petId: Nat;
        date: Text;
        serviceType: Text; // consulta, tratamento, cirurgia, vacina, emergencia, exame
        veterinarianName: Text;
        local: ?Text; // Local da consulta (opcional)
        status: Text; // pending, completed, cancelled, in_progress
        description: ?Text; // Observações (opcional)
        attachments: [Text]; // Array de CIDs do IPFS para arquivos anexados
        createdAt: Int; // Timestamp
        createdBy: Principal; // Quem criou o registro
    };

    // Tipo para entrada de dados do registro médico
    public type HealthRecordPayload = {
        petId: Nat;
        date: Text;
        serviceType: Text;
        veterinarianName: Text;
        local: ?Text;
        status: Text;
        description: ?Text;
        attachments: [Text];
    };
    
    // Estrutura para armazenar erros
    public type Error = {
        #NotAuthorized;
        #NotFound;
        #AlreadyExists;
        #InvalidInput;
    };

    // Contador de IDs de pets
    private var nextPetId: Nat = 1;
    
    // Contador de IDs de registros médicos
    private var nextHealthRecordId: Nat = 1;
    
    // Registro de pets (persistente)
    private var petsEntries : [(Nat, Pet)] = [];
    private transient var pets = HashMap.HashMap<Nat, Pet>(0, Nat.equal, func(n: Nat): Nat32 { Nat32.fromNat(n % (2**32 - 1)) });
    
    // Registro de registros médicos (persistente)
    private var healthRecordsEntries : [(Nat, HealthRecord)] = [];
    private transient var healthRecords = HashMap.HashMap<Nat, HealthRecord>(0, Nat.equal, func(n: Nat): Nat32 { Nat32.fromNat(n % (2**32 - 1)) });
    
    // Mapeamento de pets por proprietário (Principal do usuário)
    private var petsByOwnerEntries : [(Principal, [Nat])] = [];
    private transient var petsByOwner = HashMap.HashMap<Principal, [Nat]>(0, Principal.equal, Principal.hash);
    
    // Mapeamento de registros médicos por pet
    private var healthRecordsByPetEntries : [(Nat, [Nat])] = [];
    private transient var healthRecordsByPet = HashMap.HashMap<Nat, [Nat]>(0, Nat.equal, func(n: Nat): Nat32 { Nat32.fromNat(n % (2**32 - 1)) });
    
    // Função auxiliar para checar se é o próprio usuário
    private func _isCaller(caller : Principal) : Bool {
        return not Principal.isAnonymous(caller);
    };
    
    // Função para salvar um novo pet
    public shared(msg) func createPet(payload : PetPayload) : async Result.Result<Pet, Text> {
        let caller = msg.caller;
        
        // Verificar se o usuário está autenticado
        if (Principal.isAnonymous(caller)) {
            return #err("Você precisa estar conectado à sua Internet Identity para registrar um pet.");
        };
        
        // Validar os dados do formulário
        if (Text.size(payload.photo) == 0) {
            return #err("O CID da foto do pet é obrigatório.");
        };
        
        if (Text.size(payload.nickname) == 0) {
            return #err("O apelido do pet é obrigatório.");
        };
        
        if (Text.size(payload.birthDate) == 0) {
            return #err("A data de nascimento do pet é obrigatória.");
        };
        
        if (Text.size(payload.species) == 0) {
            return #err("A espécie do pet é obrigatória.");
        };
        
        if (Text.size(payload.gender) == 0) {
            return #err("O gênero do pet é obrigatório.");
        };
        
        if (Text.size(payload.color) == 0) {
            return #err("A cor do pet é obrigatória.");
        };
        
        // Criar o novo pet
        let petId = nextPetId;
        nextPetId += 1;
        
        let now = Time.now();
        
        let newPet : Pet = {
            id = petId;
            photo = payload.photo;
            nickname = payload.nickname;
            birthDate = payload.birthDate;
            species = payload.species;
            gender = payload.gender;
            color = payload.color;
            isLost = payload.isLost;
            owner = caller;
            createdAt = now;
        };
        
        // Salvar o pet
        pets.put(petId, newPet);
        
        // Atualizar a lista de pets do proprietário
        switch (petsByOwner.get(caller)) {
            case (null) {
                petsByOwner.put(caller, [petId]);
            };
            case (?ownerPets) {
                let newOwnerPets = Array.append(ownerPets, [petId]);
                petsByOwner.put(caller, newOwnerPets);
            };
        };
        
        return #ok(newPet);
    };
    
    // Função para buscar todos os pets do usuário autenticado
    public shared(msg) func getMyPets() : async Result.Result<[Pet], Text> {
        let caller = msg.caller;
        
        // Verificar se o usuário está autenticado
        if (Principal.isAnonymous(caller)) {
            return #err("Você precisa estar conectado à sua Internet Identity para visualizar seus pets.");
        };
        
        // Buscar os IDs dos pets do usuário
        switch (petsByOwner.get(caller)) {
            case (null) {
                return #ok([]);
            };
            case (?petIds) {
                var userPets = Buffer.Buffer<Pet>(0);
                
                for (petId in Iter.fromArray(petIds)) {
                    switch (pets.get(petId)) {
                        case (null) {};
                        case (?pet) {
                            userPets.add(pet);
                        };
                    };
                };
                
                return #ok(Buffer.toArray(userPets));
            };
        };
    };
    
    // Função para atualizar informações de um pet
    public shared(msg) func updatePet(petId: Nat, payload: PetPayload) : async Result.Result<Pet, Text> {
        let caller = msg.caller;
        
        // Verificar se o usuário está autenticado
        if (Principal.isAnonymous(caller)) {
            return #err("Você precisa estar conectado à sua Internet Identity para atualizar um pet.");
        };
        
        // Buscar o pet existente
        switch (pets.get(petId)) {
            case (null) {
                return #err("Pet não encontrado.");
            };
            case (?existingPet) {
                // Verificar se o usuário é o proprietário
                if (existingPet.owner != caller) {
                    return #err("Você não tem permissão para atualizar este pet.");
                };
                
                // Validar os dados básicos
                if (Text.size(payload.nickname) == 0) {
                    return #err("O apelido do pet é obrigatório.");
                };
                
                if (Text.size(payload.species) == 0) {
                    return #err("A espécie do pet é obrigatória.");
                };
                
                if (Text.size(payload.gender) == 0) {
                    return #err("O gênero do pet é obrigatório.");
                };
                
                if (Text.size(payload.color) == 0) {
                    return #err("A cor do pet é obrigatória.");
                };
                
                // Criar o pet atualizado (mantendo dados que não podem ser alterados)
                let updatedPet : Pet = {
                    id = existingPet.id;
                    photo = if (Text.size(payload.photo) > 0) { payload.photo } else { existingPet.photo };
                    nickname = payload.nickname;
                    birthDate = if (Text.size(payload.birthDate) > 0) { payload.birthDate } else { existingPet.birthDate };
                    species = payload.species;
                    gender = payload.gender;
                    color = payload.color;
                    isLost = payload.isLost;
                    owner = existingPet.owner; // Não pode ser alterado
                    createdAt = existingPet.createdAt; // Não pode ser alterado
                };
                
                // Salvar as alterações
                pets.put(petId, updatedPet);
                
                return #ok(updatedPet);
            };
        };
    };
    
    // Função para buscar um pet específico por ID
    public query func getPet(petId : Nat) : async Result.Result<Pet, Text> {
        switch (pets.get(petId)) {
            case (null) {
                return #err("Pet não encontrado.");
            };
            case (?pet) {
                return #ok(pet);
            };
        };
    };
    
    // ===== FUNÇÕES DE REGISTROS MÉDICOS =====
    
    // Função para criar um novo registro médico
    public shared(msg) func createHealthRecord(payload : HealthRecordPayload) : async Result.Result<HealthRecord, Text> {
        let caller = msg.caller;
        
        // Verificar se o usuário está autenticado
        if (Principal.isAnonymous(caller)) {
            return #err("Você precisa estar conectado à sua Internet Identity para criar registros médicos.");
        };
        
        // Verificar se o pet existe
        switch (pets.get(payload.petId)) {
            case (null) {
                return #err("Pet não encontrado.");
            };
            case (?pet) {
                // Verificar se o usuário é o proprietário do pet
                if (pet.owner != caller) {
                    return #err("Você só pode criar registros médicos para seus próprios pets.");
                };
            };
        };
        
        // Validar campos obrigatórios
        if (Text.size(payload.date) == 0) {
            return #err("A data do atendimento é obrigatória.");
        };
        
        if (Text.size(payload.serviceType) == 0) {
            return #err("O tipo de serviço é obrigatório.");
        };
        
        if (Text.size(payload.veterinarianName) == 0) {
            return #err("O nome do veterinário é obrigatório.");
        };
        
        if (Text.size(payload.status) == 0) {
            return #err("O status do atendimento é obrigatório.");
        };
        
        // Criar o novo registro médico
        let recordId = nextHealthRecordId;
        nextHealthRecordId += 1;
        
        let now = Time.now();
        
        let newRecord : HealthRecord = {
            id = recordId;
            petId = payload.petId;
            date = payload.date;
            serviceType = payload.serviceType;
            veterinarianName = payload.veterinarianName;
            local = payload.local;
            status = payload.status;
            description = payload.description;
            attachments = payload.attachments;
            createdAt = now;
            createdBy = caller;
        };
        
        // Salvar o registro médico
        healthRecords.put(recordId, newRecord);
        
        // Atualizar a lista de registros do pet
        switch (healthRecordsByPet.get(payload.petId)) {
            case (null) {
                healthRecordsByPet.put(payload.petId, [recordId]);
            };
            case (?petRecords) {
                let newPetRecords = Array.append(petRecords, [recordId]);
                healthRecordsByPet.put(payload.petId, newPetRecords);
            };
        };
        
        return #ok(newRecord);
    };
    
    // Função para buscar todos os registros médicos de um pet
    public shared(msg) func getPetHealthRecords(petId : Nat) : async Result.Result<[HealthRecord], Text> {
        let caller = msg.caller;
        
        // Verificar se o usuário está autenticado
        if (Principal.isAnonymous(caller)) {
            return #err("Você precisa estar conectado à sua Internet Identity para visualizar registros médicos.");
        };
        
        // Verificar se o pet existe e se o usuário é o proprietário
        switch (pets.get(petId)) {
            case (null) {
                return #err("Pet não encontrado.");
            };
            case (?pet) {
                if (pet.owner != caller) {
                    return #err("Você só pode visualizar registros médicos de seus próprios pets.");
                };
            };
        };
        
        // Buscar os registros médicos do pet
        switch (healthRecordsByPet.get(petId)) {
            case (null) {
                return #ok([]);
            };
            case (?recordIds) {
                var petRecords = Buffer.Buffer<HealthRecord>(0);
                
                for (recordId in Iter.fromArray(recordIds)) {
                    switch (healthRecords.get(recordId)) {
                        case (null) {};
                        case (?record) {
                            petRecords.add(record);
                        };
                    };
                };
                
                return #ok(Buffer.toArray(petRecords));
            };
        };
    };
    
    // Função para buscar todos os registros médicos do usuário (todos os pets)
    public shared(msg) func getMyHealthRecords() : async Result.Result<[HealthRecord], Text> {
        let caller = msg.caller;
        
        // Verificar se o usuário está autenticado
        if (Principal.isAnonymous(caller)) {
            return #err("Você precisa estar conectado à sua Internet Identity para visualizar registros médicos.");
        };
        
        // Buscar todos os pets do usuário
        switch (petsByOwner.get(caller)) {
            case (null) {
                return #ok([]);
            };
            case (?petIds) {
                var allRecords = Buffer.Buffer<HealthRecord>(0);
                
                // Para cada pet, buscar seus registros médicos
                for (petId in Iter.fromArray(petIds)) {
                    switch (healthRecordsByPet.get(petId)) {
                        case (null) {};
                        case (?recordIds) {
                            for (recordId in Iter.fromArray(recordIds)) {
                                switch (healthRecords.get(recordId)) {
                                    case (null) {};
                                    case (?record) {
                                        allRecords.add(record);
                                    };
                                };
                            };
                        };
                    };
                };
                
                return #ok(Buffer.toArray(allRecords));
            };
        };
    };
    
    // Função para buscar um registro médico específico por ID
    public shared(msg) func getHealthRecord(recordId : Nat) : async Result.Result<HealthRecord, Text> {
        let caller = msg.caller;
        
        // Verificar se o usuário está autenticado
        if (Principal.isAnonymous(caller)) {
            return #err("Você precisa estar conectado à sua Internet Identity para visualizar registros médicos.");
        };
        
        switch (healthRecords.get(recordId)) {
            case (null) {
                return #err("Registro médico não encontrado.");
            };
            case (?record) {
                // Verificar se o usuário é o proprietário do pet
                switch (pets.get(record.petId)) {
                    case (null) {
                        return #err("Pet associado não encontrado.");
                    };
                    case (?pet) {
                        if (pet.owner != caller) {
                            return #err("Você só pode visualizar registros médicos de seus próprios pets.");
                        };
                        return #ok(record);
                    };
                };
            };
        };
    };
    
    // Verificar se o usuário está conectado (para o frontend)
    public shared(msg) func isAuthenticated() : async Bool {
        return not Principal.isAnonymous(msg.caller);
    };
    
    // Para pré-renderização e indexação
    public query func getAllPets() : async [Pet] {
        let allPets = Buffer.Buffer<Pet>(0);
        for ((_, pet) in pets.entries()) {
            allPets.add(pet);
        };
        return Buffer.toArray(allPets);
    };

    // Função para atualizar um registro médico
    public shared(msg) func updateHealthRecord(recordId : Nat, payload : HealthRecordPayload) : async Result.Result<HealthRecord, Text> {
        let caller = msg.caller;
        
        // Verificar se o usuário está autenticado
        if (Principal.isAnonymous(caller)) {
            return #err("Você precisa estar conectado à sua Internet Identity para atualizar registros médicos.");
        };
        
        // Buscar o registro existente
        switch (healthRecords.get(recordId)) {
            case (null) {
                return #err("Registro médico não encontrado.");
            };
            case (?existingRecord) {
                // Verificar se o usuário é o proprietário do pet
                switch (pets.get(existingRecord.petId)) {
                    case (null) {
                        return #err("Pet associado não encontrado.");
                    };
                    case (?pet) {
                        if (pet.owner != caller) {
                            return #err("Você só pode editar registros médicos de seus próprios pets.");
                        };
                        
                        // Validar dados básicos
                        if (Text.size(payload.date) == 0 or Text.size(payload.serviceType) == 0 or Text.size(payload.veterinarianName) == 0) {
                            return #err("Data, tipo de serviço e nome do veterinário são obrigatórios.");
                        };
                        
                        // Criar registro atualizado (mantém ID, petId, timestamp e createdBy originais)
                        let updatedRecord : HealthRecord = {
                            id = existingRecord.id;
                            petId = existingRecord.petId;
                            date = payload.date;
                            serviceType = payload.serviceType;
                            veterinarianName = payload.veterinarianName;
                            local = payload.local;
                            status = payload.status;
                            description = payload.description;
                            attachments = payload.attachments;
                            createdAt = existingRecord.createdAt; // Manter timestamp original
                            createdBy = existingRecord.createdBy; // Manter criador original
                        };
                        
                        // Atualizar o registro
                        healthRecords.put(recordId, updatedRecord);
                        
                        return #ok(updatedRecord);
                    };
                };
            };
        };
    };

    // Função system para preservar o estado
    system func preupgrade() {
        petsEntries := Iter.toArray(pets.entries());
        petsByOwnerEntries := Iter.toArray(petsByOwner.entries());
        healthRecordsEntries := Iter.toArray(healthRecords.entries());
        healthRecordsByPetEntries := Iter.toArray(healthRecordsByPet.entries());
    };

    // Função system para restaurar o estado após atualização
    system func postupgrade() {
        pets := HashMap.fromIter<Nat, Pet>(Iter.fromArray(petsEntries), petsEntries.size(), Nat.equal, func(n: Nat): Nat32 { Nat32.fromNat(n % (2**32 - 1)) });
        petsByOwner := HashMap.fromIter<Principal, [Nat]>(Iter.fromArray(petsByOwnerEntries), petsByOwnerEntries.size(), Principal.equal, Principal.hash);
        healthRecords := HashMap.fromIter<Nat, HealthRecord>(Iter.fromArray(healthRecordsEntries), healthRecordsEntries.size(), Nat.equal, func(n: Nat): Nat32 { Nat32.fromNat(n % (2**32 - 1)) });
        healthRecordsByPet := HashMap.fromIter<Nat, [Nat]>(Iter.fromArray(healthRecordsByPetEntries), healthRecordsByPetEntries.size(), Nat.equal, func(n: Nat): Nat32 { Nat32.fromNat(n % (2**32 - 1)) });
        petsEntries := [];
        petsByOwnerEntries := [];
        healthRecordsEntries := [];
        healthRecordsByPetEntries := [];
    };
};
