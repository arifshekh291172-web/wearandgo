import React, { useState, useEffect } from 'react';
import { Star, Trash2, CheckCircle2, XCircle, MessageSquare } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import Skeleton from '../../components/common/Skeleton';
import RatingStars from '../../components/common/RatingStars';

const AdminReviewsPage = () => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllReviews();
      if (res.success) {
        setReviews(res.data);
      }
    } catch (err) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleApproval = async (id) => {
    try {
      const res = await adminService.toggleReviewApproval(id);
      if (res.success) {
        toast.success('Review approval status toggled');
        fetchReviews();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await adminService.deleteReview(id);
      toast.success('Review deleted');
      fetchReviews();
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Customer Reviews</h1>
        <p className="text-xs text-neutral-500 mt-1">Moderate customer ratings, feedback, and verified buyer testimonials</p>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-72" />
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-500 font-semibold text-xs uppercase border-b border-neutral-200">
                <tr>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Rating & Review</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {reviews.map((r) => (
                  <tr key={r._id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-neutral-900 text-xs max-w-[180px] truncate">
                        {r.product?.name || 'Deleted Product'}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-neutral-900 text-xs">{r.user?.name || 'Customer'}</p>
                      <p className="text-[11px] text-neutral-400">{r.user?.email}</p>
                    </td>
                    <td className="py-3 px-4 max-w-sm">
                      <div className="flex items-center space-x-1.5 mb-1">
                        <RatingStars rating={r.rating} size={12} />
                        <span className="font-bold text-neutral-900 text-xs">{r.title}</span>
                      </div>
                      <p className="text-xs text-neutral-600 line-clamp-2">{r.comment}</p>
                    </td>
                    <td className="py-3 px-4 text-neutral-500 text-xs">
                      {formatDate(r.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                        r.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {r.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleToggleApproval(r._id)}
                          title={r.isApproved ? 'Unapprove' : 'Approve'}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            r.isApproved
                              ? 'border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                              : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(r._id)}
                          title="Delete"
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <MessageSquare className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
            <p className="text-neutral-500 text-sm">No reviews submitted yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviewsPage;
