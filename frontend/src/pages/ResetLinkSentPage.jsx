import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft, FiLoader, FiCheckCircle } from 'react-icons/fi';
import { RiLeafLine } from 'react-icons/ri';
import toast from 'react-hot-toast';
import { forgotPassword } from '../api/authApi';

export default function ResetLinkSentPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Load email and handle routing check
  useEffect(() => {
    const savedEmail = localStorage.getItem('resetEmail');
    if (!savedEmail) {
      navigate('/forgot-password');
      return;
    }
    setEmail(savedEmail);
  }, [navigate]);

  // Handle cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || loading) return;

    setLoading(true);
    try {
      await forgotPassword(email);
      toast.success('Reset link resent!');
      setCooldown(30); // 30 second cooldown
    } catch (err) {
      toast.error('Failed to resend link. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">

      {/* ── Left Panel ─────────────────────────────── */}
      <div
        className="hidden lg:flex w-[48%] flex-col items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #2d2416 0%, #3d2e18 50%, #2a1e0f 100%)' }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, #D6B588 0%, transparent 50%), radial-gradient(circle at 70% 70%, #705E46 0%, transparent 40%)' }}
        />
        <div className="relative z-10 text-center px-12">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-[#D6B588]/20 flex items-center justify-center">
              <RiLeafLine size={22} className="text-[#D6B588]" />
            </div>
            <span className="text-white text-[1.8rem] font-bold tracking-tight">FreshAI</span>
          </div>
          <p className="text-[#C6C0B9] text-[1.1rem] leading-relaxed max-w-[280px] mx-auto">
            Smart grocery shopping powered by AI.
          </p>
          <div className="mt-10 rounded-2xl overflow-hidden shadow-2xl max-w-[340px] mx-auto border border-white/10">
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop"
              alt="Fresh groceries"
              className="w-full h-[220px] object-cover"
            />
          </div>
        </div>
      </div>

      {/* ── Right Panel ─────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-[#FAF7F2] p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-[420px]"
        >
          <div className="bg-white rounded-2xl shadow-[0_4px_40px_rgba(66,39,1,0.08)] border border-[#C6C0B9]/30 p-10 text-center">

            {/* Animated envelope icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 20, delay: 0.1 }}
              className="flex justify-center mb-6"
            >
              <div className="w-16 h-16 rounded-full bg-[#F2ECE4] flex items-center justify-center">
                <FiCheckCircle size={30} className="text-[#8A6843]" />
              </div>
            </motion.div>

            <h1 className="text-[1.75rem] font-semibold text-[#422701] mb-2 tracking-tight">
              Reset Link Sent
            </h1>
            <p className="text-[#705E46] text-[0.9rem] leading-relaxed mb-8">
              We've sent an email to your address with instructions to reset your password.
              {email && <span> Please check <strong>{email}</strong> for the link.</span>}
              Please check your inbox and spam folder.
            </p>

            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full gap-2 bg-[#2d2416] hover:bg-[#3d2e18] text-white font-semibold py-3.5 rounded-xl transition-all duration-200 text-[0.95rem] tracking-wide shadow-sm hover:shadow-md mb-6"
            >
              Back to Login
            </Link>

            <div className="text-[0.9rem] text-[#705E46]">
              Didn't receive the email?{' '}
              <button
                onClick={handleResend}
                disabled={loading || cooldown > 0}
                className="text-[#8A6843] font-semibold hover:text-[#422701] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-1">
                    <FiLoader className="animate-spin" /> Sending...
                  </span>
                ) : cooldown > 0 ? (
                  `Resend in ${cooldown}s`
                ) : (
                  'Resend'
                )}
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-[#C6C0B9]/20">
              <Link
                to="/forgot-password"
                className="inline-flex items-center gap-1.5 text-[#8A6843] hover:text-[#422701] text-[0.85rem] font-medium transition-colors"
              >
                <FiArrowLeft size={13} />
                Try a different email
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
