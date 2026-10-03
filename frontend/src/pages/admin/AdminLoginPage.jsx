import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Shield, Lock, Mail, Eye, EyeOff, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, isAuthenticated, isAdmin } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // If already authenticated as admin, redirect directly to admin dashboard
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both administrative email and password');
      return;
    }

    try {
      setSubmitting(true);
      const res = await login(email.trim(), password);

      if (res.success) {
        if (res.user?.role !== 'admin') {
          setErrorMsg('Access Denied: This account does not possess store administrator privileges.');
          toast.error('Unauthorized access. Admin role required.');
          return;
        }

        toast.success(`Welcome back, ${res.user?.name || 'Administrator'}!`);
        navigate('/admin/dashboard', { replace: true });
      } else {
        setErrorMsg(res.message || 'Invalid administrator email or password');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Back Link */}
      <div className="max-w-md w-full mx-auto px-4 mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Storefront</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Brand Card Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/10 border border-amber-500/30 text-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.2)] mx-auto">
            <Shield className="w-7 h-7" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-serif">
              WEAR & GO
            </h1>
            <div className="inline-block mt-1 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] uppercase tracking-widest font-bold text-amber-400">
              Admin Portal
            </div>
          </div>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Secure administrative control console. Authorized personnel only.
          </p>
        </div>

        {/* Main Login Box */}
        <div className="bg-[#0E1118] py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-800/80 backdrop-blur-xl relative">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Administrator Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="wear.and.go.official@gmail.com"
                  autoComplete="username"
                  className="w-full bg-[#151922] text-white text-xs pl-10 pr-4 py-3.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-slate-600"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full bg-[#151922] text-white text-xs pl-10 pr-11 py-3.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-slate-600"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-extrabold uppercase tracking-widest transition-all shadow-[0_4px_20px_rgba(245,158,11,0.25)] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <span>{submitting ? 'AUTHENTICATING...' : 'ACCESS CONTROL CONSOLE'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Security Notice Footer */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>256-bit TLS Encrypted Administrator Session</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
