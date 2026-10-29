const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  roomId: { type: String, required: true },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  status: { type: String, enum: ['Booked', 'Cancelled'], default: 'Booked' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);