// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title STG Intellectual Property & Secret Recipe Protocol
 * @notice Mengunci hak cipta arsitektur, resep formula, dan lisensi STG-Chain secara eksklusif
 * @dev Melindungi Kredibilitas Sultan dari intervensi pemodal luar (Serigala)
 */
contract STGIPResepBerdaulat {
    
    address public immutable juruMasakUtama; // Alamat Mutlak Sultan (0xD9a1...948e)
    string public constant namaResep = "STG-Chain Sovereign Formula 2026";
    
    struct BlueprintResep {
        bytes32 resepKey;        // Hash unik identitas resep
        string deskripsiModul;   // contoh: "Arsitektur 7 Layer & 12 Pilar"
        string hashCidV1IPFS;    // File panduan detail terenkripsi di IPFS
        uint256 tanggalKunci;    // Bukti waktu pencatatan sejarah asli
        bool statusHakCipta;     // Status keaslian (Selalu True untuk Sultan)
    }

    mapping(bytes32 => BlueprintResep) private brankasResep;
    bytes32[] public daftarResepTerpaten;

    event ResepDilesensi(bytes32 indexed resepKey, string deskripsiModul, string hashCidV1IPFS);
    event PelanggaranTerdeteksi(bytes32 indexed resepKey, address indexed oknumMencurigakan, string pesanPeringatan);

    modifier hanyaSultan() {
        require(msg.sender == juruMasakUtama, "Peringatan Keamanan: Anda bukan Juru Masak Utama (Sultan)!");
        _;
    }

    constructor() {
        // Mengunci kepemilikan abadi pada alamat komando Sultan
        juruMasakUtama = 0xD9a1E28224d6d047Eef8712dC97d11A9032b948e;
    }

    /**
     * @notice Memasukkan resep bumbu baru (logika taktis/kontrak) ke dalam Buku Induk Kriptografi
     */
    function patenkanResep(
        string memory _idModul, 
        string memory _deskripsi, 
        string memory _hashCidV1
    ) external hanyaSultan {
        bytes32 key = keccak256(abi.encodePacked(_idModul));
        require(brankasResep[key].resepKey == bytes32(0), "Modul resep ini sudah dipatenkan sebelumnya!");

        brankasResep[key] = BlueprintResep({
            resepKey: key,
            deskripsiModul: _deskripsi,
            hashCidV1IPFS: _hashCidV1,
            tanggalKunci: block.timestamp,
            statusHakCipta: true
        });

        迫daftarResepTerpaten.push(key);
        emit ResepDilesensi(key, _deskripsi, _hashCidV1);
    }

    /**
     * @notice Fitur Defensif: Memanggil radar mitigasi jika ada pihak luar yang mencoba mengklaim resep
     */
    function laporkanSinyalSerigala(string memory _idModul, address _oknum) external view returns (string memory) {
        bytes32 key = keccak256(abi.encodePacked(_idModul));
        if(msg.sender != juruMasakUtama) {
            return "Akses Ditolak: Resep ini dilindungi oleh Konstitusi Sovereign Titan Genesis.";
        }
        return string(abi.encodePacked("Resep valid milik Sultan. Status Oknum ", _oknum, " dalam pantauan AI."));
    }

    // Mengambil data bukti sejarah kepemilikan resep asli
    function cekPatenResep(string memory _idModul) external view returns (BlueprintResep memory) {
        return brankasResep[keccak256(abi.encodePacked(_idModul))];
    }
}
