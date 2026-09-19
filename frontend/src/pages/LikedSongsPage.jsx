import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Play, Shuffle, Clock, Music } from 'lucide-react';
import { libraryApi } from '../api';
import { usePlayer } from '../context/PlayerContext';
import { TrackRow } from '../components/TrackRow';

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m} min ${s > 0 ? `${s} sec` : ''}`;
}

export const LikedSongsPage = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { playTrack } = usePlayer();

  useEffect(() => {
    libraryApi
      .getLikedSongs()
      .then((res) => {
        setSongs(res.items || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.detail || 'Failed to load liked songs');
        setLoading(false);
      });
  }, []);

  const totalDurationSec = songs.reduce((acc, t) => acc + (t.duration || 0), 0);

  const handlePlayAll = () => {
    if (songs.length > 0) {
      playTrack(songs[0], songs);
    }
  };

  const handleShuffle = () => {
    if (songs.length > 0) {
      const shuffled = [...songs].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0], shuffled);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-800 via-pink-700 to-rose-600 p-6 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center md:items-end gap-6 sm:gap-8">
        <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shadow-2xl shrink-0 border border-white/20">
          <Heart className="w-24 h-24 text-white fill-white drop-shadow-md" />
        </div>

        <div className="flex-1 text-center md:text-left space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-pink-200">
            Playlist
          </p>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Liked Songs
          </h1>
          <p className="text-xs sm:text-sm text-pink-100 flex items-center justify-center md:justify-start gap-2">
            <span>{songs.length} songs</span>
            <span>•</span>
            <span className="flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5" />
              {formatDuration(totalDurationSec)}
            </span>
          </p>

          {songs.length > 0 && (
            <div className="pt-2 flex items-center justify-center md:justify-start gap-3">
              <button
                type="button"
                onClick={handlePlayAll}
                className="px-6 py-2.5 rounded-full bg-white text-black hover:bg-slate-100 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg transition-transform active:scale-95"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                Play Liked
              </button>
              <button
                type="button"
                onClick={handleShuffle}
                className="px-4 py-2.5 rounded-full bg-black/20 hover:bg-black/30 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors border border-white/20"
              >
                <Shuffle className="w-4 h-4" />
                Shuffle
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tracklist */}
      {songs.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-white/10 rounded-2xl p-8 space-y-3">
          <Heart className="w-12 h-12 mx-auto text-slate-600" />
          <p className="text-sm font-semibold text-white">Songs you like will appear here</p>
          <p className="text-xs text-slate-400">
            Save songs by tapping the heart icon on any track or player.
          </p>
          <Link
            to="/search"
            className="inline-block mt-2 px-4 py-2 rounded-xl bg-purple-600/30 text-purple-200 text-xs font-semibold hover:bg-purple-600/50 transition-colors"
          >
            Find Songs
          </Link>
        </div>
      ) : (
        <section className="space-y-2">
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-4">
              <span className="w-6 text-center">#</span>
              <span>Title</span>
            </div>
            <div className="flex items-center gap-4">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="space-y-1">
            {songs.map((song, i) => (
              <TrackRow
                key={song.song_id}
                track={song}
                index={i}
                tracklist={songs}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
