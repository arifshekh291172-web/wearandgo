import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Grid, Search, Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export const MobileBottomNav = () => {
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Shop', path: '/shop', icon: Grid },
    { label: 'Search', path: '/search', icon: Search },
    { label: 'Wishlist', path: '/wishlist', icon: Heart, badge: wishlistCount },
    { label: 'Bag', path: '/cart', icon: ShoppingBag, badge: cartCount },
  ];

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                  isActive
                    ? 'text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-600 font-medium'
                }`
              }
            >
              <div className="relative">
                <Icon className="w-5 h-5 mb-0.5" />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-amber-500 text-slate-950 text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
