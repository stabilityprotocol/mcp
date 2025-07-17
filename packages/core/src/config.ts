import * as dotenv from 'dotenv';
import { StabilityConfigOptions } from './types';
import { ConfigurationError } from './errors';

dotenv.config();

export class StabilityConfig {
  public readonly apiKey: string;
  public readonly rpcUrl: string;
  public readonly explorerUrl: string;
  public readonly networkName: string;
  public readonly chainId: number;
  public readonly defaultGasLimit: number;

  constructor(options?: Partial<StabilityConfigOptions>) {
    // Load from environment variables with override options
    this.apiKey = options?.apiKey || process.env.STABILITY_API_KEY || '';
    
    if (!this.apiKey) {
      throw new ConfigurationError(
        'STABILITY_API_KEY is required. Get one from https://portal.stabilityprotocol.com/'
      );
    }

    this.rpcUrl = options?.rpcUrl || 
      process.env.STABILITY_RPC_URL?.replace('{{API_KEY}}', this.apiKey) ||
      `https://rpc.stabilityprotocol.com/zgt/${this.apiKey}`;

    this.explorerUrl = options?.explorerUrl || 
      process.env.STABILITY_EXPLORER_URL || 
      'https://explorer.stabilityprotocol.com';

    this.networkName = options?.networkName || 
      process.env.NETWORK_NAME || 
      'STABILITY';

    this.chainId = options?.chainId || 
      parseInt(process.env.CHAIN_ID || '101010');

    this.defaultGasLimit = options?.defaultGasLimit || 
      parseInt(process.env.DEFAULT_GAS_LIMIT || '21000');
  }

  /**
   * Validate the configuration
   */
  public validate(): void {
    if (!this.apiKey) {
      throw new ConfigurationError('API key is required');
    }

    if (!this.rpcUrl) {
      throw new ConfigurationError('RPC URL is required');
    }

    // Validate URL format
    try {
      new URL(this.rpcUrl);
      new URL(this.explorerUrl);
    } catch (error) {
      throw new ConfigurationError('Invalid URL format in configuration');
    }
  }

  /**
   * Get transaction settings for STABILITY blockchain
   */
  public getTransactionSettings() {
    return {
      maxFeePerGas: 0,
      maxPriorityFeePerGas: 0,
      gasLimit: this.defaultGasLimit
    };
  }
}