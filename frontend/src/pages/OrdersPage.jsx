import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Package, ArrowRight, Clock, CheckCircle2, ChevronRight, Truck } from 'lucide-react';
import { orderService } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import Breadcrumb from '../components/common/Breadcrumb';
import Loader from '../components/common/Loader';
import { formatPrice, formatDate } from '../utils/formatters';

export const OrdersPage = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await orderService.getMyOrders();
        if (res.success) {
          setOrders(res.orders || []);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  if (!authLoading && !isAuthenticated) {
    return <Navigate to="/login?redirect=/orders" replace />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      <Breadcrumb items={[{ label: 'My Account', link: '/profile' }, { label: 'My Orders' }]} />

      <div className="flex items-baseline justify-between pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-950">
            Order History
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track, view invoice, request returns, and manage your fashion purchases.
          </p>
        </div>
        <span className="text-xs font-bold text-slate-400">
          {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
        </span>
      </div>

      {loading ? (
        <Loader text="Loading your orders..." />
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => {
            let statusBadgeClass = 'bg-slate-100 text-slate-700';
            if (order.orderStatus === 'DELIVERED') {
              statusBadgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
            } else if (order.orderStatus === 'CANCELLED') {
              statusBadgeClass = 'bg-rose-50 text-rose-800 border-rose-200';
            } else if (['SHIPPED', 'OUT_FOR_DELIVERY'].includes(order.orderStatus)) {
              statusBadgeClass = 'bg-blue-50 text-blue-800 border-blue-200';
            } else if (order.orderStatus === 'RETURN_REQUESTED') {
              statusBadgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
            }

            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-slate-100 hover:border-slate-300 shadow-sm transition-all overflow-hidden p-5 sm:p-6 space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-50 rounded-xl text-slate-800">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-slate-950">
                          #{order.orderId}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${statusBadgeClass}`}
                        >
                          {order.orderStatus.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Placed on {formatDate(order.createdAt)} • Payment: {order.paymentMethod} ({order.paymentStatus})
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-base font-black text-slate-950 block">
                      {formatPrice(order.total)}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {order.items?.length} {order.items?.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                </div>

                {/* Products Thumbnails Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-14 object-cover rounded-lg shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-semibold text-slate-900 truncate">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Size: {item.size} • Qty: {item.quantity}
                        </p>
                        <span className="text-xs font-bold text-slate-800">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="flex items-center justify-center p-3 bg-slate-50 rounded-xl text-xs font-bold text-slate-500">
                      +{order.items.length - 3} more items
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-xs">
                  {order.trackingNumber ? (
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Truck className="w-3.5 h-3.5 text-amber-700" />
                      <span>Tracking: <strong>{order.trackingNumber}</strong></span>
                    </div>
                  ) : (
                    <span className="text-slate-400 text-[11px]">Preparing for dispatch</span>
                  )}

                  <Link
                    to={`/orders/${order.orderId || order._id}`}
                    className="inline-flex items-center gap-1 font-bold text-slate-900 hover:text-amber-800 transition-colors"
                  >
                    <span>View Order & Tracking Details</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center space-y-4 bg-slate-50 rounded-2xl border border-slate-100 p-8">
          <div className="w-16 h-16 bg-white text-slate-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">You haven't placed any orders yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Discover modern apparel, shoes, and accessories ready to dispatch to your doorstep.
          </p>
          <Link
            to="/shop"
            className="inline-block px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
          >
            Explore Collections
          </Link>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
