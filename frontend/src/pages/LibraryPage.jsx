import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ListMusic,
  Heart,
  Plus,
  Clock,
  Music,
  Play,
} from 'lucide-react';
import { playlistsApi, libraryApi, historyApi } from '../api';
import { usePlayer } from '../context/PlayerContext';
import { TrackRow } from '../components/TrackRow';

export const LibraryPage = () => {
  const [activeTab, setActiveTab] = useState('playlists'); // playlists, liked, history
  const [libraryData, setLibraryData] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const { playTrack } = usePlayer();

  const loadData = () => {
    setLoading(true);
    Promise.all([
      libraryApi.getLibrarySummary(),
      playlistsApi.getPlaylists(),
      historyApi.getRecentlyPlayed(30),
    ])
      .then(([lib, pl, hist]) => {
        setLibraryData(lib);
        setPlaylists(pl || []);
        setRecentlyPlayed(hist || []);
      })
      .catch((err) => console.error('Library loading error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const created = await playlistsApi.createPlaylist({
        title: newTitle.trim(),
        description: newDesc.trim() || 'My customized playlist',
        is_public: true,
      });
      setPlaylists((prev) => [created, ...prev]);
      setNewTitle('');
      setNewDesc('');
      setIsCreating(false);
    } catch (err) {
      console.error('Failed to create playlist:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const likedCount = libraryData?.liked_songs_count || 0;
  const recentLiked = libraryData?.recent_liked_songs || [];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Your Library</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Playlists, liked tracks, and listening history
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-purple-500/20 transition-all active:scale-95 self-start"
        >
          <Plus className="w-4 h-4" />
          Create Playlist
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        {[
          { id: 'playlists', label: `Playlists (${playlists.length})` },
          { id: 'liked', label: `Liked Songs (${likedCount})` },
          { id: 'history', label: `Recently Played (${recentlyPlayed.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-cyan-400 text-black shadow-md shadow-cyan-400/20'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Create Playlist Modal/Inline Form */}
      {isCreating && (
        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 max-w-lg space-y-3">
          <h3 className="text-sm font-bold text-white">Create New Playlist</h3>
          <form onSubmit={handleCreatePlaylist} className="space-y-3">
            <input
              type="text"
              placeholder="Playlist Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
              className="w-full bg-[#121528] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <textarea
              placeholder="Description (optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={2}
              className="w-full bg-[#121528] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!newTitle.trim()}
                className="px-4 py-1.5 bg-cyan-400 text-black rounded-lg text-xs font-bold hover:bg-cyan-300 disabled:opacity-50"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 1: Playlists Grid */}
      {activeTab === 'playlists' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Liked Songs Special Tile */}
          <Link
            to="/library/liked"
            className="group p-4 rounded-2xl bg-gradient-to-br from-purple-700 via-pink-600 to-rose-600 hover:scale-[1.02] transition-all flex flex-col justify-between aspect-square shadow-lg"
          >
            <div className="flex justify-between items-start">
              <Heart className="w-8 h-8 text-white fill-white" />
              <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              </div>
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base leading-tight">Liked Songs</h3>
              <p className="text-xs text-pink-100 mt-1">{likedCount} favorite tracks</p>
            </div>
          </Link>

          {/* User Playlists */}
          {playlists.map((pl) => (
            <Link
              key={pl.id}
              to={`/playlists/${pl.id}`}
              className="group p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 transition-all flex flex-col"
            >
              <div className="aspect-square rounded-xl overflow-hidden mb-2.5 shadow-md bg-purple-950/40 relative">
                <img
                  src={pl.cover || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=60'}
                  alt={pl.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <button
                  type="button"
                  className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100"
                >
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </button>
              </div>
              <p className="text-xs font-semibold text-white truncate group-hover:text-cyan-300">
                {pl.title}
              </p>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {pl.song_count || pl.songs?.length || 0} tracks • {pl.is_public ? 'Public' : 'Private'}
              </p>
            </Link>
          ))}
        </div>
      )}

      {/* Tab 2: Liked Songs List */}
      {activeTab === 'liked' && (
        <div>
          {recentLiked.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <Heart className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No liked songs yet.</p>
              <Link to="/search" className="text-xs text-cyan-400 underline mt-1 inline-block">
                Discover music
              </Link>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex justify-between items-center mb-4">
                <p className="text-xs text-slate-400">Your recent favorites</p>
                <Link to="/library/liked" className="text-xs text-cyan-400 font-semibold hover:underline">
                  View Full Liked Page
                </Link>
              </div>
              {recentLiked.map((song, i) => (
                <TrackRow key={song.song_id} track={song} index={i} tracklist={recentLiked} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Recently Played */}
      {activeTab === 'history' && (
        <div className="space-y-1">
          {recentlyPlayed.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No recently played tracks yet.</p>
              <p className="text-xs text-slate-600 mt-1">
                Songs will appear here as you stream.
              </p>
            </div>
          ) : (
            recentlyPlayed.map((song, i) => (
              <TrackRow
                key={`${song.song_id}-${i}`}
                track={song}
                index={i}
                tracklist={recentlyPlayed}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};
