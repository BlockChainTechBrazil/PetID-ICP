Write-Host "🧪 Script de Teste Local - PetID ICP" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# Verificar se dfx está instalado
try {
    $dfxVersion = dfx --version
    Write-Host "✅ DFX encontrado: $dfxVersion" -ForegroundColor Blue
} catch {
    Write-Host "❌ DFX não encontrado. Instale primeiro!" -ForegroundColor Red
    exit 1
}

# Parar qualquer replica que esteja rodando
Write-Host "🛑 Parando replica existente..." -ForegroundColor Yellow
dfx stop 2>$null

# Iniciar replica local
Write-Host "🚀 Iniciando replica local..." -ForegroundColor Blue
dfx start --background --clean

# Aguardar a replica inicializar
Write-Host "⏳ Aguardando replica inicializar..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Deploy local
Write-Host "📦 Fazendo deploy local..." -ForegroundColor Blue
dfx deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 Deploy local realizado com sucesso!" -ForegroundColor Green
    Write-Host ""
    
    # Obter Canister ID
    $canisterId = dfx canister id hello_world
    Write-Host "📋 Canister ID: $canisterId" -ForegroundColor Blue
    
    Write-Host ""
    Write-Host "🧪 Testando todas as funções:" -ForegroundColor Blue
    Write-Host "===============================" -ForegroundColor Blue
    
    # Teste 1: hello()
    Write-Host "1️⃣ Testando hello():" -ForegroundColor Yellow
    dfx canister call hello_world hello
    Write-Host ""
    
    # Teste 2: greet()
    Write-Host "2️⃣ Testando greet('Davi'):" -ForegroundColor Yellow
    dfx canister call hello_world greet '("Davi")'
    Write-Host ""
    
    # Teste 3: getName()
    Write-Host "3️⃣ Testando getName():" -ForegroundColor Yellow
    dfx canister call hello_world getName
    Write-Host ""
    
    # Teste 4: getCounter() inicial
    Write-Host "4️⃣ Testando getCounter() (inicial):" -ForegroundColor Yellow
    dfx canister call hello_world getCounter
    Write-Host ""
    
    # Teste 5: increment()
    Write-Host "5️⃣ Testando increment() (3x):" -ForegroundColor Yellow
    dfx canister call hello_world increment
    dfx canister call hello_world increment
    dfx canister call hello_world increment
    Write-Host ""
    
    # Teste 6: getCounter() após incremento
    Write-Host "6️⃣ Testando getCounter() (após increments):" -ForegroundColor Yellow
    dfx canister call hello_world getCounter
    Write-Host ""
    
    # Teste 7: reset()
    Write-Host "7️⃣ Testando reset():" -ForegroundColor Yellow
    dfx canister call hello_world reset
    Write-Host ""
    
    # Teste 8: getCounter() após reset
    Write-Host "8️⃣ Testando getCounter() (após reset):" -ForegroundColor Yellow
    dfx canister call hello_world getCounter
    Write-Host ""
    
    Write-Host "✅ Todos os testes concluídos!" -ForegroundColor Green
    Write-Host ""
    
    # Obter Candid UI ID
    $candidId = dfx canister id __Candid_UI
    Write-Host "🌐 URLs locais:" -ForegroundColor Blue
    Write-Host "   Candid Interface: http://127.0.0.1:8000/?canisterId=$candidId&id=$canisterId" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "💡 Para parar a replica: dfx stop" -ForegroundColor Yellow
    
} else {
    Write-Host "❌ Erro no deploy local!" -ForegroundColor Red
    Write-Host "🔧 Tente: dfx stop && dfx start --clean" -ForegroundColor Yellow
}
