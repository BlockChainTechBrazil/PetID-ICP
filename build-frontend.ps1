Write-Host "🎨 Script de Build Frontend - PetID ICP" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Verificar se Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Blue
} catch {
    Write-Host "❌ Node.js não encontrado. Por favor, instale o Node.js primeiro:" -ForegroundColor Red
    Write-Host "   👉 https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Verificar se npm está disponível
try {
    $npmVersion = npm --version
    Write-Host "✅ NPM encontrado: $npmVersion" -ForegroundColor Blue
} catch {
    Write-Host "❌ NPM não encontrado." -ForegroundColor Red
    exit 1
}

# Verificar se dfx está instalado
try {
    $dfxVersion = dfx --version
    Write-Host "✅ DFX encontrado: $dfxVersion" -ForegroundColor Blue
} catch {
    Write-Host "❌ DFX não encontrado. Instale o DFX primeiro!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Instalando dependências..." -ForegroundColor Blue
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🛑 Parando replica existente..." -ForegroundColor Yellow
dfx stop 2>$null

Write-Host "🚀 Iniciando replica local..." -ForegroundColor Blue
dfx start --background --clean

Write-Host "⏳ Aguardando replica inicializar..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "📦 Fazendo deploy do backend..." -ForegroundColor Blue
dfx deploy hello_world

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro no deploy do backend!" -ForegroundColor Red
    exit 1
}

Write-Host "🎨 Gerando types TypeScript..." -ForegroundColor Blue
dfx generate hello_world

Write-Host "⚡ Buildando frontend..." -ForegroundColor Blue
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 Build realizado com sucesso!" -ForegroundColor Green
    Write-Host ""
    
    # Obter IDs dos canisters
    $backendId = dfx canister id hello_world
    $frontendId = dfx canister id petid_frontend
    
    Write-Host "📋 Informações dos Canisters:" -ForegroundColor Blue
    Write-Host "   Backend (hello_world): $backendId" -ForegroundColor White
    Write-Host "   Frontend (petid_frontend): $frontendId" -ForegroundColor White
    
    Write-Host ""
    Write-Host "🌐 URLs disponíveis:" -ForegroundColor Blue
    Write-Host "   Frontend: http://127.0.0.1:8000/?canisterId=$frontendId" -ForegroundColor Cyan
    Write-Host "   Candid UI: http://127.0.0.1:8000/_/candid" -ForegroundColor Cyan
    Write-Host "   Backend Candid: http://127.0.0.1:8000/?canisterId=$(dfx canister id __Candid_UI)&id=$backendId" -ForegroundColor Cyan
    
    Write-Host ""
    Write-Host "🧪 Para desenvolvimento:" -ForegroundColor Blue
    Write-Host "   npm run dev    # Inicia servidor de desenvolvimento" -ForegroundColor White
    Write-Host "   npm run build  # Build de produção" -ForegroundColor White
    
    Write-Host ""
    Write-Host "💡 Dicas:" -ForegroundColor Yellow
    Write-Host "   • Use Ctrl+C para parar o servidor de dev" -ForegroundColor White
    Write-Host "   • A replica continuará rodando em background" -ForegroundColor White
    Write-Host "   • Use 'dfx stop' para parar a replica" -ForegroundColor White
    
} else {
    Write-Host "❌ Erro no build do frontend!" -ForegroundColor Red
    Write-Host "🔧 Tente executar: npm install && npm run build" -ForegroundColor Yellow
}
