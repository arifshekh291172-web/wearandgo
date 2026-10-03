const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true },
  image: { type: String, required: true },
  size: { type: String, required: true },
  color: { type: String, default: 'Default' },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const timelineEventSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: [
      'PLACED',
      'CONFIRMED',
      'PACKED',
      'SHIPPED',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
      'RETURN_REQUESTED',
      'RETURNED',
    ],
    required: true,
  },
  date: { type: Date, default: Date.now },
  note: { type: String, default: '' },
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String },
      houseBuilding: { type: String, required: true },
      street: { type: String, required: true },
      area: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      landmark: { type: String },
    },
    paymentMethod: {
      type: String,
      enum: ['Razorpay', 'COD'],
      required: true,
      default: 'COD',
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
    },
    orderStatus: {
      type: String,
      enum: [
        'PLACED',
        'CONFIRMED',
        'PACKED',
        'SHIPPED',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED',
        'RETURN_REQUESTED',
        'RETURNED',
      ],
      default: 'PLACED',
    },
    subtotal: { type: Number, required: true, default: 0 },
    discount: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true, default: 0 },
    coupon: {
      code: { type: String },
      discountAmount: { type: Number, default: 0 },
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    trackingNumber: { type: String, default: '' },
    courierName: { type: String, default: 'Blue Dart / Delhivery Express' },
    timeline: [timelineEventSchema],
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
    cancelReason: { type: String },
    returnRequestedAt: { type: Date },
    returnReason: { type: String },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ user: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
