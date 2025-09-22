# 🚀 Deploy PetID para Mainnet ICP - GUIA COMPLETO

## ⚠️ PROBLEMAS CRÍTICOS CORRIGIDOS

✅ **JWT Secrets Removidos**: Removido `REACT_APP_PINATA_JWT` do bundle frontend  
✅ **Console.log Removidos**: 40+ statements de debug removidos  
✅ **Configuração de Produção**: Vite configurado para produção segura  

---

## 📋 PRÉ-REQUISITOS

### 1. **Ferramentas Necessárias**
```bash
# Verificar instalações
dfx --version  # >= 0.29.0
node --version # >= 18.x
npm --version  # >= 9.x
```

### 2. **ICP Tokens para Cycles**
- **Mínimo**: 4-6 ICP tokens na sua carteira
- **Recomendado**: 10+ ICP para operação segura
- **Onde comprar**: Binance, OKX, ou exchanges que suportam ICP

### 3. **Identidade Segura**
```bash
# Criar identidade específica para mainnet (se ainda não tiver)
dfx identity new petid-mainnet
dfx identity use petid-mainnet

# IMPORTANTE: Backup da identidade!
dfx identity export petid-mainnet > petid-mainnet-identity.pem
# Guarde este arquivo em local MUITO seguro!
```

---

## 🔧 PREPARAÇÃO PARA DEPLOY

### 1. **Limpar Build Anterior**
```bash
# Na raiz do projeto
dfx stop
rm -rf .dfx
rm -rf src/PetID_frontend/dist
rm -rf src/PetID_frontend/node_modules/.vite
```

### 2. **Build Frontend Otimizado**
```bash
cd src/PetID_frontend

# Instalar dependências
npm install

# Build de produção
npm run build

# Verificar se build foi criado
ls -la dist/

cd ../..
```

### 3. **Configurar Cycles**
```bash
# Opção A: Converter ICP para Cycles via NNS
dfx ledger --network ic account-id
# Envie ICP para este endereço via NNS dapp

# Opção B: Criar canister com cycles diretamente
dfx ledger --network ic create-canister $(dfx identity get-principal) --amount 3.0

# Verificar wallet cycles
dfx wallet --network ic balance
```

---

## 🚀 DEPLOY NA MAINNET

### 1. **Deploy Backend**
```bash
# Deploy do canister backend
dfx deploy PetID_backend --network ic --with-cycles 2000000000000

# Verificar status
dfx canister --network ic status PetID_backend
```

### 2. **Deploy Frontend**
```bash
# Deploy do canister frontend
dfx deploy PetID_frontend --network ic --with-cycles 2000000000000

# Verificar status  
dfx canister --network ic status PetID_frontend
```

### 3. **Verificar URLs**
```bash
# Obter URLs dos canisters
dfx canister --network ic info PetID_frontend
dfx canister --network ic info PetID_backend

# URLs serão como:
# Frontend: https://xxxxx-xxxxx-xxxxx-aaaaa-cai.icp0.io
# Backend: https://yyyyy-yyyyy-yyyyy-aaaaa-cai.icp0.io
```

---

## 🔍 VALIDAÇÃO PÓS-DEPLOY

### 1. **Testar Funcionalidades Críticas**
- [ ] Internet Identity login funciona
- [ ] Registro de pets funciona  
- [ ] Upload de fotos funciona (mesmo que fake por enquanto)
- [ ] Registros médicos funcionam
- [ ] Interface mobile responsiva
- [ ] PWA instala corretamente

### 2. **Monitorar Cycles**
```bash
# Verificar cycles restantes
dfx canister --network ic status PetID_backend
dfx canister --network ic status PetID_frontend

# Se necessário, adicionar mais cycles
dfx canister --network ic deposit-cycles 1000000000000 PetID_backend
```

### 3. **Verificar Logs**
```bash
# Ver logs dos canisters (para debug se necessário)
dfx canister --network ic logs PetID_backend
dfx canister --network ic logs PetID_frontend
```

---

## 🔄 ATUALIZAÇÕES FUTURAS

### 1. **Deploy de Atualizações**
```bash
# Rebuild e redeploy
cd src/PetID_frontend
npm run build
cd ../..

dfx deploy PetID_backend --network ic
dfx deploy PetID_frontend --network ic
```

### 2. **Backup dos Dados**
```bash
# Backup dos dados do canister
dfx canister --network ic call PetID_backend backup_data
```

---

## 🛡️ SEGURANÇA PÓS-DEPLOY

### 1. **Monitoramento Contínuo**
- Verificar cycles semanalmente
- Monitorar performance via [IC Dashboard](https://dashboard.internetcomputer.org/)
- Configurar alertas de cycles baixos

### 2. **Gestão de Identidades**
```bash
# Para updates futuros, sempre usar a identidade correta
dfx identity use petid-mainnet

# NUNCA compartilhar ou commitar:
# - Arquivos .pem de identidade
# - Private keys
# - Mnemonic phrases
```

---

## 🔗 INTEGRAÇÃO COM DOMÍNIO PERSONALIZADO (OPCIONAL)

### 1. **Registrar Domínio**
- Registre seu domínio (ex: petid.com)
- Configure DNS para apontar para ICP

### 2. **Configurar IC-Domains**
```bash
# Instalar ic-domains CLI
npm install -g ic-domains

# Configurar domínio
ic-domains register petid.com --canister-id xxxxx-xxxxx-xxxxx-aaaaa-cai
```

---

## 📊 ESTIMATIVA DE CUSTOS

### Cycles de Deploy (Uma vez):
- Backend: ~2T cycles
- Frontend: ~2T cycles  
- **Total**: ~4T cycles (~4 ICP)

### Cycles Operacionais (Mensal):
- Operação normal: ~500B cycles
- **Total mensal**: ~0.5 ICP

---

## 🆘 RESOLUÇÃO DE PROBLEMAS

### Deploy Falha por Falta de Cycles
```bash
# Adicionar mais cycles
dfx wallet --network ic balance
dfx canister --network ic deposit-cycles 2000000000000 PetID_backend
```

### Frontend Não Carrega
1. Verificar se build foi feito corretamente
2. Verificar console do browser para erros
3. Verificar se Internet Identity está configurado

### Backend Não Responde
1. Verificar cycles do canister
2. Verificar logs para erros
3. Reinstalar se necessário

---

## ✅ CHECKLIST FINAL

Antes de considerar deploy concluído:

- [ ] URLs públicas acessíveis
- [ ] Login com Internet Identity funciona
- [ ] Todas as funcionalidades principais testadas
- [ ] Cycles suficientes para 3+ meses
- [ ] Backup da identidade armazenado seguramente
- [ ] Console.log removidos (verificar DevTools)
- [ ] Configurações de produção ativas
- [ ] Performance aceitável em mobile e desktop

---

## 🎯 PRÓXIMOS PASSOS RECOMENDADOS

1. **Implementar DIP721 NFT** (para pets como NFTs reais)
2. **IPFS Real** (substituir fake upload)
3. **Analytics** (Google Analytics ou similar)
4. **Error Tracking** (Sentry ou similar)  
5. **Domínio Personalizado**
6. **CI/CD Pipeline** para deploys automáticos

---

**🔥 SUA APLICAÇÃO ESTÁ PRONTA PARA MAINNET!**

Execute os comandos acima e sua PetID estará rodando na Internet Computer mainnet, disponível globalmente para todos os usuários!