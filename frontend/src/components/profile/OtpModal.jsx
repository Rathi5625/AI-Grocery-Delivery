import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiShield, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';

const OTP_EXPIRY_SECONDS = 300; // 5 minutes

export default function OtpModal({ purpose, target, onVerify, onResend, onClose, loading }) {
  const [digits, setDigits]   = useState(['', '', '', '', '', '']);
  const [seconds, setSeconds] = useState(OTP_EXPIRY_SECONDS);
  const [expired, setExpired] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);
  const inputRefs             = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (seconds <= 0) { setExpired(true); return; }
    const t = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  // Auto-submit when all 6 digits are entered
  useEffect(() => {
    if (digits.every(d => d !== '') && !expired && !loading) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits]);

  const handleChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    setError('');
    const next = [...digits];
    next[idx] = val;
    setDigits(next);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...digits];
    [...pasted].forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    const last = Math.min(pasted.length, 5);
    inputRefs.current[last]?.focus();
  };

  const handleSubmit = async () => {
    const code = digits.join('');
    if (code.length === 6) {
      setError('');
      const ok = await onVerify(code);
      if (ok) setSuccess(true);
      else setError('Invalid OTP. Please check and try again.');
    }
  };

  const handleResend = () => {
    setDigits(['', '', '', '', '', '']);
    setSeconds(OTP_EXPIRY_SECONDS);
    setExpired(false);
    setError('');
    setSuccess(false);
    onResend();
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  const purposeLabel = {
    EMAIL_CHANGE:    'email address change',
    PHONE_CHANGE:    'phone number change',
    PASSWORD_CHANGE: 'password change',
  }[purpose] || 'sensitive update';

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="modal-box otp-modal"
          initial={{ scale: 0.88, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.88, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          onClick={e => e.stopPropagation()}
          style={{ maxWidth: 420 }}
        >
          <button className="modal-close" onClick={onClose}><FiX /></button>

          {/* Icon */}
          <motion.div
            className="otp-modal__icon"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20, delay: 0.1 }}
          >
            <FiShield size={28} />
          </motion.div>

          <h3 className="otp-modal__title">Verify Your Identity</h3>
          <p className="otp-modal__sub">
            We sent a 6-digit code for your <strong>{purposeLabel}</strong>
            {target ? <> to <strong>{target}</strong></> : ' to your registered email'}.
          </p>

          {/* 6-digit OTP input boxes */}
          <div className="otp-input-row">
            {digits.map((d, i) => (
              <motion.input
                key={i}
                ref={el => inputRefs.current[i] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleChange(e.target.value, i)}
                onKeyDown={e => handleKeyDown(e, i)}
                onPaste={i === 0 ? handlePaste : undefined}
                className={`otp-digit-input ${d ? 'otp-digit-input--filled' : ''} ${expired ? 'otp-input--expired' : ''}`}
                disabled={expired || loading || success}
                autoFocus={i === 0}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 + 0.15 }}
              />
            ))}
          </div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ color: 'var(--danger)', fontSize: '0.8rem', textAlign: 'center', marginBottom: 12, fontWeight: 600 }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Success state */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="otp-verified-badge"
                style={{ justifyContent: 'center', marginBottom: 16 }}
              >
                <FiCheckCircle size={18} /> OTP Verified Successfully!
              </motion.div>
            )}
          </AnimatePresence>

          {/* Countdown timer */}
          <div className={`otp-countdown ${expired ? 'otp-timer--expired' : seconds <= 60 ? 'otp-timer--warn' : ''}`}>
            {expired
              ? '⏰ Code expired — please request a new one'
              : <><span>⏱ {mm}:{ss}</span> remaining</>
            }
          </div>

          {/* Actions */}
          {!expired && !success ? (
            <button
              className="btn btn--primary btn--full"
              onClick={handleSubmit}
              disabled={digits.join('').length < 6 || loading}
              style={{ marginTop: 16 }}
            >
              {loading ? <span className="spinner" /> : 'Verify Code'}
            </button>
          ) : expired ? (
            <button
              className="btn btn--primary btn--full"
              onClick={handleResend}
              disabled={loading}
              style={{ marginTop: 16 }}
            >
              <FiRefreshCw size={15} />
              {loading ? 'Sending…' : 'Resend OTP'}
            </button>
          ) : null}

          {/* Resend link (before expiry) */}
          {!expired && !success && (
            <button className="otp-resend-link" onClick={handleResend} disabled={loading}>
              <FiRefreshCw size={13} /> Didn't receive it? Resend
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
