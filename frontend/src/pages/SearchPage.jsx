import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, PackageSearch, ArrowRight } from 'lucide-react';
import { productService } from '../services/productService';
import { ProductCard } from '../components/product/ProductCard';
import { ProductCardSkeleton } from '../components/common/Skeleton';
import { Breadcrumb } from '../components/common/Breadcrumb';

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  useEffect(() => {
    const doSearch = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
          productService.getProducts({ search: query, limit: 20 }),
          productService.getCategories(),
        ]);

        if (prodRes.success) {
          setProducts(prodRes.products || []);
          setTotal(prodRes.total || 0);
        }
        if (catRes.success) {
          setCategories(catRes.categories || []);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    doSearch();
  }, [query]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      <Breadcrumb items={[{ label: 'Search Results' }]} />

      {/* Search Input Bar */}
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-950">
          {query ? `Results for "${query}"` : 'Search Wear & Go'}
        </h1>
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by product name, category, brand, SKU..."
            className="w-full bg-slate-50 text-xs sm:text-sm pl-11 pr-24 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 shadow-sm"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
          >
            Search
          </button>
        </form>
        {query && !loading && (
          <p className="text-xs text-slate-500">
            Found <strong className="text-slate-900">{total}</strong> matching products
          </p>
        )}
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <ProductCardSkeleton key={n} />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {products.map((prod) => (
            <ProductCard key={prod._id} product={prod} />
          ))}
        </div>
      ) : (
        /* Empty State with Category Shortcuts */
        <div className="py-16 text-center space-y-8 bg-slate-50 rounded-3xl p-8 border border-slate-100">
          <div className="space-y-3">
            <div className="w-16 h-16 bg-white text-slate-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <PackageSearch className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              No products found for "{query}"
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Please check your spelling or try exploring one of our popular categories below.
            </p>
          </div>

          {/* Recommended Categories */}
          <div className="max-w-xl mx-auto pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
              Explore Popular Categories
            </h4>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/shop?category=${cat.slug}`}
                  className="px-4 py-2 bg-white hover:bg-slate-900 hover:text-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                >
                  <span>{cat.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
