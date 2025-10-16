#!/usr/bin/env bash

# Script para atualizar automaticamente o .env com os IDs dos canisters
set -euo pipefail

echo "🔄 Atualizando .env com os IDs dos canisters..."

# Verificar se o arquivo canister_ids.json existe
if [ ! -f ".dfx/local/canister_ids.json" ]; then
    echo "❌ Arquivo .dfx/local/canister_ids.json não encontrado"
    exit 1
fi

# Extrair os IDs dos canisters
BACKEND_ID=$(grep -A1 '"PetID_backend"' .dfx/local/canister_ids.json | grep '"local"' | cut -d '"' -f4)
FRONTEND_ID=$(grep -A1 '"PetID_frontend"' .dfx/local/canister_ids.json | grep '"local"' | cut -d '"' -f4)
II_ID="rdmx6-jaaaa-aaaaa-aaadq-cai"  # Internet Identity local

if [ -z "${BACKEND_ID}" ] || [ -z "${FRONTEND_ID}" ]; then
    echo "❌ Não foi possível extrair os IDs dos canisters. Verifique se os canisters foram implantados."
    exit 1
fi

cat > .env << EOF
NODE_ENV=development
DFX_NETWORK=local
CANISTER_ID_PETID_BACKEND=$BACKEND_ID
CANISTER_ID_PETID_FRONTEND=$FRONTEND_ID
CANISTER_ID_INTERNET_IDENTITY=$II_ID
EOF

echo "📋 IDs encontrados:" && cat .env

echo "✅ Arquivo .env atualizado com sucesso!"
