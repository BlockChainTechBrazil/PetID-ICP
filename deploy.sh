#!/bin/bash

echo "🚀 Script de Deploy para IC Testnet"
echo "=================================="

# Verificar se dfx está instalado
if ! command -v dfx &> /dev/null; then
    echo "❌ DFX não encontrado. Instalando..."
    sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
    echo "✅ DFX instalado com sucesso!"
fi

# Verificar versão do dfx
echo "📦 Versão do DFX:"
dfx --version

# Criar identity se não existir
echo "🔑 Configurando identity..."
if ! dfx identity list | grep -q "myidentity"; then
    dfx identity new myidentity
fi
dfx identity use myidentity

# Mostrar principal ID
echo "🆔 Seu Principal ID:"
dfx identity get-principal

echo ""
echo "💰 IMPORTANTE: Antes de fazer o deploy na IC mainnet/testnet,"
echo "   você precisa obter cycles gratuitos em:"
echo "   👉 https://faucet.dfinity.org/"
echo ""

read -p "Pressione Enter após obter os cycles para continuar..."

# Deploy na IC
echo "🌐 Fazendo deploy na Internet Computer..."
dfx deploy --network ic

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deploy realizado com sucesso!"
    echo ""
    echo "📋 Informações do seu canister:"
    dfx canister id hello_world --network ic
    
    echo ""
    echo "🔗 URLs úteis:"
    CANISTER_ID=$(dfx canister id hello_world --network ic)
    echo "   Candid Interface: https://${CANISTER_ID}.ic0.app/_/candid"
    echo "   IC Dashboard: https://dashboard.internetcomputer.org/canister/${CANISTER_ID}"
    
    echo ""
    echo "🧪 Teste as funções:"
    echo "   dfx canister call hello_world hello --network ic"
    echo "   dfx canister call hello_world greet '(\"Mundo\")' --network ic"
    echo "   dfx canister call hello_world increment --network ic"
    echo "   dfx canister call hello_world getCounter --network ic"
    
    echo ""
    echo "💡 Dicas:"
    echo "   • Salve o Canister ID: $CANISTER_ID"
    echo "   • Use a Candid Interface para testar visualmente"
    echo "   • Monitore seu canister no IC Dashboard"
else
    echo "❌ Erro no deploy. Verifique se você tem cycles suficientes."
    echo ""
    echo "🔧 Possíveis soluções:"
    echo "   1. Obtenha cycles gratuitos em: https://faucet.dfinity.org/"
    echo "   2. Verifique sua conexão com a internet"
    echo "   3. Verifique se sua identity tem permissões"
fi
