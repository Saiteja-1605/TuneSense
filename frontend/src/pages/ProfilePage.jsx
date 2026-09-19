import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { preferencesApi, healthApi } from '../api';
import {
  User,
  Mail,
  Calendar,
  Sliders,
  LogOut,
  ShieldCheck,
  Cpu,
  Database,
  Disc3
} from 'lucide-react';

export const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const [prefRes, healthRes] = await Promise.allSettled([
          preferencesApi.getPreferences(),
          healthApi.getHealth(),
        ]);
        if (prefRes.status === 'fulfilled') setPreferences(prefRes.value);
        if (healthRes.status === 'fulfilled') setSystemHealth(healthRes.value);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <Disc3 className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-xs text-slate-400">Loading user profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          <User className="w-7 h-7 text-purple-400" />
          <span>Account & Profile</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Manage your account credentials and system connectivity.
        </p>
      </div>

      {/* Profile Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-0.5 shadow-xl">
              <div className="w-full h-full bg-[#0e101f] rounded-[14px] flex items-center justify-center text-xl font-extrabold text-white">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">{user?.name}</h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Mail className="w-3.5 h-3.5" />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5" />
                <span>Member since {user?.created_at ? user.created_at.slice(0, 10) : 'Recent'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Preferences Summary */}
        <div className="pt-6 border-t border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              <span>Acoustic Preferences Snapshot</span>
            </span>
            <Link
              to="/preferences"
              className="text-xs font-semibold text-cyan-400 hover:underline"
            >
              Modify Preferences
            </Link>
          </div>

          <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-3">
            <div className="flex flex-wrap gap-2">
              {preferences?.favorite_genres?.map((g) => (
                <span
                  key={g}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20"
                >
                  {g}
                </span>
              ))}
              {preferences?.favorite_moods?.map((m) => (
                <span
                  key={m}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                >
                  {m}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-400 pt-1">
              <div>
                <span className="text-slate-500 block text-[10px]">Energy</span>
                <span className="font-mono font-bold text-white">
                  {Math.round((preferences?.energy || 0.5) * 100)}%
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Danceability</span>
                <span className="font-mono font-bold text-white">
                  {Math.round((preferences?.danceability || 0.5) * 100)}%
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Acousticness</span>
                <span className="font-mono font-bold text-white">
                  {Math.round((preferences?.acousticness || 0.5) * 100)}%
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Valence</span>
                <span className="font-mono font-bold text-white">
                  {Math.round((preferences?.valence || 0.5) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* System & Architecture Info */}
        <div className="pt-6 border-t border-white/5 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>TuneSense System & Architecture Diagnostics</span>
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-1">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>ML Pipeline</span>
              </div>
              <p className="text-[11px] text-slate-400">
                TF-IDF + Cosine Vectorizer
              </p>
              <span className="inline-block mt-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                Active & Fitted
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-1">
                <Database className="w-3.5 h-3.5 text-purple-400" />
                <span>Indexed Tracks</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {systemHealth?.tracks_indexed || 120} songs catalog
              </p>
              <span className="inline-block mt-1 text-[10px] font-mono text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">
                12 Distinct Genres
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Database Engine</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {systemHealth?.database || 'MongoDB'}
              </p>
              <span className="inline-block mt-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                Operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
