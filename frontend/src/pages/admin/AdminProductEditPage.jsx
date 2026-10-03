import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductForm from '../../components/admin/ProductForm';
import { ArrowLeft } from 'lucide-react';
import { productService } from '../../services/productService';
import Loader from '../../components/common/Loader';

const AdminProductEditPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await productService.getProductById(id);
      if (res.success) {
        setProduct(res.data);
      }
    } catch (err) {
      setError('Product not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader fullScreen={false} />;

  if (error || !product) {
    return (
      <div className="bg-red-50 p-6 rounded-2xl text-center text-red-700">
        <p className="font-semibold">{error || 'Product not found'}</p>
        <Link to="/admin/products" className="mt-3 inline-block text-xs font-bold underline">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Link
          to="/admin/products"
          className="p-2 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 text-neutral-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Edit Product</h1>
          <p className="text-xs text-neutral-500 mt-0.5">Editing: {product.name}</p>
        </div>
      </div>

      <ProductForm initialData={product} isEdit={true} />
    </div>
  );
};

export default AdminProductEditPage;
