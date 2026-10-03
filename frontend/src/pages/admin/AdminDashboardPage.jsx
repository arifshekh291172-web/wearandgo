import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, ShoppingBag, Users, Package, AlertTriangle, 
  TrendingUp, Clock, CheckCircle2, ArrowRight 
} from 'lucide-react';
import StatCard from '../../components/admin/StatCard';
import { adminService } from '../../services/adminService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Skeleton from '../../components/common/Skeleton';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await adminService.getDashboardStats();
      if (res.success) {
        setStats(res.data || res.stats || {});
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats', err);
      setError('Unable to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-2xl p-5 border border-neutral-200">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-32" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-white rounded-2xl p-6 border border-neutral-200">
            <Skeleton className="h-6 w-40 mb-4" />
            <Skeleton className="h-40 w-full" />
          </div>
          <div className="h-64 bg-white rounded-2xl p-6 border border-neutral-200">
            <Skeleton className="h-6 w-40 mb-4" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center">
        <p className="font-semibold">{error || 'Something went wrong'}</p>
        <button
          onClick={fetchStats}
          className="mt-4 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900 text-white p-6 sm:p-8 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Overview & Performance</h1>
          <p className="text-neutral-400 text-sm mt-1">Live metrics and store activity across Wear & Go</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/admin/products/add"
            className="px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-hover shadow-sm transition-colors text-center"
          >
            + Add New Product
          </Link>
        </div>
      </div>

      {/* Main KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue || 0)}
          icon={DollarSign}
          trend={`${stats.ordersCount || 0} orders total`}
          trendType="neutral"
        />
        <StatCard
          title="Today's Sales"
          value={formatCurrency(stats.todayRevenue || 0)}
          icon={TrendingUp}
          trend="Calculated today"
          trendType="up"
        />
        <StatCard
          title="Total Orders"
          value={stats.ordersCount || 0}
          icon={ShoppingBag}
          trend={`${stats.pendingOrders || 0} pending`}
          trendType={stats.pendingOrders > 0 ? 'down' : 'neutral'}
        />
        <StatCard
          title="Active Customers"
          value={stats.customersCount || 0}
          icon={Users}
          trend="Registered users"
          trendType="neutral"
        />
      </div>

      {/* Secondary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Catalog Items"
          value={stats.productsCount || 0}
          icon={Package}
        />
        <StatCard
          title="Pending Fulfillment"
          value={stats.pendingOrders || 0}
          icon={Clock}
          trend="Needs dispatch"
          trendType="down"
        />
        <StatCard
          title="Delivered Orders"
          value={stats.deliveredOrders || 0}
          icon={CheckCircle2}
          trendType="up"
        />
        <StatCard
          title="Low Stock Alerts"
          value={stats.lowStockProducts?.length || 0}
          icon={AlertTriangle}
          trend="Stock < 5 units"
          trendType={stats.lowStockProducts?.length > 0 ? 'down' : 'neutral'}
        />
      </div>

      {/* Content Grid: Recent Orders & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Recent Customer Orders</h2>
              <p className="text-xs text-neutral-500">Latest orders placed on the store</p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-semibold text-primary hover:underline flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats.recentOrders && stats.recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 text-neutral-400 font-medium text-xs uppercase">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {stats.recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-3 font-semibold text-neutral-900">
                        #{order._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-3 text-neutral-600">
                        {order.user?.name || order.shippingAddress?.fullName || 'Customer'}
                      </td>
                      <td className="py-3 font-semibold text-neutral-900">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                          order.orderStatus === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                          order.orderStatus === 'CANCELLED' ? 'bg-rose-100 text-rose-800' :
                          order.orderStatus === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-neutral-500 text-sm">
              No orders placed yet.
            </div>
          )}
        </div>

        {/* Low Stock Alerts (1 col) */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Low Inventory</span>
            </h2>
            <Link to="/admin/products" className="text-xs font-semibold text-primary hover:underline">
              All Products
            </Link>
          </div>
          <p className="text-xs text-neutral-500 mb-6">Items with stock count under 5 units</p>

          {stats.lowStockProducts && stats.lowStockProducts.length > 0 ? (
            <div className="space-y-4">
              {stats.lowStockProducts.slice(0, 6).map((item) => (
                <div key={item._id} className="flex items-center space-x-3 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                  <img
                    src={item.images?.[0] || '/placeholder.png'}
                    alt={item.name}
                    className="w-12 h-14 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 truncate">{item.name}</p>
                    <p className="text-xs text-neutral-500">SKU: {item.sku || 'N/A'}</p>
                    <p className="text-xs font-bold text-rose-600 mt-1">
                      {item.stock === 0 ? 'Out of Stock' : `Only ${item.stock} left`}
                    </p>
                  </div>
                  <Link
                    to={`/admin/products/edit/${item._id}`}
                    className="text-xs font-semibold text-neutral-700 bg-white border border-neutral-200 px-2.5 py-1.5 rounded-lg hover:bg-neutral-100"
                  >
                    Restock
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-neutral-500 text-sm">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              All items are sufficiently stocked.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
