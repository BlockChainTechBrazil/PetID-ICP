#!/bin/bash
set -e  # Exit on error

echo "===== Resolvendo problemas de integração do PetID-ICP ====="

# Parar qualquer réplica local que possa estar em execução
echo "Parando réplica local..."
dfx stop || true

# Limpar caches e arquivos temporários
echo "Limpando caches e arquivos temporários..."
rm -rf .dfx/local || true
rm -rf .dfx/http_buffer || true

# Iniciar uma nova réplica limpa
echo "Iniciando réplica local..."
dfx start --clean --background

# Aguardar um momento para garantir que a réplica esteja pronta
sleep 5

# Verificar quais canisters estão disponíveis para implantar
echo "Verificando canisters configurados:"
jq -r '.canisters | keys | .[]' dfx.json || echo "jq não disponível, pulando verificação"

# Verificar a versão do dfx para usar o comando correto
DFX_VERSION=$(dfx --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' || echo "desconhecida")
echo "Versão do DFX: $DFX_VERSION"

# Definir o ID do Internet Identity oficial (não precisamos implantar localmente)
II_CANISTER_ID="rdmx6-jaaaa-aaaaa-aaadq-cai"
echo "Usando Internet Identity oficial com ID: $II_CANISTER_ID"

# Implantar canister de backend
echo "Implantando canister de backend..."
dfx deploy petid_backend --no-wallet

# Obter o canister ID do backend
BACKEND_CANISTER_ID=$(dfx canister id petid_backend)
echo "ID do Backend: $BACKEND_CANISTER_ID"

# Implantar canister de frontend
echo "Implantando canister de frontend..."
dfx deploy petid_frontend --no-wallet

# Obter o canister ID do frontend
FRONTEND_CANISTER_ID=$(dfx canister id petid_frontend)
echo "ID do Frontend: $FRONTEND_CANISTER_ID"

# Atualizar o arquivo .env com os IDs corretos dos canisters
echo "Atualizando arquivo .env..."
cat > .env << EOL
# Web3 Storage (mantém para IPFS)
REACT_APP_WEB3STORAGE_TOKEN=SEU_TOKEN_AQUI

# ICP Configuration
DFX_NETWORK=local
CANISTER_ID_PETID_BACKEND=$BACKEND_CANISTER_ID
CANISTER_ID_PETID_FRONTEND=$FRONTEND_CANISTER_ID
CANISTER_ID_INTERNET_IDENTITY=$II_CANISTER_ID

# Vite Environment Variables
VITE_CANISTER_ID_PETID_BACKEND=$BACKEND_CANISTER_ID
VITE_CANISTER_ID_PETID_FRONTEND=$FRONTEND_CANISTER_ID
VITE_CANISTER_ID_INTERNET_IDENTITY=$II_CANISTER_ID
VITE_DFX_NETWORK=local
VITE_HOST=localhost:4943

# Local replica settings
HOST=http://localhost:4943

# Production settings (uncomment when deploying to mainnet)
# DFX_NETWORK=ic
# HOST=https://ic0.app
# CANISTER_ID_INTERNET_IDENTITY=rdmx6-jaaaa-aaaaa-aaadq-cai
EOL

# Criar um arquivo .env.local com as mesmas configurações
echo "Criando arquivo .env.local..."
cp .env .env.local

# Modificar o arquivo de agent de autenticação para garantir que ele funcione corretamente
echo "Modificando o arquivo de índice para desabilitar verificação de certificado..."
DECLARATIONS_DIR="src/declarations/petid_backend"
INDEX_FILE="$DECLARATIONS_DIR/index.js"

# Fazer backup do arquivo original
cp $INDEX_FILE ${INDEX_FILE}.bak

# Modificar o arquivo index.js para desabilitar verificação de certificado
cat > $INDEX_FILE << EOL
import { Actor, HttpAgent } from "@dfinity/agent";

// Importe o arquivo did.js gerado
import { idlFactory } from './petid_backend.did.js';

/**
 * Cria um ator para interagir com o canister do PetID
 * @param {string} canisterId - ID do canister
 * @param {{agent: HttpAgent}} options - Opções para criar o ator
 * @returns {Actor} Um ator para o canister PetID
 */
export const createActor = (canisterId, options = {}) => {
  const agent = options.agent || new HttpAgent({ ...options.agentOptions });
  
  // Desabilitar verificações de certificado para desenvolvimento local
  if (process.env.NODE_ENV !== "production" || options.agentOptions?.host?.includes("localhost")) {
    console.log("Desenvolvimento local - desabilitando verificações de segurança no createActor");
    try {
      agent.fetchRootKey = async () => {
        console.log("Usando chave raiz fictícia (createActor)");
        return new Uint8Array(32).fill(1).buffer;
      };
    } catch (error) {
      console.warn("Não foi possível definir fetchRootKey", error);
    }
  }

  // Cria um ator com o IDL factory e o agente HTTP
  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
    ...options.actorOptions,
  });
};
EOL

# Garantir que todos os módulos necessários estejam instalados
echo "Verificando dependências do projeto..."
npm install --no-audit --no-fund || true

echo "===== Configuração completa! ====="
echo "Frontend URL: http://localhost:4943/?canisterId=$FRONTEND_CANISTER_ID"
echo "Internet Identity URL: https://identity.ic0.app/"
echo "Backend Canister ID: $BACKEND_CANISTER_ID"

echo "===== Instruções para testar: ====="
echo "1. Execute 'npm run dev' para iniciar o servidor de desenvolvimento"
echo "2. Abra o navegador em http://localhost:5173/"
echo "3. Clique em 'Conectar-se'"
echo "4. Após autenticação, use o formulário para registrar um pet"

echo "Deseja iniciar o servidor de desenvolvimento agora? (s/n)"
read answer
if [[ "$answer" == "s" || "$answer" == "S" ]]; then
  npm run dev
else
  echo "Você pode iniciar o servidor manualmente com 'npm run dev'"
fi
