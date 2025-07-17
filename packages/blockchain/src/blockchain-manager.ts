import { formatEther, formatUnits, parseEther } from 'ethers';
import { StabilityProvider, BlockchainError, TransactionDetails } from '@stability-mcp/core';
import { BlockInfo, NetworkStats, AddressInfo, TokenInfo, BlockchainAnalytics } from './types';

export class BlockchainManager {
  private provider: StabilityProvider;

  constructor(provider: StabilityProvider) {
    this.provider = provider;
  }

  /**
   * Get detailed block information
   */
  async getBlockInfo(blockNumber?: number): Promise<BlockInfo> {
    try {
      const block = await this.provider.provider.getBlock(blockNumber || 'latest', true);
      
      if (!block) {
        throw new BlockchainError(`Block not found: ${blockNumber}`);
      }

      return {
        number: block.number,
        hash: block.hash,
        parentHash: block.parentHash,
        timestamp: block.timestamp,
        gasLimit: block.gasLimit.toString(),
        gasUsed: block.gasUsed.toString(),
        miner: block.miner,
        transactions: block.transactions.map(tx => typeof tx === 'string' ? tx : tx.hash)
      };
    } catch (error) {
      throw new BlockchainError(`Failed to get block info: ${error}`);
    }
  }

  /**
   * Get network statistics
   */
  async getNetworkStats(): Promise<NetworkStats> {
    try {
      const [network, blockNumber, feeData] = await Promise.all([
        this.provider.provider.getNetwork(),
        this.provider.provider.getBlockNumber(),
        this.provider.provider.getFeeData()
      ]);

      return {
        blockNumber,
        gasPrice: feeData.gasPrice?.toString() || '0',
        chainId: Number(network.chainId),
        networkName: network.name
      };
    } catch (error) {
      throw new BlockchainError(`Failed to get network stats: ${error}`);
    }
  }

  /**
   * Get detailed address information
   */
  async getAddressInfo(address: string): Promise<AddressInfo> {
    try {
      const [balance, transactionCount, code] = await Promise.all([
        this.provider.provider.getBalance(address),
        this.provider.provider.getTransactionCount(address),
        this.provider.provider.getCode(address)
      ]);

      const isContract = code !== '0x';

      return {
        address,
        balance: formatEther(balance),
        transactionCount,
        isContract,
        code: isContract ? code : undefined
      };
    } catch (error) {
      throw new BlockchainError(`Failed to get address info: ${error}`);
    }
  }

  /**
   * Get token information (if address is a token contract)
   */
  async getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
    try {
      const code = await this.provider.provider.getCode(tokenAddress);
      if (code === '0x') {
        throw new BlockchainError(`No contract found at address: ${tokenAddress}`);
      }

      const tokenInfo: TokenInfo = {
        address: tokenAddress
      };

      // Try to get standard ERC20 information
      try {
        const calls = [
          { method: 'eth_call', params: [{ to: tokenAddress, data: '0x06fdde03' }, 'latest'] }, // name()
          { method: 'eth_call', params: [{ to: tokenAddress, data: '0x95d89b41' }, 'latest'] }, // symbol()
          { method: 'eth_call', params: [{ to: tokenAddress, data: '0x313ce567' }, 'latest'] }, // decimals()
          { method: 'eth_call', params: [{ to: tokenAddress, data: '0x18160ddd' }, 'latest'] }  // totalSupply()
        ];

        const results = await Promise.allSettled(
          calls.map(call => this.provider.query(call))
        );

        // Parse results if available
        if (results[0].status === 'fulfilled' && results[0].value !== '0x') {
          // Decode name (basic hex to string conversion)
          tokenInfo.name = this.decodeString(results[0].value);
        }

        if (results[1].status === 'fulfilled' && results[1].value !== '0x') {
          // Decode symbol
          tokenInfo.symbol = this.decodeString(results[1].value);
        }

        if (results[2].status === 'fulfilled' && results[2].value !== '0x') {
          // Decode decimals
          tokenInfo.decimals = parseInt(results[2].value, 16);
        }

        if (results[3].status === 'fulfilled' && results[3].value !== '0x') {
          // Decode total supply
          const totalSupplyHex = results[3].value;
          const decimals = tokenInfo.decimals || 18;
          tokenInfo.totalSupply = formatUnits(BigInt(totalSupplyHex), decimals);
        }
      } catch (tokenError) {
        // Token calls failed, but we still have basic contract info
      }

      return tokenInfo;
    } catch (error) {
      throw new BlockchainError(`Failed to get token info: ${error}`);
    }
  }

  /**
   * Get blockchain analytics
   */
  async getBlockchainAnalytics(fromBlock?: number, toBlock?: number): Promise<BlockchainAnalytics> {
    try {
      const latestBlock = await this.provider.provider.getBlockNumber();
      const startBlock = fromBlock || Math.max(0, latestBlock - 100);
      const endBlock = toBlock || latestBlock;

      let totalTransactions = 0;
      const blockTimes: number[] = [];
      const addresses = new Set<string>();

      // Sample blocks to get analytics
      const sampleSize = Math.min(10, endBlock - startBlock + 1);
      const step = Math.floor((endBlock - startBlock) / sampleSize) || 1;

      for (let i = startBlock; i <= endBlock; i += step) {
        try {
          const block = await this.provider.provider.getBlock(i, true);
          if (block) {
            totalTransactions += block.transactions.length;
            
            if (block.timestamp && blockTimes.length > 0) {
              const prevBlock = await this.provider.provider.getBlock(i - step);
              if (prevBlock) {
                blockTimes.push(block.timestamp - prevBlock.timestamp);
              }
            }

            // Count unique addresses
            block.transactions.forEach(tx => {
              if (typeof tx === 'object') {
                addresses.add(tx.from);
                if (tx.to) addresses.add(tx.to);
              }
            });
          }
        } catch (blockError) {
          // Skip blocks that can't be retrieved
          continue;
        }
      }

      const averageBlockTime = blockTimes.length > 0 
        ? blockTimes.reduce((a, b) => a + b, 0) / blockTimes.length 
        : 0;

      return {
        totalTransactions,
        averageBlockTime,
        activeAddresses: addresses.size
      };
    } catch (error) {
      throw new BlockchainError(`Failed to get blockchain analytics: ${error}`);
    }
  }

  /**
   * Get gas price recommendations
   */
  async getGasPriceRecommendations(): Promise<{ slow: string; standard: string; fast: string }> {
    try {
      const feeData = await this.provider.provider.getFeeData();
      
      // For STABILITY blockchain, gas prices are 0
      return {
        slow: '0',
        standard: '0',
        fast: '0'
      };
    } catch (error) {
      throw new BlockchainError(`Failed to get gas price recommendations: ${error}`);
    }
  }

  /**
   * Search for transactions by various criteria
   */
  async searchTransactions(criteria: {
    address?: string;
    fromBlock?: number;
    toBlock?: number;
    value?: string;
    limit?: number;
  }): Promise<TransactionDetails[]> {
    try {
      const transactions: TransactionDetails[] = [];
      const latestBlock = await this.provider.provider.getBlockNumber();
      const fromBlock = criteria.fromBlock || Math.max(0, latestBlock - 100);
      const toBlock = criteria.toBlock || latestBlock;
      const limit = criteria.limit || 50;

      for (let blockNum = toBlock; blockNum >= fromBlock && transactions.length < limit; blockNum--) {
        try {
          const block = await this.provider.provider.getBlock(blockNum, true);
          if (!block?.transactions) continue;

          for (const tx of block.transactions) {
            if (typeof tx === 'object') {
              let matches = true;

              if (criteria.address) {
                matches = matches && (
                  tx.from.toLowerCase() === criteria.address.toLowerCase() ||
                  tx.to?.toLowerCase() === criteria.address.toLowerCase()
                );
              }

              if (criteria.value) {
                matches = matches && formatEther(tx.value) === criteria.value;
              }

              if (matches) {
                const txDetails = await this.provider.getTransactionDetails(tx.hash);
                transactions.push(txDetails);

                if (transactions.length >= limit) break;
              }
            }
          }
        } catch (blockError) {
          // Skip blocks that can't be retrieved
          continue;
        }
      }

      return transactions;
    } catch (error) {
      throw new BlockchainError(`Failed to search transactions: ${error}`);
    }
  }

  /**
   * Monitor address for new transactions
   */
  async monitorAddress(address: string, callback: (tx: TransactionDetails) => void): Promise<void> {
    try {
      // Set up a simple polling mechanism
      let lastCheckedBlock = await this.provider.provider.getBlockNumber();
      
      const checkForNewTransactions = async () => {
        try {
          const currentBlock = await this.provider.provider.getBlockNumber();
          
          if (currentBlock > lastCheckedBlock) {
            for (let blockNum = lastCheckedBlock + 1; blockNum <= currentBlock; blockNum++) {
              const block = await this.provider.provider.getBlock(blockNum, true);
              if (block?.transactions) {
                for (const tx of block.transactions) {
                  if (typeof tx === 'object' && 
                      (tx.from.toLowerCase() === address.toLowerCase() || 
                       tx.to?.toLowerCase() === address.toLowerCase())) {
                    const txDetails = await this.provider.getTransactionDetails(tx.hash);
                    callback(txDetails);
                  }
                }
              }
            }
            lastCheckedBlock = currentBlock;
          }
        } catch (error) {
          console.error('Error monitoring address:', error);
        }
      };

      // Check every 15 seconds
      setInterval(checkForNewTransactions, 15000);
    } catch (error) {
      throw new BlockchainError(`Failed to monitor address: ${error}`);
    }
  }

  /**
   * Basic hex to string decoder for contract calls
   */
  private decodeString(hexData: string): string {
    try {
      // Remove 0x prefix
      const hex = hexData.startsWith('0x') ? hexData.slice(2) : hexData;
      
      // Skip the first 64 characters (offset and length) and decode the string
      const stringHex = hex.slice(128);
      let result = '';
      
      for (let i = 0; i < stringHex.length; i += 2) {
        const byte = parseInt(stringHex.substr(i, 2), 16);
        if (byte !== 0) {
          result += String.fromCharCode(byte);
        }
      }
      
      return result;
    } catch {
      return 'Unknown';
    }
  }
}