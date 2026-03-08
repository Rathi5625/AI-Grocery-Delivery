import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Basic form validation
        if (!form.email || !form.password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await login(form.email, form.password);
            toast.success('Welcome back!', { icon: '👋' });
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally { setLoading(false); }
    };

    return (
        <div className="auth-page" id="login-page">
            <motion.div className="auth-page__left" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                <div className="auth-page__brand">🌿 FreshAI</div>
                <p className="auth-page__tagline">
                    AI-powered grocery delivery for a sustainable future. Fresh produce, smart recommendations, and eco-friendly packaging.
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-8)', marginTop: 'var(--space-8)', position: 'relative', zIndex: 1 }}>
                    {[
                        { value: '10K+', label: 'Products' },
                        { value: '50K+', label: 'Customers' },
                        { value: '10 min', label: 'Delivery' },
                    ].map((s, i) => (
                        <div key={i} style={{ textAlign: 'center', color: 'white' }}>
                            <div style={{ fontSize: 'var(--text-xl)', fontWeight: 900 }}>{s.value}</div>
                            <div style={{ fontSize: 'var(--text-xs)', opacity: 0.75 }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </motion.div>

            <motion.div className="auth-page__right" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                <form className="auth-form" onSubmit={handleSubmit}>
                    <h1 className="auth-form__title">Welcome back</h1>
                    <p className="auth-form__subtitle">Sign in to your account to continue</p>

                    <AnimatePresence>
                        {error && (
                            <motion.div className="auth-form__alert" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="form-floating">
                        <input type="email" id="email" placeholder=" "
                            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                        <label htmlFor="email">Email address</label>
                    </div>

                    <div className="form-floating">
                        <input type={showPassword ? 'text' : 'password'} id="password" placeholder=" "
                            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                        <label htmlFor="password">Password</label>
                        <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                        </button>
                    </div>

                    <div className="checkbox-group" style={{ justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input type="checkbox" id="rememberMe" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                            <label htmlFor="rememberMe">Remember me</label>
                        </div>
                        <a href="#" style={{ fontSize: 'var(--text-sm)', color: 'var(--primary)', fontWeight: 500 }}>Forgot password?</a>
                    </div>

                    <motion.button
                        type="submit"
                        className="btn btn--primary btn--lg btn--full"
                        style={{ marginTop: 'var(--space-2)' }}
                        disabled={loading}
                        id="login-submit"
                        whileTap={{ scale: 0.98 }}
                    >
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="loader__spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Signing in...
                            </span>
                        ) : 'Sign In'}
                    </motion.button>

                    <p style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>
                        Don't have an account? <Link to="/register" className="auth-form__link">Create one</Link>
                    </p>
                </form>
            </motion.div>
        </div>
    );
}
