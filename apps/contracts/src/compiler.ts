import solc from 'solc';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CompiledContract {
  bytecode: string;
  abi: any[];
  metadata: string;
}

interface CompilationCache {
  [contractName: string]: CompiledContract;
}

class ContractCompiler {
  private static instance: ContractCompiler;
  private cache: CompilationCache = {};
  private contractsDir: string;
  private ozContractsDir: string;

  private constructor() {
    // In development (src) or production (dist), resolve to src/contracts
    const srcDir = __dirname.includes('dist')
      ? path.resolve(__dirname, '../src')
      : __dirname;
    this.contractsDir = path.resolve(srcDir, 'contracts');

    // OpenZeppelin contracts directory
    const projectRoot = path.resolve(__dirname, '../../../');
    this.ozContractsDir = path.resolve(
      projectRoot,
      'node_modules/@openzeppelin/contracts/'
    );
  }

  public static getInstance(): ContractCompiler {
    if (!ContractCompiler.instance) {
      ContractCompiler.instance = new ContractCompiler();
    }
    return ContractCompiler.instance;
  }

  private async findImports(
    importPath: string,
    basePath?: string
  ): Promise<{ contents: string }> {
    try {
      let fullPath: string;

      // Handle OpenZeppelin imports
      if (importPath.startsWith('@openzeppelin/contracts/')) {
        fullPath = path.resolve(
          this.ozContractsDir,
          importPath.replace('@openzeppelin/contracts/', '')
        );
      }
      // Handle relative imports
      else if (importPath.startsWith('./') || importPath.startsWith('../')) {
        if (basePath) {
          fullPath = path.resolve(path.dirname(basePath), importPath);
        } else {
          fullPath = path.resolve(this.contractsDir, importPath);
        }
      }
      // Handle local imports
      else {
        fullPath = path.resolve(this.contractsDir, importPath);
      }

      const contents = await fs.readFile(fullPath, 'utf8');
      return { contents };
    } catch (error) {
      throw new Error(`Import not found: ${importPath} (base: ${basePath})`);
    }
  }

  private async resolveAllImports(
    contractSource: string,
    contractPath: string
  ): Promise<{ [key: string]: { content: string } }> {
    const sources: { [key: string]: { content: string } } = {};
    const processedPaths = new Set<string>();

    const processFile = async (
      source: string,
      filePath: string,
      sourceKey: string
    ) => {
      if (processedPaths.has(filePath)) return;
      processedPaths.add(filePath);

      sources[sourceKey] = { content: source };

      // Find all imports in this file
      const importRegex =
        /import\s+.*?from\s+["']([^"']+)["'];|import\s+["']([^"']+)["'];/g;
      let match;

      while ((match = importRegex.exec(source)) !== null) {
        const importPath = match[1] || match[2];

        try {
          const importResult = await this.findImports(importPath, filePath);
          let importSourceKey: string;

          // Generate a proper source key for the import
          if (importPath.startsWith('@openzeppelin/contracts/')) {
            importSourceKey = importPath;
          } else if (
            importPath.startsWith('./') ||
            importPath.startsWith('../')
          ) {
            // Resolve relative path to absolute for key
            const resolvedPath = path.resolve(
              path.dirname(filePath),
              importPath
            );
            if (
              resolvedPath.includes('node_modules/@openzeppelin/contracts/')
            ) {
              importSourceKey =
                '@openzeppelin/contracts/' +
                resolvedPath
                  .split('node_modules/@openzeppelin/contracts/')[1]
                  .replace(/\\/g, '/');
            } else {
              importSourceKey = path
                .relative(this.contractsDir, resolvedPath)
                .replace(/\\/g, '/');
            }
          } else {
            importSourceKey = importPath;
          }

          // Recursively process the imported file
          await processFile(
            importResult.contents,
            importPath.startsWith('@openzeppelin/contracts/')
              ? path.resolve(
                  this.ozContractsDir,
                  importPath.replace('@openzeppelin/contracts/', '')
                )
              : importPath.startsWith('./') || importPath.startsWith('../')
                ? path.resolve(path.dirname(filePath), importPath)
                : path.resolve(this.contractsDir, importPath),
            importSourceKey
          );
        } catch (error: any) {
          console.warn(
            `Warning: Could not resolve import ${importPath} from ${filePath}:`,
            error.message
          );
        }
      }
    };

    await processFile(
      contractSource,
      contractPath,
      path.basename(contractPath, '.sol')
    );
    return sources;
  }

  private async compileContract(
    contractPath: string
  ): Promise<CompiledContract> {
    const contractName = path.basename(contractPath, '.sol');

    // Check cache first
    if (this.cache[contractName]) {
      return this.cache[contractName];
    }

    const source = await fs.readFile(contractPath, 'utf8');
    const allSources = await this.resolveAllImports(source, contractPath);

    const input = {
      language: 'Solidity',
      sources: allSources,
      version: '0.8.24',
      settings: {
        outputSelection: {
          '*': {
            '*': ['abi', 'evm.bytecode', 'metadata'],
          },
        },
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    if (output.errors) {
      const errors = output.errors.filter(
        (error: any) => error.severity === 'error'
      );
      if (errors.length > 0) {
        throw new Error(
          `Compilation errors: ${JSON.stringify(errors, null, 2)}`
        );
      }
    }

    const contracts = output.contracts[contractName];
    const contractKey = Object.keys(contracts)[0];
    const contract = contracts[contractKey];

    const compiled: CompiledContract = {
      bytecode: contract.evm.bytecode.object,
      abi: contract.abi,
      metadata: contract.metadata,
    };

    // Cache the compiled contract
    this.cache[contractName] = compiled;

    return compiled;
  }

  public async getContract(contractName: string): Promise<CompiledContract> {
    const contractPath = path.resolve(this.contractsDir, `${contractName}.sol`);
    return this.compileContract(contractPath);
  }

  public async getERC20(): Promise<CompiledContract> {
    return this.getContract('ERC20');
  }

  public async getERC721(): Promise<CompiledContract> {
    return this.getContract('ERC721');
  }

  public async getERC1155(): Promise<CompiledContract> {
    return this.getContract('ERC1155');
  }

  public clearCache(): void {
    this.cache = {};
  }

  public getCacheKeys(): string[] {
    return Object.keys(this.cache);
  }
}

export default ContractCompiler;
