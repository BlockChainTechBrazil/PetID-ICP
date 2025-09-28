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

persistent actor PetID {
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
    private var nextTokenId: Nat = 1;
    private var nextHealthRecordId: Nat = 1;
    private var totalTokens: Nat = 0;
    
    private var tokensEntries : [(Nat, TokenMetadata)] = [];
    private transient var tokens = HashMap.HashMap<Nat, TokenMetadata>(0, Nat.equal, func(n: Nat): Nat32 { Nat32.fromNat(n % (2**32 - 1)) });
    
    private var ownersEntries : [(Nat, Principal)] = [];
    private transient var owners = HashMap.HashMap<Nat, Principal>(0, Nat.equal, func(n: Nat): Nat32 { Nat32.fromNat(n % (2**32 - 1)) });
    
    private var balancesEntries : [(Principal, Nat)] = [];
    private transient var balances = HashMap.HashMap<Principal, Nat>(0, Principal.equal, Principal.hash);
    
    private var operatorsEntries : [(Nat, Principal)] = [];
    private transient var operators = HashMap.HashMap<Nat, Principal>(0, Nat.equal, func(n: Nat): Nat32 { Nat32.fromNat(n % (2**32 - 1)) });

    // Pet RWA Storage
    private var petsEntries : [(Nat, Pet)] = [];
    private transient var pets = HashMap.HashMap<Nat, Pet>(0, Nat.equal, func(n: Nat): Nat32 { Nat32.fromNat(n % (2**32 - 1)) });

    // Health Records Storage
    private var healthRecordsEntries : [(Nat, HealthRecord)] = [];
    private transient var healthRecords = HashMap.HashMap<Nat, HealthRecord>(0, Nat.equal, func(n: Nat): Nat32 { Nat32.fromNat(n % (2**32 - 1)) });
    
    private var healthRecordsByPetEntries : [(Nat, [Nat])] = [];
    private transient var healthRecordsByPet = HashMap.HashMap<Nat, [Nat]>(0, Nat.equal, func(n: Nat): Nat32 { Nat32.fromNat(n % (2**32 - 1)) });

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

        // Verificar se o caller é o proprietário ou operador aprovado
        let isOwner = Principal.equal(caller, currentOwner);
        let isApproved = switch (operators.get(tokenId)) {
            case (?approved) { Principal.equal(caller, approved) };
            case null { false };
        };

        if (not (isOwner or isApproved)) {
            return #err("Você não tem permissão para transferir este token");
        };

        // Realizar a transferência
        owners.put(tokenId, to);
        
        // ✅ CORREÇÃO: Atualizar o pet.owner também
        switch (pets.get(tokenId)) {
            case (?pet) {
                let updatedPet = { pet with owner = to };
                pets.put(tokenId, updatedPet);
            };
            case null { };
        };
        
        // Atualizar balances
        let fromBalance = Option.get(balances.get(currentOwner), 0);
        let toBalance = Option.get(balances.get(to), 0);
        balances.put(currentOwner, fromBalance - 1);
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

        // Remover aprovação após transferência
        operators.delete(tokenId);

        #ok(())
    };

    // Transfer de terceiros (operadores aprovados) - DIP721
    public shared(msg) func transferFrom(from: Principal, to: Principal, tokenId: Nat) : async Result.Result<(), Text> {
        let caller = msg.caller;
        
        // Verificar se o token existe
        let currentOwner = switch (owners.get(tokenId)) {
            case (?owner) { owner };
            case null { return #err("Token não encontrado") };
        };

        // Verificar se 'from' é realmente o proprietário
        if (not Principal.equal(from, currentOwner)) {
            return #err("'from' não é o proprietário do token");
        };

        // Verificar se o caller é o proprietário ou operador aprovado
        let isOwner = Principal.equal(caller, currentOwner);
        let isApproved = switch (operators.get(tokenId)) {
            case (?approved) { Principal.equal(caller, approved) };
            case null { false };
        };

        if (not (isOwner or isApproved)) {
            return #err("Você não tem permissão para transferir este token");
        };

        // Reutilizar lógica da transfer()
        await transfer(to, tokenId)
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
        
        // ✅ CORREÇÃO: Controle de acesso - apenas o próprio usuário pode mintar para si
        if (Principal.isAnonymous(caller)) {
            return #err("Usuário não autenticado");
        };

        if (not Principal.equal(caller, to)) {
            return #err("Você só pode criar pets para você mesmo");
        };

        // ✅ CORREÇÃO: Validações de entrada
        if (Text.size(petData.photo) == 0) {
            return #err("CID da foto é obrigatório");
        };
        if (Text.size(petData.nickname) == 0) {
            return #err("Nome do pet é obrigatório");
        };
        if (Text.size(petData.birthDate) == 0) {
            return #err("Data de nascimento é obrigatória");
        };
        if (Text.size(petData.species) == 0) {
            return #err("Espécie é obrigatória");
        };
        if (Text.size(petData.gender) == 0) {
            return #err("Gênero é obrigatório");
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
        
        // ✅ CORREÇÃO: Remover pet também
        pets.delete(tokenId);
        
        // Remover aprovações
        operators.delete(tokenId);
        
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
    // DIP721 Standard Functions 
    // ==========================================

    // Retorna interfaces suportadas (obrigatório DIP721)
    public query func supportedInterfaces() : async [Text] {
        ["DIP721", "DIP721v2"]
    };

    // Retorna logo do contrato (opcional DIP721)
    public query func logo() : async ?Text {
        ?"data:image/svg+xml;base64,..." // Implementar logo se necessário
    };

    // Retorna nome da coleção (opcional DIP721)
    public query func name() : async ?Text {
        ?"PetID RWA Collection"
    };

    // Retorna símbolo da coleção (opcional DIP721)
    public query func symbol() : async ?Text {
        ?"PETRWA"
    };

    // ==========================================
    // Pet RWA Specific Functions
    // ==========================================

    // Retorna todos os pets do usuário
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