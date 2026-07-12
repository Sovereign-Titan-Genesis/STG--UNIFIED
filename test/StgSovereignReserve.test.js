const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("STG Sovereign Reserve Multi-Sig & Veto Protocol", function () {
    let StgSovereignReserve, reserveContract;
    let sultan, aiK1, aiK2, cadanganSultan, sentinelK5, serigala;
    let dewanAsetAI;

    beforeEach(async function () {
        // Mengambil akun simulasi dari node Hardhat lokal
        [sultan, aiK1, aiK2, cadanganSultan, sentinelK5, serigala] = await ethers.getSigners();

        // Menyusun daftar 4 anggota dewan pendamping selain Sultan
        dewanAsetAI = [aiK1.address, aiK2.address, cadanganSultan.address, sentinelK5.address];

        // Melakukan kompilasi dan deploy kontrak pintar
        StgSovereignReserve = await ethers.getContractFactory("StgSovereignReserve");
        
        // Catatan: Di skrip asli, alamat Sultan di dalam constructor dikunci hardcode ke 0xd9a1...
        // Untuk keperluan simulasi testing, pastikan alamat akun `sultan` di local node disesuaikan
        reserveContract = await StgSovereignReserve.deploy(dewanAsetAI);
        await reserveContract.waitForDeployment();
    });

    describe("Inisialisasi & Otoritas", function () {
        it("Harus menetapkan Sultan sebagai pemegang hak veto absolut", async function () {
            expect(await reserveContract.SULTAN()).to.equal(sultan.address);
        });

        it("Harus menolak jika total anggota dewan tidak berjumlah tepat 5", async function () {
            const dewanKurang = [aiK1.address, aiK2.address];
            await expect(StgSovereignReserve.deploy(dewanKurang)).to.be.revertedWith(
                "Total anggota dewan harus tepat 5 entitas."
            );
        });
    });

    describe("Mekanisme Alur Transaksi & Kuorum (3/5)", function () {
        it("Harus berhasil mengeksekusi transaksi jika disetujui oleh 3 anggota dewan", async function () {
            // Simulasi pengajuan transaksi oleh AI K-1 untuk alokasi operasional gas fee
            const dataDummy = "0x";
            const jumlahTransfer = ethers.parseUnits("1000", 6); // 1000 USDC
            
            await reserveContract.connect(aiK1).ajukanTransaksi(aiK2.address, jumlahTransfer, dataDummy);

            // Persetujuan ke-1 (Sultan menyetujui)
            await reserveContract.connect(sultan).setujuiTransaksi(0);
            // Persetujuan ke-2 (AI K-1 menyetujui)
            await reserveContract.connect(aiK1).setujuiTransaksi(0);
            // Persetujuan ke-3 (AI K-2 menyetujui - Kuorum 3/5 Tercapai)
            await reserveContract.connect(aiK2).setujuiTransaksi(0);

            // Eksekusi transaksi harus berhasil tanpa revert
            await expect(reserveContract.connect(aiK1).eksekusiTransaksi(0))
                .to.emit(reserveContract, "TransaksiDieksekusi")
                .withArgs(0);
        });

        it("Harus gagal mengeksekusi jika kuorum minimal 3 tanda tangan belum terpenuhi", async function () {
            await reserveContract.connect(aiK1).ajukanTransaksi(aiK2.address, 100, "0x");
            await reserveContract.connect(sultan).setujuiTransaksi(0);
            await reserveContract.connect(aiK1).setujuiTransaksi(0); // Baru 2 persetujuan

            await expect(reserveContract.connect(aiK1).eksekusiTransaksi(0))
                .to.be.revertedWith("Kuorum tanda tangan belum terpenuhi.");
        });
    });

    describe("Simulasi Mitigasi Serangan 'Serigala' & Hak Veto Absolut", function () {
        it("Harus menggagalkan transaksi secara instan jika Sultan mengaktifkan Hak Veto", async function () {
            await reserveContract.connect(aiK1).ajukanTransaksi(aiK2.address, 5000000, "0x");

            // Anggota dewan lain mencoba menyetujui massal
            await reserveContract.connect(aiK1).setujuiTransaksi(0);
            await reserveContract.connect(aiK2).setujuiTransaksi(0);
            await reserveContract.connect(sentinelK5).setujuiTransaksi(0); // Kuorum 3 terpenuhi di tingkat dewan

            // Sultan mendeteksi kejanggalan dan langsung menjatuhkan Veto
            await expect(reserveContract.connect(sultan).aktifkanVetoSultan(0))
                .to.emit(reserveContract, "VetoSultanAktif")
                .withArgs(0);

            // Upaya eksekusi oleh pihak mana pun setelah veto wajib ditolak sistem
            await expect(reserveContract.connect(aiK1).eksekusiTransaksi(0))
                .to.be.revertedWith("Proteksi aktif: Transaksi terkena veto Sultan.");
        });

        it("Harus menolak jika entitas luar (Serigala) mencoba mengajukan atau menyetujui transaksi", async function () {
            await expect(
                reserveContract.connect(serigala).ajukanTransaksi(serigala.address, 1000000, "0x")
            ).to.be.revertedWith("Akses ditolak: Anda bukan bagian dari Dewan!");
        });
    });
});
