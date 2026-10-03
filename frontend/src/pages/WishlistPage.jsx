import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import Breadcrumb from '../components/common/Breadcrumb';
import { formatPrice } from '../utils/formatters';

export const WishlistPage = () => {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToBag = (product) => {
    const size = product.sizes?.[0] || 'M';
    const color = product.colors?.[0]?.name || 'Default';
    addToCart(product, size, color, 1);
    removeFromWishlist(product._id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      <Breadcrumb items={[{ label: 'My Wishlist' }]} />

      <div className="flex items-baseline justify-between pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-950">
            Saved Items
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Keep track of garments you love and move them to bag anytime.
          </p>
        </div>
        <span className="text-xs font-bold text-slate-400">
          {wishlistItems.length} {wishlistItems.length === 1 ? 'Item' : 'Items'}
        </span>
      </div>

      {wishlistItems.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {wishlistItems.map((prod) => {
            const price = prod.discountPrice || prod.price;
            const hasDiscount = prod.discountPrice && prod.discountPrice < prod.price;

            return (
              <div
                key={prod._id}
                className="bg-white rounded-2xl border border-slate-100 hover:border-slate-300 shadow-sm transition-all overflow-hidden flex flex-col justify-between"
              >
                <div className="relative aspect-[3/4] bg-slate-50 overflow-hidden group">
                  <Link to={`/product/${prod.slug || prod._id}`}>
                    <img
                      src={prod.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80'}
                      alt={prod.name}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>
                  <button
                    onClick={() => removeFromWishlist(prod._id)}
                    aria-label="Remove from wishlist"
                    className="absolute top-2.5 right-2.5 p-2 bg-white/90 text-rose-600 rounded-full hover:bg-rose-50 shadow-sm transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 space-y-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {prod.brand || 'Wear & Go'}
                  </p>
                  <Link
                    to={`/product/${prod.slug || prod._id}`}
                    className="block text-xs sm:text-sm font-bold text-slate-900 hover:text-amber-700 transition-colors line-clamp-1"
                  >
                    {prod.name}
                  </Link>

                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="font-bold text-sm text-slate-900">{formatPrice(price)}</span>
                    {hasDiscount && (
                      <span className="text-xs text-slate-400 line-through">
                        {formatPrice(prod.price)}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleMoveToBag(prod)}
                    disabled={prod.stock === 0}
                    className="w-full mt-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-40"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{prod.stock === 0 ? 'Out of Stock' : 'Move to Bag'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center space-y-4 bg-slate-50 rounded-2xl border border-slate-100 p-8 max-w-md mx-auto">
          <div className="w-16 h-16 bg-white text-rose-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Your wishlist is empty</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Save items that catch your eye while browsing to easily revisit and purchase them later.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
          >
            <span>Explore Collections</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
