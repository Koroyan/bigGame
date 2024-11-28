const mongoose = require('mongoose');

const bigGame = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    transactionId: { type: String, required: true },
    amount: { type: Number, required: true },
    purchaseDate: { type: Date, default: Date.now },
  });

  const BigGame = mongoose.model('BigGame', bigGame);

  module.exports = BigGame;