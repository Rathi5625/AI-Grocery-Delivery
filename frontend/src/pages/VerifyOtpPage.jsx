import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../api/axios';

export default function VerifyOtpPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    // email from URL params, useful for resend and visual context
    const email = searchParams.get('email');

    useEffect(() => {
        // If they navigate directly here without an email, maybe redirect to login? 
        // We'll just allow it for now, but resend might fail without target.
    }, []);

    const handleVerify = async (e) => {
        e.preventDefault();
        
        if (!otp || otp.length < 6) {
            toast.error('Please enter a 6-digit OTP');
            return;
        }

        setLoading(true);
        try {
            await API.post('/otp/verify', { otp });
            toast.success('Verified successfully');
            navigate('/');
        } catch (err) {
            toast.error(err?.response?.data?.message || err?.userMessage || 'Invalid or expired OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) {
            toast.error('Missing email to resend OTP');
            return;
        }

        setResendLoading(true);
        try {
            await API.post('/otp/send', { type: 'EMAIL', target: email });
            toast.success('OTP sent successfully!');
        } catch (err) {
            toast.error(err?.response?.data?.message || err?.userMessage || 'Failed to resend OTP');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <motion.div className="auth-page__left" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                <div className="auth-page__brand">🌿 FreshAI</div>
                <p className="auth-page__tagline">
                    Verify it's you to continue.
                </p>
            </motion.div>

            <motion.div className="auth-page__right" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                <form className="auth-form" onSubmit={handleVerify}>
                    <h1 className="auth-form__title">Verify OTP</h1>
                    <p className="auth-form__subtitle">
                        We've sent a 6-digit code {email ? `to ${email}` : 'to your email'}.
                    </p>

                    <div className="form-floating" style={{ marginTop: 'var(--space-4)' }}>
                        <input 
                            type="text" 
                            id="otp" 
                            placeholder=" "
                            value={otp} 
                            onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} 
                            required 
                            minLength={6} 
                            maxLength={6}
                            style={{ letterSpacing: '0.5rem', textAlign: 'center', fontSize: '1.25rem' }}
                        />
                        <label htmlFor="otp" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>6-digit code</label>
                    </div>

                    <motion.button
                        type="submit"
                        className="btn btn--primary btn--lg btn--full"
                        style={{ marginTop: 'var(--space-4)' }}
                        disabled={loading || resendLoading}
                        whileTap={{ scale: 0.98 }}
                    >
                        {loading ? 'Verifying...' : 'Verify'}
                    </motion.button>

                    <p style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>
                        Didn't receive the code?{' '}
                        <button 
                            type="button" 
                            className="auth-form__link" 
                            onClick={handleResend} 
                            disabled={resendLoading || loading}
                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit' }}
                        >
                            {resendLoading ? 'Sending...' : 'Resend OTP'}
                        </button>
                    </p>
                    
                    <p style={{ textAlign: 'center', marginTop: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
                        <Link to="/login" className="auth-form__link">Back to Login</Link>
                    </p>
                </form>
            </motion.div>
        </div>
    );
}
