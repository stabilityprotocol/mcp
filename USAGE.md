# Stability MCP Usage Guide

This document explains how to use the Stability Model Context Protocol (MCP) for interacting with the STABILITY blockchain. Users can access tools for wallet management, smart contract deployment, and blockchain interactions via the production API.

## Add to Cursor

[![Add to Cursor](https://camo.githubusercontent.com/07693c66afde8c9e20f2a324fdabd5064da6dc50f8482cca2d9290e7ad7c3204/68747470733a2f2f637572736f722e636f6d2f646565706c696e6b2f6d63702d696e7374616c6c2d6461726b2e737667)](https://cursor.com/install-mcp?name=stabilityprotocol&config=eyJ1cmwiOiJodHRwczovL21jcC5zdGFiaWxpdHlwcm90b2NvbC5jb20vbWNwIn0)

- Click the button above to add Stability MCP to your Cursor IDE
- Alternatively, manually add the MCP server URL: `https://mcp.stabilityprotocol.com/mcp`
- Configure your STABILITY API key in Cursor's MCP settings

```json
{
  "mcpServers": {
    "stabilityprotocol": {
      "url": "https://mcp.stabilityprotocol.com/mcp"
    }
  }
}
```

## Production URL

- The production instance is available at: https://mcp.stabilityprotocol.com

## What You Will Find

- **Wallet Management Tools**: Create, check balances, and view transaction history.
- **Smart Contract Deployment Tools**: Deploy ERC20, ERC721, ERC1155 tokens, or custom contracts.
- **Blockchain Interaction Tools**: Send transactions, query transaction details, get block information, read/write to contracts, and get latest block data.
- **API Endpoints**: RESTful APIs for all tools, with SSE support for real-time updates.
- **Zero Gas Fees**: All transactions on STABILITY blockchain use zero gas fees.

## How to Use It

### Server-Sent Events (SSE)

- Use SSE for real-time updates by connecting to `/sse/{toolset}` endpoints for specific toolsets, or `/sse` for all tools combined.
- Example: Connect to `https://mcp.stabilityprotocol.com/sse/wallet` for wallet-related real-time events.
- Handle events in your client application to receive live updates on transactions, deployments, etc.

### HTTP Streamable

- The API supports streamable HTTP responses for tools that produce ongoing output.
- Use standard HTTP POST to `/mcp/{toolset}` for specific toolsets, or `/mcp` for all tools combined, and handle chunked responses.
- Example: `curl -N https://mcp.stabilityprotocol.com/mcp/blockchain -d '{"tool": "get_latest_block", "args": {...}}'` to stream block updates.

### STDIO Mode (Local Integration)

- For direct integration in scripts or applications, run the server in STDIO mode locally.
- Command: `node dist/index.js --stdio --tools=wallet` (after building the project).
- Interact by writing JSON commands to stdin and reading responses from stdout.
- Example Input: `{"tool": "create_wallet", "args": {"alias": "MyWallet"}}`
- Requires local setup; see README.md for installation.

### REST API (HTTP Requests)

- Make POST requests to endpoints like `/v1/tools/{toolset}` where toolset is `wallet`, `contracts`, or `blockchain`.
- **Authentication**: Provide STABILITY API key via `X-API-Key` header or as a parameter for blockchain tools.
- **Example: Create Wallet**
  ```
  curl -X POST https://mcp.stabilityprotocol.com/v1/tools/wallet \
    -H "Content-Type: application/json" \
    -H "X-API-Key: your_api_key_here" \
    -d '{"tool": "create_wallet", "args": {"alias": "MyWallet"}}'
  ```
- **Example: Deploy ERC20 Token**
  ```
  curl -X POST https://mcp.stabilityprotocol.com/v1/tools/contracts \
    -H "Content-Type: application/json" \
    -H "X-API-Key: your_api_key_here" \
    -d '{"tool": "deploy_erc20", "args": {"name": "MyToken", "symbol": "MTK", "initialSupply": "1000000", "walletAddress": "0x...", "privateKey": "0x..."}}'
  ```
- **Example: Send Transaction**
  ```
  curl -X POST https://mcp.stabilityprotocol.com/v1/tools/blockchain \
    -H "Content-Type: application/json" \
    -d '{"tool": "send_transaction", "args": {"apiKey": "your_api_key_here", "to": "0x...", "value": "0.1", "privateKey": "0x..."}}'
  ```
- **Get API Key**: Obtain from https://portal.stabilityprotocol.com/
- **More Examples**: See the README.md for additional API examples and details.
- **Security Note**: Keep API keys and private keys secure; never share them.

For development setup or contributing, refer to README.md.
