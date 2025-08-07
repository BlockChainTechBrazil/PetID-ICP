Write-Host "🚀 Script de Deploy para IC Testnet (Windows)" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green

# Verificar se dfx está instalado
try {
    $dfxVersion = dfx --version
    Write-Host "📦 DFX encontrado: $dfxVersion" -ForegroundColor Blue
} catch {
    Write-Host "❌ DFX não encontrado. Por favor, instale o DFX primeiro:" -ForegroundColor Red
    Write-Host "   1. Instale WSL2 se ainda não tiver" -ForegroundColor Yellow
    Write-Host "   2. No WSL2, execute: sh -ci `"$(curl -fsSL https://internetcomputer.org/install.sh)`"" -ForegroundColor Yellow
    Write-Host "   3. Adicione o DFX ao PATH do Windows ou use WSL2" -ForegroundColor Yellow
    exit 1
}

# Criar identity se não existir
Write-Host "🔑 Configurando identity..." -ForegroundColor Blue
$identities = dfx identity list
if ($identities -notmatch "myidentity") {
    dfx identity new myidentity
}
dfx identity use myidentity

# Mostrar principal ID
Write-Host "🆔 Seu Principal ID:" -ForegroundColor Blue
dfx identity get-principal

Write-Host ""
Write-Host "💰 IMPORTANTE: Antes de fazer o deploy na IC," -ForegroundColor Yellow
Write-Host "   você precisa obter cycles gratuitos em:" -ForegroundColor Yellow
Write-Host "   👉 https://faucet.dfinity.org/" -ForegroundColor Cyan
Write-Host ""

Read-Host "Pressione Enter após obter os cycles para continuar"

# Deploy na IC
Write-Host "🌐 Fazendo deploy na Internet Computer..." -ForegroundColor Blue
dfx deploy --network ic

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 Deploy realizado com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Informações do seu canister:" -ForegroundColor Blue
    $canisterId = dfx canister id hello_world --network ic
    
    Write-Host ""
    Write-Host "🔗 URLs úteis:" -ForegroundColor Blue
    Write-Host "   Candid Interface: https://$canisterId.ic0.app/_/candid" -ForegroundColor Cyan
    Write-Host "   IC Dashboard: https://dashboard.internetcomputer.org/canister/$canisterId" -ForegroundColor Cyan
    
    Write-Host ""
    Write-Host "🧪 Teste as funções:" -ForegroundColor Blue
    Write-Host "   dfx canister call hello_world hello --network ic" -ForegroundColor White
    Write-Host "   dfx canister call hello_world greet '(`"Mundo`")' --network ic" -ForegroundColor White
    Write-Host "   dfx canister call hello_world increment --network ic" -ForegroundColor White
    Write-Host "   dfx canister call hello_world getCounter --network ic" -ForegroundColor White
    
    Write-Host ""
    Write-Host "💡 Dicas:" -ForegroundColor Yellow
    Write-Host "   • Salve o Canister ID: $canisterId" -ForegroundColor White
    Write-Host "   • Use a Candid Interface para testar visualmente" -ForegroundColor White
    Write-Host "   • Monitore seu canister no IC Dashboard" -ForegroundColor White
} else {
    Write-Host "❌ Erro no deploy. Verifique se você tem cycles suficientes." -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Possíveis soluções:" -ForegroundColor Yellow
    Write-Host "   1. Obtenha cycles gratuitos em: https://faucet.dfinity.org/" -ForegroundColor White
    Write-Host "   2. Verifique sua conexão com a internet" -ForegroundColor White
    Write-Host "   3. Verifique se sua identity tem permissões" -ForegroundColor White
}
