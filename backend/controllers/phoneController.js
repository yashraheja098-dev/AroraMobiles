const Phone = require('../models/Phone');
const Booking = require('../models/Booking');

// @desc    Get all phones
// @route   GET /api/phones
// @access  Public
exports.getPhones = async (req, res) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude from normal matching
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    query = Phone.find(JSON.parse(queryStr));

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    const phones = await query.lean();

    // Fetch active bookings count for all phones
    const activeCounts = await Booking.aggregate([
      { $match: { status: { $in: ['Active', 'Completed'] } } },
      { $group: { _id: '$phone', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    activeCounts.forEach(c => {
      countMap[c._id.toString()] = c.count;
    });

    const phonesWithCounts = phones.map(phone => {
      const activeBookingsCount = countMap[phone._id.toString()] || 0;
      // Auto-update status if count reaches limit (optional fallback)
      let status = phone.status;
      if (activeBookingsCount >= 5 && status !== 'Sold') {
        status = 'Booked';
      } else if (activeBookingsCount < 5 && status === 'Booked') {
        status = 'Available';
      }

      return {
        ...phone,
        status,
        activeBookingsCount
      };
    });

    res.status(200).json({ success: true, count: phonesWithCounts.length, data: phonesWithCounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single phone
// @route   GET /api/phones/:id
// @access  Public
exports.getPhone = async (req, res) => {
  try {
    const phone = await Phone.findById(req.params.id).lean();

    if (!phone) {
      return res.status(404).json({ success: false, message: 'Phone not found' });
    }

    const activeBookingsCount = await Booking.countDocuments({ 
      phone: phone._id, 
      status: { $in: ['Active', 'Completed'] } 
    });

    let status = phone.status;
    if (activeBookingsCount >= 5 && status !== 'Sold') {
      status = 'Booked';
    } else if (activeBookingsCount < 5 && status === 'Booked') {
      status = 'Available';
    }

    res.status(200).json({ 
      success: true, 
      data: {
        ...phone,
        status,
        activeBookingsCount
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add new phone
// @route   POST /api/phones
// @access  Private/Admin
exports.addPhone = async (req, res) => {
  try {
    let phoneData = { ...req.body };
    
    // Process images if any
    if (req.files && req.files.length > 0) {
      phoneData.images = req.files.map(file => ({
        url: `/uploads/${file.filename}`
      }));
    }

    const phone = await Phone.create(phoneData);
    res.status(201).json({ success: true, data: phone });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update phone
// @route   PUT /api/phones/:id
// @access  Private/Admin
exports.updatePhone = async (req, res) => {
  try {
    let phone = await Phone.findById(req.params.id);

    if (!phone) {
      return res.status(404).json({ success: false, message: 'Phone not found' });
    }

    phone = await Phone.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: phone });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete phone
// @route   DELETE /api/phones/:id
// @access  Private/Admin
exports.deletePhone = async (req, res) => {
  try {
    const phone = await Phone.findById(req.params.id);

    if (!phone) {
      return res.status(404).json({ success: false, message: 'Phone not found' });
    }

    await phone.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
