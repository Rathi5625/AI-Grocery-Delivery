import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft, FiArrowRight, FiRotateCcw, FiCheckCircle } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }
    // Simple email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      // POST /api/auth/forgot-password
      await API.post('/auth/forgot-password', { email });
      localStorage.setItem('resetEmail', email);
      navigate('/reset-link-sent');
    } catch (err) {
      console.error(err);
      // Security standard: generic error unless network fails.
      if (err.response?.status >= 500) {
        setError('Something went wrong. Please try again later.');
      } else {
        // Treat 404/400 as success to prevent email enumeration
        localStorage.setItem('resetEmail', email);
        navigate('/reset-link-sent');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FAF7F2] font-sans">
      {/* Left Panel - Hidden on mobile */}
      <div className="hidden lg:flex w-[45%] bg-gradient-to-br from-[#3b352b] to-[#26231d] flex-col justify-between relative overflow-hidden">
        <div className="z-10 mt-32 text-center px-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 7.00018C20 4.00018 16 2.00018 12 2.00018C8 2.00018 4 4.00018 3 7.00018C2 10.0002 3 13.0002 5 15.0002C7 17.0002 10 18.0002 12 21.0002C14 18.0002 17 17.0002 19 15.0002C21 13.0002 22 10.0002 21 7.00018Z" fill="#D6B588"/>
              <path d="M12 22C12 22 12 18 12 12V5L12 2" stroke="#D6B588" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-white text-[2.5rem] font-bold tracking-tight">FreshAI</span>
          </div>
          <p className="text-[#EAE5DB] text-[1.3rem] max-w-sm mx-auto leading-snug tracking-wide">
            Smart grocery shopping powered by AI.
          </p>
        </div>
        
        <div className="absolute bottom-10 left-10 right-10 h-[45%] opacity-85 rounded-2xl overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1596484552834-8a58f4eb1011?q=80&w=800&auto=format&fit=crop" 
            alt="Fresh Vegetables" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-3xl p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#C6C0B9]/20"
        >
          (
            <>
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-[#F2ECE4] rounded-full flex items-center justify-center mx-auto mb-6 text-[#705E46]">
                  <FiRotateCcw size={24} />
                </div>
                <h2 className="text-[1.8rem] font-bold text-[#422701] mb-3 tracking-tight">Reset Password</h2>
                <p className="text-[#705E46] text-[0.9rem] leading-relaxed">
                  Enter the email associated with your account and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-[0.75rem] font-bold text-[#422701] mb-2 uppercase tracking-[0.1em]">
                    Email Address
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#705E46]" size={18} />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      placeholder="name@example.com"
                      className={`w-full bg-[#EAE5DB]/60 border ${error ? 'border-red-400 focus:ring-red-400' : 'border-[#EAE5DB]/60 focus:border-[#D6B588] focus:ring-1 focus:ring-[#D6B588]'} rounded-xl py-3.5 pl-11 pr-4 text-[#422701] placeholder:text-[#A89F91] transition-all outline-none font-medium`}
                    />
                  </div>
                  {error && <p className="text-red-500 text-[0.85rem] mt-2 font-medium">{error}</p>}
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#36322b] text-white font-bold py-4 rounded-xl hover:bg-[#4a4238] transition-colors shadow-md flex items-center justify-center gap-2 mb-8 disabled:opacity-70 disabled:cursor-not-allowed group text-[0.95rem]"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Send Reset Link
                      <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <div className="border-t border-[#C6C0B9]/20 pt-8 text-center">
                <Link to="/login" className="inline-flex items-center gap-2 text-[#705E46] hover:text-[#422701] font-bold text-[0.9rem] transition-colors">
                  <FiArrowLeft size={16} /> Back to Login
                </Link>
              </div>
            </>
          )
        </motion.div>
      </div>
    </div>
  );
}
