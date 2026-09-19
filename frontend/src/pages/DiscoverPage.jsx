import React, { useState, useEffect, useCallback } from 'react';
import { recommendationsApi } from '../api';
import { SongCard } from '../components/SongCard';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  Disc3,
  Filter,
  Check
} from 'lucide-react';

const GENRES = ['All', 'Pop', 'Rock', 'Electronic', 'Hip-Hop', 'R&B', 'Indie', 'Jazz', 'Classical', 'Ambient', 'Latin', 'Metal', 'Folk'];
const MOODS = ['All', 'Upbeat', 'Energetic', 'Chill', 'Melancholic', 'Focus', 'Euphoric', 'Romantic', 'Dark'];

export const DiscoverPage = () => {
  const { showToast } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedMood, setSelectedMood] = useState('All');

  const fetchRecommendations = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = {
        top_k: 12,
        genre: selectedGenre !== 'All' ? selectedGenre : undefined,
        mood: selectedMood !== 'All' ? selectedMood : undefined,
      };

      const res = await recommendationsApi.getRecommendations(params);
      setRecommendations(res.items || []);
      if (isRefresh) {
        showToast('Fresh recommendations computed by ML engine!', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load recommendations. Please try again.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedGenre, selectedMood, showToast]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handleFeedbackChange = (songId, newFeedback) => {
    setRecommendations((prev) =>
      prev.map((r) => (r?.song?.song_id === songId ? { ...r, feedback: newFeedback } : r))
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Refresh Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Compass className="w-7 h-7 text-cyan-400" />
            <span>AI Discover & Recommendations</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time content-based ranking powered by your musical preferences and liked tracks.
          </p>
        </div>

        <button
          onClick={() => fetchRecommendations(true)}
          disabled={loading || refreshing}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 shadow-lg shadow-purple-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Computing Vectors...' : 'Refresh Feed'}</span>
        </button>
      </div>

      {/* Filter Chips Bar */}
      <div className="space-y-3 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Filter className="w-3.5 h-3.5" />
          <span>Genre Filter</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedGenre === genre
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 pt-2 border-t border-white/5">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Mood Filter</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {MOODS.map((mood) => (
            <button
              key={mood}
              onClick={() => setSelectedMood(mood)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedMood === mood
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations Feed */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <Disc3 className="w-10 h-10 text-cyan-400 animate-spin" />
          <p className="text-xs font-semibold text-slate-400">
            Vectorizing catalogue and ranking acoustic similarity...
          </p>
        </div>
      ) : recommendations.filter((item) => item?.song?.song_id).length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {recommendations.filter((item) => item?.song?.song_id).map((item) => (
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
        <div className="p-12 rounded-3xl bg-white/[0.02] border border-white/5 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">No Matching Songs Found</h3>
          <p className="text-xs text-slate-400">
            No tracks in our 120-song library match the current filters. Try resetting the genre or mood filters to broaden recommendations.
          </p>
          <button
            onClick={() => {
              setSelectedGenre('All');
              setSelectedMood('All');
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
