const express = require('express');
const router = express.Router();
const {
  getRazorpayKey,
  createRazorpayOrder,
  verifyRazorpayPayment,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.get('/key', getRazorpayKey);
router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyRazorpayPayment);

module.exports = router;
