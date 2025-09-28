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
import Option "mo:base/Option";

actor PetID_DIP721 {
    // ==============================================
    // PetID RWA (Real World Assets) NFT Platform
    // DIP721 Compliant NFTs for Pet Registration
    // ==============================================
    
    // DIP721 Token Metadata Structure
    public type TokenMetadata = {
        token_identifier : Nat;
        owner : ?Principal;
        operator : ?Principal;
        properties : [(Text, GenericValue)];
        is_burned : Bool;
        minted_at : Int;
        minted_by : Principal;
        transferred_at : ?Int;
        transferred_by : ?Principal;
    };

    public type GenericValue = {
        #Nat : Nat;
        #Int : Int;
        #Text : Text;
        #Bool : Bool;
        #Blob : Blob;
        #Class : [(Text, GenericValue)];
    };

    // Pet RWA Structure
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

    public type PetPayload = {
        photo: Text;
        nickname: Text;
        birthDate: Text;
        species: Text;
        gender: Text;
        color: Text;
        isLost: Bool;
    };

    // Health Record Structure
    public type HealthRecord = {
        id: Nat;
        petId: Nat;
        date: Text;
        serviceType: Text; // consulta, tratamento, cirurgia, vacina, emergencia, exame
        veterinarianName: Text;
        local: ?Text;
        status: Text; // pending, completed, cancelled, in_progress
        description: ?Text;
        attachments: [Text]; // Array de CIDs do IPFS
        createdAt: Int;
        createdBy: Principal;
    };

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

    // Storage
    private stable var nextTokenId: Nat = 1;
    private stable var nextHealthRecordId: Nat = 1;
    private stable var totalTokens: Nat = 0;
    
    private stable var tokensEntries : [(Nat, TokenMetadata)] = [];
    private var tokens = HashMap.HashMap<Nat, TokenMetadata>(0, Nat.equal, func(n: Nat): Nat32 { Nat32.fromNat(n % (2**32 - 1)) });
    
    private stable var ownersEntries : [(Nat, Principal)] = [];
    private var owners = HashMap.HashMap<Nat, Principal>(0, Nat.equal, func(n: Nat): Nat32 { Nat32.fromNat(n % (2**32 - 1)) });
    
    private stable var balancesEntries : [(Principal, Nat)] = [];
    private var balances = HashMap.HashMap<Principal, Nat>(0, Principal.equal, Principal.hash);
    
    private stable var operatorsEntries : [(Nat, Principal)] = [];
    private var operators = HashMap.HashMap<Nat, Principal>(0, Nat.equal, func(n: Nat): Nat32 { Nat32.fromNat(n % (2**32 - 1)) });

    // Pet RWA Storage
    private stable var petsEntries : [(Nat, Pet)] = [];
    private var pets = HashMap.HashMap<Nat, Pet>(0, Nat.equal, func(n: Nat): Nat32 { Nat32.fromNat(n % (2**32 - 1)) });

    // Health Records Storage
    private stable var healthRecordsEntries : [(Nat, HealthRecord)] = [];
    private var healthRecords = HashMap.HashMap<Nat, HealthRecord>(0, Nat.equal, func(n: Nat): Nat32 { Nat32.fromNat(n % (2**32 - 1)) });
    
    private stable var healthRecordsByPetEntries : [(Nat, [Nat])] = [];
    private var healthRecordsByPet = HashMap.HashMap<Nat, [Nat]>(0, Nat.equal, func(n: Nat): Nat32 { Nat32.fromNat(n % (2**32 - 1)) });

    // ==========================================
    // DIP721 Interface Implementation
    // ==========================================

    // Retorna o saldo de NFTs do proprietário
    public query func balanceOf(owner: Principal) : async Nat {
        switch (balances.get(owner)) {
            case (?balance) { balance };
            case null { 0 };
        };
    };

    // Retorna o proprietário de um token específico
    public query func ownerOf(tokenId: Nat) : async Result.Result<Principal, Text> {
        switch (owners.get(tokenId)) {
            case (?owner) { #ok(owner) };
            case null { #err("Token não encontrado") };
        };
    };

    // Transfere um token entre proprietários
    public shared(msg) func transfer(to: Principal, tokenId: Nat) : async Result.Result<(), Text> {
        let caller = msg.caller;
        
        // Verificar se o token existe
        let currentOwner = switch (owners.get(tokenId)) {
            case (?owner) { owner };
            case null { return #err("Token não encontrado") };
        };

        // Verificar se o caller é o proprietário
        if (not Principal.equal(caller, currentOwner)) {
            return #err("Você não é o proprietário deste token");
        };

        // Realizar a transferência
        owners.put(tokenId, to);
        
        // Atualizar balances
        let fromBalance = Option.get(balances.get(caller), 0);
        let toBalance = Option.get(balances.get(to), 0);
        balances.put(caller, fromBalance - 1);
        balances.put(to, toBalance + 1);

        // Atualizar metadata do token
        switch (tokens.get(tokenId)) {
            case (?metadata) {
                let updatedMetadata = {
                    metadata with 
                    owner = ?to;
                    transferred_at = ?Time.now();
                    transferred_by = ?caller;
                };
                tokens.put(tokenId, updatedMetadata);
            };
            case null { };
        };

        // Atualizar pet owner
        switch (pets.get(tokenId)) {
            case (?pet) {
                let updatedPet = { pet with owner = to };
                pets.put(tokenId, updatedPet);
            };
            case null { };
        };

        #ok(())
    };

    // Aprova outro usuário para transferir um token específico
    public shared(msg) func approve(approved: Principal, tokenId: Nat) : async Result.Result<(), Text> {
        let caller = msg.caller;
        
        // Verificar se o token existe e se o caller é o proprietário
        let currentOwner = switch (owners.get(tokenId)) {
            case (?owner) { owner };
            case null { return #err("Token não encontrado") };
        };

        if (not Principal.equal(caller, currentOwner)) {
            return #err("Você não é o proprietário deste token");
        };

        // Definir o operador aprovado
        operators.put(tokenId, approved);
        
        #ok(())
    };

    // Minta um novo NFT RWA Pet
    public shared(msg) func mint(to: Principal, petData: PetPayload) : async Result.Result<Nat, Text> {
        let caller = msg.caller;
        
        if (Principal.isAnonymous(caller)) {
            return #err("Usuário não autenticado");
        };

        let tokenId = nextTokenId;
        nextTokenId += 1;
        totalTokens += 1;

        // Criar o Pet RWA
        let newPet : Pet = {
            id = tokenId;
            photo = petData.photo;
            nickname = petData.nickname;
            birthDate = petData.birthDate;
            species = petData.species;
            gender = petData.gender;
            color = petData.color;
            isLost = petData.isLost;
            owner = to;
            createdAt = Time.now();
        };

        // Armazenar o pet
        pets.put(tokenId, newPet);

        // Criar TokenMetadata DIP721
        let properties : [(Text, GenericValue)] = [
            ("asset_type", #Text("pet_rwa")),
            ("pet_id", #Nat(tokenId)),
            ("photo_ipfs", #Text(petData.photo)),
            ("nickname", #Text(petData.nickname)),
            ("birth_date", #Text(petData.birthDate)),
            ("species", #Text(petData.species)),
            ("gender", #Text(petData.gender)),
            ("color", #Text(petData.color)),
            ("is_lost", #Bool(petData.isLost)),
            ("real_world_asset", #Bool(true)),
            ("created_at", #Int(Time.now())),
        ];

        let tokenMetadata : TokenMetadata = {
            token_identifier = tokenId;
            owner = ?to;
            operator = null;
            properties = properties;
            is_burned = false;
            minted_at = Time.now();
            minted_by = caller;
            transferred_at = null;
            transferred_by = null;
        };

        // Armazenar token metadata
        tokens.put(tokenId, tokenMetadata);
        owners.put(tokenId, to);

        // Atualizar balance do proprietário
        let currentBalance = Option.get(balances.get(to), 0);
        balances.put(to, currentBalance + 1);

        #ok(tokenId)
    };

    // Queima um token
    public shared(msg) func burn(tokenId: Nat) : async Result.Result<(), Text> {
        let caller = msg.caller;
        
        // Verificar se o token existe
        let currentOwner = switch (owners.get(tokenId)) {
            case (?owner) { owner };
            case null { return #err("Token não encontrado") };
        };

        // Verificar se o caller é o proprietário
        if (not Principal.equal(caller, currentOwner)) {
            return #err("Você não é o proprietário deste token");
        };

        // Marcar como queimado
        switch (tokens.get(tokenId)) {
            case (?metadata) {
                let burnedMetadata = {
                    metadata with 
                    is_burned = true;
                    owner = null;
                };
                tokens.put(tokenId, burnedMetadata);
            };
            case null { return #err("Metadata do token não encontrado") };
        };

        // Remover da lista de proprietários
        owners.delete(tokenId);
        pets.delete(tokenId);
        
        // Atualizar balance
        let currentBalance = Option.get(balances.get(caller), 0);
        balances.put(caller, Nat.max(0, currentBalance - 1));
        
        totalTokens := Nat.max(0, totalTokens - 1);

        #ok(())
    };

    // Retorna o total de tokens em circulação
    public query func totalSupply() : async Nat {
        totalTokens
    };

    // Retorna metadata de um token específico
    public query func tokenMetadata(tokenId: Nat) : async Result.Result<TokenMetadata, Text> {
        switch (tokens.get(tokenId)) {
            case (?metadata) { #ok(metadata) };
            case null { #err("Token não encontrado") };
        };
    };

    // ==========================================
    // Pet RWA Specific Functions
    // ==========================================

    // Retorna todos os pets do usuário (compatibilidade com frontend atual)
    public shared(msg) func getMyPets() : async Result.Result<[Pet], Text> {
        let caller = msg.caller;
        if (Principal.isAnonymous(caller)) {
            return #err("Usuário não autenticado");
        };

        let userPets = Buffer.Buffer<Pet>(0);
        for ((tokenId, pet) in pets.entries()) {
            if (Principal.equal(pet.owner, caller)) {
                userPets.add(pet);
            };
        };

        #ok(Buffer.toArray(userPets))
    };

    // Função de compatibilidade: createPet -> mint
    public shared(msg) func createPet(payload: PetPayload) : async Result.Result<Pet, Text> {
        let caller = msg.caller;
        
        // Usar mint para criar o NFT
        let mintResult = await mint(caller, payload);
        
        switch (mintResult) {
            case (#ok(tokenId)) {
                // Retornar o pet criado
                switch (pets.get(tokenId)) {
                    case (?pet) { #ok(pet) };
                    case null { #err("Erro interno: pet não encontrado após mint") };
                };
            };
            case (#err(error)) { #err(error) };
        };
    };

    // Atualizar status de perdido do pet
    public shared(msg) func updatePetLostStatus(tokenId: Nat, isLost: Bool) : async Result.Result<(), Text> {
        let caller = msg.caller;
        
        // Verificar se o caller é o proprietário do token
        let currentOwner = switch (owners.get(tokenId)) {
            case (?owner) { owner };
            case null { return #err("Token não encontrado") };
        };

        if (not Principal.equal(caller, currentOwner)) {
            return #err("Você não é o proprietário deste pet");
        };

        // Atualizar o pet
        switch (pets.get(tokenId)) {
            case (?pet) {
                let updatedPet = { pet with isLost = isLost };
                pets.put(tokenId, updatedPet);

                // Atualizar metadata do token também
                switch (tokens.get(tokenId)) {
                    case (?metadata) {
                        let updatedProperties = Array.map<(Text, GenericValue), (Text, GenericValue)>(
                            metadata.properties,
                            func((key, value)) {
                                if (key == "is_lost") {
                                    (key, #Bool(isLost))
                                } else {
                                    (key, value)
                                }
                            }
                        );
                        let updatedMetadata = { metadata with properties = updatedProperties };
                        tokens.put(tokenId, updatedMetadata);
                    };
                    case null { };
                };

                #ok(())
            };
            case null { #err("Pet não encontrado") };
        };
    };

    // ==========================================
    // Health Records Functions
    // ==========================================

    // Criar um novo registro médico
    public shared(msg) func createHealthRecord(payload: HealthRecordPayload) : async Result.Result<HealthRecord, Text> {
        let caller = msg.caller;
        
        if (Principal.isAnonymous(caller)) {
            return #err("Usuário não autenticado");
        };

        // Verificar se o pet existe e se o usuário é o proprietário
        switch (pets.get(payload.petId)) {
            case (null) {
                return #err("Pet não encontrado");
            };
            case (?pet) {
                if (not Principal.equal(pet.owner, caller)) {
                    return #err("Você só pode criar registros médicos para seus próprios pets");
                };
            };
        };

        // Validar dados obrigatórios
        if (Text.size(payload.date) == 0 or Text.size(payload.serviceType) == 0 or Text.size(payload.veterinarianName) == 0) {
            return #err("Data, tipo de serviço e nome do veterinário são obrigatórios");
        };

        let recordId = nextHealthRecordId;
        nextHealthRecordId += 1;

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
            createdAt = Time.now();
            createdBy = caller;
        };

        // Salvar o registro
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

        #ok(newRecord)
    };

    // Buscar registros médicos de um pet
    public shared(msg) func getPetHealthRecords(petId: Nat) : async Result.Result<[HealthRecord], Text> {
        let caller = msg.caller;
        
        if (Principal.isAnonymous(caller)) {
            return #err("Usuário não autenticado");
        };

        // Verificar se o pet existe e se o usuário é o proprietário
        switch (pets.get(petId)) {
            case (null) {
                return #err("Pet não encontrado");
            };
            case (?pet) {
                if (not Principal.equal(pet.owner, caller)) {
                    return #err("Você só pode visualizar registros médicos de seus próprios pets");
                };
            };
        };

        // Buscar os registros
        switch (healthRecordsByPet.get(petId)) {
            case (null) {
                #ok([])
            };
            case (?recordIds) {
                let petRecords = Buffer.Buffer<HealthRecord>(0);
                
                for (recordId in Iter.fromArray(recordIds)) {
                    switch (healthRecords.get(recordId)) {
                        case (null) { };
                        case (?record) {
                            petRecords.add(record);
                        };
                    };
                };
                
                #ok(Buffer.toArray(petRecords))
            };
        };
    };

    // Verificar se usuário está autenticado
    public shared(msg) func isAuthenticated() : async Bool {
        not Principal.isAnonymous(msg.caller)
    };

    // ==========================================
    // Upgrade Functions
    // ==========================================

    system func preupgrade() {
        tokensEntries := Iter.toArray(tokens.entries());
        ownersEntries := Iter.toArray(owners.entries());
        balancesEntries := Iter.toArray(balances.entries());
        operatorsEntries := Iter.toArray(operators.entries());
        petsEntries := Iter.toArray(pets.entries());
        healthRecordsEntries := Iter.toArray(healthRecords.entries());
        healthRecordsByPetEntries := Iter.toArray(healthRecordsByPet.entries());
    };

    system func postupgrade() {
        tokens := HashMap.fromIter<Nat, TokenMetadata>(tokensEntries.vals(), tokensEntries.size(), Nat.equal, func(n: Nat): Nat32 { Nat32.fromNat(n % (2**32 - 1)) });
        tokensEntries := [];
        
        owners := HashMap.fromIter<Nat, Principal>(ownersEntries.vals(), ownersEntries.size(), Nat.equal, func(n: Nat): Nat32 { Nat32.fromNat(n % (2**32 - 1)) });
        ownersEntries := [];
        
        balances := HashMap.fromIter<Principal, Nat>(balancesEntries.vals(), balancesEntries.size(), Principal.equal, Principal.hash);
        balancesEntries := [];
        
        operators := HashMap.fromIter<Nat, Principal>(operatorsEntries.vals(), operatorsEntries.size(), Nat.equal, func(n: Nat): Nat32 { Nat32.fromNat(n % (2**32 - 1)) });
        operatorsEntries := [];

        pets := HashMap.fromIter<Nat, Pet>(petsEntries.vals(), petsEntries.size(), Nat.equal, func(n: Nat): Nat32 { Nat32.fromNat(n % (2**32 - 1)) });
        petsEntries := [];

        healthRecords := HashMap.fromIter<Nat, HealthRecord>(healthRecordsEntries.vals(), healthRecordsEntries.size(), Nat.equal, func(n: Nat): Nat32 { Nat32.fromNat(n % (2**32 - 1)) });
        healthRecordsEntries := [];

        healthRecordsByPet := HashMap.fromIter<Nat, [Nat]>(healthRecordsByPetEntries.vals(), healthRecordsByPetEntries.size(), Nat.equal, func(n: Nat): Nat32 { Nat32.fromNat(n % (2**32 - 1)) });
        healthRecordsByPetEntries := [];
    };
}
    
    // Tipo para representar um Pet como RWA
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
    
    // ==============================================
    // DIP721 RWA (Real World Assets) Implementation
    // ==============================================
    
    // Estruturas e funções do padrão DIP721 para RWA de Pets
    public type GenericValue = {
        #Nat : Nat;
        #Int : Int;
        #Text : Text;
        #Bool : Bool;
        #Blob : Blob;
        #Class : [Property];
    };
    
    public type Property = {
        name : Text;
        value : GenericValue;
        immutable : Bool;
    };

    public type TokenMetadata = {
        token_identifier : Nat;
        owner : ?Principal;
        operator : ?Principal;
        properties : [Property];
        is_burned : Bool;
        burned_at : ?Int;
        burned_by : ?Principal;
        approved_at : ?Int;
        approved_by : ?Principal;
        transferred_at : ?Int;
        transferred_by : ?Principal;
        minted_at : Int;
        minted_by : Principal;
    };

    // Armazenamento dos NFTs RWA
    private stable var tokens : [(Nat, TokenMetadata)] = [];
    private var tokensMap = HashMap.HashMap<Nat, TokenMetadata>(0, Nat.equal, func(n: Nat): Nat32 { Nat32.fromNat(n % (2**32 - 1)) });
    
    private stable var owners : [(Nat, Principal)] = [];
    private var ownersMap = HashMap.HashMap<Nat, Principal>(0, Nat.equal, func(n: Nat): Nat32 { Nat32.fromNat(n % (2**32 - 1)) });
    
    private stable var balances : [(Principal, Nat)] = [];
    private var balancesMap = HashMap.HashMap<Principal, Nat>(0, Principal.equal, Principal.hash);
    
    private stable var operators : [(Nat, Principal)] = [];
    private var operatorsMap = HashMap.HashMap<Nat, Principal>(0, Nat.equal, func(n: Nat): Nat32 { Nat32.fromNat(n % (2**32 - 1)) });

    // Função para mapear propriedades do Pet RWA para DIP721 TokenMetadata
    private func mapPetToRWAMetadata(pet: Pet, tokenId: Nat) : TokenMetadata {
        let properties : [Property] = [
            { name = "asset_type"; value = #Text("pet_rwa"); immutable = true },
            { name = "pet_id"; value = #Nat(pet.id); immutable = true },
            { name = "photo_ipfs"; value = #Text(pet.photo); immutable = false },
            { name = "nickname"; value = #Text(pet.nickname); immutable = false },
            { name = "birth_date"; value = #Text(pet.birthDate); immutable = true },
            { name = "species"; value = #Text(pet.species); immutable = true },
            { name = "gender"; value = #Text(pet.gender); immutable = true },
            { name = "color"; value = #Text(pet.color); immutable = false },
            { name = "is_lost"; value = #Bool(pet.isLost); immutable = false },
            { name = "real_world_asset"; value = #Bool(true); immutable = true },
            { name = "created_at"; value = #Int(pet.createdAt); immutable = true },
        ];
        
        return {
            token_identifier = tokenId;
            owner = ?pet.owner;
            operator = null;
            properties = properties;
            is_burned = false;
            burned_at = null;
            burned_by = null;
            approved_at = null;
            approved_by = null;
            transferred_at = null;
            transferred_by = null;
            minted_at = Time.now();
            minted_by = pet.owner;
        };
    };
    
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

    // Estruturas e funções do padrão DIP721
    public type GenericValue = {
        #nat : Nat;
        #nat32 : Nat32;
        #text : Text;
        #bool : Bool;
    };

    public type TokenMetadata = {
        properties: [(Text, GenericValue)];
    };

    public stable var tokens : HashMap.HashMap<Nat, TokenMetadata> = HashMap.HashMap<Nat, TokenMetadata>();
    public stable var owners : HashMap.HashMap<Nat, Principal> = HashMap.HashMap<Nat, Principal>();
    public stable var balances : HashMap.HashMap<Principal, Nat> = HashMap.HashMap<Principal, Nat>();

    public shared(msg) func mint(to: Principal, metadata: TokenMetadata) : async Result.Result<Nat, Text> {
        let tokenId = nextPetId;
        nextPetId += 1;

        tokens.put(tokenId, metadata);
        owners.put(tokenId, to);
        let balance = balances.get(to);
        balances.put(to, Option.get(balance, 0) + 1);

        return #ok(tokenId);
    }

    public shared(msg) func transfer(from: Principal, to: Principal, tokenId: Nat) : async Result.Result<(), Text> {
        if (owners.get(tokenId) != ?from) {
            return #err("Você não é o proprietário do token.");
        };

        owners.put(tokenId, to);
        balances.put(from, Option.get(balances.get(from), 0) - 1);
        balances.put(to, Option.get(balances.get(to), 0) + 1);

        return #ok(());
    }

    public shared(msg) func balance_of(owner: Principal) : async Nat {
        return Option.get(balances.get(owner), 0);
    }

    public shared(msg) func owner_of(tokenId: Nat) : async Result.Result<Principal, Text> {
        switch (owners.get(tokenId)) {
            case (?owner) { return #ok(owner); };
            case null { return #err("Token não encontrado."); };
        };
    }

    public shared(msg) func burn(tokenId: Nat) : async Result.Result<(), Text> {
        switch (owners.get(tokenId)) {
            case (?owner) {
                owners.remove(tokenId);
                tokens.remove(tokenId);
                balances.put(owner, Option.get(balances.get(owner), 0) - 1);
                return #ok(());
            };
            case null { return #err("Token não encontrado."); };
        };
    }

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

    // Função para mapear propriedades do Pet para GenericValue
    public func mapPetToMetadata(pet: Pet) : TokenMetadata {
        return {
            properties = [
                ("id", #nat(pet.id)),
                ("photo", #text(pet.photo)),
                ("nickname", #text(pet.nickname)),
                ("birthDate", #text(pet.birthDate)),
                ("species", #text(pet.species)),
                ("gender", #text(pet.gender)),
                ("color", #text(pet.color)),
                ("isLost", #bool(pet.isLost)),
                ("owner", #text(Principal.toText(pet.owner))),
                ("createdAt", #nat(Nat.fromInt(pet.createdAt)))
            ];
        };
    }

    // Função para migrar dados existentes para o formato DIP721
    public shared(msg) func migrateData() : async Result.Result<(), Text> {
        let caller = msg.caller;

        if (!Principal.isController(caller)) {
            return #err("Apenas o controlador pode executar a migração de dados.");
        };

        for ((petId, pet) in pets.entries()) {
            let metadata = mapPetToMetadata(pet);
            tokens.put(petId, metadata);
            owners.put(petId, pet.owner);

            let balance = balances.get(pet.owner);
            balances.put(pet.owner, Option.get(balance, 0) + 1);
        };

        return #ok(());
    }
};
