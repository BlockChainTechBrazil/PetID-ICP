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

    // Storage
    private stable var nextTokenId: Nat = 1;
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
    // Upgrade Functions
    // ==========================================

    system func preupgrade() {
        tokensEntries := Iter.toArray(tokens.entries());
        ownersEntries := Iter.toArray(owners.entries());
        balancesEntries := Iter.toArray(balances.entries());
        operatorsEntries := Iter.toArray(operators.entries());
        petsEntries := Iter.toArray(pets.entries());
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

        pets := HashMap.fromIter<Pet>(petsEntries.vals(), petsEntries.size(), Nat.equal, func(n: Nat): Nat32 { Nat32.fromNat(n % (2**32 - 1)) });
        petsEntries := [];
    };
}