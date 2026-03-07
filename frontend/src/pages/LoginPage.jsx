import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
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

                    {error && (
                        <motion.div className="auth-form__alert" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                            {error}
                        </motion.div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" className="form-input" placeholder="you@example.com"
                            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" className="form-input" placeholder="••••••••"
                            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
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
