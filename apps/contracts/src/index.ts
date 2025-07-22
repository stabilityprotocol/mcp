import { z } from 'zod';
import { ethers } from 'ethers';
import { IMCPTool, ReturnTypeStructuredContent } from '@stability-mcp/types';
import { env } from '@stability-mcp/utils';
import ContractCompiler from './compiler.js';

const getProvider = (apiKey?: string) => {
  const key = apiKey || env('STABILITY_API_KEY');
  const rpcUrl = `https://rpc.stabilityprotocol.com/zgt/${key}`;
  return new ethers.JsonRpcProvider(rpcUrl);
};

const compiler = ContractCompiler.getInstance();

export const deployERC20Schema = z.object({
  name: z.string().describe('Token name'),
  symbol: z.string().describe('Token symbol'),
  initialSupply: z
    .string()
    .describe('Initial supply in tokens (will be converted to wei)'),
  decimals: z
    .number()
    .optional()
    .default(18)
    .describe('Number of decimals for the token'),
  privateKey: z.string().describe('Private key of the deploying wallet'),
  apiKey: z
    .string()
    .describe(
      'STABILITY API Key, get one from https://portal.stabilityprotocol.com'
    ),
});

export const deployERC20Tool: IMCPTool<
  typeof deployERC20Schema,
  ReturnTypeStructuredContent
> = {
  name: 'deploy_erc20',
  description: 'Deploy an ERC20 token contract',
  inputSchema: deployERC20Schema,
  handler: async (args) => {
    const {
      name,
      symbol,
      initialSupply,
      decimals = 18,
      privateKey,
      apiKey,
    } = args;
    const provider = getProvider(apiKey);

    const wallet = new ethers.Wallet(privateKey, provider);

    // Get compiled contract
    const compiled = await compiler.getERC20();

    const contractFactory = new ethers.ContractFactory(
      compiled.abi,
      compiled.bytecode,
      wallet
    );

    const deployTx = await contractFactory.deploy(
      name,
      symbol,
      initialSupply,
      decimals,
      {
        maxFeePerGas: 0,
        maxPriorityFeePerGas: 0,
      }
    );

    const receipt = await deployTx.waitForDeployment();
    const contractAddress = await deployTx.getAddress();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            contractAddress,
            transactionHash: deployTx.deploymentTransaction()?.hash,
            name,
            symbol,
            initialSupply,
            decimals,
            deployer: wallet.address,
          }),
        },
      ],
      structuredContent: {
        contractAddress,
        transactionHash: deployTx.deploymentTransaction()?.hash,
        name,
        symbol,
        initialSupply,
        decimals,
        deployer: wallet.address,
      },
    };
  },
  outputSchema: z.object({
    contractAddress: z.string(),
    transactionHash: z.string().optional(),
    name: z.string(),
    symbol: z.string(),
    initialSupply: z.string(),
    decimals: z.number(),
    deployer: z.string(),
  }),
};

export const deployERC721Schema = z.object({
  name: z.string().describe('NFT collection name'),
  symbol: z.string().describe('NFT collection symbol'),
  baseTokenURI: z
    .string()
    .optional()
    .default('')
    .describe('Base URI for token metadata'),
  privateKey: z.string().describe('Private key of the deploying wallet'),
  apiKey: z
    .string()
    .describe(
      'STABILITY API Key, get one from https://portal.stabilityprotocol.com'
    ),
});

export const deployERC721Tool: IMCPTool<
  typeof deployERC721Schema,
  ReturnTypeStructuredContent
> = {
  name: 'deploy_erc721',
  description: 'Deploy an ERC721 NFT contract',
  inputSchema: deployERC721Schema,
  handler: async (args) => {
    const { name, symbol, baseTokenURI = '', privateKey, apiKey } = args;
    const provider = getProvider(apiKey);

    const wallet = new ethers.Wallet(privateKey, provider);

    // Get compiled contract
    const compiled = await compiler.getERC721();

    const contractFactory = new ethers.ContractFactory(
      compiled.abi,
      compiled.bytecode,
      wallet
    );

    const deployTx = await contractFactory.deploy(name, symbol, baseTokenURI, {
      maxFeePerGas: 0,
      maxPriorityFeePerGas: 0,
    });

    const receipt = await deployTx.waitForDeployment();
    const contractAddress = await deployTx.getAddress();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            contractAddress,
            transactionHash: deployTx.deploymentTransaction()?.hash,
            name,
            symbol,
            baseTokenURI,
            deployer: wallet.address,
          }),
        },
      ],
      structuredContent: {
        contractAddress,
        transactionHash: deployTx.deploymentTransaction()?.hash,
        name,
        symbol,
        baseTokenURI,
        deployer: wallet.address,
      },
    };
  },
  outputSchema: z.object({
    contractAddress: z.string(),
    transactionHash: z.string().optional(),
    name: z.string(),
    symbol: z.string(),
    baseTokenURI: z.string(),
    deployer: z.string(),
  }),
};

export const deployERC1155Schema = z.object({
  uri: z.string().describe('Base URI for token metadata'),
  privateKey: z.string().describe('Private key of the deploying wallet'),
  apiKey: z
    .string()
    .describe(
      'STABILITY API Key, get one from https://portal.stabilityprotocol.com'
    ),
});

export const deployERC1155Tool: IMCPTool<
  typeof deployERC1155Schema,
  ReturnTypeStructuredContent
> = {
  name: 'deploy_erc1155',
  description: 'Deploy an ERC1155 multi-token contract',
  inputSchema: deployERC1155Schema,
  handler: async (args) => {
    const { uri, privateKey, apiKey } = args;
    const provider = getProvider(apiKey);

    const wallet = new ethers.Wallet(privateKey, provider);

    // Get compiled contract
    const compiled = await compiler.getERC1155();

    const contractFactory = new ethers.ContractFactory(
      compiled.abi,
      compiled.bytecode,
      wallet
    );

    const deployTx = await contractFactory.deploy(uri, {
      maxFeePerGas: 0,
      maxPriorityFeePerGas: 0,
    });

    const receipt = await deployTx.waitForDeployment();
    const contractAddress = await deployTx.getAddress();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            contractAddress,
            transactionHash: deployTx.deploymentTransaction()?.hash,
            uri,
            deployer: wallet.address,
          }),
        },
      ],
      structuredContent: {
        contractAddress,
        transactionHash: deployTx.deploymentTransaction()?.hash,
        uri,
        deployer: wallet.address,
      },
    };
  },
  outputSchema: z.object({
    contractAddress: z.string(),
    transactionHash: z.string().optional(),
    uri: z.string(),
    deployer: z.string(),
  }),
};

export const deployCustomContractSchema = z.object({
  bytecode: z.string().describe('Contract bytecode in hex format'),
  abi: z
    .array(z.string())
    .describe('Contract ABI as array of function signatures'),
  constructorArgs: z
    .array(z.any())
    .optional()
    .describe('Constructor arguments'),
  walletAddress: z.string().describe('Wallet address to deploy from'),
  privateKey: z.string().describe('Private key of the deploying wallet'),
  apiKey: z
    .string()
    .describe(
      'STABILITY API Key, get one from https://portal.stabilityprotocol.com'
    ),
});

export const deployCustomContractTool: IMCPTool<
  typeof deployCustomContractSchema,
  ReturnTypeStructuredContent
> = {
  name: 'deploy_custom_contract',
  description: 'Deploy a custom smart contract',
  inputSchema: deployCustomContractSchema,
  handler: async (args) => {
    const {
      bytecode,
      abi,
      constructorArgs = [],
      walletAddress,
      privateKey,
      apiKey,
    } = args;
    const provider = getProvider(apiKey);

    const wallet = new ethers.Wallet(privateKey, provider);

    const contractFactory = new ethers.ContractFactory(abi, bytecode, wallet);

    const deployTx = await contractFactory.deploy(...constructorArgs, {
      maxFeePerGas: 0,
      maxPriorityFeePerGas: 0,
    });

    const receipt = await deployTx.waitForDeployment();
    const contractAddress = await deployTx.getAddress();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            contractAddress,
            transactionHash: deployTx.deploymentTransaction()?.hash,
            deployer: walletAddress,
            constructorArgs,
          }),
        },
      ],
      structuredContent: {
        contractAddress,
        transactionHash: deployTx.deploymentTransaction()?.hash,
        deployer: walletAddress,
        constructorArgs,
      },
    };
  },
  outputSchema: z.object({
    contractAddress: z.string(),
    transactionHash: z.string().optional(),
    deployer: z.string(),
    constructorArgs: z.array(z.any()),
  }),
};

export default [
  deployERC20Tool,
  deployERC721Tool,
  deployERC1155Tool,
  deployCustomContractTool,
];
