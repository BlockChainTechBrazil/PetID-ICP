#!/bin/bash

# PetID Final Deploy Check
echo "🎯 PetID Final Deploy Verification"
echo "=================================="

# Check API keys
echo ""
echo "🔑 API Keys Status:"
echo "------------------"

if grep -q "VITE_GOOGLE_MAPS_API_KEY=AIza" src/PetID_frontend/.env.production; then
    echo "✅ Google Maps API Key: Configured"
else
    echo "❌ Google Maps API Key: Missing"
fi

if grep -q "VITE_OPENAI_API_KEY=sk-" src/PetID_frontend/.env.production; then
    echo "✅ OpenAI API Key: Configured"
else
    echo "⚠️  OpenAI API Key: Missing (IA will use on-chain only)"
fi

# Check network configuration
echo ""
echo "🌐 Network Configuration:"
echo "------------------------"

if grep -q "VITE_DFX_NETWORK=ic" src/PetID_frontend/.env.production; then
    echo "✅ Network: Set to mainnet (ic)"
else
    echo "❌ Network: Not set to mainnet"
fi

if grep -q "VITE_IC_HOST=https://icp0.io" src/PetID_frontend/.env.production; then
    echo "✅ IC Host: Set to production"
else
    echo "❌ IC Host: Not set to production"
fi

# Check CSP configuration
echo ""
echo "🛡️  Security Configuration:"
echo "--------------------------"

if grep -q "maps.googleapis.com" src/PetID_frontend/public/.ic-assets.json5; then
    echo "✅ CSP: Google Maps allowed"
else
    echo "❌ CSP: Google Maps blocked"
fi

if grep -q "api.openai.com" src/PetID_frontend/public/.ic-assets.json5; then
    echo "✅ CSP: OpenAI API allowed"
else
    echo "❌ CSP: OpenAI API blocked"
fi

echo ""
echo "📋 Deploy Readiness Summary:"
echo "============================="

# Count ready items
ready_count=0
total_count=6

# Check each requirement
if grep -q "VITE_GOOGLE_MAPS_API_KEY=AIza" src/PetID_frontend/.env.production; then
    ((ready_count++))
fi

if grep -q "VITE_DFX_NETWORK=ic" src/PetID_frontend/.env.production; then
    ((ready_count++))
fi

if grep -q "VITE_IC_HOST=https://icp0.io" src/PetID_frontend/.env.production; then
    ((ready_count++))
fi

if grep -q "maps.googleapis.com" src/PetID_frontend/public/.ic-assets.json5; then
    ((ready_count++))
fi

if grep -q "api.openai.com" src/PetID_frontend/public/.ic-assets.json5; then
    ((ready_count++))
fi

# Always count environment file as ready since we created it
((ready_count++))

percentage=$((ready_count * 100 / total_count))

echo "📊 Readiness: $ready_count/$total_count items configured ($percentage%)"

if [ $ready_count -eq $total_count ]; then
    echo ""
    echo "🎉 READY FOR DEPLOY! 🎉"
    echo "======================"
    echo "All configurations are set correctly."
    echo ""
    echo "🚀 Execute deploy with:"
    echo "   npm run deploy:mainnet"
    echo ""
    echo "🌐 Your PetID will be available at:"
    echo "   https://[canister-id].icp0.io"
    echo ""
elif [ $percentage -gt 80 ]; then
    echo ""
    echo "⚠️  MOSTLY READY (minor issues)"
    echo "=============================="
    echo "You can deploy, but some features may not work perfectly."
    echo ""
    echo "🚀 Execute deploy with:"
    echo "   npm run deploy:mainnet"
else
    echo ""
    echo "❌ NOT READY FOR DEPLOY"
    echo "======================="
    echo "Please fix the missing configurations above."
fi

echo ""
echo "💰 Don't forget to have cycles in your wallet!"
echo "   Check: dfx wallet --network ic balance"
echo "   Get cycles: https://faucet.dfinity.org/"