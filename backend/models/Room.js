const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true, trim: true },
  roomType: { type: String, required: true, trim: true },
  pricePerNight: { type: Number, required: true, min: 0 },
  availabilityStatus: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);