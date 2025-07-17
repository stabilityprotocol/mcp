export class StabilityMCPError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'StabilityMCPError';
  }
}

export class ConfigurationError extends StabilityMCPError {
  constructor(message: string) {
    super(message, 'CONFIGURATION_ERROR');
    this.name = 'ConfigurationError';
  }
}

export class WalletError extends StabilityMCPError {
  constructor(message: string) {
    super(message, 'WALLET_ERROR');
    this.name = 'WalletError';
  }
}

export class TransactionError extends StabilityMCPError {
  constructor(message: string) {
    super(message, 'TRANSACTION_ERROR');
    this.name = 'TransactionError';
  }
}

export class ContractError extends StabilityMCPError {
  constructor(message: string) {
    super(message, 'CONTRACT_ERROR');
    this.name = 'ContractError';
  }
}

export class BlockchainError extends StabilityMCPError {
  constructor(message: string) {
    super(message, 'BLOCKCHAIN_ERROR');
    this.name = 'BlockchainError';
  }
}