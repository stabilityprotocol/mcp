import * as fs from "fs/promises";
import * as path from "path";
import { StoredWallet, WalletStorageInterface } from "./types";
import { WalletError } from "./errors";

export class WalletStorage implements WalletStorageInterface {
  private storageDir: string;
  private walletsFile: string;

  constructor(storageDir: string = ".stability-mcp") {
    this.storageDir = path.resolve(storageDir);
    this.walletsFile = path.join(this.storageDir, "wallets.json");
  }

  /**
   * Initialize storage directory
   */
  private async ensureStorageDir(): Promise<void> {
    try {
      await fs.access(this.storageDir);
    } catch {
      await fs.mkdir(this.storageDir, { recursive: true });
    }
  }

  /**
   * Load all wallets from storage
   */
  private async loadWallets(): Promise<StoredWallet[]> {
    try {
      await this.ensureStorageDir();
      const data = await fs.readFile(this.walletsFile, "utf-8");
      const wallets = JSON.parse(data);

      // Convert date strings back to Date objects
      return wallets.map((wallet: any) => ({
        ...wallet,
        createdAt: new Date(wallet.createdAt),
        lastUsed: wallet.lastUsed ? new Date(wallet.lastUsed) : undefined,
      }));
    } catch (error: any) {
      if (error.code === "ENOENT") {
        return []; // File doesn't exist yet
      }
      throw new WalletError(`Failed to load wallets: ${error.message}`);
    }
  }

  /**
   * Save all wallets to storage
   */
  private async saveWallets(wallets: StoredWallet[]): Promise<void> {
    try {
      await this.ensureStorageDir();
      await fs.writeFile(this.walletsFile, JSON.stringify(wallets, null, 2));
    } catch (error: any) {
      throw new WalletError(`Failed to save wallets: ${error.message}`);
    }
  }

  /**
   * Save a wallet to storage
   */
  async saveWallet(wallet: StoredWallet): Promise<void> {
    const wallets = await this.loadWallets();

    // Check if wallet already exists
    const existingIndex = wallets.findIndex((w) => w.id === wallet.id);

    if (existingIndex >= 0) {
      wallets[existingIndex] = wallet;
    } else {
      wallets.push(wallet);
    }

    await this.saveWallets(wallets);
  }

  /**
   * Get a wallet by ID
   */
  async getWallet(id: string): Promise<StoredWallet | null> {
    const wallets = await this.loadWallets();
    return wallets.find((w) => w.id === id) || null;
  }

  /**
   * Get all wallets
   */
  async getAllWallets(): Promise<StoredWallet[]> {
    return await this.loadWallets();
  }

  /**
   * Delete a wallet
   */
  async deleteWallet(id: string): Promise<boolean> {
    const wallets = await this.loadWallets();
    const initialLength = wallets.length;
    const filteredWallets = wallets.filter((w) => w.id !== id);

    if (filteredWallets.length === initialLength) {
      return false; // Wallet not found
    }

    await this.saveWallets(filteredWallets);
    return true;
  }

  /**
   * Update a wallet
   */
  async updateWallet(
    id: string,
    updates: Partial<StoredWallet>
  ): Promise<void> {
    const wallets = await this.loadWallets();
    const walletIndex = wallets.findIndex((w) => w.id === id);

    if (walletIndex === -1) {
      throw new WalletError(`Wallet not found: ${id}`);
    }

    wallets[walletIndex] = { ...wallets[walletIndex], ...updates };
    await this.saveWallets(wallets);
  }

  /**
   * Clear all wallets (for testing or reset)
   */
  async clearAll(): Promise<void> {
    await this.saveWallets([]);
  }
}
