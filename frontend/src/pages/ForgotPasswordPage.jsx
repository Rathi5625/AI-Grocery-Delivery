import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiArrowLeft, FiCheckCircle, FiShield } from 'react-icons/fi';
import { RiLeafLine } from 'react-icons/ri';
import toast from 'react-hot-toast';
import {
  forgotPasswordRequest,
  forgotPasswordVerify,
  forgotPasswordReset,
} from '../api/authApi';

const STEPS = ['request', 'verify', 'reset', 'done'];

export default function ForgotPasswordPage() {
  const [step, setStep]               = useState('request'); // request | verify | reset | done
  const [email, setEmail]             = useState('');
  const [otp, setOtp]                 = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm]         = useState('');
  const [loading, setLoading]         = useState(false);

  const stepIndex = STEPS.indexOf(step);

  // ── Step 1: Send OTP ──────────────────────────────────────
  const handleRequest = async (e) => {
    e.preventDefault();
    if (!email.trim()) { toast.error('Please enter your email address'); return; }
    setLoading(true);
    try {
      await forgotPasswordRequest(email.trim().toLowerCase());
      toast.success('Check your inbox! OTP sent.');
      setStep('verify');
    } catch (err) {
      toast.error(err.userMessage || 'Request failed. Please try again.');
    } finally { setLoading(false); }
  };

  // ── Step 2: Verify OTP ────────────────────────────────────
  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) { toast.error('Enter the 6-digit OTP from your email'); return; }
    setLoading(true);
    try {
      await forgotPasswordVerify(email, otp);
      toast.success('OTP verified!');
      setStep('reset');
    } catch (err) {
      toast.error(err.userMessage || 'Invalid or expired OTP');
    } finally { setLoading(false); }
  };

  // ── Step 3: Set New Password ──────────────────────────────
  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (newPassword !== confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await forgotPasswordReset(email, otp, newPassword);
      toast.success('Password reset successfully!');
      setStep('done');
    } catch (err) {
      toast.error(err.userMessage || 'Reset failed. Your OTP may have expired.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>

      {/* Background blobs */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,183,127,0.12) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          position: 'relative', zIndex: 1,
          width: '100%', maxWidth: 440,
          background: 'var(--surface)',
          borderRadius: 'var(--radius-2xl)',
          border: '1px solid var(--border-subtle)',
          padding: '2.5rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem', color: 'var(--primary)', fontWeight: 800, fontSize: '1.2rem' }}>
          <RiLeafLine size={22} /> FreshAI
        </div>

        {/* Progress bar */}
        {step !== 'done' && (
          <div style={{ display: 'flex', gap: 6, marginBottom: '2rem' }}>
            {['Request OTP', 'Verify', 'New Password'].map((label, i) => (
              <div key={i} style={{ flex: 1 }}>
                <div style={{
                  height: 3, borderRadius: 99,
                  background: i < stepIndex
                    ? 'var(--primary)'
                    : i === stepIndex - 1 || (step === 'verify' && i === 1) || (step === 'reset' && i === 2)
                    ? 'var(--primary)'
                    : 'var(--border-subtle)',
                  transition: 'background 0.3s',
                }} />
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 4, textAlign: 'center' }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">

          {/* ── STEP 1: Request ── */}
          {step === 'request' && (
            <motion.div key="request" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>Forgot Password?</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Enter your registered email address and we'll send you a one-time password.
              </p>
              <form onSubmit={handleRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label className="form__group">
                  <span className="form__label">Email address</span>
                  <div className="input-icon-wrap">
                    <FiMail className="input-icon" size={16} />
                    <input
                      id="fp-email"
                      type="email"
                      className="form__input"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                </label>
                <button className="btn btn--primary" type="submit" disabled={loading} style={{ marginTop: 8 }}>
                  {loading ? 'Sending OTP…' : 'Send OTP'}
                </button>
              </form>
            </motion.div>
          )}

          {/* ── STEP 2: Verify OTP ── */}
          {step === 'verify' && (
            <motion.div key="verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>Check Your Email</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                We sent a 6-digit code to <strong>{email}</strong>. It expires in 10 minutes.
              </p>
              <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label className="form__group">
                  <span className="form__label">6-digit OTP</span>
                  <div className="input-icon-wrap">
                    <FiShield className="input-icon" size={16} />
                    <input
                      id="fp-otp"
                      type="text"
                      className="form__input"
                      placeholder="123456"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      required
                      autoFocus
                      style={{ letterSpacing: '0.3em', fontWeight: 700, fontSize: '1.2rem', textAlign: 'center' }}
                    />
                  </div>
                </label>
                <button className="btn btn--primary" type="submit" disabled={loading || otp.length !== 6}>
                  {loading ? 'Verifying…' : 'Verify OTP'}
                </button>
                <button
                  type="button"
                  onClick={() => { setOtp(''); setStep('request'); }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 'var(--text-sm)', cursor: 'pointer', textAlign: 'center' }}
                >
                  ← Resend OTP
                </button>
              </form>
            </motion.div>
          )}

          {/* ── STEP 3: New Password ── */}
          {step === 'reset' && (
            <motion.div key="reset" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>Set New Password</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Choose a strong password with at least 8 characters.
              </p>
              <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label className="form__group">
                  <span className="form__label">New Password</span>
                  <div className="input-icon-wrap">
                    <FiLock className="input-icon" size={16} />
                    <input
                      id="fp-new-pw"
                      type="password"
                      className="form__input"
                      placeholder="Min. 8 characters"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                </label>
                <label className="form__group">
                  <span className="form__label">Confirm Password</span>
                  <div className="input-icon-wrap">
                    <FiLock className="input-icon" size={16} />
                    <input
                      id="fp-confirm-pw"
                      type="password"
                      className="form__input"
                      placeholder="Repeat password"
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      required
                    />
                  </div>
                </label>
                {newPassword && confirm && newPassword !== confirm && (
                  <p style={{ color: 'var(--danger)', fontSize: 'var(--text-xs)', margin: '-8px 0 0' }}>Passwords don't match</p>
                )}
                <button
                  className="btn btn--primary"
                  type="submit"
                  disabled={loading || newPassword.length < 8 || newPassword !== confirm}
                  style={{ marginTop: 8 }}
                >
                  {loading ? 'Resetting…' : 'Reset Password'}
                </button>
              </form>
            </motion.div>
          )}

          {/* ── STEP 4: Done ── */}
          {step === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: 'center', padding: '1rem 0' }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}
              >
                <FiCheckCircle size={56} />
              </motion.div>
              <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>Password Reset!</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: '2rem', lineHeight: 1.6 }}>
                Your password has been updated successfully. You can now log in with your new password.
              </p>
              <Link to="/login" className="btn btn--primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Go to Login
              </Link>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Bottom link */}
        {step !== 'done' && (
          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <FiArrowLeft size={14} /> Back to Login
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
