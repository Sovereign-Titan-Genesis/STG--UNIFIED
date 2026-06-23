# Skrip Pengontrol Kepatuhan Kebijakan Treasury (Fase 4)
class TreasuryPolicyController:
    def __init__(self, total_pool_usdt):
        self.total_pool = total_pool_usdt
        # Memuat parameter berbasis rasio risiko dari Bab I & II Policy Framework
        self.max_exposure_pct = 0.20  # Pasal 1: 20% Max Single Asset Exposure
        self.daily_limit_pct = 0.005   # Pasal 3: 0.5% Max Daily Convert
        
    def verify_transaction_compliance(self, asset_name, transaction_amount, current_asset_holding):
        print(f"📡 [TREASURY CONTROLLER] Memeriksa Usulan Transaksi untuk Aset: {asset_name}")
        
        # Kalkulasi batasan dinamis
        max_allowed_holding = self.total_pool * self.max_exposure_pct
        max_daily_convert_allowed = self.total_pool * self.daily_limit_pct
        
        # Validasi Pasal 1 (Batas Konsentrasi)
        exposure_check = (current_asset_holding + transaction_amount) <= max_allowed_holding
        # Validasi Pasal 3 (Batas Transfer Harian)
        daily_limit_check = transaction_amount <= max_daily_convert_allowed
        
        print(f"📊 Evaluasi Konsentrasi Aset ({asset_name}) : {'✅ AMAN' if exposure_check else '❌ EXPOSURE LIMIT VIOLATION'}")
        print(f"📊 Evaluasi Batas Harian (Max Global)    : {'✅ PATUH' if daily_limit_check else '❌ EXCEED DAILY TRANSFER LIMIT'}")
        
        if not exposure_check or not daily_limit_check:
            return "TRIGGER_MULTI_SIG_LOCKDOWN: Transaksi dialihkan ke review manual 72 Jam (Timelock Pasal 4)."
        return "TRIGGER_AUTOMATED_EXECUTION: Transaksi aman, kirim event logs ke Slack #treasury-transparency."

if __name__ == "__main__":
    # Inisialisasi controller dengan basis modal $20B USDT Koridor Luar Negeri
    controller = TreasuryPolicyController(total_pool_usdt=20_000_000_000)
    
    # Simulasi pengeluaran dana operasional sebesar $150M USD (Melampaui batas harian 0.5% yaitu $100M)
    action = controller.verify_transaction_compliance(asset_name="QSTATE_KOREA", transaction_amount=150_000_000, current_asset_holding=1_000_000)
    print(f"\n⚠️ REKOMENDASI SISTEM LOGS: {action}")
