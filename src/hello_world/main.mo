import Debug "mo:base/Debug";

actor HelloWorld {
    public func hello() : async Text {
        "Hello, World! 🌍"
    };

    public func greet(name : Text) : async Text {
        "Hello, " # name # "! 👋"
    };

    public func getName() : async Text {
        "PetID ICP Project"
    };

    // Função para demonstrar persistência de dados
    private stable var counter : Nat = 0;

    public func getCounter() : async Nat {
        counter
    };

    public func increment() : async Nat {
        counter += 1;
        counter
    };

    public func reset() : async Nat {
        counter := 0;
        counter
    };
}
