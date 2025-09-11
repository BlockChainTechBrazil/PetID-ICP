# 🚀 Deploy PetID na Mainnet ICP

## Pré-requisitos
- ✅ DFX instalado (versão 0.29.0 ou superior)
- ✅ Node.js e npm
- ✅ ICP tokens na sua carteira (mínimo 4 ICP para cycles)
- ✅ Identidade segura criada

## Passos para Deploy

### 1. **Configurar Identidade Segura**
```bash
# Usar a identidade segura criada
dfx identity use mainnet

# Verificar sua principal ID
dfx identity get-principal
```

### 2. **Adquirir Cycles** 
⚠️ **IMPORTANTE**: Você precisa de ICP tokens para comprar cycles

```bash
# Opção A: Criar wallet com cycles
dfx ledger --network ic create-canister $(dfx identity get-principal) --amount 4

# Opção B: Usar um provedor de cycles (recomendado para produção)
# https://cyclesfaucet.org/ ou outros provedores
```

### 3. **Build do Frontend**
```bash
# Navegar para o diretório frontend
cd src/PetID_frontend

# Instalar dependências
npm install

# Build de produção
npm run build

# Voltar para raiz do projeto
cd ../..
```

### 4. **Deploy na Mainnet**
```bash
# Deploy do backend
dfx deploy PetID_backend --network ic

# Deploy do frontend
dfx deploy PetID_frontend --network ic
```

### 5. **Verificar Deploy**
```bash
# Ver status dos canisters
dfx canister --network ic status PetID_backend
dfx canister --network ic status PetID_frontend

# Ver URLs
dfx canister --network ic info PetID_frontend
```

## URLs de Acesso

Após o deploy, você receberá URLs como:
- **Frontend**: `https://{canister-id}.icp0.io`
- **Backend (Candid UI)**: `https://{canister-id}.icp0.io/_/candid`

## Gestão de Cycles

```bash
# Verificar cycles restantes
dfx canister --network ic status PetID_backend
dfx canister --network ic status PetID_frontend

# Adicionar mais cycles se necessário
dfx canister --network ic deposit-cycles 1000000000000 PetID_backend
```

## Atualizações Futuras

```bash
# Para atualizações do código:
dfx deploy PetID_backend --network ic
dfx deploy PetID_frontend --network ic
```

## Configurações Importantes

### Internet Identity na Mainnet
O Internet Identity já está configurado para usar o canister oficial:
`rdmx6-jaaaa-aaaaa-aaadq-cai`

### Domínio Personalizado (Opcional)
Para usar um domínio personalizado, configure:
1. Registre seu domínio
2. Configure CNAME para `icp0.io`
3. Configure no canister usando `ic-domains`

## Monitoramento

### Dashboard IC
- Acesse: https://dashboard.internetcomputer.org/
- Busque pelos seus canister IDs
- Monitore performance e cycles

### Logs
```bash
# Ver logs do backend
dfx canister --network ic logs PetID_backend
```

## Custos Estimados

- **Deploy inicial**: ~2-4 TC (Trillion Cycles) ≈ 2-4 ICP
- **Operação mensal**: Varia conforme uso
- **Armazenamento**: ~0.0001 ICP por MB/mês
- **Compute**: ~0.0000004 ICP por instrução


## Troubleshooting

### Erro: Insufficient Cycles
```bash
# Adicionar mais cycles
dfx canister --network ic deposit-cycles 2000000000000 CANISTER_NAME
```

### Erro: Authentication
```bash
# Verificar identidade
dfx identity whoami
dfx identity get-principal
```

### Erro: Network
```bash
# Verificar conectividade
dfx ping ic
```

## Security Checklist ✅

- [ ] Identidade segura com senha forte
- [ ] Seed phrase armazenada com segurança
- [ ] Testes realizados na replica local
- [ ] Validação de functions públicas
- [ ] Cycles suficientes para operação
- [ ] Backup dos canister IDs

## Próximos Passos Após Deploy

1. **Testar todas as funcionalidades**
2. **Configurar monitoramento de cycles**
3. **Documentar canister IDs**
4. **Configurar domínio personalizado (se necessário)**
5. **Configurar backups regulares**
6. **Implementar CI/CD para atualizações**
