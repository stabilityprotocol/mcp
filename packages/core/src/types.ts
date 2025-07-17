import { JsonRpcProvider, Wallet, TransactionReceipt, TransactionResponse } from 'ethers';

export interface StabilityConfigOptions {
  apiKey: string;
  rpcUrl?: string;
  explorerUrl?: string;
  networkName?: string;
  chainId?: number;
  defaultGasLimit?: number;
}

export interface WalletInfo {
  address: string;
  privateKey?: string;
  mnemonic?: string;
  balance?: string;
}

export interface TransactionDetails {
  hash: string;
  from: string;
  to?: string;
  value: string;
  gasLimit: string;
  gasPrice: string;
  gasUsed?: string;
  status?: number;
  blockNumber?: number;
  blockHash?: string;
  timestamp?: number;
  receipt?: TransactionReceipt;
}

export interface ContractDeployment {
  address: string;
  txHash: string;
  receipt: TransactionReceipt;
  abi?: any[];
  bytecode?: string;
}

export interface SmartContractInfo {
  name: string;
  address?: string;
  abi: any[];
  bytecode: string;
  constructor?: {
    inputs: any[];
    description?: string;
  };
}

export interface BlockchainQuery {
  method: string;
  params?: any[];
}

export interface StabilityProviderInterface {
  provider: JsonRpcProvider;
  getBalance(address: string): Promise<string>;
  getTransactionHistory(address: string, limit?: number): Promise<TransactionDetails[]>;
  getTransactionDetails(hash: string): Promise<TransactionDetails>;
  sendTransaction(wallet: Wallet, transaction: any): Promise<TransactionResponse>;
  query(query: BlockchainQuery): Promise<any>;
}

export enum ContractType {
  ERC20 = 'ERC20',
  ERC721 = 'ERC721',
  ERC1155 = 'ERC1155',
  CUSTOM = 'CUSTOM'
}