// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC1155/ERC1155.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract StabilityERC1155 is ERC1155, Ownable {
  uint256 private _tokenIdCounter;

  mapping(uint256 => string) private _tokenURIs;

  constructor(string memory uri) ERC1155(uri) Ownable(msg.sender) {}

  function uri(uint256 tokenId) public view override returns (string memory) {
    string memory tokenURI = _tokenURIs[tokenId];
    if (bytes(tokenURI).length > 0) {
      return tokenURI;
    }
    return super.uri(tokenId);
  }

  function setTokenURI(
    uint256 tokenId,
    string memory tokenURI
  ) public onlyOwner {
    _tokenURIs[tokenId] = tokenURI;
  }

  function mint(
    address to,
    uint256 id,
    uint256 amount,
    bytes memory data
  ) public onlyOwner {
    _mint(to, id, amount, data);
  }

  function mintBatch(
    address to,
    uint256[] memory ids,
    uint256[] memory amounts,
    bytes memory data
  ) public onlyOwner {
    _mintBatch(to, ids, amounts, data);
  }

  function createToken(
    address to,
    uint256 amount,
    string memory tokenURI,
    bytes memory data
  ) public onlyOwner returns (uint256) {
    uint256 tokenId = _tokenIdCounter;
    _tokenIdCounter++;
    _mint(to, tokenId, amount, data);
    if (bytes(tokenURI).length > 0) {
      _tokenURIs[tokenId] = tokenURI;
    }
    return tokenId;
  }
}
