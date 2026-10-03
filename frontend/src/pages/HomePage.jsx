import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Star,
  Quote,
} from 'lucide-react';
import { productService } from '../services/productService';
import { ProductCard } from '../components/product/ProductCard';
import { ProductCardSkeleton } from '../components/common/Skeleton';
import { STORE_CONFIG } from '../utils/config';

export const HomePage = () => {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [bannersRes, catsRes, collectionsRes] = await Promise.all([
          productService.getBanners(),
          productService.getCategories(),
          productService.getHomeCollections(),
        ]);

        if (bannersRes.success) setBanners(bannersRes.banners || []);
        if (catsRes.success) setCategories(catsRes.categories || []);
        if (collectionsRes.success && collectionsRes.collections) {
          setFeaturedProducts(collectionsRes.collections.featured || []);
          setBestSellers(collectionsRes.collections.bestsellers || []);
          setNewArrivals(collectionsRes.collections.newArrivals || []);
        }
      } catch (err) {
        console.error('Failed to load home page content:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  // Automatic hero slider transition
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [banners.length]);

  const activeBanner = banners[currentSlide] || {
    title: 'ELEVATE YOUR EVERYDAY',
    subtitle: 'Style That Moves With You. Discover the new 2026 Collection.',
    badge: 'NEW SEASON 2026',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=85',
    buttonText: 'SHOP COLLECTION',
    buttonLink: '/shop',
  };

  return (
    <div className="space-y-16 md:space-y-24">
      {/* 1. HERO BANNER SLIDER */}
      <section className="relative w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] max-h-[640px] bg-slate-900 overflow-hidden">
        {banners.length > 0 ? (
          banners.map((b, idx) => (
            <div
              key={b._id || idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={b.image}
                alt={b.title}
                className="w-full h-full object-cover object-center"
              />
              {/* Gradient Overlay for high text contrast */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/50 to-transparent" />

              {/* Banner Content */}
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-7xl mx-auto px-6 sm:px-12 w-full">
                  <div className="max-w-xl space-y-3 sm:space-y-4 text-white">
                    <div className="flex items-center gap-2.5">
                      <img
                        src="/logo.png"
                        alt="W&G"
                        className="h-8 sm:h-9 w-auto filter drop-shadow-[0_2px_8px_rgba(197,160,89,0.5)]"
                      />
                      <span className="inline-block px-3 py-1 bg-gradient-to-r from-gold-500 to-gold-600 text-slate-950 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-full shadow-md">
                        {b.badge || 'EXCLUSIVE 2026'}
                      </span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-serif tracking-tight leading-none text-white">
                      {b.title}
                    </h1>
                    <p className="text-xs sm:text-sm md:text-base text-slate-200 line-clamp-2 max-w-md">
                      {b.subtitle}
                    </p>
                    <div className="pt-2 flex items-center gap-3">
                      <Link
                        to={b.buttonLink || '/shop'}
                        className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 hover:from-gold-300 hover:to-gold-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-gold-500/20 active:scale-95"
                      >
                        <span>{b.buttonText || 'SHOP COLLECTION'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        to="/shop?gender=women"
                        className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl backdrop-blur-md border border-white/20 transition-all active:scale-95"
                      >
                        <span>WOMEN</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="relative w-full h-full flex items-center bg-slate-900 text-white">
            <div className="max-w-7xl mx-auto px-6">
              <h1 className="text-4xl sm:text-6xl font-bold font-serif">WEAR & GO</h1>
              <p className="text-amber-400 font-semibold">{STORE_CONFIG.tagline}</p>
            </div>
          </div>
        )}

        {/* Carousel controls */}
        {banners.length > 1 && (
          <>
            <button
              onClick={() =>
                setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1))
              }
              aria-label="Previous slide"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % banners.length)}
              aria-label="Next slide"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </section>

      {/* 2. CATEGORY SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block mb-1">
              Curated Collections
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-serif text-slate-950">
              Shop by Category
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs sm:text-sm font-bold text-slate-900 hover:text-amber-700 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/shop?category=${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-[3/4] bg-slate-100 flex flex-col justify-end p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all"
            >
              <img
                src={cat.image}
                alt={cat.name}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              <div className="relative z-10 text-white">
                <h3 className="font-bold text-sm sm:text-base leading-tight group-hover:text-amber-300 transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[10px] text-slate-300 flex items-center gap-1 mt-0.5 opacity-90">
                  <span>Explore</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block mb-1">
              Fresh Drops 2026
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-serif text-slate-950">
              New Arrivals
            </h2>
          </div>
          <Link
            to="/shop?newArrival=true"
            className="text-xs sm:text-sm font-bold text-slate-900 hover:text-amber-700 flex items-center gap-1 transition-colors"
          >
            <span>See More</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.slice(0, 8).map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* 4. PROMOTIONAL MID-BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl overflow-hidden luxury-card text-white p-8 md:p-14 shadow-2xl gold-border-glow">
          <div className="absolute inset-0 opacity-20">
            <img
              src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1600&q=80"
              alt="Promo background"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Decorative Logo Watermark */}
          <div className="absolute -right-8 -bottom-10 opacity-15 pointer-events-none hidden lg:block">
            <img src="/logo.png" alt="W&G Watermark" className="w-96 h-auto filter grayscale contrast-125" />
          </div>

          <div className="relative z-10 max-w-xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="inline-block px-3 py-1 bg-gradient-to-r from-gold-500 to-gold-600 text-slate-950 font-black text-xs uppercase tracking-widest rounded-full shadow-md">
                LIMITED COUTURE EDIT
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black font-serif tracking-tight text-white">
              UP TO <span className="gold-gradient-text">50% OFF</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Experience the pinnacle of everyday tailoring. Use VIP code{' '}
              <strong className="text-gold-300 font-mono text-sm px-2 py-0.5 bg-slate-900/90 border border-gold-500/30 rounded-lg">
                STYLE20
              </strong>{' '}
              at checkout for an instant 20% privilege savings on orders above ₹1,999.
            </p>
            <div className="pt-2 flex items-center gap-4">
              <Link
                to="/shop?discountOnly=true"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 hover:from-gold-300 hover:to-gold-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-gold-500/20 active:scale-95"
              >
                <span>CLAIM PRIVILEGE OFFER</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BEST SELLERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block mb-1">
              Customer Favorites
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-serif text-slate-950">
              Best Sellers
            </h2>
          </div>
          <Link
            to="/shop?bestseller=true"
            className="text-xs sm:text-sm font-bold text-slate-900 hover:text-amber-700 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {bestSellers.slice(0, 8).map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* 5.5 WEAR & GO PRIVÉ ATELIER */}
      <section className="bg-obsidian-900 text-white py-16 px-4 sm:px-6 relative overflow-hidden border-y border-gold-500/20">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gold-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 text-center space-y-10">
          <div className="space-y-4 max-w-2xl mx-auto">
            <img
              src="/logo.png"
              alt="Wear & Go Atelier"
              className="h-20 w-auto mx-auto object-contain filter drop-shadow-[0_4px_20px_rgba(197,160,89,0.5)] transition-transform hover:scale-105"
            />
            <span className="text-xs font-black uppercase tracking-[0.25em] text-primary block">
              HAUTE ATELIER & DESIGN STUDIO
            </span>
            <h2 className="text-3xl sm:text-5xl font-black font-serif text-white tracking-tight">
              Crafted for the Discerning.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              Every garment in the Wear & Go collection is born from meticulous mill sourcing, 
              precision pattern drafting, and heavy-gauge construction built to transcend seasons.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto">
            <div className="p-6 rounded-2xl bg-white/5 border border-gold-500/20 backdrop-blur-sm space-y-2 hover:border-gold-500/50 transition-all">
              <span className="text-gold-400 font-serif font-black text-lg">01.</span>
              <h3 className="font-bold text-sm text-white font-serif">280+ GSM High-Density Weaves</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pre-shrunk ring-spun combed cottons that maintain drape, softness, and rich coloration through 100+ washes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-gold-500/20 backdrop-blur-sm space-y-2 hover:border-gold-500/50 transition-all">
              <span className="text-gold-400 font-serif font-black text-lg">02.</span>
              <h3 className="font-bold text-sm text-white font-serif">Architectural Silhouettes</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sculpted drop-shoulder angles and tapered ankle lines engineered for seamless fluid mobility.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-gold-500/20 backdrop-blur-sm space-y-2 hover:border-gold-500/50 transition-all">
              <span className="text-gold-400 font-serif font-black text-lg">03.</span>
              <h3 className="font-bold text-sm text-white font-serif">Bespoke Hardware Detailing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Antiqued metal zipper pulls, laser-etched horn buttons, and subtle golden emblem embroidery.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Link
              to="/shop?newArrival=true"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 hover:from-gold-300 hover:to-gold-500 text-slate-950 font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-gold-500/20 active:scale-95"
            >
              <span>EXPLORE ATELIER COLLECTION</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. WHY SHOP WITH US */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block mb-1">
            The Wear & Go Promise
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-serif text-slate-950">
            Why Shop With Us
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Lightning Fast Delivery</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Dispatched within 24 hours across 19,000+ Indian PIN codes via top courier partners.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Easy 7-Day Returns</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Not the right fit? Effortless doorstep reverse pickups with instantaneous refunds.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Premium GSM Fabrics</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pre-shrunk combed cottons, French linens, and tailored knits built to last.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">100% Secure Payments</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Encrypted Razorpay checkout, UPI, net banking, or pay via Cash on Delivery.
            </p>
          </div>
        </div>
      </section>

      {/* 7. CUSTOMER TESTIMONIALS */}
      <section className="bg-slate-50 py-16 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block mb-1">
              Verified Stories
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-serif text-slate-950">
              Loved by 50,000+ Fashion Shoppers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <div className="flex text-amber-400 gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 italic leading-relaxed">
                "The 240 GSM oversized tee is easily comparable to international luxury brands selling at triple the price. The drop shoulder silhouette is unmatched."
              </p>
              <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Arjun Mehta</h4>
                  <p className="text-[11px] text-slate-400">Mumbai • Verified Buyer</p>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600">✓ Verified</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <div className="flex text-amber-400 gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 italic leading-relaxed">
                "Ordered the linen resort shirt for my Goa vacation. Arrived in 2 days in Bengaluru! The packaging felt like unboxing a high-end luxury gift."
              </p>
              <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Pooja Nair</h4>
                  <p className="text-[11px] text-slate-400">Bengaluru • Verified Buyer</p>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600">✓ Verified</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <div className="flex text-amber-400 gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 italic leading-relaxed">
                "I was skeptical about ordering shoes online, but the Nappa leather sneakers are genuinely comfortable from day one. Zero break-in blisters!"
              </p>
              <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Vikramaditya S.</h4>
                  <p className="text-[11px] text-slate-400">Delhi NCR • Verified Buyer</p>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600">✓ Verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
