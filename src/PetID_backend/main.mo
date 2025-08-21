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
        owner: Principal;
        createdAt: Int; // Timestamp
    };

    // Tipo para entrada de dados do formulário
    public type PetPayload = {
        photo: Text; // CID da imagem no IPFS
        nickname: Text;
        birthDate: Text;
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
    
    // Registro de pets (persistente)
    private var petsEntries : [(Nat, Pet)] = [];
    private transient var pets = HashMap.HashMap<Nat, Pet>(0, Nat.equal, func(n: Nat): Nat32 { Nat32.fromNat(n % (2**32 - 1)) });
    
    // Mapeamento de pets por proprietário (Principal do usuário)
    private var petsByOwnerEntries : [(Principal, [Nat])] = [];
    private transient var petsByOwner = HashMap.HashMap<Principal, [Nat]>(0, Principal.equal, Principal.hash);
    
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
        
        // Criar o novo pet
        let petId = nextPetId;
        nextPetId += 1;
        
        let now = Time.now();
        
        let newPet : Pet = {
            id = petId;
            photo = payload.photo;
            nickname = payload.nickname;
            birthDate = payload.birthDate;
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

    // Função system para preservar o estado
    system func preupgrade() {
        petsEntries := Iter.toArray(pets.entries());
        petsByOwnerEntries := Iter.toArray(petsByOwner.entries());
    };

    // Função system para restaurar o estado após atualização
    system func postupgrade() {
        pets := HashMap.fromIter<Nat, Pet>(Iter.fromArray(petsEntries), petsEntries.size(), Nat.equal, func(n: Nat): Nat32 { Nat32.fromNat(n % (2**32 - 1)) });
        petsByOwner := HashMap.fromIter<Principal, [Nat]>(Iter.fromArray(petsByOwnerEntries), petsByOwnerEntries.size(), Principal.equal, Principal.hash);
        petsEntries := [];
        petsByOwnerEntries := [];
    };
};
