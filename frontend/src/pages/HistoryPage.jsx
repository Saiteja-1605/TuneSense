import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { historyApi } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  History,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Search,
  ExternalLink,
  Disc3,
  Calendar
} from 'lucide-react';

export const HistoryPage = () => {
  const { showToast } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackFilter, setFeedbackFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await historyApi.getHistory({
        limit: 100,
        feedback: feedbackFilter !== 'All' ? feedbackFilter.toLowerCase() : undefined,
      });
      setHistory(res.items || []);
    } catch (err) {
      console.error(err);
      showToast('Could not fetch recommendation history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [feedbackFilter]);

  const handleDeleteItem = async (id) => {
    try {
      await historyApi.deleteHistoryItem(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
      showToast('History item removed.', 'info');
    } catch (err) {
      console.error(err);
      showToast('Failed to delete item.', 'error');
    }
  };

  const filteredHistory = history.filter((item) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const song = item.song;
    return (
      song?.title?.toLowerCase().includes(term) ||
      song?.artist?.toLowerCase().includes(term) ||
      song?.genre?.toLowerCase().includes(term) ||
      item.reason?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <History className="w-7 h-7 text-purple-400" />
            <span>Recommendation History</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            A chronological timeline of tracks recommended to you and your feedback.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['All', 'Like', 'Dislike'].map((f) => (
            <button
              key={f}
              onClick={() => setFeedbackFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                feedbackFilter === f
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {f === 'All' ? 'All Feedback' : f === 'Like' ? 'Liked Only' : 'Disliked Only'}
            </button>
          ))}
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter history by song title, artist, or genre..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
        />
      </div>

      {/* History Items Feed */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[35vh] gap-3">
          <Disc3 className="w-8 h-8 text-purple-500 animate-spin" />
          <p className="text-xs text-slate-400">Loading history log...</p>
        </div>
      ) : filteredHistory.length > 0 ? (
        <div className="space-y-3">
          {filteredHistory.map((item) => {
            const song = item.song;
            return (
              <div
                key={item.id}
                className="glass-card p-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0 text-cyan-300 font-mono text-xs font-bold">
                    {Math.round(item.recommendation_score)}%
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {song ? (
                        <Link
                          to={`/songs/${song.song_id}`}
                          className="text-sm font-bold text-white hover:text-cyan-300 transition-colors truncate"
                        >
                          {song.title}
                        </Link>
                      ) : (
                        <span className="text-sm font-bold text-white">Track #{item.song_id}</span>
                      )}
                      {song?.genre && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/5 text-slate-300">
                          {song.genre}
                        </span>
                      )}
                      {item.feedback === 'like' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          <ThumbsUp className="w-3 h-3 fill-emerald-400" /> Liked
                        </span>
                      )}
                      {item.feedback === 'dislike' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                          <ThumbsDown className="w-3 h-3 fill-rose-400" /> Disliked
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 truncate">
                      {song?.artist || 'Unknown Artist'} • {song?.album || 'Single'}
                    </p>

                    <p className="text-[11px] text-purple-300/80 mt-1 line-clamp-1">
                      {item.reason}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 border-white/5 w-full sm:w-auto">
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                    <Calendar className="w-3 h-3" />
                    <span>{item.created_at ? item.created_at.slice(0, 10) : 'Recent'}</span>
                  </div>

                  {song && (
                    <Link
                      to={`/songs/${song.song_id}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                      title="View Details"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  )}

                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Remove from history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center text-slate-400 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
          <History className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-sm">No recommendation history found.</p>
          <Link
            to="/discover"
            className="inline-block px-4 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500"
          >
            Explore Recommendations
          </Link>
        </div>
      )}
    </div>
  );
};
