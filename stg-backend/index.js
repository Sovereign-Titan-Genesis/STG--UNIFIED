why// index.js
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
app.post("/register", async (req, res) => {
  const { username, email, address } = req.body;
  try {
    const user = await pool.query(
      "INSERT INTO users (username, email) VALUES ($1, $2) RETURNING id",
      [username, email]
    );
    await pool.query(
      "INSERT INTO wallets (user_id, address) VALUES ($1, $2)",
      [user.rows[0].id, address]
    );
    res.json({ message: "User registered", userId: user.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const walletRoutes = require('./Wallet_API_Endpoints');

const app = express();

// Security Headers untuk memblokir eksploitasi browser/vulnerability luar
app.use(helmet());
app.use(express.json());

// Implementasi Rate Limiting sesuai spesifikasi .env
const apiLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: { error: "Terlalu banyak permintaan dari node ini. Akses ditangguhkan sementara." }
});

// Terapkan limiter ke seluruh rute API publik
app.use('/api/', apiLimiter);

// Registrasi Route Wallet & Konsensus
app.use('/api/v1/wallet', walletRoutes);

// Base Endpoint untuk Monitor Kesehatan Node (Terintegrasi ke Metabase/Elastic)
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
        status: "OPERATIONAL",
        node_identity: process.env.NODE_IDENTITY,
        timestamp: new Date().toISOString(),
        consensus_state: "SYNCED"
    });
});

// Global Error Handler untuk mencegah kebocoran stack trace ke publik
app.use((err, req, res, next) => {
    console.error(`[ERROR] [${new Date().toISOString()}]`, err.message);
    res.status(500).json({ error: "Terjadi kesalahan internal pada jaringan STG." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`[STG INTERFACE] Jaringan aktif pada port ${PORT} di bawah otoritas ${process.env.NODE_IDENTITY}`);
});
