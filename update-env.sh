#!/bin/bash

# Script para atualizar automaticamente o .env com os IDs dos canisters

echo "🔄 Atualizando .env com os IDs dos canisters..."

# Verificar se o arquivo canister_ids.json existe
if [ ! -f ".dfx/local/canister_ids.json" ]; then
    echo "❌ Arquivo .dfx/local/canister_ids.json não encontrado"
    exit 1
fi

# Extrair os IDs dos canisters
BACKEND_ID=$(cat .dfx/local/canister_ids.json | grep -A 1 "PetID_backend" | grep "local" | cut -d'"' -f4)
FRONTEND_ID=$(cat .dfx/local/canister_ids.json | grep -A 1 "PetID_frontend" | grep "local" | cut -d'"' -f4)
II_ID="rdmx6-jaaaa-aaaaa-aaadq-cai"  # Internet Identity é sempre fixo

echo "📋 IDs encontrados:"
echo "   Backend: $BACKEND_ID"
echo "   Frontend: $FRONTEND_ID"
echo "   Internet Identity: $II_ID"

# Atualizar o arquivo .env
cat > .env << EOF
NODE_ENV=development
DFX_NETWORK=local
CANISTER_ID_PETID_BACKEND=$BACKEND_ID
CANISTER_ID_PETID_FRONTEND=$FRONTEND_ID
CANISTER_ID_INTERNET_IDENTITY=$II_ID
REACT_APP_PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIyZWI3YWIyYS1kMTAyLTRjY2UtODU5My0xOTVhOWEyY2Y3NjkiLCJlbWFpbCI6ImRhdmkub2xpdmVpcmEyMDAzQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJjMDQwNDNmYjY3YjQ5YzBlMThhOCIsInNjb3BlZEtleVNlY3JldCI6IjIxNDU5YzA0MjRiMjNkZGM1OWU2ZTNlY2ZhZGI2MzBhMWY4YWFjZmUzYjJiNmE1MWQ0YjY1OTBlMjNiOGU5YmMiLCJleHAiOjE3ODY5MTQ0MTB9.yB03yVdT0nXryx4hsVr5qyvqz6_kfu6llKNgiapSnRg
EOF

echo "✅ Arquivo .env atualizado com sucesso!"
echo "🚀 Agora você pode usar: npm run dev"
