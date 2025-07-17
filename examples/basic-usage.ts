#!/usr/bin/env node

/**
 * STABILITY-MCP Basic Usage Example
 * 
 * This example demonstrates the core functionality of the STABILITY-MCP:
 * - Wallet management
 * - Smart contract deployment  
 * - Blockchain queries
 * - Transaction handling
 */

import { StabilityMCP, ContractType } from '@stability-mcp/core';

async function main() {
  try {
    console.log('🚀 Starting STABILITY-MCP Demo...\n');

    // Initialize the MCP with your API key
    // Make sure to set STABILITY_API_KEY in your environment
    const mcp = new StabilityMCP();
    
    // Initialize connection to STABILITY blockchain
    console.log('🔌 Connecting to STABILITY blockchain...');
    await mcp.initialize();
    
    // Get application status
    const status = await mcp.getStatus();
    console.log('📊 Network Status:', status.network);
    console.log('💼 Wallets Count:', status.walletsCount);
    console.log('');

    // === WALLET MANAGEMENT DEMO ===
    console.log('=== 💳 WALLET MANAGEMENT ===\n');
    
    // Create a new wallet
    console.log('Creating new wallet...');
    const newWallet = await mcp.wallet.createWallet({
      name: 'Demo Wallet'
    });
    console.log('✅ Wallet created:', {
      id: newWallet.id,
      address: newWallet.address,
      name: newWallet.name
    });

    // Import an existing wallet (example with a test private key)
    // NOTE: Never use real private keys in examples!
    console.log('\nImporting wallet from private key...');
    const importedWallet = await mcp.wallet.importWallet({
      privateKey: '0x' + '1'.repeat(64), // Test private key
      name: 'Imported Demo Wallet'
    });
    console.log('✅ Wallet imported:', {
      id: importedWallet.id,
      address: importedWallet.address
    });

    // List all wallets
    console.log('\nListing all wallets...');
    const allWallets = await mcp.wallet.listWallets();
    allWallets.forEach((wallet, index) => {
      console.log(`${index + 1}. ${wallet.address} - Balance: ${wallet.balance} ETH`);
    });

    // Get detailed wallet balance
    console.log('\nGetting wallet balance...');
    const balance = await mcp.wallet.getWalletBalance(newWallet.id);
    console.log(`💰 Balance: ${balance} ETH`);

    // === SMART CONTRACT DEPLOYMENT DEMO ===
    console.log('\n=== 📜 SMART CONTRACT DEPLOYMENT ===\n');

    try {
      // Deploy ERC20 Token
      console.log('Deploying ERC20 token...');
      const erc20Contract = await mcp.contracts.deployContract({
        walletId: newWallet.id,
        contractType: ContractType.ERC20,
        name: 'DemoToken',
        symbol: 'DEMO',
        initialSupply: '1000000'
      }, mcp.wallet);
      
      console.log('✅ ERC20 deployed:', {
        address: erc20Contract.address,
        name: erc20Contract.name,
        txHash: erc20Contract.txHash
      });

      // Deploy ERC721 NFT
      console.log('\nDeploying ERC721 NFT...');
      const erc721Contract = await mcp.contracts.deployContract({
        walletId: newWallet.id,
        contractType: ContractType.ERC721,
        name: 'DemoNFT',
        symbol: 'DNFT',
        baseURI: 'https://api.example.com/metadata/'
      }, mcp.wallet);
      
      console.log('✅ ERC721 deployed:', {
        address: erc721Contract.address,
        name: erc721Contract.name,
        txHash: erc721Contract.txHash
      });

      // List deployed contracts
      console.log('\nListing deployed contracts...');
      const contracts = mcp.contracts.listContracts();
      contracts.forEach((contract, index) => {
        console.log(`${index + 1}. ${contract.name} (${contract.type}) - ${contract.address}`);
      });

      // Query contract (read-only)
      console.log('\nQuerying ERC20 token name...');
      const tokenName = await mcp.contracts.queryContract({
        contractAddress: erc20Contract.address,
        functionName: 'name'
      });
      console.log('📖 Token name:', tokenName);

    } catch (contractError) {
      console.log('⚠️  Contract deployment skipped (requires funded wallet):', contractError.message);
    }

    // === BLOCKCHAIN QUERIES DEMO ===
    console.log('\n=== 🔍 BLOCKCHAIN QUERIES ===\n');

    // Get latest block information
    console.log('Getting latest block info...');
    const blockInfo = await mcp.blockchain.getBlockInfo();
    console.log('📦 Latest block:', {
      number: blockInfo.number,
      hash: blockInfo.hash.substring(0, 10) + '...',
      transactions: blockInfo.transactions.length
    });

    // Get network statistics
    console.log('\nGetting network statistics...');
    const networkStats = await mcp.blockchain.getNetworkStats();
    console.log('📈 Network stats:', networkStats);

    // Get address information
    console.log('\nAnalyzing address...');
    const addressInfo = await mcp.blockchain.getAddressInfo(newWallet.address);
    console.log('🔍 Address analysis:', {
      address: addressInfo.address,
      balance: addressInfo.balance,
      isContract: addressInfo.isContract,
      transactionCount: addressInfo.transactionCount
    });

    // Search for recent transactions
    console.log('\nSearching recent transactions...');
    const recentTxs = await mcp.blockchain.searchTransactions({
      limit: 5
    });
    console.log(`📋 Found ${recentTxs.length} recent transactions`);
    recentTxs.forEach((tx, index) => {
      console.log(`${index + 1}. ${tx.hash.substring(0, 10)}... - ${tx.value} ETH`);
    });

    // === TRANSACTION HISTORY DEMO ===
    console.log('\n=== 📜 TRANSACTION HISTORY ===\n');

    // Get wallet transaction history
    console.log('Getting wallet transaction history...');
    const txHistory = await mcp.wallet.getWalletHistory(newWallet.id, 10);
    console.log(`📚 Transaction history (${txHistory.length} transactions):`);
    
    if (txHistory.length === 0) {
      console.log('💭 No transactions found for this wallet');
    } else {
      txHistory.forEach((tx, index) => {
        console.log(`${index + 1}. ${tx.hash} - ${tx.value} ETH - Status: ${tx.status}`);
      });
    }

    // === CLEANUP DEMO ===
    console.log('\n=== 🧹 CLEANUP (Optional) ===\n');
    
    // Optionally remove demo wallets
    console.log('Demo wallets created. You can remove them manually if needed.');
    console.log('Wallet IDs to remove:');
    console.log(`- ${newWallet.id} (${newWallet.name})`);
    console.log(`- ${importedWallet.id} (${importedWallet.name})`);
    
    // Uncomment to actually remove wallets:
    // await mcp.wallet.deleteWallet(newWallet.id);
    // await mcp.wallet.deleteWallet(importedWallet.id);
    // console.log('✅ Demo wallets removed');

    console.log('\n🎉 STABILITY-MCP Demo completed successfully!\n');
    console.log('📚 Next steps:');
    console.log('1. Fund your wallets to deploy contracts');
    console.log('2. Deploy your own smart contracts');
    console.log('3. Build your dApp on STABILITY blockchain');
    console.log('4. Explore the API documentation');

  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Make sure STABILITY_API_KEY is set in your .env file');
    console.error('2. Check your internet connection');
    console.error('3. Verify your API key is valid');
    console.error('4. Check STABILITY network status');
    
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

// Run the demo
if (require.main === module) {
  main().catch(console.error);
}

export { main };