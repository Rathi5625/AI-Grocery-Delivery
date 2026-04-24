import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../api/axios';
import { FiArrowLeft, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';
import { RiLeafLine, RiShieldCheckLine } from 'react-icons/ri';

const RESEND_COOLDOWN = 30;

export default function VerifyOtpPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email') || '';

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  const [loading, setLoading]           = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown]         = useState(0);
  const [verified, setVerified]         = useState(false);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  // Auto-focus first box
  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  const handleDigitChange = (index, value) => {
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const next = [...digits];
        next[index] = '';
        setDigits(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === 'ArrowLeft'  && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pasted) return;
    const next = [...digits];
    pasted.split('').forEach((ch, i) => { if (i < 6) next[i] = ch; });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const otpCode   = digits.join('');
  const isComplete = otpCode.length === 6;

  const friendlyError = useCallback((raw = '') => {
    if (raw.toLowerCase().includes('expired'))   return 'OTP has expired. Please request a new one.';
    if (raw.toLowerCase().includes('too many') ||
        raw.toLowerCase().includes('maximum'))   return 'Too many attempts. Request a new OTP.';
    if (raw.toLowerCase().includes('invalid'))   return 'Invalid OTP. Double-check the code.';
    if (raw.toLowerCase().includes('no active')) return 'No active OTP found. Request a new one.';
    return raw || 'Verification failed. Please try again.';
  }, []);

  const handleVerify = async (e) => {
    e?.preventDefault();
    if (!isComplete) { toast.error('Please enter all 6 digits'); return; }
    setLoading(true);
    try {
      await API.post('/otp/verify', { otp: otpCode, email });
      setVerified(true);
      toast.success('Email verified! 🎉');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const raw = err?.response?.data?.message || err?.userMessage || '';
      toast.error(friendlyError(raw));
      setDigits(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    if (!email) { toast.error('Email not found. Please register again.'); return; }
    if (cooldown > 0) return;
    setResendLoading(true);
    try {
      await API.post('/otp/resend', { email });
      toast.success('A new OTP has been sent!');
      setCooldown(RESEND_COOLDOWN);
      setDigits(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } catch (err) {
      const raw = err?.response?.data?.message || err?.userMessage || '';
      toast.error(raw || 'Failed to resend. Please try again.');
    } finally { setResendLoading(false); }
  };

  return (
    <div className="otp2-page" id="verify-otp-page">
      {/* Decorative background */}
      <div className="otp2-page__bg" />
      <div className="otp2-page__blob otp2-page__blob--1" />
      <div className="otp2-page__blob otp2-page__blob--2" />

      <motion.div
        className="otp2-card"
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Logo */}
        <div className="otp2-card__logo">
          <span className="otp2-card__logo-icon"><RiLeafLine size={16} /></span>
          FreshAI
        </div>

        <AnimatePresence mode="wait">
          {verified ? (
            /* ── SUCCESS STATE ── */
            <motion.div
              key="success"
              className="otp2-success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <motion.div
                className="otp2-success__icon"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.1 }}
              >
                <FiCheckCircle size={48} />
              </motion.div>
              <h1 className="otp2-success__title">Verified!</h1>
              <p className="otp2-success__sub">Your email has been verified. Redirecting to login…</p>
              <div className="otp2-success__loader">
                <div className="otp2-success__spinner" />
                <span>Redirecting in 2 seconds</span>
              </div>
            </motion.div>
          ) : (
            /* ── OTP FORM ── */
            <motion.form
              key="form"
              onSubmit={handleVerify}
              className="otp2-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="otp2-card__icon-wrap">
                <RiShieldCheckLine size={28} />
              </div>

              <h1 className="otp2-card__title">Verify Identity</h1>
              <p className="otp2-card__sub">
                We sent a 6-digit code to{' '}
                {email
                  ? <strong className="otp2-card__email">{email}</strong>
                  : 'your email address'
                }.
              </p>

              {/* OTP digit boxes */}
              <div className="otp2-inputs">
                {digits.map((digit, i) => (
                  <motion.input
                    key={i}
                    ref={el => inputRefs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    id={`otp-box-${i}`}
                    autoComplete={i === 0 ? 'one-time-code' : 'off'}
                    className={`otp2-digit ${digit ? 'otp2-digit--filled' : ''}`}
                    onChange={e => handleDigitChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    onPaste={i === 0 ? handlePaste : undefined}
                    disabled={loading || verified}
                    whileFocus={{ scale: 1.08 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  />
                ))}
              </div>

              {/* Timer + resend */}
              <div className="otp2-resend-row">
                {cooldown > 0 ? (
                  <span className="otp2-timer">
                    ⏱ Resend in <strong>{cooldown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    className="otp2-resend-btn"
                    onClick={handleResend}
                    disabled={resendLoading || loading}
                  >
                    {resendLoading
                      ? <><div className="otp2-mini-spinner" /> Sending…</>
                      : <><FiRefreshCw size={12} /> Resend Code</>
                    }
                  </button>
                )}
              </div>

              {/* Verify button */}
              <motion.button
                type="submit"
                className="otp2-submit"
                disabled={loading || !isComplete}
                whileTap={{ scale: 0.97 }}
              >
                {loading ? (
                  <span className="otp2-submit__loading">
                    <div className="otp2-mini-spinner otp2-mini-spinner--white" /> Verifying…
                  </span>
                ) : 'Verify →'}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Back to login */}
        {!verified && (
          <Link to="/login" className="otp2-back">
            <FiArrowLeft size={14} /> Return to Login
          </Link>
        )}
      </motion.div>
    </div>
  );
}
