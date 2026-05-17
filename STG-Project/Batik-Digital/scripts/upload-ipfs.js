const fs = require("fs");
const path = require("path");
const axios = require("axios");

require("dotenv").config();

async function uploadToIPFS(filePath) {
  const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
  const data = fs.createReadStream(filePath);

  const res = await axios.post(url, data, {
    maxContentLength: "Infinity",
    headers: {
      "Content-Type": `multipart/form-data`,
      pinata_api_key: process.env.PINATA_API_KEY,
      pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
    },
  });

  return `ipfs://${res.data.IpfsHash}`;
}

async function main() {
  const metadataDir = path.join(__dirname, "../metadata");
  const files = fs.readdirSync(metadataDir);

  for (const file of files) {
    const filePath = path.join(metadataDir, file);
    const ipfsUri = await uploadToIPFS(filePath);
    console.log(`Uploaded ${file} -> ${ipfsUri}`);
  }
}

main().catch(console.error);
