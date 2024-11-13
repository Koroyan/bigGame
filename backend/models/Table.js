const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  cost: Number, // Table cost (e.g., 1 USDT, 5 USDT, etc.)
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  winners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const Table = mongoose.model('Table', tableSchema);
module.exports = Table;
