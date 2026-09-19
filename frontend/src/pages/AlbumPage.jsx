import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Shuffle, Disc3, Clock } from 'lucide-react';
import { albumsApi } from '../api';
import { usePlayer } from '../context/PlayerContext';
import { TrackRow } from '../components/TrackRow';

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m} min ${s > 0 ? `${s} sec` : ''}`;
}

export const AlbumPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { playTrack } = usePlayer();

  useEffect(() => {
    setLoading(true);
    albumsApi
      .getAlbumDetail(id)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.detail || 'Failed to load album');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-rose-400">
        <p className="text-sm font-semibold">{error || 'Album not found.'}</p>
        <Link to="/catalog" className="mt-4 inline-block text-xs text-cyan-400 underline">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const { album, tracks = [] } = data;
  const totalDurationSec = tracks.reduce((acc, t) => acc + (t.duration || 0), 0);

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks);
    }
  };

  const handleShuffle = () => {
    if (tracks.length > 0) {
      const shuffled = [...tracks].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0], shuffled);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-950/70 via-indigo-950/50 to-slate-900/80 p-6 sm:p-10 border border-white/10 shadow-2xl flex flex-col md:flex-row items-center md:items-end gap-6 sm:gap-8">
        <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden shadow-2xl shrink-0 border border-white/10">
          <img
            src={album.cover}
            alt={album.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 text-center md:text-left space-y-3">
          <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold uppercase tracking-wider text-purple-300">
            <Disc3 className="w-4 h-4 text-purple-400" />
            <span>Album</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            {album.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs sm:text-sm text-slate-300">
            <Link
              to={`/artists/${album.artist_id}`}
              className="font-bold text-white hover:text-cyan-400 hover:underline transition-colors"
            >
              {album.artist}
            </Link>
            <span>•</span>
            <span>{album.release_date?.slice(0, 4)}</span>
            <span>•</span>
            <span>{tracks.length} songs</span>
            <span>•</span>
            <span className="flex items-center gap-1 font-mono text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              {formatDuration(totalDurationSec)}
            </span>
          </div>

          <div className="pt-2 flex items-center justify-center md:justify-start gap-3">
            <button
              type="button"
              onClick={handlePlayAll}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-500/25 transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
              Play Album
            </button>
            <button
              type="button"
              onClick={handleShuffle}
              className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors"
            >
              <Shuffle className="w-4 h-4" />
              Shuffle
            </button>
          </div>
        </div>
      </div>

      {/* Tracklist */}
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
          {tracks.map((song, i) => (
            <TrackRow
              key={song.song_id}
              track={song}
              index={i}
              tracklist={tracks}
              showAlbum={false}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
