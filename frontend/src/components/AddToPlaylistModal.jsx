import React, { useState, useEffect } from 'react';
import { X, Plus, Check, ListMusic, Music } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { playlistsApi } from '../api';

export const AddToPlaylistModal = () => {
  const { playlistModalTrack, closePlaylistModal } = usePlayer();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    if (!playlistModalTrack) return;
    setLoading(true);
    playlistsApi
      .getPlaylists()
      .then((data) => {
        setPlaylists(data || []);
        // Check which playlists already contain this song
        const alreadyIn = new Set();
        data.forEach((p) => {
          if (p.songs?.includes(playlistModalTrack.song_id)) {
            alreadyIn.add(p.id);
          }
        });
        setAddedIds(alreadyIn);
      })
      .catch((err) => console.error('Failed to load playlists:', err))
      .finally(() => setLoading(false));
  }, [playlistModalTrack]);

  if (!playlistModalTrack) return null;

  const handleAddToPlaylist = async (playlistId) => {
    try {
      await playlistsApi.addSongToPlaylist(playlistId, playlistModalTrack.song_id);
      setAddedIds((prev) => new Set([...prev, playlistId]));
    } catch (err) {
      console.error('Failed to add song to playlist:', err);
    }
  };

  const handleCreateAndAdd = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const created = await playlistsApi.createPlaylist({
        title: newTitle.trim(),
        description: 'Created from player',
        is_public: true,
      });
      await playlistsApi.addSongToPlaylist(created.id, playlistModalTrack.song_id);
      setPlaylists((prev) => [created, ...prev]);
      setAddedIds((prev) => new Set([...prev, created.id]));
      setNewTitle('');
      setIsCreating(false);
    } catch (err) {
      console.error('Failed to create playlist:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#101322] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ListMusic className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-white text-base">Add to Playlist</h3>
          </div>
          <button
            type="button"
            onClick={closePlaylistModal}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Track Preview */}
        <div className="p-4 bg-purple-950/20 border-b border-white/5 flex items-center gap-3">
          <img
            src={
              playlistModalTrack.album_art ||
              'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=60'
            }
            alt={playlistModalTrack.title}
            className="w-10 h-10 rounded-lg object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {playlistModalTrack.title}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {playlistModalTrack.artist}
            </p>
          </div>
        </div>

        {/* Playlists List */}
        <div className="p-4 max-h-60 overflow-y-auto space-y-1.5">
          {loading ? (
            <p className="text-center py-6 text-xs text-slate-400">Loading playlists...</p>
          ) : playlists.length === 0 ? (
            <p className="text-center py-6 text-xs text-slate-400">No playlists found. Create one below!</p>
          ) : (
            playlists.map((pl) => {
              const isAdded = addedIds.has(pl.id);
              return (
                <div
                  key={pl.id}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={pl.cover || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=60'}
                      alt={pl.title}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <div className="truncate">
                      <p className="text-xs font-medium text-white truncate">{pl.title}</p>
                      <p className="text-[10px] text-slate-400">{pl.song_count || pl.songs?.length || 0} tracks</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddToPlaylist(pl.id)}
                    disabled={isAdded}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isAdded
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-purple-600/30 text-purple-200 hover:bg-purple-600/50 border border-purple-500/30'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Added
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        Add
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Create New Playlist Section */}
        <div className="p-4 border-t border-white/10 bg-[#0d0f1a]">
          {isCreating ? (
            <form onSubmit={handleCreateAndAdd} className="flex gap-2">
              <input
                type="text"
                placeholder="Playlist name..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                autoFocus
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={!newTitle.trim()}
                className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-2 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="w-full py-2 px-3 rounded-xl border border-dashed border-white/20 hover:border-purple-400/50 hover:bg-white/5 text-xs font-semibold text-purple-300 flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              New Playlist
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
