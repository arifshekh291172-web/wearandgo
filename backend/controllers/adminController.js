const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Category = require('../models/Category');

// @desc    Get Admin Dashboard Analytics & Stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      totalCustomers,
      totalProducts,
      lowStockProducts,
      revenueAggregation,
      todayRevenueAggregation,
      recentOrders,
      topProducts,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({
        orderStatus: { $in: ['PLACED', 'CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY'] },
      }),
      Order.countDocuments({ orderStatus: 'DELIVERED' }),
      Order.countDocuments({ orderStatus: 'CANCELLED' }),
      User.countDocuments({ role: 'user' }),
      Product.countDocuments(),
      Product.find({ stock: { $lte: 5 } }).select('name stock price SKU images'),
      Order.aggregate([
        { $match: { orderStatus: { $ne: 'CANCELLED' } } },
        { $group: { _id: null, totalRevenue: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: { orderStatus: { $ne: 'CANCELLED' }, createdAt: { $gte: today } } },
        { $group: { _id: null, todayRevenue: { $sum: '$total' } } },
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('user', 'name email'),
      Product.find({ status: 'active' })
        .sort({ soldCount: -1 })
        .limit(5)
        .select('name soldCount price discountPrice images category')
        .populate('category', 'name'),
    ]);

    const totalRevenue = revenueAggregation[0]?.totalRevenue || 0;
    const todayRevenue = todayRevenueAggregation[0]?.todayRevenue || 0;

    // Monthly revenue aggregation for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlySales = await Order.aggregate([
      {
        $match: {
          orderStatus: { $ne: 'CANCELLED' },
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthsNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    const chartData = monthlySales.map((item) => ({
      name: `${monthsNames[item._id.month - 1]} ${item._id.year}`,
      revenue: item.revenue,
      orders: item.orders,
    }));

    const dashboardData = {
      totalRevenue,
      todayRevenue,
      totalOrders,
      ordersCount: totalOrders,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      totalCustomers,
      customersCount: totalCustomers,
      totalProducts,
      productsCount: totalProducts,
      lowStockProducts,
      recentOrders,
      topProducts,
      chartData,
      salesTrend: chartData,
    };

    res.status(200).json({
      success: true,
      data: dashboardData,
      stats: dashboardData,
      lowStockProducts,
      recentOrders,
      topProducts,
      chartData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    if (role && role !== 'all') {
      query.role = role;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get order counts for each user
    const usersWithOrderCount = await Promise.all(
      users.map(async (user) => {
        const orderCount = await Order.countDocuments({ user: user._id });
        return {
          ...user.toObject(),
          orderCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: usersWithOrderCount.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      users: usersWithOrderCount,
      data: usersWithOrderCount,
      pagination: {
        total,
        pages: Math.ceil(total / limitNum),
        page: pageNum,
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change user role (Admin)
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status (Admin)
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Protect primary admin from disabling themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own admin account',
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};
