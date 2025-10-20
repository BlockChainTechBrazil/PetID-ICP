#!/bin/bash

# PetID Mainnet Deploy Script
set -e

echo "🚀 PetID Mainnet Deployment Starting..."
echo "======================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command -v dfx &> /dev/null; then
    print_error "DFX is not installed"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "NPM is not installed"
    exit 1
fi

print_status "Prerequisites check passed"

# Check cycles balance
echo ""
echo "💰 Checking cycles balance..."
if dfx identity --network ic get-wallet &>/dev/null; then
    wallet=$(dfx identity --network ic get-wallet)
    balance=$(dfx wallet --network ic balance 2>/dev/null || echo "0")
    echo "Wallet: $wallet"
    echo "Balance: $balance"
    
    # Extract numeric value (remove 'TC' suffix if present)
    numeric_balance=$(echo $balance | sed 's/[^0-9.]//g')
    if (( $(echo "$numeric_balance < 2" | bc -l) )); then
        print_warning "Low cycles balance ($balance). Consider topping up at https://nns.ic0.app/"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
else
    print_warning "No cycles wallet found. You'll need cycles to deploy."
    print_warning "Get free cycles at: https://faucet.dfinity.org/"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Verify environment configuration
echo ""
echo "🔧 Setting up environment..."

# Check if production env exists
if [ ! -f "src/PetID_frontend/.env.production" ]; then
    print_warning "Production environment file not found"
    if [ -f ".env.production.template" ]; then
        echo "Copying template..."
        cp .env.production.template src/PetID_frontend/.env.production
        print_warning "Please edit src/PetID_frontend/.env.production with your API keys"
        read -p "Press Enter after updating the .env.production file..."
    fi
fi

# Build the frontend
echo ""
echo "🏗️ Building frontend..."
cd src/PetID_frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Build the project
echo "Building optimized production bundle..."
npm run build

if [ ! -d "dist" ]; then
    print_error "Build failed - dist directory not created"
    exit 1
fi

# Check build size
build_size=$(du -sh dist | cut -f1)
echo "Build size: $build_size"

cd ../..

# Deploy to mainnet
echo ""
echo "🚀 Deploying to IC mainnet..."

# Deploy backend first
echo "Deploying backend canister..."
dfx deploy --network ic PetID_backend

# Get backend canister ID
backend_canister=$(dfx canister --network ic id PetID_backend)
print_status "Backend deployed: $backend_canister"

# Deploy frontend
echo "Deploying frontend canister..."
dfx deploy --network ic PetID_frontend

# Get frontend canister ID
frontend_canister=$(dfx canister --network ic id PetID_frontend)
print_status "Frontend deployed: $frontend_canister"

# Update environment with canister IDs
echo ""
echo "📝 Updating environment with canister IDs..."
env_file="src/PetID_frontend/.env.production"

# Update backend canister ID
if grep -q "VITE_CANISTER_ID_PETID_BACKEND" "$env_file"; then
    sed -i.bak "s/VITE_CANISTER_ID_PETID_BACKEND=.*/VITE_CANISTER_ID_PETID_BACKEND=$backend_canister/" "$env_file"
else
    echo "VITE_CANISTER_ID_PETID_BACKEND=$backend_canister" >> "$env_file"
fi

# Update frontend canister ID
if grep -q "VITE_CANISTER_ID_PETID_FRONTEND" "$env_file"; then
    sed -i.bak "s/VITE_CANISTER_ID_PETID_FRONTEND=.*/VITE_CANISTER_ID_PETID_FRONTEND=$frontend_canister/" "$env_file"
else
    echo "VITE_CANISTER_ID_PETID_FRONTEND=$frontend_canister" >> "$env_file"
fi

# Redeploy frontend with updated environment
echo "Rebuilding frontend with canister IDs..."
cd src/PetID_frontend
npm run build
cd ../..
dfx deploy --network ic PetID_frontend

print_status "Environment updated and frontend redeployed"

# Final status check
echo ""
echo "📊 Deployment Status:"
echo "======================"
dfx canister --network ic status --all

echo ""
echo "🎉 Deployment Complete!"
echo "======================="
echo "🌐 Frontend URL: https://$frontend_canister.icp0.io"
echo "⚙️  Backend Canister: $backend_canister"
echo "📱 Frontend Canister: $frontend_canister"

echo ""
echo "🔗 Useful Links:"
echo "• Frontend: https://$frontend_canister.icp0.io"
echo "• Candid UI: https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=$backend_canister"
echo "• ICP Dashboard: https://dashboard.internetcomputer.org/canister/$frontend_canister"

echo ""
print_status "Your PetID dApp is now live on the Internet Computer! 🎊"