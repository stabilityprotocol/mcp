# Contract Compiler

## Overview

The contract compiler is a singleton class that compiles Solidity contracts using OpenZeppelin libraries with bytecode caching for optimal performance.

## Features

- **Singleton Pattern**: One instance manages all compilations
- **Bytecode Caching**: Compiled contracts are cached to avoid recompilation
- **OpenZeppelin Integration**: Automatic resolution of OpenZeppelin contract imports
- **Optimization**: Contracts are compiled with optimization enabled (200 runs)

## Usage

```typescript
import ContractCompiler from './compiler.js';

const compiler = ContractCompiler.getInstance();

// Get compiled ERC20 contract
const erc20 = await compiler.getERC20();
console.log('Bytecode:', erc20.bytecode);
console.log('ABI:', erc20.abi);

// Get compiled ERC721 contract
const erc721 = await compiler.getERC721();

// Get compiled ERC1155 contract
const erc1155 = await compiler.getERC1155();

// Get any custom contract
const custom = await compiler.getContract('CustomContract');
```

## Cache Management

```typescript
// Clear all cached contracts
compiler.clearCache();

// Get list of cached contract names
const cached = compiler.getCacheKeys();
```

## Contract Templates

### ERC20 Token

- Based on OpenZeppelin ERC20 with Ownable
- Configurable decimals
- Mint and burn functionality
- Constructor: `(name, symbol, initialSupply, decimals)`

### ERC721 NFT

- Based on OpenZeppelin ERC721 with URIStorage and Ownable
- Configurable base URI
- Mint with custom URI or auto-increment
- Constructor: `(name, symbol, baseTokenURI)`

### ERC1155 Multi-Token

- Based on OpenZeppelin ERC1155 with Ownable
- Individual token URI support
- Batch minting capabilities
- Constructor: `(uri)`

## Directory Structure

```
src/
├── contracts/
│   ├── ERC20.sol      # ERC20 token template
│   ├── ERC721.sol     # ERC721 NFT template
│   └── ERC1155.sol    # ERC1155 multi-token template
├── compiler.ts        # Singleton compiler class
└── index.ts          # MCP tools using compiled contracts
```
