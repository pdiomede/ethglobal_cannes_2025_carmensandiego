#!/bin/bash

# Carmen Sandiego Subgraph Deployment Script
# This script helps deploy the subgraph to The Graph Studio

set -e  # Exit on any error

echo "🕵️‍♀️ Carmen Sandiego Subgraph Deployment"
echo "========================================"

# Check if Graph CLI is installed
if ! command -v graph &> /dev/null; then
    echo "❌ Graph CLI not found. Installing..."
    npm install -g @graphprotocol/graph-cli
fi

# Check if we're in the subgraph directory
if [ ! -f "subgraph.yaml" ]; then
    echo "❌ Error: subgraph.yaml not found. Please run this script from the subgraph directory."
    exit 1
fi

# Function to prompt for input
prompt() {
    read -p "$1: " response
    echo $response
}

echo ""
echo "📋 Pre-deployment Checklist:"
echo "1. ✅ Smart contract deployed on Base Sepolia"
echo "2. ✅ Contract ABI copied to abis/ directory"
echo "3. ✅ Subgraph schema defined"
echo "4. ✅ Mapping handlers implemented"
echo ""

# Ask for deployment type
echo "🚀 Deployment Options:"
echo "1) The Graph Studio (Recommended)"
echo "2) Local Graph Node"
echo "3) Just build and validate"
echo ""

DEPLOY_TYPE=$(prompt "Choose deployment type (1-3)")

case $DEPLOY_TYPE in
    1)
        echo ""
        echo "🌐 Deploying to The Graph Studio..."
        echo ""
        echo "📝 Instructions:"
        echo "1. Go to https://thegraph.com/studio"
        echo "2. Connect your wallet"
        echo "3. Create a new subgraph named 'carmen-sandiego-web3'"
        echo "4. Copy your deploy key from the studio"
        echo ""
        
        DEPLOY_KEY=$(prompt "Enter your deploy key from The Graph Studio")
        
        echo ""
        echo "🔧 Generating types..."
        npm run codegen
        
        echo "🏗 Building subgraph..."
        npm run build
        
        echo "🔐 Authenticating with studio..."
        graph auth --studio $DEPLOY_KEY
        
        echo "🚀 Deploying to studio..."
        graph deploy --studio carmen-sandiego-web3
        
        echo ""
        echo "✅ Deployment complete!"
        echo "🔗 Your subgraph will be available at:"
        echo "   https://thegraph.com/studio/subgraph/carmen-sandiego-web3/"
        ;;
        
    2)
        echo ""
        echo "🏠 Deploying to Local Graph Node..."
        echo ""
        echo "⚠️  Make sure you have a local Graph Node running:"
        echo "   - Docker with graph-node, IPFS, and PostgreSQL"
        echo "   - Graph Node configured for Base Sepolia"
        echo ""
        
        read -p "Is your local Graph Node running? (y/N): " LOCAL_READY
        
        if [[ $LOCAL_READY =~ ^[Yy]$ ]]; then
            echo "🔧 Generating types..."
            npm run codegen
            
            echo "🏗 Building subgraph..."
            npm run build
            
            echo "📝 Creating local subgraph..."
            npm run create-local
            
            echo "🚀 Deploying locally..."
            npm run deploy-local
            
            echo ""
            echo "✅ Local deployment complete!"
            echo "🔗 GraphQL endpoint: http://localhost:8000/subgraphs/name/carmen-sandiego-web3"
        else
            echo "❌ Please start your local Graph Node first."
            exit 1
        fi
        ;;
        
    3)
        echo ""
        echo "🔧 Generating types..."
        npm run codegen
        
        echo "🏗 Building subgraph..."
        npm run build
        
        echo ""
        echo "✅ Build complete! Subgraph is ready for deployment."
        echo "📁 Built files are in the build/ directory"
        ;;
        
    *)
        echo "❌ Invalid option. Please choose 1, 2, or 3."
        exit 1
        ;;
esac

echo ""
echo "🎉 Carmen Sandiego Subgraph Setup Complete!"
echo ""
echo "📊 What your subgraph indexes:"
echo "   • Game sessions and outcomes"
echo "   • Player statistics and rankings"
echo "   • Question difficulty analysis"
echo "   • Daily activity metrics"
echo "   • Global game statistics"
echo ""
echo "📈 Example queries available in subgraph/README.md"
echo "🔧 Frontend integration example in frontend/src/components/Leaderboard.jsx" 