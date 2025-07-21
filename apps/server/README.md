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
