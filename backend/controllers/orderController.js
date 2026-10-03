const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Cart = require('../models/Cart');
const { sendOrderConfirmationEmail } = require('../services/emailService');

// Helper to generate unique human-readable Order ID
const generateOrderId = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `WG${timestamp}${random}`;
};

// @desc    Create a new order (Server-side price & stock verification)
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod = 'COD',
      couponCode,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.houseBuilding ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.pincode
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide complete delivery address details',
      });
    }

    // Server-side product price & stock validation
    let subtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const prodId = item.product?._id || item.product || item.productId;
      const product = await Product.findById(prodId);

      if (!product || product.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: `Product "${item.name || 'item'}" is no longer available`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Only ${product.stock} available.`,
        });
      }

      const itemPrice = product.discountPrice || product.price;
      subtotal += itemPrice * item.quantity;

      verifiedItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0] || '',
        size: item.size || 'M',
        color: item.color || 'Default',
        price: itemPrice,
        quantity: item.quantity,
      });
    }

    // Coupon calculation
    let discount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.trim().toUpperCase(),
        active: true,
      });

      if (coupon && (!coupon.expiryDate || new Date() <= coupon.expiryDate)) {
        if (subtotal >= (coupon.minimumOrderValue || 0)) {
          if (coupon.discountType === 'percentage') {
            discount = Math.round((subtotal * coupon.discountValue) / 100);
            if (coupon.maximumDiscount > 0 && discount > coupon.maximumDiscount) {
              discount = coupon.maximumDiscount;
            }
          } else {
            discount = Math.min(subtotal, coupon.discountValue);
          }

          appliedCoupon = {
            code: coupon.code,
            discountAmount: discount,
          };

          // Increment coupon usage
          coupon.usageCount = (coupon.usageCount || 0) + 1;
          const userIdx = coupon.usedBy.findIndex((u) => u.user?.toString() === req.user.id);
          if (userIdx > -1) {
            coupon.usedBy[userIdx].count += 1;
          } else {
            coupon.usedBy.push({ user: req.user.id, count: 1 });
          }
          await coupon.save();
        }
      }
    }

    // Shipping calculation: Free over ₹999, else ₹99
    const shipping = subtotal >= 999 ? 0 : 99;

    // GST Tax: 5% included or flat
    const tax = Math.round((subtotal - discount) * 0.05);

    const total = subtotal - discount + shipping + tax;

    const orderId = generateOrderId();

    const order = new Order({
      orderId,
      user: req.user.id,
      items: verifiedItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
      orderStatus: 'PLACED',
      subtotal,
      discount,
      shipping,
      tax,
      total,
      coupon: appliedCoupon,
      timeline: [
        {
          status: 'PLACED',
          date: new Date(),
          note: `Order #${orderId} placed via ${paymentMethod}`,
        },
      ],
    });

    await order.save();

    // Deduct stock & increment soldCount
    for (const item of verifiedItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, soldCount: item.quantity },
      });
    }

    // Clear user's server cart
    await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] });

    // Send order confirmation email in background
    sendOrderConfirmationEmail(order, req.user).catch((err) =>
      console.warn('Order email notification error:', err.message)
    );

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('items.product', 'slug images');

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order details by orderId or ObjectId
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let order;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(id).populate('items.product', 'slug images brand');
    } else {
      order = await Order.findOne({ orderId: id }).populate('items.product', 'slug images brand');
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check authorization: must be owner or admin
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order',
      });
    }

    res.status(200).json({
      success: true,
      order,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order (if not yet shipped)
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason = 'Cancelled by user' } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled in '${order.orderStatus}' status`,
      });
    }

    order.orderStatus = 'CANCELLED';
    order.cancelledAt = new Date();
    order.cancelReason = reason;
    order.timeline.push({
      status: 'CANCELLED',
      date: new Date(),
      note: `Order cancelled. Reason: ${reason}`,
    });

    await order.save();

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, soldCount: -item.quantity },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request return (for delivered order)
// @route   PUT /api/orders/:id/return
// @access  Private
exports.requestReturn = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason = 'Return requested' } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (order.orderStatus !== 'DELIVERED') {
      return res.status(400).json({
        success: false,
        message: 'Returns can only be requested for delivered orders',
      });
    }

    // Check 7-day return policy window
    if (order.deliveredAt) {
      const daysSinceDelivery = (Date.now() - new Date(order.deliveredAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDelivery > 7) {
        return res.status(400).json({
          success: false,
          message: 'The 7-day return window for this order has expired',
        });
      }
    }

    order.orderStatus = 'RETURN_REQUESTED';
    order.returnRequestedAt = new Date();
    order.returnReason = reason;
    order.timeline.push({
      status: 'RETURN_REQUESTED',
      date: new Date(),
      note: `Customer requested return. Reason: ${reason}`,
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Return request submitted successfully. Our courier partner will contact you.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 15, status, search } = req.query;

    const query = {};
    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { orderId: regex },
        { 'shippingAddress.fullName': regex },
        { 'shippingAddress.phone': regex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      orders,
      data: orders,
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

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.orderStatus = status;
    order.timeline.push({
      status,
      date: new Date(),
      note: note || `Order status updated to ${status}`,
    });

    if (status === 'DELIVERED') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
      if (order.paymentMethod === 'COD') {
        order.isPaid = true;
        order.paidAt = new Date();
        order.paymentStatus = 'PAID';
      }
    } else if (status === 'RETURNED') {
      order.paymentStatus = 'REFUNDED';
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update courier & tracking number (Admin)
// @route   PUT /api/orders/:id/tracking
// @access  Private/Admin
exports.updateTracking = async (req, res, next) => {
  try {
    const { trackingNumber, courierName } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (courierName) order.courierName = courierName;

    order.timeline.push({
      status: order.orderStatus,
      date: new Date(),
      note: `Tracking assigned: ${order.courierName} #${trackingNumber}`,
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Tracking details updated',
      order,
    });
  } catch (error) {
    next(error);
  }
};
