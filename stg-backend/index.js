import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { ethers } from "ethers";
import pkg from "pg";

// Jika Wallet_API_Endpoints masih menggunakan module.exports (CommonJS), 
// Anda bisa mengimpornya seperti di bawah ini di lingkungan ES Modules Node.js
import walletRoutes from "./Wallet_API_Endpoints.js";
import walletRoutes from "./Wallet_API_Endpoints.js";
// ...
app.use("/api/v1/wallet", walletRoutes);
dotenv.config();
const { Pool } = pkg;
const app = express();

// ==============================================================================
// 1. LAPISAN KEAMANAN DAN MIDDLEWARE UTAMA
// ==============================================================================
app.use(helmet()); // Mengamankan HTTP headers dari eksploitasi eksternal
app.use(cors());   // Mengatur Cross-Origin Resource Sharing jaringan publik
app.use(express.json()); // Parsing payload body berbasis JSON

// Implementasi Pembatasan Laju (Rate Limiting) untuk mencegah serangan DoS / Sybil
const apiLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // Default 15 menit
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,             // Maksimal request per window
    message: { error: "Terlalu banyak permintaan dari node Anda. Akses ditangguhkan sementara." }
});

// Terapkan limiter pada seluruh endpoint publik `/api/`
app.use("/api/", apiLimiter);

// ==============================================================================
// 2. INISIALISASI DATABASE & PROV_RPC (STG-Chain / Quorum Connection)
// ==============================================================================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.DATABASE_URL, 
});

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "http://127.0.0.1:8545");
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512";
const CONTRACT_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address,uint256) returns (bool)"
];

// ==============================================================================
// 3. REGISTRASI RUTING & ENDPOINT LOGIKA BISNIS
// ==============================================================================

// Integrasi Rute Dompet Berdaulat Publik
app.use("/api/v1/wallet", walletRoutes);

// Endpoint 1: Pengecekan Saldo Blockchain Aset Native
app.get("/api/v1/balance/:address", async (req, res, next) => {
  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const balance = await contract.balanceOf(req.params.address);
    res.json({ address: req.params.address, balance: balance.toString() });
  } catch (err) {
    next(err);
  }
});

// Endpoint 2: Registrasi Akun Pengguna Ke Database Lokal (stg_schema.sql)
app.post("/api/v1/register", async (req, res, next) => {
  const { username, email, address } = req.body;
  if (!username || !email || !address) {
    return res.status(400).json({ error: "Payload pendaftaran tidak valid atau tidak lengkap." });
  }

  try {
    // Memulai transaksi database terisolasi (Atomik)
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const userRes = await client.query(
        "INSERT INTO users (username, email) VALUES ($1, $2) RETURNING id",
        [username, email]
      );
      
      const userId = userRes.rows[0].id;
      await client.query(
        "INSERT INTO wallets (user_id, address) VALUES ($1, $2)",
        [userId, address]
      );
      
      await client.query('COMMIT');
      res.status(201).json({ message: "User registered successfully", userId });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
});

// Endpoint Checkpoint: Monitoring Kesehatan Jaringan (Metabase / Elastic)
app.get("/api/v1/health", (req, res) => {
    res.status(200).json({
        status: "OPERATIONAL",
        node_identity: process.env.NODE_IDENTITY || "STG_PUBLIC_NODE",
        timestamp: new Date().toISOString(),
        consensus_state: "SYNCED"
    });
});

// ==============================================================================
// 4. GLOBAL ERROR HANDLER & PROSES EKSEKUSI SERVER
// ==============================================================================

// Interseptor error global untuk mencegah kebocoran mentah stack trace ke publik
app.use((err, req, res, next) => {
    console.error(`[CRITICAL ERROR] [${new Date().toISOString()}]`, err.message);
    res.status(500).json({ error: "Terjadi kesalahan internal pada jaringan STG." });
});

// Jalankan pada port tunggal dari environment variable (default port 5000)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`[STG INTERFACE] Jaringan aktif secara penuh pada port ${PORT} di bawah otoritas ${process.env.NODE_IDENTITY || 'GENESIS'}`);
});
