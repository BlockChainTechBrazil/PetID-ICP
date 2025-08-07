// types.mo - Tipos e interfaces do PetID ICP
module {
    // Tipo para representar informações de um Pet
    public type Pet = {
        id: Nat;
        name: Text;
        species: Text; // "dog", "cat", etc.
        breed: ?Text;
        age: ?Nat;
        owner: Text;
        registered_at: Int; // Timestamp
    };

    // Tipo para resultado de operações
    public type Result<T, E> = {
        #ok: T;
        #err: E;
    };

    // Erros possíveis
    public type Error = {
        #NotFound;
        #AlreadyExists;
        #Unauthorized;
        #InvalidInput: Text;
    };

    // Interface principal do serviço PetID
    public type PetIDService = actor {
        // Funções básicas (suas atuais)
        hello: () -> async Text;
        greet: (name: Text) -> async Text;
        getName: () -> async Text;
        getCounter: () -> async Nat;
        increment: () -> async Nat;
        reset: () -> async Nat;

        // Futuras funções para PetID (exemplo)
        registerPet: (pet: Pet) -> async Result<Nat, Error>;
        getPet: (id: Nat) -> async Result<Pet, Error>;
        updatePet: (id: Nat, pet: Pet) -> async Result<(), Error>;
        deletePet: (id: Nat) -> async Result<(), Error>;
        listPets: () -> async [Pet];
        searchPetsByOwner: (owner: Text) -> async [Pet];
    };
}
