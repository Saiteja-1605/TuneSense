import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL || '';

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
