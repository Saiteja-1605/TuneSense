import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './layouts/AppLayout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { healthApi } from './api';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OnboardingPage } from './pages/OnboardingPage';

import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { ArtistPage } from './pages/ArtistPage';
import { AlbumPage } from './pages/AlbumPage';
import { PlaylistPage } from './pages/PlaylistPage';
import { LibraryPage } from './pages/LibraryPage';
import { LikedSongsPage } from './pages/LikedSongsPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { CatalogPage } from './pages/CatalogPage';
import { SongDetailPage } from './pages/SongDetailPage';
import { PreferencesPage } from './pages/PreferencesPage';
import { HistoryPage } from './pages/HistoryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ProfilePage } from './pages/ProfilePage';

export function App() {
  // Proactively warm up backend service if container was spun down
  useEffect(() => {
    healthApi.getHealth().catch(() => {});
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <PlayerProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Onboarding Flow (Standalone Protected) */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />

            {/* Main Music App with Persistent Audio Player */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/home" element={<HomePage />} />
              <Route path="/dashboard" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/artists/:id" element={<ArtistPage />} />
              <Route path="/albums/:id" element={<AlbumPage />} />
              <Route path="/playlists/:id" element={<PlaylistPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/library/liked" element={<LikedSongsPage />} />
              <Route path="/discover" element={<DiscoverPage />} />
              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/songs/:id" element={<SongDetailPage />} />
              <Route path="/preferences" element={<PreferencesPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </PlayerProvider>
    </AuthProvider>
  </ErrorBoundary>
  );
}

export default App;

