import React from 'react';
import ProductForm from '../../components/admin/ProductForm';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminProductAddPage = () => {
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
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Add New Product</h1>
          <p className="text-xs text-neutral-500 mt-0.5">Publish a new apparel item to the Wear & Go store catalog</p>
        </div>
      </div>

      <ProductForm isEdit={false} />
    </div>
  );
};

export default AdminProductAddPage;
