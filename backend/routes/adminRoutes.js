const express = require('express');
const {
  markPhoneSoldOffline,
  resolveBooking,
  getAllBookings,
  getDashboardStats,
} = require('../controllers/adminController');

const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.post('/sold-offline/:id', markPhoneSoldOffline);
router.post('/resolve-booking/:id', resolveBooking);
router.get('/bookings', getAllBookings);
router.get('/stats', getDashboardStats);

module.exports = router;
