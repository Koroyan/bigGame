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


const data = [
  { option: '1 USDT', prizeAmount: 1 },
  { option: '1 USDT',  prizeAmount: 1 },
  { option: '2 USDT',  prizeAmount: 2 },
  { option: '3 USDT',  prizeAmount: 3 },
  { option: '5 USDT',  prizeAmount: 5 },
  { option: '8 USDT',  prizeAmount: 8 },
  { option: '13 USDT',  prizeAmount: 13 },
  { option: '21 USDT',  prizeAmount: 21 },
  { option: '34 USDT',  prizeAmount: 21 },
  { option: 'Bomb',  prizeAmount: 0 },
];

  router.post('/spin', authenticateToken, async (req, res) => {
    try {
      const { amount } = req.body; // Expecting { to: 'recipientAddress', amount: 'withdrawAmount' }
      const { id } = req.user; // User ID from the token

    const to = process.env.GAME_WALLET;
  
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
  
    
  
      // USDT TRC20 contract address on Shasta Testnet (or mainnet if needed)
      const USDT_CONTRACT_ADDRESS = 'TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs'; // Replace with the correct contract address (testnet or mainnet)
  
      // Create a contract instance for USDT (TRC20 token)
      const contract = await tronWeb.contract().at(USDT_CONTRACT_ADDRESS);

      var balance = await contract.methods.balanceOf(walletAddress).call();
  
      // Convert the balance from a big number to a human-readable format (USDT has 6 decimals)
       balance = tronWeb.toDecimal(balance) / 1e6; 

      if(balance<amount){

      }


  
      // Call the 'transfer' method on the USDT TRC20 contract
      const result = await contract.methods.transfer(to, tronWeb.toSun(amount)).send(); // Convert amount to Sun (smallest unit)
  
      // Handle the result
      if (result.result) {
        console.log('Transaction successful:', result);

        //please add here random index from data array and return spin win index please make logiic what vthis game should win 30% of money you csn save information in mongodb database to get winned percent if 30% of winned you can los for user and give wins if not will be win game



      

        return res.status(200).json({ index });
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
