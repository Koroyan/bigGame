// routes/roulette.js
const express = require('express');
const router = express.Router();
const Participant = require('../models/RouletteParticipants');


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

// Register a new participant
router.post('/register',authenticateToken, async (req, res) => {
  const { name } = req.body;

  const newParticipant = new Participant({ name });
  try {
    await newParticipant.save();
    res.status(201).json({ message: 'Participant registered successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Error registering participant.' });
  }
});

// Get all participants
router.get('/participants',authenticateToken, async (req, res) => {
  try {
    const participants = await Participant.find();
    res.json(participants);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching participants.' });
  }
});

module.exports = router;
