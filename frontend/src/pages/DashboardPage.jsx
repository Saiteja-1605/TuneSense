import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { recommendationsApi, analyticsApi, preferencesApi } from '../api';
import { StatCard } from '../components/StatCard';
import { SongCard } from '../components/SongCard';
import {
  Sparkles,
  Compass,
  Sliders,
  TrendingUp,
  Heart,
  Music,
  Disc3,
  ArrowRight
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [recRes, analyticsRes, prefRes] = await Promise.allSettled([
          recommendationsApi.getRecommendations({ top_k: 4 }),
          analyticsApi.getAnalytics(),
          preferencesApi.getPreferences(),
        ]);

        if (recRes.status === 'fulfilled') {
          setRecommendations(recRes.value.items || []);
        }
        if (analyticsRes.status === 'fulfilled') {
          setAnalytics(analyticsRes.value);
        }
        if (prefRes.status === 'fulfilled') {
          setPreferences(prefRes.value);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleFeedbackChange = (songId, newFeedback) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.song.song_id === songId ? { ...r, feedback: newFeedback } : r))
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Disc3 className="w-10 h-10 text-purple-500 animate-spin" />
        <p className="text-sm font-medium text-slate-400">Loading your personalized dashboard...</p>
      </div>
    );
  }

  const metrics = analytics?.metrics || {
    total_recommendations: 0,
    total_likes: 0,
    favorite_genre: 'Pop',
    average_match_score: 85,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-900/40 via-indigo-950/40 to-slate-900/60 border border-purple-500/20 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Personalized Recommendations Active</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name || 'Music Explorer'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              TuneSense has computed personalized tracks matching your taste in{' '}
              <strong className="text-purple-300">
                {preferences?.favorite_genres?.join(', ') || 'Pop & Electronic'}
              </strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/discover"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 shadow-lg shadow-purple-600/20 transition-all flex items-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>Explore AI Discover</span>
            </Link>
            <Link
              to="/preferences"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Taste Profile</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tracks Recommended"
          value={metrics.total_recommendations}
          subtitle="Indexed in history"
          icon={Music}
          color="purple"
        />
        <StatCard
          title="Songs Liked"
          value={metrics.total_likes}
          subtitle="Active taste refinement"
          icon={Heart}
          color="cyan"
        />
        <StatCard
          title="Top Genre Affinity"
          value={metrics.favorite_genre}
          subtitle="Dominant audio preference"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Avg. Match Score"
          value={`${metrics.average_match_score}%`}
          subtitle="Content similarity index"
          icon={Sparkles}
          color="amber"
        />
      </div>

      {/* Top Recommendations Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Top AI Recommendations</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Fresh
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Matched via TF-IDF semantics and audio feature similarity
            </p>
          </div>

          <Link
            to="/discover"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {recommendations.map((item) => (
              <SongCard
                key={item.song.song_id}
                song={item.song}
                score={item.recommendation_score}
                reason={item.reason}
                initialFeedback={item.feedback}
                onFeedbackChange={handleFeedbackChange}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-white/5 border border-white/5 text-center space-y-3">
            <Music className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-sm text-slate-400">No recommendations generated yet.</p>
            <Link
              to="/preferences"
              className="inline-block px-4 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-colors"
            >
              Configure Preferences
            </Link>
          </div>
        )}
      </div>

      {/* Preferences Pill Quick View */}
      {preferences && (
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Current Acoustic Fingerprint
            </span>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {preferences.favorite_genres?.map((g) => (
                <span
                  key={g}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20"
                >
                  {g}
                </span>
              ))}
              {preferences.favorite_moods?.map((m) => (
                <span
                  key={m}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                >
                  {m}
                </span>
              ))}
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium text-slate-400 bg-white/5">
                Target Energy: {Math.round(preferences.energy * 100)}%
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium text-slate-400 bg-white/5">
                Target Dance: {Math.round(preferences.danceability * 100)}%
              </span>
            </div>
          </div>

          <Link
            to="/preferences"
            className="self-start sm:self-center px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all shrink-0"
          >
            Edit Tastes
          </Link>
        </div>
      )}
    </div>
  );
};
