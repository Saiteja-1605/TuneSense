import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, ThumbsUp, ThumbsDown, Sparkles, ExternalLink, Compass } from 'lucide-react';
import { recommendationsApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';

// Color themes based on genre
const GENRE_GRADIENTS = {
  Pop: 'from-pink-500/20 via-purple-500/20 to-indigo-500/20 border-pink-500/30',
  Rock: 'from-amber-600/20 via-red-600/20 to-orange-500/20 border-red-500/30',
  Electronic: 'from-cyan-500/20 via-blue-600/20 to-indigo-600/20 border-cyan-500/30',
  'Hip-Hop': 'from-yellow-500/20 via-amber-600/20 to-stone-700/20 border-yellow-500/30',
  'R&B': 'from-purple-600/20 via-violet-700/20 to-pink-600/20 border-purple-500/30',
  Indie: 'from-teal-500/20 via-emerald-600/20 to-cyan-700/20 border-teal-500/30',
  Jazz: 'from-amber-700/20 via-yellow-800/20 to-stone-800/20 border-amber-600/30',
  Classical: 'from-blue-700/20 via-indigo-900/20 to-slate-800/20 border-blue-500/30',
  Ambient: 'from-indigo-600/20 via-sky-800/20 to-cyan-900/20 border-sky-500/30',
  Latin: 'from-orange-500/20 via-rose-600/20 to-red-600/20 border-rose-500/30',
  Metal: 'from-stone-800/40 via-red-950/40 to-black/40 border-stone-600/30',
  Folk: 'from-emerald-700/20 via-amber-800/20 to-stone-700/20 border-emerald-600/30',
};

export const SongCard = ({
  song,
  score,
  reason,
  initialFeedback = null,
  onFeedbackChange,
  showFullDetails = false,
}) => {
  const { showToast } = useAuth();
  const { currentTrack, isPlaying: isGlobalPlaying, playTrack, togglePlay } = usePlayer();
  const [feedback, setFeedback] = useState(initialFeedback);
  const [submitting, setSubmitting] = useState(false);

  if (!song) return null;

  const isCurrent = currentTrack?.song_id === song.song_id;
  const isAudioPlaying = isCurrent && isGlobalPlaying;

  const handlePlayClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(song);
    }
  };


  if (!song) return null;

  const handleFeedback = async (type) => {
    if (submitting) return;
    const newFeedback = feedback === type ? 'none' : type;
    setFeedback(newFeedback);
    setSubmitting(true);
    try {
      await recommendationsApi.submitFeedback(song.song_id, newFeedback);
      if (newFeedback === 'like') {
        showToast(`Liked "${song.title}"! We'll recommend more like this.`, 'success');
      } else if (newFeedback === 'dislike') {
        showToast(`Disliked "${song.title}". We will exclude it from future recommendations.`, 'info');
      } else {
        showToast('Feedback removed.', 'info');
      }
      if (onFeedbackChange) {
        onFeedbackChange(song.song_id, newFeedback);
      }
    } catch (err) {
      console.error(err);
      setFeedback(feedback); // Revert
      showToast('Could not save feedback.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const gradientClass = GENRE_GRADIENTS[song.genre] || 'from-purple-900/20 via-slate-800/20 to-indigo-950/20 border-white/10';

  return (
    <div className={`glass-card rounded-2xl p-5 border flex flex-col justify-between group relative overflow-hidden ${gradientClass}`}>
      {/* Top Header: Genre Tag & Match Score */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-white/10 text-white/90 border border-white/10">
              {song.genre}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
              {song.mood}
            </span>
          </div>

          {score !== undefined && (
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 text-cyan-300 font-mono text-xs font-bold shadow-sm">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              {Math.round(score)}% Match
            </div>
          )}
        </div>

        {/* Song Info & Preview Button */}
        <div className="flex items-start gap-3.5 mb-3">
          {/* Music Player Cover & Action */}
          <button
            type="button"
            onClick={handlePlayClick}
            title={isAudioPlaying ? 'Pause audio stream' : 'Play streaming audio'}
            className="w-12 h-12 rounded-xl bg-purple-950 p-0.5 flex-shrink-0 shadow-md group-hover:scale-105 transition-transform relative overflow-hidden border border-white/10"
          >
            {song.album_art ? (
              <img
                src={song.album_art}
                alt={song.title}
                className="w-full h-full object-cover rounded-[10px]"
              />
            ) : null}
            <div
              className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                isAudioPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
            >
              {isAudioPlaying ? (
                <div className="flex items-end gap-0.5 h-4">
                  <span className="w-1 bg-cyan-400 rounded-full animate-pulse h-3" />
                  <span className="w-1 bg-purple-400 rounded-full animate-pulse h-4" />
                  <span className="w-1 bg-pink-400 rounded-full animate-pulse h-2" />
                </div>
              ) : (
                <Play className="w-4 h-4 text-white fill-white ml-0.5" />
              )}
            </div>
          </button>


          <div className="min-w-0 flex-1">
            <Link
              to={`/songs/${song.song_id}`}
              className="text-base font-bold text-white hover:text-cyan-300 transition-colors truncate block group-hover:underline"
            >
              {song.title}
            </Link>
            <p className="text-xs text-slate-300 font-medium truncate">{song.artist}</p>
            <p className="text-[11px] text-slate-500 truncate">{song.album}</p>
          </div>
        </div>

        {/* Explainability Section */}
        {reason && (
          <div className="mb-4 p-2.5 rounded-xl bg-black/30 border border-white/5 text-[11px] text-purple-200/90 leading-relaxed">
            <span className="font-semibold text-cyan-300">Why recommended: </span>
            {reason}
          </div>
        )}
      </div>

      {/* Footer: Like/Dislike Feedback & Detail Link */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs mt-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleFeedback('like')}
            disabled={submitting}
            title="Like this recommendation"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${
              feedback === 'like'
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${feedback === 'like' ? 'fill-emerald-400 text-emerald-400' : ''}`} />
            <span className="text-[11px] font-semibold">{feedback === 'like' ? 'Liked' : 'Like'}</span>
          </button>

          <button
            onClick={() => handleFeedback('dislike')}
            disabled={submitting}
            title="Dislike - do not recommend again"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${
              feedback === 'dislike'
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                : 'bg-white/5 border-white/5 text-slate-400 hover:text-rose-300 hover:bg-white/10'
            }`}
          >
            <ThumbsDown className={`w-3.5 h-3.5 ${feedback === 'dislike' ? 'fill-rose-400 text-rose-400' : ''}`} />
            <span className="text-[11px] font-semibold">{feedback === 'dislike' ? 'Disliked' : 'Dislike'}</span>
          </button>
        </div>

        <Link
          to={`/songs/${song.song_id}`}
          className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-cyan-300 transition-colors"
        >
          Details
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};
