const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { decrypt } = require('../utild/cryptoUtils');
const { TronWeb } = require('tronweb');

const tronWeb = new TronWeb({
  fullHost: 'https://api.shasta.trongrid.io',
  //headers: { 'TRON-PRO-API-KEY': 'your-api-key' }, // Uncomment if you use API key
  //privateKey: 'your private key'  // Optional if you have a global private key
});

const USDT_CONTRACT_ADDRESS = 'TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs'; // Testnet contract address
// const USDT_CONTRACT_ADDRESS = 'TXzFQ6vBBL8YcxGRbzHY3UR9pp1YwXy8oj'; // Mainnet contract address


// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Get token from Authorization header
  if (!token) return res.sendStatus(401); // If no token, return Unauthorized

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Invalid token, forbidden
    req.user = user; // Attach user to request object
    next(); // Proceed to next middleware or route
  });
};

router.get('/balance', authenticateToken, async (req, res) => {
  

       // Fetch user data from the database
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { walletAddress: walletAddress, privateKey } = user;

    if (!walletAddress) {
        return res.status(400).json({ error: "Wallet address is required" });
      }
    
      try {
        // Validate the wallet address format
        if (!tronWeb.isAddress(walletAddress)) {
          return res.status(400).json({ error: "Invalid TRON wallet address" });
        }

       const pk = decrypt(privateKey);
  
      tronWeb.setPrivateKey(pk);
      // Create TRC20 contract instance for USDT
      const contract = await tronWeb.contract().at(USDT_CONTRACT_ADDRESS);
  
      // Call balanceOf method of the TRC20 contract
      const balance = await contract.methods.balanceOf(walletAddress).call();
  
      // Convert the balance from a big number to a human-readable format (USDT has 6 decimals)
      const humanReadableBalance = tronWeb.toDecimal(balance) / 1e6; 
  
      console.log('USDT Balance:', humanReadableBalance);
  
      return res.status(200).json({ balance: humanReadableBalance });
    } catch (error) {
      console.error('Error fetching balance:', error);
      return res.status(500).json({ error: "Failed to fetch balance", details: error.message });
    }
  });

  router.post('/withdraw', authenticateToken, async (req, res) => {
    try {
      const { to, amount } = req.body; // Expecting { to: 'recipientAddress', amount: 'withdrawAmount' }
      const { id } = req.user; // User ID from the token
  
      console.log('Recipient Address:', to);
      console.log('User Wallet Address:', req.user.walletAddress);
  
      // Fetch user data from the database
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const { walletAddress: from, privateKey } = user;
  
      // Decrypt the private key for signing the transaction
      const decryptedPrivateKey = decrypt(privateKey);
      tronWeb.setPrivateKey(decryptedPrivateKey);
  
      // Log transaction details for debugging
      console.log(`Sending ${amount} USDT from ${from} to ${to}`);
  
      // USDT TRC20 contract address on Shasta Testnet (or mainnet if needed)
      const USDT_CONTRACT_ADDRESS = 'TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs'; // Replace with the correct contract address (testnet or mainnet)
  
      // Create a contract instance for USDT (TRC20 token)
      const contract = await tronWeb.contract().at(USDT_CONTRACT_ADDRESS);
  
      // Call the 'transfer' method on the USDT TRC20 contract
      const result = await contract.methods.transfer(to, tronWeb.toSun(amount)).send(); // Convert amount to Sun (smallest unit)
  
      // Handle the result
      if (result.result) {
        console.log('Transaction successful:', result);
        return res.status(200).json({ result });
      } else {
        console.error('Transaction failed:', result);
        return res.status(500).json({ error: 'Transaction failed', details: result });
      }
    } catch (error) {
      console.error('Error during transaction:', error);
      res.status(500).json({ error: error.message });
    }
  });
  


// Withdraw endpoint for TRC20 token withdrawal
router.post('/withdrawtrx', authenticateToken, async (req, res) => {
  try {
    const { to, amount } = req.body; // Expecting { to: 'recipientAddress', amount: 'withdrawAmount' }
    const { id } = req.user; // User ID from the token

    console.log('Recipient Address:', to);
    console.log('User Wallet Address:', req.user.walletAddress);

    // Fetch user data from the database
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { walletAddress: from, privateKey } = user;

    // Decrypt the private key for signing the transaction
    const decryptedPrivateKey = decrypt(privateKey);
    tronWeb.setPrivateKey(decryptedPrivateKey);

    // Log transaction details for debugging
    console.log(`Sending ${amount} TRX from ${from} to ${to}`);

    // Send the transaction
   const result = await tronWeb.trx.sendTransaction(to, amount,decryptedPrivateKey);
    
    // Handle result
    if (result.result) {
      console.log('Transaction successful:', result);
      return res.status(200).json({result});
    } else {
      console.error('Transaction failed:', result);
      return res.status(500).json({ error: 'Transaction failed', details: result });
    }
  } catch (error) {
    console.error('Error during transaction:', error);
    res.status(500).json({ error: error.message });
  }
});





module.exports = router;
