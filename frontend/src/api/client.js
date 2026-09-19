import axios from 'axios';

let rawApiUrl = import.meta.env.VITE_API_URL || '';
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
      // Don't auto-redirect if checking auth status
      if (!error.config.url.includes('/api/auth/me')) {
        localStorage.removeItem('tunesense_token');
        localStorage.removeItem('tunesense_user');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
