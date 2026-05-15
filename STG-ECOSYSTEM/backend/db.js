cd ~/Sovereign-Titan-Genesis/

cat << 'EOF' > STG-ECOSYSTEM/backend/db.js
// 🏛️ PROTOTYPE BANK STG - AUTOMATED CENTRAL BALANCE SHEET LEDGER
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@stg-db:5432/stg_unified"
});

const initializeBankSchema = async () => {
    // 1. Tabel Rekening Bank STG
    const createAccountsTable = `
        CREATE TABLE IF NOT EXISTS bank_accounts (
            account_number VARCHAR(50) PRIMARY KEY,
            account_name VARCHAR(100) NOT NULL,
            account_type VARCHAR(30) NOT NULL, -- SOVEREIGN, INCUBATOR, PUBLIC
            balance_aksa NUMERIC(28, 6) DEFAULT 0.000000,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    // 2. Tabel Ledger Pembukuan Mutasi (Double-Entry Log)
    const createLedgerTable = `
        CREATE TABLE IF NOT EXISTS bank_ledger (
            tx_id SERIAL PRIMARY KEY,
            from_account VARCHAR(50) REFERENCES bank_accounts(account_number),
            to_account VARCHAR(50) REFERENCES bank_accounts(account_number),
            amount_aksa NUMERIC(28, 6) NOT NULL,
            tx_type VARCHAR(20) NOT NULL, -- DEPOSIT, WITHDRAWAL, TRANSFER
            reference_note TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    // 3. Tambahan Tabel Telemetri Node (Phase 10)
    const createTelemetryTable = `
        CREATE TABLE IF NOT EXISTS node_telemetry (
            id SERIAL PRIMARY KEY,
            node_id VARCHAR(50) NOT NULL,
            block_height VARCHAR(20) NOT NULL,
            recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await pool.query(createAccountsTable);
        await pool.query(createLedgerTable);
        await pool.query(createTelemetryTable);
        
        // 🔮 SEED DATA AWAL: Otomatis buat Rekening Kedaulatan Sultan jika belum ada
        const seedSovereignAccount = `
            INSERT INTO bank_accounts (account_number, account_name, account_type, balance_aksa)
            VALUES ('STG-BANK-RESERVE-008', 'Sultan Andi Muhammad Harpianto - Sovereign Pool', 'SOVEREIGN', 100000000000.000000)
            ON CONFLICT DO NOTHING;
        `;
        await pool.query(seedSovereignAccount);

        console.log("🏦 BANK STG: Financial database balance sheet schemas operational and synchronized.");
    } catch (err) {
        console.error("🚨 Bank Schema Error:", err.message);
    }
};

initializeBankSchema();

module.exports = pool;
EOF
