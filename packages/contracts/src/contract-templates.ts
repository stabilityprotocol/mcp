import { SmartContractInfo, ContractType } from '@stability-mcp/core';

export class ContractTemplates {
  /**
   * Get ERC20 contract template
   */
  static getERC20Template(): SmartContractInfo {
    return {
      name: 'ERC20Token',
      abi: [
        "constructor(string memory name, string memory symbol, uint256 initialSupply, uint8 decimals)",
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function decimals() view returns (uint8)",
        "function totalSupply() view returns (uint256)",
        "function balanceOf(address account) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)",
        "function allowance(address owner, address spender) view returns (uint256)",
        "function approve(address spender, uint256 amount) returns (bool)",
        "function transferFrom(address from, address to, uint256 amount) returns (bool)",
        "event Transfer(address indexed from, address indexed to, uint256 value)",
        "event Approval(address indexed owner, address indexed spender, uint256 value)"
      ],
      bytecode: "0x608060405234801561001057600080fd5b50604051610c3f380380610c3f8339818101604052810190610032919061028a565b83600390805190602001906100489291906100f8565b50826004908051906020019061005f9291906100f8565b508160ff1660ff16600560006101000a81548160ff021916908360ff16021790555080600681905550806000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055503373ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8360405161012c9190610372565b60405180910390a350505050610387565b82805461014e906103b8565b90600052602060002090601f01602090048101928261017057600085556101b7565b82601f1061018957805160ff19168380011785556101b7565b828001600101855582156101b7579182015b828111156101b657825182559160200191906001019061019b565b5b5090506101c491906101c8565b5090565b5b808211156101e15760008160009055506001016101c9565b5090565b6000604051905090565b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b61024e82610205565b810181811067ffffffffffffffff8211171561026d5761026c610216565b5b80604052505050565b60006102806101e5565b905061028c8282610245565b919050565b600080600080608085870312156102ab576102aa6101fb565b5b600085015167ffffffffffffffff8111156102c9576102c8610200565b5b6102d587828801610276565b945050602085015167ffffffffffffffff8111156102f6576102f5610200565b5b61030287828801610276565b935050604061031387828801610364565b925050606061032487828801610364565b91505092959194509250565b6000819050919050565b61034381610330565b811461034e57600080fd5b50565b6000815190506103608161033a565b92915050565b60006020828403121561037c5761037b6101fb565b5b600061038a84828501610351565b91505092915050565b61038d8161032c565b82525050565b60006020820190506103a86000830184610384565b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b600060028204905060018216806103f657607f821691505b602082108114156104005761040f6103af565b5b50919050565b6108a9806104166000396000f3fe", 
      constructor: {
        inputs: [
          { name: "name", type: "string", description: "Token name" },
          { name: "symbol", type: "string", description: "Token symbol" },
          { name: "initialSupply", type: "uint256", description: "Initial token supply" },
          { name: "decimals", type: "uint8", description: "Token decimals (default: 18)" }
        ],
        description: "Deploy an ERC20 token contract"
      }
    };
  }

  /**
   * Get ERC721 contract template
   */
  static getERC721Template(): SmartContractInfo {
    return {
      name: 'ERC721Token',
      abi: [
        "constructor(string memory name, string memory symbol, string memory baseURI)",
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function tokenURI(uint256 tokenId) view returns (string)",
        "function balanceOf(address owner) view returns (uint256)",
        "function ownerOf(uint256 tokenId) view returns (address)",
        "function safeTransferFrom(address from, address to, uint256 tokenId)",
        "function transferFrom(address from, address to, uint256 tokenId)",
        "function approve(address to, uint256 tokenId)",
        "function getApproved(uint256 tokenId) view returns (address)",
        "function setApprovalForAll(address operator, bool approved)",
        "function isApprovedForAll(address owner, address operator) view returns (bool)",
        "function mint(address to, uint256 tokenId)",
        "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
        "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
        "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)"
      ],
      bytecode: "0x608060405234801561001057600080fd5b50604051610d23380380610d238339818101604052810190610032919061028a565b82600090805190602001906100489291906100f8565b508160019080519060200190610052929190610100f8565b508060029080519060200190610069929190610100f8565b50505050610387565b8280546100e9906103b8565b90600052602060002090601f0160200480119282610117576000855561015e565b82601f1061013057805160ff191683800117855561015e565b8280016001018555821561015e579182015b8281111561015d578251825591602001919060010190610142565b5b50905061016b919061016f565b5090565b5b80821115610188576000816000905550600101610170565b5090565b6000604051905090565b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6101f4826101ab565b810181811067ffffffffffffffff82111715610213576102126101bc565b5b80604052505050565b600061022661018c565b905061023282826101eb565b919050565b600067ffffffffffffffff821115610252576102516101bc565b5b61025b826101ab565b9050602081019050919050565b60005b8381101561028657808201518184015260208101905061026b565b83811115610295576000848401525b50505050565b60006102ae6102a984610237565b61021c565b9050828152602081018484840111156102ca576102c96101a6565b5b6102d5848285610268565b509392505050565b600082601f8301126102f2576102f16101a1565b5b815161030284826020860161029b565b91505092915050565b6000806000606084860312156103245761032361019c565b5b600084015167ffffffffffffffff8111156103425761034161019a565b5b61034e868287016102dd565b935050602084015167ffffffffffffffff8111156103755761037461019a565b5b610381868287016102dd565b925050604084015167ffffffffffffffff8111156103a25761039e61019a565b5b6103ae868287016102dd565b9150509250925092565b61098c806103c66000396000f3fe",
      constructor: {
        inputs: [
          { name: "name", type: "string", description: "NFT collection name" },
          { name: "symbol", type: "string", description: "NFT collection symbol" },
          { name: "baseURI", type: "string", description: "Base URI for token metadata" }
        ],
        description: "Deploy an ERC721 NFT contract"
      }
    };
  }

  /**
   * Get ERC1155 contract template
   */
  static getERC1155Template(): SmartContractInfo {
    return {
      name: 'ERC1155Token',
      abi: [
        "constructor(string memory uri)",
        "function uri(uint256 id) view returns (string)",
        "function balanceOf(address account, uint256 id) view returns (uint256)",
        "function balanceOfBatch(address[] accounts, uint256[] ids) view returns (uint256[])",
        "function setApprovalForAll(address operator, bool approved)",
        "function isApprovedForAll(address account, address operator) view returns (bool)",
        "function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data)",
        "function safeBatchTransferFrom(address from, address to, uint256[] ids, uint256[] amounts, bytes data)",
        "function mint(address to, uint256 id, uint256 amount, bytes data)",
        "function mintBatch(address to, uint256[] ids, uint256[] amounts, bytes data)",
        "event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)",
        "event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)",
        "event ApprovalForAll(address indexed account, address indexed operator, bool approved)",
        "event URI(string value, uint256 indexed id)"
      ],
      bytecode: "0x608060405234801561001057600080fd5b50604051610b3f380380610b3f8339818101604052810190610032919061014a565b806000908051906020019061004892919061005a565b5061005233610058565b505061021c565b806001600281610068919061025e565b90555050565b82805461007a906101db565b90600052602060002090601f01602090048101928261009c57600085556100e3565b82601f106100b557805160ff19168380011785556100e3565b828001600101855582156100e3579182015b828111156100e25782518255916020019190600101906100c7565b5b5090506100f091906100f4565b5090565b5b8082111561010d5760008160009055506001016100f5565b5090565b600061012461011f84610241565b61021c565b90508281526020810184848401111561014057600080fd5b61014b8482856101a9565b509392505050565b6000602082840312156101595761015861021a565b5b600082015167ffffffffffffffff81111561017757610176610215565b5b61018384828501610111565b91505092915050565b600061019782610231565b6101a1818561023c565b93506101b18185602086016101b8565b6101ba816101eb565b840191505092915050565b60005b838110156101d65780820151818401526020810190506101bb565b838111156101e5576000848401525b50505050565b6000601f19601f8301169050919050565b600067ffffffffffffffff82111561021757610216610206565b5b610220826101eb565b9050602081019050919050565b600081519050919050565b600082825260208201905092915050565b600067ffffffffffffffff82111561026457610263610206565b5b61026d826101eb565b9050602081019050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b600060028204905060018216806102c457607f821691505b602082108114156102d8576102d761027a565b5b50919050565b6108d4806102ed6000396000f3fe",
      constructor: {
        inputs: [
          { name: "uri", type: "string", description: "URI for token metadata" }
        ],
        description: "Deploy an ERC1155 multi-token contract"
      }
    };
  }

  /**
   * Get contract template by type
   */
  static getTemplate(type: ContractType): SmartContractInfo | null {
    switch (type) {
      case ContractType.ERC20:
        return this.getERC20Template();
      case ContractType.ERC721:
        return this.getERC721Template();
      case ContractType.ERC1155:
        return this.getERC1155Template();
      default:
        return null;
    }
  }

  /**
   * Validate deployment parameters for a contract type
   */
  static validateParameters(type: ContractType, parameters: any[]): boolean {
    const template = this.getTemplate(type);
    if (!template) return false;

    const requiredParams = template.constructor?.inputs?.length || 0;
    return parameters.length >= requiredParams;
  }
}