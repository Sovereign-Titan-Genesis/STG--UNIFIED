// SPDX-License-Identifier: STG-PURE-MANDIRI LICENSE v1.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract EscrowNFT {
    address public seller;
    address public buyer;
    uint256 public price;
    IERC721 public nftContract;
    uint256 public tokenId;
    bool public nftDelivered;

    constructor(
        address _buyer,
        uint256 _price,
        address _nftContract,
        uint256 _tokenId
    ) {
        seller = msg.sender;
        buyer = _buyer;
        price = _price;
        nftContract = IERC721(_nftContract);
        tokenId = _tokenId;
    }

    function deposit() external payable {
        require(msg.sender == buyer, "Only buyer can deposit");
        require(msg.value == price, "Incorrect amount");
    }

    function confirmDelivery() external {
        require(msg.sender == buyer, "Only buyer can confirm");
        nftDelivered = true;

        // Transfer NFT ke buyer
        nftContract.safeTransferFrom(seller, buyer, tokenId);

        // Transfer dana ke seller
        payable(seller).transfer(price);
    }
}
