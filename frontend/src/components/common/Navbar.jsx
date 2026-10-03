import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Package,
  ShieldCheck,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { productService } from '../../services/productService';
import { useDebounce } from '../../hooks/useDebounce';
import { formatPrice } from '../../utils/formatters';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Search autocomplete state
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedQuery = useDebounce(searchQuery, 300);
  const searchRef = useRef(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.trim().length >= 2) {
        try {
          const res = await productService.getSuggestions(debouncedQuery);
          if (res.success) {
            setSuggestions(res.suggestions || []);
            setShowSuggestions(true);
          }
        } catch {
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };
    fetchSuggestions();
  }, [debouncedQuery]);

  // Click outside to close search suggestions & user dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setShowSuggestions(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
      setSearchOpen(false);
    }
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Men', path: '/shop?gender=men' },
    { label: 'Women', path: '/shop?gender=women' },
    { label: 'Kids', path: '/shop?gender=kids' },
    { label: 'New Arrivals', path: '/shop?newArrival=true' },
    { label: 'Best Sellers', path: '/shop?bestseller=true' },
    { label: 'Offers', path: '/shop?discountOnly=true', highlight: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 transition-all">
      {/* Top Announcement Bar */}
      <div className="bg-slate-900 text-slate-200 text-[11px] md:text-xs py-1.5 px-4 font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 mx-auto md:mx-0">
            <span className="flex items-center gap-1.5">
              <span>🚚</span>
              <strong>FREE EXPRESS SHIPPING</strong> on orders above ₹999
            </span>
            <span className="hidden md:inline text-slate-500">•</span>
            <span className="hidden md:inline">✨ 7-Day Hassle-Free Returns</span>
            <span className="hidden md:inline text-slate-500">•</span>
            <span className="hidden md:inline">💵 Cash on Delivery Available</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-slate-400">
            <Link to="/contact" className="hover:text-white transition-colors">
              Help & Support
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Mobile Hamburger & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open mobile menu"
            className="md:hidden p-1.5 text-slate-700 hover:text-slate-950 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group py-1">
            <img
              src="/logo.png"
              alt="Wear & Go"
              className="h-11 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105 filter drop-shadow-[0_2px_8px_rgba(197,160,89,0.3)]"
            />
            <div className="flex flex-col">
              <span className="font-black text-xl sm:text-2xl tracking-tight text-neutral-950 font-serif leading-none group-hover:text-primary transition-colors">
                WEAR & GO
              </span>
              <span className="text-[9px] uppercase tracking-widest text-primary font-extrabold mt-0.5">
                Style That Moves With You
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Search Bar with Autocomplete */}
        <div ref={searchRef} className="hidden md:block flex-1 max-w-lg mx-6 relative">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              placeholder="Search for hoodies, linen shirts, oversized tees, sneakers..."
              className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs md:text-sm pl-10 pr-4 py-2.5 rounded-full border border-slate-200 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800 transition-all placeholder:text-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in duration-150">
              <div className="p-2 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3">
                <span>Matching Products</span>
                <span>Press Enter to View All</span>
              </div>
              <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                {suggestions.map((item) => (
                  <Link
                    key={item._id}
                    to={`/product/${item.slug || item._id}`}
                    onClick={() => setShowSuggestions(false)}
                    className="flex items-center gap-3 p-2.5 hover:bg-slate-50 transition-colors"
                  >
                    <img
                      src={item.images?.[0]}
                      alt={item.name}
                      className="w-10 h-10 object-cover rounded-lg shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-slate-400 capitalize">
                        {item.category?.name || 'Fashion'}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-slate-900 shrink-0">
                      {formatPrice(item.discountPrice || item.price)}
                    </span>
                  </Link>
                ))}
              </div>
              <Link
                to={`/search?q=${encodeURIComponent(searchQuery)}`}
                onClick={() => setShowSuggestions(false)}
                className="block text-center py-2.5 text-xs font-bold text-slate-900 hover:bg-slate-100 transition-colors border-t border-slate-100"
              >
                View all results for "{searchQuery}" →
              </Link>
            </div>
          )}
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Search"
            className="md:hidden p-2 text-slate-700 hover:text-slate-950 rounded-full hover:bg-slate-100"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Wishlist Link */}
          <Link
            to="/wishlist"
            aria-label="View wishlist"
            className="relative p-2 text-slate-700 hover:text-rose-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                {wishlistCount > 9 ? '9+' : wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Link */}
          <Link
            to="/cart"
            aria-label="View shopping bag"
            className="relative p-2 text-slate-700 hover:text-slate-950 rounded-full hover:bg-slate-100 transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-amber-500 text-slate-950 text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>

          {/* User Account Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-2 text-slate-700 hover:text-slate-950 rounded-full sm:rounded-xl hover:bg-slate-100 transition-colors"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-6 h-6 rounded-full object-cover border border-slate-300"
                />
              ) : (
                <UserIcon className="w-5 h-5" />
              )}
              <span className="hidden sm:inline text-xs font-semibold max-w-[90px] truncate">
                {isAuthenticated ? user.name.split(' ')[0] : 'Sign In'}
              </span>
              <ChevronDown className="hidden sm:inline w-3 h-3 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {userDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in duration-150"
                onClick={() => setUserDropdownOpen(false)}
              >
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-amber-700 hover:bg-amber-50"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>My Profile & Addresses</span>
                    </Link>

                    <Link
                      to="/orders"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Package className="w-4 h-4 text-slate-400" />
                      <span>My Orders & Tracking</span>
                    </Link>

                    <Link
                      to="/wishlist"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Heart className="w-4 h-4 text-slate-400" />
                      <span>My Wishlist ({wishlistCount})</span>
                    </Link>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="px-4 py-3">
                      <p className="text-xs text-slate-500 mb-2">Welcome to Wear & Go</p>
                      <Link
                        to="/login"
                        className="block w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-center text-xs font-bold rounded-xl shadow-sm transition-all"
                      >
                        LOG IN
                      </Link>
                    </div>
                    <div className="border-t border-slate-100 pt-1">
                      <Link
                        to="/register"
                        className="block px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        New customer? <strong className="text-slate-900 underline">Register</strong>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar Dropdown */}
      {searchOpen && (
        <div className="md:hidden px-4 pb-3 border-t border-slate-100 bg-white">
          <form onSubmit={handleSearchSubmit} className="relative mt-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clothes, accessories..."
              autoFocus
              className="w-full bg-slate-100 text-xs pl-9 pr-4 py-2.5 rounded-full border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>
        </div>
      )}

      {/* Desktop Navigation Links */}
      <nav className="hidden md:block border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center space-x-8 py-2.5">
          {navLinks.map((link) => {
            const isActive = location.pathname + location.search === link.path;
            return (
              <Link
                key={link.label}
                to={link.path}
                className={`text-xs font-bold tracking-wider uppercase transition-colors relative py-1 ${
                  link.highlight
                    ? 'text-amber-800 hover:text-amber-900 flex items-center gap-1'
                    : isActive
                    ? 'text-slate-950 font-extrabold'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {link.highlight && <Tag className="w-3 h-3 text-amber-700" />}
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 inset-x-0 h-0.5 bg-slate-900 rounded-full"></span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src="/logo.png"
                  alt="Wear & Go"
                  className="h-9 w-auto object-contain filter drop-shadow-sm"
                />
                <span className="font-extrabold text-base text-slate-950 font-serif">
                  WEAR & GO
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Links */}
            <div className="p-4 space-y-1 overflow-y-auto flex-grow">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-3 rounded-xl text-sm font-bold text-slate-800 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                >
                  <span className={link.highlight ? 'text-amber-800 flex items-center gap-1.5' : ''}>
                    {link.highlight && <Tag className="w-3.5 h-3.5 text-amber-600" />}
                    {link.label}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-300" />
                </Link>
              ))}

              <div className="pt-4 mt-4 border-t border-slate-100 space-y-1">
                <Link
                  to="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Shop All Categories
                </Link>
                <Link
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  About Wear & Go
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Customer Support & FAQ
                </Link>
                <Link
                  to="/shipping-policy"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Shipping & Return Policy
                </Link>
              </div>
            </div>

            {/* Footer Profile Shortcut */}
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              {isAuthenticated ? (
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                    title="Log Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-center text-xs font-bold bg-slate-900 text-white rounded-xl"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-center text-xs font-bold bg-white border border-slate-200 text-slate-800 rounded-xl"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
