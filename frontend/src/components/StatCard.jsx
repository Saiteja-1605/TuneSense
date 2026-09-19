import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'purple' }) => {
  const colorMap = {
    purple: 'from-purple-600/20 to-indigo-600/10 border-purple-500/30 text-purple-400',
    cyan: 'from-cyan-600/20 to-blue-600/10 border-cyan-500/30 text-cyan-400',
    emerald: 'from-emerald-600/20 to-teal-600/10 border-emerald-500/30 text-emerald-400',
    amber: 'from-amber-600/20 to-orange-600/10 border-amber-500/30 text-amber-400',
  };

  const currentTheme = colorMap[color] || colorMap.purple;

  return (
    <div className={`glass-card p-5 rounded-2xl border bg-gradient-to-br ${currentTheme} relative overflow-hidden`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className="p-2 rounded-xl bg-white/5 border border-white/10">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {value}
        </span>
      </div>

      {subtitle && (
        <p className="text-[11px] text-slate-400 mt-1 font-medium">{subtitle}</p>
      )}
    </div>
  );
};
