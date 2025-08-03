#!/bin/bash

# Script para verificar o status do Internet Identity Canister

echo "Verificando status do Internet Identity Canister..."
II_ID=$(dfx canister id internet_identity)
echo "ID do Internet Identity: $II_ID"

echo "Tentando acessar o Internet Identity via curl..."
curl -s -o /dev/null -w "Status HTTP: %{http_code}\n" "http://localhost:4943/?canisterId=$II_ID"

echo "Verificando status do canister..."
dfx canister info internet_identity

echo "Para acessar o Internet Identity, abra:"
echo "http://localhost:4943/?canisterId=$II_ID"

# Verificando se o dfx está rodando
echo "Verificando status do dfx..."
dfx ping || echo "DFX não está rodando!"

echo "Verificando IDs de canisters:"
echo "Backend: $(dfx canister id petid_backend)"
echo "Frontend: $(dfx canister id petid_frontend)"
echo "Internet Identity: $II_ID"
