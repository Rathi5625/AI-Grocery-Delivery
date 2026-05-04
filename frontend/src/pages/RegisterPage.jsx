import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import InputField from '../components/auth/InputField';
import { authPageVariants } from '../utils/animations';

export default function RegisterPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    try {
      await signup(form);
      toast.success('Account created successfully! 🎉');
      setTimeout(() => {
        navigate(`/verify-otp?email=${encodeURIComponent(form.email)}`);
      }, 2000);
    } catch (err) {
      const raw = err?.response?.data?.message || err?.userMessage || '';
      toast.error(raw || 'Something went wrong. Please try again.');
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
      custom={-1} // Slide in from left (-1)
      className="min-h-screen flex flex-col md:flex-row font-sans"
    >
      
      {/* LEFT PANEL */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full md:w-[45%] bg-[#422701] flex flex-col items-center justify-center py-20 px-10 order-1 md:order-none"
      >
        <div className="text-center flex flex-col items-center">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-bold text-[#D6B588] mb-4 tracking-tight"
          >
            FreshAI
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-[#D6B588] font-medium max-w-[280px] leading-snug"
          >
            Smart grocery shopping powered by AI
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-8 mt-16 text-[#D6B588]"
          >
            {/* Leaf */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66l.95-2.3c3.49-8.49 10.74-11.4 15.34-11.7l-5-5-5 5h5v0z"/></svg>
            {/* Fruit */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            {/* Delivery */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
          </motion.div>
        </div>
      </motion.div>

      {/* RIGHT PANEL */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full md:w-[55%] bg-[#f5f5f5] relative flex items-center justify-center p-8 md:p-16 order-2 md:order-none"
      >
        
        {/* FORM SECTION */}
        <div className="w-full max-w-[440px]">
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-[#422701] mb-2"
          >
            Create an account
          </motion.h2>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="text-[#422701] text-sm mb-10"
          >
            Begin your journey to mindless, mindful eating.
          </motion.p>

          <motion.form 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleSubmit} 
            className="flex flex-col gap-6"
          >
            <div className="flex gap-4">
              <InputField label="FIRST NAME" placeholder="Jane" value={form.firstName} onChange={set('firstName')} required />
              <InputField label="LAST NAME" placeholder="Doe" value={form.lastName} onChange={set('lastName')} required />
            </div>

            <InputField label="EMAIL ADDRESS" type="email" placeholder="jane@example.com" value={form.email} onChange={set('email')} required />
            
            <InputField 
              label="PASSWORD" 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••" 
              value={form.password} 
              onChange={set('password')}
              required
              icon={
                <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {showPassword ? (
                       <path d="M1 1l22 22M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    ) : (
                      <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></>
                    )}
                  </svg>
                </button>
              }
            />

            <InputField label="PHONE NUMBER" type="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={set('phone')} isOptional />

            <div className="flex items-start gap-3 mt-1">
              <input type="checkbox" id="terms" required className="w-4 h-4 mt-0.5 rounded border-[#C6C0B9] text-[#422701] focus:ring-[#422701]" />
              <label htmlFor="terms" className="text-xs text-[#705E46] leading-relaxed">
                I agree to the <a href="#" className="underline decoration-[#705E46]">Terms of Service</a> and <a href="#" className="underline decoration-[#705E46]">Privacy Policy</a>.
              </label>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#422701] text-white font-semibold py-4 rounded-xl mt-2 hover:bg-[#705E46] transition-colors flex items-center justify-center gap-2">
              {loading ? 'Creating...' : 'Create Account'}
              {!loading && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>}
            </button>
          </motion.form>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-xs text-[#705E46] mt-8"
          >
            Already have an account? <Link to="/login" className="underline decoration-[#705E46] text-[#422701] font-medium">Sign in</Link>
          </motion.p>
        </div>

      </motion.div>
    </motion.div>
  );
}
