import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser, FiPhone, FiArrowRight } from 'react-icons/fi';
import { RiLeafLine, RiSparklingLine } from 'react-icons/ri';

const TRUST_ITEMS = [
  { icon: '✓', text: 'Free first delivery' },
  { icon: '✓', text: '100% organic options' },
  { icon: '✓', text: 'Cancel anytime' },
];

export default function RegisterPage() {
  const { signup } = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]           = useState({ firstName: '', lastName: '', email: '', password: '', phone: '' });
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError('Please fill in all required fields');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await signup(form);
      toast.success('Account created! Check your email for the verification code.', { icon: '📧', duration: 5000 });
      navigate(`/verify-otp?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      const raw = err?.response?.data?.message || err?.userMessage || '';
      const friendly =
        raw.toLowerCase().includes('already') ? 'An account with this email already exists.' :
        raw.toLowerCase().includes('password') ? 'Password must be at least 8 characters.' :
        raw || 'Something went wrong. Please try again.';
      setError(friendly);
    } finally { setLoading(false); }
  };

  return (
    <div className="auth2" id="register-page">
      {/* ── Left panel ── */}
      <motion.div
        className="auth2__left"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="auth2__blob auth2__blob--1" />
        <div className="auth2__blob auth2__blob--2" />

        <div className="auth2__left-inner">
          <div className="auth2__brand">
            <span className="auth2__brand-icon"><RiLeafLine size={18} /></span>
            FreshAI
          </div>

          <div className="auth2__left-content">
            <div className="auth2__left-eyebrow">
              <RiSparklingLine size={13} /> Join 50,000+ Happy Shoppers
            </div>
            <h2 className="auth2__left-headline">
              Start your fresh<br />
              <span className="auth2__left-accent">food journey today</span>
            </h2>
            <p className="auth2__left-sub">
              AI-curated groceries, eco-friendly packaging, and lightning-fast delivery to your door.
            </p>

            <div className="auth2__left-pills">
              {TRUST_ITEMS.map((item, i) => (
                <motion.div
                  key={i}
                  className="auth2__pill auth2__pill--check"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <span style={{ color: '#4ade80', fontWeight: 700 }}>{item.icon}</span> {item.text}
                </motion.div>
              ))}
            </div>
          </div>

          <div className="auth2__left-stats">
            {[{ v: '50K+', l: 'Happy Customers' }, { v: '500+', l: 'Products' }, { v: '10 min', l: 'Avg. Delivery' }].map((s, i) => (
              <div key={i} className="auth2__left-stat">
                <div className="auth2__left-stat-value">{s.v}</div>
                <div className="auth2__left-stat-label">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Right panel ── */}
      <motion.div
        className="auth2__right"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="auth2__form-wrap">
          <div className="auth2__form-header">
            <h1 className="auth2__form-title">Create account</h1>
            <p className="auth2__form-sub">Join FreshAI and start shopping fresh</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                className="auth2__alert"
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.25 }}
              >
                ⚠ {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="auth2__form" noValidate>
            {/* Name row */}
            <div className="auth2__row">
              <div className="auth2__field">
                <label className="auth2__label" htmlFor="firstName">First name</label>
                <div className="auth2__input-wrap">
                  <FiUser size={15} className="auth2__input-icon" />
                  <input id="firstName" type="text" className="auth2__input" placeholder="John"
                    value={form.firstName} onChange={set('firstName')} required />
                </div>
              </div>
              <div className="auth2__field">
                <label className="auth2__label" htmlFor="lastName">Last name</label>
                <div className="auth2__input-wrap">
                  <FiUser size={15} className="auth2__input-icon" />
                  <input id="lastName" type="text" className="auth2__input" placeholder="Doe"
                    value={form.lastName} onChange={set('lastName')} required />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="auth2__field">
              <label className="auth2__label" htmlFor="reg-email">Email address</label>
              <div className="auth2__input-wrap">
                <FiMail size={15} className="auth2__input-icon" />
                <input id="reg-email" type="email" className="auth2__input" placeholder="you@example.com"
                  value={form.email} onChange={set('email')} required autoComplete="email" />
              </div>
            </div>

            {/* Password */}
            <div className="auth2__field">
              <label className="auth2__label" htmlFor="reg-password">Password</label>
              <div className="auth2__input-wrap">
                <FiLock size={15} className="auth2__input-icon" />
                <input id="reg-password" type={showPassword ? 'text' : 'password'} className="auth2__input"
                  placeholder="Min. 8 characters" value={form.password} onChange={set('password')} required minLength={8} />
                <button type="button" className="auth2__eye" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {/* Phone (optional) */}
            <div className="auth2__field">
              <label className="auth2__label" htmlFor="phone">Phone <span style={{ color: 'var(--gray-400)', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
              <div className="auth2__input-wrap">
                <FiPhone size={15} className="auth2__input-icon" />
                <input id="phone" type="tel" className="auth2__input" placeholder="+91 98765 43210"
                  value={form.phone} onChange={set('phone')} />
              </div>
            </div>

            <motion.button
              type="submit"
              className="auth2__submit"
              disabled={loading}
              id="register-submit"
              whileTap={{ scale: 0.98 }}
            >
              {loading ? <span className="auth2__spinner" /> : <>Create Account <FiArrowRight size={16} /></>}
            </motion.button>
          </form>

          <p className="auth2__footer-text">
            Already have an account?{' '}
            <Link to="/login" className="auth2__footer-link">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
