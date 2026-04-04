import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Request: attach JWT ──────────────────────────────────────
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response: unwrap ApiResponse<T> envelope ─────────────────
// Backend always returns: { success, message, data, timestamp }
// We unwrap so consumers can do `res.data` and get the actual payload.
API.interceptors.response.use(
  (response) => {
    // If the backend returned an ApiResponse envelope, unwrap it
    if (response.data && 'success' in response.data && 'data' in response.data) {
      return { ...response, data: response.data.data, message: response.data.message };
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      // Only redirect if not already on auth pages
      if (!window.location.pathname.startsWith('/login') &&
          !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    // Extract backend error message if available
    const msg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';
    error.userMessage = msg;
    return Promise.reject(error);
  }
);

export default API;
