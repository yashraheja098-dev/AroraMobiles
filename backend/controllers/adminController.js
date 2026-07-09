const Phone = require('../models/Phone');
const Booking = require('../models/Booking');
const AuditLog = require('../models/AuditLog');

// @desc    Mark phone as sold offline (handles refunds if booked)
// @route   POST /api/admin/sold-offline/:id
// @access  Private/Admin
exports.markPhoneSoldOffline = async (req, res) => {
  try {
    const phone = await Phone.findById(req.params.id);

    if (!phone) {
      return res.status(404).json({ success: false, message: 'Phone not found' });
    }

    if (phone.status === 'Sold') {
      return res.status(400).json({ success: false, message: 'Phone is already sold' });
    }

    // Check if there is an active booking
    const booking = await Booking.findOne({ phone: phone._id, status: 'Active' }).populate('user');

    if (booking) {
      // Logic to initiate Razorpay refund (mocking it here)
      // await razorpay.payments.refund(booking.razorpayPaymentId);
      
      booking.status = 'System_Refunded';
      booking.paymentStatus = 'Refunded';
      await booking.save();

      // Log refund
      await AuditLog.create({
        action: 'BOOKING_REFUNDED_OFFLINE_SALE',
        admin: req.user.id,
        details: { phoneId: phone._id, bookingId: booking._id, userId: booking.user._id },
      });
    }

    phone.status = 'Sold';
    await phone.save();

    await AuditLog.create({
      action: 'PHONE_SOLD_OFFLINE',
      admin: req.user.id,
      details: { phoneId: phone._id },
    });

    res.status(200).json({ success: true, message: 'Phone marked as sold offline' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Resolve a booking (User bought it or cancelled)
// @route   POST /api/admin/resolve-booking/:id
// @access  Private/Admin
exports.resolveBooking = async (req, res) => {
  try {
    const { action } = req.body; // 'complete' or 'cancel'
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const phone = await Phone.findById(booking.phone);

    if (action === 'complete') {
      booking.status = 'Completed';
      phone.status = 'Sold';
      // Auto-cancel remaining active bookings since the phone is now physically sold
      await Booking.updateMany(
        { phone: phone._id, status: 'Active', _id: { $ne: booking._id } },
        { $set: { status: 'System_Refunded', paymentStatus: 'Refunded' } }
      );
    } else if (action === 'cancel') {
      booking.status = 'Cancelled';
      phone.status = 'Available'; // Phone is back on the market
      // Usually refunds are not given if user cancels, per business logic
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    await booking.save();
    await phone.save();

    await AuditLog.create({
      action: `BOOKING_${action.toUpperCase()}D`,
      admin: req.user.id,
      details: { bookingId: booking._id, phoneId: phone._id },
    });

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('user', 'name email').populate('phone');
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const totalPhones = await Phone.countDocuments();
    const availablePhones = await Phone.countDocuments({ status: 'Available' });
    const soldPhones = await Phone.countDocuments({ status: 'Sold' });
    
    const activeBookings = await Booking.countDocuments({ status: 'Active' });
    const totalRevenue = await Booking.aggregate([
      { $match: { paymentStatus: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$bookingAmount' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPhones,
        availablePhones,
        soldPhones,
        activeBookings,
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
