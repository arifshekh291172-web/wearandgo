const express = require('express');
const router = express.Router();
const {
  getProductReviews,
  addReview,
  getAllReviewsAdmin,
  toggleReviewApproval,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.get('/product/:productId', getProductReviews);
router.post('/', protect, addReview);

// Admin routes
router.get('/admin', protect, adminOnly, getAllReviewsAdmin);
router.put('/:id/approve', protect, adminOnly, toggleReviewApproval);
router.delete('/:id', protect, adminOnly, deleteReview);

module.exports = router;
