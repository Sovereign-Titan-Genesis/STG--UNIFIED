const axios = require("axios");
require("dotenv").config();

async function listOnOpenSea(contractAddress, tokenId) {
  const url = `https://api.opensea.io/v2/orders/matic/seaport/listings`;

  const payload = {
    asset: {
      contract_address: contractAddress,
      token_id: tokenId
    },
    start_time: Math.floor(Date.now() / 1000),
    end_time: Math.floor(Date.now() / 1000) + 86400 * 7, // 7 hari
    price: "0.5", // harga dalam ETH/MATIC
    currency: "MATIC"
  };

  const res = await axios.post(url, payload, {
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": process.env.OPENSEA_API_KEY
    }
  });

  console.log(`NFT ${tokenId} listed on OpenSea:`, res.data);
}

async function listOnRarible(contractAddress, tokenId) {
  const url = `https://api.rarible.org/v0.1/orders/sell`;

  const payload = {
    make: {
      assetType: {
        assetClass: "ERC721",
        contract: contractAddress,
        tokenId: tokenId
      },
      value: "1"
    },
    take: {
      assetType: {
        assetClass: "ETH"
      },
      value: "1000000000000000000" // 1 ETH
    }
  };

  const res = await axios.post(url, payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RARIBLE_API_KEY}`
    }
  });

  console.log(`NFT ${tokenId} listed on Rarible:`, res.data);
}

async function main() {
  const contractAddress = "0xYOUR_DEPLOYED_CONTRACT_ADDRESS";
  const tokenId = "001"; // ganti sesuai token yang sudah di-mint

  await listOnOpenSea(contractAddress, tokenId);
  await listOnRarible(contractAddress, tokenId);
}

main().catch(console.error);
