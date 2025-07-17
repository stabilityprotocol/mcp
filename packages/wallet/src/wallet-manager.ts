import { Wallet, HDNodeWallet, formatEther } from 'ethers';
import { randomUUID } from 'crypto';
import { WalletStorage } from './wallet-storage';
import { StoredWallet, WalletCreationOptions, WalletImportOptions } from './types';
import { StabilityProvider, WalletError, WalletInfo, TransactionDetails } from '@stability-mcp/core';

export class WalletManager {
  private storage: WalletStorage;
  private provider: StabilityProvider;
  private activeWallets: Map<string, Wallet> = new Map();

  constructor(provider: StabilityProvider, storageDir?: string) {
    this.provider = provider;
    this.storage = new WalletStorage(storageDir);
  }

  /**
   * Create a new random wallet
   */
  async createWallet(options?: WalletCreationOptions): Promise<StoredWallet> {
    try {
      const wallet = Wallet.createRandom();
      const id = randomUUID();
      
      const storedWallet: StoredWallet = {
        id,
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic?.phrase,
        name: options?.name || `Wallet ${id.slice(0, 8)}`,
        createdAt: new Date(),
        encrypted: options?.encrypted || false
      };

      // Get initial balance
      storedWallet.balance = await this.provider.getBalance(wallet.address);

      await this.storage.saveWallet(storedWallet);
      this.activeWallets.set(id, wallet);

      return storedWallet;
    } catch (error) {
      throw new WalletError(`Failed to create wallet: ${error}`);
    }
  }

  /**
   * Import an existing wallet from private key or mnemonic
   */
  async importWallet(options: WalletImportOptions): Promise<StoredWallet> {
    try {
      let wallet: Wallet;

      if (options.privateKey) {
        wallet = new Wallet(options.privateKey);
      } else if (options.mnemonic) {
        wallet = Wallet.fromPhrase(options.mnemonic);
      } else {
        throw new WalletError('Either privateKey or mnemonic is required for import');
      }

      const id = randomUUID();
      
      const storedWallet: StoredWallet = {
        id,
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic?.phrase,
        name: options.name || `Imported Wallet ${id.slice(0, 8)}`,
        createdAt: new Date(),
        encrypted: options.encrypted || false
      };

      // Get initial balance
      storedWallet.balance = await this.provider.getBalance(wallet.address);

      await this.storage.saveWallet(storedWallet);
      this.activeWallets.set(id, wallet);

      return storedWallet;
    } catch (error) {
      throw new WalletError(`Failed to import wallet: ${error}`);
    }
  }

  /**
   * Get a wallet by ID
   */
  async getWallet(id: string): Promise<StoredWallet | null> {
    return await this.storage.getWallet(id);
  }

  /**
   * Get the ethers.Wallet instance for a stored wallet
   */
  async getEthersWallet(id: string): Promise<Wallet> {
    // Check if already loaded in memory
    if (this.activeWallets.has(id)) {
      return this.activeWallets.get(id)!;
    }

    const storedWallet = await this.storage.getWallet(id);
    if (!storedWallet) {
      throw new WalletError(`Wallet not found: ${id}`);
    }

    if (!storedWallet.privateKey) {
      throw new WalletError(`Private key not available for wallet: ${id}`);
    }

    const wallet = new Wallet(storedWallet.privateKey);
    this.activeWallets.set(id, wallet);

    // Update last used timestamp
    await this.storage.updateWallet(id, { lastUsed: new Date() });

    return wallet;
  }

  /**
   * List all wallets
   */
  async listWallets(): Promise<WalletInfo[]> {
    const storedWallets = await this.storage.getAllWallets();
    
    // Update balances for all wallets
    const walletInfos: WalletInfo[] = [];
    
    for (const wallet of storedWallets) {
      try {
        const balance = await this.provider.getBalance(wallet.address);
        walletInfos.push({
          address: wallet.address,
          balance,
          mnemonic: wallet.mnemonic
        });
      } catch (error) {
        // If balance fetch fails, include wallet without balance
        walletInfos.push({
          address: wallet.address,
          balance: '0',
          mnemonic: wallet.mnemonic
        });
      }
    }
    
    return walletInfos;
  }

  /**
   * Delete a wallet
   */
  async deleteWallet(id: string): Promise<boolean> {
    try {
      // Remove from active wallets
      this.activeWallets.delete(id);
      
      // Remove from storage
      return await this.storage.deleteWallet(id);
    } catch (error) {
      throw new WalletError(`Failed to delete wallet: ${error}`);
    }
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(id: string): Promise<string> {
    const wallet = await this.storage.getWallet(id);
    if (!wallet) {
      throw new WalletError(`Wallet not found: ${id}`);
    }

    const balance = await this.provider.getBalance(wallet.address);
    
    // Update stored balance
    await this.storage.updateWallet(id, { balance });
    
    return balance;
  }

  /**
   * Get wallet transaction history
   */
  async getWalletHistory(id: string, limit?: number): Promise<TransactionDetails[]> {
    const wallet = await this.storage.getWallet(id);
    if (!wallet) {
      throw new WalletError(`Wallet not found: ${id}`);
    }

    return await this.provider.getTransactionHistory(wallet.address, limit);
  }

  /**
   * Send a transaction from a wallet
   */
  async sendTransaction(id: string, to: string, value: string, data?: string) {
    try {
      const ethersWallet = await this.getEthersWallet(id);
      
      const transaction = {
        to,
        value: value,
        data: data || '0x'
      };

      return await this.provider.sendTransaction(ethersWallet, transaction);
    } catch (error) {
      throw new WalletError(`Failed to send transaction: ${error}`);
    }
  }

  /**
   * Get all stored wallets with full details
   */
  async getStoredWallets(): Promise<StoredWallet[]> {
    return await this.storage.getAllWallets();
  }

  /**
   * Update wallet metadata
   */
  async updateWallet(id: string, updates: Partial<StoredWallet>): Promise<void> {
    await this.storage.updateWallet(id, updates);
  }

  /**
   * Clear all wallets (for testing or reset)
   */
  async clearAllWallets(): Promise<void> {
    this.activeWallets.clear();
    await this.storage.clearAll();
  }
}