const express = require('express');
const router = express.Router();
const Game = require('../models/Game'); // Import Table model
const User = require('../models/User'); // Import User model
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Import crypto module

// Middleware to authenticate JWT tokens
const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Optional chaining for safe access

  if (!token) {
    return res.status(403).json({ message: 'Token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403); // Forbidden
    }
    req.user = user;
    next();
  });
};

// Get All Tables (Games)
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const tables = await Game.find(); // Fetch all tables (games)
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Register a user for a table
router.post('/:tableId/register', authenticateJWT, async (req, res) => {
  const { tableId } = req.params;
  const { id } = req.user;

  try {
    const table = await Game.findById(tableId);
    
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    if (new Date() > table.expiresAt) {
      return res.status(400).json({ message: 'Table has already expired' });
    }

    if (table.players.includes(id)) {
      return res.status(400).json({ message: 'User is already registered for this table' });
    }

    table.players.push(id);
    await table.save();

    res.json({ message: 'User registered to the table' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Select a winner for a table
router.post('/:tableId/selectWinner', authenticateJWT, async (req, res) => {
  const { tableId } = req.params;

  try {
    const table = await Game.findById(tableId);
    
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    if (table.players.length === 0) {
      return res.status(400).json({ message: 'No players available' });
    }

    // Randomly select a winner
    const randomIndex = crypto.randomInt(0, table.players.length);
    const winnerId = table.players[randomIndex];

    table.winners.push(winnerId);
    await table.save();

    // Optionally, update the winner's prize balance
    const winner = await User.findById(winnerId);
    if (winner) {
      winner.balance += table.prize;
      await winner.save();
    }

    res.json({ winnerId });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;
