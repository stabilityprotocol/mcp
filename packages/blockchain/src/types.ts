export interface BlockInfo {
  number: number;
  hash: string;
  parentHash: string;
  timestamp: number;
  gasLimit: string;
  gasUsed: string;
  miner: string;
  transactions: string[];
}

export interface NetworkStats {
  blockNumber: number;
  gasPrice: string;
  chainId: number;
  networkName: string;
}

export interface AddressInfo {
  address: string;
  balance: string;
  transactionCount: number;
  isContract: boolean;
  code?: string;
}

export interface TokenInfo {
  address: string;
  name?: string;
  symbol?: string;
  decimals?: number;
  totalSupply?: string;
}

export interface BlockchainAnalytics {
  totalTransactions: number;
  averageBlockTime: number;
  networkHashRate?: string;
  activeAddresses: number;
}