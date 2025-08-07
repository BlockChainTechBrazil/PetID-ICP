// main.mo - Contrato principal do PetID ICP
import Debug "mo:base/Debug";
import Array "mo:base/Array";
import Iter "mo:base/Iter";

// Importando módulos locais
import Types "types";
import Utils "utils";

persistent actor HelloWorld {
    // Usando tipos da interface
    public type Pet = Types.Pet;
    public type Result<T, E> = Types.Result<T, E>;
    public type Error = Types.Error;

    // Estado persistente
    private stable var counter : Nat = 0;
    private stable var nextPetId : Nat = 1;
    
    // Array para armazenar pets (mais simples que HashMap)
    private stable var pets : [Pet] = [];

    // ========================================
    // FUNÇÕES BÁSICAS (compatibilidade)
    // ========================================
    
    public func hello() : async Text {
        Utils.logAction("hello", "Função básica chamada");
        "Hello, World! 🌍 - PetID ICP System"
    };

    public func greet(name : Text) : async Text {
        Utils.logAction("greet", "Saudação para: " # name);
        "Hello, " # name # "! 👋 Bem-vindo ao PetID ICP!"
    };

    public func getName() : async Text {
        "PetID ICP Project - Pet Identification on Internet Computer"
    };

    public func getCounter() : async Nat {
        counter
    };

    public func increment() : async Nat {
        counter += 1;
        Utils.logAction("increment", "Counter: " # debug_show(counter));
        counter
    };

    public func reset() : async Nat {
        counter := 0;
        Utils.logAction("reset", "Counter resetado");
        counter
    };

    // ========================================
    // NOVAS FUNÇÕES PARA PETID (exemplo futuro)
    // ========================================
    
    public func registerPet(pet: Pet) : async Result<Nat, Error> {
        Utils.logAction("registerPet", "Tentando registrar: " # pet.name);
        
        // Validar dados do pet
        if (not Utils.validatePet(pet)) {
            return #err(#InvalidInput("Dados do pet inválidos"));
        };
        
        // Criar novo pet com ID e timestamp
        let newPet : Pet = {
            id = nextPetId;
            name = pet.name;
            species = pet.species;
            breed = pet.breed;
            age = pet.age;
            owner = pet.owner;
            registered_at = Utils.getCurrentTime();
        };
        
        // Adicionar ao array
        pets := Array.append<Pet>(pets, [newPet]);
        let currentId = nextPetId;
        nextPetId += 1;
        
        Utils.logAction("registerPet", Utils.formatSuccessMessage("Registro", pet.name));
        #ok(currentId)
    };

    public func getPet(id: Nat) : async Result<Pet, Error> {
        Utils.logAction("getPet", "Buscando pet ID: " # debug_show(id));
        
        let found = Array.find<Pet>(pets, func(pet: Pet) : Bool { pet.id == id });
        switch (found) {
            case (?pet) { #ok(pet) };
            case null { #err(#NotFound) };
        }
    };

    public func listPets() : async [Pet] {
        Utils.logAction("listPets", "Listando todos os pets");
        pets
    };

    public func searchPetsByOwner(owner: Text) : async [Pet] {
        Utils.logAction("searchPetsByOwner", "Buscando pets do dono: " # owner);
        
        Array.filter<Pet>(pets, func(pet: Pet) : Bool {
            pet.owner == owner
        })
    };

    // Função para contar pets registrados
    public func getTotalPets() : async Nat {
        pets.size()
    };

    // Função para obter estatísticas
    public func getStats() : async {totalPets: Nat; nextId: Nat; counterValue: Nat} {
        {
            totalPets = pets.size();
            nextId = nextPetId;
            counterValue = counter;
        }
    };
}
