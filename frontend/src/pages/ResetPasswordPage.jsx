import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Breadcrumb } from '../components/common/Breadcrumb';

export const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { refreshUser } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    try {
      setSubmitting(true);
      const res = await authService.resetPassword(token, password);
      if (res.success) {
        localStorage.setItem('wear_and_go_token', res.token);
        localStorage.setItem('wear_and_go_user', JSON.stringify(res.user));
        await refreshUser();
        toast.success('Password reset successfully! You are now logged in.');
        navigate('/');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Invalid or expired password reset link');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <Breadcrumb items={[{ label: 'Reset Password' }]} />

      <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-xl shadow-slate-100 space-y-6">
        <div className="text-center space-y-2">
          <img
            src="/logo.png"
            alt="Wear & Go"
            className="h-16 w-auto mx-auto object-contain filter drop-shadow-[0_4px_12px_rgba(197,160,89,0.35)]"
          />
          <div className="space-y-1">
            <h1 className="text-2xl font-black font-serif text-slate-950">Set New Password</h1>
            <p className="text-xs text-slate-500">
              Please enter a strong new password for your account.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
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

          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{submitting ? 'RESETTING...' : 'UPDATE PASSWORD'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
