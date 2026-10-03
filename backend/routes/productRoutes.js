const express = require('express');
const router = express.Router();
const {
  getProducts,
  getSuggestions,
  getProduct,
  getRelatedProducts,
  getHomeCollections,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const upload = require('../middleware/upload');

// Public routes
router.get('/', getProducts);
router.get('/suggestions', getSuggestions);
router.get('/collections/home', getHomeCollections);
router.get('/:slugOrId', getProduct);
router.get('/:id/related', getRelatedProducts);

// Admin image upload
router.post(
  '/upload',
  protect,
  adminOnly,
  upload.array('images', 5),
  (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload at least one image' });
    }
    const imageUrls = req.files.map((file) => `/uploads/${file.filename}`);
    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      imageUrls,
    });
  }
);

// Admin product CRUD
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
