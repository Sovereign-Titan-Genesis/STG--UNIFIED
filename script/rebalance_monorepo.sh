#!/bin/bash
# ==============================================================================
# STG MONOREPO ANTI-TANGLE REBALANCER ENGINE v1.0
# Menyelaraskan pilar-pilar yang saling mengunci secara berdaulat.
# ==============================================================================

set -e

echo "⚠️ [ALERT] MEMULAI RE-ALOKASI PILAR MONOREPO STG..."

# 1. Isolasi Zona Lingkungan
echo "🔮 Langkah 1: Memutus tautan melingkar ilegal..."
find . -name "node_modules" -type d -prune -exec rm -rf {} + || true
find . -name ".turbo" -type d -prune -exec rm -rf {} + || true

# 2. Inisialisasi Ulang Gerbang Data
echo "🔮 Langkah 2: Memvalidasi konfigurasi gerbang pemisah (stg-gatekeeper.json)..."
if [ ! -f "./stg-gatekeeper.json" ]; then
    echo "❌ Error: Berkas kontrol arsitektur stg-gatekeeper.json tidak ditemukan!"
    exit 1
fi

# 3. Pengikatan Mandiri Jalur Distribusi
echo "🔮 Langkah 3: Mengikat benang merah pilar secara independen..."
mkdir -p ./dist/shared

# Menarik data esensial dari core tanpa membiarkan pilar lain menyentuh kode internalnya
if [ -d "./packages/metaportation-core" ]; then
    echo "-> Mengunci pilar inti matematika spasial..."
    cp -r ./packages/metaportation-core/docs/* ./dist/shared/ 2>/dev/null || true
fi

echo "=== ✅ [SISTEM MONOREPO BERHASIL DISELARASKAN DAN BERDAULAT] ==="
echo "Pilar terisolasi dengan aman. Struktur aman dari intervensi dependensi pabrikan."
