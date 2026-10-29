const express = require('express');
const router = express.Router(); // 👈 Make sure this is here too!
const { addBooking, getBookings, cancelBooking } = require('../controllers/bookingController');
const { verifyToken, verifyUser } = require('../middleware/authMiddleware');

router.get('/', verifyToken, getBookings);
router.post('/', verifyUser, addBooking);
router.put('/cancel/:id', verifyUser, cancelBooking);

module.exports = router;