const hre = require("hardhat");

async function main() {
  const buyer = "0xBUYER_WALLET_ADDRESS";
  const price = hre.ethers.utils.parseEther("1"); // harga 1 ETH/MATIC
  const nftContract = "0xYOUR_DEPLOYED_NFT_CONTRACT";
  const tokenId = 1; // ganti sesuai token

  const EscrowNFT = await hre.ethers.getContractFactory("EscrowNFT");
  const escrow = await EscrowNFT.deploy(buyer, price, nftContract, tokenId);
  await escrow.deployed();

  console.log("EscrowNFT deployed to:", escrow.address);
}

main().catch(console.error);
