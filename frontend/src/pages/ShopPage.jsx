import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ChevronDown, PackageSearch } from 'lucide-react';
import { productService } from '../services/productService';
import { ProductCard } from '../components/product/ProductCard';
import { FilterSidebar } from '../components/product/FilterSidebar';
import { MobileFilterDrawer } from '../components/product/MobileFilterDrawer';
import { ProductCardSkeleton } from '../components/common/Skeleton';
import { Breadcrumb } from '../components/common/Breadcrumb';

export const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL search params as source of truth
  const categoryParam = searchParams.get('category') || 'all';
  const genderParam = searchParams.get('gender') || 'all';
  const sortParam = searchParams.get('sort') || 'recommended';
  const searchParam = searchParams.get('search') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const ratingParam = searchParams.get('rating') || '';
  const inStockParam = searchParams.get('inStock') === 'true';
  const discountOnlyParam = searchParams.get('discountOnly') === 'true';
  const newArrivalParam = searchParams.get('newArrival') === 'true';
  const bestsellerParam = searchParams.get('bestseller') === 'true';

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Local size & color selections
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    productService.getCategories().then((res) => {
      if (res.success) setCategories(res.categories || []);
    });
  }, []);

  // Fetch products whenever URL query params or size/color changes
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = {
          page: pageParam,
          limit: 12,
          sort: sortParam,
          category: categoryParam !== 'all' ? categoryParam : undefined,
          gender: genderParam !== 'all' ? genderParam : undefined,
          search: searchParam || undefined,
          minPrice: minPriceParam || undefined,
          maxPrice: maxPriceParam || undefined,
          rating: ratingParam || undefined,
          inStock: inStockParam ? true : undefined,
          discountOnly: discountOnlyParam ? true : undefined,
          newArrival: newArrivalParam ? true : undefined,
          bestseller: bestsellerParam ? true : undefined,
          size: selectedSizes.length > 0 ? selectedSizes.join(',') : undefined,
          color: selectedColors.length > 0 ? selectedColors.join(',') : undefined,
        };

        const res = await productService.getProducts(params);
        if (res.success) {
          setProducts(res.products || []);
          setTotal(res.total || 0);
          setTotalPages(res.totalPages || 1);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [
    categoryParam,
    genderParam,
    sortParam,
    searchParam,
    pageParam,
    minPriceParam,
    maxPriceParam,
    ratingParam,
    inStockParam,
    discountOnlyParam,
    newArrivalParam,
    bestsellerParam,
    selectedSizes,
    selectedColors,
  ]);

  // Helpers to update search params
  const updateQuery = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === null || value === undefined || value === '' || value === 'all' || value === false) {
      newParams.delete(key);
    } else {
      newParams.set(key, String(value));
    }
    newParams.set('page', '1'); // reset page on filter change
    setSearchParams(newParams);
  };

  const handlePriceChange = (min, max) => {
    const newParams = new URLSearchParams(searchParams);
    if (min) newParams.set('minPrice', min);
    else newParams.delete('minPrice');
    if (max) newParams.set('maxPrice', max);
    else newParams.delete('maxPrice');
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleToggleSize = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleToggleColor = (color) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handleResetFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setSearchParams(new URLSearchParams());
  };

  // Human readable title
  let pageTitle = 'All Collections';
  if (categoryParam !== 'all') {
    const foundCat = categories.find((c) => c.slug === categoryParam);
    pageTitle = foundCat ? foundCat.name : categoryParam.replace(/-/g, ' ');
  } else if (genderParam !== 'all') {
    pageTitle = `${genderParam.charAt(0).toUpperCase() + genderParam.slice(1)}'s Collection`;
  } else if (discountOnlyParam) {
    pageTitle = 'Offers & Sale';
  } else if (newArrivalParam) {
    pageTitle = 'New Arrivals 2026';
  } else if (bestsellerParam) {
    pageTitle = 'Best Sellers';
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-6">
      <Breadcrumb items={[{ label: 'Shop', link: '/shop' }, { label: pageTitle }]} />

      {/* Top Header & Sort Control */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-950 capitalize">
            {pageTitle}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing <strong className="text-slate-800">{products.length}</strong> of{' '}
            <strong className="text-slate-800">{total}</strong> products
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="md:hidden flex-1 py-2.5 px-4 bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-2 active:bg-slate-50"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>

          {/* Sort Dropdown */}
          <div className="relative flex items-center gap-2">
            <span className="hidden sm:inline text-xs font-bold text-slate-400 uppercase">
              Sort by:
            </span>
            <select
              value={sortParam}
              onChange={(e) => updateQuery('sort', e.target.value)}
              className="appearance-none bg-white text-xs font-bold text-slate-800 border border-slate-200 rounded-xl py-2.5 pl-3 pr-8 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer shadow-sm"
            >
              <option value="recommended">Recommended</option>
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popular">Most Popular</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Grid & Sidebar Layout */}
      <div className="flex gap-8 items-start">
        {/* Desktop Sidebar (1/4 width) */}
        <aside className="hidden md:block w-64 shrink-0">
          <FilterSidebar
            categories={categories}
            selectedCategory={categoryParam}
            onSelectCategory={(slug) => updateQuery('category', slug)}
            selectedGender={genderParam}
            onSelectGender={(g) => updateQuery('gender', g)}
            selectedSizes={selectedSizes}
            onToggleSize={handleToggleSize}
            selectedColors={selectedColors}
            onToggleColor={handleToggleColor}
            minPrice={minPriceParam}
            maxPrice={maxPriceParam}
            onPriceChange={handlePriceChange}
            rating={ratingParam}
            onRatingChange={(r) => updateQuery('rating', r)}
            inStockOnly={inStockParam}
            onToggleInStock={() => updateQuery('inStock', !inStockParam)}
            discountOnly={discountOnlyParam}
            onToggleDiscount={() => updateQuery('discountOnly', !discountOnlyParam)}
            onResetFilters={handleResetFilters}
          />
        </aside>

        {/* Product Grid Area (3/4 width) */}
        <main className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <ProductCardSkeleton key={n} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="space-y-10">
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6 border-t border-slate-100">
                  <button
                    disabled={pageParam <= 1}
                    onClick={() => updateQuery('page', pageParam - 1)}
                    className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => updateQuery('page', pageNum)}
                        className={`w-9 h-9 text-xs font-bold rounded-xl transition-all ${
                          pageParam === pageNum
                            ? 'bg-slate-900 text-white shadow-md'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    disabled={pageParam >= totalPages}
                    onClick={() => updateQuery('page', pageParam + 1)}
                    className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="py-20 text-center space-y-4 bg-slate-50/50 rounded-2xl border border-slate-100 p-8">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <PackageSearch className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No products found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                We couldn't find any products matching your selected filters. Try broadening your filter parameters.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-2 px-6 py-2.5 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-800 transition-all shadow-sm"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filter Slide-Over Drawer */}
      <MobileFilterDrawer
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        totalResults={total}
        categories={categories}
        selectedCategory={categoryParam}
        onSelectCategory={(slug) => updateQuery('category', slug)}
        selectedGender={genderParam}
        onSelectGender={(g) => updateQuery('gender', g)}
        selectedSizes={selectedSizes}
        onToggleSize={handleToggleSize}
        selectedColors={selectedColors}
        onToggleColor={handleToggleColor}
        minPrice={minPriceParam}
        maxPrice={maxPriceParam}
        onPriceChange={handlePriceChange}
        rating={ratingParam}
        onRatingChange={(r) => updateQuery('rating', r)}
        inStockOnly={inStockParam}
        onToggleInStock={() => updateQuery('inStock', !inStockParam)}
        discountOnly={discountOnlyParam}
        onToggleDiscount={() => updateQuery('discountOnly', !discountOnlyParam)}
        onResetFilters={handleResetFilters}
      />
    </div>
  );
};

export default ShopPage;
