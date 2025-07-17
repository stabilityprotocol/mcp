import { ContractType, SmartContractInfo, ContractDeployment } from '@stability-mcp/core';

export interface ContractDeploymentOptions {
  walletId: string;
  contractType: ContractType;
  parameters?: any[];
  name?: string;
  symbol?: string;
  initialSupply?: string;
  baseURI?: string;
  customAbi?: any[];
  customBytecode?: string;
}

export interface DeployedContract {
  id: string;
  name: string;
  type: ContractType;
  address: string;
  txHash: string;
  deployedAt: Date;
  deployerWallet: string;
  abi: any[];
  parameters?: any[];
}

export interface ContractCall {
  contractAddress: string;
  functionName: string;
  parameters: any[];
  value?: string;
}

export interface ContractQuery {
  contractAddress: string;
  functionName: string;
  parameters?: any[];
}

export interface ERC20DeploymentParams {
  name: string;
  symbol: string;
  initialSupply: string;
  decimals?: number;
}

export interface ERC721DeploymentParams {
  name: string;
  symbol: string;
  baseURI?: string;
}

export interface ERC1155DeploymentParams {
  baseURI: string;
}