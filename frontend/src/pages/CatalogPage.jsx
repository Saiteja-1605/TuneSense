import React, { useState, useEffect } from 'react';
import { songsApi } from '../api';
import { SongCard } from '../components/SongCard';
import { Search, Music, Disc3, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';

export const CatalogPage = () => {
  const [songs, setSongs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(16);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('All');
  const [mood, setMood] = useState('All');
  const [genres, setGenres] = useState([]);
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit,
          search: search.trim() || undefined,
          genre: genre !== 'All' ? genre : undefined,
          mood: mood !== 'All' ? mood : undefined,
        };
        const res = await songsApi.getSongs(params);
        setSongs(res.items || []);
        setTotal(res.total || 0);
        if (res.genres?.length) setGenres(['All', ...res.genres]);
        if (res.moods?.length) setMoods(['All', ...res.moods]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [page, limit, search, genre, mood]);

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Music className="w-7 h-7 text-purple-400" />
          <span>Song Library Catalog</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Browse all {total} indexed tracks across 12 musical genres.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by song title, artist, or tags (e.g. 'synth', 'salsa', 'guitar')..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Genre:</span>
            <select
              value={genre}
              onChange={(e) => {
                setGenre(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              {genres.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Mood:</span>
            <select
              value={mood}
              onChange={(e) => {
                setMood(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              {moods.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] gap-3">
          <Disc3 className="w-8 h-8 text-purple-500 animate-spin" />
          <p className="text-xs text-slate-400">Loading catalog...</p>
        </div>
      ) : songs.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {songs.map((song) => (
              <SongCard key={song.song_id} song={song} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs text-slate-400">
            <span>
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} songs
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-white px-2">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="p-12 text-center text-slate-400">
          No songs matched your search criteria.
        </div>
      )}
    </div>
  );
};
