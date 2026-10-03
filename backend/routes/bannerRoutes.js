const express = require('express');
const router = express.Router();
const {
  getActiveBanners,
  getAllBannersAdmin,
  createBanner,
  updateBanner,
  deleteBanner,
} = require('../controllers/bannerController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.get('/', getActiveBanners);

// Admin routes
router.get('/admin', protect, adminOnly, getAllBannersAdmin);
router.post('/', protect, adminOnly, createBanner);
router.put('/:id', protect, adminOnly, updateBanner);
router.delete('/:id', protect, adminOnly, deleteBanner);

module.exports = router;
