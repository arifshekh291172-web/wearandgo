const Banner = require('../models/Banner');

// @desc    Get all active banners (for homepage)
// @route   GET /api/banners
// @access  Public
exports.getActiveBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find({ active: true }).sort({ priority: 1, createdAt: -1 });
    res.status(200).json({
      success: true,
      count: banners.length,
      banners,
      data: banners,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all banners (Admin)
// @route   GET /api/banners/admin
// @access  Private/Admin
exports.getAllBannersAdmin = async (req, res, next) => {
  try {
    const banners = await Banner.find().sort({ priority: 1, createdAt: -1 });
    res.status(200).json({
      success: true,
      count: banners.length,
      banners,
      data: banners,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create banner (Admin)
// @route   POST /api/banners
// @access  Private/Admin
exports.createBanner = async (req, res, next) => {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Banner created successfully',
      banner,
      data: banner,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update banner (Admin)
// @route   PUT /api/banners/:id
// @access  Private/Admin
exports.updateBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Banner updated successfully',
      banner,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete banner (Admin)
// @route   DELETE /api/banners/:id
// @access  Private/Admin
exports.deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Banner deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
