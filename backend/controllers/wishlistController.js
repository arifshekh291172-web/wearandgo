const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// @desc    Get logged in user's wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'products',
      select: 'name slug price originalPrice discountPrice discountPercentage images rating reviewCount stock sizes colors brand category',
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    res.status(200).json({
      success: true,
      data: wishlist.products,
      count: wishlist.products.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle product in wishlist (add or remove)
// @route   POST /api/wishlist/toggle
// @access  Private
exports.toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
      });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [] });
    }

    const index = wishlist.products.findIndex(
      (p) => p.toString() === productId.toString()
    );

    let added = false;
    if (index > -1) {
      // Remove from wishlist
      wishlist.products.splice(index, 1);
      added = false;
    } else {
      // Add to wishlist
      wishlist.products.push(productId);
      added = true;
    }

    await wishlist.save();

    await wishlist.populate({
      path: 'products',
      select: 'name slug price originalPrice discountPrice discountPercentage images rating reviewCount stock sizes colors brand category',
    });

    res.status(200).json({
      success: true,
      added,
      message: added ? 'Product added to wishlist' : 'Product removed from wishlist',
      data: wishlist.products,
      count: wishlist.products.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(200).json({
        success: true,
        data: [],
        count: 0,
      });
    }

    wishlist.products = wishlist.products.filter(
      (p) => p.toString() !== productId.toString()
    );

    await wishlist.save();

    await wishlist.populate({
      path: 'products',
      select: 'name slug price originalPrice discountPrice discountPercentage images rating reviewCount stock sizes colors brand category',
    });

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
      data: wishlist.products,
      count: wishlist.products.length,
    });
  } catch (error) {
    next(error);
  }
};
