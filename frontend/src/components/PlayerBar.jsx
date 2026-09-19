import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  ListMusic,
  Heart,
  PlusCircle,
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { songsApi } from '../api';

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export const PlayerBar = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    queue,
    togglePlay,
    playNext,
    playPrevious,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeatMode,
    toggleQueueOpen,
    isQueueOpen,
    openPlaylistModal,
  } = usePlayer();

  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  // Sync liked state when track changes
  useEffect(() => {
    if (!currentTrack?.song_id) {
      setIsLiked(false);
      return;
    }
    let isSubscribed = true;
    songsApi
      .checkIsLiked(currentTrack.song_id)
      .then((res) => {
        if (isSubscribed) setIsLiked(Boolean(res?.is_liked));
      })
      .catch(() => {});

    return () => {
      isSubscribed = false;
    };
  }, [currentTrack?.song_id]);

  const handleToggleLike = async () => {
    if (!currentTrack?.song_id || isLiking) return;
    setIsLiking(true);
    try {
      if (isLiked) {
        await songsApi.unlikeSong(currentTrack.song_id);
        setIsLiked(false);
      } else {
        await songsApi.likeSong(currentTrack.song_id);
        setIsLiked(true);
      }
    } catch (err) {
      console.error('Like toggle error:', err);
    } finally {
      setIsLiking(false);
    }
  };

  if (!currentTrack) {
    return null;
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-[#0d0f1e]/95 backdrop-blur-2xl border-t border-white/10 px-4 py-2.5 shadow-2xl transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Track Information */}
        <div className="flex items-center gap-3.5 min-w-[180px] sm:min-w-[240px] max-w-[30%]">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-md bg-purple-950/40 border border-white/10 shrink-0 group">
            <img
              src={
                currentTrack.album_art ||
                'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=60'
              }
              alt={currentTrack.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-xs sm:text-sm font-semibold text-white truncate hover:underline cursor-pointer">
              {currentTrack.title}
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-400 truncate">
              {currentTrack.artist_id ? (
                <Link
                  to={`/artists/${currentTrack.artist_id}`}
                  className="hover:text-cyan-400 transition-colors"
                >
                  {currentTrack.artist}
                </Link>
              ) : (
                currentTrack.artist
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={handleToggleLike}
            disabled={isLiking}
            title={isLiked ? 'Unlike' : 'Like song'}
            className={`p-1.5 rounded-full transition-colors ${
              isLiked
                ? 'text-pink-500 hover:text-pink-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Heart
              className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`}
            />
          </button>
        </div>

        {/* Center: Playback Controls & Seek Bar */}
        <div className="flex-1 max-w-xl flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-3 sm:gap-5">
            <button
              type="button"
              onClick={toggleShuffle}
              title={isShuffle ? 'Shuffle enabled' : 'Shuffle disabled'}
              className={`p-1.5 rounded-full transition-colors ${
                isShuffle
                  ? 'text-cyan-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shuffle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <button
              type="button"
              onClick={playPrevious}
              title="Previous"
              className="text-slate-300 hover:text-white transition-colors p-1"
            >
              <SkipBack className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              title={isPlaying ? 'Pause' : 'Play'}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white flex items-center justify-center shadow-lg shadow-purple-500/25 transition-transform active:scale-95"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              ) : (
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={playNext}
              title="Next"
              className="text-slate-300 hover:text-white transition-colors p-1"
            >
              <SkipForward className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            </button>

            <button
              type="button"
              onClick={cycleRepeatMode}
              title={`Repeat: ${repeatMode}`}
              className={`p-1.5 rounded-full transition-colors ${
                repeatMode !== 'off'
                  ? 'text-cyan-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : (
                <Repeat className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </button>
          </div>

          {/* Seek progress bar */}
          <div className="w-full flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span className="w-9 text-right">{formatTime(currentTime)}</span>
            <div className="relative flex-1 group py-1 cursor-pointer">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime || 0}
                onChange={(e) => seekTo(Number(e.target.value))}
                className="w-full h-1 bg-white/15 rounded-lg appearance-none cursor-pointer accent-purple-400 group-hover:h-1.5 transition-all"
                style={{
                  background: `linear-gradient(to right, #a855f7 ${progressPercent}%, rgba(255,255,255,0.15) ${progressPercent}%)`,
                }}
              />
            </div>
            <span className="w-9">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Actions & Volume */}
        <div className="flex items-center justify-end gap-2.5 sm:gap-3.5 min-w-[140px] sm:min-w-[200px]">
          <button
            type="button"
            onClick={() => openPlaylistModal(currentTrack)}
            title="Add to Playlist"
            className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/5"
          >
            <PlusCircle className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleQueueOpen}
            title="Up Next Queue"
            className={`relative p-1.5 rounded-full transition-colors ${
              isQueueOpen
                ? 'text-cyan-400 bg-cyan-500/10'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ListMusic className="w-4 h-4" />
            {queue.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-purple-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                {queue.length}
              </span>
            )}
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMute}
              className="text-slate-400 hover:text-white transition-colors p-1"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-16 md:w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-400 hover:h-1.5 transition-all"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};
