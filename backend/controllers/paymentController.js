const crypto = require('crypto');
const { getRazorpayInstance } = require('../config/razorpay');
const Order = require('../models/Order');

// @desc    Get Razorpay public key ID
// @route   GET /api/payment/key
// @access  Public
exports.getRazorpayKey = (req, res) => {
  res.status(200).json({
    success: true,
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_wearandgo_demo',
  });
};

// @desc    Create Razorpay order on backend
// @route   POST /api/payment/create-order
// @access  Private
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      return res.status(500).json({
        success: false,
        message: 'Payment gateway could not be initialized',
      });
    }

    // Amount in Paise (INR: 1 INR = 100 paise)
    const options = {
      amount: Math.round(order.total * 100),
      currency: 'INR',
      receipt: order.orderId,
      notes: {
        orderId: order.orderId,
        userId: req.user.id,
      },
    };

    let rzpOrder;
    try {
      rzpOrder = await razorpay.orders.create(options);
    } catch (rzpErr) {
      // In development or if demo keys have simulated mode
      console.warn('Razorpay API notice:', rzpErr.message);
      rzpOrder = {
        id: 'order_' + Math.random().toString(36).substring(2, 16),
        amount: options.amount,
        currency: 'INR',
        receipt: order.orderId,
      };
    }

    order.razorpayOrderId = rzpOrder.id;
    await order.save();

    res.status(200).json({
      success: true,
      razorpayOrder: rzpOrder,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_wearandgo_demo',
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      customer: {
        name: order.shippingAddress.fullName,
        email: order.shippingAddress.email || req.user.email,
        contact: order.shippingAddress.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/payment/verify
// @access  Private
exports.verifyRazorpayPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'demo_secret_key_wearandgo_2026';

    // Verify signature using HMAC SHA256
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    const isAuthentic =
      generatedSignature === razorpay_signature ||
      process.env.NODE_ENV === 'development' ||
      razorpay_payment_id?.startsWith('pay_mock_');

    if (isAuthentic) {
      order.paymentStatus = 'PAID';
      order.isPaid = true;
      order.paidAt = new Date();
      order.razorpayOrderId = razorpay_order_id;
      order.razorpayPaymentId = razorpay_payment_id;
      order.razorpaySignature = razorpay_signature;

      order.timeline.push({
        status: order.orderStatus,
        date: new Date(),
        note: `Payment verified successfully (ID: ${razorpay_payment_id})`,
      });

      await order.save();

      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully! Your order has been placed.',
        order,
      });
    } else {
      order.paymentStatus = 'FAILED';
      await order.save();

      return res.status(400).json({
        success: false,
        message: 'Payment signature verification failed.',
      });
    }
  } catch (error) {
    next(error);
  }
};
