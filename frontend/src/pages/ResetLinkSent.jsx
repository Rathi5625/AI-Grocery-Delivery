import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../api/axios';

const COOLDOWN_SECONDS = 30;

export default function ResetLinkSent() {
  const [cooldown, setCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();

  // Retrieve the email from localStorage (set by ForgotPassword page)
  const email = localStorage.getItem('resetEmail') || '';

  // Countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || isResending || !email) return;

    try {
      setIsResending(true);
      await API.post('/auth/forgot-password', { email });
      toast.success('Email sent again!', {
        style: {
          background: '#FDFBF7',
          color: '#422701',
          border: '1px solid #D6B588',
          borderRadius: '12px',
          fontWeight: '600',
          fontSize: '0.9rem',
        },
        iconTheme: { primary: '#D6B588', secondary: '#422701' },
      });
    } catch (err) {
      console.error(err);
      // Show toast regardless to avoid email enumeration
      toast.success('If the address is on file, a new link has been sent.', {
        style: {
          background: '#FDFBF7',
          color: '#422701',
          border: '1px solid #D6B588',
          borderRadius: '12px',
          fontWeight: '600',
          fontSize: '0.9rem',
        },
      });
    } finally {
      setIsResending(false);
      setCooldown(COOLDOWN_SECONDS);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">

      {/* ─── LEFT PANEL ─── */}
      <div className="hidden lg:block relative w-[48%] overflow-hidden">
        {/* Background food image */}
        <img
          src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1200&auto=format&fit=crop"
          alt="Fresh spices and herbs"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark brown gradient overlay - matches screenshot */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#3a2c1a]/80 via-[#2e2316]/75 to-[#1e1a12]/85" />

        {/* Brand text - bottom left, matching screenshot */}
        <div className="absolute bottom-20 left-12 z-10">
          <h1 className="text-[2.8rem] font-bold text-[#D6B588] leading-tight tracking-tight mb-2">
            FreshAI
          </h1>
          <p className="text-[#C6C0B9]/90 text-[1.1rem] leading-snug max-w-[280px]">
            Smart grocery shopping powered by AI.
          </p>
        </div>
      </div>

      {/* ─── RIGHT PANEL ─── */}
      <div className="flex-1 bg-[#C6C0B9] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="w-full max-w-[420px] bg-white rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.08)] px-10 py-14 flex flex-col items-center text-center"
        >
          {/* Checkmark Icon */}
          <div className="w-14 h-14 rounded-full bg-[#EAE5DB] flex items-center justify-center mb-8 shadow-sm">
            <FiCheck size={26} strokeWidth={3} className="text-[#8A6843]" />
          </div>

          {/* Title */}
          <h2 className="text-[1.65rem] font-bold text-[#2c2015] tracking-tight mb-4">
            Reset Link Sent
          </h2>

          {/* Description */}
          <p className="text-[#705E46] text-[0.9rem] leading-relaxed mb-10 max-w-[300px]">
            We've sent an email to your address with instructions to reset your password.
            Please check your inbox and spam folder.
          </p>

          {/* Back to Login Button */}
          <motion.button
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => navigate('/login')}
            className="w-full bg-[#36322b] hover:bg-[#4a4238] text-white font-semibold py-3.5 rounded-xl transition-colors duration-200 shadow text-[0.95rem] mb-6"
          >
            Back to Login
          </motion.button>

          {/* Resend Row */}
          <div className="text-[#705E46] text-[0.88rem]">
            Didn't receive the email?{' '}
            {cooldown > 0 ? (
              <span className="font-bold text-[#A89F91]">
                Resend in {cooldown}s
              </span>
            ) : (
              <button
                onClick={handleResend}
                disabled={isResending}
                className="font-bold text-[#422701] hover:text-[#8A6843] transition-colors disabled:opacity-50 disabled:cursor-not-allowed underline underline-offset-2 decoration-[#D6B588]"
              >
                {isResending ? 'Sending...' : 'Resend'}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
