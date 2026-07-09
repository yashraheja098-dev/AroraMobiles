const mongoose = require('mongoose');

const phoneSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: [true, 'Please add a brand'],
  },
  modelName: {
    type: String,
    required: [true, 'Please add a model name'],
  },
  storage: {
    type: String,
    required: [true, 'Please add storage capacity (e.g., 128GB)'],
  },
  ram: {
    type: String,
    required: [true, 'Please add RAM capacity (e.g., 6GB)'],
  },
  condition: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair'],
    required: [true, 'Please specify condition'],
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
  },
  images: [
    {
      url: String,
      public_id: String,
    }
  ],
  description: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Available', 'Booked', 'Sold'],
    default: 'Available',
  },
  dealDate: {
    type: String,
    // Format YYYY-MM-DD
  },
  bookingLimit: {
    type: Number,
    default: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Phone', phoneSchema);
