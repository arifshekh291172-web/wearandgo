import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Filter, RefreshCw, ShoppingBag, Clock, CheckCircle2 } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Skeleton from '../../components/common/Skeleton';
import { useToast } from '../../context/ToastContext';

const STATUS_OPTIONS = [
  'ALL',
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

const AdminOrdersPage = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 15,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        search: search || undefined,
      };
      const res = await adminService.getAllOrders(params);
      if (res.success) {
        setOrders(res.data);
        setTotalPages(res.pagination?.pages || 1);
        setTotalOrders(res.pagination?.total || 0);
      }
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const handleQuickStatusChange = async (orderId, newStatus) => {
    try {
      const res = await adminService.updateOrderStatus(orderId, newStatus, 'Quick update from order table');
      if (res.success) {
        toast.success(`Order status updated to ${newStatus.replace(/_/g, ' ')}`);
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-100 text-emerald-800';
      case 'CANCELLED':
        return 'bg-rose-100 text-rose-800';
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
        return 'bg-blue-100 text-blue-800';
      case 'PACKED':
      case 'CONFIRMED':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-amber-100 text-amber-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Orders Management</h1>
          <p className="text-xs text-neutral-500 mt-1">Track fulfillment, update dispatch notes, and manage returns ({totalOrders} orders total)</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by Order ID, name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
        </form>

        <div className="flex items-center space-x-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-700 focus:outline-none focus:border-primary"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status.replace(/_/g, ' ')}
              </option>
            ))}
          </select>

          <button
            onClick={fetchOrders}
            title="Refresh"
            className="p-2 border border-neutral-200 rounded-xl hover:bg-neutral-50 text-neutral-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-500 font-semibold text-xs uppercase border-b border-neutral-200">
                <tr>
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Items</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-neutral-900">
                      <Link to={`/admin/orders/${order._id}`} className="hover:underline text-amber-700">
                        #{order._id.slice(-6).toUpperCase()}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-neutral-500 text-xs">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-neutral-900 text-xs truncate max-w-[140px]">
                        {order.shippingAddress?.fullName || order.user?.name || 'Customer'}
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        {order.shippingAddress?.phone}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-neutral-600 text-xs">
                      {order.items?.length || 0} pcs
                    </td>
                    <td className="py-3 px-4 font-bold text-neutral-900">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${
                        order.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-700'
                      }`}>
                        {order.paymentMethod} • {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleQuickStatusChange(order._id, e.target.value)}
                        className={`text-xs font-bold rounded-lg px-2.5 py-1 border border-neutral-200 cursor-pointer focus:outline-none shadow-sm ${getStatusBadge(order.orderStatus)}`}
                      >
                        {STATUS_OPTIONS.filter((s) => s !== 'ALL').map((s) => (
                          <option key={s} value={s} className="bg-white text-slate-900">
                            {s.replace(/_/g, ' ')}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/admin/orders/${order._id}`}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <ShoppingBag className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
            <p className="text-neutral-500 text-sm">No orders matching the criteria.</p>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 bg-neutral-50/50">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-200 bg-white text-neutral-700 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs text-neutral-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-200 bg-white text-neutral-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrdersPage;
