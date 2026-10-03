const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  requestReturn,
  getAllOrders,
  updateOrderStatus,
  updateTracking,
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

// Customer routes
router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/cancel', protect, cancelOrder);
router.put('/:id/return', protect, requestReturn);

// Admin routes
router.get('/', protect, adminOnly, getAllOrders);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);
router.put('/:id/tracking', protect, adminOnly, updateTracking);

module.exports = router;
