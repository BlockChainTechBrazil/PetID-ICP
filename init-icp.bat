@echo off
echo 🚀 Iniciando PetID-ICP...

REM Verificar se DFX está instalado
where dfx >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ DFX não encontrado. Por favor, instale o DFX primeiro.
    echo 📝 Instruções: https://internetcomputer.org/docs/current/developer-docs/setup/install/
    pause
    exit /b 1
)

REM Verificar versão do DFX
echo 📋 Versão do DFX:
dfx --version

REM Parar qualquer instância anterior
echo 🛑 Parando instâncias anteriores...
dfx stop

REM Limpar estado anterior se existir
if exist ".dfx" (
    echo 🧹 Limpando estado anterior...
    rmdir /s /q .dfx
)

REM Iniciar a rede local
echo 🌐 Iniciando rede local do ICP...
start /b dfx start --clean

REM Aguardar a rede inicializar
echo ⏳ Aguardando rede inicializar...
timeout /t 15 /nobreak >nul

REM Deploy dos canisters
echo 📦 Fazendo deploy dos canisters...
dfx deploy

REM Verificar status dos canisters
echo ✅ Status dos canisters:
dfx canister status --all

REM Gerar tipos TypeScript
echo 🔧 Gerando tipos TypeScript...
dfx generate

echo 🎉 PetID-ICP inicializado com sucesso!
echo 📱 Você pode agora executar: npm run dev
echo 🔗 URL local: http://localhost:5173
echo 🆔 Internet Identity local: http://localhost:4943/?canisterId=be2us-64aaa-aaaaa-qaabq-cai
pause
