import { StabilityConfig } from "./config";
import { StabilityProvider } from "./provider";
import { StabilityConfigOptions } from "./types";
import { WalletManager } from "@stability-mcp/wallet";

export class StabilityMCP {
  private config: StabilityConfig;
  private provider: StabilityProvider;
  private walletManager: WalletManager;

  constructor(options?: Partial<StabilityConfigOptions>) {
    this.config = new StabilityConfig(options);
    this.config.validate();

    this.provider = new StabilityProvider(this.config);
    this.walletManager = new WalletManager(this.provider);
  }

  /**
   * Get the wallet manager instance
   */
  get wallet(): WalletManager {
    return this.walletManager;
  }

  /**
   * Get the provider instance
   */
  get stabilityProvider(): StabilityProvider {
    return this.provider;
  }

  /**
   * Get configuration
   */
  get configuration(): StabilityConfig {
    return this.config;
  }

  /**
   * Initialize and test connection
   */
  async initialize(): Promise<void> {
    const isConnected = await this.provider.isConnected();
    if (!isConnected) {
      throw new Error("Failed to connect to STABILITY blockchain");
    }

    const networkInfo = await this.provider.getNetworkInfo();
    console.log(`Connected to STABILITY blockchain:`, networkInfo);
  }

  /**
   * Get comprehensive status of the MCP
   */
  async getStatus() {
    const networkInfo = await this.provider.getNetworkInfo();
    const wallets = await this.walletManager.listWallets();

    return {
      network: networkInfo,
      walletsCount: wallets.length,
      configuration: {
        networkName: this.config.networkName,
        chainId: this.config.chainId,
        explorerUrl: this.config.explorerUrl,
      },
    };
  }
}
