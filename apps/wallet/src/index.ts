import { z } from 'zod';
import { ethers } from 'ethers';
import { IMCPTool, ReturnTypeStructuredContent } from '@stability-mcp/types';

const getProvider = (apiKey?: string) => {
  const rpcUrl = `https://rpc.stabilityprotocol.com/zgt/${apiKey ?? ''}`;
  return new ethers.JsonRpcProvider(rpcUrl);
};

export const createWalletSchema = z.object({});

export const createWalletTool: IMCPTool<
  typeof createWalletSchema,
  ReturnTypeStructuredContent
> = {
  name: 'create_wallet',
  description: 'Create a new random wallet',
  inputSchema: createWalletSchema,
  handler: async (args) => {
    const wallet = ethers.Wallet.createRandom();
    const address = wallet.address;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            address,
            mnemonic: wallet.mnemonic?.phrase,
            privateKey: wallet.privateKey,
          }),
        },
      ],
      structuredContent: {
        address,
        mnemonic: wallet.mnemonic?.phrase,
        privateKey: wallet.privateKey,
      },
    };
  },
  outputSchema: z.object({
    address: z.string(),
    mnemonic: z.string().optional(),
    privateKey: z.string(),
  }),
};

export const getBalanceSchema = z.object({
  address: z.string().describe('Wallet address to get balance for'),
});

export const getBalanceTool: IMCPTool<
  typeof getBalanceSchema,
  ReturnTypeStructuredContent
> = {
  name: 'get_balance',
  description: 'Get the balance of a wallet',
  inputSchema: getBalanceSchema,
  handler: async (args) => {
    const { address } = args;
    const provider = getProvider();

    const balanceWei = await provider.getBalance(address);
    const balanceEth = ethers.formatEther(balanceWei);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            address,
            balance: balanceEth,
            balanceWei: balanceWei.toString(),
          }),
        },
      ],
      structuredContent: {
        address,
        balance: balanceEth,
        balanceWei: balanceWei.toString(),
      },
    };
  },
  outputSchema: z.object({
    address: z.string(),
    balance: z.string(),
    balanceWei: z.string(),
  }),
};

export const getTransactionHistorySchema = z.object({
  address: z.string().describe('Wallet address to get transaction history for'),
  fromBlock: z.number().optional().describe('Starting block number'),
  toBlock: z.number().optional().describe('Ending block number'),
});

export const getTransactionHistoryTool: IMCPTool<
  typeof getTransactionHistorySchema,
  ReturnTypeStructuredContent
> = {
  name: 'get_transaction_history',
  description: 'Get transaction history for a wallet',
  inputSchema: getTransactionHistorySchema,
  handler: async (args) => {
    const { address, fromBlock = 0, toBlock } = args;
    const provider = getProvider();

    try {
      // Get latest block if toBlock not specified
      const latestBlock = toBlock || (await provider.getBlockNumber());

      // For demonstration, we'll check the last 10 blocks for better performance
      const startBlock = Math.max(latestBlock - 10, fromBlock);
      const transactions: any[] = [];

      for (
        let blockNumber = startBlock;
        blockNumber <= latestBlock;
        blockNumber++
      ) {
        try {
          const block = await provider.getBlock(blockNumber, true);
          if (block?.transactions) {
            for (const tx of block.transactions) {
              if (tx && typeof tx === 'object' && 'from' in tx && 'to' in tx) {
                const transaction = tx as any;
                if (
                  transaction.from === address ||
                  transaction.to === address
                ) {
                  transactions.push({
                    hash: transaction.hash || '',
                    from: transaction.from || '',
                    to: transaction.to || null,
                    value: ethers.formatEther(transaction.value || 0),
                    blockNumber: transaction.blockNumber || null,
                    timestamp: block.timestamp,
                  });
                }
              }
            }
          }
        } catch (error) {
          // Skip blocks that can't be fetched
          continue;
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              address,
              transactions,
              count: transactions.length,
            }),
          },
        ],
        structuredContent: {
          address,
          transactions,
          count: transactions.length,
        },
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              address,
              transactions: [],
              count: 0,
              error: 'Failed to fetch transaction history',
            }),
          },
        ],
        structuredContent: {
          address,
          transactions: [],
          count: 0,
          error: 'Failed to fetch transaction history',
        },
      };
    }
  },
  outputSchema: z.object({
    address: z.string(),
    transactions: z.array(
      z.object({
        hash: z.string(),
        from: z.string().nullable(),
        to: z.string().nullable(),
        value: z.string(),
        blockNumber: z.number().nullable(),
        timestamp: z.number(),
      })
    ),
    count: z.number(),
  }),
};

export default [createWalletTool, getBalanceTool, getTransactionHistoryTool];
