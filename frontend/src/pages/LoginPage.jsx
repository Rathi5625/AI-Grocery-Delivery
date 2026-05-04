import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import InputField from '../components/auth/InputField';
import { authPageVariants } from '../utils/animations';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!form.email || !form.password) { 
      toast.error('Please fill in all fields'); 
      return; 
    }
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
        (raw.toLowerCase().includes('not found') || raw.toLowerCase().includes('invalid')) ? 'Invalid email or password.' :
        raw || 'Something went wrong. Please try again.';
      toast.error(friendly);
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <motion.div 
      variants={authPageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      custom={1} // Slide in from right (1)
      className="min-h-screen flex flex-col md:flex-row font-sans"
    >
      
      {/* LEFT PANEL */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="w-full md:w-[45%] bg-[#422701] flex flex-col items-center justify-center py-20 px-10 relative overflow-hidden order-1 md:order-none"
      >
        
        {/* Subtle decorative lighting */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-gradient-to-br from-[#D6B588] to-transparent pointer-events-none"></div>

        <div className="text-left w-full max-w-[320px] relative z-10">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-[56px] font-bold text-[#D6B588] mb-4 tracking-tight leading-none"
          >
            FreshAI
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-[#D6B588] font-medium leading-snug mb-16 opacity-90"
          >
            Smart grocery shopping powered by AI.
          </motion.p>
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-[2px] bg-[#D6B588] rounded-full"></div>
            <div className="w-3 h-[2px] bg-[#D6B588] bg-opacity-40 rounded-full"></div>
            <div className="w-3 h-[2px] bg-[#D6B588] bg-opacity-40 rounded-full"></div>
          </div>
        </div>
      </motion.div>

      {/* RIGHT PANEL */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full md:w-[55%] bg-white relative flex items-center justify-center p-8 md:p-16 order-2 md:order-none"
      >
        
        <div className="w-full max-w-[440px]">
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-[32px] font-semibold text-[#422701] mb-2 tracking-tight"
          >
            Welcome Back
          </motion.h2>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="text-[#705E46] text-sm mb-10"
          >
            Please enter your details to access your pantry.
          </motion.p>

          <motion.form 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleSubmit} 
            className="flex flex-col gap-6"
          >
            
            <InputField 
              label="Email Address" 
              type="email" 
              placeholder="you@example.com" 
              value={form.email} 
              onChange={set('email')} 
              required 
              leftIcon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              }
            />
            
            <InputField 
              label="Password" 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••" 
              value={form.password} 
              onChange={set('password')}
              required
              labelRight={
                <Link to="/forgot-password" className="text-[#705E46] hover:text-[#422701] hover:underline transition-colors">Forgot password?</Link>
              }
              leftIcon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              }
              rightIcon={
                <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1} className="hover:text-[#422701] transition-colors focus:outline-none">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {showPassword ? (
                       <path d="M1 1l22 22M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    ) : (
                      <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle><line x1="3" y1="3" x2="21" y2="21"></line></>
                    )}
                  </svg>
                </button>
              }
            />

            <div className="flex items-center gap-3 mt-1">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-[#C6C0B9] text-[#422701] focus:ring-[#422701] accent-[#422701]" />
              <label htmlFor="remember" className="text-[13px] text-[#705E46] cursor-pointer">
                Remember me for 30 days
              </label>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#422701] text-white font-medium py-3.5 rounded-lg mt-2 hover:bg-[#705E46] transition-colors flex items-center justify-center gap-2">
              {loading ? 'Signing In...' : 'Sign In'}
              {!loading && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>}
            </button>
          </motion.form>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-[13px] text-[#705E46] mt-8"
          >
            Don't have an account? <Link to="/register" className="underline decoration-[#705E46] text-[#422701] font-medium hover:text-[#705E46] transition-colors">Create account</Link>
          </motion.p>
        </div>

      </motion.div>
    </motion.div>
  );
}
