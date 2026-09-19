import axios from 'axios';

let rawApiUrl = import.meta.env.VITE_API_URL || '';
if (!rawApiUrl && typeof window !== 'undefined') {
  const host = window.location.hostname;
  if (host !== 'localhost' && host !== '127.0.0.1') {
    rawApiUrl = 'https://tunesense-backend.onrender.com';
  }
}

if (rawApiUrl) {
  rawApiUrl = rawApiUrl.trim();
  if (rawApiUrl.endsWith('/')) {
    rawApiUrl = rawApiUrl.slice(0, -1);
  }
  if (!rawApiUrl.startsWith('http://') && !rawApiUrl.startsWith('https://')) {
    rawApiUrl = `https://${rawApiUrl}`;
  }
}
const apiBaseUrl = rawApiUrl;

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 45000, // 45 seconds to accommodate Render free-tier cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tunesense_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || '';
      // Only clear credentials if this is an expired session on an authenticated request,
      // NOT a failed login attempt on /api/auth/login or /api/auth/register
      const isAuthAttempt = url.includes('/api/auth/login') || url.includes('/api/auth/register') || url.includes('/api/auth/demo');
      if (!isAuthAttempt) {
        localStorage.removeItem('tunesense_token');
        localStorage.removeItem('tunesense_user');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
