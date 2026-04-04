import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function RegisterPage() {
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!form.firstName || !form.lastName || !form.email || !form.password) {
            setError('Please fill in all required fields');
            return;
        }

        if (form.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setLoading(true);
        try {
            await signup(form);
            toast.success('Account created!', { icon: '🎉' });
            navigate('/');
        } catch (err) {
            setError(err.userMessage || 'Registration failed. Please try again.');
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

                    <AnimatePresence>
                        {error && (
                            <motion.div className="auth-form__alert" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                        <div className="form-floating" style={{ marginBottom: 0 }}>
                            <input type="text" id="firstName" placeholder=" "
                                value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required />
                            <label htmlFor="firstName">First Name</label>
                        </div>
                        <div className="form-floating" style={{ marginBottom: 0 }}>
                            <input type="text" id="lastName" placeholder=" "
                                value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required />
                            <label htmlFor="lastName">Last Name</label>
                        </div>
                    </div>

                    <div className="form-floating" style={{ marginTop: 'var(--space-4)' }}>
                        <input type="email" id="reg-email" placeholder=" "
                            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                        <label htmlFor="reg-email">Email address</label>
                    </div>

                    <div className="form-floating">
                        <input type={showPassword ? 'text' : 'password'} id="reg-password" placeholder=" "
                            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={8} />
                        <label htmlFor="reg-password">Password (Min 8 characters)</label>
                        <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                        </button>
                    </div>

                    <div className="form-floating">
                        <input type="tel" id="phone" placeholder=" "
                            value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                        <label htmlFor="phone">Phone (optional)</label>
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
