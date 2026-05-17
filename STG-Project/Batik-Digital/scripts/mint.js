const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Alamat kontrak hasil deploy
  const contractAddress = "0xYOUR_DEPLOYED_CONTRACT_ADDRESS";

  // Ambil instance kontrak
  const STGBatikDigital = await hre.ethers.getContractAt("STGBatikDigital", contractAddress);

  // Folder metadata
  const metadataDir = path.join(__dirname, "../metadata");

  // Loop semua file JSON di folder metadata
  const files = fs.readdirSync(metadataDir);
  for (const file of files) {
    const filePath = path.join(metadataDir, file);
    const metadata = JSON.parse(fs.readFileSync(filePath, "utf8"));

    // Mint NFT dengan URI IPFS
    const tx = await STGBatikDigital.mintNFT(
      "0xYOUR_WALLET_ADDRESS", // penerima NFT
      metadata.image // gunakan link IPFS dari metadata
    );
    await tx.wait();

    console.log(`Minted NFT: ${metadata.name} -> TokenURI: ${metadata.image}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

