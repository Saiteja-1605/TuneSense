import apiClient from './client';

export const authApi = {
  register: (data) => apiClient.post('/api/auth/register', data).then(r => r.data),
  login: (data) => apiClient.post('/api/auth/login', data).then(r => r.data),
  getMe: () => apiClient.get('/api/auth/me').then(r => r.data),
};

export const songsApi = {
  getSongs: (params) => apiClient.get('/api/songs', { params }).then(r => r.data),
  getSongDetail: (id) => apiClient.get(`/api/songs/${id}`).then(r => r.data),
};

export const recommendationsApi = {
  getRecommendations: (params) => apiClient.get('/api/recommendations', { params }).then(r => r.data),
  submitFeedback: (song_id, feedback) => apiClient.post('/api/recommendations/feedback', { song_id, feedback }).then(r => r.data),
};

export const preferencesApi = {
  getPreferences: () => apiClient.get('/api/preferences').then(r => r.data),
  updatePreferences: (data) => apiClient.put('/api/preferences', data).then(r => r.data),
};

export const historyApi = {
  getHistory: (params) => apiClient.get('/api/history', { params }).then(r => r.data),
  deleteHistoryItem: (id) => apiClient.delete(`/api/history/${id}`).then(r => r.data),
  clearHistory: () => apiClient.delete('/api/history').then(r => r.data),
};

export const analyticsApi = {
  getAnalytics: () => apiClient.get('/api/analytics').then(r => r.data),
};

export const healthApi = {
  getHealth: () => apiClient.get('/api/health').then(r => r.data),
};
