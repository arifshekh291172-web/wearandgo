const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Please provide coupon code'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
      default: 'percentage',
    },
    discountValue: {
      type: Number,
      required: [true, 'Please provide discount value'],
      min: 0,
    },
    minimumOrderValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    maximumDiscount: {
      type: Number,
      default: 0, // 0 means no maximum cap for percentage
      min: 0,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: [true, 'Please provide coupon expiry date'],
    },
    usageLimit: {
      type: Number,
      default: 1000,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    perUserLimit: {
      type: Number,
      default: 1,
    },
    usedBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        count: { type: Number, default: 1 },
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Coupon', couponSchema);
