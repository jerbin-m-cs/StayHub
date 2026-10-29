const Booking = require('../models/Booking');
const Room = require('../models/Room');

const isValidDate = (value, date) =>
  typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(date.getTime()) &&
  date.toISOString().slice(0, 10) === value;

const addBooking = async (req, res) => {
  const { customerName, customerPhone, roomId, checkInDate, checkOutDate } = req.body || {};
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  if (
    typeof customerName !== 'string' || !customerName.trim() ||
    typeof customerPhone !== 'string' || !customerPhone.trim() ||
    typeof roomId !== 'string' || !roomId.trim() ||
    !isValidDate(checkInDate, checkIn) || !isValidDate(checkOutDate, checkOut) ||
    checkOut <= checkIn
  ) {
    return res.status(400).json({ message: 'Enter valid customer details and a check-out date after check-in.' });
  }

  try {
    const room = await Room.findOneAndUpdate(
      { roomId: roomId.trim(), availabilityStatus: true },
      { $set: { availabilityStatus: false } },
      { new: true }
    );
    if (!room) {
      const exists = await Room.exists({ roomId: roomId.trim() });
      return res.status(exists ? 409 : 404).json({
        message: exists ? 'Room is already booked.' : 'Room not found.'
      });
    }

    try {
      const booking = await Booking.create({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        roomId: room.roomId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        userId: req.user.id
      });
      return res.status(201).json(booking);
    } catch (error) {
      await Room.updateOne({ _id: room._id }, { $set: { availabilityStatus: true } });
      if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
      }
      throw error;
    }
  } catch (error) {
    console.error('Creating booking failed:', error);
    return res.status(500).json({ message: 'Unable to create booking.' });
  }
};

const getBookings = async (req, res) => {
  try {
    const query = req.user.role === 'staff' ? {} : { userId: req.user.id };
    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    return res.status(200).json(bookings);
  } catch (error) {
    console.error('Loading bookings failed:', error);
    return res.status(500).json({ message: 'Unable to load bookings.' });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const query = { _id: req.params.id, status: 'Booked' };
    if (req.user.role === 'user') {
      query.userId = req.user.id;
    }

    const booking = await Booking.findOneAndUpdate(
      query,
      { $set: { status: 'Cancelled' } },
      { new: true }
    );
    if (!booking) {
      const existing = await Booking.exists({ _id: req.params.id });
      return res.status(existing ? 409 : 404).json({
        message: existing ? 'Booking is already cancelled or you do not have access to it.' : 'Booking not found.'
      });
    }

    try {
      await Room.updateOne({ roomId: booking.roomId }, { $set: { availabilityStatus: true } });
    } catch (error) {
      await Booking.updateOne({ _id: booking._id, status: 'Cancelled' }, { $set: { status: 'Booked' } });
      throw error;
    }
    return res.status(200).json({ message: 'Booking cancelled and room is now available.', booking });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid booking ID.' });
    }
    console.error('Cancelling booking failed:', error);
    return res.status(500).json({ message: 'Unable to cancel booking.' });
  }
};

module.exports = { addBooking, getBookings, cancelBooking };
