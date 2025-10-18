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
        photo: Text; // Asset ID da ICP (ao invés de CID IPFS)
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
        photo: Text; // Asset ID da ICP
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
        attachments: [Text]; // Array de asset IDs da ICP
        createdAt: Int;
        createdBy: Principal;
    };

    // ✅ NOVO: Asset Storage Types para ICP
    public type AssetInfo = {
        id: Text; // Identificador único do asset
        filename: Text;
        contentType: Text; // image/jpeg, image/png, etc.
        size: Nat;
        data: Blob; // Dados binários da imagem
        uploadedAt: Int;
        uploadedBy: Principal;
    };

    public type UploadAssetRequest = {
        filename: Text;
        contentType: Text;
        data: Blob;
    };

    // ✅ NOVO: Estruturas para Relacionamentos Genealógicos
    public type RelationshipType = {
        #Parent;    // Pai/Mãe
        #Child;     // Filho/Filha
        #Sibling;   // Irmão/Irmã
        #Mate;      // Parceiro reprodutivo
        #Related;   // Relacionado (genérico)
    };

    public type PetRelationship = {
        petId1: Nat;       // Primeiro pet
        petId2: Nat;       // Segundo pet
        relationshipType: RelationshipType;
        createdBy: Principal;
        createdAt: Int;
    };

    public type RelationshipPayload = {
        petId1: Nat;
        petId2: Nat;
        relationshipType: RelationshipType;
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

    // ✅ NOVO: Estruturas para IA On-Chain
    public type ChatMessage = {
        id: Nat;
        userId: Principal;
        content: Text;
        role: Text; // "user" ou "assistant"
        timestamp: Int;
        sessionId: ?Text; // Para agrupar conversas
    };

    public type AIResponse = {
        content: Text;
        confidence: Float; // Nível de confiança da resposta
        source: Text; // Fonte da informação (ex: "knowledge_base", "pet_data", "general")
    };

    // ✅ NOVO: Estruturas para Comunidade On-Chain
    public type PostType = {
        #Post;      // Post comum
        #Tip;       // Dica sobre pets
        #Meetup;    // Encontro da comunidade  
        #Event;     // Evento com data/local
    };

    public type CommunityPost = {
        id: Nat;
        userId: Principal;
        username: Text; // Nome do usuário
        postType: PostType;
        title: ?Text; // Título (opcional para posts simples)
        content: Text;
        tags: [Text]; // Tags para categorização
        likes: Nat;
        likedBy: [Principal]; // Usuários que curtiram
        createdAt: Int;
        // Para eventos específicos
        eventDate: ?Text; // Data do evento (formato YYYY-MM-DD)
        eventTime: ?Text; // Hora do evento (formato HH:MM)
        location: ?Text; // Local do evento
    };

    public type PostComment = {
        id: Nat;
        postId: Nat;
        userId: Principal;
        username: Text;
        content: Text;
        createdAt: Int;
    };

    public type CreatePostRequest = {
        postType: PostType;
        title: ?Text;
        content: Text;
        tags: [Text];
        eventDate: ?Text;
        eventTime: ?Text;
        location: ?Text;
    };

    public type UserProfile = {
        principal: Principal;
        username: Text;
        bio: ?Text;
        avatar: Text; // "user" ou "paw" 
        joinedAt: Int;
        postsCount: Nat;
        likesReceived: Nat;
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

    // ✅ NOVO: Asset Storage para imagens na ICP
    private var assetsEntries : [(Text, AssetInfo)] = [];
    private transient var assets = HashMap.HashMap<Text, AssetInfo>(0, Text.equal, Text.hash);
    
    // ✅ NOVO: Relacionamentos Genealógicos Storage
    private var relationshipsEntries : [(Nat, PetRelationship)] = [];
    private transient var relationships = HashMap.HashMap<Nat, PetRelationship>(0, Nat.equal, func(n: Nat): Nat32 { Nat32.fromNat(n % (2**32 - 1)) });
    
    // ✅ NOVO: IA On-Chain Storage
    private var chatMessagesEntries : [(Nat, ChatMessage)] = [];
    private transient var chatMessages = HashMap.HashMap<Nat, ChatMessage>(0, Nat.equal, func(n: Nat): Nat32 { Nat32.fromNat(n % (2**32 - 1)) });
    
    // ✅ NOVO: Comunidade On-Chain Storage
    private var communityPostsEntries : [(Nat, CommunityPost)] = [];
    private transient var communityPosts = HashMap.HashMap<Nat, CommunityPost>(0, Nat.equal, func(n: Nat): Nat32 { Nat32.fromNat(n % (2**32 - 1)) });
    
    private var postCommentsEntries : [(Nat, PostComment)] = [];
    private transient var postComments = HashMap.HashMap<Nat, PostComment>(0, Nat.equal, func(n: Nat): Nat32 { Nat32.fromNat(n % (2**32 - 1)) });
    
    private var userProfilesEntries : [(Principal, UserProfile)] = [];
    private transient var userProfiles = HashMap.HashMap<Principal, UserProfile>(0, Principal.equal, Principal.hash);
    
    private var nextAssetId: Nat = 1;
    private var nextRelationshipId: Nat = 1;
    private var nextChatMessageId: Nat = 1;
    private var nextCommunityPostId: Nat = 1;
    private var nextCommentId: Nat = 1;

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

    // Retorna metadata de um token específico com registros médicos atualizados
    public query func tokenMetadata(tokenId: Nat) : async Result.Result<TokenMetadata, Text> {
        switch (tokens.get(tokenId)) {
            case (?metadata) { 
                // Adicionar estatísticas dos registros médicos aos metadados
                switch (healthRecordsByPet.get(tokenId)) {
                    case (?recordIds) {
                        let totalRecords = recordIds.size();
                        let completedRecords = Array.filter<Nat>(recordIds, func(recordId) {
                            switch (healthRecords.get(recordId)) {
                                case (?record) { record.status == "completed" };
                                case null { false };
                            }
                        }).size();

                        let enhancedProperties = Array.append(metadata.properties, [
                            ("total_health_records", #Nat(totalRecords)),
                            ("completed_health_records", #Nat(completedRecords)),
                            ("health_records_last_updated", #Int(Time.now()))
                        ]);

                        let enhancedMetadata = { metadata with properties = enhancedProperties };
                        #ok(enhancedMetadata)
                    };
                    case null { 
                        // Sem registros médicos
                        let enhancedProperties = Array.append(metadata.properties, [
                            ("total_health_records", #Nat(0)),
                            ("completed_health_records", #Nat(0))
                        ]);

                        let enhancedMetadata = { metadata with properties = enhancedProperties };
                        #ok(enhancedMetadata)
                    };
                }
            };
            case null { #err("Token não encontrado") };
        };
    };

    // ✅ NOVO: Obter metadados completos do NFT incluindo registros médicos detalhados
    public query func getDetailedTokenMetadata(tokenId: Nat) : async Result.Result<{
        metadata: TokenMetadata;
        healthRecords: [HealthRecord];
        petInfo: ?Pet;
    }, Text> {
        switch (tokens.get(tokenId)) {
            case (?metadata) {
                // Buscar registros médicos
                let petHealthRecords = switch (healthRecordsByPet.get(tokenId)) {
                    case (?recordIds) {
                        let records = Buffer.Buffer<HealthRecord>(0);
                        for (recordId in Iter.fromArray(recordIds)) {
                            switch (healthRecords.get(recordId)) {
                                case (?record) { records.add(record) };
                                case null { };
                            };
                        };
                        Buffer.toArray(records)
                    };
                    case null { [] };
                };

                // Buscar informações do pet
                let petInfo = pets.get(tokenId);

                #ok({
                    metadata = metadata;
                    healthRecords = petHealthRecords;
                    petInfo = petInfo;
                })
            };
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

        // ✅ NOVO: Atualizar metadados do NFT com o novo registro médico
        switch (tokens.get(payload.petId)) {
            case (?metadata) {
                // Criar propriedade do novo registro médico
                let recordProperty = ("health_record_" # Nat.toText(recordId), #Class([
                    ("record_id", #Nat(recordId)),
                    ("date", #Text(payload.date)),
                    ("service_type", #Text(payload.serviceType)),
                    ("veterinarian", #Text(payload.veterinarianName)),
                    ("status", #Text(payload.status)),
                    ("created_at", #Int(Time.now())),
                    ("local", switch(payload.local) { case(?l) { #Text(l) }; case null { #Text("") } }),
                    ("description", switch(payload.description) { case(?d) { #Text(d) }; case null { #Text("") } }),
                    ("attachments_count", #Nat(payload.attachments.size()))
                ]));

                // Adicionar nova propriedade aos metadados existentes
                let updatedProperties = Array.append(metadata.properties, [recordProperty]);
                
                let updatedMetadata = { 
                    metadata with 
                    properties = updatedProperties;
                };
                tokens.put(payload.petId, updatedMetadata);
            };
            case null { 
                // NFT não encontrado, mas registro médico já foi salvo
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

    // ✅ NOVO: Buscar todos os registros médicos do usuário
    public shared(msg) func getMyHealthRecords() : async Result.Result<[HealthRecord], Text> {
        let caller = msg.caller;
        
        if (Principal.isAnonymous(caller)) {
            return #err("Usuário não autenticado");
        };

        let allUserRecords = Buffer.Buffer<HealthRecord>(0);

        // Buscar todos os registros médicos criados pelo usuário
        for ((recordId, record) in healthRecords.entries()) {
            if (Principal.equal(record.createdBy, caller)) {
                allUserRecords.add(record);
            };
        };

        #ok(Buffer.toArray(allUserRecords))
    };

    // ✅ NOVO: Buscar um pet específico por ID (necessário para MedicalPanel)
    public query func getPet(petId: Nat) : async Result.Result<Pet, Text> {
        switch (pets.get(petId)) {
            case (?pet) { #ok(pet) };
            case null { #err("Pet não encontrado") };
        }
    };

    // Verificar se usuário está autenticado
    public shared(msg) func isAuthenticated() : async Bool {
        not Principal.isAnonymous(msg.caller)
    };

    // ==========================================
    // Asset Storage Functions (ICP Storage)
    // ==========================================

    // ✅ Upload de imagem para a ICP
    public shared(msg) func uploadAsset(request: UploadAssetRequest) : async Result.Result<Text, Text> {
        let caller = msg.caller;
        
        if (Principal.isAnonymous(caller)) {
            return #err("Usuário não autenticado");
        };

        // Validar tipo de arquivo
        if (not (request.contentType == "image/jpeg" or 
                request.contentType == "image/png" or 
                request.contentType == "image/jpg" or
                request.contentType == "image/webp")) {
            return #err("Apenas imagens JPG, PNG e WebP são suportadas");
        };

        // Validar tamanho (5MB máximo)
        let maxSize = 5 * 1024 * 1024; // 5MB
        if (request.data.size() > maxSize) {
            return #err("Imagem muito grande. Máximo 5MB.");
        };

        let assetId = "asset_" # Nat.toText(nextAssetId);
        nextAssetId += 1;

        let assetInfo: AssetInfo = {
            id = assetId;
            filename = request.filename;
            contentType = request.contentType;
            size = request.data.size();
            data = request.data;
            uploadedAt = Time.now();
            uploadedBy = caller;
        };

        assets.put(assetId, assetInfo);

        #ok(assetId)
    };

    // ✅ Recuperar asset/imagem da ICP
    public query func getAsset(assetId: Text) : async Result.Result<AssetInfo, Text> {
        switch (assets.get(assetId)) {
            case (?asset) { #ok(asset) };
            case null { #err("Asset não encontrado") };
        }
    };

    // ✅ Recuperar apenas dados da imagem (para exibição)
    public query func getAssetData(assetId: Text) : async Result.Result<Blob, Text> {
        switch (assets.get(assetId)) {
            case (?asset) { #ok(asset.data) };
            case null { #err("Asset não encontrado") };
        }
    };

    // ✅ Listar assets do usuário
    public shared(msg) func getMyAssets() : async Result.Result<[AssetInfo], Text> {
        let caller = msg.caller;
        
        if (Principal.isAnonymous(caller)) {
            return #err("Usuário não autenticado");
        };

        let userAssets = Buffer.Buffer<AssetInfo>(0);
        for ((assetId, asset) in assets.entries()) {
            if (Principal.equal(asset.uploadedBy, caller)) {
                userAssets.add(asset);
            };
        };

        #ok(Buffer.toArray(userAssets))
    };

    // ==========================================
    // Genealogy Functions
    // ==========================================

    // ✅ Criar relacionamento entre pets
    public shared(msg) func createRelationship(petId1: Nat, petId2: Nat, relationshipType: RelationshipType) : async Result.Result<Nat, Text> {
        let caller = msg.caller;
        
        if (Principal.isAnonymous(caller)) {
            return #err("Usuário não autenticado");
        };

        // Verificar se os pets existem e pertencem ao usuário
        switch (pets.get(petId1)) {
            case null { return #err("Pet 1 não encontrado") };
            case (?pet1) {
                if (not Principal.equal(pet1.owner, caller)) {
                    return #err("Você não é o dono do Pet 1");
                };
            };
        };

        switch (pets.get(petId2)) {
            case null { return #err("Pet 2 não encontrado") };
            case (?pet2) {
                if (not Principal.equal(pet2.owner, caller)) {
                    return #err("Você não é o dono do Pet 2");
                };
            };
        };

        // Verificar se relacionamento já existe
        for ((_, relationship) in relationships.entries()) {
            if ((relationship.petId1 == petId1 and relationship.petId2 == petId2) or 
                (relationship.petId1 == petId2 and relationship.petId2 == petId1)) {
                return #err("Relacionamento já existe entre estes pets");
            };
        };

        let relationshipId = nextRelationshipId;
        let relationship : PetRelationship = {
            petId1 = petId1;
            petId2 = petId2;
            relationshipType = relationshipType;
            createdBy = caller;
            createdAt = Time.now();
        };

        relationships.put(relationshipId, relationship);
        nextRelationshipId += 1;

        #ok(relationshipId)
    };

    // ✅ Obter relacionamentos de um pet específico
    public query func getPetRelationships(petId: Nat) : async Result.Result<[(Nat, PetRelationship)], Text> {
        switch (pets.get(petId)) {
            case null { return #err("Pet não encontrado") };
            case (?_) {};
        };

        let petRelationships = Buffer.Buffer<(Nat, PetRelationship)>(0);
        for ((relationshipId, relationship) in relationships.entries()) {
            if (relationship.petId1 == petId or relationship.petId2 == petId) {
                petRelationships.add((relationshipId, relationship));
            };
        };

        #ok(Buffer.toArray(petRelationships))
    };

    // ✅ Obter todos os relacionamentos do usuário
    public shared(msg) func getMyRelationships() : async Result.Result<[(Nat, PetRelationship)], Text> {
        let caller = msg.caller;
        
        if (Principal.isAnonymous(caller)) {
            return #err("Usuário não autenticado");
        };

        let userRelationships = Buffer.Buffer<(Nat, PetRelationship)>(0);
        for ((relationshipId, relationship) in relationships.entries()) {
            if (Principal.equal(relationship.createdBy, caller)) {
                userRelationships.add((relationshipId, relationship));
            };
        };

        #ok(Buffer.toArray(userRelationships))
    };

    // ✅ Atualizar tipo de relacionamento
    public shared(msg) func updateRelationship(relationshipId: Nat, newRelationshipType: RelationshipType) : async Result.Result<(), Text> {
        let caller = msg.caller;
        
        if (Principal.isAnonymous(caller)) {
            return #err("Usuário não autenticado");
        };

        switch (relationships.get(relationshipId)) {
            case null { return #err("Relacionamento não encontrado") };
            case (?relationship) {
                if (not Principal.equal(relationship.createdBy, caller)) {
                    return #err("Você não tem permissão para atualizar este relacionamento");
                };

                let updatedRelationship : PetRelationship = {
                    petId1 = relationship.petId1;
                    petId2 = relationship.petId2;
                    relationshipType = newRelationshipType;
                    createdBy = relationship.createdBy;
                    createdAt = relationship.createdAt;
                };

                relationships.put(relationshipId, updatedRelationship);
                #ok()
            };
        }
    };

    // ✅ Excluir relacionamento
    public shared(msg) func deleteRelationship(relationshipId: Nat) : async Result.Result<(), Text> {
        let caller = msg.caller;
        
        if (Principal.isAnonymous(caller)) {
            return #err("Usuário não autenticado");
        };

        switch (relationships.get(relationshipId)) {
            case null { return #err("Relacionamento não encontrado") };
            case (?relationship) {
                if (not Principal.equal(relationship.createdBy, caller)) {
                    return #err("Você não tem permissão para excluir este relacionamento");
                };

                relationships.delete(relationshipId);
                #ok()
            };
        }
    };

    // ✅ Obter árvore genealógica completa de um pet
    public query func getPetGenealogyTree(petId: Nat) : async Result.Result<{
        pet: Pet;
        parents: [Pet];
        children: [Pet];
        siblings: [Pet];
        mates: [Pet];
        related: [Pet];
    }, Text> {
        switch (pets.get(petId)) {
            case null { return #err("Pet não encontrado") };
            case (?pet) {
                let parents = Buffer.Buffer<Pet>(0);
                let children = Buffer.Buffer<Pet>(0);
                let siblings = Buffer.Buffer<Pet>(0);
                let mates = Buffer.Buffer<Pet>(0);
                let related = Buffer.Buffer<Pet>(0);

                for ((_, relationship) in relationships.entries()) {
                    var relatedPetId : ?Nat = null;
                    var isReverse = false;

                    if (relationship.petId1 == petId) {
                        relatedPetId := ?relationship.petId2;
                    } else if (relationship.petId2 == petId) {
                        relatedPetId := ?relationship.petId1;
                        isReverse := true;
                    };

                    switch (relatedPetId) {
                        case null {};
                        case (?rPetId) {
                            switch (pets.get(rPetId)) {
                                case null {};
                                case (?relatedPet) {
                                    switch (relationship.relationshipType) {
                                        case (#Parent) {
                                            if (isReverse) {
                                                children.add(relatedPet);
                                            } else {
                                                parents.add(relatedPet);
                                            };
                                        };
                                        case (#Child) {
                                            if (isReverse) {
                                                parents.add(relatedPet);
                                            } else {
                                                children.add(relatedPet);
                                            };
                                        };
                                        case (#Sibling) {
                                            siblings.add(relatedPet);
                                        };
                                        case (#Mate) {
                                            mates.add(relatedPet);
                                        };
                                        case (#Related) {
                                            related.add(relatedPet);
                                        };
                                    };
                                };
                            };
                        };
                    };
                };

                #ok({
                    pet = pet;
                    parents = Buffer.toArray(parents);
                    children = Buffer.toArray(children);
                    siblings = Buffer.toArray(siblings);
                    mates = Buffer.toArray(mates);
                    related = Buffer.toArray(related);
                })
            };
        }
    };

    // ==========================================
    // ✅ NOVO: Sistema de IA On-Chain
    // ==========================================

    // Salvar mensagem do usuário e gerar resposta inteligente
    public shared(msg) func sendChatMessage(content: Text, sessionId: ?Text) : async Result.Result<AIResponse, Text> {
        let caller = msg.caller;
        let now = Time.now();
        
        // Salvar mensagem do usuário
        let userMessage: ChatMessage = {
            id = nextChatMessageId;
            userId = caller;
            content = content;
            role = "user";
            timestamp = now;
            sessionId = sessionId;
        };
        
        chatMessages.put(nextChatMessageId, userMessage);
        nextChatMessageId += 1;
        
        // Gerar resposta inteligente baseada no conteúdo
        let response = await generateContextualResponse(content, caller);
        
        // Salvar resposta da IA
        let aiMessage: ChatMessage = {
            id = nextChatMessageId;
            userId = caller;
            content = response.content;
            role = "assistant";
            timestamp = now;
            sessionId = sessionId;
        };
        
        chatMessages.put(nextChatMessageId, aiMessage);
        nextChatMessageId += 1;
        
        #ok(response)
    };

    // Função auxiliar para obter pets de um usuário específico
    private func getUserPets(userId: Principal) : async Result.Result<[Pet], Text> {
        if (Principal.isAnonymous(userId)) {
            return #err("Usuário não autenticado");
        };

        let userPets = Buffer.Buffer<Pet>(0);
        for ((tokenId, pet) in pets.entries()) {
            if (Principal.equal(pet.owner, userId)) {
                userPets.add(pet);
            };
        };

        #ok(Buffer.toArray(userPets))
    };

    // Gerar resposta contextual baseada nos dados do usuário
    private func generateContextualResponse(userInput: Text, userId: Principal) : async AIResponse {
        let input = Text.toLowercase(userInput);
        
        // 1. Respostas sobre pets do usuário
        if (Text.contains(input, #text "meu") and (Text.contains(input, #text "pet") or Text.contains(input, #text "animal"))) {
            let userPets = await getUserPets(userId);
            switch (userPets) {
                case (#ok(pets)) {
                    if (pets.size() == 0) {
                        return {
                            content = "Você ainda não tem nenhum pet registrado no PetID! Que tal criar seu primeiro NFT de pet? Vá para a aba NFTs e clique em 'Criar Pet' para começar.";
                            confidence = 0.95;
                            source = "pet_data";
                        };
                    } else {
                        var response = "Você tem " # Nat.toText(pets.size()) # " pet(s) registrado(s):\n\n";
                        for (pet in pets.vals()) {
                            response #= "🐾 " # pet.nickname # " (" # pet.species # ")\n";
                        };
                        response #= "\nTodos são NFTs únicos na blockchain Internet Computer!";
                        return {
                            content = response;
                            confidence = 1.0;
                            source = "pet_data";
                        };
                    };
                };
                case (#err(_)) {
                    return {
                        content = "Não consegui acessar seus dados de pets no momento. Tente novamente.";
                        confidence = 0.3;
                        source = "error";
                    };
                };
            };
        };

        // 2. Informações sobre NFTs e blockchain
        if (Text.contains(input, #text "nft") or Text.contains(input, #text "blockchain") or Text.contains(input, #text "token")) {
            return {
                content = "🔗 No PetID, cada pet é um NFT único na blockchain Internet Computer!\n\n✨ Isso significa:\n• Propriedade digital verificável\n• Histórico médico imutável\n• Transferência segura entre donos\n• Padrão DIP721 (equivalente ao ERC-721)\n• Armazenamento descentralizado\n\nSeu pet não é apenas um registro - é um ativo digital real!";
                confidence = 1.0;
                source = "knowledge_base";
            };
        };

        // 3. Sobre saúde e registros médicos
        if (Text.contains(input, #text "saúde") or Text.contains(input, #text "vacina") or Text.contains(input, #text "veterinário") or Text.contains(input, #text "médico")) {
            return {
                content = "🏥 O PetID mantém todo histórico médico do seu pet on-chain!\n\n📋 Você pode registrar:\n• Consultas veterinárias\n• Vacinações e tratamentos\n• Cirurgias e exames\n• Emergências médicas\n• Anexar fotos e documentos\n\n💾 Todos os dados ficam permanentemente na blockchain, garantindo que nunca se percam e possam ser verificados por qualquer veterinário.";
                confidence = 0.98;
                source = "knowledge_base";
            };
        };

        // 4. Sobre genealogia e relacionamentos
        if (Text.contains(input, #text "genealogia") or Text.contains(input, #text "família") or Text.contains(input, #text "pai") or Text.contains(input, #text "mãe") or Text.contains(input, #text "filho")) {
            return {
                content = "🌳 A genealogia digital do PetID conecta famílias de pets!\n\n👥 Você pode:\n• Registrar pais, mães e filhotes\n• Criar árvores genealógicas\n• Conectar irmãos e parceiros\n• Verificar linhagens\n\n🧬 Cada relacionamento é registrado on-chain, criando uma rede genealógica verificável que ajuda criadores e donos a entender a herança genética.";
                confidence = 0.97;
                source = "knowledge_base";
            };
        };

        // 5. Sobre o projeto PetID
        if (Text.contains(input, #text "petid") or Text.contains(input, #text "projeto")) {
            return {
                content = "🐾 PetID é a primeira plataforma de NFTs para pets na Internet Computer!\n\n🎯 Nossa missão:\n• Criar identidade digital única para pets\n• Registrar histórico médico imutável\n• Facilitar adoção responsável\n• Conectar comunidade pet\n• Combater abandono e maus-tratos\n\n🌐 100% descentralizado, seguro e permanente. Seu pet merece uma identidade digital!";
                confidence = 1.0;
                source = "knowledge_base";
            };
        };

        // 6. Sobre Internet Computer
        if (Text.contains(input, #text "internet computer") or Text.contains(input, #text "icp") or Text.contains(input, #text "dfinity")) {
            return {
                content = "⚡ Internet Computer é a blockchain de nova geração!\n\n🔥 Vantagens:\n• Velocidade web tradicional\n• Custos ultra-baixos\n• Armazenamento on-chain nativo\n• Smart contracts em Motoko\n• Sustentabilidade ambiental\n\n🚀 Por isso escolhemos ICP para o PetID - performance e descentralização real!";
                confidence = 0.95;
                source = "knowledge_base";
            };
        };

        // 7. Respostas de saudação
        if (Text.contains(input, #text "olá") or Text.contains(input, #text "oi") or Text.contains(input, #text "hello") or Text.contains(input, #text "help")) {
            return {
                content = "👋 Olá! Sou a IA do PetID, totalmente on-chain!\n\n💬 Posso ajudar com:\n• Informações sobre seus pets\n• Como usar a plataforma\n• Detalhes sobre NFTs e blockchain\n• Registros médicos e genealogia\n• Dúvidas sobre o projeto\n\nO que você gostaria de saber? 🐾";
                confidence = 1.0;
                source = "general";
            };
        };

        // 8. Resposta padrão para outras perguntas
        return {
            content = "🤔 Ainda estou aprendendo sobre essa questão!\n\nℹ️ Por enquanto, posso ajudar com:\n• Informações sobre seus pets NFT\n• Funcionalidades da plataforma\n• Blockchain e Internet Computer\n• Registros médicos e genealogia\n\n💡 Dica: Tente perguntas como 'meus pets', 'como funciona', 'o que é NFT' ou 'registros médicos'.";
            confidence = 0.6;
            source = "general";
        };
    };

    // Obter histórico de chat do usuário
    public query(msg) func getChatHistory(sessionId: ?Text, limit: ?Nat) : async [ChatMessage] {
        let caller = msg.caller;
        let maxLimit = switch(limit) {
            case (?l) { if (l > 100) 100 else l };
            case null { 50 };
        };
        
        let buffer = Buffer.Buffer<ChatMessage>(0);
        
        for ((_, message) in chatMessages.entries()) {
            if (message.userId == caller) {
                switch (sessionId) {
                    case (?sid) {
                        switch (message.sessionId) {
                            case (?msgSid) {
                                if (msgSid == sid) {
                                    buffer.add(message);
                                };
                            };
                            case null {};
                        };
                    };
                    case null {
                        buffer.add(message);
                    };
                };
            };
        };
        
        // Ordenar por timestamp (mais recentes primeiro)
        let messages = Buffer.toArray(buffer);
        let sorted = Array.sort(messages, func(a: ChatMessage, b: ChatMessage) : { #less; #equal; #greater } {
            if (a.timestamp > b.timestamp) #less
            else if (a.timestamp < b.timestamp) #greater
            else #equal
        });
        
        // Aplicar limite
        if (sorted.size() <= maxLimit) {
            sorted
        } else {
            Array.tabulate<ChatMessage>(maxLimit, func(i) = sorted[i])
        };
    };

    // Limpar histórico de chat do usuário
    public shared(msg) func clearChatHistory(sessionId: ?Text) : async Result.Result<(), Text> {
        let caller = msg.caller;
        let toRemove = Buffer.Buffer<Nat>(0);
        
        for ((id, message) in chatMessages.entries()) {
            if (message.userId == caller) {
                switch (sessionId) {
                    case (?sid) {
                        switch (message.sessionId) {
                            case (?msgSid) {
                                if (msgSid == sid) {
                                    toRemove.add(id);
                                };
                            };
                            case null {};
                        };
                    };
                    case null {
                        toRemove.add(id);
                    };
                };
            };
        };
        
        for (id in toRemove.vals()) {
            chatMessages.delete(id);
        };
        
        #ok()
    };

    // ==========================================
    // ✅ NOVO: Sistema de Comunidade On-Chain
    // ==========================================

    // Criar ou atualizar perfil do usuário
    public shared(msg) func createUserProfile(username: Text, bio: ?Text, avatar: Text) : async Result.Result<UserProfile, Text> {
        let caller = msg.caller;
        if (Principal.isAnonymous(caller)) {
            return #err("Usuário não autenticado");
        };

        // Verificar se username já existe
        for ((principal, profile) in userProfiles.entries()) {
            if (profile.username == username and not Principal.equal(principal, caller)) {
                return #err("Username já existe");
            };
        };

        let profile: UserProfile = {
            principal = caller;
            username = username;
            bio = bio;
            avatar = avatar;
            joinedAt = Time.now();
            postsCount = 0;
            likesReceived = 0;
        };

        userProfiles.put(caller, profile);
        #ok(profile)
    };

    // Obter perfil do usuário
    public query func getUserProfile(userId: Principal) : async Result.Result<UserProfile, Text> {
        switch (userProfiles.get(userId)) {
            case (?profile) { #ok(profile) };
            case null { #err("Perfil não encontrado") };
        };
    };

    // Criar novo post na comunidade
    public shared(msg) func createCommunityPost(request: CreatePostRequest) : async Result.Result<CommunityPost, Text> {
        let caller = msg.caller;
        if (Principal.isAnonymous(caller)) {
            return #err("Usuário não autenticado");
        };

        // Obter username do perfil ou usar padrão
        let username = switch (userProfiles.get(caller)) {
            case (?profile) { profile.username };
            case null { 
                let principalText = Principal.toText(caller);
                let chars = Text.toIter(principalText);
                var shortId = "";
                var count = 0;
                for (c in chars) {
                    if (count < 8) {
                        shortId #= Text.fromChar(c);
                        count += 1;
                    };
                };
                "Usuário#" # shortId
            };
        };

        let post: CommunityPost = {
            id = nextCommunityPostId;
            userId = caller;
            username = username;
            postType = request.postType;
            title = request.title;
            content = request.content;
            tags = request.tags;
            likes = 0;
            likedBy = [];
            createdAt = Time.now();
            eventDate = request.eventDate;
            eventTime = request.eventTime;
            location = request.location;
        };

        communityPosts.put(nextCommunityPostId, post);
        nextCommunityPostId += 1;

        // Atualizar contador de posts do usuário
        switch (userProfiles.get(caller)) {
            case (?profile) {
                let updatedProfile = {
                    profile with postsCount = profile.postsCount + 1
                };
                userProfiles.put(caller, updatedProfile);
            };
            case null {};
        };

        #ok(post)
    };

    // Obter todos os posts da comunidade
    public query func getCommunityPosts(limit: ?Nat, offset: ?Nat) : async [CommunityPost] {
        let maxLimit = switch(limit) {
            case (?l) { if (l > 100) 100 else l };
            case null { 50 };
        };
        
        let startOffset = switch(offset) {
            case (?o) { o };
            case null { 0 };
        };

        let buffer = Buffer.Buffer<CommunityPost>(0);
        
        for ((_, post) in communityPosts.entries()) {
            buffer.add(post);
        };
        
        // Ordenar por data (mais recentes primeiro)
        let posts = Buffer.toArray(buffer);
        let sorted = Array.sort(posts, func(a: CommunityPost, b: CommunityPost) : { #less; #equal; #greater } {
            if (a.createdAt > b.createdAt) #less
            else if (a.createdAt < b.createdAt) #greater
            else #equal
        });
        
        // Aplicar paginação
        let totalPosts = sorted.size();
        if (startOffset >= totalPosts) {
            []
        } else {
            let endIndex = Nat.min(startOffset + maxLimit, totalPosts);
            Array.tabulate<CommunityPost>(endIndex - startOffset, func(i) = sorted[startOffset + i])
        };
    };

    // Obter posts por tipo
    public query func getPostsByType(postType: PostType, limit: ?Nat) : async [CommunityPost] {
        let maxLimit = switch(limit) {
            case (?l) { if (l > 100) 100 else l };
            case null { 20 };
        };

        let buffer = Buffer.Buffer<CommunityPost>(0);
        
        for ((_, post) in communityPosts.entries()) {
            switch (postType, post.postType) {
                case (#Post, #Post) { buffer.add(post); };
                case (#Tip, #Tip) { buffer.add(post); };
                case (#Meetup, #Meetup) { buffer.add(post); };
                case (#Event, #Event) { buffer.add(post); };
                case (_, _) {};
            };
        };
        
        // Ordenar por data
        let posts = Buffer.toArray(buffer);
        let sorted = Array.sort(posts, func(a: CommunityPost, b: CommunityPost) : { #less; #equal; #greater } {
            if (a.createdAt > b.createdAt) #less
            else if (a.createdAt < b.createdAt) #greater
            else #equal
        });
        
        // Aplicar limite
        if (sorted.size() <= maxLimit) {
            sorted
        } else {
            Array.tabulate<CommunityPost>(maxLimit, func(i) = sorted[i])
        };
    };

    // Curtir/descurtir post
    public shared(msg) func togglePostLike(postId: Nat) : async Result.Result<CommunityPost, Text> {
        let caller = msg.caller;
        if (Principal.isAnonymous(caller)) {
            return #err("Usuário não autenticado");
        };

        switch (communityPosts.get(postId)) {
            case (?post) {
                // Verificar se usuário já curtiu
                let alreadyLiked = Array.find(post.likedBy, func(p: Principal) : Bool { Principal.equal(p, caller) });
                
                let (newLikes, newLikedBy) = switch (alreadyLiked) {
                    case (?_) {
                        // Remover curtida
                        let filtered = Array.filter(post.likedBy, func(p: Principal) : Bool { not Principal.equal(p, caller) });
                        let newLikesCount = if (post.likes > 0) post.likes - 1 else 0;
                        (newLikesCount, filtered)
                    };
                    case null {
                        // Adicionar curtida
                        let updated = Array.append(post.likedBy, [caller]);
                        (post.likes + 1, updated)
                    };
                };

                let updatedPost = {
                    post with 
                    likes = newLikes;
                    likedBy = newLikedBy;
                };

                communityPosts.put(postId, updatedPost);
                #ok(updatedPost)
            };
            case null { #err("Post não encontrado") };
        };
    };

    // Adicionar comentário a um post
    public shared(msg) func addComment(postId: Nat, content: Text) : async Result.Result<PostComment, Text> {
        let caller = msg.caller;
        if (Principal.isAnonymous(caller)) {
            return #err("Usuário não autenticado");
        };

        // Verificar se post existe
        switch (communityPosts.get(postId)) {
            case (?_) {
                // Obter username
                let username = switch (userProfiles.get(caller)) {
                    case (?profile) { profile.username };
                    case null { 
                        let principalText = Principal.toText(caller);
                        let chars = Text.toIter(principalText);
                        var shortId = "";
                        var count = 0;
                        for (c in chars) {
                            if (count < 8) {
                                shortId #= Text.fromChar(c);
                                count += 1;
                            };
                        };
                        "Usuário#" # shortId
                    };
                };

                let comment: PostComment = {
                    id = nextCommentId;
                    postId = postId;
                    userId = caller;
                    username = username;
                    content = content;
                    createdAt = Time.now();
                };

                postComments.put(nextCommentId, comment);
                nextCommentId += 1;

                #ok(comment)
            };
            case null { #err("Post não encontrado") };
        };
    };

    // Obter comentários de um post
    public query func getPostComments(postId: Nat, limit: ?Nat) : async [PostComment] {
        let maxLimit = switch(limit) {
            case (?l) { if (l > 50) 50 else l };
            case null { 20 };
        };

        let buffer = Buffer.Buffer<PostComment>(0);
        
        for ((_, comment) in postComments.entries()) {
            if (comment.postId == postId) {
                buffer.add(comment);
            };
        };
        
        // Ordenar por data (mais antigos primeiro)
        let comments = Buffer.toArray(buffer);
        let sorted = Array.sort(comments, func(a: PostComment, b: PostComment) : { #less; #equal; #greater } {
            if (a.createdAt < b.createdAt) #less
            else if (a.createdAt > b.createdAt) #greater
            else #equal
        });
        
        // Aplicar limite
        if (sorted.size() <= maxLimit) {
            sorted
        } else {
            Array.tabulate<PostComment>(maxLimit, func(i) = sorted[i])
        };
    };

    // Buscar posts por tags
    public query func searchPostsByTag(tag: Text, limit: ?Nat) : async [CommunityPost] {
        let maxLimit = switch(limit) {
            case (?l) { if (l > 50) 50 else l };
            case null { 20 };
        };

        let searchTag = Text.toLowercase(tag);
        let buffer = Buffer.Buffer<CommunityPost>(0);
        
        for ((_, post) in communityPosts.entries()) {
            let hasTag = Array.find(post.tags, func(t: Text) : Bool { 
                Text.toLowercase(t) == searchTag 
            });
            switch (hasTag) {
                case (?_) { buffer.add(post); };
                case null {};
            };
        };
        
        // Ordenar por data
        let posts = Buffer.toArray(buffer);
        let sorted = Array.sort(posts, func(a: CommunityPost, b: CommunityPost) : { #less; #equal; #greater } {
            if (a.createdAt > b.createdAt) #less
            else if (a.createdAt < b.createdAt) #greater
            else #equal
        });
        
        // Aplicar limite
        if (sorted.size() <= maxLimit) {
            sorted
        } else {
            Array.tabulate<CommunityPost>(maxLimit, func(i) = sorted[i])
        };
    };

    // Obter eventos futuros
    public query func getUpcomingEvents(limit: ?Nat) : async [CommunityPost] {
        let maxLimit = switch(limit) {
            case (?l) { if (l > 50) 50 else l };
            case null { 10 };
        };

        let buffer = Buffer.Buffer<CommunityPost>(0);
        
        for ((_, post) in communityPosts.entries()) {
            switch (post.postType) {
                case (#Event) { buffer.add(post); };
                case (_) {};
            };
        };
        
        // Ordenar por data do evento (se disponível) ou data de criação
        let events = Buffer.toArray(buffer);
        let sorted = Array.sort(events, func(a: CommunityPost, b: CommunityPost) : { #less; #equal; #greater } {
            switch (a.eventDate, b.eventDate) {
                case (?dateA, ?dateB) {
                    if (dateA < dateB) #less
                    else if (dateA > dateB) #greater
                    else #equal
                };
                case (?_, null) { #less };
                case (null, ?_) { #greater };
                case (null, null) {
                    if (a.createdAt > b.createdAt) #less
                    else if (a.createdAt < b.createdAt) #greater
                    else #equal
                };
            };
        });
        
        // Aplicar limite
        if (sorted.size() <= maxLimit) {
            sorted
        } else {
            Array.tabulate<CommunityPost>(maxLimit, func(i) = sorted[i])
        };
    };

    // Obter posts de um usuário específico
    public query func getUserPosts(userId: Principal, limit: ?Nat) : async [CommunityPost] {
        let maxLimit = switch(limit) {
            case (?l) { if (l > 50) 50 else l };
            case null { 20 };
        };

        let buffer = Buffer.Buffer<CommunityPost>(0);
        
        for ((_, post) in communityPosts.entries()) {
            if (Principal.equal(post.userId, userId)) {
                buffer.add(post);
            };
        };
        
        // Ordenar por data
        let posts = Buffer.toArray(buffer);
        let sorted = Array.sort(posts, func(a: CommunityPost, b: CommunityPost) : { #less; #equal; #greater } {
            if (a.createdAt > b.createdAt) #less
            else if (a.createdAt < b.createdAt) #greater
            else #equal
        });
        
        // Aplicar limite
        if (sorted.size() <= maxLimit) {
            sorted
        } else {
            Array.tabulate<CommunityPost>(maxLimit, func(i) = sorted[i])
        };
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
        // ✅ NOVO: Preservar assets durante upgrade
        assetsEntries := Iter.toArray(assets.entries());
        // ✅ NOVO: Preservar relacionamentos durante upgrade
        relationshipsEntries := Iter.toArray(relationships.entries());
        // ✅ NOVO: Preservar mensagens de chat durante upgrade
        chatMessagesEntries := Iter.toArray(chatMessages.entries());
        // ✅ NOVO: Preservar dados da comunidade durante upgrade
        communityPostsEntries := Iter.toArray(communityPosts.entries());
        postCommentsEntries := Iter.toArray(postComments.entries());
        userProfilesEntries := Iter.toArray(userProfiles.entries());
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

        // ✅ NOVO: Restaurar assets após upgrade
        assets := HashMap.fromIter<Text, AssetInfo>(assetsEntries.vals(), assetsEntries.size(), Text.equal, Text.hash);
        assetsEntries := [];

        // ✅ NOVO: Restaurar relacionamentos após upgrade
        relationships := HashMap.fromIter<Nat, PetRelationship>(relationshipsEntries.vals(), relationshipsEntries.size(), Nat.equal, func(n: Nat): Nat32 { Nat32.fromNat(n % (2**32 - 1)) });
        relationshipsEntries := [];

        // ✅ NOVO: Restaurar mensagens de chat após upgrade
        chatMessages := HashMap.fromIter<Nat, ChatMessage>(chatMessagesEntries.vals(), chatMessagesEntries.size(), Nat.equal, func(n: Nat): Nat32 { Nat32.fromNat(n % (2**32 - 1)) });
        chatMessagesEntries := [];

        // ✅ NOVO: Restaurar dados da comunidade após upgrade
        communityPosts := HashMap.fromIter<Nat, CommunityPost>(communityPostsEntries.vals(), communityPostsEntries.size(), Nat.equal, func(n: Nat): Nat32 { Nat32.fromNat(n % (2**32 - 1)) });
        communityPostsEntries := [];

        postComments := HashMap.fromIter<Nat, PostComment>(postCommentsEntries.vals(), postCommentsEntries.size(), Nat.equal, func(n: Nat): Nat32 { Nat32.fromNat(n % (2**32 - 1)) });
        postCommentsEntries := [];

        userProfiles := HashMap.fromIter<Principal, UserProfile>(userProfilesEntries.vals(), userProfilesEntries.size(), Principal.equal, Principal.hash);
        userProfilesEntries := [];
    };
}