import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  FolderTree,
  ShoppingBag,
  Users,
  Ticket,
  Star,
  Image,
  Store,
  LogOut,
  X,
  Settings,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminSidebar = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();

  const links = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Add Product', path: '/admin/products/add', icon: PlusCircle },
    { label: 'Categories', path: '/admin/categories', icon: FolderTree },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Customers', path: '/admin/users', icon: Users },
    { label: 'Coupons', path: '/admin/coupons', icon: Ticket },
    { label: 'Reviews', path: '/admin/reviews', icon: Star },
    { label: 'Banners', path: '/admin/banners', icon: Image },
    { label: 'Store Settings', path: '/admin/settings', icon: Settings },
  ];

  const content = (
    <div className="flex flex-col h-full bg-slate-950 text-slate-300 w-64 border-r border-slate-900">
      {/* Brand */}
      <div className="p-5 border-b border-slate-900 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/logo.png"
            alt="Wear & Go"
            className="h-10 w-auto object-contain filter drop-shadow-[0_2px_8px_rgba(197,160,89,0.4)] transition-transform group-hover:scale-105"
          />
          <div className="flex flex-col">
            <span className="font-extrabold text-sm text-white font-serif tracking-tight leading-none group-hover:text-primary transition-colors">
              WEAR & GO
            </span>
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 uppercase tracking-widest mt-1 inline-block w-fit">
              ADMIN
            </span>
          </div>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
          Store Management
        </p>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/admin/dashboard'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* User profile & actions */}
      <div className="p-4 border-t border-slate-900 bg-slate-950/50 space-y-2">
        <Link
          to="/"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
        >
          <Store className="w-4 h-4" />
          <span>Back to Storefront</span>
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/40 transition-colors text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop static sidebar */}
      <aside className="hidden md:block shrink-0">{content}</aside>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="relative z-10">{content}</div>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;
