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

// ── Silent Token Refresh State ───────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ── Response: unwrap ApiResponse<T> envelope + auto-refresh ──
API.interceptors.response.use(
  (response) => {
    // If the backend returned an ApiResponse envelope, unwrap it
    if (response.data && 'success' in response.data && 'data' in response.data) {
      return { ...response, data: response.data.data, message: response.data.message };
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('refreshToken');

      // No refresh token available → go to login
      if (!refreshToken) {
        forceLogout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue this request until the refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return API(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call the refresh endpoint directly (no auth needed)
        const res = await axios.post('http://localhost:8080/api/auth/refresh', {
          refreshToken,
        });

        // Unwrap the ApiResponse envelope
        const payload = res.data?.data ?? res.data;
        const newToken = payload?.accessToken;

        if (!newToken) throw new Error('No access token in refresh response');

        localStorage.setItem('token', newToken);

        // Update the default header for future requests
        API.defaults.headers.common.Authorization = `Bearer ${newToken}`;

        processQueue(null, newToken);

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return API(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        forceLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Attach a friendly message so callers can use err.userMessage
    const msg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';
    error.userMessage = msg;

    // NOTE: We do NOT show a global toast here — each page/component
    // handles its own error toasts to avoid duplicate messages.
    return Promise.reject(error);
  }
);

function forceLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  // Only redirect if not already on auth pages
  if (
    !window.location.pathname.startsWith('/login') &&
    !window.location.pathname.startsWith('/register') &&
    !window.location.pathname.startsWith('/forgot-password') &&
    !window.location.pathname.startsWith('/reset-link-sent')
  ) {
    import('react-hot-toast').then(({ default: toast }) => {
      toast.error('Session expired. Please sign in again.');
    });
    window.location.href = '/login';
  }
}

export default API;
