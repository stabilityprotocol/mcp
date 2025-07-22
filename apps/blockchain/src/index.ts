import { z } from 'zod';
import { ethers } from 'ethers';
import { IMCPTool, ReturnTypeStructuredContent } from '@stability-mcp/types';

const getProvider = (apiKey?: string) => {
  const rpcUrl = `https://rpc.stabilityprotocol.com/zgt/${apiKey ?? ''}`;
  return new ethers.JsonRpcProvider(rpcUrl);
};

export const sendTransactionSchema = z.object({
  apiKey: z
    .string()
    .describe(
      'STABILITY API Key, get one from https://portal.stabilityprotocol.com'
    ),
  to: z.string().describe('Recipient address'),
  value: z.string().describe('Amount to send in ETH'),
  data: z.string().optional().describe('Transaction data (optional)'),
  privateKey: z.string().describe('Private key of the sending wallet'),
});

export const sendTransactionTool: IMCPTool<
  typeof sendTransactionSchema,
  ReturnTypeStructuredContent
> = {
  name: 'send_transaction',
  description: 'Send a transaction on the STABILITY blockchain',
  inputSchema: sendTransactionSchema,
  handler: async (args) => {
    const { apiKey, to, value, data, privateKey } = args;
    const provider = getProvider(apiKey);

    const wallet = new ethers.Wallet(privateKey, provider);

    const valueWei = ethers.parseEther(value);

    const transaction = {
      to,
      value: valueWei,
      data: data || '0x',
      maxFeePerGas: 0,
      maxPriorityFeePerGas: 0,
    };

    const txResponse = await wallet.sendTransaction(transaction);
    const receipt = await txResponse.wait();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            transactionHash: txResponse.hash,
            from: wallet.address,
            to,
            value,
            status: receipt?.status === 1 ? 'success' : 'failed',
            blockNumber: receipt?.blockNumber,
            gasUsed: receipt?.gasUsed?.toString(),
          }),
        },
      ],
      structuredContent: {
        transactionHash: txResponse.hash,
        from: wallet.address,
        to,
        value,
        status: receipt?.status === 1 ? 'success' : 'failed',
        blockNumber: receipt?.blockNumber,
        gasUsed: receipt?.gasUsed?.toString(),
      },
    };
  },
  outputSchema: z.object({
    transactionHash: z.string(),
    from: z.string(),
    to: z.string(),
    value: z.string(),
    status: z.string(),
    blockNumber: z.number().optional(),
    gasUsed: z.string().optional(),
  }),
};

export const getTransactionSchema = z.object({
  apiKey: z.string().optional().describe('STABILITY API Key (optional)'),
  transactionHash: z.string().describe('Transaction hash to query'),
});

export const getTransactionTool: IMCPTool<
  typeof getTransactionSchema,
  ReturnTypeStructuredContent
> = {
  name: 'get_transaction',
  description: 'Get transaction details by hash',
  inputSchema: getTransactionSchema,
  handler: async (args) => {
    const { apiKey, transactionHash } = args;
    const provider = getProvider(apiKey);

    const [transaction, receipt] = await Promise.all([
      provider.getTransaction(transactionHash),
      provider.getTransactionReceipt(transactionHash),
    ]);

    if (!transaction) {
      throw new Error(`Transaction ${transactionHash} not found`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            hash: transaction.hash,
            from: transaction.from,
            to: transaction.to,
            value: ethers.formatEther(transaction.value),
            gasLimit: transaction.gasLimit?.toString(),
            gasPrice: transaction.gasPrice?.toString(),
            blockNumber: transaction.blockNumber,
            status:
              receipt?.status === 1
                ? 'success'
                : receipt?.status === 0
                  ? 'failed'
                  : 'pending',
            gasUsed: receipt?.gasUsed?.toString(),
          }),
        },
      ],
      structuredContent: {
        hash: transaction.hash,
        from: transaction.from,
        to: transaction.to,
        value: ethers.formatEther(transaction.value),
        gasLimit: transaction.gasLimit?.toString(),
        gasPrice: transaction.gasPrice?.toString(),
        blockNumber: transaction.blockNumber,
        status:
          receipt?.status === 1
            ? 'success'
            : receipt?.status === 0
              ? 'failed'
              : 'pending',
        gasUsed: receipt?.gasUsed?.toString(),
      },
    };
  },
  outputSchema: z.object({
    hash: z.string(),
    from: z.string().nullable(),
    to: z.string().nullable(),
    value: z.string(),
    gasLimit: z.string().optional(),
    gasPrice: z.string().optional(),
    blockNumber: z.number().nullable(),
    status: z.string(),
    gasUsed: z.string().optional(),
  }),
};

export const getBlockSchema = z.object({
  apiKey: z.string().optional().describe('STABILITY API Key (optional)'),
  blockNumber: z.number().describe('Block number to query'),
  includeTransactions: z
    .boolean()
    .optional()
    .describe('Include transaction details'),
});

export const getBlockTool: IMCPTool<
  typeof getBlockSchema,
  ReturnTypeStructuredContent
> = {
  name: 'get_block',
  description: 'Get block information by block number',
  inputSchema: getBlockSchema,
  handler: async (args) => {
    const { apiKey, blockNumber, includeTransactions = false } = args;
    const provider = getProvider(apiKey);

    const block = await provider.getBlock(blockNumber, includeTransactions);

    if (!block) {
      throw new Error(`Block ${blockNumber} not found`);
    }

    const blockData = {
      number: block.number,
      hash: block.hash,
      parentHash: block.parentHash,
      timestamp: block.timestamp,
      gasLimit: block.gasLimit?.toString(),
      gasUsed: block.gasUsed?.toString(),
      transactionCount: block.transactions.length,
      transactions: includeTransactions
        ? block.transactions.map((tx: any) =>
            typeof tx === 'string'
              ? tx
              : {
                  hash: tx?.hash || '',
                  from: tx?.from || '',
                  to: tx?.to || '',
                  value: tx?.value ? ethers.formatEther(tx.value) : '0',
                }
          )
        : block.transactions,
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(blockData),
        },
      ],
      structuredContent: blockData,
    };
  },
  outputSchema: z.object({
    number: z.number(),
    hash: z.string().nullable(),
    parentHash: z.string().nullable(),
    timestamp: z.number(),
    gasLimit: z.string().optional(),
    gasUsed: z.string().optional(),
    transactionCount: z.number(),
    transactions: z.array(z.any()),
  }),
};

export const readContractSchema = z.object({
  apiKey: z.string().optional().describe('STABILITY API Key (optional)'),
  contractAddress: z.string().describe('Contract address to read from'),
  abi: z.array(z.string()).describe('Contract ABI'),
  functionName: z.string().describe('Function name to call'),
  args: z.array(z.any()).optional().describe('Function arguments'),
});

export const readContractTool: IMCPTool<
  typeof readContractSchema,
  ReturnTypeStructuredContent
> = {
  name: 'read_contract',
  description: 'Read data from a smart contract',
  inputSchema: readContractSchema,
  handler: async (args) => {
    const {
      apiKey,
      contractAddress,
      abi,
      functionName,
      args: functionArgs = [],
    } = args;
    const provider = getProvider(apiKey);

    const contract = new ethers.Contract(contractAddress, abi, provider);

    const result = await contract[functionName](...functionArgs);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            contractAddress,
            functionName,
            args: functionArgs,
            result: result.toString(),
          }),
        },
      ],
      structuredContent: {
        contractAddress,
        functionName,
        args: functionArgs,
        result: result.toString(),
      },
    };
  },
  outputSchema: z.object({
    contractAddress: z.string(),
    functionName: z.string(),
    args: z.array(z.any()),
    result: z.string(),
  }),
};

export const writeContractSchema = z.object({
  apiKey: z
    .string()
    .describe(
      'STABILITY API Key, get one from https://portal.stabilityprotocol.com'
    ),
  contractAddress: z.string().describe('Contract address to write to'),
  abi: z.array(z.string()).describe('Contract ABI'),
  functionName: z.string().describe('Function name to call'),
  args: z.array(z.any()).optional().describe('Function arguments'),
  privateKey: z.string().describe('Private key of the calling wallet'),
  value: z.string().optional().describe('ETH value to send with transaction'),
});

export const writeContractTool: IMCPTool<
  typeof writeContractSchema,
  ReturnTypeStructuredContent
> = {
  name: 'write_contract',
  description: 'Write data to a smart contract',
  inputSchema: writeContractSchema,
  handler: async (args) => {
    const {
      apiKey,
      contractAddress,
      abi,
      functionName,
      args: functionArgs = [],
      privateKey,
      value,
    } = args;
    const provider = getProvider(apiKey);

    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contractAddress, abi, wallet);

    const txOptions = {
      maxFeePerGas: 0,
      maxPriorityFeePerGas: 0,
      ...(value && { value: ethers.parseEther(value) }),
    };

    const txResponse = await contract[functionName](...functionArgs, txOptions);
    const receipt = await txResponse.wait();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            contractAddress,
            functionName,
            args: functionArgs,
            transactionHash: txResponse.hash,
            status: receipt?.status === 1 ? 'success' : 'failed',
            blockNumber: receipt?.blockNumber,
            gasUsed: receipt?.gasUsed?.toString(),
          }),
        },
      ],
      structuredContent: {
        contractAddress,
        functionName,
        args: functionArgs,
        transactionHash: txResponse.hash,
        status: receipt?.status === 1 ? 'success' : 'failed',
        blockNumber: receipt?.blockNumber,
        gasUsed: receipt?.gasUsed?.toString(),
      },
    };
  },
  outputSchema: z.object({
    contractAddress: z.string(),
    functionName: z.string(),
    args: z.array(z.any()),
    transactionHash: z.string(),
    status: z.string(),
    blockNumber: z.number().optional(),
    gasUsed: z.string().optional(),
  }),
};

export const getLatestBlockSchema = z.object({
  apiKey: z.string().optional().describe('STABILITY API Key (optional)'),
});

export const getLatestBlockTool: IMCPTool<
  typeof getLatestBlockSchema,
  ReturnTypeStructuredContent
> = {
  name: 'get_latest_block',
  description: 'Get the latest block number and information',
  inputSchema: getLatestBlockSchema,
  handler: async (args) => {
    const { apiKey } = args;
    const provider = getProvider(apiKey);

    const blockNumber = await provider.getBlockNumber();
    const block = await provider.getBlock(blockNumber);

    if (!block) {
      throw new Error('Could not fetch latest block');
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            number: block.number,
            hash: block.hash,
            timestamp: block.timestamp,
            transactionCount: block.transactions.length,
            gasLimit: block.gasLimit?.toString(),
            gasUsed: block.gasUsed?.toString(),
          }),
        },
      ],
      structuredContent: {
        number: block.number,
        hash: block.hash,
        timestamp: block.timestamp,
        transactionCount: block.transactions.length,
        gasLimit: block.gasLimit?.toString(),
        gasUsed: block.gasUsed?.toString(),
      },
    };
  },
  outputSchema: z.object({
    number: z.number(),
    hash: z.string().nullable(),
    timestamp: z.number(),
    transactionCount: z.number(),
    gasLimit: z.string().optional(),
    gasUsed: z.string().optional(),
  }),
};

export default [
  sendTransactionTool,
  getTransactionTool,
  getBlockTool,
  readContractTool,
  writeContractTool,
  getLatestBlockTool,
];
