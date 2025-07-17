# STABILITY-MCP

A comprehensive Management Control Panel (MCP) for interacting with the STABILITY blockchain. This application provides a complete toolkit for blockchain operations including wallet management, smart contract deployment, and transaction handling.

## 🌟 Features

### Wallet Management
- **Create New Wallets**: Generate secure random wallets
- **Import Existing Wallets**: Import from private key or mnemonic phrase
- **Wallet Operations**: List, delete, and manage wallet metadata
- **Balance Tracking**: Real-time balance monitoring
- **Transaction History**: Complete transaction history for each wallet

### Smart Contract Deployment
- **Standard Contracts**: Deploy ERC20, ERC721, and ERC1155 contracts
- **Custom Contracts**: Deploy user-provided smart contracts
- **Contract Interaction**: Call contract functions and query contract state
- **Contract Management**: Track and manage deployed contracts

### Blockchain Interaction
- **Transaction Management**: Send transactions with proper STABILITY settings
- **Block Information**: Query detailed block data
- **Network Statistics**: Get real-time network stats
- **Address Analysis**: Detailed address information and analytics
- **Token Information**: Analyze token contracts and metadata

### STABILITY Blockchain Features
- **Zero Gas Fees**: Automatically configured for STABILITY's zero-gas requirements
- **Network Integration**: Seamless integration with STABILITY RPC endpoints
- **Explorer Integration**: Links to STABILITY blockchain explorer
- **API Key Management**: Secure handling of STABILITY API credentials

## 🏗️ Architecture

This project uses a modular Yarn Workspace architecture:

```
stability-mcp/
├── packages/
│   ├── core/           # Core functionality and configuration
│   ├── wallet/         # Wallet management and storage
│   ├── contracts/      # Smart contract deployment and interaction
│   └── blockchain/     # Advanced blockchain operations
├── examples/           # Usage examples
└── docs/              # Additional documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- Yarn (v4.0.0 or higher)
- STABILITY API Key from [portal.stabilityprotocol.com](https://portal.stabilityprotocol.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stability-mcp
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your STABILITY_API_KEY
   ```

4. **Build the project**
   ```bash
   yarn build
   ```

## 📖 Usage

### Basic Setup

```typescript
import { StabilityMCP } from '@stability-mcp/core';

// Initialize with API key
const mcp = new StabilityMCP({
  apiKey: 'your-stability-api-key'
});

// Initialize connection
await mcp.initialize();
```

### Wallet Operations

```typescript
// Create a new wallet
const wallet = await mcp.wallet.createWallet({
  name: 'My Wallet'
});

// Import existing wallet
const importedWallet = await mcp.wallet.importWallet({
  privateKey: '0x...',
  name: 'Imported Wallet'
});

// List all wallets
const wallets = await mcp.wallet.listWallets();

// Get wallet balance
const balance = await mcp.wallet.getWalletBalance(wallet.id);

// Send transaction
const tx = await mcp.wallet.sendTransaction(
  wallet.id,
  '0xRecipientAddress',
  '1.0' // Amount in ETH
);
```

### Smart Contract Deployment

```typescript
// Deploy ERC20 token
const erc20 = await mcp.contracts.deployContract({
  walletId: wallet.id,
  contractType: ContractType.ERC20,
  name: 'MyToken',
  symbol: 'MTK',
  initialSupply: '1000000'
}, mcp.wallet);

// Deploy ERC721 NFT
const erc721 = await mcp.contracts.deployContract({
  walletId: wallet.id,
  contractType: ContractType.ERC721,
  name: 'MyNFT',
  symbol: 'MNFT',
  baseURI: 'https://api.example.com/metadata/'
}, mcp.wallet);

// Deploy custom contract
const customContract = await mcp.contracts.deployContract({
  walletId: wallet.id,
  contractType: ContractType.CUSTOM,
  customAbi: [...],
  customBytecode: '0x...',
  parameters: ['param1', 'param2']
}, mcp.wallet);
```

### Contract Interaction

```typescript
// Call contract function
const result = await mcp.contracts.callContractFunction({
  contractAddress: erc20.address,
  functionName: 'transfer',
  parameters: ['0xRecipient', '100']
}, wallet.id, mcp.wallet);

// Query contract state
const balance = await mcp.contracts.queryContract({
  contractAddress: erc20.address,
  functionName: 'balanceOf',
  parameters: [wallet.address]
});
```

### Blockchain Queries

```typescript
// Get block information
const blockInfo = await mcp.blockchain.getBlockInfo();

// Get network statistics
const stats = await mcp.blockchain.getNetworkStats();

// Get address information
const addressInfo = await mcp.blockchain.getAddressInfo('0x...');

// Get token information
const tokenInfo = await mcp.blockchain.getTokenInfo('0x...');

// Search transactions
const transactions = await mcp.blockchain.searchTransactions({
  address: '0x...',
  limit: 10
});
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `STABILITY_API_KEY` | Your STABILITY API key | ✅ | - |
| `STABILITY_RPC_URL` | RPC endpoint URL | ❌ | `https://rpc.stabilityprotocol.com/zgt/{{API_KEY}}` |
| `STABILITY_EXPLORER_URL` | Blockchain explorer URL | ❌ | `https://explorer.stabilityprotocol.com` |
| `NETWORK_NAME` | Network name | ❌ | `STABILITY` |
| `CHAIN_ID` | Chain ID | ❌ | `101010` |
| `DEFAULT_GAS_LIMIT` | Default gas limit | ❌ | `21000` |

### Programmatic Configuration

```typescript
const mcp = new StabilityMCP({
  apiKey: 'your-api-key',
  rpcUrl: 'https://custom-rpc.example.com',
  explorerUrl: 'https://custom-explorer.example.com',
  networkName: 'CustomNetwork',
  chainId: 123456,
  defaultGasLimit: 30000
});
```

## 🧪 Testing

Run tests for all packages:

```bash
yarn test
```

Run tests for specific package:

```bash
yarn workspace @stability-mcp/core test
yarn workspace @stability-mcp/wallet test
yarn workspace @stability-mcp/contracts test
yarn workspace @stability-mcp/blockchain test
```

Run tests with coverage:

```bash
yarn test --coverage
```

## 🔨 Development

### Build all packages

```bash
yarn build
```

### Watch mode for development

```bash
yarn dev
```

### Lint code

```bash
yarn lint
```

### Clean build artifacts

```bash
yarn clean
```

## 📦 Package Details

### @stability-mcp/core
Core functionality including configuration, provider, and base types.

**Key Components:**
- `StabilityMCP`: Main application class
- `StabilityConfig`: Configuration management
- `StabilityProvider`: Blockchain provider abstraction
- Error classes and type definitions

### @stability-mcp/wallet
Wallet management and secure storage.

**Key Components:**
- `WalletManager`: Wallet operations
- `WalletStorage`: Persistent storage
- Wallet creation, import, and management

### @stability-mcp/contracts
Smart contract deployment and interaction.

**Key Components:**
- `ContractManager`: Contract operations
- `ContractTemplates`: Pre-built contract templates
- Support for ERC20, ERC721, ERC1155, and custom contracts

### @stability-mcp/blockchain
Advanced blockchain operations and analytics.

**Key Components:**
- `BlockchainManager`: Blockchain queries and analytics
- Block and transaction analysis
- Network statistics and monitoring

## 🚨 Security Considerations

- **Private Keys**: Stored locally in encrypted format
- **API Keys**: Securely managed through environment variables
- **Network Security**: All RPC calls use HTTPS
- **Input Validation**: Comprehensive validation of user inputs
- **Error Handling**: Graceful error handling without exposing sensitive data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests for new functionality
5. Run tests: `yarn test`
6. Commit your changes: `git commit -am 'Add new feature'`
7. Push to the branch: `git push origin feature-name`
8. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- [STABILITY Protocol](https://stabilityprotocol.com/)
- [STABILITY Portal](https://portal.stabilityprotocol.com/)
- [STABILITY Explorer](https://explorer.stabilityprotocol.com/)
- [STABILITY Documentation](https://docs.stabilityprotocol.com/)

## 📞 Support

For support and questions:

- Create an issue in this repository
- Check the [STABILITY Documentation](https://docs.stabilityprotocol.com/)
- Visit the [STABILITY Discord](https://discord.gg/stability)

---

**Note**: This application is designed specifically for the STABILITY blockchain. Make sure you have a valid API key from the STABILITY Portal before using this application.
