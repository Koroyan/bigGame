const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import the User model
const { ethers } = require('ethers'); // Import ethers
const { encrypt } = require('../utild/cryptoUtils');

// Global variable for storing the user's wallet address
let userWalletAddress = null;

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

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }


    // Generate a new Ethereum wallet
    const wallet = ethers.Wallet.createRandom(); // Create a random wallet
    const walletAddress = wallet.address; // Get the wallet address
    const privateKey = wallet.privateKey;


    const hashedPassword = await bcrypt.hash(password, 10);

        // Encrypt the private key
        const encryptedPrivateKey = encrypt(privateKey);
    
    // Create a new user
    const newUser = new User({
      email,
      password: hashedPassword,
      walletAddress: walletAddress,
      privateKey: encryptedPrivateKey 
    });

    await newUser.save(); // Save the user to the database

    res.status(201).json({ message: 'User registered successfully', walletAddress: newUser.walletAddress });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Store both the user ID and wallet address in the JWT token
    const token = jwt.sign(
      { id: user._id, walletAddress: user.walletAddress,pk:user.privateKey }, // Include walletAddress in the token
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    res.json({ token }); // Return the token
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Get User Details
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // Exclude the password field
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user); // Send user details
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
