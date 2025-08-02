#!/bin/bash
# Script para inicializar o projeto PetID no ICP

echo "🚀 Iniciando PetID-ICP..."

# Verificar se DFX está instalado
if ! command -v dfx &> /dev/null; then
    echo "❌ DFX não encontrado. Instalando..."
    sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"
    echo "✅ DFX instalado com sucesso!"
fi

# Verificar versão do DFX
echo "📋 Versão do DFX:"
dfx --version

# Parar qualquer instância anterior
echo "🛑 Parando instâncias anteriores..."
dfx stop

# Limpar estado anterior se existir
if [ -d ".dfx" ]; then
    echo "🧹 Limpando estado anterior..."
    rm -rf .dfx
fi

# Iniciar a rede local
echo "🌐 Iniciando rede local do ICP..."
dfx start --background --clean

# Aguardar a rede inicializar
echo "⏳ Aguardando rede inicializar..."
sleep 10

# Deploy dos canisters
echo "📦 Fazendo deploy dos canisters..."
dfx deploy

# Verificar status dos canisters
echo "✅ Status dos canisters:"
dfx canister status --all

# Gerar tipos TypeScript
echo "🔧 Gerando tipos TypeScript..."
dfx generate

echo "🎉 PetID-ICP inicializado com sucesso!"
echo "📱 Você pode agora executar: npm run dev"
echo "🔗 URL local: http://localhost:5173"
echo "🆔 Internet Identity local: http://localhost:4943/?canisterId=be2us-64aaa-aaaaa-qaabq-cai"
