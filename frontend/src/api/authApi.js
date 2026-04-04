import API from './axios';

// ── Auth ─────────────────────────────────────────────────────
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const refreshToken = (refreshToken) =>
  API.post('/auth/refresh', { refreshToken });

// ── Forgot Password (3-step unauthenticated flow) ────────────
/** Step 1: Request OTP — always returns success regardless of email existence */
export const forgotPasswordRequest = (email) =>
  API.post('/auth/forgot-password/request', { email });

/** Step 2: Verify OTP — returns { valid: true } if code matches */
export const forgotPasswordVerify = (email, otpCode) =>
  API.post('/auth/forgot-password/verify', { email, otpCode });

/** Step 3: Reset password — needs valid OTP and new password */
export const forgotPasswordReset = (email, otpCode, newPassword) =>
  API.post('/auth/forgot-password/reset', { email, otpCode, newPassword });
