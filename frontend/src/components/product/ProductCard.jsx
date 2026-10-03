import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/formatters';

export const ProductCard = ({ product }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (!product) return null;

  const isFavorited = isInWishlist(product._id);
  const primaryImage = product.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80';
  const secondaryImage = product.images?.[1] || primaryImage;

  const displayCurrentPrice = product.discountPrice && product.discountPrice < product.price ? product.discountPrice : product.price;
  const displayOriginalPrice = product.originalPrice && product.originalPrice > displayCurrentPrice ? product.originalPrice : (product.discountPrice ? product.price : null);
  const hasDiscount = Boolean(displayOriginalPrice && displayOriginalPrice > displayCurrentPrice);
  const discountPercent = product.discountPercentage || (hasDiscount ? Math.round(((displayOriginalPrice - displayCurrentPrice) / displayOriginalPrice) * 100) : 0);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultSize = product.sizes?.[0] || 'M';
    const defaultColor = product.colors?.[0]?.name || 'Default';
    addToCart(product, defaultSize, defaultColor, 1);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 hover:border-slate-300 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* Product Image Container */}
      <Link
        to={`/product/${product.slug || product._id}`}
        className="relative block w-full aspect-[3/4] bg-slate-50 overflow-hidden"
      >
        <img
          src={primaryImage}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-2.5 right-2.5 z-10 p-2 rounded-full transition-all duration-200 ${
            isFavorited
              ? 'bg-rose-50 text-rose-600 shadow-sm'
              : 'bg-white/80 text-slate-600 hover:bg-white hover:text-rose-500 shadow-sm'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
          {hasDiscount && (
            <span className="text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 uppercase tracking-wider shadow-sm">
              {discountPercent}% OFF
            </span>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500 text-white uppercase tracking-wider">
              Only {product.stock} left
            </span>
          )}
          {product.stock === 0 && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-white uppercase tracking-wider">
              Out of stock
            </span>
          )}
        </div>

        {/* Quick Add Overlay on desktop hover */}
        <div className="hidden md:flex absolute inset-x-2 bottom-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleQuickAdd}
            disabled={product.stock === 0}
            className="w-full py-2.5 px-4 bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-bold rounded-xl backdrop-blur-sm transition-all duration-200 flex items-center justify-center gap-1.5 shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{product.stock === 0 ? 'SOLD OUT' : 'QUICK ADD'}</span>
          </button>
        </div>
      </Link>

      {/* Details Container */}
      <div className="p-3 md:p-4 flex flex-col flex-grow justify-between">
        <div>
          {/* Brand & Rating */}
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase truncate">
              {product.brand || 'Wear & Go'}
            </span>
            <div className="flex items-center gap-1 text-slate-700 text-xs font-semibold shrink-0">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating || '4.5'}</span>
            </div>
          </div>

          {/* Title */}
          <Link
            to={`/product/${product.slug || product._id}`}
            className="block text-xs md:text-sm font-semibold text-slate-800 hover:text-amber-700 transition-colors line-clamp-1 mb-2"
            title={product.name}
          >
            {product.name}
          </Link>
        </div>

        {/* Price & Mobile Add */}
        <div className="flex items-baseline justify-between pt-1 border-t border-slate-50">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm md:text-base font-extrabold text-slate-900">
              {formatPrice(displayCurrentPrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through">
                {formatPrice(displayOriginalPrice)}
              </span>
            )}
          </div>

          {/* Mobile Quick Add Icon */}
          <button
            onClick={handleQuickAdd}
            disabled={product.stock === 0}
            aria-label="Add to cart"
            className="md:hidden p-1.5 rounded-lg bg-slate-100 active:bg-slate-900 active:text-white text-slate-700 transition-colors disabled:opacity-40"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
