import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Menu, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AdminSidebar } from './AdminSidebar';
import { Loader } from '../common/Loader';

export const AdminLayout = () => {
  const { user, loading, isAdmin, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return <Loader fullScreen text="Checking admin credentials..." />;
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Admin Access Required</h2>
          <p className="text-xs text-slate-500">
            This management console requires verified administrator privileges. Please sign in with an authorized account.
          </p>
          <div className="pt-2">
            <a
              href="/login?redirect=/admin/dashboard"
              className="inline-block w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              Sign In as Admin
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 flex">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-100 px-4 md:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm md:text-base font-bold text-slate-900 tracking-tight">
              Wear & Go Store Administration
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
              Logged in as <strong className="text-slate-900">{user.name}</strong>
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Online" />
          </div>
        </header>

        {/* Dynamic Route Pages */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
