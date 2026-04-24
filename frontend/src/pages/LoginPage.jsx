import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff, FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { RiLeafLine, RiSparklingLine } from 'react-icons/ri';

const HERO_ITEMS = [
  { icon: '⚡', label: '10-Min delivery' },
  { icon: '🤖', label: 'AI-curated picks' },
  { icon: '🌱', label: 'Eco packaging' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]           = useState({ email: '', password: '' });
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 👋');
      navigate('/');
    } catch (err) {
      const raw = err?.response?.data?.message || err?.userMessage || '';
      if (raw.toLowerCase().includes('verify')) {
        toast.error('Please verify your email before logging in.', { duration: 4000 });
        navigate(`/verify-otp?email=${encodeURIComponent(form.email)}`);
        return;
      }
      const friendly =
        raw.toLowerCase().includes('disabled')  ? 'Your account has been disabled. Contact support.' :
        raw.toLowerCase().includes('password')  ? 'Incorrect password. Please try again.' :
        raw.toLowerCase().includes('not found') ||
        raw.toLowerCase().includes('invalid')   ? 'Invalid email or password.' :
        raw || 'Something went wrong. Please try again.';
      setError(friendly);
    } finally { setLoading(false); }
  };

  return (
    <div className="auth2" id="login-page">
      {/* ── Left panel ── */}
      <motion.div
        className="auth2__left"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Decorative blobs */}
        <div className="auth2__blob auth2__blob--1" />
        <div className="auth2__blob auth2__blob--2" />

        <div className="auth2__left-inner">
          <div className="auth2__brand">
            <span className="auth2__brand-icon"><RiLeafLine size={18} /></span>
            FreshAI
          </div>

          <div className="auth2__left-content">
            <div className="auth2__left-eyebrow">
              <RiSparklingLine size={13} /> AI-Powered Grocery
            </div>
            <h2 className="auth2__left-headline">
              Fresh groceries,<br />
              <span className="auth2__left-accent">delivered in 10 min</span>
            </h2>
            <p className="auth2__left-sub">
              Farm-fresh produce and eco-friendly delivery — crafted for modern households.
            </p>

            <div className="auth2__left-pills">
              {HERO_ITEMS.map((item, i) => (
                <motion.div
                  key={i}
                  className="auth2__pill"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <span>{item.icon}</span> {item.label}
                </motion.div>
              ))}
            </div>
          </div>

          <div className="auth2__left-stats">
            {[{ v: '50K+', l: 'Customers' }, { v: '10 min', l: 'Delivery' }, { v: '500+', l: 'Products' }].map((s, i) => (
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
            <h1 className="auth2__form-title">Welcome back</h1>
            <p className="auth2__form-sub">Sign in to your FreshAI account</p>
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
            {/* Email */}
            <div className="auth2__field">
              <label className="auth2__label" htmlFor="email">Email address</label>
              <div className="auth2__input-wrap">
                <FiMail size={15} className="auth2__input-icon" />
                <input
                  id="email"
                  type="email"
                  className="auth2__input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth2__field">
              <div className="auth2__label-row">
                <label className="auth2__label" htmlFor="password">Password</label>
                <Link to="/forgot-password" className="auth2__forgot">Forgot password?</Link>
              </div>
              <div className="auth2__input-wrap">
                <FiLock size={15} className="auth2__input-icon" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth2__input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="current-password"
                />
                <button type="button" className="auth2__eye" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              className="auth2__submit"
              disabled={loading}
              id="login-submit"
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <span className="auth2__spinner" />
              ) : (
                <>Sign In <FiArrowRight size={16} /></>
              )}
            </motion.button>
          </form>

          <p className="auth2__footer-text">
            Don't have an account?{' '}
            <Link to="/register" className="auth2__footer-link">Create one free</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
