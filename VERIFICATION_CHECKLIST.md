# 🔍 Checklist de Verificação - PetID ICP

## ✅ Verificações Básicas

### 1. Arquivos Necessários
- [ ] `src/hello_world/main.mo` existe e contém código Motoko
- [ ] `dfx.json` existe e está configurado corretamente
- [ ] Scripts de deploy (`deploy.ps1`, `deploy.sh`) existem
- [ ] Scripts de teste (`test-local.ps1`, `test-local.sh`) existem

### 2. Ambiente de Desenvolvimento
- [ ] DFX está instalado (`dfx --version`)
- [ ] WSL2 configurado (para Windows)
- [ ] Node.js instalado (opcional, para frontend)

### 3. Testes Locais
- [ ] `dfx start` executa sem erros
- [ ] `dfx deploy` completa com sucesso
- [ ] Todas as funções retornam valores esperados:
  - [ ] `hello()` → `"Hello, World! 🌍"`
  - [ ] `greet("Nome")` → `"Hello, Nome! 👋"`
  - [ ] `getName()` → `"PetID ICP Project"`
  - [ ] `getCounter()` → `0` (inicial)
  - [ ] `increment()` → incrementa corretamente
  - [ ] `reset()` → volta para `0`

### 4. Interface Candid
- [ ] Interface carrega no navegador
- [ ] Todas as funções aparecem na interface
- [ ] Funções executam pela interface
- [ ] Tipos de dados estão corretos

### 5. Deploy na IC (Opcional)
- [ ] Cycles obtidos do faucet
- [ ] Identity configurada
- [ ] Deploy na mainnet funciona
- [ ] Canister acessível publicamente

## 🚨 Problemas Comuns e Soluções

### DFX não encontrado
```bash
# Instalar DFX no WSL2
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
export PATH="$HOME/.local/share/dfx/bin:$PATH"
```

### Erro de deploy
```bash
# Limpar e reiniciar
dfx stop
dfx start --clean
dfx deploy
```

### Replica não inicia
```bash
# Verificar porta 8000
netstat -an | grep 8000
# Matar processos se necessário
pkill dfx
```

### Candid Interface não carrega
- Verificar se replica está rodando
- Verificar URL correta
- Limpar cache do navegador

## 📝 Comandos de Teste Rápido

```bash
# Teste completo das funções
dfx canister call hello_world hello
dfx canister call hello_world greet '("Teste")'
dfx canister call hello_world getName
dfx canister call hello_world getCounter
dfx canister call hello_world increment
dfx canister call hello_world reset
```

## 🎯 Critérios de Sucesso

O projeto está **100% funcional** quando:
1. ✅ Todos os testes passam
2. ✅ Interface Candid funciona
3. ✅ Contador persiste estado
4. ✅ Deploy local e IC funcionam
5. ✅ Documentação está completa
