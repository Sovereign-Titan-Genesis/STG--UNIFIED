// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title STG Sovereign Reserve Multi-Sig & Veto Protocol
 * @notice Mengunci dana $255M dengan sistem keamanan Multi-Sig dan Hak Veto absolut Sultan.
 */
contract StgSovereignReserve {
    
    address public immutable SULTAN; // Alamat mutlak Sultan
    uint256 public constant TOTAL_RESERVE = 255_000_000 * 10**6; // Nilai patokan dalam basis stablecoin (USDC/USDT 6 desimal)
    
    address[] public dewanDireksi;
    mapping(address => bool) public isDewan;
    uint256 public constant MIN_PERSETUJUAN = 3;

    struct Transaksi {
        address tujuan;
        uint256 jumlah;
        bytes data;
        bool tereksekusi;
        uint256 jumlahPersetujuan;
        bool diVetoSultan;
    }

    Transaksi[] public daftarTransaksi;
    // Transaksi ID => Alamat Dewan => Sudah Setuju?
    mapping(uint256 => mapping(address => bool)) public sudahSetuju;

    event TransaksiDiajukan(uint256 indexed txId, address indexed pengaju, address tujuan, uint256 jumlah);
    event TransaksiDisetujui(uint256 indexed txId, address indexed dewan);
    event TransaksiDieksekusi(uint256 indexed txId);
    event VetoSultanAktif(uint256 indexed txId);

    modifier hanyaDewan() {
        require(isDewan[msg.sender], "Akses ditolak: Anda bukan bagian dari Dewan!");
        _;
    }

    modifier hanyaSultan() {
        require(msg.sender == SULTAN, "Akses ditolak: Hanya Sultan yang memiliki hak ini!");
        _;
    }

    constructor(address[] memory _dewan AsetAI) {
        SULTAN = 0xd9a1e28224d6d047eef8712dc97d11a9032b948e;
        isDewan[SULTAN] = true;
        dewanDireksi.push(SULTAN);

        for (uint256 i = 0; i < _dewanAsetAI.length; i++) {
            address anggota = _dewanAsetAI[i];
            if (anggota != address(0) && !isDewan[anggota]) {
                isDewan[anggota] = true;
                dewanDireksi.push(anggota);
            }
        }
        require(dewanDireksi.length == 5, "Total anggota dewan harus tepat 5 entitas.");
    }

    /**
     * @notice Mengajukan pemindahan dana operasional
     */
    function ajukanTransaksi(address _tujuan, uint256 _jumlah, bytes memory _data) external hanyaDewan returns (uint256) {
        uint256 txId = daftarTransaksi.length;
        
        daftarTransaksi.push(Transaksi({
            tujuan: _tujuan,
            jumlah: _jumlah,
            data: _data,
            tereksekusi: false,
            jumlahPersetujuan: 0,
            diVetoSultan: false
        }));

        emit TransaksiDiajukan(txId, msg.sender, _tujuan, _jumlah);
        return txId;
    }

    /**
     * @notice Memberikan tanda tangan persetujuan dewan
     */
    function setujuiTransaksi(uint256 _txId) external hanyaDewan {
        Transaksi storage txSovereign = daftarTransaksi[_txId];
        require(!txSovereign.tereksekusi, "Transaksi sudah dijalankan.");
        require(!txSovereign.diVetoSultan, "Transaksi ini telah di-veto oleh Sultan.");
        require(!sudahSetuju[_txId][msg.sender], "Anda sudah menyetujui transaksi ini.");

        sudahSetuju[_txId][msg.sender] = true;
        txSovereign.jumlahPersetujuan += 1;

        emit TransaksiDisetujui(_txId, msg.sender);
    }

    /**
     * @notice Mengeksekusi transaksi setelah kuorum 3/5 terpenuhi
     */
    function eksekusiTransaksi(uint256 _txId) external hanyaDewan {
        Transaksi storage txSovereign = daftarTransaksi[_txId];
        require(!txSovereign.tereksekusi, "Transaksi sudah dijalankan.");
        require(!txSovereign.diVetoSultan, "Proteksi aktif: Transaksi terkena veto Sultan.");
        require(txSovereign.jumlahPersetujuan >= MIN_PERSETUJUAN, "Kuorum tanda tangan belum terpenuhi.");

        txSovereign.tereksekusi = true;
        (bool sukses, ) = txSovereign.tujuan.call(txSovereign.data);
        require(sukses, "Eksekusi transfer gagal di tingkat blockchain.");

        emit TransaksiDieksekusi(_txId);
    }

    /**
     * @notice HAK VETO MUTLAK SULTAN: Membatalkan transaksi apa pun secara sepihak
     */
    function aktifkanVetoSultan(uint256 _txId) external hanyaSultan {
        Transaksi storage txSovereign = daftarTransaksi[_txId];
        require(!txSovereign.tereksekusi, "Nasi sudah menjadi bubur, transaksi sudah terlanjur dieksekusi.");
        
        txSovereign.diVetoSultan = true;
        emit VetoSultanAktif(_txId);
    }
}
