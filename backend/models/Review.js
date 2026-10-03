const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 5'],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    comment: {
      type: String,
      required: [true, 'Please provide review comment'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    images: [{ type: String }],
    verifiedPurchase: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate review per product per user
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Static method to recalculate product rating and review count
reviewSchema.statics.calculateAverageRating = async function (productId) {
  const stats = await this.aggregate([
    { $match: { product: productId, isApproved: true } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  try {
    if (stats.length > 0) {
      await mongoose.model('Product').findByIdAndUpdate(productId, {
        rating: Math.round(stats[0].avgRating * 10) / 10,
        reviewCount: stats[0].numReviews,
      });
    } else {
      await mongoose.model('Product').findByIdAndUpdate(productId, {
        rating: 4.5,
        reviewCount: 0,
      });
    }
  } catch (err) {
    console.error('Error updating product rating average:', err);
  }
};

reviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.product);
});

reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.product);
  }
});

module.exports = mongoose.model('Review', reviewSchema);
