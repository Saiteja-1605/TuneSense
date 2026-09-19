import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, Heart, PlusCircle, Volume2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { songsApi } from '../api';

function formatDuration(sec) {
  if (!sec) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export const TrackRow = ({
  track,
  index,
  tracklist = [],
  showAlbum = true,
  onRemove = null,
}) => {
  const { currentTrack, isPlaying, playTrack, togglePlay, openPlaylistModal } = usePlayer();
  const [isLiked, setIsLiked] = useState(false);
  const [likedChecked, setLikedChecked] = useState(false);

  const isCurrent = currentTrack?.song_id === track.song_id;
  const isCurrentPlaying = isCurrent && isPlaying;

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, tracklist.length > 0 ? tracklist : [track]);
    }
  };

  const handleLikeClick = async (e) => {
    e.stopPropagation();
    try {
      if (isLiked) {
        await songsApi.unlikeSong(track.song_id);
        setIsLiked(false);
      } else {
        await songsApi.likeSong(track.song_id);
        setIsLiked(true);
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  return (
    <div
      onClick={handlePlayClick}
      className={`group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer select-none ${
        isCurrent
          ? 'bg-purple-900/25 border border-purple-500/30'
          : 'hover:bg-white/5 border border-transparent'
      }`}
    >
      {/* Left: Index/Play + Artwork + Title + Artist */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div className="w-6 flex items-center justify-center shrink-0">
          {isCurrentPlaying ? (
            <div className="flex items-center gap-0.5">
              <span className="w-1 h-3 bg-cyan-400 animate-pulse rounded-full"></span>
              <span className="w-1 h-4 bg-purple-400 animate-pulse delay-75 rounded-full"></span>
              <span className="w-1 h-2 bg-indigo-400 animate-pulse delay-150 rounded-full"></span>
            </div>
          ) : (
            <>
              <span className="text-xs font-mono text-slate-500 group-hover:hidden">
                {index !== undefined ? index + 1 : ''}
              </span>
              <button
                type="button"
                className="hidden group-hover:flex items-center justify-center text-slate-200 hover:text-white"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
            </>
          )}
        </div>

        <img
          src={
            track.album_art ||
            'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=60'
          }
          alt={track.title}
          className="w-10 h-10 rounded-lg object-cover shrink-0 shadow-sm"
        />

        <div className="min-w-0 flex-1">
          <p
            className={`text-xs sm:text-sm font-medium truncate ${
              isCurrent ? 'text-cyan-300 font-semibold' : 'text-slate-200 group-hover:text-white'
            }`}
          >
            {track.title}
          </p>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 truncate">
            {track.artist_id ? (
              <Link
                to={`/artists/${track.artist_id}`}
                onClick={(e) => e.stopPropagation()}
                className="hover:text-cyan-400 transition-colors truncate"
              >
                {track.artist}
              </Link>
            ) : (
              <span className="truncate">{track.artist}</span>
            )}
            {track.genre && (
              <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.2 rounded bg-white/5 text-slate-400 border border-white/5">
                {track.genre}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Center: Album name (desktop only) */}
      {showAlbum && (
        <div className="hidden md:block flex-1 px-4 min-w-0">
          <p className="text-xs text-slate-400 truncate">
            {track.album_id ? (
              <Link
                to={`/albums/${track.album_id}`}
                onClick={(e) => e.stopPropagation()}
                className="hover:text-slate-200 transition-colors truncate"
              >
                {track.album}
              </Link>
            ) : (
              track.album || '-'
            )}
          </p>
        </div>
      )}

      {/* Right: Actions + Duration */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={handleLikeClick}
          title="Like"
          className={`p-1 rounded-full transition-colors ${
            isLiked
              ? 'text-pink-500'
              : 'text-slate-400 opacity-0 group-hover:opacity-100 hover:text-white'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openPlaylistModal(track);
          }}
          title="Add to Playlist"
          className="p-1 rounded-full text-slate-400 opacity-0 group-hover:opacity-100 hover:text-white transition-opacity"
        >
          <PlusCircle className="w-3.5 h-3.5" />
        </button>

        {onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(track.song_id);
            }}
            title="Remove from playlist"
            className="text-[11px] text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Remove
          </button>
        )}

        <span className="text-xs font-mono text-slate-400 w-10 text-right">
          {formatDuration(track.duration)}
        </span>
      </div>
    </div>
  );
};
