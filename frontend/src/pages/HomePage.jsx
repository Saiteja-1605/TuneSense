import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Sparkles,
  TrendingUp,
  Radio,
  Flame,
  User,
  Disc3,
  Heart,
  Music,
} from 'lucide-react';
import { homeApi } from '../api';
import { usePlayer } from '../context/PlayerContext';
import { TrackRow } from '../components/TrackRow';

export const HomePage = () => {
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { playTrack } = usePlayer();

  useEffect(() => {
    let isMounted = true;
    homeApi
      .getHomeFeed()
      .then((data) => {
        if (isMounted) {
          setHomeData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.response?.data?.detail || 'Failed to load home feed');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-mono">Tuning your personalized stream...</p>
        </div>
      </div>
    );
  }

  if (error || !homeData) {
    return (
      <div className="p-8 text-center text-rose-400">
        <p className="text-sm font-semibold">{error || 'Unable to load feed.'}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs rounded-xl transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const {
    greeting,
    recently_played = [],
    made_for_you = [],
    because_you_liked = [],
    mood_mixes = [],
    trending = [],
    featured_artists = [],
    popular_albums = [],
  } = homeData;

  // Quick picks from recently played or made for you
  const quickPicks = (recently_played.length > 0 ? recently_played : made_for_you.map((m) => m.song)).slice(0, 6);

  return (
    <div className="space-y-10 pb-16">
      {/* Top Welcome Banner */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-1">
          {greeting}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Discover music that understands your taste. Real streaming, powered by ML.
        </p>
      </div>

      {/* Quick Picks 6-Tile Grid */}
      {quickPicks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickPicks.map((track) => (
            <div
              key={track.song_id}
              onClick={() => playTrack(track, quickPicks)}
              className="group flex items-center gap-3.5 p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 transition-all cursor-pointer shadow-sm relative overflow-hidden"
            >
              <img
                src={
                  track.album_art ||
                  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=60'
                }
                alt={track.title}
                className="w-14 h-14 rounded-lg object-cover shadow"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-white truncate">
                  {track.title}
                </p>
                <p className="text-[11px] text-slate-400 truncate">{track.artist}</p>
              </div>
              <button
                type="button"
                className="w-9 h-9 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-lg shadow-cyan-400/30 opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100 mr-2"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Made For You (AI Recommendations) */}
      {made_for_you.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Made For You</h2>
                <p className="text-xs text-slate-400">
                  Acoustic & genre recommendations personalized for your taste profile
                </p>
              </div>
            </div>
            <Link
              to="/discover"
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Explore AI
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {made_for_you.map(({ song, score, reason }) => (
              <div
                key={song.song_id}
                onClick={() => playTrack(song, made_for_you.map((m) => m.song))}
                className="group p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 transition-all cursor-pointer relative flex flex-col"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-purple-950/40">
                  <img
                    src={
                      song.album_art ||
                      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=60'
                    }
                    alt={song.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-cyan-300 border border-cyan-400/20">
                    {Math.round(score)}% match
                  </div>
                  <button
                    type="button"
                    className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-lg shadow-cyan-400/30 opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100"
                  >
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </button>
                </div>

                <p className="text-xs font-semibold text-white truncate">{song.title}</p>
                <p className="text-[11px] text-slate-400 truncate mb-1.5">{song.artist}</p>
                <p className="text-[10px] text-slate-500 line-clamp-2 mt-auto leading-relaxed">
                  {reason}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Because You Liked */}
      {because_you_liked.length > 0 && (
        <section className="space-y-6">
          {because_you_liked.map((byl) => (
            <div key={byl.liked_song_id} className="space-y-3">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-400 fill-current" />
                <h3 className="text-sm font-bold text-white">
                  Because you liked <span className="text-cyan-300">"{byl.liked_title}"</span>
                </h3>
              </div>

              <div className="space-y-1">
                {byl.similar_songs.slice(0, 4).map((track, i) => (
                  <TrackRow
                    key={track.song_id}
                    track={track}
                    index={i}
                    tracklist={byl.similar_songs}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Mood Mixes / Sonic Stations */}
      {mood_mixes.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-purple-400" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Mood Stations</h2>
              <p className="text-xs text-slate-400">Curated acoustic streams for every vibe</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {mood_mixes.map((mix) => (
              <div
                key={mix.mood}
                onClick={() => {
                  if (mix.songs.length > 0) playTrack(mix.songs[0], mix.songs);
                }}
                className="group p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 to-slate-900/60 border border-purple-500/20 hover:border-purple-400/40 transition-all cursor-pointer flex flex-col justify-between min-h-[140px] shadow-sm relative overflow-hidden"
              >
                <div className="space-y-1 z-10">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                    {mix.mood}
                  </span>
                  <p className="text-[11px] text-slate-400 leading-snug">{mix.description}</p>
                </div>

                <div className="flex items-center justify-between z-10 pt-4">
                  <span className="text-[10px] font-mono text-slate-500">
                    {mix.songs.length} tracks
                  </span>
                  <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center shadow group-hover:scale-110 transition-transform">
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Ambient glow behind */}
                <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-purple-600/10 blur-xl group-hover:bg-purple-600/20 transition-all"></div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Trending Tracks */}
      {trending.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Trending on TuneSense</h2>
                <p className="text-xs text-slate-400">Most played tracks across the platform</p>
              </div>
            </div>
            <Link
              to="/catalog"
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Browse Catalog
            </Link>
          </div>

          <div className="space-y-1">
            {trending.slice(0, 6).map((track, i) => (
              <TrackRow
                key={track.song_id}
                track={track}
                index={i}
                tracklist={trending}
              />
            ))}
          </div>
        </section>
      )}

      {/* Featured Artists */}
      {featured_artists.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Featured Artists</h2>
              <p className="text-xs text-slate-400">Spotlight creators across genres</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {featured_artists.map((artist) => (
              <Link
                key={artist.artist_id}
                to={`/artists/${artist.artist_id}`}
                className="group p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 transition-all text-center flex flex-col items-center"
              >
                <div className="w-24 h-24 rounded-full overflow-hidden mb-3 shadow-md border-2 border-transparent group-hover:border-purple-400/50 transition-all">
                  <img
                    src={
                      artist.image ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=60'
                    }
                    alt={artist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <p className="text-xs font-bold text-white truncate w-full group-hover:text-cyan-300 transition-colors">
                  {artist.name}
                </p>
                <p className="text-[11px] text-slate-400 truncate w-full mt-0.5">
                  {artist.genres?.slice(0, 2).join(', ') || 'Artist'}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Popular Albums */}
      {popular_albums.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Disc3 className="w-5 h-5 text-pink-400" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Popular Albums</h2>
              <p className="text-xs text-slate-400">Complete records and discography releases</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {popular_albums.map((album) => (
              <Link
                key={album.album_id}
                to={`/albums/${album.album_id}`}
                className="group p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 transition-all flex flex-col"
              >
                <div className="aspect-square rounded-xl overflow-hidden mb-2.5 shadow-md bg-purple-950/40">
                  <img
                    src={
                      album.cover ||
                      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=60'
                    }
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <p className="text-xs font-semibold text-white truncate group-hover:text-cyan-300 transition-colors">
                  {album.title}
                </p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {album.artist} • {album.release_date?.slice(0, 4) || 'Album'}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
