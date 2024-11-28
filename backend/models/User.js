const mongoose = require('mongoose');

// Transaction schema to track deposits and withdrawals
const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['deposit', 'withdraw'],
    required: true
  },
  txHash: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending'
  }
});

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  walletAddress: { 
    type: String, 
    required: true 
  },
  privateKey: { 
    type: String, 
    required: true 
  },
  balance: { 
    type: Number, 
    default: 0 // This tracks the user's main balance in USDT or another currency
  },
  gameBalance: { 
    type: Number, 
    default: 0 // This tracks the balance for the game-related transactions
  },
  transactions: [transactionSchema], // Array to store transaction data (deposits/withdrawals)
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Indexing for faster queries (optional)
userSchema.index({ email: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;

