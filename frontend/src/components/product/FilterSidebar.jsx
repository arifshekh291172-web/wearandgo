import React from 'react';
import { RotateCcw, Check } from 'lucide-react';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const GENDERS = [
  { label: 'All', value: 'all' },
  { label: 'Men', value: 'men' },
  { label: 'Women', value: 'women' },
  { label: 'Kids', value: 'kids' },
];
const POPULAR_COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Blue', hex: '#1E3A8A' },
  { name: 'Green', hex: '#15803D' },
  { name: 'Grey', hex: '#4B5563' },
  { name: 'Beige', hex: '#D2B48C' },
];

export const FilterSidebar = ({
  categories = [],
  selectedCategory,
  onSelectCategory,
  selectedGender,
  onSelectGender,
  selectedSizes = [],
  onToggleSize,
  selectedColors = [],
  onToggleColor,
  minPrice,
  maxPrice,
  onPriceChange,
  rating,
  onRatingChange,
  inStockOnly,
  onToggleInStock,
  discountOnly,
  onToggleDiscount,
  onResetFilters,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-900 tracking-tight text-base">FILTERS</h3>
        <button
          onClick={onResetFilters}
          className="text-xs font-semibold text-slate-400 hover:text-amber-700 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset All</span>
        </button>
      </div>

      {/* Gender */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Gender</h4>
        <div className="grid grid-cols-2 gap-1.5">
          {GENDERS.map((g) => (
            <button
              key={g.value}
              onClick={() => onSelectGender(g.value)}
              className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                selectedGender === g.value
                  ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                  : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Categories</h4>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => onSelectCategory('all')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              !selectedCategory || selectedCategory === 'all'
                ? 'bg-amber-50 text-amber-900 font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === cat.slug
                  ? 'bg-amber-50 text-amber-900 font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Size</h4>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((sz) => {
            const isSelected = selectedSizes.includes(sz);
            return (
              <button
                key={sz}
                onClick={() => onToggleSize(sz)}
                className={`w-9 h-9 text-xs font-bold rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                }`}
              >
                {sz}
              </button>
            );
          })}
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Color</h4>
        <div className="flex flex-wrap gap-2.5">
          {POPULAR_COLORS.map((c) => {
            const isSelected = selectedColors.includes(c.name);
            return (
              <button
                key={c.name}
                onClick={() => onToggleColor(c.name)}
                title={c.name}
                aria-label={c.name}
                className={`w-7 h-7 rounded-full border flex items-center justify-center transition-transform hover:scale-110 ${
                  isSelected ? 'ring-2 ring-slate-900 ring-offset-2' : 'border-slate-200'
                }`}
                style={{ backgroundColor: c.hex }}
              >
                {isSelected && (
                  <Check
                    className={`w-3.5 h-3.5 ${
                      c.name === 'White' || c.name === 'Beige'
                        ? 'text-slate-900'
                        : 'text-white'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Price (₹)</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice || ''}
            onChange={(e) => onPriceChange(e.target.value, maxPrice)}
            className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
          <span className="text-slate-300">-</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice || ''}
            onChange={(e) => onPriceChange(minPrice, e.target.value)}
            className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Rating Filter */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Customer Rating</h4>
        <div className="space-y-1.5">
          {[4, 3].map((r) => (
            <label key={r} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="radio"
                name="rating"
                checked={Number(rating) === r}
                onChange={() => onRatingChange(r)}
                className="text-slate-900 focus:ring-slate-900"
              />
              <span>{r}★ and above</span>
            </label>
          ))}
          {rating && (
            <button
              onClick={() => onRatingChange(null)}
              className="text-[11px] text-amber-800 underline font-semibold mt-1"
            >
              Clear rating filter
            </button>
          )}
        </div>
      </div>

      {/* Checkboxes: Stock & Discount */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={onToggleInStock}
            className="rounded text-slate-900 focus:ring-slate-900"
          />
          <span>In Stock Only</span>
        </label>
        <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={discountOnly}
            onChange={onToggleDiscount}
            className="rounded text-slate-900 focus:ring-slate-900"
          />
          <span>Discounted Items Only</span>
        </label>
      </div>
    </div>
  );
};
