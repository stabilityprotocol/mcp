# STABILITY-MCP

A comprehensive Management Control Panel (MCP) for interacting with the STABILITY blockchain. This project provides tools for wallet management, smart contract deployment, and blockchain interactions.

## Features

### 🔐 Wallet Management

- Create new random wallets
- Import existing wallets (private key or mnemonic)
- Delete managed wallets
- List all wallets
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
export STABILITY_API_KEY=your_api_key_here
export PORT=3000  # Optional, defaults to 3000
```

## Usage

### Starting the Server

```bash
cd apps/server
STABILITY_API_KEY=your_api_key node dist/index.js
```

The server will start and provide several endpoints:

- **Health Check**: `GET /health`
- **MCP Endpoints**: `/mcp/{toolset}` (wallet, contracts, blockchain)
- **SSE Endpoints**: `/sse/{toolset}`
- **REST API**: `/v1/tools/{toolset}`

### Available Tool Sets

#### 1. Wallet Tools (`/mcp/wallet`)

- `create_wallet` - Create a new random wallet
- `import_wallet` - Import wallet via private key or mnemonic
- `delete_wallet` - Remove wallet from management
- `list_wallets` - List all managed wallets
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
  -d '{
    "tool": "send_transaction",
    "args": {
      "to": "0x...",
      "value": "0.1",
      "privateKey": "0x..."
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

- ⚠️ **Private keys are stored in memory** - Use secure storage in production
- ⚠️ **API keys should be kept secure** - Never commit them to version control
- ⚠️ **Transaction validation** - Always verify transaction details before signing

## License

MIT License - see LICENSE file for details.
