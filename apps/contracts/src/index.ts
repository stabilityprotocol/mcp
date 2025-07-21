import { z } from 'zod';
import { ethers } from 'ethers';
import { IMCPTool, ReturnTypeStructuredContent } from '@stability-mcp/types';
import { env } from '@stability-mcp/utils';

const getProvider = () => {
  const apiKey = env('STABILITY_API_KEY');
  const rpcUrl = `https://rpc.stabilityprotocol.com/zgt/${apiKey}`;
  return new ethers.JsonRpcProvider(rpcUrl);
};

// Standard ERC20 contract bytecode and ABI (simplified version)
const ERC20_BYTECODE =
  '0x608060405234801561001057600080fd5b5060405161064d38038061064d8339818101604052604081101561003357600080fd5b81019080805160405193929190846401000000008211156100535760...';
const ERC20_ABI = [
  'constructor(string memory name, string memory symbol, uint256 initialSupply)',
  'function name() public view returns (string)',
  'function symbol() public view returns (string)',
  'function decimals() public view returns (uint8)',
  'function totalSupply() public view returns (uint256)',
  'function balanceOf(address account) public view returns (uint256)',
  'function transfer(address to, uint256 amount) public returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
];

// Standard ERC721 contract bytecode and ABI (simplified version)
const ERC721_BYTECODE =
  '0x608060405234801561001057600080fd5b5060405161082d38038061082d8339818101604052604081101561003357600080fd5b81019080805160405193929190846401000000008211156100535760...';
const ERC721_ABI = [
  'constructor(string memory name, string memory symbol)',
  'function name() public view returns (string)',
  'function symbol() public view returns (string)',
  'function tokenURI(uint256 tokenId) public view returns (string)',
  'function ownerOf(uint256 tokenId) public view returns (address)',
  'function balanceOf(address owner) public view returns (uint256)',
  'function mint(address to, uint256 tokenId) public',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
];

// Standard ERC1155 contract bytecode and ABI (simplified version)
const ERC1155_BYTECODE =
  '0x608060405234801561001057600080fd5b5060405161064d38038061064d8339818101604052604081101561003357600080fd5b81019080805160405193929190846401000000008211156100535760...';
const ERC1155_ABI = [
  'constructor(string memory uri)',
  'function uri(uint256) public view returns (string)',
  'function balanceOf(address account, uint256 id) public view returns (uint256)',
  'function balanceOfBatch(address[] accounts, uint256[] ids) public view returns (uint256[])',
  'function mint(address to, uint256 id, uint256 amount, bytes data) public',
  'event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)',
];

export const deployERC20Schema = z.object({
  name: z.string().describe('Token name'),
  symbol: z.string().describe('Token symbol'),
  initialSupply: z
    .string()
    .describe('Initial supply in tokens (will be converted to wei)'),
  privateKey: z.string().describe('Private key of the deploying wallet'),
});

export const deployERC20Tool: IMCPTool<
  typeof deployERC20Schema,
  ReturnTypeStructuredContent
> = {
  name: 'deploy_erc20',
  description: 'Deploy an ERC20 token contract',
  inputSchema: deployERC20Schema,
  handler: async (args) => {
    const { name, symbol, initialSupply, privateKey } = args;
    const provider = getProvider();

    const wallet = new ethers.Wallet(privateKey, provider);

    // Convert initial supply to wei (assuming 18 decimals)
    const initialSupplyWei = ethers.parseUnits(initialSupply, 18);

    const contractFactory = new ethers.ContractFactory(
      ERC20_ABI,
      ERC20_BYTECODE,
      wallet
    );

    const deployTx = await contractFactory.deploy(
      name,
      symbol,
      initialSupplyWei,
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
    deployer: z.string(),
  }),
};

export const deployERC721Schema = z.object({
  name: z.string().describe('NFT collection name'),
  symbol: z.string().describe('NFT collection symbol'),
  privateKey: z.string().describe('Private key of the deploying wallet'),
});

export const deployERC721Tool: IMCPTool<
  typeof deployERC721Schema,
  ReturnTypeStructuredContent
> = {
  name: 'deploy_erc721',
  description: 'Deploy an ERC721 NFT contract',
  inputSchema: deployERC721Schema,
  handler: async (args) => {
    const { name, symbol, privateKey } = args;
    const provider = getProvider();

    const wallet = new ethers.Wallet(privateKey, provider);

    const contractFactory = new ethers.ContractFactory(
      ERC721_ABI,
      ERC721_BYTECODE,
      wallet
    );

    const deployTx = await contractFactory.deploy(name, symbol, {
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
            deployer: wallet.address,
          }),
        },
      ],
      structuredContent: {
        contractAddress,
        transactionHash: deployTx.deploymentTransaction()?.hash,
        name,
        symbol,
        deployer: wallet.address,
      },
    };
  },
  outputSchema: z.object({
    contractAddress: z.string(),
    transactionHash: z.string().optional(),
    name: z.string(),
    symbol: z.string(),
    deployer: z.string(),
  }),
};

export const deployERC1155Schema = z.object({
  uri: z.string().describe('Base URI for token metadata'),
  privateKey: z.string().describe('Private key of the deploying wallet'),
});

export const deployERC1155Tool: IMCPTool<
  typeof deployERC1155Schema,
  ReturnTypeStructuredContent
> = {
  name: 'deploy_erc1155',
  description: 'Deploy an ERC1155 multi-token contract',
  inputSchema: deployERC1155Schema,
  handler: async (args) => {
    const { uri, privateKey } = args;
    const provider = getProvider();

    const wallet = new ethers.Wallet(privateKey, provider);

    const contractFactory = new ethers.ContractFactory(
      ERC1155_ABI,
      ERC1155_BYTECODE,
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
    } = args;
    const provider = getProvider();

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
