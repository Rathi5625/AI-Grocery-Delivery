import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiArrowLeft, FiCheckCircle, FiShield, FiLoader } from 'react-icons/fi';
import { RiLeafLine } from 'react-icons/ri';
import toast from 'react-hot-toast';
import {
  forgotPasswordRequest,
  forgotPasswordVerify,
  forgotPasswordReset,
} from '../api/authApi';

// Email format validation
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep]               = useState('request'); // request | verify | reset | done
  const [email, setEmail]             = useState('');
  const [otp, setOtp]                 = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm]         = useState('');
  const [loading, setLoading]         = useState(false);
  const [emailError, setEmailError]   = useState('');

  const emailRef = useRef(null);

  // Auto-focus email on mount
  useEffect(() => {
    if (step === 'request') emailRef.current?.focus();
  }, [step]);

  // ── Step 1: Send OTP ────────────────────────────────────────
  const handleRequest = async (e) => {
    e.preventDefault();
    setEmailError('');

    if (!email.trim()) {
      setEmailError('Email address is required');
      return;
    }
    if (!isValidEmail(email.trim())) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await forgotPasswordRequest(email.trim().toLowerCase());
      // Persist email so ResetLinkSentPage can show it and resend
      localStorage.setItem('resetEmail', email.trim().toLowerCase());
      toast.success('Reset link sent to your email!');
      navigate('/reset-link-sent');
    } catch (err) {
      if (err?.response?.status === 429) {
        toast.error('Too many requests. Please wait a few minutes.');
      } else if (err?.response?.status >= 500) {
        toast.error('Something went wrong. Try again.');
      } else {
        // Enumeration-safe: always treat as success
        localStorage.setItem('resetEmail', email.trim().toLowerCase());
        toast.success('If this email is registered, a reset code has been sent.');
        navigate('/reset-link-sent');
      }
    } finally {
      setLoading(false);
    }
  };



  // ── Step 2: Verify OTP ──────────────────────────────────────
  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Enter the 6-digit code from your email');
      return;
    }
    setLoading(true);
    try {
      await forgotPasswordVerify(email.trim().toLowerCase(), otp);
      toast.success('Code verified!');
      setStep('reset');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.userMessage;
      toast.error(msg || 'Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Set New Password ────────────────────────────────
  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await forgotPasswordReset(email.trim().toLowerCase(), otp, newPassword);
      toast.success('Password reset successfully!');
      setStep('done');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.userMessage;
      toast.error(msg || 'Reset failed. Your code may have expired.');
    } finally {
      setLoading(false);
    }
  };

  // ── Spinner component ───────────────────────────────────────
  const Spinner = () => (
    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );

  return (
    <div className="min-h-screen flex font-sans">

      {/* ── Left Panel ──────────────────────────────────────── */}
      <div
        className="hidden lg:flex w-[48%] flex-col items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #2d2416 0%, #3d2e18 50%, #2a1e0f 100%)' }}
      >
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, #D6B588 0%, transparent 50%), radial-gradient(circle at 70% 70%, #705E46 0%, transparent 40%)' }}
        />

        {/* Brand */}
        <div className="relative z-10 text-center px-12">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-[#D6B588]/20 flex items-center justify-center">
              <RiLeafLine size={22} className="text-[#D6B588]" />
            </div>
            <span className="text-white text-[1.8rem] font-bold tracking-tight">FreshAI</span>
          </div>
          <p className="text-[#C6C0B9] text-[1.1rem] leading-relaxed max-w-[280px] mx-auto">
            Smart grocery shopping powered by AI.
          </p>

          {/* Decorative grocery image */}
          <div className="mt-10 rounded-2xl overflow-hidden shadow-2xl max-w-[340px] mx-auto border border-white/10">
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop"
              alt="Fresh groceries"
              className="w-full h-[220px] object-cover"
            />
          </div>
        </div>
      </div>

      {/* ── Right Panel ─────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-[#FAF7F2] p-6 lg:p-12">
        <AnimatePresence mode="wait">

          {/* ── STEP 1: Send Reset Link ── */}
          {step === 'request' && (
            <motion.div
              key="request"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="w-full max-w-[420px]"
            >
              <div className="bg-white rounded-2xl shadow-[0_4px_40px_rgba(66,39,1,0.08)] border border-[#C6C0B9]/30 p-10">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-14 h-14 rounded-full bg-[#F2ECE4] flex items-center justify-center">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#705E46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                      <path d="M12 8v4l3 3"/>
                    </svg>
                  </div>
                </div>

                <h1 className="text-[1.75rem] font-semibold text-[#422701] text-center mb-2 tracking-tight">
                  Reset Password
                </h1>
                <p className="text-[#705E46] text-[0.9rem] text-center leading-relaxed mb-8">
                  Enter the email associated with your account and we'll send you a link to reset your password.
                </p>

                <form onSubmit={handleRequest} noValidate>
                  <label className="block mb-5">
                    <span className="block text-[0.8rem] font-semibold text-[#422701] mb-2 tracking-wide">
                      Email Address
                    </span>
                    <div className="relative">
                      <FiMail
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A89F91]"
                        size={16}
                      />
                      <input
                        ref={emailRef}
                        id="fp-email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                        onKeyDown={(e) => e.key === 'Enter' && handleRequest(e)}
                        required
                        className={`w-full bg-[#F2ECE4]/70 border rounded-xl pl-11 pr-4 py-3 text-[#422701] text-[0.95rem] placeholder:text-[#C6C0B9] outline-none transition-all focus:ring-2 focus:ring-[#D6B588]/50 focus:bg-white ${
                          emailError ? 'border-red-300 bg-red-50/30' : 'border-transparent focus:border-[#D6B588]'
                        }`}
                      />
                    </div>
                    {emailError && (
                      <p className="text-red-500 text-[0.78rem] mt-1.5 font-medium">{emailError}</p>
                    )}
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2.5 bg-[#2d2416] hover:bg-[#3d2e18] text-white font-semibold py-3.5 rounded-xl transition-all duration-200 text-[0.95rem] tracking-wide disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                  >
                    {loading ? (
                      <>
                        <Spinner />
                        <span>Sending…</span>
                      </>
                    ) : (
                      <>
                        <span>Send Reset Link</span>
                        <span className="text-[#D6B588]">→</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Back to Login */}
                <div className="text-center mt-6">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-[#8A6843] hover:text-[#422701] text-[0.88rem] font-medium transition-colors"
                  >
                    <FiArrowLeft size={14} />
                    Back to Login
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Verify OTP ── */}
          {step === 'verify' && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="w-full max-w-[420px]"
            >
              <div className="bg-white rounded-2xl shadow-[0_4px_40px_rgba(66,39,1,0.08)] border border-[#C6C0B9]/30 p-10">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-14 h-14 rounded-full bg-[#F2ECE4] flex items-center justify-center">
                    <FiShield size={26} className="text-[#705E46]" />
                  </div>
                </div>

                <h1 className="text-[1.75rem] font-semibold text-[#422701] text-center mb-2 tracking-tight">
                  Check Your Email
                </h1>
                <p className="text-[#705E46] text-[0.9rem] text-center leading-relaxed mb-8">
                  We sent a 6-digit code to <span className="font-semibold text-[#422701]">{email}</span>.
                  It expires in 5 minutes.
                </p>

                <form onSubmit={handleVerify} noValidate>
                  <label className="block mb-5">
                    <span className="block text-[0.8rem] font-semibold text-[#422701] mb-2 tracking-wide">
                      Verification Code
                    </span>
                    <input
                      id="fp-otp"
                      type="text"
                      inputMode="numeric"
                      placeholder="_ _ _ _ _ _"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      autoFocus
                      className="w-full bg-[#F2ECE4]/70 border border-transparent focus:border-[#D6B588] rounded-xl px-4 py-3 text-[#422701] text-[1.4rem] font-bold tracking-[0.5em] text-center placeholder:text-[#C6C0B9] outline-none transition-all focus:ring-2 focus:ring-[#D6B588]/50 focus:bg-white"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full flex items-center justify-center gap-2.5 bg-[#2d2416] hover:bg-[#3d2e18] text-white font-semibold py-3.5 rounded-xl transition-all duration-200 text-[0.95rem] tracking-wide disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                  >
                    {loading ? <><Spinner /><span>Verifying…</span></> : 'Verify Code'}
                  </button>
                </form>

                <div className="flex items-center justify-between mt-5">
                  <button
                    type="button"
                    onClick={() => { setStep('request'); setOtp(''); }}
                    className="text-[#8A6843] hover:text-[#422701] text-[0.85rem] font-medium transition-colors inline-flex items-center gap-1"
                  >
                    <FiArrowLeft size={13} /> Change email
                  </button>
                  <button
                    type="button"
                    onClick={handleRequest}
                    disabled={loading}
                    className="text-[#8A6843] hover:text-[#422701] text-[0.85rem] font-medium transition-colors disabled:opacity-50"
                  >
                    Resend code
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Set New Password ── */}
          {step === 'reset' && (
            <motion.div
              key="reset"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="w-full max-w-[420px]"
            >
              <div className="bg-white rounded-2xl shadow-[0_4px_40px_rgba(66,39,1,0.08)] border border-[#C6C0B9]/30 p-10">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-14 h-14 rounded-full bg-[#F2ECE4] flex items-center justify-center">
                    <FiLock size={24} className="text-[#705E46]" />
                  </div>
                </div>

                <h1 className="text-[1.75rem] font-semibold text-[#422701] text-center mb-2 tracking-tight">
                  Set New Password
                </h1>
                <p className="text-[#705E46] text-[0.9rem] text-center leading-relaxed mb-8">
                  Choose a strong password with at least 8 characters.
                </p>

                <form onSubmit={handleReset} noValidate>
                  <label className="block mb-4">
                    <span className="block text-[0.8rem] font-semibold text-[#422701] mb-2 tracking-wide">
                      New Password
                    </span>
                    <div className="relative">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A89F91]" size={15} />
                      <input
                        id="fp-new-pw"
                        type="password"
                        placeholder="Min. 8 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        autoFocus
                        className="w-full bg-[#F2ECE4]/70 border border-transparent focus:border-[#D6B588] rounded-xl pl-11 pr-4 py-3 text-[#422701] placeholder:text-[#C6C0B9] outline-none transition-all focus:ring-2 focus:ring-[#D6B588]/50 focus:bg-white"
                      />
                    </div>
                  </label>

                  <label className="block mb-5">
                    <span className="block text-[0.8rem] font-semibold text-[#422701] mb-2 tracking-wide">
                      Confirm Password
                    </span>
                    <div className="relative">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A89F91]" size={15} />
                      <input
                        id="fp-confirm-pw"
                        type="password"
                        placeholder="Repeat password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        className={`w-full bg-[#F2ECE4]/70 border rounded-xl pl-11 pr-4 py-3 text-[#422701] placeholder:text-[#C6C0B9] outline-none transition-all focus:ring-2 focus:ring-[#D6B588]/50 focus:bg-white ${
                          confirm && newPassword !== confirm
                            ? 'border-red-300'
                            : 'border-transparent focus:border-[#D6B588]'
                        }`}
                      />
                    </div>
                    {confirm && newPassword !== confirm && (
                      <p className="text-red-500 text-[0.78rem] mt-1.5 font-medium">Passwords don't match</p>
                    )}
                  </label>

                  <button
                    type="submit"
                    disabled={loading || newPassword.length < 8 || newPassword !== confirm}
                    className="w-full flex items-center justify-center gap-2.5 bg-[#2d2416] hover:bg-[#3d2e18] text-white font-semibold py-3.5 rounded-xl transition-all duration-200 text-[0.95rem] tracking-wide disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                  >
                    {loading ? <><Spinner /><span>Resetting…</span></> : 'Reset Password'}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* ── STEP 4: Done ── */}
          {step === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              className="w-full max-w-[420px]"
            >
              <div className="bg-white rounded-2xl shadow-[0_4px_40px_rgba(66,39,1,0.08)] border border-[#C6C0B9]/30 p-10 text-center">
                {/* Animated check */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 20, delay: 0.15 }}
                  className="flex justify-center mb-6"
                >
                  <div className="w-16 h-16 rounded-full bg-[#F0F7EE] flex items-center justify-center">
                    <FiCheckCircle size={34} className="text-[#4CAF50]" />
                  </div>
                </motion.div>

                <h2 className="text-[1.75rem] font-semibold text-[#422701] mb-2 tracking-tight">
                  Password Reset!
                </h2>
                <p className="text-[#705E46] text-[0.9rem] leading-relaxed mb-8">
                  Your password has been updated successfully. You can now log in with your new password.
                </p>

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center w-full gap-2 bg-[#2d2416] hover:bg-[#3d2e18] text-white font-semibold py-3.5 rounded-xl transition-all duration-200 text-[0.95rem] tracking-wide shadow-sm hover:shadow-md"
                >
                  Go to Login
                </Link>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
