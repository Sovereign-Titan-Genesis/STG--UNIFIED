// index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ethers } from "ethers";
import pkg from "pg";

dotenv.config();
const { Pool } = pkg;
const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const CONTRACT_ADDRESS = "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512";
const CONTRACT_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address,uint256) returns (bool)"
];

app.get("/balance/:address", async (req, res) => {
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  const balance = await contract.balanceOf(req.params.address);
  res.json({ address: req.params.address, balance: balance.toString() });
});

app.listen(5000, () => console.log("STG Backend running on port 5000"));
