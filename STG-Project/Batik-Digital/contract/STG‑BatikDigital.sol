// SPDX-License-Identifier: STG-PURE-MANDIRI LICENSE v1.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract STGBatikDigital is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;
    uint256 public royaltyPercentage = 10;
    address public royaltyRecipient = 0x2F7DaC1dF7D50DF85650445D18FfffB1331463eb;

    constructor() ERC721("STG Batik Digital", "STGBATIK") {}

    function mintNFT(address recipient, string memory tokenURI) public onlyOwner {
        uint256 tokenId = nextTokenId++;
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, tokenURI);
    }

    function royaltyInfo(uint256, uint256 salePrice)
        external
        view
        returns (address receiver, uint256 royaltyAmount)
    {
        return (royaltyRecipient, (salePrice * royaltyPercentage) / 100);
    }
}
