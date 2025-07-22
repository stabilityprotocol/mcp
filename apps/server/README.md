# Server

This is the server that runs the MCPs.

## MCPs

- [Wallet MCP](../wallet/README.md)
- [Contracts MCP](../contracts/README.md)
- [Blockchain MCP](../blockchain/README.md)

## Running

### HTTP Server (default)

```bash
yarn start
```

### STDIO Mode

For direct MCP client integration:

```bash
# All tools
yarn stdio

# Specific tool sets
yarn stdio:wallet
yarn stdio:contracts
yarn stdio:blockchain
```

Or directly:

```bash
node dist/index.js --stdio
node dist/index.js --stdio --tools=wallet
```

## Auth

The server is protected by an auth middleware.
The auth middleware is configured to use the `AUTH_SECRET_KEY` environment variable.
The `AUTH_SECRET_KEY` is set in the `.env` file.
The `AUTH_SECRET_KEY` is a simple string that is used to authenticate the requests to the server, DO NOT SHARE THIS KEY WITH ANYONE.
If `AUTH_SECRET_KEY` is not set, the auth middleware is skipped.

## API Key Configuration

The STABILITY API key is injected through the server in multiple ways:

### Environment Variable (Recommended)

Set the API key as an environment variable for wallet and contracts tools:

```bash
export STABILITY_API_KEY=your_api_key_here
```

### HTTP Header

Pass the API key via HTTP header for REST API calls:

```bash
curl -X POST http://localhost:3000/v1/tools/wallet \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_stability_api_key_here" \
  -d '{"tool": "create_wallet", "args": {"alias": "MyWallet"}}'
```

### Tool Parameter

For blockchain tools, the API key must be provided as a parameter:

```bash
curl -X POST http://localhost:3000/v1/tools/blockchain \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "send_transaction",
    "args": {
      "apiKey": "your_stability_api_key_here",
      "to": "0x...",
      "value": "0.1",
      "privateKey": "0x..."
    }
  }'
```

**Note**: The server acts as a proxy for API key injection, ensuring consistent access to STABILITY blockchain resources across all tool sets.
