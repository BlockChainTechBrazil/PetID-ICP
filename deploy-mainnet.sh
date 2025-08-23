#!/bin/bash

# 🚀 Script de Deploy para Mainnet ICP - PetID
# Execute: chmod +x deploy-mainnet.sh && ./deploy-mainnet.sh

set -e  # Exit on any error

echo "🚀 PetID - Deploy Mainnet ICP Script"
echo "===================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}📋 Verificando pré-requisitos...${NC}"

# Check dfx
if ! command -v dfx &> /dev/null; then
    echo -e "${RED}❌ DFX não encontrado. Instale: sh -ci \"$(curl -fsSL https://internetcomputer.org/install.sh)\"${NC}"
    exit 1
fi

# Check node
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado. Instale Node.js 18+${NC}"
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm não encontrado.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Pré-requisitos OK${NC}"

# Check identity
echo -e "${BLUE}🔐 Verificando identidade...${NC}"
CURRENT_IDENTITY=$(dfx identity whoami)

if [ "$CURRENT_IDENTITY" = "default" ] || [ "$CURRENT_IDENTITY" = "anonymous" ]; then
    echo -e "${YELLOW}⚠️  Você está usando a identidade '$CURRENT_IDENTITY'${NC}"
    echo -e "${YELLOW}💡 Para produção, crie uma identidade segura:${NC}"
    echo -e "${YELLOW}   dfx identity new mainnet --storage-mode=password-protected${NC}"
    echo -e "${YELLOW}   dfx identity use mainnet${NC}"
    
    read -p "Continuar com a identidade atual? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Deploy cancelado${NC}"
        exit 1
    fi
fi

PRINCIPAL=$(dfx identity get-principal)
echo -e "${GREEN}✅ Identidade: $CURRENT_IDENTITY${NC}"
echo -e "${GREEN}✅ Principal: $PRINCIPAL${NC}"

# Build frontend
echo -e "${BLUE}🔨 Building frontend...${NC}"
cd src/PetID_frontend

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json não encontrado em src/PetID_frontend${NC}"
    exit 1
fi

npm install
npm run build

cd ../..

# Check if dist exists
if [ ! -d "src/PetID_frontend/dist" ]; then
    echo -e "${RED}❌ Build do frontend falhou - diretório dist não encontrado${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Frontend build completo${NC}"

# Warn about costs
echo -e "${YELLOW}💰 AVISO SOBRE CUSTOS:${NC}"
echo -e "${YELLOW}   - Deploy inicial: ~2-4 ICP em cycles${NC}"
echo -e "${YELLOW}   - Certifique-se de ter ICP suficiente na sua carteira${NC}"
echo

read -p "Continuar com o deploy na MAINNET? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Deploy cancelado${NC}"
    exit 1
fi

# Deploy backend
echo -e "${BLUE}🚀 Fazendo deploy do backend na mainnet...${NC}"
dfx deploy PetID_backend --network ic

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Falha no deploy do backend${NC}"
    echo -e "${YELLOW}💡 Possíveis soluções:${NC}"
    echo -e "${YELLOW}   1. Verifique se você tem cycles suficientes${NC}"
    echo -e "${YELLOW}   2. Execute: dfx ledger --network ic create-canister \$(dfx identity get-principal) --amount 4${NC}"
    echo -e "${YELLOW}   3. Verifique sua conexão com a internet${NC}"
    exit 1
fi

# Deploy frontend
echo -e "${BLUE}🚀 Fazendo deploy do frontend na mainnet...${NC}"
dfx deploy PetID_frontend --network ic

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Falha no deploy do frontend${NC}"
    exit 1
fi

# Get canister info
echo -e "${BLUE}📋 Informações dos canisters:${NC}"

BACKEND_ID=$(dfx canister --network ic id PetID_backend)
FRONTEND_ID=$(dfx canister --network ic id PetID_frontend)

echo -e "${GREEN}✅ Deploy completo!${NC}"
echo
echo -e "${BLUE}📋 INFORMAÇÕES IMPORTANTES:${NC}"
echo -e "${GREEN}Backend Canister ID: ${BACKEND_ID}${NC}"
echo -e "${GREEN}Frontend Canister ID: ${FRONTEND_ID}${NC}"
echo
echo -e "${BLUE}🌐 URLs de Acesso:${NC}"
echo -e "${GREEN}Frontend: https://${FRONTEND_ID}.icp0.io${NC}"
echo -e "${GREEN}Backend (Candid): https://${BACKEND_ID}.icp0.io${NC}"
echo
echo -e "${BLUE}🔧 Comandos úteis:${NC}"
echo -e "Status: dfx canister --network ic status PetID_backend"
echo -e "Logs:   dfx canister --network ic logs PetID_backend"
echo -e "Update: dfx deploy --network ic"
echo
echo -e "${GREEN}🎉 PetID foi deployado com sucesso na mainnet ICP!${NC}"

# Save canister IDs
echo "# PetID Mainnet Canister IDs" > CANISTER_IDS_MAINNET.txt
echo "Backend: $BACKEND_ID" >> CANISTER_IDS_MAINNET.txt
echo "Frontend: $FRONTEND_ID" >> CANISTER_IDS_MAINNET.txt
echo "Deployed: $(date)" >> CANISTER_IDS_MAINNET.txt

echo -e "${BLUE}💾 IDs salvos em: CANISTER_IDS_MAINNET.txt${NC}"
