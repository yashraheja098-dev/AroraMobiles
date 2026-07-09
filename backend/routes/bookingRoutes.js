const express = require('express');
const {
  createBooking,
  verifyPayment,
  getMyBookings,
} = require('../controllers/bookingController');

const { protect } = require('../middlewares/auth');

const router = express.Router();

router.use(protect); // All routes below require auth

router.post('/', createBooking);
router.post('/verify', verifyPayment);
router.get('/my', getMyBookings);

module.exports = router;
