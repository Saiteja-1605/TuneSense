import React from 'react';
import { Zap, Music, Smile, Feather, Gauge } from 'lucide-react';

export const AudioFeaturesBar = ({ song }) => {
  if (!song) return null;

  const features = [
    {
      label: 'Energy',
      value: Math.round((song.energy || 0) * 100),
      color: 'from-amber-500 to-orange-500',
      icon: Zap,
    },
    {
      label: 'Danceability',
      value: Math.round((song.danceability || 0) * 100),
      color: 'from-purple-500 to-pink-500',
      icon: Music,
    },
    {
      label: 'Valence',
      value: Math.round((song.valence || 0) * 100),
      color: 'from-emerald-400 to-teal-500',
      icon: Smile,
    },
    {
      label: 'Acousticness',
      value: Math.round((song.acousticness || 0) * 100),
      color: 'from-cyan-400 to-blue-500',
      icon: Feather,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="font-semibold uppercase tracking-wider">Acoustic Dimensions</span>
        <span className="flex items-center gap-1 font-mono text-purple-300">
          <Gauge className="w-3.5 h-3.5" />
          {Math.round(song.tempo || 120)} BPM
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.label} className="p-2.5 rounded-xl bg-black/20 border border-white/5 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                  {f.label}
                </span>
                <span className="font-mono font-bold text-white">{f.value}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${f.color} rounded-full transition-all duration-500`}
                  style={{ width: `${f.value}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
