import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Zap,
  Truck,
  RotateCcw,
  ShieldCheck,
  Ruler,
  Check,
  Star,
  ChevronRight,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { RatingStars } from '../components/common/RatingStars';
import { PriceDisplay } from '../components/common/PriceDisplay';
import { ProductCard } from '../components/product/ProductCard';
import { ProductDetailSkeleton } from '../components/common/Skeleton';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { Modal } from '../components/common/Modal';
import { formatPrice, formatDate } from '../utils/formatters';

export const ProductDetailPage = () => {
  const { id: slugOrId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // User selections
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Modals & UI states
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null);

  // Review submission form state
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const res = await productService.getProduct(slugOrId);
        if (res.success && res.product) {
          const prod = res.product;
          setProduct(prod);
          setSelectedSize(prod.sizes?.[0] || 'M');
          setSelectedColor(prod.colors?.[0]?.name || 'Default');
          setSelectedImageIndex(0);

          // Fetch related products and reviews in parallel
          const [relRes, revRes] = await Promise.all([
            productService.getRelatedProducts(prod._id),
            productService.getReviews(prod._id),
          ]);

          if (relRes.success) setRelatedProducts(relRes.products || []);
          if (revRes.success) setReviews(revRes.reviews || []);
        }
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slugOrId]);

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Product Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested item might be discontinued or unavailable.
        </p>
        <Link
          to="/shop"
          className="inline-block px-6 py-2.5 bg-slate-900 text-white text-xs font-bold uppercase rounded-xl"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const isFavorited = isInWishlist(product._id);
  const currentPrice = product.discountPrice || product.price;
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please choose a size');
      return;
    }
    addToCart(product, selectedSize, selectedColor, quantity);
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      toast.error('Please choose a size');
      return;
    }
    const added = addToCart(product, selectedSize, selectedColor, quantity);
    if (added) {
      navigate('/checkout');
    }
  };

  const handleCheckPincode = (e) => {
    e.preventDefault();
    if (!pincode || pincode.trim().length !== 6 || isNaN(pincode)) {
      setPincodeStatus({ valid: false, message: 'Please enter a valid 6-digit Indian PIN code' });
      return;
    }
    // Calculate expected delivery date (3 days from now)
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);
    const dateStr = deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    });

    setPincodeStatus({
      valid: true,
      message: `Delivery available to ${pincode}! Expected by ${dateStr}.`,
    });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please log in to submit a review');
      navigate('/login');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await productService.addReview({
        productId: product._id,
        rating: newRating,
        title: newTitle,
        comment: newComment,
      });

      if (res.success) {
        toast.success('Thank you! Your verified review has been submitted.');
        setReviews([res.review, ...reviews]);
        setReviewModalOpen(false);
        setNewTitle('');
        setNewComment('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-12">
      <Breadcrumb
        items={[
          { label: 'Shop', link: '/shop' },
          { label: product.category?.name || 'Category', link: `/shop?category=${product.category?.slug}` },
          { label: product.name },
        ]}
      />

      {/* Main Product Showcase (Left: Gallery, Right: Buy Box) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* LEFT: IMAGE GALLERY */}
        <div className="space-y-4">
          {/* Main Selected Image */}
          <div className="relative aspect-[3/4] bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shadow-sm group">
            <img
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
            />
            {product.discountPercentage > 0 && (
              <span className="absolute top-4 left-4 bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                {product.discountPercentage}% OFF
              </span>
            )}
            <button
              onClick={() => toggleWishlist(product)}
              className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all shadow-md ${
                isFavorited
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-white/80 text-slate-700 hover:text-rose-600'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>

          {/* Thumbnails Row */}
          {product.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImageIndex === idx
                      ? 'border-slate-950 ring-2 ring-slate-900/10'
                      : 'border-slate-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover object-top" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: BUY BOX & PRODUCT DETAILS */}
        <div className="space-y-6">
          {/* Brand & Title */}
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block mb-1">
              {product.brand}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-slate-950 leading-tight">
              {product.name}
            </h1>
            <p className="text-[11px] font-mono text-slate-400 mt-1">SKU: {product.SKU}</p>
          </div>

          {/* Rating & Review Jump */}
          <div className="flex items-center gap-3">
            <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Verified Authentic</span>
            </span>
          </div>

          {/* Price Box */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-950">
                {formatPrice(currentPrice)}
              </span>
              {product.discountPrice && product.discountPrice < product.price && (
                <>
                  <span className="text-base text-slate-400 line-through">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-xs font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md">
                    Save {formatPrice(product.price - product.discountPrice)} ({product.discountPercentage}%)
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] text-slate-400">Inclusive of all Indian taxes and GST</p>
          </div>

          {/* Low Stock or Out of Stock Alert */}
          {product.stock <= 5 && product.stock > 0 && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-900 text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Hurry! Only <strong>{product.stock} items</strong> left in stock.</span>
            </div>
          )}
          {isOutOfStock && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Currently out of stock. Add to wishlist to get notified when restocked.</span>
            </div>
          )}

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-900 uppercase tracking-wider">
                  Color: <span className="font-normal text-slate-600">{selectedColor}</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                      selectedColor === c.name
                        ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection & Size Guide */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 uppercase tracking-wider">
                Select Size: <span className="text-amber-800 font-extrabold">{selectedSize}</span>
              </span>
              <button
                onClick={() => setSizeGuideOpen(true)}
                className="text-slate-500 hover:text-slate-950 font-semibold flex items-center gap-1 transition-colors underline"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Size Guide</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`w-12 h-11 text-xs font-bold rounded-xl border transition-all ${
                    selectedSize === sz
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-105'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-slate-900'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Quantity:</span>
            <div className="flex items-center border border-slate-200 rounded-xl bg-white">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="px-3 py-1.5 text-sm font-bold text-slate-600 hover:text-slate-950 disabled:opacity-30"
              >
                -
              </button>
              <span className="w-8 text-center text-xs font-bold text-slate-900">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                disabled={quantity >= product.stock}
                className="px-3 py-1.5 text-sm font-bold text-slate-600 hover:text-slate-950 disabled:opacity-30"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons: Add to Bag & Buy Now */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="w-full py-4 px-6 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition-all shadow-xl active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{isOutOfStock ? 'OUT OF STOCK' : 'ADD TO BAG'}</span>
            </button>

            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="w-full py-4 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold uppercase tracking-wider rounded-2xl transition-all shadow-xl active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>BUY NOW</span>
            </button>
          </div>

          {/* Delivery & Pincode Checker */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Truck className="w-4 h-4 text-slate-700" />
              <span>Delivery Options</span>
            </div>
            <form onSubmit={handleCheckPincode} className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Enter 6-digit Pincode"
                className="flex-1 bg-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
              >
                Check
              </button>
            </form>
            {pincodeStatus && (
              <p
                className={`text-xs font-medium ${
                  pincodeStatus.valid ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {pincodeStatus.message}
              </p>
            )}
            <div className="pt-2 border-t border-slate-200/60 flex flex-col gap-1 text-[11px] text-slate-500">
              <span>✓ 100% Original Products</span>
              <span>✓ Pay on delivery available</span>
              <span>✓ Easy 7 days returns and exchanges</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details, Specs & Return Policy Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-slate-100">
        <div className="md:col-span-2 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider mb-3">
              Product Description
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {product.specifications && product.specifications.length > 0 && (
            <div>
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider mb-3">
                Specifications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {product.specifications.map((spec, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block">{spec.name}</span>
                    <span className="font-semibold text-slate-800">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Guarantees Box */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4 h-fit">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Wear & Go Assurance
          </h4>
          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-start gap-2.5">
              <RotateCcw className="w-4 h-4 text-slate-800 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block">7-Day Easy Return</strong>
                <span>Try at home. Exchange or refund if it doesn't fit your aesthetic.</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-slate-800 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block">Quality Assured</strong>
                <span>Directly sourced from premier textile hubs with double quality checks.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="pt-8 border-t border-slate-100 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold font-serif text-slate-950">
              Customer Ratings & Reviews
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <RatingStars rating={product.rating} reviewCount={product.reviewCount} size="md" />
              <span className="text-xs text-slate-400">Based on verified purchases</span>
            </div>
          </div>
          <button
            onClick={() => setReviewModalOpen(true)}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm self-start sm:self-auto"
          >
            Write a Review
          </button>
        </div>

        {/* Reviews List */}
        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div
                key={rev._id}
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RatingStars rating={rev.rating} showNumber={false} />
                    {rev.verifiedPurchase && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                        ✓ Verified Buyer
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">{formatDate(rev.createdAt)}</span>
                </div>
                {rev.title && <h5 className="font-bold text-xs text-slate-900">{rev.title}</h5>}
                <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                <p className="text-[11px] font-semibold text-slate-400 pt-1">{rev.userName}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 p-8 rounded-2xl text-center space-y-2 border border-slate-100">
            <p className="text-xs font-semibold text-slate-700">No reviews yet for this product.</p>
            <p className="text-[11px] text-slate-400">Be the first verified customer to share your thoughts!</p>
          </div>
        )}
      </section>

      {/* Related Products Carousel/Grid */}
      {relatedProducts.length > 0 && (
        <section className="pt-8 border-t border-slate-100 space-y-6">
          <h3 className="text-xl font-bold font-serif text-slate-950">You May Also Like</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* SIZE GUIDE MODAL */}
      <Modal isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} title="Size Guide (Inches)">
        <div className="space-y-4 text-xs">
          <p className="text-slate-500">
            Measurements are provided in inches. For a relaxed oversized fit, consider sticking to your usual size.
          </p>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-center">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Size</th>
                  <th className="p-2.5">Chest</th>
                  <th className="p-2.5">Waist</th>
                  <th className="p-2.5">Length</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr><td className="p-2.5 font-bold">XS</td><td>36"</td><td>30"</td><td>27"</td></tr>
                <tr><td className="p-2.5 font-bold">S</td><td>38"</td><td>32"</td><td>28"</td></tr>
                <tr><td className="p-2.5 font-bold">M</td><td>40"</td><td>34"</td><td>29"</td></tr>
                <tr><td className="p-2.5 font-bold">L</td><td>42"</td><td>36"</td><td>30"</td></tr>
                <tr><td className="p-2.5 font-bold">XL</td><td>44"</td><td>38"</td><td>31"</td></tr>
                <tr><td className="p-2.5 font-bold">XXL</td><td>46"</td><td>40"</td><td>32"</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* WRITE A REVIEW MODAL */}
      <Modal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} title="Write a Customer Review">
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
              Your Rating (1-5)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setNewRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= newRating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200 fill-slate-100'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
              Review Title
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Incredible fit and luxurious fabric!"
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
              Review Details
            </label>
            <textarea
              rows={4}
              required
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Describe the fit, material comfort, and style..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submittingReview}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductDetailPage;
