// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract StabilityERC721 is ERC721, ERC721URIStorage, Ownable {
  uint256 private _tokenIdCounter;

  string private _baseTokenURI;

  constructor(
    string memory name,
    string memory symbol,
    string memory baseTokenURI
  ) ERC721(name, symbol) Ownable(msg.sender) {
    _baseTokenURI = baseTokenURI;
  }

  function _baseURI() internal view override returns (string memory) {
    return _baseTokenURI;
  }

  function setBaseURI(string memory baseTokenURI) public onlyOwner {
    _baseTokenURI = baseTokenURI;
  }

  function mint(
    address to,
    string memory uri
  ) public onlyOwner returns (uint256) {
    uint256 tokenId = _tokenIdCounter;
    _tokenIdCounter++;
    _mint(to, tokenId);
    _setTokenURI(tokenId, uri);
    return tokenId;
  }

  function mintTo(address to) public onlyOwner returns (uint256) {
    uint256 tokenId = _tokenIdCounter;
    _tokenIdCounter++;
    _mint(to, tokenId);
    return tokenId;
  }

  function tokenURI(
    uint256 tokenId
  ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
    return super.tokenURI(tokenId);
  }

  function supportsInterface(
    bytes4 interfaceId
  ) public view override(ERC721, ERC721URIStorage) returns (bool) {
    return super.supportsInterface(interfaceId);
  }
}
