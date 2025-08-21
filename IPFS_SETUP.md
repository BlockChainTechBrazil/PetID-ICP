# 🚀 Configuração IPFS para PetID

## Opções de Upload para IPFS

### 1. NFT.Storage (Recomendado - Gratuito)
```bash
# Vá para: https://nft.storage
# Crie uma conta gratuita
# Gere uma API Key
# Adicione no arquivo .env:
REACT_APP_NFT_STORAGE_KEY=your_nft_storage_key_here
```

### 2. Pinata (Popular)
```bash
# Vá para: https://pinata.cloud
# Crie uma conta
# Gere um JWT Token
# Adicione no arquivo .env:
REACT_APP_PINATA_JWT=your_pinata_jwt_here
```

### 3. Web3.Storage (Descontinuado)
```bash
# Não use mais - serviço foi descontinuado
```

## Como Usar CIDs Reais

### CIDs de Teste Conhecidos (Para desenvolvimento):
```
QmPK1s3pNYLi9ERiq3BDxKa4XosgWwFRQUydHUtz4YgpqB - Imagem de exemplo 1
QmUNLLsPACCz1vLxQVkXqqLX5R1X9RVqGWP2veRtSxEN5Y - Imagem de exemplo 2  
QmRyUEkVCWfzHSzjFe2nMhRhNJTJFz7c1gLQfN8T8NoYdz - Imagem de exemplo 3
```

### Verificar se um CID funciona:
```bash
# Teste no navegador:
https://ipfs.io/ipfs/SEU_CID_AQUI
https://gateway.pinata.cloud/ipfs/SEU_CID_AQUI
```

## Status Atual da Implementação

✅ **Funciona:**
- Upload de arquivo local
- Validação de imagens
- Sistema de fallback
- Placeholder local
- Múltiplos gateways IPFS
- Verificação de CID

⚠️ **Precisa configurar:**
- Chave da API do NFT.Storage ou Pinata
- Variáveis de ambiente

🔄 **Em desenvolvimento:**
- Upload real para IPFS (depende das chaves da API)

## Como Testar Agora

1. **Use o botão "🔍 Verificar CID Real"** - testa CIDs conhecidos
2. **Use o botão "🎨 Placeholder Local"** - sempre funciona  
3. **Configure uma API key** para upload real

## Próximos Passos

1. Obter chave da API do NFT.Storage (gratuito)
2. Configurar arquivo .env
3. Testar upload real
4. Deploy em produção
