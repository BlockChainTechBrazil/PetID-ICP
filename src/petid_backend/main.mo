import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";

persistent actor PetID {

  // Tipos de dados
  public type PetId = Nat;

  public type Pet = {
    id : PetId;
    name : Text;
    species : Text;
    breed : Text;
    birthDate : Int;
    ipfsHash : Text;
    owner : Principal;
    isRegistered : Bool;
    registrationDate : Int;
  };

  public type PetRegistration = {
    name : Text;
    species : Text;
    breed : Text;
    birthDate : Int;
    ipfsHash : Text;
  };

  public type TransferResult = Result.Result<Text, Text>;
  public type RegistrationResult = Result.Result<PetId, Text>;
  public type UpdateResult = Result.Result<Text, Text>;

  // Variáveis de estado
  private var nextPetId : PetId = 1;
  private var totalPets : Nat = 0;

  // Stable arrays para preservar dados durante upgrades
  private var petsEntries : [(PetId, Pet)] = [];
  private var ownerToPetsEntries : [(Principal, [PetId])] = [];

  // HashMaps para armazenamento em tempo de execução
  private transient var pets = HashMap.HashMap<PetId, Pet>(10, Nat.equal, func(n : Nat) : Nat32 { Nat32.fromNat(n) });
  private transient var ownerToPets = HashMap.HashMap<Principal, [PetId]>(10, Principal.equal, Principal.hash);

  // Função de inicialização para restaurar dados após upgrade
  system func preupgrade() {
    petsEntries := Iter.toArray(pets.entries());
    ownerToPetsEntries := Iter.toArray(ownerToPets.entries());
  };

  system func postupgrade() {
    pets := HashMap.fromIter<PetId, Pet>(petsEntries.vals(), petsEntries.size(), Nat.equal, func(n : Nat) : Nat32 { Nat32.fromNat(n) });
    ownerToPets := HashMap.fromIter<Principal, [PetId]>(ownerToPetsEntries.vals(), ownerToPetsEntries.size(), Principal.equal, Principal.hash);
    petsEntries := [];
    ownerToPetsEntries := [];
  };

  // Função para registrar um novo pet
  public shared (msg) func registerPet(petData : PetRegistration) : async RegistrationResult {
    let owner = msg.caller;

    // Validações básicas
    if (Text.size(petData.name) == 0) {
      return #err("Nome do pet não pode estar vazio");
    };

    if (Text.size(petData.species) == 0) {
      return #err("Espécie não pode estar vazia");
    };

    let petId = nextPetId;
    let currentTime = Time.now();

    let newPet : Pet = {
      id = petId;
      name = petData.name;
      species = petData.species;
      breed = petData.breed;
      birthDate = petData.birthDate;
      ipfsHash = petData.ipfsHash;
      owner = owner;
      isRegistered = true;
      registrationDate = currentTime;
    };

    // Armazenar o pet
    pets.put(petId, newPet);

    // Atualizar lista de pets do dono
    let currentPets = switch (ownerToPets.get(owner)) {
      case null { [] };
      case (?pets_array) { pets_array };
    };
    let updatedPets = Array.append(currentPets, [petId]);
    ownerToPets.put(owner, updatedPets);

    // Atualizar contadores
    nextPetId += 1;
    totalPets += 1;

    #ok(petId);
  };

  // Função para transferir um pet
  public shared (msg) func transferPet(petId : PetId, newOwner : Principal) : async TransferResult {
    let caller = msg.caller;

    switch (pets.get(petId)) {
      case null {
        #err("Pet não encontrado");
      };
      case (?pet) {
        if (pet.owner != caller) {
          return #err("Apenas o dono pode transferir o pet");
        };

        if (newOwner == caller) {
          return #err("Não é possível transferir para si mesmo");
        };

        // Atualizar o dono do pet
        let updatedPet : Pet = {
          id = pet.id;
          name = pet.name;
          species = pet.species;
          breed = pet.breed;
          birthDate = pet.birthDate;
          ipfsHash = pet.ipfsHash;
          owner = newOwner;
          isRegistered = pet.isRegistered;
          registrationDate = pet.registrationDate;
        };

        pets.put(petId, updatedPet);

        // Remover pet da lista do dono anterior
        let currentOwnerPets = switch (ownerToPets.get(caller)) {
          case null { [] };
          case (?pets_array) { pets_array };
        };
        let filteredPets = Array.filter<PetId>(currentOwnerPets, func(id) { id != petId });
        ownerToPets.put(caller, filteredPets);

        // Adicionar pet à lista do novo dono
        let newOwnerPets = switch (ownerToPets.get(newOwner)) {
          case null { [] };
          case (?pets_array) { pets_array };
        };
        let updatedNewOwnerPets = Array.append(newOwnerPets, [petId]);
        ownerToPets.put(newOwner, updatedNewOwnerPets);

        #ok("Pet transferido com sucesso");
      };
    };
  };

  // Função para atualizar dados do pet
  public shared (msg) func updatePetData(petId : PetId, ipfsHash : Text) : async UpdateResult {
    let caller = msg.caller;

    switch (pets.get(petId)) {
      case null {
        #err("Pet não encontrado");
      };
      case (?pet) {
        if (pet.owner != caller) {
          return #err("Apenas o dono pode atualizar os dados do pet");
        };

        let updatedPet : Pet = {
          id = pet.id;
          name = pet.name;
          species = pet.species;
          breed = pet.breed;
          birthDate = pet.birthDate;
          ipfsHash = ipfsHash;
          owner = pet.owner;
          isRegistered = pet.isRegistered;
          registrationDate = pet.registrationDate;
        };

        pets.put(petId, updatedPet);
        #ok("Dados do pet atualizados com sucesso");
      };
    };
  };

  // Função para obter informações de um pet
  public query func getPet(petId : PetId) : async ?Pet {
    pets.get(petId);
  };

  // Função para obter pets de um dono
  public query func getOwnerPets(owner : Principal) : async [Pet] {
    switch (ownerToPets.get(owner)) {
      case null { [] };
      case (?petIds) {
        let petsArray = Array.mapFilter<PetId, Pet>(
          petIds,
          func(id) {
            pets.get(id);
          },
        );
        petsArray;
      };
    };
  };

  // Função para verificar se um endereço é dono de um pet
  public query func isPetOwner(petId : PetId, owner : Principal) : async Bool {
    switch (pets.get(petId)) {
      case null { false };
      case (?pet) { pet.owner == owner and pet.isRegistered };
    };
  };

  // Função para obter informações do contrato
  public query func getContractInfo() : async {
    totalPets : Nat;
    nextPetId : Nat;
  } {
    {
      totalPets = totalPets;
      nextPetId = nextPetId - 1;
    };
  };

  // Função para obter todos os pets (para fins administrativos)
  public query func getAllPets() : async [Pet] {
    Iter.toArray(pets.vals());
  };

  // Função para obter o caller principal (útil para debugging)
  public shared (msg) func getCaller() : async Principal {
    msg.caller;
  };
};
