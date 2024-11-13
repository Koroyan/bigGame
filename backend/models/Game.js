const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  }, // The name of the game (e.g., "Every Minute", "Every 2 Minutes", etc.)
  
  cost: { 
    type: Number, 
    required: true 
  }, // Table cost (e.g., 1 USDT, 5 USDT, etc.)
  
  // This will represent how often the prize will be drawn
  interval: { 
    type: Number, 
    required: true, 
    // interval in seconds (e.g., 60 for every minute, 120 for every 2 minutes, 86400 for every day, etc.)
  },
  
  prize: { 
    type: Number, 
    required: true 
  }, // Prize amount (e.g., 100 USDT, 1,000 USDT)
  
  // Calculated time when the next prize will be drawn (for example, 60 seconds from now for "every minute")
  nextPrizeTime: { 
    type: Date, 
    required: true 
  },

  players: [
    { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }
  ], // List of players in this table (game)
  
  winners: [
    { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }
  ] // List of winners
}, { timestamps: true }); // Mongoose will automatically add createdAt and updatedAt fields

const Table = mongoose.model('Game', tableSchema);

module.exports = Table;
