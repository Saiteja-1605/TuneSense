import React from 'react';
import { X, Play, Trash2, Music2, Disc } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

function formatDuration(sec) {
  if (!sec) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export const QueueDrawer = () => {
  const {
    isQueueOpen,
    toggleQueueOpen,
    queue,
    queueIndex,
    currentTrack,
    playTrack,
    removeFromQueue,
    clearQueue,
    isPlaying,
  } = usePlayer();

  if (!isQueueOpen) return null;

  return (
    <aside className="fixed top-0 right-0 bottom-20 w-80 sm:w-96 bg-[#0a0c16]/98 backdrop-blur-2xl border-l border-white/10 z-50 shadow-2xl flex flex-col transition-transform animate-in slide-in-from-right">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music2 className="w-5 h-5 text-purple-400" />
          <h3 className="font-bold text-white text-base">Play Queue</h3>
          <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-mono">
            {queue.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {queue.length > 1 && (
            <button
              type="button"
              onClick={clearQueue}
              className="text-xs text-slate-400 hover:text-rose-400 px-2 py-1 rounded transition-colors"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={toggleQueueOpen}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Currently Playing */}
        {currentTrack && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 mb-2.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              Now Playing
            </p>
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/20">
              <img
                src={
                  currentTrack.album_art ||
                  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=60'
                }
                alt={currentTrack.title}
                className="w-11 h-11 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {currentTrack.title}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {currentTrack.artist}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 font-mono">
                  {formatDuration(currentTrack.duration)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Up Next List */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Up Next
          </p>

          {queue.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Disc className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Queue is empty</p>
              <p className="text-xs text-slate-600 mt-1">Play any track to start queue</p>
            </div>
          ) : (
            <div className="space-y-1">
              {queue.map((track, idx) => {
                const isCurrent = idx === queueIndex;
                return (
                  <div
                    key={`${track.song_id}-${idx}`}
                    className={`group flex items-center gap-3 p-2 rounded-xl transition-all ${
                      isCurrent
                        ? 'bg-purple-900/30 border border-purple-500/30 text-white'
                        : 'hover:bg-white/5 text-slate-300'
                    }`}
                  >
                    <span className="w-5 text-center text-xs font-mono text-slate-500">
                      {idx + 1}
                    </span>

                    <img
                      src={
                        track.album_art ||
                        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=60'
                      }
                      alt={track.title}
                      className="w-9 h-9 rounded-lg object-cover"
                    />

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-medium truncate ${
                          isCurrent ? 'text-cyan-300 font-semibold' : 'text-slate-200'
                        }`}
                      >
                        {track.title}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {track.artist}
                      </p>
                    </div>

                    <span className="text-xs text-slate-500 font-mono">
                      {formatDuration(track.duration)}
                    </span>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!isCurrent && (
                        <button
                          type="button"
                          onClick={() => playTrack(track, queue)}
                          title="Play now"
                          className="p-1 rounded text-slate-300 hover:text-cyan-300"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFromQueue(idx)}
                        title="Remove from queue"
                        className="p-1 rounded text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
