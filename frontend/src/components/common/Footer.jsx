import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Instagram,
  Facebook,
  Youtube,
  Send,
  Lock,
} from 'lucide-react';
import { productService } from '../../services/productService';
import { useToast } from '../../context/ToastContext';
import { STORE_CONFIG } from '../../utils/config';

export const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const toast = useToast();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setSubscribing(true);
      const res = await productService.subscribeNewsletter(newsletterEmail);
      if (res.success) {
        toast.success(res.message);
        setNewsletterEmail('');
      }
    } catch (err) {
      toast.error('Subscription error. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-24 md:pb-12 border-t border-slate-900 mt-20">
      {/* Trust Badges Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 mb-12 border-b border-slate-900 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-900 text-amber-400 rounded-2xl shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs md:text-sm font-bold text-white">Free Express Shipping</h4>
            <p className="text-[11px] text-slate-400">On all orders above ₹999</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-900 text-amber-400 rounded-2xl shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs md:text-sm font-bold text-white">7-Day Easy Returns</h4>
            <p className="text-[11px] text-slate-400">Doorstep reverse pickups</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-900 text-amber-400 rounded-2xl shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs md:text-sm font-bold text-white">100% Genuine Quality</h4>
            <p className="text-[11px] text-slate-400">Direct from vetted mills</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-900 text-amber-400 rounded-2xl shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs md:text-sm font-bold text-white">Secure Payments</h4>
            <p className="text-[11px] text-slate-400">Razorpay, UPI & COD</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-5 gap-10 pb-12">
        {/* Brand & Newsletter Column */}
        <div className="md:col-span-2 space-y-4">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="Wear & Go"
              className="h-12 sm:h-14 w-auto object-contain filter drop-shadow-[0_2px_12px_rgba(197,160,89,0.35)] transition-transform duration-300 group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-2xl tracking-tight text-white font-serif leading-none">
                WEAR & GO
              </span>
              <span className="text-[10px] uppercase tracking-widest text-primary font-bold mt-1">
                Luxury Indian Fashion
              </span>
            </div>
          </Link>
          <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
            {STORE_CONFIG.tagline} Contemporary apparel crafted with unyielding attention to fabric weight, tailored comfort, and effortless metropolitan elegance.
          </p>

          <form onSubmit={handleSubscribe} className="pt-2 max-w-sm">
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2">
              Subscribe to the Newsletter
            </label>
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="flex-1 bg-slate-900 text-xs text-white px-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-400 placeholder:text-slate-500"
              />
              <button
                type="submit"
                disabled={subscribing}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5">
              Get ₹200 off your first purchase. No spam ever.
            </p>
          </form>

          {/* Social Links */}
          <div className="flex items-center gap-3 pt-2">
            <a
              href={STORE_CONFIG.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="p-2.5 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-slate-400 rounded-xl transition-all"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href={STORE_CONFIG.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="p-2.5 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-slate-400 rounded-xl transition-all"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href={STORE_CONFIG.social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="p-2.5 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-slate-400 rounded-xl transition-all"
            >
              <Youtube className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Column 2: SHOP */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">SHOP</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>
              <Link to="/shop?gender=men" className="hover:text-white transition-colors">
                Men's Collection
              </Link>
            </li>
            <li>
              <Link to="/shop?gender=women" className="hover:text-white transition-colors">
                Women's Collection
              </Link>
            </li>
            <li>
              <Link to="/shop?gender=kids" className="hover:text-white transition-colors">
                Kids Wear
              </Link>
            </li>
            <li>
              <Link to="/shop?newArrival=true" className="hover:text-white transition-colors">
                New Arrivals
              </Link>
            </li>
            <li>
              <Link to="/shop?bestseller=true" className="hover:text-white transition-colors">
                Best Sellers
              </Link>
            </li>
            <li>
              <Link to="/shop?discountOnly=true" className="text-amber-400 hover:text-amber-300 font-semibold transition-colors">
                Special Offers & Sale
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: HELP */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">HELP & SUPPORT</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>
              <Link to="/contact" className="hover:text-white transition-colors">
                Contact Customer Care
              </Link>
            </li>
            <li>
              <Link to="/orders" className="hover:text-white transition-colors">
                Track Your Order
              </Link>
            </li>
            <li>
              <Link to="/shipping-policy" className="hover:text-white transition-colors">
                Shipping Information
              </Link>
            </li>
            <li>
              <Link to="/return-policy" className="hover:text-white transition-colors">
                7-Day Returns & Exchanges
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-white transition-colors">
                Frequently Asked Questions
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: COMPANY & LEGAL */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">COMPANY</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>
              <Link to="/about" className="hover:text-white transition-colors">
                About Wear & Go
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
            </li>
            <li>
              <a href={`https://wa.me/${STORE_CONFIG.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                WhatsApp Support
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© 2026 WEAR & GO. All rights reserved. Registered Indian Fashion Enterprise.</p>
        <div className="flex items-center gap-4 text-[11px]">
          <span>Made with pride in India</span>
          <span>•</span>
          <span>100% Safe SSL Encryption</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
