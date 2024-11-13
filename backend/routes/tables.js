// backend/routes/tables.js
const express = require('express');
const router = express.Router();
const Table = require('../models/Table'); // Import Table model
const User = require('../models/User'); // Import User model
const jwt = require('jsonwebtoken');


const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization').split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

// Get All Tables
router.get('/',authenticateJWT, async (req, res) => {
  try {
    const tables = await Table.find(); // Fetch all tables from the database
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Register a user for a table
router.post('/:tableId/register',authenticateJWT, async (req, res) => {
  const { tableId } = req.params;
  const { id } = req.user; 
  console.log('Received request to register user:', id, req.body);
  try {
    const table = await Table.findById(tableId);
    
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

// Secure endpoint for selecting a winner
router.post('/:tableId/selectWinner',authenticateJWT, async (req, res) => {
  const { tableId } = req.params;

  try {
    const table = await Table.findById(tableId);
    
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    if (table.players.length === 0) {
      return res.status(400).json({ message: 'No players available' });
    }

    // Use secure RNG to select a winner
    const randomIndex = crypto.randomInt(0, table.players.length);
    const winnerId = table.players[randomIndex];

    table.winners.push(winnerId);
    await table.save();

    res.json({ winnerId });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;
