const hre = require("hardhat");

async function main() {
  // Kompilasi kontrak
  await hre.run("compile");

  // Ambil factory kontrak
  const STGBatikDigital = await hre.ethers.getContractFactory("STGBatikDigital");

  // Deploy kontrak
  const contract = await STGBatikDigital.deploy();
  await contract.deployed();

  console.log("STGBatikDigital deployed to:", contract.address);
}

// Jalankan deploy
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
