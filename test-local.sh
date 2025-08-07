#!/bin/bash

echo "🧪 Script de Teste Local - PetID ICP"
echo "===================================="

# Verificar se dfx está instalado
if ! command -v dfx &> /dev/null; then
    echo "❌ DFX não encontrado. Instale primeiro!"
    exit 1
fi

echo "✅ DFX encontrado: $(dfx --version)"

# Parar qualquer replica que esteja rodando
echo "🛑 Parando replica existente..."
dfx stop > /dev/null 2>&1

# Iniciar replica local
echo "🚀 Iniciando replica local..."
dfx start --background --clean

# Aguardar a replica inicializar
echo "⏳ Aguardando replica inicializar..."
sleep 5

# Deploy local
echo "📦 Fazendo deploy local..."
dfx deploy

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deploy local realizado com sucesso!"
    echo ""
    
    # Obter Canister ID
    CANISTER_ID=$(dfx canister id hello_world)
    echo "📋 Canister ID: $CANISTER_ID"
    
    echo ""
    echo "🧪 Testando todas as funções:"
    echo "==============================="
    
    # Teste 1: hello()
    echo "1️⃣ Testando hello():"
    dfx canister call hello_world hello
    echo ""
    
    # Teste 2: greet()
    echo "2️⃣ Testando greet('Davi'):"
    dfx canister call hello_world greet '("Davi")'
    echo ""
    
    # Teste 3: getName()
    echo "3️⃣ Testando getName():"
    dfx canister call hello_world getName
    echo ""
    
    # Teste 4: getCounter() inicial
    echo "4️⃣ Testando getCounter() (inicial):"
    dfx canister call hello_world getCounter
    echo ""
    
    # Teste 5: increment()
    echo "5️⃣ Testando increment() (3x):"
    dfx canister call hello_world increment
    dfx canister call hello_world increment
    dfx canister call hello_world increment
    echo ""
    
    # Teste 6: getCounter() após incremento
    echo "6️⃣ Testando getCounter() (após increments):"
    dfx canister call hello_world getCounter
    echo ""
    
    # Teste 7: reset()
    echo "7️⃣ Testando reset():"
    dfx canister call hello_world reset
    echo ""
    
    # Teste 8: getCounter() após reset
    echo "8️⃣ Testando getCounter() (após reset):"
    dfx canister call hello_world getCounter
    echo ""
    
    echo "✅ Todos os testes concluídos!"
    echo ""
    echo "🌐 URLs locais:"
    echo "   Candid Interface: http://127.0.0.1:8000/?canisterId=$(dfx canister id __Candid_UI)&id=$CANISTER_ID"
    echo ""
    echo "💡 Para parar a replica: dfx stop"
    
else
    echo "❌ Erro no deploy local!"
    echo "🔧 Tente: dfx stop && dfx start --clean"
fi
