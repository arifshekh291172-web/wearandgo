import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';
import { Sparkles } from 'lucide-react';

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 selection:bg-neutral-900 selection:text-white">
      {/* Top Announcement Bar */}
      <div className="bg-neutral-900 text-white text-[11px] sm:text-xs py-2 px-4 text-center font-medium tracking-wide flex items-center justify-center space-x-2">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        <span>Free shipping on all orders above ₹999 &bull; Easy 7-day hassle-free returns</span>
      </div>

      {/* Main Header & Navigation */}
      <Navbar />

      {/* Main Page Content */}
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Main Footer */}
      <Footer />

      {/* Mobile Bottom Navigation (Visible on mobile screens) */}
      <MobileBottomNav />
    </div>
  );
};

export default PublicLayout;
