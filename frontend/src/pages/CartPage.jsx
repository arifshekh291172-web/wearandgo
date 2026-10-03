import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Tag,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import Breadcrumb from '../components/common/Breadcrumb';
import { formatPrice } from '../utils/formatters';
import { STORE_CONFIG } from '../utils/config';

export const CartPage = () => {
  const {
    cartItems,
    count,
    subtotal,
    discount,
    shipping,
    tax,
    total,
    coupon,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    await applyCoupon(couponInput);
    setCouponLoading(false);
    setCouponInput('');
  };

  // Progress to free shipping calculation
  const amountToFreeShipping = Math.max(0, STORE_CONFIG.freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(
    100,
    Math.round((subtotal / STORE_CONFIG.freeShippingThreshold) * 100)
  );

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <Breadcrumb items={[{ label: 'Shopping Bag' }]} />
        <div className="py-20 text-center space-y-6 max-w-md mx-auto">
          <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-serif text-slate-900">Your bag is empty</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Looks like you haven't added anything to your bag yet. Explore our curated collections to find your perfect fit.
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95"
          >
            <span>START SHOPPING</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      <Breadcrumb items={[{ label: 'Shopping Bag' }]} />

      <div className="flex items-baseline justify-between pb-4 border-b border-slate-100">
        <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-950">
          Shopping Bag
        </h1>
        <span className="text-xs text-slate-500 font-medium">
          {count} {count === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Free Shipping Progress Indicator */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="flex items-center gap-1.5 text-slate-800 font-bold">
            <Truck className="w-4 h-4 text-amber-700" />
            {amountToFreeShipping === 0 ? (
              <span className="text-emerald-700 font-bold">🎉 Congratulations! You unlocked Free Shipping!</span>
            ) : (
              <span>Add <strong>{formatPrice(amountToFreeShipping)}</strong> more to get Free Delivery</span>
            )}
          </span>
          <span className="font-bold text-slate-600">{freeShippingProgress}%</span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-slate-900 transition-all duration-500 rounded-full"
            style={{ width: `${freeShippingProgress}%` }}
          />
        </div>
      </div>

      {/* Cart Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12 items-start">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl bg-white overflow-hidden shadow-sm">
            {cartItems.map((item) => {
              const prod = item.product || {};
              const price = prod.discountPrice || prod.price || item.price;
              const hasDiscount = prod.discountPrice && prod.discountPrice < prod.price;

              return (
                <div key={item._id} className="p-4 sm:p-5 flex gap-4 sm:gap-6 items-center">
                  {/* Thumbnail */}
                  <Link
                    to={`/product/${prod.slug || prod._id}`}
                    className="w-20 sm:w-24 aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100"
                  >
                    <img
                      src={prod.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80'}
                      alt={prod.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </Link>

                  {/* Info & Variants */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {prod.brand || 'Wear & Go'}
                    </p>
                    <Link
                      to={`/product/${prod.slug || prod._id}`}
                      className="text-xs sm:text-sm font-bold text-slate-900 hover:text-amber-700 transition-colors line-clamp-1"
                    >
                      {prod.name}
                    </Link>

                    {/* Variant Pills */}
                    <div className="flex items-center gap-2 pt-1 text-xs">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-700">
                        Size: {item.size}
                      </span>
                      {item.color && item.color !== 'Default' && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-700">
                          {item.color}
                        </span>
                      )}
                    </div>

                    {/* Price on mobile */}
                    <div className="sm:hidden pt-2 flex items-baseline gap-2">
                      <span className="font-bold text-sm text-slate-900">{formatPrice(price)}</span>
                      {hasDiscount && (
                        <span className="text-xs text-slate-400 line-through">
                          {formatPrice(prod.price)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Controller & Price on Desktop */}
                  <div className="hidden sm:flex flex-col items-end gap-2">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-base text-slate-900">{formatPrice(price)}</span>
                      {hasDiscount && (
                        <span className="text-xs text-slate-400 line-through">
                          {formatPrice(prod.price)}
                        </span>
                      )}
                    </div>

                    {/* Quantity adjust */}
                    <div className="flex items-center border border-slate-200 rounded-xl bg-white">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-slate-950"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        disabled={prod.stock !== undefined && item.quantity >= prod.stock}
                        className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-slate-950 disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item._id)}
                    aria-label="Remove item"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-2">
            <Link
              to="/shop"
              className="text-xs font-bold text-slate-700 hover:text-slate-950 flex items-center gap-1.5 transition-colors"
            >
              <span>← Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Right: Order Summary Box */}
        <div className="space-y-6">
          {/* Coupon Code Section */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3 shadow-sm">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-700" />
              <span>Apply Coupon</span>
            </h4>

            {coupon ? (
              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div>
                  <span className="font-mono text-xs font-bold text-emerald-900 block">
                    {coupon.code}
                  </span>
                  <span className="text-[11px] text-emerald-700">Coupon applied</span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs font-bold text-rose-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="e.g. WELCOME10, STYLE20"
                  className="flex-1 bg-slate-50 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 uppercase font-mono"
                />
                <button
                  type="submit"
                  disabled={couponLoading}
                  className="px-4 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  Apply
                </button>
              </form>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
              Order Summary
            </h3>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Bag Subtotal:</span>
                <span className="font-semibold text-slate-900">{formatPrice(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount:</span>
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
                <span>Estimated Tax (5% GST):</span>
                <span className="font-semibold text-slate-900">{formatPrice(tax)}</span>
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-between text-base font-extrabold text-slate-950">
                <span>Total Amount:</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xl active:scale-98 flex items-center justify-center gap-2"
            >
              <span>PROCEED TO CHECKOUT</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Safe and Secure 256-Bit SSL Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
