import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Play,
  Shuffle,
  ListMusic,
  Trash2,
  Edit2,
  Clock,
  Plus,
  Share2,
} from 'lucide-react';
import { playlistsApi } from '../api';
import { usePlayer } from '../context/PlayerContext';
import { TrackRow } from '../components/TrackRow';

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m} min ${s > 0 ? `${s} sec` : ''}`;
}

export const PlaylistPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const { playTrack } = usePlayer();

  const fetchPlaylist = () => {
    setLoading(true);
    playlistsApi
      .getPlaylistDetail(id)
      .then((res) => {
        setData(res);
        setEditTitle(res.playlist?.title || '');
        setEditDesc(res.playlist?.description || '');
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.detail || 'Failed to load playlist');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPlaylist();
  }, [id]);

  const handlePlayAll = () => {
    const tracks = data?.tracks || [];
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks);
    }
  };

  const handleShuffle = () => {
    const tracks = data?.tracks || [];
    if (tracks.length > 0) {
      const shuffled = [...tracks].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0], shuffled);
    }
  };

  const handleRemoveSong = async (songId) => {
    try {
      await playlistsApi.removeSongFromPlaylist(id, songId);
      setData((prev) => {
        if (!prev) return prev;
        const nextTracks = prev.tracks.filter((t) => t.song_id !== songId);
        return {
          ...prev,
          tracks: nextTracks,
          playlist: {
            ...prev.playlist,
            song_count: nextTracks.length,
          },
        };
      });
    } catch (err) {
      console.error('Failed to remove track:', err);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    try {
      const updated = await playlistsApi.updatePlaylist(id, {
        title: editTitle.trim(),
        description: editDesc.trim(),
      });
      setData((prev) => (prev ? { ...prev, playlist: updated } : prev));
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update playlist:', err);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!window.confirm(`Are you sure you want to delete "${data?.playlist?.title}"?`)) return;
    try {
      await playlistsApi.deletePlaylist(id);
      navigate('/library');
    } catch (err) {
      console.error('Failed to delete playlist:', err);
    }
  };

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
        <p className="text-sm font-semibold">{error || 'Playlist not found.'}</p>
        <Link to="/library" className="mt-4 inline-block text-xs text-cyan-400 underline">
          Go to Library
        </Link>
      </div>
    );
  }

  const { playlist, tracks = [] } = data;
  const totalDurationSec = tracks.reduce((acc, t) => acc + (t.duration || 0), 0);

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-950/70 via-indigo-950/50 to-slate-900/80 p-6 sm:p-10 border border-white/10 shadow-2xl flex flex-col md:flex-row items-center md:items-end gap-6 sm:gap-8">
        <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden shadow-2xl shrink-0 border border-white/10 bg-purple-950/40">
          <img
            src={playlist.cover || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=60'}
            alt={playlist.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 text-center md:text-left space-y-3">
          <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold uppercase tracking-wider text-purple-300">
            <ListMusic className="w-4 h-4 text-purple-400" />
            <span>Playlist {playlist.is_public ? '• Public' : '• Private'}</span>
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveEdit} className="space-y-2 max-w-md">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-lg font-bold text-white focus:outline-none focus:border-cyan-400"
              />
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Description..."
                rows={2}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-3 py-1 bg-cyan-400 text-black rounded-lg text-xs font-bold"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 bg-white/10 text-white rounded-lg text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                {playlist.title}
              </h1>
              {playlist.description && (
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                  {playlist.description}
                </p>
              )}
            </>
          )}

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs sm:text-sm text-slate-300">
            <span>{tracks.length} tracks</span>
            <span>•</span>
            <span className="flex items-center gap-1 font-mono text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              {formatDuration(totalDurationSec)}
            </span>
          </div>

          <div className="pt-2 flex items-center justify-center md:justify-start gap-3">
            {tracks.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handlePlayAll}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-500/25 transition-all active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  Play All
                </button>
                <button
                  type="button"
                  onClick={handleShuffle}
                  className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors"
                >
                  <Shuffle className="w-4 h-4" />
                  Shuffle
                </button>
              </>
            )}

            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                title="Edit Playlist"
                className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={handleDeletePlaylist}
              title="Delete Playlist"
              className="p-2.5 rounded-full bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tracklist */}
      {tracks.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-white/10 rounded-2xl p-8 space-y-3">
          <ListMusic className="w-12 h-12 mx-auto text-slate-600" />
          <p className="text-sm font-semibold text-white">This playlist is empty</p>
          <p className="text-xs text-slate-400">
            Find songs from search or discovery and add them here.
          </p>
          <Link
            to="/search"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs font-semibold border border-purple-500/30 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
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
            {tracks.map((song, i) => (
              <TrackRow
                key={song.song_id}
                track={song}
                index={i}
                tracklist={tracks}
                onRemove={handleRemoveSong}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
