import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Shuffle, CheckCircle, Disc3, User, Sparkles } from 'lucide-react';
import { artistsApi } from '../api';
import { usePlayer } from '../context/PlayerContext';
import { TrackRow } from '../components/TrackRow';

export const ArtistPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { playTrack } = usePlayer();

  useEffect(() => {
    setLoading(true);
    artistsApi
      .getArtistDetail(id)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.detail || 'Failed to load artist');
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
        <p className="text-sm font-semibold">{error || 'Artist not found.'}</p>
        <Link to="/search" className="mt-4 inline-block text-xs text-cyan-400 underline">
          Back to Search
        </Link>
      </div>
    );
  }

  const { artist, top_songs = [], albums = [], related_artists = [] } = data;

  const handlePlayTop = () => {
    if (top_songs.length > 0) {
      playTrack(top_songs[0], top_songs);
    }
  };

  const handleShufflePlay = () => {
    if (top_songs.length > 0) {
      const shuffled = [...top_songs].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0], shuffled);
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-950/70 via-indigo-950/50 to-slate-900/80 p-6 sm:p-10 border border-white/10 shadow-2xl flex flex-col md:flex-row items-center md:items-end gap-6 sm:gap-8">
        <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden shadow-2xl shrink-0 border-4 border-white/10 ring-4 ring-purple-500/20">
          <img
            src={
              artist.image ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60'
            }
            alt={artist.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 text-center md:text-left space-y-3">
          <div className="flex items-center justify-center md:justify-start gap-2 text-cyan-400 text-xs font-semibold">
            <CheckCircle className="w-4 h-4 fill-cyan-400 text-black" />
            <span>Verified Artist</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {artist.name}
          </h1>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            {artist.genres?.map((g) => (
              <span
                key={g}
                className="px-2.5 py-0.5 rounded-full bg-white/10 text-white text-xs font-medium border border-white/5"
              >
                {g}
              </span>
            ))}
            <span className="text-xs text-slate-400 font-mono">
              • Popularity {artist.popularity}/100
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            {artist.bio}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
            <button
              type="button"
              onClick={handlePlayTop}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-500/25 transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
              Play Top Tracks
            </button>
            <button
              type="button"
              onClick={handleShufflePlay}
              className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors"
            >
              <Shuffle className="w-4 h-4" />
              Shuffle
            </button>
          </div>
        </div>
      </div>

      {/* Popular Tracks */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          Popular Songs
        </h2>
        <div className="space-y-1">
          {top_songs.map((song, i) => (
            <TrackRow
              key={song.song_id}
              track={song}
              index={i}
              tracklist={top_songs}
            />
          ))}
        </div>
      </section>

      {/* Discography Albums */}
      {albums.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Disc3 className="w-5 h-5 text-purple-400" />
            Discography & Albums
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {albums.map((album) => (
              <Link
                key={album.album_id}
                to={`/albums/${album.album_id}`}
                className="group p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 transition-all flex flex-col"
              >
                <div className="aspect-square rounded-xl overflow-hidden mb-2.5 shadow-md bg-purple-950/40">
                  <img
                    src={album.cover}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <p className="text-xs font-semibold text-white truncate group-hover:text-cyan-300">
                  {album.title}
                </p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {album.release_date?.slice(0, 4)} • {album.genre}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Related Artists */}
      {related_artists.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" />
            Fans Also Like
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {related_artists.map((rel) => (
              <Link
                key={rel.artist_id}
                to={`/artists/${rel.artist_id}`}
                className="group p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 transition-all text-center flex flex-col items-center"
              >
                <div className="w-20 h-20 rounded-full overflow-hidden mb-2.5 shadow-md border-2 border-transparent group-hover:border-cyan-400 transition-all">
                  <img
                    src={rel.image}
                    alt={rel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <p className="text-xs font-bold text-white truncate w-full group-hover:text-cyan-300">
                  {rel.name}
                </p>
                <p className="text-[11px] text-slate-400 truncate w-full mt-0.5">
                  {rel.genres?.slice(0, 2).join(', ')}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
