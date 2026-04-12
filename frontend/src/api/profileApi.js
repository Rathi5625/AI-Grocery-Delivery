import API from './axios';

// ─── Profile ─────────────────────────────────────────────────────────────────
export const getProfile    = ()     => API.get('/user/profile');
export const updateProfile = (data) => API.patch('/user/profile', data);   // PATCH for non-OTP fields
export const updateProfileFull = (data) => API.put('/user/profile/update', data); // PUT for OTP-sensitive

// ─── OTP ─────────────────────────────────────────────────────────────────────
export const sendOtp   = (payload) => API.post('/user/send-otp',   payload);
export const verifyOtp = (payload) => API.post('/user/verify-otp', payload);

// ─── Addresses ───────────────────────────────────────────────────────────────
export const addAddress    = (data)     => API.post('/user/addresses',       data);
export const updateAddress = (id, data) => API.put(`/user/addresses/${id}`,  data);
export const deleteAddress = (id)       => API.delete(`/user/addresses/${id}`);
