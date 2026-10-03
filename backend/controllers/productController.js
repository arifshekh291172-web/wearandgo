const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');
const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const { sendNewProductAnnouncementEmail } = require('../services/emailService');

// @desc    Get all products with filters, sorting & pagination
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      sort = 'recommended',
      keyword,
      search,
      category,
      gender,
      size,
      color,
      minPrice,
      maxPrice,
      rating,
      brand,
      inStock,
      discountOnly,
      featured,
      bestseller,
      newArrival,
    } = req.query;

    const query = { status: 'active' };

    // Text Search
    const searchQuery = keyword || search;
    if (searchQuery && searchQuery.trim() !== '') {
      const regex = new RegExp(searchQuery.trim(), 'i');
      query.$or = [
        { name: regex },
        { description: regex },
        { brand: regex },
        { tags: regex },
        { SKU: regex },
      ];
    }

    // Category filter (support category ObjectId or slug)
    if (category && category !== 'all') {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const catDoc = await Category.findOne({ slug: category.toLowerCase() });
        if (catDoc) {
          query.category = catDoc._id;
        } else {
          query.categorySlug = category.toLowerCase();
        }
      }
    }

    // Gender filter
    if (gender && gender !== 'all') {
      query.gender = gender.toLowerCase();
    }

    // Brand filter
    if (brand && brand !== 'all') {
      const brandsList = Array.isArray(brand) ? brand : brand.split(',');
      query.brand = { $in: brandsList.map((b) => new RegExp(`^${b.trim()}$`, 'i')) };
    }

    // Size filter
    if (size) {
      const sizesList = Array.isArray(size) ? size : size.split(',');
      query.sizes = { $in: sizesList };
    }

    // Color filter
    if (color) {
      const colorsList = Array.isArray(color) ? color : color.split(',');
      query['colors.name'] = { $in: colorsList.map((c) => new RegExp(`^${c.trim()}$`, 'i')) };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.discountPrice = {};
      if (minPrice) query.discountPrice.$gte = Number(minPrice);
      if (maxPrice) query.discountPrice.$lte = Number(maxPrice);
    }

    // Rating filter
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // Availability
    if (inStock === 'true' || inStock === true) {
      query.stock = { $gt: 0 };
    }

    // Discount filter
    if (discountOnly === 'true' || discountOnly === true) {
      query.discountPercentage = { $gt: 0 };
    }

    // Flag filters
    if (featured === 'true' || featured === true) query.featured = true;
    if (bestseller === 'true' || bestseller === true) query.bestseller = true;
    if (newArrival === 'true' || newArrival === true) query.newArrival = true;

    // Sorting options
    let sortObj = {};
    switch (sort) {
      case 'newest':
        sortObj = { createdAt: -1 };
        break;
      case 'price-asc':
        sortObj = { discountPrice: 1 };
        break;
      case 'price-desc':
        sortObj = { discountPrice: -1 };
        break;
      case 'rating':
        sortObj = { rating: -1, reviewCount: -1 };
        break;
      case 'popular':
        sortObj = { soldCount: -1 };
        break;
      case 'recommended':
      default:
        sortObj = { bestseller: -1, rating: -1, createdAt: -1 };
        break;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages,
      currentPage: pageNum,
      products,
      data: products,
      pagination: {
        total,
        pages: totalPages,
        page: pageNum,
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get live search suggestions
// @route   GET /api/products/suggestions
// @access  Public
exports.getSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.status(200).json({ success: true, suggestions: [] });
    }

    const regex = new RegExp(q.trim(), 'i');
    const suggestions = await Product.find({
      status: 'active',
      $or: [{ name: regex }, { brand: regex }, { tags: regex }],
    })
      .select('name slug images price discountPrice category')
      .populate('category', 'name slug')
      .limit(6);

    res.status(200).json({
      success: true,
      suggestions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by slug or id
// @route   GET /api/products/:slugOrId
// @access  Public
exports.getProduct = async (req, res, next) => {
  try {
    const { slugOrId } = req.params;
    let product;

    if (slugOrId.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(slugOrId).populate('category', 'name slug');
    } else {
      product = await Product.findOne({ slug: slugOrId }).populate('category', 'name slug');
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      product,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
exports.getRelatedProducts = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const related = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      status: 'active',
    })
      .limit(4)
      .populate('category', 'name slug');

    res.status(200).json({
      success: true,
      products: related,
      data: related,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get homepage collections (Featured, Bestsellers, New Arrivals)
// @route   GET /api/products/collections/home
// @access  Public
exports.getHomeCollections = async (req, res, next) => {
  try {
    const [featured, bestsellers, newArrivals] = await Promise.all([
      Product.find({ status: 'active', featured: true })
        .populate('category', 'name slug')
        .limit(8),
      Product.find({ status: 'active', bestseller: true })
        .populate('category', 'name slug')
        .limit(8),
      Product.find({ status: 'active', newArrival: true })
        .sort({ createdAt: -1 })
        .populate('category', 'name slug')
        .limit(8),
    ]);

    res.status(200).json({
      success: true,
      collections: {
        featured,
        bestsellers,
        newArrivals,
      },
      data: {
        featured,
        bestsellers,
        newArrivals,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
  try {
    const productData = req.body;

    // Generate slug from name if not provided
    if (!productData.slug && productData.name) {
      productData.slug = productData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);
    }

    // Auto-generate SKU if not provided
    if (!productData.SKU) {
      productData.SKU = 'WG-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    const product = await Product.create(productData);

    // Asynchronously broadcast new arrival alert to users and subscribers
    (async () => {
      try {
        const [users, subscribers] = await Promise.all([
          User.find({ isActive: { $ne: false } }).select('email name').lean(),
          NewsletterSubscriber.find({ active: { $ne: false } }).select('email').lean(),
        ]);

        const emailSet = new Set();
        users.forEach((u) => u.email && emailSet.add(u.email));
        subscribers.forEach((s) => s.email && emailSet.add(s.email));

        const recipients = Array.from(emailSet);
        if (recipients.length > 0) {
          await sendNewProductAnnouncementEmail({ product, recipients });
        }
      } catch (broadcastErr) {
        console.warn('Error broadcasting new product email:', broadcastErr.message);
      }
    })();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
