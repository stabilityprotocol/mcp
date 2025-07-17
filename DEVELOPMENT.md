# STABILITY-MCP Development Guide

## 🏗️ Project Structure

This project uses a modular Yarn Workspace architecture with TypeScript:

```
stability-mcp/
├── packages/
│   ├── core/              # Core functionality
│   │   ├── src/
│   │   │   ├── index.ts           # Main exports
│   │   │   ├── stability-mcp.ts   # Main application class
│   │   │   ├── config.ts          # Configuration management
│   │   │   ├── provider.ts        # Blockchain provider
│   │   │   ├── types.ts           # Type definitions
│   │   │   └── errors.ts          # Error classes
│   │   └── tests/         # Unit tests
│   │
│   ├── wallet/            # Wallet management
│   │   ├── src/
│   │   │   ├── index.ts           # Wallet exports
│   │   │   ├── wallet-manager.ts  # Wallet operations
│   │   │   ├── wallet-storage.ts  # Secure storage
│   │   │   └── types.ts           # Wallet types
│   │   └── tests/
│   │
│   ├── contracts/         # Smart contract deployment
│   │   ├── src/
│   │   │   ├── index.ts               # Contract exports
│   │   │   ├── contract-manager.ts    # Contract operations
│   │   │   ├── contract-templates.ts  # Standard contract templates
│   │   │   └── types.ts               # Contract types
│   │   └── tests/
│   │
│   └── blockchain/        # Blockchain operations
│       ├── src/
│       │   ├── index.ts               # Blockchain exports
│       │   ├── blockchain-manager.ts  # Advanced blockchain ops
│       │   └── types.ts               # Blockchain types
│       └── tests/
│
├── examples/              # Usage examples
├── docs/                  # Documentation
└── build.sh              # Build script
```

## 🚀 Getting Started

### 1. Setup Environment

```bash
# Clone the repository
git clone <repository-url>
cd stability-mcp

# Copy environment template
cp .env.example .env

# Edit .env file with your STABILITY API key
# Get your API key from: https://portal.stabilityprotocol.com/
```

### 2. Install Dependencies

```bash
# Install all workspace dependencies
yarn install

# Alternative: Install dependencies per package
cd packages/core && yarn install
cd ../wallet && yarn install
cd ../contracts && yarn install  
cd ../blockchain && yarn install
```

### 3. Build Project

```bash
# Build all packages
yarn build

# Build specific package
yarn workspace @stability-mcp/core build
yarn workspace @stability-mcp/wallet build
yarn workspace @stability-mcp/contracts build
yarn workspace @stability-mcp/blockchain build
```

### 4. Run Tests

```bash
# Run all tests
yarn test

# Run tests with coverage
yarn test --coverage

# Run specific package tests
yarn workspace @stability-mcp/core test
yarn workspace @stability-mcp/wallet test
```

### 5. Development Mode

```bash
# Watch mode for all packages
yarn dev

# Watch specific package
yarn workspace @stability-mcp/core dev
```

## 📦 Package Development

### Core Package (@stability-mcp/core)

The core package provides:
- Main `StabilityMCP` class
- Configuration management (`StabilityConfig`)
- Blockchain provider abstraction (`StabilityProvider`)
- Common types and error classes
- STABILITY-specific transaction settings

**Key Files:**
- `stability-mcp.ts` - Main orchestrator class
- `config.ts` - Environment and API configuration
- `provider.ts` - Blockchain RPC interaction
- `types.ts` - Shared type definitions
- `errors.ts` - Custom error classes

### Wallet Package (@stability-mcp/wallet)

Handles wallet operations:
- Create new wallets
- Import existing wallets
- Secure storage with encryption
- Balance and transaction history
- Transaction sending

**Key Files:**
- `wallet-manager.ts` - Main wallet operations
- `wallet-storage.ts` - Persistent secure storage
- `types.ts` - Wallet-specific types

### Contracts Package (@stability-mcp/contracts)

Smart contract deployment and interaction:
- Standard contract templates (ERC20, ERC721, ERC1155)
- Custom contract deployment
- Contract function calls
- Contract state queries

**Key Files:**
- `contract-manager.ts` - Contract deployment and interaction
- `contract-templates.ts` - Pre-built contract templates
- `types.ts` - Contract-specific types

### Blockchain Package (@stability-mcp/blockchain)

Advanced blockchain operations:
- Block and transaction analysis
- Network statistics
- Address information
- Token analysis
- Transaction monitoring

**Key Files:**
- `blockchain-manager.ts` - Advanced blockchain operations
- `types.ts` - Blockchain-specific types

## 🧪 Testing Strategy

### Unit Tests

Each package has comprehensive unit tests:

```bash
# Run specific test files
yarn workspace @stability-mcp/core test wallet-manager.test.ts
yarn workspace @stability-mcp/wallet test storage.test.ts
```

### Integration Tests

Test cross-package functionality:

```bash
# Test full wallet-to-contract deployment flow
yarn test integration
```

### Mocking

Tests use mocked STABILITY RPC endpoints to avoid real blockchain calls:

```typescript
// Example test setup
beforeEach(() => {
  // Mock provider responses
  mockProvider.getBalance.mockResolvedValue(BigInt('1000000000000000000'));
  mockProvider.getTransaction.mockResolvedValue(mockTransaction);
});
```

## 🔧 Configuration

### Environment Variables

Required for development:

```bash
# .env file
STABILITY_API_KEY=your_api_key_here
STABILITY_RPC_URL=https://rpc.stabilityprotocol.com/zgt/{{API_KEY}}
STABILITY_EXPLORER_URL=https://explorer.stabilityprotocol.com
NETWORK_NAME=STABILITY
CHAIN_ID=101010
DEFAULT_GAS_LIMIT=21000
```

### TypeScript Configuration

Each package extends the root `tsconfig.json`:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

## 🚨 Important Notes

### STABILITY Blockchain Specifics

- **Zero Gas Fees**: All transactions must set `maxFeePerGas` and `maxPriorityFeePerGas` to 0
- **API Key Required**: Must authenticate with STABILITY API key
- **RPC Format**: Use `https://rpc.stabilityprotocol.com/zgt/{API_KEY}` format

### Security Considerations

- Private keys stored locally only
- Environment variables for sensitive data
- Input validation on all user inputs
- Error messages don't expose sensitive information

### Code Style

- Use TypeScript strict mode
- Async/await for all promises
- Proper error handling with custom error classes
- Comprehensive JSDoc comments
- Consistent naming conventions

## 🐛 Debugging

### Common Issues

1. **API Key Problems**
   ```bash
   Error: STABILITY_API_KEY is required
   ```
   Solution: Set valid API key in `.env` file

2. **RPC Connection Issues**
   ```bash
   Error: Failed to connect to STABILITY blockchain
   ```
   Solution: Check internet connection and API key validity

3. **Build Errors**
   ```bash
   Error: Cannot find module '@stability-mcp/core'
   ```
   Solution: Run `yarn build` to compile TypeScript

4. **Transaction Failures**
   ```bash
   Error: insufficient funds
   ```
   Solution: Fund your wallet before sending transactions

### Debug Mode

Enable detailed logging:

```typescript
// Set environment variable
process.env.DEBUG = 'stability-mcp:*';

// Or in code
const mcp = new StabilityMCP({ 
  apiKey: 'your-key',
  debug: true 
});
```

## 📚 Adding New Features

### 1. Add New Contract Type

1. Update `ContractType` enum in `core/src/types.ts`
2. Add template in `contracts/src/contract-templates.ts`
3. Update contract manager deployment logic
4. Add tests for new contract type

### 2. Add New Blockchain Query

1. Define types in `blockchain/src/types.ts`
2. Implement method in `blockchain-manager.ts`
3. Add unit tests
4. Update documentation

### 3. Add New Wallet Feature

1. Define types in `wallet/src/types.ts`
2. Implement in `wallet-manager.ts`
3. Update storage if needed
4. Add comprehensive tests

## 🔄 Release Process

1. Update version numbers in all `package.json` files
2. Run full test suite: `yarn test`
3. Build all packages: `yarn build`
4. Update CHANGELOG.md
5. Create git tag
6. Publish packages (if public)

## 🤝 Contributing Guidelines

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes following code style
4. Add tests for new functionality
5. Update documentation
6. Commit changes: `git commit -m 'Add amazing feature'`
7. Push to branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## 📞 Getting Help

- Check existing issues in the repository
- Review STABILITY documentation
- Join STABILITY Discord community
- Create detailed issue with reproduction steps