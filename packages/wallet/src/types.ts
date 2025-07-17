import { WalletInfo } from '@stability-mcp/core';

export interface StoredWallet extends WalletInfo {
  id: string;
  name?: string;
  createdAt: Date;
  lastUsed?: Date;
  encrypted?: boolean;
}

export interface WalletCreationOptions {
  name?: string;
  encrypted?: boolean;
  password?: string;
}

export interface WalletImportOptions extends WalletCreationOptions {
  privateKey?: string;
  mnemonic?: string;
}

export interface WalletStorageInterface {
  saveWallet(wallet: StoredWallet): Promise<void>;
  getWallet(id: string): Promise<StoredWallet | null>;
  getAllWallets(): Promise<StoredWallet[]>;
  deleteWallet(id: string): Promise<boolean>;
  updateWallet(id: string, updates: Partial<StoredWallet>): Promise<void>;
}