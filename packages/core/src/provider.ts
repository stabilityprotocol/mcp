import {
  JsonRpcProvider,
  Wallet,
  TransactionResponse,
  formatEther,
  parseEther,
} from "ethers";
import { StabilityConfig } from "./config";
import {
  StabilityProviderInterface,
  TransactionDetails,
  BlockchainQuery,
} from "./types";
import { BlockchainError, TransactionError } from "./errors";

export class StabilityProvider implements StabilityProviderInterface {
  public readonly provider: JsonRpcProvider;
  private config: StabilityConfig;

  constructor(config: StabilityConfig) {
    this.config = config;
    this.provider = new JsonRpcProvider(config.rpcUrl);
  }

  /**
   * Get wallet balance in ETH
   */
  async getBalance(address: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(address);
      return formatEther(balance);
    } catch (error) {
      throw new BlockchainError(
        `Failed to get balance for ${address}: ${error}`
      );
    }
  }

  /**
   * Get transaction history for an address
   */
  async getTransactionHistory(
    address: string,
    limit: number = 50
  ): Promise<TransactionDetails[]> {
    try {
      // Get latest block number
      const latestBlock = await this.provider.getBlockNumber();
      const transactions: TransactionDetails[] = [];

      // Search through recent blocks for transactions
      const searchBlocks = Math.min(1000, latestBlock); // Limit search to prevent timeout

      for (
        let i = latestBlock;
        i > latestBlock - searchBlocks && transactions.length < limit;
        i--
      ) {
        try {
          const block = await this.provider.getBlock(i, true);
          if (block?.transactions) {
            for (const tx of block.transactions) {
              // Type guard for transaction object
              if (
                typeof tx === "object" &&
                tx &&
                typeof (tx as any).from === "string" &&
                typeof (tx as any).hash === "string" &&
                ((tx as any).from === address || (tx as any).to === address)
              ) {
                const txDetails = await this.getTransactionDetails(
                  (tx as any).hash
                );
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
      throw new BlockchainError(
        `Failed to get transaction history for ${address}: ${error}`
      );
    }
  }

  /**
   * Get detailed transaction information
   */
  async getTransactionDetails(hash: string): Promise<TransactionDetails> {
    try {
      const [tx, receipt] = await Promise.all([
        this.provider.getTransaction(hash),
        this.provider.getTransactionReceipt(hash),
      ]);

      if (!tx) {
        throw new TransactionError(`Transaction not found: ${hash}`);
      }

      const block = tx.blockNumber
        ? await this.provider.getBlock(tx.blockNumber)
        : null;

      return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to || undefined,
        value: formatEther(tx.value),
        gasLimit: tx.gasLimit.toString(),
        gasPrice: tx.gasPrice?.toString() || "0",
        gasUsed: receipt?.gasUsed?.toString(),
        status: receipt?.status != null ? receipt.status : undefined,
        blockNumber: tx.blockNumber || undefined,
        blockHash: tx.blockHash || undefined,
        timestamp: block?.timestamp != null ? block.timestamp : undefined,
        receipt: receipt || undefined,
      };
    } catch (error) {
      throw new TransactionError(
        `Failed to get transaction details for ${hash}: ${error}`
      );
    }
  }

  /**
   * Send a transaction with STABILITY-specific settings
   */
  async sendTransaction(
    wallet: Wallet,
    transaction: any
  ): Promise<TransactionResponse> {
    try {
      // Apply STABILITY-specific transaction settings
      const stabilityTx = {
        ...transaction,
        ...this.config.getTransactionSettings(),
      };

      const connectedWallet = wallet.connect(this.provider);
      return await connectedWallet.sendTransaction(stabilityTx);
    } catch (error) {
      throw new TransactionError(`Failed to send transaction: ${error}`);
    }
  }

  /**
   * Execute a generic blockchain query
   */
  async query(query: BlockchainQuery): Promise<any> {
    try {
      return await this.provider.send(query.method, query.params || []);
    } catch (error) {
      throw new BlockchainError(
        `Failed to execute query ${query.method}: ${error}`
      );
    }
  }

  /**
   * Check if the provider is connected
   */
  async isConnected(): Promise<boolean> {
    try {
      await this.provider.getNetwork();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get network information
   */
  async getNetworkInfo() {
    try {
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();

      return {
        name: network.name,
        chainId: Number(network.chainId),
        blockNumber,
        explorerUrl: this.config.explorerUrl,
      };
    } catch (error) {
      throw new BlockchainError(`Failed to get network info: ${error}`);
    }
  }
}
