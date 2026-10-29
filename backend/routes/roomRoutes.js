const express = require('express');
const router = express.Router(); // 👈 This line was missing!
const { addRoom, getRooms, updateRoom, deleteRoom } = require('../controllers/roomController');
const { verifyStaff } = require('../middleware/authMiddleware');

// Define routes
router.post('/', verifyStaff, addRoom);         // Only Staff
router.get('/', getRooms);                      // Everyone
router.put('/:id', verifyStaff, updateRoom);    // Only Staff
router.delete('/:id', verifyStaff, deleteRoom); // Only Staff

module.exports = router;