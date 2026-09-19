import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, X, Music, User, Disc3, Sparkles } from 'lucide-react';
import { songsApi } from '../api';
import { TrackRow } from '../components/TrackRow';
import { usePlayer } from '../context/PlayerContext';

const browseCategories = [
  { name: 'Pop & Upbeat', color: 'from-pink-600 to-rose-700', genre: 'Pop', mood: 'Upbeat' },
  { name: 'Lo-Fi & Chill', color: 'from-purple-600 to-indigo-800', genre: 'Lo-Fi', mood: 'Chill' },
  { name: 'Electronic & Synth', color: 'from-cyan-600 to-blue-800', genre: 'Electronic', mood: 'Energetic' },
  { name: 'Rock & Indie', color: 'from-amber-600 to-orange-800', genre: 'Rock', mood: 'Intense' },
  { name: 'R&B & Soul', color: 'from-rose-600 to-purple-800', genre: 'R&B', mood: 'Romantic' },
  { name: 'Ambient & Focus', color: 'from-teal-600 to-emerald-800', genre: 'Ambient', mood: 'Focus' },
  { name: 'Classical & Piano', color: 'from-indigo-600 to-slate-800', genre: 'Classical', mood: 'Calm' },
  { name: 'Melancholic Late Night', color: 'from-blue-700 to-slate-900', genre: 'Indie', mood: 'Melancholic' },
];

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState('all'); // all, songs, artists, albums
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const { playTrack } = usePlayer();

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      songsApi
        .searchCatalog(query.trim(), activeTab)
        .then((res) => {
          setResults(res);
        })
        .catch((err) => {
          console.error('Search error:', err);
        })
        .finally(() => setLoading(false));
    }, 280);

    return () => clearTimeout(timer);
  }, [query, activeTab]);

  const handleClear = () => {
    setQuery('');
    setSearchParams({});
    setResults(null);
  };

  const handleCategoryClick = (cat) => {
    setQuery(cat.genre);
    setSearchParams({ q: cat.genre });
  };

  const songs = results?.songs || [];
  const artists = results?.artists || [];
  const albums = results?.albums || [];
  const totalMatches = results?.total_matches || 0;

  return (
    <div className="space-y-8 pb-16">
      {/* Search Input Bar */}
      <div className="relative max-w-2xl">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="What do you want to listen to? (Songs, artists, albums, moods...)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSearchParams(e.target.value ? { q: e.target.value } : {});
          }}
          autoFocus
          className="w-full bg-[#121528] border border-white/10 rounded-2xl pl-12 pr-10 py-3.5 text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all shadow-inner"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tabs Filter */}
      {query.trim() && (
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          {[
            { id: 'all', label: 'All Results' },
            { id: 'songs', label: `Songs (${songs.length})` },
            { id: 'artists', label: `Artists (${artists.length})` },
            { id: 'albums', label: `Albums (${albums.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-400 text-black shadow-md shadow-cyan-400/20'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="py-12 flex justify-center items-center gap-3">
          <div className="w-6 h-6 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin"></div>
          <span className="text-xs text-slate-400 font-mono">Searching catalog...</span>
        </div>
      )}

      {/* Empty Query: Browse Categories Grid */}
      {!query.trim() && !loading && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Explore Musical Vibes
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {browseCategories.map((cat) => (
              <div
                key={cat.name}
                onClick={() => handleCategoryClick(cat)}
                className={`group h-32 p-4 rounded-2xl bg-gradient-to-br ${cat.color} hover:scale-[1.02] transition-all cursor-pointer shadow-lg relative overflow-hidden flex flex-col justify-between`}
              >
                <h3 className="font-extrabold text-white text-base leading-tight drop-shadow-sm">
                  {cat.name}
                </h3>
                <div className="flex items-center gap-2 text-[11px] text-white/80 font-medium">
                  <span>{cat.genre}</span>
                  <span>•</span>
                  <span>{cat.mood}</span>
                </div>
                <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-white/10 group-hover:scale-125 transition-transform"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results found */}
      {query.trim() && !loading && totalMatches === 0 && (
        <div className="py-16 text-center text-slate-400 space-y-2">
          <Music className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <p className="text-sm font-semibold text-white">No results found for "{query}"</p>
          <p className="text-xs text-slate-500">
            Try checking for spelling or searching for a broader genre, mood, or artist.
          </p>
        </div>
      )}

      {/* Results Content */}
      {query.trim() && !loading && totalMatches > 0 && (
        <div className="space-y-10">
          {/* Songs results */}
          {(activeTab === 'all' || activeTab === 'songs') && songs.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Music className="w-4 h-4 text-cyan-400" />
                Songs
              </h3>
              <div className="space-y-1">
                {songs.map((song, i) => (
                  <TrackRow key={song.song_id} track={song} index={i} tracklist={songs} />
                ))}
              </div>
            </section>
          )}

          {/* Artists results */}
          {(activeTab === 'all' || activeTab === 'artists') && artists.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-purple-400" />
                Artists
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {artists.map((artist) => (
                  <Link
                    key={artist.artist_id}
                    to={`/artists/${artist.artist_id}`}
                    className="group p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 transition-all text-center flex flex-col items-center"
                  >
                    <div className="w-20 h-20 rounded-full overflow-hidden mb-2.5 shadow-md border-2 border-transparent group-hover:border-cyan-400 transition-all">
                      <img
                        src={
                          artist.image ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=60'
                        }
                        alt={artist.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <p className="text-xs font-bold text-white truncate w-full group-hover:text-cyan-300">
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

          {/* Albums results */}
          {(activeTab === 'all' || activeTab === 'albums') && albums.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Disc3 className="w-4 h-4 text-pink-400" />
                Albums
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {albums.map((album) => (
                  <Link
                    key={album.album_id}
                    to={`/albums/${album.album_id}`}
                    className="group p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 transition-all flex flex-col"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden mb-2.5 shadow bg-purple-950/40">
                      <img
                        src={
                          album.cover ||
                          'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=60'
                        }
                        alt={album.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <p className="text-xs font-semibold text-white truncate group-hover:text-cyan-300">
                      {album.title}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {album.artist}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};
