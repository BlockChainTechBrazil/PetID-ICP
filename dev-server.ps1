Write-Host "Servidor de Desenvolvimento - PetID ICP" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Verificar se as dependencias estao instaladas
if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias..." -ForegroundColor Blue
    npm install
}

# Verificar se a replica esta rodando
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/v2/status" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "Replica ja esta rodando" -ForegroundColor Green
} catch {
    Write-Host "Iniciando replica local..." -ForegroundColor Blue
    dfx start --background --clean
    
    Write-Host "Aguardando replica inicializar..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
}

# Deploy se necessario
Write-Host "Verificando deploy..." -ForegroundColor Blue
try {
    $canisterId = dfx canister id hello_world
    Write-Host "Backend ja esta deployado: $canisterId" -ForegroundColor Green
} catch {
    Write-Host "Fazendo deploy do backend..." -ForegroundColor Blue
    dfx deploy hello_world
    dfx generate hello_world
}

Write-Host ""
Write-Host "Iniciando servidor de desenvolvimento..." -ForegroundColor Blue
Write-Host "O frontend estara disponivel em: http://localhost:8080" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pressione Ctrl+C para parar o servidor" -ForegroundColor Yellow
Write-Host ""

# Iniciar servidor de desenvolvimento
npm run dev
