const hre = require("hardhat");

async function main() {
  console.log("Menginisiasi penyebaran STGIPResepBerdaulat...");

  // Mengambil representasi pabrik kontrak pintar
  const STGIPResep = await hre.ethers.getContractFactory("STGIPResepBerdaulat");
  
  // Melakukan deploy kontrak ke jaringan
  const kontrakSultan = await STGIPResep.deploy();

  // Menunggu hingga blok transaksi terkonfirmasi
  await kontrakSultan.waitForDeployment();

  console.log("====================================================");
  console.log("🔥 KONTRAK BERHASIL DISEBARKAN, SULTAN! 🔥");
  console.log("Alamat Kontrak Terpaten:", await kontrakSultan.getAddress());
  console.log("Alamat Juru Masak Utama (Sultan): 0xD9a1E28224d6d047Eef8712dC97d11A9032b948e");
  console.log("====================================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
