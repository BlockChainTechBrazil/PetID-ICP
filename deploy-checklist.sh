#!/bin/bash

# PetID Mainnet Deploy Checklist & Setup
echo "🚀 PetID Mainnet Deploy Preparation"
echo "=================================="

echo ""
echo "📋 Pre-Deploy Checklist:"
echo "------------------------"

# Check if DFX is installed
if command -v dfx &> /dev/null; then
    echo "✅ DFX is installed: $(dfx --version)"
else
    echo "❌ DFX is not installed. Please install: https://internetcomputer.org/docs/current/developer-docs/setup/install/"
    exit 1
fi

# Check if user has cycles wallet
echo ""
echo "💰 Checking Cycles Wallet..."
wallet_result=$(dfx identity --network ic get-wallet 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Cycles wallet found: $wallet_result"
else
    echo "⚠️  No cycles wallet found. You'll need to:"
    echo "   1. Get cycles from: https://faucet.dfinity.org/"
    echo "   2. Or buy cycles at: https://nns.ic0.app/"
fi

# Check environment variables
echo ""
echo "🔑 Checking Environment Variables..."
if [ -f "src/PetID_frontend/.env" ]; then
    echo "✅ Frontend .env file exists"
    
    if grep -q "VITE_GOOGLE_MAPS_API_KEY" src/PetID_frontend/.env; then
        echo "✅ Google Maps API key configured"
    else
        echo "⚠️  Google Maps API key missing in .env"
    fi
    
    if grep -q "VITE_DFX_NETWORK" src/PetID_frontend/.env; then
        echo "✅ DFX Network variable set"
    else
        echo "⚠️  DFX Network variable missing in .env"
    fi
else
    echo "❌ Frontend .env file missing"
    echo "   Create src/PetID_frontend/.env with required variables"
fi

# Check build configuration
echo ""
echo "🏗️ Build Configuration Check..."
if [ -f "src/PetID_frontend/vite.config.js" ]; then
    echo "✅ Vite config exists"
else
    echo "❌ Vite config missing"
fi

if [ -f "src/PetID_frontend/public/.ic-assets.json5" ]; then
    echo "✅ IC Assets config exists"
else
    echo "❌ IC Assets config missing"
fi

# Check for common issues
echo ""
echo "🔍 Common Issues Check..."

# Check node_modules size (should be reasonable)
if [ -d "node_modules" ]; then
    size=$(du -sh node_modules 2>/dev/null | cut -f1)
    echo "📦 node_modules size: $size"
fi

# Check for large files in build directory
if [ -d "src/PetID_frontend/dist" ]; then
    echo "✅ Build directory exists"
    large_files=$(find src/PetID_frontend/dist -size +1M 2>/dev/null | wc -l)
    if [ $large_files -gt 0 ]; then
        echo "⚠️  Found $large_files files larger than 1MB in dist/"
        echo "   Consider optimizing images and assets"
    fi
else
    echo "⚠️  Build directory doesn't exist. Run 'npm run build' first"
fi

echo ""
echo "🎯 Estimated Deploy Requirements:"
echo "--------------------------------"
echo "💰 Backend canister: ~0.5T cycles (creation) + 1T cycles (runtime)"
echo "💰 Frontend canister: ~0.1T cycles (creation) + 0.5T cycles (assets)"
echo "⏱️  Estimated time: 5-10 minutes"
echo "📊 Bundle size: $(du -sh src/PetID_frontend/dist 2>/dev/null | cut -f1 || echo 'Unknown')"

echo ""
echo "🚀 Ready for Deploy Commands:"
echo "-----------------------------"
echo "1. Build frontend:     npm run build"
echo "2. Deploy to mainnet:  dfx deploy --network ic"
echo "3. Check status:       dfx canister --network ic status --all"

echo ""
echo "📞 Support:"
echo "-----------"
echo "If you encounter issues:"
echo "• IC Developer Discord: https://discord.gg/cA7y6ezyE2"
echo "• DFINITY Forum: https://forum.dfinity.org/"
echo "• Documentation: https://internetcomputer.org/docs/"

echo ""
echo "Good luck with your deploy! 🎉"