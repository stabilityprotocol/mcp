# STABILITY-MCP

A comprehensive Model Context Protocol (MCP) for interacting with the STABILITY blockchain. This project provides tools for wallet management, smart contract deployment, and blockchain interactions.

PRODUCTION URL: https://mcp.stabilityprotocol.com

For detailed usage instructions including SSE, HTTP Streaming, STDIO modes, and API examples, see [USAGE.md](USAGE.md).

[![Add to Cursor](https://camo.githubusercontent.com/07693c66afde8c9e20f2a324fdabd5064da6dc50f8482cca2d9290e7ad7c3204/68747470733a2f2f637572736f722e636f6d2f646565706c696e6b2f6d63702d696e7374616c6c2d6461726b2e737667)](https://cursor.com/install-mcp?name=stabilityprotocol&config=eyJ1cmwiOiJodHRwczovL21jcC5zdGFiaWxpdHlwcm90b2NvbC5jb20vc3NlIn0=)

## Features

### 🔐 Wallet Management

- Create new random wallets
- Get wallet balances
- Retrieve transaction history

### 📋 Smart Contract Deployment

- Deploy ERC20 tokens
- Deploy ERC721 NFTs
- Deploy ERC1155 multi-tokens
- Deploy custom contracts with user-provided bytecode and ABI

### ⛓️ Blockchain Interactions

- Send transactions
- Query transaction details
- Get block information
- Read from smart contracts
- Write to smart contracts
- Get latest block data

## Setup

### Prerequisites

- Node.js 18+
- Yarn package manager
- STABILITY blockchain API key from [https://portal.stabilityprotocol.com/](https://portal.stabilityprotocol.com/)

### Installation

1. **Clone and install dependencies:**

```bash
git clone <repository-url>
cd stability-mcp
yarn install
```

2. **Build the project:**

```bash
npx tsc --build
```

3. **Set environment variables:**

```bash
export PORT=3000  # Optional, defaults to 3000
```

### Starting the Server

```bash
cd apps/server
node dist/index.js
```

The server will start and provide several endpoints:

- **Health Check**: `GET /health`
- **MCP Endpoints**: `/mcp/{toolset}` (wallet, contracts, blockchain)
- **SSE Endpoints**: `/sse/{toolset}`
- **REST API**: `/v1/tools/{toolset}`

### API Key Configuration

The STABILITY API key can be provided in multiple ways:

1. **HTTP Header** (for REST API calls):

   ```bash
   -H "X-API-Key: your_stability_api_key_here"
   ```

2. **Parameter in tool arguments** (required for blockchain tools):
   ```json
   {
     "tool": "send_transaction",
     "args": {
       "apiKey": "your_stability_api_key_here",
       ...
     }
   }
   ```

### Available Tool Sets

#### 1. Wallet Tools (`/mcp/wallet`)

- `create_wallet` - Create a new random wallet
- `get_balance` - Get wallet balance
- `get_transaction_history` - Get transaction history

#### 2. Contract Tools (`/mcp/contracts`)

- `deploy_erc20` - Deploy ERC20 token contract
- `deploy_erc721` - Deploy ERC721 NFT contract
- `deploy_erc1155` - Deploy ERC1155 multi-token contract
- `deploy_custom_contract` - Deploy custom contract

#### 3. Blockchain Tools (`/mcp/blockchain`)

- `send_transaction` - Send transactions
- `get_transaction` - Get transaction details
- `get_block` - Get block information
- `read_contract` - Read from smart contracts
- `write_contract` - Write to smart contracts
- `get_latest_block` - Get latest block info

### REST API Examples

#### Create a Wallet

```bash
curl -X POST http://localhost:3000/v1/tools/wallet \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_stability_api_key_here" \
  -d '{
    "tool": "create_wallet",
    "args": {
      "alias": "MyWallet"
    }
  }'
```

#### Get Wallet Balance

```bash
curl -X POST http://localhost:3000/v1/tools/wallet \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_stability_api_key_here" \
  -d '{
    "tool": "get_balance",
    "args": {
      "address": "0x..."
    }
  }'
```

#### Deploy ERC20 Token

```bash
curl -X POST http://localhost:3000/v1/tools/contracts \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_stability_api_key_here" \
  -d '{
    "tool": "deploy_erc20",
    "args": {
      "name": "MyToken",
      "symbol": "MTK",
      "initialSupply": "1000000",
      "walletAddress": "0x...",
      "privateKey": "0x..."
    }
  }'
```

#### Send Transaction

```bash
curl -X POST http://localhost:3000/v1/tools/blockchain \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_stability_api_key_here" \
  -d '{
    "tool": "send_transaction",
    "args": {
      "to": "0x...",
      "value": "0.1",
      "privateKey": "0x...",
      "apiKey": "your_stability_api_key_here"
    }
  }'
```

## STABILITY Blockchain Configuration

- **RPC Endpoint**: `https://rpc.stabilityprotocol.com/zgt/{API_KEY}`
- **Explorer**: [https://explorer.stabilityprotocol.com/](https://explorer.stabilityprotocol.com/)
- **Gas Fees**: All transactions use zero gas fees (`maxFeePerGas: 0`, `maxPriorityFeePerGas: 0`)

## Project Structure

```
stability-mcp/
├── apps/
│   ├── wallet/        # Wallet management tools
│   ├── contracts/     # Smart contract deployment
│   ├── blockchain/    # Blockchain interaction tools
│   └── server/        # MCP server application
├── libs/
│   ├── types/         # Shared TypeScript types
│   └── utils/         # Shared utilities (logging, env)
└── instructions/      # Project specifications
```

## Development

### Building Individual Packages

```bash
# Build all packages
npx tsc --build

# Build specific package
cd apps/wallet && npx tsc
```

### Running Tests

```bash
yarn test  # When tests are implemented
```

### Adding New Tools

1. Create new tool in appropriate app directory
2. Follow the `IMCPTool` interface pattern
3. Export tool in the app's `index.ts`
4. Add app to server's `toolsEndpoints`

## Security Notes

- ⚠️ **API keys should be kept secure** - Never commit them to version control
- ⚠️ **Transaction validation** - Always verify transaction details before signing

## License

MIT License - see LICENSE file for details.
