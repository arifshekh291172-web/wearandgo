import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, Search, Edit2, Trash2, ExternalLink, AlertTriangle, 
  CheckCircle2, RefreshCw, Filter 
} from 'lucide-react';
import { productService } from '../../services/productService';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';
import Skeleton from '../../components/common/Skeleton';
import Modal from '../../components/common/Modal';

const AdminProductsPage = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, categoryFilter]);

  const fetchCategories = async () => {
    try {
      const res = await productService.getCategories();
      if (res.success) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        keyword: search || undefined,
        category: categoryFilter || undefined,
      };
      const res = await productService.getProducts(params);
      if (res.success) {
        setProducts(res.data);
        setTotalPages(res.pagination?.pages || 1);
        setTotalProducts(res.pagination?.total || 0);
      }
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const confirmDelete = (product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      setDeleting(true);
      const res = await adminService.deleteProduct(productToDelete._id);
      if (res.success) {
        toast.success(`"${productToDelete.name}" deleted successfully`);
        setDeleteModalOpen(false);
        setProductToDelete(null);
        fetchProducts();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Products Catalog</h1>
          <p className="text-xs text-neutral-500 mt-1">Manage catalog inventory, pricing, and variants ({totalProducts} items total)</p>
        </div>
        <Link
          to="/admin/products/add"
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary-hover shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by name, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
        </form>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-700 focus:outline-none focus:border-primary"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c.slug}>{c.name}</option>
            ))}
          </select>

          <button
            onClick={fetchProducts}
            title="Refresh"
            className="p-2 border border-neutral-200 rounded-xl hover:bg-neutral-50 text-neutral-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="w-12 h-14 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-500 font-semibold text-xs uppercase border-b border-neutral-200">
                <tr>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Badges</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={product.images?.[0] || '/placeholder.png'}
                          alt={product.name}
                          className="w-11 h-14 object-cover rounded-lg border border-neutral-200 flex-shrink-0"
                        />
                        <div className="min-w-0 max-w-xs">
                          <p className="font-semibold text-neutral-900 truncate">{product.name}</p>
                          <p className="text-xs text-neutral-400">SKU: {product.sku || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-neutral-600">
                      {product.category?.name || 'Unassigned'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-neutral-900">
                        {formatCurrency(product.price)}
                      </div>
                      {product.originalPrice > product.price && (
                        <div className="text-xs text-neutral-400 line-through">
                          {formatCurrency(product.originalPrice)}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {product.stock === 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                          Out of Stock
                        </span>
                      ) : product.stock < 5 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                          Low: {product.stock}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          {product.stock} in stock
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {product.isFeatured && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-indigo-50 text-indigo-700">
                            Featured
                          </span>
                        )}
                        {product.isNewArrival && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-teal-50 text-teal-700">
                            New
                          </span>
                        )}
                        {product.isBestSeller && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-amber-50 text-amber-700">
                            Best
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/product/${product.slug || product._id}`}
                          target="_blank"
                          title="View in Store"
                          className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/admin/products/edit/${product._id}`}
                          title="Edit"
                          className="p-1.5 text-primary hover:bg-primary/10 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => confirmDelete(product)}
                          title="Delete"
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
            <p className="text-neutral-500 text-sm">No products found matching the criteria.</p>
            <Link
              to="/admin/products/add"
              className="mt-4 inline-block px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl"
            >
              Add First Product
            </Link>
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Delete Product"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            Are you sure you want to permanently delete{' '}
            <strong className="text-neutral-900">{productToDelete?.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-100">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 text-sm font-semibold bg-rose-600 text-white rounded-xl hover:bg-rose-700 disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete Product'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminProductsPage;
