import { Contract, ContractFactory, Interface } from 'ethers';
import { randomUUID } from 'crypto';
import { StabilityProvider, ContractError, ContractType } from '@stability-mcp/core';
import { WalletManager } from '@stability-mcp/wallet';
import { ContractTemplates } from './contract-templates';
import { 
  ContractDeploymentOptions, 
  DeployedContract, 
  ContractCall, 
  ContractQuery 
} from './types';

export class ContractManager {
  private provider: StabilityProvider;
  private deployedContracts: Map<string, DeployedContract> = new Map();

  constructor(provider: StabilityProvider) {
    this.provider = provider;
  }

  /**
   * Deploy a smart contract
   */
  async deployContract(options: ContractDeploymentOptions, walletManager: WalletManager): Promise<DeployedContract> {
    try {
      const wallet = await walletManager.getEthersWallet(options.walletId);
      const connectedWallet = wallet.connect(this.provider.provider);
      
      let abi: any[];
      let bytecode: string;
      let constructorParams: any[] = [];

      if (options.contractType === ContractType.CUSTOM) {
        if (!options.customAbi || !options.customBytecode) {
          throw new ContractError('Custom contracts require both ABI and bytecode');
        }
        abi = options.customAbi;
        bytecode = options.customBytecode;
        constructorParams = options.parameters || [];
      } else {
        const template = ContractTemplates.getTemplate(options.contractType);
        if (!template) {
          throw new ContractError(`Unsupported contract type: ${options.contractType}`);
        }
        
        abi = template.abi;
        bytecode = template.bytecode;
        constructorParams = this.prepareConstructorParams(options);
      }

      // Create contract factory
      const contractFactory = new ContractFactory(abi, bytecode, connectedWallet);
      
      // Deploy with STABILITY-specific transaction settings
      const contract = await contractFactory.deploy(...constructorParams, {
        maxFeePerGas: 0,
        maxPriorityFeePerGas: 0
      });
      
      // Wait for deployment
      await contract.waitForDeployment();
      const receipt = await contract.deploymentTransaction()?.wait();
      
      if (!receipt) {
        throw new ContractError('Failed to get deployment receipt');
      }

      const deployedContract: DeployedContract = {
        id: randomUUID(),
        name: this.getContractName(options),
        type: options.contractType,
        address: await contract.getAddress(),
        txHash: receipt.hash,
        deployedAt: new Date(),
        deployerWallet: options.walletId,
        abi,
        parameters: constructorParams
      };

      this.deployedContracts.set(deployedContract.id, deployedContract);
      
      return deployedContract;
    } catch (error) {
      throw new ContractError(`Failed to deploy contract: ${error}`);
    }
  }

  /**
   * Call a contract function
   */
  async callContractFunction(
    call: ContractCall, 
    walletId: string, 
    walletManager: WalletManager
  ): Promise<any> {
    try {
      const wallet = await walletManager.getEthersWallet(walletId);
      const connectedWallet = wallet.connect(this.provider.provider);
      
      // Find deployed contract info
      const deployedContract = Array.from(this.deployedContracts.values())
        .find(c => c.address.toLowerCase() === call.contractAddress.toLowerCase());
      
      if (!deployedContract) {
        throw new ContractError(`Contract not found: ${call.contractAddress}`);
      }

      const contract = new Contract(call.contractAddress, deployedContract.abi, connectedWallet);
      
      // Prepare transaction
      const transaction: any = {
        maxFeePerGas: 0,
        maxPriorityFeePerGas: 0
      };
      
      if (call.value) {
        transaction.value = call.value;
      }

      // Call the function
      const result = await contract[call.functionName](...call.parameters, transaction);
      
      // If it's a transaction, wait for confirmation
      if (result.hash) {
        await result.wait();
      }
      
      return result;
    } catch (error) {
      throw new ContractError(`Failed to call contract function: ${error}`);
    }
  }

  /**
   * Query a contract (read-only)
   */
  async queryContract(query: ContractQuery): Promise<any> {
    try {
      // Find deployed contract info
      const deployedContract = Array.from(this.deployedContracts.values())
        .find(c => c.address.toLowerCase() === query.contractAddress.toLowerCase());
      
      if (!deployedContract) {
        throw new ContractError(`Contract not found: ${query.contractAddress}`);
      }

      const contract = new Contract(query.contractAddress, deployedContract.abi, this.provider.provider);
      
      // Call the read-only function
      return await contract[query.functionName](...(query.parameters || []));
    } catch (error) {
      throw new ContractError(`Failed to query contract: ${error}`);
    }
  }

  /**
   * Get contract information
   */
  getContract(contractId: string): DeployedContract | undefined {
    return this.deployedContracts.get(contractId);
  }

  /**
   * List all deployed contracts
   */
  listContracts(): DeployedContract[] {
    return Array.from(this.deployedContracts.values());
  }

  /**
   * Get contracts by type
   */
  getContractsByType(type: ContractType): DeployedContract[] {
    return Array.from(this.deployedContracts.values()).filter(c => c.type === type);
  }

  /**
   * Get available contract templates
   */
  getAvailableTemplates(): { [key: string]: any } {
    return {
      [ContractType.ERC20]: ContractTemplates.getERC20Template(),
      [ContractType.ERC721]: ContractTemplates.getERC721Template(),
      [ContractType.ERC1155]: ContractTemplates.getERC1155Template()
    };
  }

  /**
   * Prepare constructor parameters based on contract type and options
   */
  private prepareConstructorParams(options: ContractDeploymentOptions): any[] {
    switch (options.contractType) {
      case ContractType.ERC20:
        return [
          options.name || 'DefaultToken',
          options.symbol || 'DTK',
          options.initialSupply || '1000000',
          18 // decimals
        ];
      
      case ContractType.ERC721:
        return [
          options.name || 'DefaultNFT',
          options.symbol || 'DNFT',
          options.baseURI || 'https://example.com/metadata/'
        ];
      
      case ContractType.ERC1155:
        return [
          options.baseURI || 'https://example.com/metadata/{id}.json'
        ];
      
      default:
        return options.parameters || [];
    }
  }

  /**
   * Generate contract name based on type and options
   */
  private getContractName(options: ContractDeploymentOptions): string {
    if (options.name) {
      return options.name;
    }
    
    switch (options.contractType) {
      case ContractType.ERC20:
        return `ERC20 Token (${options.symbol || 'TOKEN'})`;
      case ContractType.ERC721:
        return `ERC721 NFT (${options.symbol || 'NFT'})`;
      case ContractType.ERC1155:
        return 'ERC1155 Multi-Token';
      case ContractType.CUSTOM:
        return 'Custom Contract';
      default:
        return 'Unknown Contract';
    }
  }

  /**
   * Import an existing deployed contract
   */
  async importContract(
    address: string, 
    abi: any[], 
    name: string, 
    type: ContractType = ContractType.CUSTOM
  ): Promise<DeployedContract> {
    try {
      // Verify contract exists at address
      const code = await this.provider.provider.getCode(address);
      if (code === '0x') {
        throw new ContractError(`No contract found at address: ${address}`);
      }

      const deployedContract: DeployedContract = {
        id: randomUUID(),
        name,
        type,
        address,
        txHash: '', // Unknown for imported contracts
        deployedAt: new Date(), // Use import date
        deployerWallet: '', // Unknown for imported contracts
        abi
      };

      this.deployedContracts.set(deployedContract.id, deployedContract);
      
      return deployedContract;
    } catch (error) {
      throw new ContractError(`Failed to import contract: ${error}`);
    }
  }

  /**
   * Remove a contract from tracking
   */
  removeContract(contractId: string): boolean {
    return this.deployedContracts.delete(contractId);
  }
}