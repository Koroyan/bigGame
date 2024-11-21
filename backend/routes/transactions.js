const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken'); // Make sure to include this at the top of your file
const User = require('../models/User'); // Adjust the import path as necessary
const { decrypt } = require('../utild/cryptoUtils');
const bcrypt = require('bcrypt');

const { Web3 } = require('web3');

const BigNumber = require('bignumber.js');

const web3 = new Web3('https://sepolia.infura.io/v3/64b6a0094b4b40af96688a94ff2c990f'); // Connect to Sepolia testnet via Infura

// Update this with the correct ABI for your USDT contract on Sepolia
const contractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"burnFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}];

// Address of USDT (or another ERC-20 token) on Sepolia
const contractAddress = '0xd38eb885A35AeE52B4E238d9Db73F60eDb74f183'; // Goerli USDT address
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Check Ethereum connection and accounts
(async () => {
  try {
    const isConnected = await web3.eth.net.isListening();
    if (isConnected) {
      console.log("Connected to Sepolia node");

      const accounts = await web3.eth.getAccounts();
      console.log(`Accounts: ${accounts}`);

      for (let account of accounts) {
        const balance = await web3.eth.getBalance(account);
        const etherBalance = web3.utils.fromWei(balance, 'ether');
        console.log(`Account: ${account}, Balance: ${etherBalance} Ether`);
      }
    } else {
      console.log("Failed to connect to the Sepolia node");
    }
  } catch (error) {
    console.error("Error:", error);
  }
})();

// Middleware to authenticate the token
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Get token from Authorization header
  if (!token) return res.sendStatus(401); // No token, unauthorized

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Invalid token, forbidden
    req.user = user; // Store user info in request
    next(); // Proceed to next middleware/route
  });
};



router.post('/withdraw', authenticateToken, async (req, res) => {
  try {
    // Token verification is done in authenticateToken middleware, so req.user is available
    const { to, amount } = req.body; // Expecting { to: 'recipientAddress', amount: 'withdrawAmount' }
    const { id } = req.user; // User ID from the token

    console.log(to);
    console.log(req.user.address);
    // Fetch user data from the database
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { walletAddress: from, privateKey } = user;

    const decryptedPrivateKey = decrypt(privateKey);

    const decimals = await contract.methods.decimals().call();
    const scaledAmount = new BigNumber(amount).multipliedBy(new BigNumber(10).exponentiatedBy(decimals)).toString();
    console.log('Scaled Amount:', scaledAmount.toString());

    const balance = await contract.methods.balanceOf(from).call();
    const balanceBig = new BigNumber(balance);

   console.log(balance);
    // Check for insufficient balance
    if (balanceBig.lt(new BigNumber(scaledAmount))) {
      return res.status(400).json({ error: 'Insufficient balance: ' + balanceBig.toString() });
    }

    // Estimate gas for transfer
    const gasEstimate = await contract.methods.transfer(to, scaledAmount).estimateGas({ from });
    const tx = {
      from: from,
      to: contractAddress,
      gas: Math.floor(gasEstimate * 1.2), // Add buffer
      data: contract.methods.transfer(to, scaledAmount).encodeABI(),
      nonce: await web3.eth.getTransactionCount(from, 'latest'),
      gasPrice: await web3.eth.getGasPrice(),
    };

    const signedTx = await web3.eth.accounts.signTransaction(tx, decryptedPrivateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    res.json({ message: "Withdraw successful", receipt });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});



// Get USDT Balance
router.post('/get-balance', authenticateToken, async (req, res) => {
  try {
    const { address } = req.body; // Expecting the address in the request body

    console.log(address);
    // Check if the address is valid
    if (!web3.utils.isAddress(address)) {
      return res.status(400).json({ error: 'Invalid Ethereum address' });
    }

    // Get the USDT balance of the specified address
    const balance = await contract.methods.balanceOf(address).call();
    const decimals = await contract.methods.decimals().call();
    const scaledBalance = new BigNumber(balance).dividedBy(new BigNumber(10).exponentiatedBy(decimals)).toString();

    res.json({ address, balance: scaledBalance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Withdraw Tokens
// router.post('/withdraw', async (req, res) => {
//   try {
//     const { from, privateKey, to, amount } = req.body;
//     const decimals = await contract.methods.decimals().call();
//     const scaledAmount = new BigNumber(amount).multipliedBy(new BigNumber(10).exponentiatedBy(decimals)).toString();
//       console.log('Scaled Amount:', scaledAmount.toString());

    
//       const balance = await contract.methods.balanceOf(from).call();
//       const balanceBig = new BigNumber(balance);
//       // Check for insufficient balance
//       if (balanceBig.lt(new BigNumber(scaledAmount))) {
//         return res.status(400).json({ error: 'Insufficient balance '+balanceBig });
//       }
//     // Estimate gas for transfer
//     const gasEstimate = await contract.methods.transfer(to, scaledAmount).estimateGas({ from });
//     const tx = {
//       from: from,
//       to: contractAddress,
//       gas: Math.floor(gasEstimate * 1.2), // Add buffer
//       data: contract.methods.transfer(to, scaledAmount).encodeABI(),
//       nonce: await web3.eth.getTransactionCount(from, 'latest'),
//       gasPrice: await web3.eth.getGasPrice(),
//     };

//     const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
//     const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

//     res.json({ message: "Withdraw successful", receipt });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: error.message });
//   }
// });


// Transfer Ether
router.post('/transfer', async (req, res) => {
  try {
    const { from, privateKey, to, amount } = req.body;
    const gasEstimate = await web3.eth.estimateGas({
      from: from,
      to: to,
      value: web3.utils.toWei(amount.toString(), 'ether'),
    });

    const tx = {
      from: from,
      to: to,
      value: web3.utils.toWei(amount.toString(), 'ether'),
      gas: Math.floor(gasEstimate * 1.2), // Add buffer for gas
      gasPrice: await web3.eth.getGasPrice(),
      nonce: await web3.eth.getTransactionCount(from, 'latest'),
    };

    const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    res.json({ message: "Ether transfer successful", receipt });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

