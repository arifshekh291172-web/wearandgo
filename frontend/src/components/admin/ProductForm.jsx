import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Upload, Check, AlertCircle } from 'lucide-react';
import { productService } from '../../services/productService';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
const GENDERS = [
  { label: 'Unisex', value: 'unisex' },
  { label: 'Men', value: 'men' },
  { label: 'Women', value: 'women' },
  { label: 'Kids', value: 'kids' },
];

const ProductForm = ({ initialData, isEdit = false }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    brand: initialData?.brand || 'Wear & Go',
    category: initialData?.category?._id || initialData?.category || '',
    subcategory: initialData?.subcategory || '',
    gender: initialData?.gender || 'unisex',
    price: initialData?.price || '',
    originalPrice: initialData?.originalPrice || '',
    stock: initialData?.stock ?? 10,
    sku: initialData?.sku || '',
    sizes: initialData?.sizes || ['S', 'M', 'L', 'XL'],
    colors: initialData?.colors || ['Black'],
    images: initialData?.images || [''],
    tags: initialData?.tags?.join(', ') || '',
    isFeatured: initialData?.isFeatured || false,
    isBestSeller: initialData?.isBestSeller || false,
    isNewArrival: initialData?.isNewArrival || true,
  });

  const [newColor, setNewColor] = useState('');
  const [imageInput, setImageInput] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await productService.getCategories();
      if (res.success && res.data.length > 0) {
        setCategories(res.data);
        if (!formData.category) {
          setFormData((prev) => ({ ...prev, category: res.data[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTextChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const toggleSize = (size) => {
    setFormData((prev) => {
      const exists = prev.sizes.includes(size);
      return {
        ...prev,
        sizes: exists ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size],
      };
    });
  };

  const addColor = (e) => {
    e.preventDefault();
    if (newColor.trim() && !formData.colors.includes(newColor.trim())) {
      setFormData((prev) => ({ ...prev, colors: [...prev.colors, newColor.trim()] }));
      setNewColor('');
    }
  };

  const removeColor = (colorToRemove) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((c) => c !== colorToRemove),
    }));
  };

  const addImageUrl = (e) => {
    e.preventDefault();
    if (imageInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images.filter(Boolean), imageInput.trim()],
      }));
      setImageInput('');
    }
  };

  const removeImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const data = new FormData();
    for (let i = 0; i < files.length; i++) {
      data.append('images', files[i]);
    }

    try {
      toast.info('Uploading image(s)...');
      const res = await adminService.uploadImages(data);
      if (res.success && res.data) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images.filter(Boolean), ...res.data],
        }));
        toast.success('Images uploaded successfully');
      }
    } catch (err) {
      toast.error('Image upload failed. You can paste image URLs directly.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) return toast.error('Product name is required');
    if (!formData.price || formData.price <= 0) return toast.error('Valid price is required');
    if (!formData.category) return toast.error('Please select a category');
    if (formData.sizes.length === 0) return toast.error('Select at least one size');

    const cleanImages = formData.images.filter(Boolean);
    if (cleanImages.length === 0) {
      cleanImages.push('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800');
    }

    const payload = {
      ...formData,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : Number(formData.price),
      stock: Number(formData.stock),
      images: cleanImages,
      tags: formData.tags
        ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
    };

    try {
      setSaving(true);
      if (isEdit) {
        await adminService.updateProduct(initialData._id, payload);
        toast.success('Product updated successfully!');
      } else {
        await adminService.createProduct(payload);
        toast.success('Product created successfully!');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Basic Info */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-neutral-900 border-b border-neutral-100 pb-3">
              General Information
            </h2>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Product Title *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleTextChange}
                placeholder="e.g. Oversized Heavyweight Cotton T-Shirt"
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleTextChange}
                placeholder="Describe fabric, fit, detailing, model specifications..."
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleTextChange}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  SKU (Inventory Identifier)
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleTextChange}
                  placeholder="WG-TEE-001"
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Card: Media & Images */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-neutral-900 border-b border-neutral-100 pb-3">
              Product Images
            </h2>

            {/* URL input */}
            <div className="flex gap-2">
              <input
                type="url"
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                placeholder="Paste direct image URL (e.g. Unsplash, CDN)"
                className="flex-1 px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={addImageUrl}
                className="px-4 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-xl hover:bg-neutral-800"
              >
                Add URL
              </button>
            </div>

            {/* File Upload Option */}
            <div className="flex items-center space-x-3 pt-2">
              <label className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-xl transition-colors">
                <Upload className="w-4 h-4" />
                <span>Upload From Device</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-neutral-400">JPG, PNG, WEBP</span>
            </div>

            {/* Image Preview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {formData.images.filter(Boolean).map((url, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50 aspect-[3/4]">
                  <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1.5 right-1.5 p-1 bg-neutral-900/80 text-white rounded-full hover:bg-rose-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-neutral-900/80 text-[10px] text-white rounded font-medium">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Card: Variants (Sizes & Colors) */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-neutral-900 border-b border-neutral-100 pb-3">
              Variants (Sizes & Colors)
            </h2>

            {/* Sizes */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                Available Sizes *
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_SIZES.map((size) => {
                  const selected = formData.sizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        selected
                          ? 'bg-neutral-900 text-white shadow-sm'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Colors */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                Colors
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  placeholder="e.g. Jet Black, Olive Green"
                  className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={addColor}
                  className="px-3 py-1.5 bg-neutral-900 text-white text-xs font-semibold rounded-xl hover:bg-neutral-800"
                >
                  Add Color
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.colors.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center space-x-1.5 px-3 py-1 bg-neutral-100 rounded-full text-xs font-medium text-neutral-800"
                  >
                    <span>{c}</span>
                    <button
                      type="button"
                      onClick={() => removeColor(c)}
                      className="text-neutral-400 hover:text-rose-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Controls (1 col) */}
        <div className="space-y-6">
          {/* Card: Pricing & Stock */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-neutral-900 border-b border-neutral-100 pb-3">
              Pricing & Stock
            </h2>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Selling Price (₹ INR) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleTextChange}
                placeholder="999"
                min="1"
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-900 focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Original / MRP Price (₹ INR)
              </label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleTextChange}
                placeholder="1499"
                min="1"
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-600 focus:outline-none focus:border-primary"
              />
              <p className="text-[11px] text-neutral-400 mt-1">If higher than price, discount % is calculated automatically.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Stock Quantity *
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleTextChange}
                placeholder="25"
                min="0"
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-900 focus:outline-none focus:border-primary"
                required
              />
            </div>
          </div>

          {/* Card: Organization */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-neutral-900 border-b border-neutral-100 pb-3">
              Organization
            </h2>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleTextChange}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-800 focus:outline-none focus:border-primary"
                required
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Subcategory
              </label>
              <input
                type="text"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleTextChange}
                placeholder="e.g. T-Shirts, Denim, Hoodies"
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleTextChange}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-800 focus:outline-none focus:border-primary"
              >
                {GENDERS.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Tags (Comma-separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleTextChange}
                placeholder="summer, cotton, casual, bestseller"
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Card: Visibility Flags */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-3">
            <h2 className="text-base font-bold text-neutral-900 border-b border-neutral-100 pb-3">
              Display Badges
            </h2>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleTextChange}
                className="w-4 h-4 rounded text-primary focus:ring-primary"
              />
              <span className="text-sm text-neutral-800">Feature on Homepage</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="isBestSeller"
                checked={formData.isBestSeller}
                onChange={handleTextChange}
                className="w-4 h-4 rounded text-primary focus:ring-primary"
              />
              <span className="text-sm text-neutral-800">Mark as Best Seller</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="isNewArrival"
                checked={formData.isNewArrival}
                onChange={handleTextChange}
                className="w-4 h-4 rounded text-primary focus:ring-primary"
              />
              <span className="text-sm text-neutral-800">Mark as New Arrival</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover shadow-sm transition-colors text-center disabled:opacity-50"
            >
              {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="w-full py-3 bg-neutral-100 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-200 transition-colors text-center text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default ProductForm;
