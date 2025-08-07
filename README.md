# PetID ICP Project 🐾

Um projeto básico na Internet Computer usando Motoko para demonstrar conceitos de blockchain e canisters.

## 🚀 Configuração Inicial (Windows)

### Pré-requisitos

1. **Instalar WSL2** (Recomendado)
   ```powershell
   wsl --install
   ```
   Reinicie o computador após a instalação.

2. **Instalar DFX no WSL2**
   ```bash
   # No terminal WSL2
   sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
   ```

3. **Adicionar DFX ao PATH**
   ```bash
   echo 'export PATH="$HOME/.local/share/dfx/bin:$PATH"' >> ~/.bashrc
   source ~/.bashrc
   ```

### Verificar Instalação
```bash
dfx --version
```

## 🔧 Comandos Básicos

### Deploy Local (Desenvolvimento)
```bash
# Iniciar replica local
dfx start --background

# Deploy no ambiente local
dfx deploy

# Testar funções
dfx canister call hello_world hello
dfx canister call hello_world greet '("Seu Nome")'
dfx canister call hello_world increment
dfx canister call hello_world getCounter
```

### Deploy na IC (Mainnet)

1. **Obter Cycles Gratuitos**
   - Acesse: https://faucet.dfinity.org/
   - Conecte com GitHub ou Identity Anchor
   - Solicite cycles gratuitos

2. **Executar Deploy**
   ```powershell
   # No Windows PowerShell
   .\deploy.ps1
   ```
   
   Ou manualmente:
   ```bash
   # No WSL2
   dfx deploy --network ic
   ```

## 🌐 URLs Úteis Após Deploy

- **Candid Interface**: `https://[CANISTER-ID].ic0.app/_/candid`
- **IC Dashboard**: `https://dashboard.internetcomputer.org/canister/[CANISTER-ID]`

## 🧪 Testando na IC

```bash
# Testar funções na mainnet
dfx canister call hello_world hello --network ic
dfx canister call hello_world greet '("Mundo")' --network ic
dfx canister call hello_world increment --network ic
dfx canister call hello_world getCounter --network ic
```

## 🎨 Frontend Visual com TypeScript

### Desenvolvimento Local
```powershell
# Instalar dependências e iniciar servidor de desenvolvimento
.\dev-server.ps1
# Acesse: http://localhost:8080
```

### Build Completo
```powershell
# Build completo (backend + frontend)
.\build-frontend.ps1
```

### Funcionalidades da Interface
- ✅ **Interface moderna e responsiva**
- ✅ **Botões visuais para todas as funções**
- ✅ **Contador visual em tempo real**
- ✅ **Feedback visual de loading e resultados**
- ✅ **Suporte a TypeScript completo**
- ✅ **Auto-reconnect ao canister**

## 📋 Funcionalidades Implementadas

- ✅ Função de saudação básica
- ✅ Função de saudação personalizada
- ✅ Contador persistente com incremento/reset
- ✅ Nome do projeto
- ✅ Deploy automatizado via script PowerShell

## 🔍 Estrutura do Projeto

```
petid-icp/
├── dfx.json              # Configuração do projeto
├── deploy.ps1            # Script de deploy para Windows
├── deploy.sh             # Script de deploy para Linux/Mac
├── README.md             # Este arquivo
└── src/
    └── hello_world/
        └── main.mo       # Código principal do canister
```

## 🎯 Próximos Passos

1. Instalar DFX conforme instruções acima
2. Testar localmente com `dfx start` e `dfx deploy`
3. Obter cycles gratuitos no faucet
4. Fazer deploy na IC usando `.\deploy.ps1`
5. Explorar o Candid Interface gerado

## 📚 Recursos

- [Documentação Internet Computer](https://internetcomputer.org/docs/current/)
- [Motoko Language Guide](https://internetcomputer.org/docs/current/motoko/intro/)
- [DFX Command Reference](https://internetcomputer.org/docs/current/references/cli-reference/)
- [Cycles Faucet](https://faucet.dfinity.org/)

---

Desenvolvido para demonstrar conceitos de blockchain na Internet Computer 🚀
