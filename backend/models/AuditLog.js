const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true, // e.g., 'PHONE_SOLD_OFFLINE', 'BOOKING_REFUNDED'
  },
  admin: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  details: {
    type: Object, // Flexible object to store related IDs, reasons, etc.
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
