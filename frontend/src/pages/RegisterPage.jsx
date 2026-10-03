import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { User, Mail, Lock, Phone, ArrowRight, ShieldCheck, RefreshCw, Edit3, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Breadcrumb } from '../components/common/Breadcrumb';

export const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const navigate = useNavigate();
  const { requestRegisterOtp, verifyRegisterOtp, resendRegisterOtp, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirect, { replace: true });
    }
  }, [isAuthenticated, navigate, redirect]);

  // Step 1: form details, Step 2: OTP verification
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const verifyParam = searchParams.get('verify');
    const emailParam = searchParams.get('email');
    if (verifyParam && emailParam) {
      setFormData((prev) => ({ ...prev, email: emailParam }));
      setStep(2);
    }
  }, [searchParams]);

  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [noticeMsg, setNoticeMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Timer countdown for resend OTP
  useEffect(() => {
    let timer;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }

    try {
      setSubmitting(true);
      const res = await requestRegisterOtp({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      if (res.success) {
        setStep(2);
        setCountdown(60);
        setCanResend(false);
        if (res.devOtp) setDevOtp(res.devOtp);
        if (res.message) setNoticeMsg(res.message);
      } else {
        setErrorMsg(res.message || 'Failed to send verification code');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to send verification OTP');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!otp.trim() || otp.trim().length !== 6) {
      setErrorMsg('Please enter the complete 6-digit verification code');
      return;
    }

    try {
      setSubmitting(true);
      const res = await verifyRegisterOtp(formData.email.trim(), otp.trim());

      if (res.success) {
        navigate(redirect, { replace: true });
      } else {
        setErrorMsg(res.message || 'Invalid verification code');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Verification failed. Please check the code.');
    } finally {
      setSubmitting(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend || resending) return;
    setErrorMsg('');

    try {
      setResending(true);
      const res = await resendRegisterOtp(formData.email.trim());
      if (res.success) {
        setCountdown(60);
        setCanResend(false);
        if (res.devOtp) setDevOtp(res.devOtp);
        if (res.message) setNoticeMsg(res.message);
      } else {
        setErrorMsg(res.message || 'Failed to resend code');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <Breadcrumb items={[{ label: step === 1 ? 'Register' : 'Verify Email' }]} />

      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-xl shadow-slate-100 space-y-6 relative overflow-hidden">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />

        {/* Brand Header */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-block group">
            <img
              src="/logo.png"
              alt="Wear & Go"
              className="h-16 sm:h-20 w-auto mx-auto object-contain transition-transform duration-300 group-hover:scale-105 filter drop-shadow-[0_4px_12px_rgba(197,160,89,0.35)]"
            />
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl font-black font-serif text-slate-950">
              {step === 1 ? 'Create Account' : 'Verify Your Email'}
            </h1>
            <p className="text-xs text-slate-500">
              {step === 1
                ? 'Join Wear & Go to experience style that moves with you.'
                : `We've sent a 6-digit code to ${formData.email}`}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMsg}</div>
          </div>
        )}

        {/* STEP 1: Registration Form */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all placeholder:text-slate-400"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all placeholder:text-slate-400"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                Mobile Number (Optional)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all placeholder:text-slate-400"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="At least 6 characters"
                  className="w-full text-xs pl-10 pr-11 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all placeholder:text-slate-400"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Re-enter password"
                  className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all placeholder:text-slate-400"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl flex items-center gap-2.5 text-[11px] text-amber-900 font-medium">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>We'll send a 6-digit OTP to your email to verify your identity.</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{submitting ? 'SENDING OTP...' : 'CONTINUE WITH EMAIL OTP'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: OTP Verification Screen */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Sending OTP To</span>
                <span className="font-bold text-slate-900">{formData.email}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtp('');
                  setErrorMsg('');
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>

            {noticeMsg && (
              <div className="p-3.5 bg-amber-50/90 border border-amber-300 rounded-2xl text-xs text-amber-950 space-y-2">
                <p className="font-medium leading-relaxed">{noticeMsg}</p>
                {devOtp && (
                  <div className="pt-1 flex items-center justify-between bg-white/90 p-2.5 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-600 uppercase">Verification Code:</span>
                      <span className="font-mono text-base font-black tracking-widest text-amber-700">
                        {devOtp}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtp(devOtp)}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-sm cursor-pointer"
                    >
                      Auto-fill OTP
                    </button>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 text-center">
                Enter 6-Digit Verification Code
              </label>
              <div className="relative max-w-xs mx-auto">
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="------"
                  className="w-full text-center text-2xl tracking-[12px] font-mono font-bold py-3.5 rounded-xl border-2 border-amber-500/40 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 bg-amber-50/20 text-slate-950 transition-all placeholder:text-slate-300"
                />
              </div>
              <p className="text-[11px] text-slate-500 text-center mt-2">
                Check your inbox (and spam/promotions folder) for your code.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500">
                {canResend ? "Didn't receive code?" : `Resend in ${countdown}s`}
              </span>
              <button
                type="button"
                disabled={!canResend || resending}
                onClick={handleResendOtp}
                className="inline-flex items-center gap-1.5 font-bold text-slate-900 hover:text-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                <span>{resending ? 'Sending...' : 'Resend Code'}</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting || otp.length !== 6}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-extrabold uppercase tracking-widest transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{submitting ? 'VERIFYING CODE...' : 'VERIFY & COMPLETE REGISTRATION'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already have an account?{' '}
          <Link to={`/login?redirect=${redirect}`} className="font-bold text-slate-900 hover:text-amber-600 underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
