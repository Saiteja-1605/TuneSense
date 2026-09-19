import apiClient from './client';

export const authApi = {
  register: (data) => apiClient.post('/api/auth/register', data).then(r => r.data),
  login: (data) => apiClient.post('/api/auth/login', data).then(r => r.data),
  demo: () => apiClient.post('/api/auth/demo').then(r => r.data),
  getMe: () => apiClient.get('/api/auth/me').then(r => r.data),
};

export const homeApi = {
  getHomeFeed: () => apiClient.get('/api/home').then(r => r.data),
};

export const songsApi = {
  getSongs: (params) => apiClient.get('/api/songs', { params }).then(r => r.data),
  getSongDetail: (id) => apiClient.get(`/api/songs/${id}`).then(r => r.data),
  searchCatalog: (q, type = 'all', limit = 20) => apiClient.get('/api/songs/search', { params: { q, type, limit } }).then(r => r.data),
  likeSong: (id) => apiClient.post(`/api/songs/${id}/like`).then(r => r.data),
  unlikeSong: (id) => apiClient.delete(`/api/songs/${id}/like`).then(r => r.data),
  checkIsLiked: (id) => apiClient.get(`/api/songs/${id}/liked`).then(r => r.data),
};

export const artistsApi = {
  getArtists: (params) => apiClient.get('/api/artists', { params }).then(r => r.data),
  getArtistDetail: (id) => apiClient.get(`/api/artists/${id}`).then(r => r.data),
};

export const albumsApi = {
  getAlbums: (params) => apiClient.get('/api/albums', { params }).then(r => r.data),
  getAlbumDetail: (id) => apiClient.get(`/api/albums/${id}`).then(r => r.data),
};

export const playlistsApi = {
  getPlaylists: () => apiClient.get('/api/playlists').then(r => r.data),
  createPlaylist: (data) => apiClient.post('/api/playlists', data).then(r => r.data),
  getPlaylistDetail: (id) => apiClient.get(`/api/playlists/${id}`).then(r => r.data),
  updatePlaylist: (id, data) => apiClient.put(`/api/playlists/${id}`, data).then(r => r.data),
  deletePlaylist: (id) => apiClient.delete(`/api/playlists/${id}`).then(r => r.data),
  addSongToPlaylist: (id, song_id) => apiClient.post(`/api/playlists/${id}/songs`, { song_id }).then(r => r.data),
  removeSongFromPlaylist: (id, song_id) => apiClient.delete(`/api/playlists/${id}/songs/${song_id}`).then(r => r.data),
};

export const libraryApi = {
  getLibrarySummary: () => apiClient.get('/api/library').then(r => r.data),
  getLikedSongs: () => apiClient.get('/api/library/liked').then(r => r.data),
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
  getRecentlyPlayed: (limit = 20) => apiClient.get('/api/history/recently-played', { params: { limit } }).then(r => r.data),
  recordListening: (data) => apiClient.post('/api/history', data).then(r => r.data),
  deleteHistoryItem: (id) => apiClient.delete(`/api/history/${id}`).then(r => r.data),
  clearHistory: () => apiClient.delete('/api/history').then(r => r.data),
};

export const analyticsApi = {
  getAnalytics: () => apiClient.get('/api/analytics').then(r => r.data),
};

export const healthApi = {
  getHealth: () => apiClient.get('/api/health').then(r => r.data),
};

