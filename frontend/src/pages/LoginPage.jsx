import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Breadcrumb } from '../components/common/Breadcrumb';

export const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);

    if (res.success) {
      if (res.user?.role === 'admin' && redirect.includes('/admin')) {
        navigate('/admin/dashboard');
      } else {
        navigate(redirect);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <Breadcrumb items={[{ label: 'Login' }]} />

      <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-xl shadow-slate-100 space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block group">
            <img
              src="/logo.png"
              alt="Wear & Go"
              className="h-16 w-auto mx-auto object-contain transition-transform duration-300 group-hover:scale-105 filter drop-shadow-[0_4px_12px_rgba(197,160,89,0.35)]"
            />
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl font-black font-serif text-slate-950">Welcome Back</h1>
            <p className="text-xs text-slate-500">
              Sign in to access your orders, wishlist, and recommendations.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-slate-500 hover:text-slate-900"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-10 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-slate-400 hover:text-slate-700 absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{submitting ? 'SIGNING IN...' : 'SIGN IN'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Credentials Helper Pill */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 space-y-1">
          <p className="font-bold text-slate-900">Demo Accounts Available:</p>
          <div className="flex justify-between">
            <span>Admin: admin@wearandgo.com</span>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@wearandgo.com');
                setPassword('Admin@123456');
              }}
              className="text-amber-700 font-bold hover:underline"
            >
              Fill Admin
            </button>
          </div>
          <div className="flex justify-between">
            <span>Customer: rahul@example.com</span>
            <button
              type="button"
              onClick={() => {
                setEmail('rahul@example.com');
                setPassword('User@123456');
              }}
              className="text-amber-700 font-bold hover:underline"
            >
              Fill User
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Don't have an account?{' '}
          <Link to={`/register?redirect=${redirect}`} className="font-bold text-slate-900 underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
