import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Layers, FolderPlus } from 'lucide-react';
import { productService } from '../../services/productService';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import Skeleton from '../../components/common/Skeleton';

const AdminCategoriesPage = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    order: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await productService.getCategories();
      if (res.success) {
        setCategories(res.data);
      }
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', image: '', order: categories.length + 1 });
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      image: cat.image || '',
      order: cat.order || 0,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('Category name is required');

    try {
      setSubmitting(true);
      if (editingCategory) {
        await adminService.updateCategory(editingCategory._id, formData);
        toast.success('Category updated successfully');
      } else {
        await adminService.createCategory(formData);
        toast.success('Category created successfully');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (cat) => {
    setCategoryToDelete(cat);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    try {
      setDeleting(true);
      await adminService.deleteCategory(categoryToDelete._id);
      toast.success('Category deleted successfully');
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Product Categories</h1>
          <p className="text-xs text-neutral-500 mt-1">Organize fashion collections and navigation taxonomy</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary-hover shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Grid of Categories */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <Skeleton className="h-4 w-40 flex-1" />
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-500 font-semibold text-xs uppercase border-b border-neutral-200">
                <tr>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Slug</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4 text-center">Order</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={cat.image || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200'}
                          alt={cat.name}
                          className="w-12 h-12 rounded-xl object-cover border border-neutral-200 flex-shrink-0"
                        />
                        <span className="font-semibold text-neutral-900">{cat.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-neutral-500">
                      {cat.slug}
                    </td>
                    <td className="py-3 px-4 text-neutral-600 max-w-xs truncate">
                      {cat.description || '—'}
                    </td>
                    <td className="py-3 px-4 text-center text-neutral-600 font-mono text-xs">
                      {cat.order || 0}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 text-primary hover:bg-primary/10 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(cat)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
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
            <FolderPlus className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
            <p className="text-neutral-500 text-sm">No categories configured yet.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Category Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Men, Footwear, Accessories"
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Short blurb for shop filters and cards"
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Cover Image URL
            </label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Display Sort Order
            </label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary"
            />
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
              {submitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Category Deletion"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            Are you sure you want to remove{' '}
            <strong className="text-neutral-900">{categoryToDelete?.name}</strong>? Any products assigned to this category will need to be recategorized.
          </p>
          <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-100">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 text-sm font-bold bg-rose-600 text-white rounded-xl hover:bg-rose-700 disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminCategoriesPage;
