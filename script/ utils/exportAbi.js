const fs = require("fs");
const path = require("path");

const artifact = require("../artifacts/contracts/Qubicoin.sol/Qubicoin.json");
const dest = path.resolve(__dirname, "../abi/Qubicoin.json");

fs.writeFileSync(dest, JSON.stringify(artifact.abi, null, 2));
console.log("ABI exported to abi/Qubicoin.json");
