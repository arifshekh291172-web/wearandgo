const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
exports.getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({
      product: productId,
      isApproved: true,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add review for a product (Verified purchase check)
// @route   POST /api/reviews
// @access  Private
exports.addReview = async (req, res, next) => {
  try {
    const { productId, rating, title, comment, images } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide rating, title, and review comment',
      });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product: productId,
      user: req.user.id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this product',
      });
    }

    // Check if user bought and received this product (Verified Purchase check)
    const orderWithProduct = await Order.findOne({
      user: req.user.id,
      'items.product': productId,
      orderStatus: { $in: ['DELIVERED', 'SHIPPED', 'CONFIRMED'] },
    });

    // Enforce verified purchase as required by prompt
    if (!orderWithProduct && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only verified customers who purchased this product can leave a review.',
      });
    }

    const review = await Review.create({
      product: productId,
      user: req.user.id,
      userName: req.user.name,
      rating: Number(rating),
      title: title || '',
      comment,
      images: images || [],
      verifiedPurchase: Boolean(orderWithProduct),
      isApproved: true,
    });

    res.status(201).json({
      success: true,
      message: 'Review posted successfully!',
      review,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews/admin
// @access  Private/Admin
exports.getAllReviewsAdmin = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('product', 'name images slug')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle review approval (Admin)
// @route   PUT /api/reviews/:id/approve
// @access  Private/Admin
exports.toggleReviewApproval = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.isApproved = !review.isApproved;
    await review.save();

    res.status(200).json({
      success: true,
      message: `Review ${review.isApproved ? 'approved' : 'hidden'} successfully`,
      review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review (Admin)
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
