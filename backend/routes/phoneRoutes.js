const express = require('express');
const {
  getPhones,
  getPhone,
  addPhone,
  updatePhone,
  deletePhone,
} = require('../controllers/phoneController');

const { protect, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

const router = express.Router();

router
  .route('/')
  .get(getPhones)
  .post(protect, authorize('admin'), upload.array('images', 5), addPhone);


router
  .route('/:id')
  .get(getPhone)
  .put(protect, authorize('admin'), updatePhone)
  .delete(protect, authorize('admin'), deletePhone);

module.exports = router;
