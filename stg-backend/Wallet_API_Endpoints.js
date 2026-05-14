// Wallet API Endpoints

// 1. Generate new wallet (local only, not persisted yet)
app.post("/wallet/new", async (req, res) => {
  try {
    const wallet = ethers.Wallet.createRandom();
    res.json({
      address: wallet.address,
      privateKey: wallet.privateKey
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate wallet" });
  }
});

// 2. Get balance of wallet
app.get("/wallet/:address/balance", async (req, res) => {
  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const balance = await contract.balanceOf(req.params.address);
    res.json({
      address: req.params.address,
      balance: balance.toString()
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch balance" });
  }
});

// 3. Transfer tokens
app.post("/wallet/transfer", async (req, res) => {
  const { fromPrivateKey, toAddress, amount } = req.body;
  try {
    const wallet = new ethers.Wallet(fromPrivateKey, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
    const tx = await contract.transfer(toAddress, amount);
    await tx.wait();
    res.json({
      txHash: tx.hash,
      status: "success"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Transfer failed" });
  }
});
