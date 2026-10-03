import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Printer,
  RotateCcw,
  XCircle,
  Truck,
  MapPin,
  CreditCard,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { orderService } from '../services/orderService';
import { useToast } from '../context/ToastContext';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { OrderTimeline } from '../components/order/OrderTimeline';
import { InvoiceModal } from '../components/order/InvoiceModal';
import { Modal } from '../components/common/Modal';
import Loader from '../components/common/Loader';
import { formatPrice, formatDate } from '../utils/formatters';

export const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await orderService.getOrder(id);
      if (res.success && res.order) {
        setOrder(res.order);
      }
    } catch (err) {
      toast.error('Could not load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  if (loading) {
    return <Loader fullScreen text="Fetching order details..." />;
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Order Not Found</h2>
        <Link
          to="/orders"
          className="inline-block px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const canCancel = ['PLACED', 'CONFIRMED', 'PACKED'].includes(order.orderStatus);
  const canReturn = order.orderStatus === 'DELIVERED';

  const handleCancelOrder = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await orderService.cancelOrder(order._id, reason || 'Cancelled by customer');
      if (res.success) {
        toast.success('Order has been cancelled');
        setCancelModalOpen(false);
        setReason('');
        await fetchOrder();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestReturn = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await orderService.requestReturn(order._id, reason || 'Return requested by customer');
      if (res.success) {
        toast.success('Return requested. Our courier partner will schedule a reverse pickup.');
        setReturnModalOpen(false);
        setReason('');
        await fetchOrder();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Return request failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      <Breadcrumb
        items={[
          { label: 'My Orders', link: '/orders' },
          { label: `Order #${order.orderId}` },
        ]}
      />

      {/* Top Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-950 font-mono">
              #{order.orderId}
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 uppercase tracking-wider">
              {order.orderStatus.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Ordered on {formatDate(order.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setInvoiceModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 text-slate-800 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Download Invoice</span>
          </button>

          {canCancel && (
            <button
              onClick={() => setCancelModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancel Order</span>
            </button>
          )}

          {canReturn && (
            <button
              onClick={() => setReturnModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold hover:bg-amber-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Request 7-Day Return</span>
            </button>
          )}
        </div>
      </div>

      {/* Visual Tracking Timeline */}
      <OrderTimeline
        orderStatus={order.orderStatus}
        timeline={order.timeline}
        cancelled={order.orderStatus === 'CANCELLED'}
        returnStatus={['RETURN_REQUESTED', 'RETURNED'].includes(order.orderStatus)}
      />

      {/* Courier & Tracking Banner if available */}
      {order.trackingNumber && (
        <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-xl">
              <Truck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Shipped with {order.courierName}</p>
              <p className="text-sm font-mono font-bold">AWB / Tracking: {order.trackingNumber}</p>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-400">In Transit</span>
        </div>
      )}

      {/* Grid: Items Table & Shipping/Payment Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Items List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
            Order Items ({order.items.length})
          </h3>

          <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl bg-white overflow-hidden shadow-sm">
            {order.items.map((item, idx) => (
              <div key={idx} className="p-4 sm:p-5 flex gap-4 items-center">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-20 object-cover object-top rounded-xl bg-slate-50 border border-slate-100 shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {item.name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="px-2 py-0.5 bg-slate-100 rounded-md font-semibold text-slate-700">
                      Size: {item.size}
                    </span>
                    {item.color && item.color !== 'Default' && (
                      <span className="px-2 py-0.5 bg-slate-100 rounded-md font-semibold text-slate-700">
                        {item.color}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Qty: {item.quantity} × {formatPrice(item.price)}
                  </p>
                </div>
                <span className="text-sm font-bold text-slate-950 shrink-0">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-950 transition-colors pt-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Orders</span>
          </Link>
        </div>

        {/* Right 1 Col: Address & Pricing Summary */}
        <div className="space-y-6">
          {/* Shipping Address Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3 shadow-sm">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-700" />
              <span>Shipping Address</span>
            </h4>
            <div className="text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-900">{order.shippingAddress.fullName}</p>
              <p>
                {order.shippingAddress.houseBuilding}, {order.shippingAddress.street}
              </p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} - <strong>{order.shippingAddress.pincode}</strong>
              </p>
              <p className="text-slate-400 pt-1">Phone: {order.shippingAddress.phone}</p>
            </div>
          </div>

          {/* Payment Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3 shadow-sm">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-amber-700" />
              <span>Payment Details</span>
            </h4>
            <div className="text-xs text-slate-600 space-y-1.5">
              <div className="flex justify-between">
                <span>Method:</span>
                <span className="font-bold text-slate-900 uppercase">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span
                  className={`font-bold ${
                    order.paymentStatus === 'PAID'
                      ? 'text-emerald-600'
                      : order.paymentStatus === 'REFUNDED'
                      ? 'text-blue-600'
                      : 'text-amber-600'
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-3 shadow-sm text-xs text-slate-600">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Payment Summary
            </h4>
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discount:</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span className="font-semibold text-slate-900">
                {order.shipping === 0 ? 'FREE' : formatPrice(order.shipping)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tax (5% GST):</span>
              <span className="font-semibold text-slate-900">{formatPrice(order.tax)}</span>
            </div>
            <div className="border-t border-slate-100 pt-2 flex justify-between text-base font-black text-slate-950">
              <span>Total Paid:</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* INVOICE MODAL */}
      <InvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        order={order}
      />

      {/* CANCEL ORDER MODAL */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Order"
      >
        <form onSubmit={handleCancelOrder} className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you want to cancel order <strong>#{order.orderId}</strong>? If already paid, the amount will be refunded to your source account.
          </p>
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
              Cancellation Reason *
            </label>
            <select
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
            >
              <option value="">Select a reason</option>
              <option value="Changed my mind">Changed my mind</option>
              <option value="Ordered by mistake">Ordered by mistake</option>
              <option value="Found a better price elsewhere">Found a better price elsewhere</option>
              <option value="Delivery is taking too long">Delivery is taking too long</option>
              <option value="Need to change shipping address">Need to change shipping address</option>
            </select>
          </div>
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setCancelModalOpen(false)}
              className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold"
            >
              Keep Order
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="flex-1 py-3 bg-rose-600 text-white rounded-xl text-xs font-bold uppercase hover:bg-rose-700 transition-colors disabled:opacity-50"
            >
              {actionLoading ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* REQUEST RETURN MODAL */}
      <Modal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        title="Request 7-Day Return / Exchange"
      >
        <form onSubmit={handleRequestReturn} className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Wear & Go guarantees hassle-free 7-day returns. Please ensure original tags and packaging are intact.
          </p>
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
              Reason for Return *
            </label>
            <select
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
            >
              <option value="">Select reason</option>
              <option value="Size too small">Size too small</option>
              <option value="Size too large">Size too large</option>
              <option value="Color or style differed from expectation">Color or style differed from expectation</option>
              <option value="Fabric quality not as expected">Fabric quality not as expected</option>
              <option value="Defective or damaged piece">Defective or damaged piece</option>
            </select>
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={actionLoading}
              className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {actionLoading ? 'Submitting...' : 'Submit Return Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OrderDetailPage;
