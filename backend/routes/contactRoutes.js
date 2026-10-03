const express = require('express');
const router = express.Router();
const {
  submitContact,
  getAllMessagesAdmin,
  updateMessageStatus,
  subscribeNewsletter,
} = require('../controllers/contactController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.post('/', submitContact);
router.post('/newsletter/subscribe', subscribeNewsletter);

// Admin routes
router.get('/admin', protect, adminOnly, getAllMessagesAdmin);
router.put('/:id/status', protect, adminOnly, updateMessageStatus);

module.exports = router;
