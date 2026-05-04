import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../api/axios';
import OtpInput from '../components/auth/OtpInput';

const RESEND_COOLDOWN = 30;

export default function VerifyOtpPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email') || '';

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(30);
  const [verified, setVerified] = useState(false);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const otpCode = digits.join('');
  const isComplete = otpCode.length === 6;

  const friendlyError = useCallback((raw = '') => {
    if (raw.toLowerCase().includes('expired')) return 'OTP has expired. Please request a new one.';
    if (raw.toLowerCase().includes('too many') || raw.toLowerCase().includes('maximum')) return 'Too many attempts. Request a new OTP.';
    if (raw.toLowerCase().includes('invalid')) return 'Invalid OTP. Double-check the code.';
    if (raw.toLowerCase().includes('no active')) return 'No active OTP found. Request a new one.';
    return raw || 'Verification failed. Please try again.';
  }, []);

  const handleVerify = async (e) => {
    e?.preventDefault();
    if (!isComplete) { toast.error('Please enter all 6 digits'); return; }
    setLoading(true);
    try {
      await API.post('/otp/verify', { otp: otpCode, email });
      setVerified(true);
      toast.success('Email verified! 🎉');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const raw = err?.response?.data?.message || err?.userMessage || '';
      toast.error(friendlyError(raw));
      setDigits(['', '', '', '', '', '']);
    } finally { 
      setLoading(false); 
    }
  };

  const handleResend = async () => {
    if (!email) { toast.error('Email not found. Please register again.'); return; }
    if (cooldown > 0) return;
    setResendLoading(true);
    try {
      await API.post('/otp/resend', { email });
      toast.success('A new OTP has been sent!');
      setCooldown(RESEND_COOLDOWN);
      setDigits(['', '', '', '', '', '']);
    } catch (err) {
      const raw = err?.response?.data?.message || err?.userMessage || '';
      toast.error(raw || 'Failed to resend. Please try again.');
    } finally { 
      setResendLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-[#C6C0B9] flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[420px] overflow-hidden">
        
        {/* Decorative header strip */}
        <div className="h-32 w-full bg-gradient-to-br from-[#422701] via-[#5c3a10] to-[#705E46] relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.8) 2px, rgba(255,255,255,0.8) 4px)' }}></div>
        </div>

        <div className="px-8 pt-8 pb-10 flex flex-col items-center text-center">
          
          <h1 className="text-3xl font-bold text-[#422701] mb-2 tracking-tight">Verify your email</h1>
          <p className="text-[#705E46] text-sm mb-8">
            We sent a 6-digit code to your email.
          </p>

          <form onSubmit={handleVerify} className="w-full flex flex-col items-center">
            
            <div className="mb-8 w-full">
              <OtpInput 
                length={6} 
                value={digits} 
                onChange={setDigits} 
                disabled={loading || verified} 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading || !isComplete || verified}
              className="w-full bg-[#422701] text-white font-medium py-3.5 rounded-xl hover:bg-[#705E46] transition-colors disabled:opacity-70 disabled:hover:bg-[#422701] flex items-center justify-center gap-2 mb-8"
            >
              {loading ? 'Verifying...' : 'Verify'}
              {!loading && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>}
            </button>

            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-[#705E46] text-sm mb-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span>Resend OTP in {cooldown}s</span>
              </div>
              
              <button 
                type="button" 
                onClick={handleResend}
                disabled={cooldown > 0 || resendLoading || loading}
                className={`text-[11px] font-bold tracking-[0.1em] transition-colors ${cooldown > 0 ? 'text-[#C6C0B9] cursor-not-allowed' : 'text-[#D6B588] hover:text-[#422701]'}`}
              >
                {resendLoading ? 'SENDING...' : 'RESEND CODE'}
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
}
