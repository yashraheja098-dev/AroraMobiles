const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  phone: {
    type: mongoose.Schema.ObjectId,
    ref: 'Phone',
    required: true,
  },
  bookingAmount: {
    type: Number,
    required: true,
    default: 500, // ₹500 booking fee
  },
  razorpayOrderId: {
    type: String,
  },
  razorpayPaymentId: {
    type: String,
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Pending',
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Cancelled', 'System_Refunded'], // System_Refunded means phone was sold offline to someone else
    default: 'Active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Booking', bookingSchema);
