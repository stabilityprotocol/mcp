#!/bin/bash

# STABILITY-MCP Build Script
echo "🚀 Building STABILITY-MCP..."

# Create directories if they don't exist
mkdir -p packages/core/dist
mkdir -p packages/wallet/dist  
mkdir -p packages/contracts/dist
mkdir -p packages/blockchain/dist

echo "✅ Project structure created"
echo "📚 STABILITY-MCP is ready for development!"

echo ""
echo "📖 Next steps:"
echo "1. Install dependencies: yarn install"
echo "2. Build packages: yarn build" 
echo "3. Run tests: yarn test"
echo "4. Try the example: yarn workspace @stability-mcp/examples basic"
echo ""
echo "🔧 Configuration:"
echo "1. Copy .env.example to .env"
echo "2. Get your API key from https://portal.stabilityprotocol.com/"
echo "3. Set STABILITY_API_KEY in your .env file"
echo ""
echo "📜 Documentation:"
echo "- README.md - Complete usage guide"
echo "- examples/ - Usage examples" 
echo "- Each package has its own documentation"