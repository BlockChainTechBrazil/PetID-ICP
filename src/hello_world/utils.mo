// utils.mo - Utilitários e funções auxiliares
import Debug "mo:base/Debug";
import Time "mo:base/Time";
import Text "mo:base/Text";
import Nat "mo:base/Nat";

import Types "types";

module {
    public type Pet = Types.Pet;
    public type Result<T, E> = Types.Result<T, E>;
    public type Error = Types.Error;

    // Função para validar dados de um pet
    public func validatePet(pet: Pet) : Bool {
        // Nome não pode estar vazio
        if (Text.size(pet.name) == 0) {
            return false;
        };
        
        // Espécie deve ser válida
        if (not isValidSpecies(pet.species)) {
            return false;
        };
        
        // Idade não pode ser negativa (se fornecida)
        switch (pet.age) {
            case (?age) {
                if (age > 50) { // Pet muito velho, suspeito
                    return false;
                };
            };
            case null { };
        };
        
        true
    };

    // Função auxiliar para validar espécies
    private func isValidSpecies(species: Text) : Bool {
        species == "dog" or species == "cat" or species == "bird" or 
        species == "fish" or species == "rabbit" or species == "other"
    };

    // Função para gerar timestamp atual
    public func getCurrentTime() : Int {
        Time.now()
    };

    // Função para formatar mensagens de sucesso
    public func formatSuccessMessage(action: Text, petName: Text) : Text {
        "✅ " # action # " realizada com sucesso para " # petName # "!"
    };

    // Função para formatar erros
    public func formatError(error: Error) : Text {
        switch (error) {
            case (#NotFound) { "❌ Pet não encontrado" };
            case (#AlreadyExists) { "❌ Pet já existe" };
            case (#Unauthorized) { "❌ Não autorizado" };
            case (#InvalidInput(msg)) { "❌ Entrada inválida: " # msg };
        }
    };

    // Função para debug
    public func logAction(action: Text, details: Text) {
        Debug.print("🔍 [PetID] " # action # ": " # details);
    };
}
