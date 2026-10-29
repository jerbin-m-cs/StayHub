const Room = require('../models/Room');
const Booking = require('../models/Booking');

const addRoom = async (req, res) => {
  try {
    const { roomId, roomType, pricePerNight } = req.body || {};
    const room = await Room.create({ roomId, roomType, pricePerNight });
    return res.status(201).json(room);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A room with this room ID already exists.' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    console.error('Adding room failed:', error);
    return res.status(500).json({ message: 'Unable to add room.' });
  }
};

const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ roomId: 1 });
    return res.status(200).json(rooms);
  } catch (error) {
    console.error('Loading rooms failed:', error);
    return res.status(500).json({ message: 'Unable to load rooms.' });
  }
};

const updateRoom = async (req, res) => {
  try {
    const updates = {};
    const body = req.body || {};
    for (const field of ['roomType', 'pricePerNight']) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        updates[field] = body[field];
      }
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'Provide roomType or pricePerNight to update.' });
    }

    const room = await Room.findOneAndUpdate(
      { roomId: req.params.id },
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!room) {
      return res.status(404).json({ message: 'Room not found.' });
    }
    return res.status(200).json(room);
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ message: error.message });
    }
    console.error('Updating room failed:', error);
    return res.status(500).json({ message: 'Unable to update room.' });
  }
};

const deleteRoom = async (req, res) => {
  try {
    const activeBooking = await Booking.exists({ roomId: req.params.id, status: 'Booked' });
    if (activeBooking) {
      return res.status(409).json({ message: 'A room with an active booking cannot be deleted.' });
    }

    const room = await Room.findOneAndDelete({
      roomId: req.params.id,
      availabilityStatus: true
    });
    if (!room) {
      const exists = await Room.exists({ roomId: req.params.id });
      return res.status(exists ? 409 : 404).json({
        message: exists ? 'A booked room cannot be deleted.' : 'Room not found.'
      });
    }
    return res.status(200).json({ message: 'Room deleted successfully.' });
  } catch (error) {
    console.error('Deleting room failed:', error);
    return res.status(500).json({ message: 'Unable to delete room.' });
  }
};

module.exports = { addRoom, getRooms, updateRoom, deleteRoom };
