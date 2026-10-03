import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Truck, Package, CheckCircle2, Clock, Printer, 
  MapPin, CreditCard, User, AlertCircle 
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { adminService } from '../../services/adminService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/common/Loader';
import OrderTimeline from '../../components/order/OrderTimeline';
import InvoiceModal from '../../components/order/InvoiceModal';

const ALL_STATUSES = [
  'PLACED',
  'CONFIRMED',
  'PACKED',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'RETURN_REQUESTED',
  'RETURNED',
];

const AdminOrderDetailPage = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Status Form
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');

  // Tracking Form
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierName, setCourierName] = useState('');

  // Invoice Modal
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await orderService.getOrderById(id);
      if (res.success) {
        setOrder(res.data);
        setNewStatus(res.data.orderStatus);
        setTrackingNumber(res.data.trackingNumber || '');
        setCourierName(res.data.courierName || '');
      }
    } catch (err) {
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!newStatus) return;

    try {
      setUpdating(true);
      const res = await adminService.updateOrderStatus(id, newStatus, statusNote);
      if (res.success) {
        toast.success(`Order status updated to ${newStatus}`);
        setStatusNote('');
        fetchOrder();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const handleTrackingUpdate = async (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return toast.error('Enter tracking number');

    try {
      setUpdating(true);
      const res = await adminService.updateOrderTracking(id, trackingNumber.trim(), courierName.trim());
      if (res.success) {
        toast.success('Shipping tracking info saved');
        fetchOrder();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update tracking info');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Loader fullScreen={false} />;

  if (!order) {
    return (
      <div className="bg-red-50 p-6 rounded-2xl text-center text-red-700">
        <p className="font-semibold">Order not found</p>
        <Link to="/admin/orders" className="mt-3 inline-block text-xs font-bold underline">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/admin/orders"
            className="p-2 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 text-neutral-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
                Order #{order._id.slice(-6).toUpperCase()}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                order.orderStatus === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                order.orderStatus === 'CANCELLED' ? 'bg-rose-100 text-rose-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {order.orderStatus.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">Placed on {formatDate(order.createdAt)}</p>
          </div>
        </div>

        <button
          onClick={() => setInvoiceOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-800 font-semibold text-sm rounded-xl shadow-sm transition-colors"
        >
          <Printer className="w-4 h-4 text-neutral-500" />
          <span>Generate Invoice</span>
        </button>
      </div>

      {/* Timeline Card */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
        <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-6">
          Order Progress Timeline
        </h2>
        <OrderTimeline currentStatus={order.orderStatus} statusHistory={order.statusHistory || []} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Items & Fulfillment Updates) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-neutral-900">
                Purchased Items ({order.items?.length || 0})
              </h2>
            </div>
            <div className="divide-y divide-neutral-100">
              {order.items?.map((item, idx) => (
                <div key={idx} className="p-4 flex items-center space-x-4 hover:bg-neutral-50/50">
                  <img
                    src={item.image || '/placeholder.png'}
                    alt={item.name}
                    className="w-14 h-16 object-cover rounded-xl border border-neutral-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-neutral-900 text-sm truncate">{item.name}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Size: <span className="font-medium text-neutral-800">{item.size}</span> | Color: <span className="font-medium text-neutral-800">{item.color}</span>
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">
                      Qty: {item.quantity} × {formatCurrency(item.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-neutral-900 text-sm">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="bg-neutral-50/80 p-5 space-y-2 border-t border-neutral-100 text-sm">
              <div className="flex justify-between text-neutral-600 text-xs">
                <span>Items Subtotal</span>
                <span>{formatCurrency(order.itemsPrice || order.subtotal || 0)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 text-xs">
                  <span>Coupon Discount ({order.couponCode || 'PROMO'})</span>
                  <span>-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600 text-xs">
                <span>Shipping Fee</span>
                <span>{order.shippingPrice === 0 ? 'FREE' : formatCurrency(order.shippingPrice)}</span>
              </div>
              <div className="flex justify-between text-neutral-600 text-xs">
                <span>GST Tax (5%)</span>
                <span>{formatCurrency(order.taxPrice || 0)}</span>
              </div>
              <div className="flex justify-between text-neutral-900 font-bold text-base pt-2 border-t border-neutral-200">
                <span>Total Amount</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Status Update Card */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-neutral-900 flex items-center space-x-2">
              <Clock className="w-5 h-5 text-primary" />
              <span>Update Order Status</span>
            </h2>

            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Order Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                  >
                    {ALL_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Admin Status Note (Optional)
                  </label>
                  <input
                    type="text"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="e.g. Package dispatched via express route"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={updating}
                className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors disabled:opacity-50"
              >
                {updating ? 'Updating...' : 'Save New Status'}
              </button>
            </form>
          </div>

          {/* Tracking Number Card */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-neutral-900 flex items-center space-x-2">
              <Truck className="w-5 h-5 text-primary" />
              <span>Shipment & Logistics Tracking</span>
            </h2>

            <form onSubmit={handleTrackingUpdate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Tracking AWB Number
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. DEL-894729184"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Courier Partner
                  </label>
                  <input
                    type="text"
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    placeholder="e.g. Delhivery Express, BlueDart"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={updating}
                className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold text-xs rounded-xl shadow-sm transition-colors disabled:opacity-50"
              >
                {updating ? 'Saving...' : 'Update Courier Tracking'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column (Customer & Shipping Address) */}
        <div className="space-y-6">
          {/* Customer Profile */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-3">
            <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center space-x-2">
              <User className="w-4 h-4 text-primary" />
              <span>Customer Details</span>
            </h2>
            <div>
              <p className="font-bold text-neutral-900 text-sm">
                {order.user?.name || order.shippingAddress?.fullName || 'Guest Customer'}
              </p>
              <p className="text-xs text-neutral-500">{order.user?.email || order.shippingAddress?.email || 'N/A'}</p>
              <p className="text-xs text-neutral-500 mt-1">{order.shippingAddress?.phone}</p>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-3">
            <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Shipping Destination</span>
            </h2>
            <div className="text-xs text-neutral-700 space-y-1">
              <p className="font-bold text-neutral-900">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.addressLine1}</p>
              {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress?.addressLine2}</p>}
              <p>
                {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
              </p>
              <p className="font-semibold text-neutral-800">Phone: {order.shippingAddress?.phone}</p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-3">
            <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-primary" />
              <span>Payment Summary</span>
            </h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500">Method</span>
                <span className="font-semibold text-neutral-900">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Status</span>
                <span className={`font-bold ${order.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {order.paymentStatus}
                </span>
              </div>
              {order.razorpayPaymentId && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Razorpay ID</span>
                  <span className="font-mono text-[11px] text-neutral-700">{order.razorpayPaymentId}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Print Modal */}
      <InvoiceModal
        isOpen={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
        order={order}
      />
    </div>
  );
};

export default AdminOrderDetailPage;
