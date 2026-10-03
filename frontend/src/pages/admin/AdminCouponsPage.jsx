import React, { useState, useEffect } from 'react';
import { Plus, Tag, Trash2, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import Skeleton from '../../components/common/Skeleton';

const AdminCouponsPage = () => {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountAmount: 10,
    minPurchaseAmount: 999,
    maxDiscountAmount: 500,
    validUntil: '',
    usageLimit: 100,
    isActive: true,
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllCoupons();
      if (res.success) {
        setCoupons(res.data);
      }
    } catch (err) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code.trim()) return toast.error('Coupon code is required');

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        code: formData.code.toUpperCase().trim(),
        discountAmount: Number(formData.discountAmount),
        minPurchaseAmount: Number(formData.minPurchaseAmount),
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : undefined,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
      };

      const res = await adminService.createCoupon(payload);
      if (res.success) {
        toast.success(`Coupon "${payload.code}" created!`);
        setModalOpen(false);
        fetchCoupons();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create coupon');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    try {
      await adminService.deleteCoupon(id);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (err) {
      toast.error('Failed to delete coupon');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Discount Coupons</h1>
          <p className="text-xs text-neutral-500 mt-1">Configure promotional discount codes for marketing campaigns</p>
        </div>
        <button
          onClick={() => {
            setFormData({
              code: '',
              discountType: 'PERCENTAGE',
              discountAmount: 15,
              minPurchaseAmount: 999,
              maxDiscountAmount: 500,
              validUntil: '',
              usageLimit: 100,
              isActive: true,
            });
            setModalOpen(true);
          }}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary-hover shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* Coupons List */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-24" />
              </div>
            ))}
          </div>
        ) : coupons.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-500 font-semibold text-xs uppercase border-b border-neutral-200">
                <tr>
                  <th className="py-3.5 px-4">Coupon Code</th>
                  <th className="py-3.5 px-4">Discount</th>
                  <th className="py-3.5 px-4">Min. Spend</th>
                  <th className="py-3.5 px-4">Max. Cap</th>
                  <th className="py-3.5 px-4">Used / Limit</th>
                  <th className="py-3.5 px-4">Expiry</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {coupons.map((c) => (
                  <tr key={c._id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md text-xs">
                        {c.code}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-neutral-900">
                      {c.discountType === 'PERCENTAGE'
                        ? `${c.discountAmount}% OFF`
                        : `${formatCurrency(c.discountAmount)} OFF`}
                    </td>
                    <td className="py-3 px-4 text-neutral-600 text-xs">
                      {formatCurrency(c.minPurchaseAmount || 0)}
                    </td>
                    <td className="py-3 px-4 text-neutral-600 text-xs">
                      {c.maxDiscountAmount ? formatCurrency(c.maxDiscountAmount) : 'No Cap'}
                    </td>
                    <td className="py-3 px-4 text-neutral-600 text-xs">
                      {c.usedCount || 0} / {c.usageLimit || '∞'}
                    </td>
                    <td className="py-3 px-4 text-neutral-500 text-xs">
                      {c.validUntil ? formatDate(c.validUntil) : 'Never'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {c.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(c._id, c.code)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <Tag className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
            <p className="text-neutral-500 text-sm">No discount coupons configured yet.</p>
          </div>
        )}
      </div>

      {/* Create Coupon Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Promotional Coupon"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Coupon Code *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. FESTIVE25"
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-mono font-bold uppercase focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Discount Type
              </label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Flat Cash (₹)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Discount Amount *
              </label>
              <input
                type="number"
                value={formData.discountAmount}
                onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
                placeholder="10"
                min="1"
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Min Order Spend (₹)
              </label>
              <input
                type="number"
                value={formData.minPurchaseAmount}
                onChange={(e) => setFormData({ ...formData, minPurchaseAmount: e.target.value })}
                placeholder="999"
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Max Discount Cap (₹)
              </label>
              <input
                type="number"
                value={formData.maxDiscountAmount}
                onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                placeholder="500"
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Usage Limit
              </label>
              <input
                type="number"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                placeholder="100"
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Valid Until (Expiry Date)
            </label>
            <input
              type="date"
              value={formData.validUntil}
              onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-bold bg-primary text-white rounded-xl hover:bg-primary-hover shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Save Coupon'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCouponsPage;
