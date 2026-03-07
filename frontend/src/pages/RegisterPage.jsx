import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signup(form);
            toast.success('Account created!', { icon: '🎉' });
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally { setLoading(false); }
    };

    return (
        <div className="auth-page" id="register-page">
            <motion.div className="auth-page__left" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                <div className="auth-page__brand">🌿 FreshAI</div>
                <p className="auth-page__tagline">
                    Join thousands of eco-conscious shoppers. Get AI-powered recommendations and track your sustainability impact.
                </p>
            </motion.div>

            <motion.div className="auth-page__right" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                <form className="auth-form" onSubmit={handleSubmit}>
                    <h1 className="auth-form__title">Create account</h1>
                    <p className="auth-form__subtitle">Start your sustainable shopping journey</p>

                    {error && (
                        <motion.div className="auth-form__alert" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                            {error}
                        </motion.div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                        <div className="form-group">
                            <label htmlFor="firstName">First Name</label>
                            <input type="text" id="firstName" className="form-input" placeholder="First name"
                                value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="lastName">Last Name</label>
                            <input type="text" id="lastName" className="form-input" placeholder="Last name"
                                value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="reg-email">Email</label>
                        <input type="email" id="reg-email" className="form-input" placeholder="you@example.com"
                            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="reg-password">Password</label>
                        <input type="password" id="reg-password" className="form-input" placeholder="Min 8 characters"
                            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={8} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Phone <span style={{ color: 'var(--gray-400)', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
                        <input type="tel" id="phone" className="form-input" placeholder="+91 98765 43210"
                            value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                    </div>

                    <motion.button
                        type="submit"
                        className="btn btn--primary btn--lg btn--full"
                        style={{ marginTop: 'var(--space-2)' }}
                        disabled={loading}
                        id="register-submit"
                        whileTap={{ scale: 0.98 }}
                    >
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="loader__spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Creating account...
                            </span>
                        ) : 'Create Account'}
                    </motion.button>

                    <p style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>
                        Already have an account? <Link to="/login" className="auth-form__link">Sign in</Link>
                    </p>
                </form>
            </motion.div>
        </div>
    );
}
