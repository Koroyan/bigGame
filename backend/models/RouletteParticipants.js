// models/Participant.js
const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  name: { type: String, required: true }
});

module.exports = mongoose.model('RouletteParticipant', participantSchema);
