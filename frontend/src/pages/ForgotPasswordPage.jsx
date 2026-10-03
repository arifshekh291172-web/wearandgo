import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/authService';
import { Breadcrumb } from '../components/common/Breadcrumb';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [devResetToken, setDevResetToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setDevResetToken('');

    try {
      setSubmitting(true);
      const res = await authService.forgotPassword(email);
      if (res.success) {
        setSuccessMsg(res.message);
        if (res.resetToken) setDevResetToken(res.resetToken);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <Breadcrumb items={[{ label: 'Forgot Password' }]} />

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
            <h1 className="text-2xl font-black font-serif text-slate-950">Reset Password</h1>
            <p className="text-xs text-slate-500">
              Enter the email associated with your account and we'll send you recovery instructions.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
            {errorMsg}
          </div>
        )}

        {successMsg ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-xs text-emerald-900">Check Your Inbox</h3>
              <p className="text-xs text-emerald-700">{successMsg}</p>
            </div>

            {devResetToken && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2">
                <p className="font-bold">Development Quick Reset Link:</p>
                <Link
                  to={`/reset-password/${devResetToken}`}
                  className="block text-center py-2 bg-amber-500 text-slate-950 rounded-lg font-bold"
                >
                  Click Here to Set New Password →
                </Link>
              </div>
            )}

            <Link
              to="/login"
              className="block text-center text-xs font-bold text-slate-700 hover:text-slate-950"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                Registered Email
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

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{submitting ? 'SENDING...' : 'SEND RESET LINK'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Login</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
