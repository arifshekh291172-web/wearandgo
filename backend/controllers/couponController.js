const Coupon = require('../models/Coupon');

// @desc    Validate and calculate coupon discount
// @route   POST /api/coupons/validate
// @access  Public (or Private)
exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal = 0 } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Please provide coupon code' });
    }

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
      active: true,
    });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code' });
    }

    const now = new Date();
    if (coupon.startDate && now < coupon.startDate) {
      return res.status(400).json({ success: false, message: 'Coupon is not yet active' });
    }

    if (coupon.expiryDate && now > coupon.expiryDate) {
      return res.status(400).json({ success: false, message: 'Coupon code has expired' });
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit has been reached' });
    }

    if (subtotal < coupon.minimumOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value for this coupon is ₹${coupon.minimumOrderValue}`,
      });
    }

    // Check user limit if user logged in
    if (req.user) {
      const userUsage = coupon.usedBy.find(
        (u) => u.user && u.user.toString() === req.user.id
      );
      if (userUsage && userUsage.count >= coupon.perUserLimit) {
        return res.status(400).json({
          success: false,
          message: `You have already used this coupon maximum (${coupon.perUserLimit}) times`,
        });
      }
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maximumDiscount > 0 && discountAmount > coupon.maximumDiscount) {
        discountAmount = coupon.maximumDiscount;
      }
    } else {
      // Fixed discount
      discountAmount = Math.min(subtotal, coupon.discountValue);
    }

    res.status(200).json({
      success: true,
      message: `Coupon '${coupon.code}' applied successfully! Saved ₹${discountAmount}`,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
      },
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all coupons (Admin)
// @route   GET /api/coupons
// @access  Private/Admin
exports.getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: coupons.length, coupons, data: coupons });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new coupon (Admin)
// @route   POST /api/coupons
// @access  Private/Admin
exports.createCoupon = async (req, res, next) => {
  try {
    const couponData = { ...req.body };
    couponData.code = couponData.code.trim().toUpperCase();

    const exists = await Coupon.findOne({ code: couponData.code });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create(couponData);

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      coupon,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update coupon (Admin)
// @route   PUT /api/coupons/:id
// @access  Private/Admin
exports.updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Coupon updated successfully',
      coupon,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete coupon (Admin)
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
exports.deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
