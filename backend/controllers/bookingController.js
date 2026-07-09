const Booking = require('../models/Booking');
const Phone = require('../models/Phone');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'test_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'test_key_secret',
});

// @desc    Create a booking and initiate Razorpay order
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const { phoneId } = req.body;

    const phone = await Phone.findById(phoneId);
    if (!phone) {
      return res.status(404).json({ success: false, message: 'Phone not found' });
    }

    if (phone.status !== 'Available') {
      return res.status(400).json({ success: false, message: 'Phone is no longer available' });
    }

    // Check booking limit
    const limit = phone.bookingLimit || 1;
    const activePhoneBookingsCount = await Booking.countDocuments({ phone: phoneId, status: { $in: ['Active', 'Completed'] } });
    
    if (activePhoneBookingsCount >= limit) {
      return res.status(400).json({ success: false, message: 'This device has reached its maximum booking limit' });
    }

    // Check if user already has an active booking
    const activeBooking = await Booking.findOne({ user: req.user.id, status: 'Active' });
    if (activeBooking) {
      return res.status(400).json({ success: false, message: 'You already have an active booking' });
    }

    // --- MOCK CHECKOUT MODE ---
    const keyId = process.env.RAZORPAY_KEY_ID || 'test_key_id';
    if (keyId === 'test_key_id') {
      // Bypass Razorpay API
      const booking = await Booking.create({
        user: req.user.id,
        phone: phoneId,
        bookingAmount: 500,
        razorpayOrderId: `mock_order_${Date.now()}`,
      });
      return res.status(201).json({
        success: true,
        data: booking,
        order: {
          id: booking.razorpayOrderId,
          amount: 50000,
          currency: 'INR',
          isMock: true,
        }
      });
    }
    // --------------------------

    // Create Razorpay order (Real mode)
    const options = {
      amount: 500 * 100, // ₹500 in paise
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // Create Booking record
    const booking = await Booking.create({
      user: req.user.id,
      phone: phoneId,
      bookingAmount: 500,
      razorpayOrderId: order.id,
    });

    res.status(201).json({
      success: true,
      data: booking,
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/bookings/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, isMock } = req.body;

    if (!isMock) {
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'test_key_secret')
        .update(body.toString())
        .digest('hex');

      const isAuthentic = expectedSignature === razorpay_signature;

      if (!isAuthentic) {
        return res.status(400).json({ success: false, message: 'Invalid signature' });
      }
    }

    // Update booking status
    const booking = await Booking.findOne({ razorpayOrderId: razorpay_order_id });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.paymentStatus = 'Completed';
    booking.razorpayPaymentId = razorpay_payment_id || `mock_pay_${Date.now()}`;
    await booking.save();

    // Update phone status if booking limit reached
    const phone = await Phone.findById(booking.phone);
    const limit = phone.bookingLimit || 1;
    const activePhoneBookingsCount = await Booking.countDocuments({ phone: booking.phone, status: { $in: ['Active', 'Completed'] } });
    
    if (activePhoneBookingsCount >= limit) {
      phone.status = 'Booked';
      await phone.save();
    }

    res.status(200).json({ success: true, message: 'Payment verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in user's bookings
// @route   GET /api/bookings/my
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).populate('phone');
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
