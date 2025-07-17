export class StabilityMCPError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StabilityMCPError";
  }
}

export class WalletError extends StabilityMCPError {
  constructor(message: string) {
    super(message);
    this.name = "WalletError";
  }
}
