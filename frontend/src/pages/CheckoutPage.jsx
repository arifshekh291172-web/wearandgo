import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  Banknote,
  Plus,
  Truck,
  ArrowRight,
  AlertCircle,
  MapPin,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { orderService } from '../services/orderService';
import { Modal } from '../components/common/Modal';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { formatPrice } from '../utils/formatters';
import { INDIAN_STATES } from '../utils/config';

export const CheckoutPage = () => {
  const { user, isAuthenticated, loading: authLoading, addAddress } = useAuth();
  const { cartItems, subtotal, discount, shipping, tax, total, coupon, clearCart } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  // State
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);

  // New address form state
  const [newAddress, setNewAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    houseBuilding: '',
    street: '',
    area: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
    landmark: '',
    isDefault: true,
  });

  // Redirect if bag is empty
  if (!authLoading && cartItems.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  // Redirect to login if guest
  if (!authLoading && !isAuthenticated) {
    return <Navigate to="/login?redirect=/checkout" replace />;
  }

  const addresses = user?.addresses || [];
  const currentAddress = addresses[selectedAddressIndex] || null;

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.fullName || !newAddress.phone || !newAddress.houseBuilding || !newAddress.street || !newAddress.city || !newAddress.pincode) {
      toast.error('Please fill all required address fields');
      return;
    }

    if (newAddress.phone.replace(/\D/g, '').length < 10) {
      toast.error('Please enter a valid 10-digit Indian phone number');
      return;
    }

    if (newAddress.pincode.trim().length !== 6 || isNaN(newAddress.pincode)) {
      toast.error('Please enter a valid 6-digit Indian PIN code');
      return;
    }

    const res = await addAddress(newAddress);
    if (res.success) {
      setAddressModalOpen(false);
      setSelectedAddressIndex(addresses.length); // Select newly added address
    }
  };

  const handlePlaceOrder = async () => {
    if (!currentAddress) {
      toast.error('Please select or add a delivery address');
      setAddressModalOpen(true);
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create Order on Backend
      const orderPayload = {
        items: cartItems.map((item) => ({
          product: item.product._id || item.product,
          name: item.product.name,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
        })),
        shippingAddress: currentAddress,
        paymentMethod,
        couponCode: coupon?.code,
      };

      const orderRes = await orderService.createOrder(orderPayload);
      if (!orderRes.success || !orderRes.order) {
        throw new Error(orderRes.message || 'Order creation failed');
      }

      const order = orderRes.order;

      // 2. Handle Cash on Delivery Flow
      if (paymentMethod === 'COD') {
        await clearCart();
        toast.success('Order placed successfully! Check your email for confirmation.');
        navigate(`/orders/${order.orderId || order._id}`);
        return;
      }

      // 3. Handle Razorpay Flow
      if (paymentMethod === 'Razorpay') {
        const rzpRes = await orderService.createRazorpayOrder(order.orderId);
        if (!rzpRes.success) {
          throw new Error('Could not initiate online payment');
        }

        const options = {
          key: rzpRes.keyId,
          amount: rzpRes.amount,
          currency: rzpRes.currency || 'INR',
          name: 'Wear & Go',
          description: `Order #${order.orderId}`,
          image: '/logo.png',
          order_id: rzpRes.razorpayOrder?.id,
          prefill: {
            name: currentAddress.fullName,
            email: currentAddress.email || user.email,
            contact: currentAddress.phone,
          },
          theme: {
            color: '#C5A059',
          },
          handler: async function (response) {
            try {
              // Server-side payment signature verification
              const verifyRes = await orderService.verifyPayment({
                orderId: order.orderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyRes.success) {
                await clearCart();
                toast.success('Payment verified! Order placed successfully.');
                navigate(`/orders/${order.orderId || order._id}`);
              } else {
                toast.error('Payment verification failed.');
              }
            } catch (verErr) {
              toast.error('Payment verification error: ' + verErr.message);
            }
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
              toast.warning('Payment window closed. Your order is pending payment.');
              navigate(`/orders/${order.orderId || order._id}`);
            },
          },
        };

        if (window.Razorpay) {
          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', function (response) {
            toast.error(`Payment Failed: ${response.error.description}`);
            setIsProcessing(false);
          });
          rzp.open();
        } else {
          // If script blocked or simulated mode
          console.warn('Razorpay SDK not loaded, using simulation fallback for development testing');
          const mockVerify = await orderService.verifyPayment({
            orderId: order.orderId,
            razorpay_order_id: rzpRes.razorpayOrder?.id || 'order_mock_123',
            razorpay_payment_id: 'pay_mock_' + Date.now(),
            razorpay_signature: 'sig_mock_verified',
          });

          if (mockVerify.success) {
            await clearCart();
            toast.success('Payment verified! Order placed.');
            navigate(`/orders/${order.orderId || order._id}`);
          }
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Checkout failed');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      <Breadcrumb items={[{ label: 'Bag', link: '/cart' }, { label: 'Secure Checkout' }]} />

      <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-950 pb-2 border-b border-slate-100">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12 items-start">
        {/* Left 2 Cols: Multi-step Options */}
        <div className="lg:col-span-2 space-y-8">
          {/* STEP 1: DELIVERY ADDRESS */}
          <section className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                  Delivery Address
                </h3>
              </div>
              <button
                onClick={() => setAddressModalOpen(true)}
                className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Address</span>
              </button>
            </div>

            {/* Address List */}
            {addresses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map((addr, idx) => (
                  <div
                    key={addr._id || idx}
                    onClick={() => setSelectedAddressIndex(idx)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedAddressIndex === idx
                        ? 'border-slate-950 bg-slate-50/70 ring-1 ring-slate-950 shadow-sm'
                        : 'border-slate-200 hover:border-slate-400 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-bold text-xs text-slate-900">{addr.fullName}</span>
                      {selectedAddressIndex === idx && (
                        <CheckCircle2 className="w-4 h-4 text-slate-950 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {addr.houseBuilding}, {addr.street}<br />
                      {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-2">Mobile: {addr.phone}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center bg-slate-50 rounded-xl space-y-2 border border-dashed border-slate-300">
                <MapPin className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-600">No saved addresses found</p>
                <button
                  onClick={() => setAddressModalOpen(true)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  Add Delivery Address
                </button>
              </div>
            )}
          </section>

          {/* STEP 2: DELIVERY METHOD */}
          <section className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                Shipping Speed
              </h3>
            </div>

            <div className="p-4 rounded-xl border border-slate-950 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-900 text-amber-400 rounded-lg shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Standard Express Delivery</h4>
                  <p className="text-[11px] text-slate-500">Delivered within 2–4 business days via Blue Dart / Delhivery</p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-900">
                {shipping === 0 ? <span className="text-emerald-700">FREE</span> : formatPrice(shipping)}
              </span>
            </div>
          </section>

          {/* STEP 3: PAYMENT METHOD */}
          <section className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                Payment Option
              </h3>
            </div>

            <div className="space-y-3">
              {/* Option 1: Cash on Delivery */}
              <label
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-slate-950 bg-slate-50/70 ring-1 ring-slate-950 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="text-slate-900 focus:ring-slate-900"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Banknote className="w-4 h-4 text-emerald-700" />
                      <span>Cash on Delivery (COD)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Pay with cash or UPI to the delivery courier at your doorstep.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                  Zero Extra Fee
                </span>
              </label>

              {/* Option 2: Razorpay Online */}
              <label
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'Razorpay'
                    ? 'border-slate-950 bg-slate-50/70 ring-1 ring-slate-950 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Razorpay"
                    checked={paymentMethod === 'Razorpay'}
                    onChange={() => setPaymentMethod('Razorpay')}
                    className="text-slate-900 focus:ring-slate-900"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-blue-700" />
                      <span>Online Payment (Razorpay)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Google Pay, PhonePe, Paytm, All UPI apps, Credit/Debit Cards, Net Banking.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">
                  Fast & Secure
                </span>
              </label>
            </div>
          </section>
        </div>

        {/* Right 1 Col: Summary & Order Place Button */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5 shadow-sm sticky top-24">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider pb-2 border-b border-slate-100">
            Order Review ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
          </h3>

          {/* Mini items list */}
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1 divide-y divide-slate-50">
            {cartItems.map((item) => (
              <div key={item._id} className="pt-2 flex items-center gap-3">
                <img
                  src={item.product?.images?.[0]}
                  alt={item.product?.name}
                  className="w-10 h-12 object-cover rounded-lg shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {item.product?.name}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Size: {item.size} • Qty: {item.quantity}
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-900 shrink-0">
                  {formatPrice(
                    (item.product?.discountPrice || item.product?.price || item.price) * item.quantity
                  )}
                </span>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
          <div className="border-t border-slate-100 pt-3 space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Coupon ({coupon?.code}):</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span className="font-semibold text-slate-900">
                {shipping === 0 ? <span className="text-emerald-600">FREE</span> : formatPrice(shipping)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tax (5% GST):</span>
              <span className="font-semibold text-slate-900">{formatPrice(tax)}</span>
            </div>
            <div className="border-t border-slate-100 pt-2 flex justify-between text-base font-black text-slate-950">
              <span>Total Payable:</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={isProcessing}
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xl active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Lock className="w-4 h-4" />
            <span>{isProcessing ? 'PROCESSING...' : `PAY ${formatPrice(total)}`}</span>
          </button>

          <p className="text-[10px] text-slate-400 text-center leading-tight">
            By clicking Pay, you agree to Wear & Go's Terms of Service and 7-Day Return Policy.
          </p>
        </div>
      </div>

      {/* ADD NEW ADDRESS MODAL */}
      <Modal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        title="Add New Indian Delivery Address"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateAddress} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={newAddress.fullName}
                onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                required
                maxLength={10}
                value={newAddress.phone}
                onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                placeholder="10-digit mobile"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Flat / House / Building *
              </label>
              <input
                type="text"
                required
                value={newAddress.houseBuilding}
                onChange={(e) => setNewAddress({ ...newAddress, houseBuilding: e.target.value })}
                placeholder="e.g. Flat 402, Sunshine Apts"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Street / Road *
              </label>
              <input
                type="text"
                required
                value={newAddress.street}
                onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                placeholder="e.g. 14th Cross, Linking Road"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                City *
              </label>
              <input
                type="text"
                required
                value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                placeholder="e.g. Mumbai"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                State *
              </label>
              <select
                value={newAddress.state}
                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Pincode *
              </label>
              <input
                type="text"
                maxLength={6}
                required
                value={newAddress.pincode}
                onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                placeholder="6-digit PIN"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
              Landmark (Optional)
            </label>
            <input
              type="text"
              value={newAddress.landmark}
              onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
              placeholder="e.g. Near Metro Station"
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors"
            >
              Save Address & Continue
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CheckoutPage;
