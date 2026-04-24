import API from './axios';

/**
 * OTP API helpers
 *
 * POST /api/otp/send    — send verification OTP (initial send)
 * POST /api/otp/resend  — resend with new code (replaces old)
 * POST /api/otp/verify  — verify submitted code
 */

/** Send initial verification OTP to a registered email */
export const sendOtp = (email) =>
    API.post('/otp/send', { target: email });

/** Resend OTP (invalidates old, sends a fresh code) */
export const resendOtp = (email) =>
    API.post('/otp/resend', { email });

/** Verify a 6-digit OTP code */
export const verifyOtp = (otp, email) =>
    API.post('/otp/verify', { otp, email });
