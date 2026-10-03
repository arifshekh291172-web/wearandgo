import React, { useState, useEffect } from 'react';
import { Plus, Image, Trash2, Edit2, CheckCircle2, XCircle } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import Skeleton from '../../components/common/Skeleton';

const AdminBannersPage = () => {
  const { toast } = useToast();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: '',
    buttonText: 'SHOP NOW',
    buttonLink: '/shop',
    priority: 1,
    isActive: true,
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllBanners();
      if (res.success) {
        setBanners(res.data);
      }
    } catch (err) {
      toast.error('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      image: '',
      buttonText: 'EXPLORE COLLECTION',
      buttonLink: '/shop',
      priority: banners.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      image: banner.image,
      buttonText: banner.buttonText || 'SHOP NOW',
      buttonLink: banner.buttonLink || '/shop',
      priority: banner.priority || 1,
      isActive: banner.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.image.trim()) {
      return toast.error('Title and Image URL are required');
    }

    try {
      setSubmitting(true);
      if (editingBanner) {
        await adminService.updateBanner(editingBanner._id, formData);
        toast.success('Banner updated');
      } else {
        await adminService.createBanner(formData);
        toast.success('Banner created');
      }
      setIsModalOpen(false);
      fetchBanners();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save banner');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner?')) return;
    try {
      await adminService.deleteBanner(id);
      toast.success('Banner deleted');
      fetchBanners();
    } catch (err) {
      toast.error('Failed to delete banner');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Homepage Banners</h1>
          <p className="text-xs text-neutral-500 mt-1">Configure carousel hero slides and promotional banners</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary-hover shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Banner</span>
        </button>
      </div>

      {/* Banner Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-white border border-neutral-200 p-4">
              <Skeleton className="h-40 w-full rounded-xl mb-4" />
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-4 w-60" />
            </div>
          ))}
        </div>
      ) : banners.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((b) => (
            <div key={b._id} className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
              <div className="relative aspect-[16/7] bg-neutral-900 overflow-hidden">
                <img
                  src={b.image}
                  alt={b.title}
                  className="w-full h-full object-cover opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-5 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/20 backdrop-blur-sm px-2 py-0.5 rounded w-max mb-1">
                    Priority: {b.priority || 1}
                  </span>
                  <h3 className="text-lg font-bold">{b.title}</h3>
                  <p className="text-xs text-neutral-300 line-clamp-1">{b.subtitle}</p>
                </div>
              </div>

              <div className="p-4 flex items-center justify-between bg-white mt-auto border-t border-neutral-100">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                    b.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    {b.isActive ? 'Active' : 'Disabled'}
                  </span>
                  <span className="text-xs text-neutral-400">Link: {b.buttonLink}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openEditModal(b)}
                    className="p-1.5 text-primary hover:bg-primary/10 rounded-lg"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(b._id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200 p-16 text-center shadow-sm">
          <Image className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
          <p className="text-neutral-500 text-sm">No promotional banners configured yet.</p>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBanner ? 'Edit Banner' : 'Create Banner'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Banner Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. SUMMER APPAREL DROP"
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Subtitle
            </label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="e.g. Up to 40% off on all streetwear collections"
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Image URL *
            </label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Button Text
              </label>
              <input
                type="text"
                value={formData.buttonText}
                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                placeholder="SHOP MEN"
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Button Link
              </label>
              <input
                type="text"
                value={formData.buttonLink}
                onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                placeholder="/shop?gender=men"
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Display Priority
              </label>
              <input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-primary focus:ring-primary"
                />
                <span className="text-sm font-semibold text-neutral-800">Active Banner</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-bold bg-primary text-white rounded-xl hover:bg-primary-hover shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingBanner ? 'Save Changes' : 'Create Banner'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminBannersPage;
