import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { preferencesApi } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  Sliders,
  Check,
  Zap,
  Music,
  Smile,
  Feather,
  Disc3,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const ALL_GENRES = [
  'Pop', 'Rock', 'Electronic', 'Hip-Hop', 'R&B', 'Indie',
  'Jazz', 'Classical', 'Ambient', 'Latin', 'Metal', 'Folk'
];

const ALL_MOODS = [
  'Upbeat', 'Energetic', 'Chill', 'Melancholic',
  'Focus', 'Euphoric', 'Romantic', 'Dark'
];

const ALL_LANGUAGES = [
  'English', 'Spanish', 'French', 'Japanese', 'Korean', 'Instrumental'
];

export const PreferencesPage = () => {
  const { showToast } = useAuth();
  const navigate = useNavigate();

  const [genres, setGenres] = useState(['Pop', 'Electronic']);
  const [moods, setMoods] = useState(['Upbeat', 'Energetic']);
  const [languages, setLanguages] = useState(['English']);
  const [energy, setEnergy] = useState(0.75);
  const [danceability, setDanceability] = useState(0.70);
  const [acousticness, setAcousticness] = useState(0.30);
  const [valence, setValence] = useState(0.70);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const data = await preferencesApi.getPreferences();
        if (data.favorite_genres?.length) setGenres(data.favorite_genres);
        if (data.favorite_moods?.length) setMoods(data.favorite_moods);
        if (data.languages?.length) setLanguages(data.languages);
        if (data.energy !== undefined) setEnergy(data.energy);
        if (data.danceability !== undefined) setDanceability(data.danceability);
        if (data.acousticness !== undefined) setAcousticness(data.acousticness);
        if (data.valence !== undefined) setValence(data.valence);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const toggleItem = (list, setList, item) => {
    if (list.includes(item)) {
      if (list.length > 1) {
        setList(list.filter((i) => i !== item));
      } else {
        showToast('Keep at least one option selected.', 'info');
      }
    } else {
      setList([...list, item]);
    }
  };

  const handleSave = async (andDiscover = false) => {
    setSaving(true);
    try {
      await preferencesApi.updatePreferences({
        favorite_genres: genres,
        favorite_moods: moods,
        languages,
        energy,
        danceability,
        acousticness,
        valence,
      });
      showToast('Acoustic preferences saved! Recommendations updated.', 'success');
      if (andDiscover) {
        navigate('/discover');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to save preferences.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <Disc3 className="w-8 h-8 text-purple-500 animate-spin" />
        <p className="text-xs text-slate-400">Loading acoustic preferences...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Sliders className="w-7 h-7 text-cyan-400" />
            <span>Music Taste Configuration</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Tune the parameters that drive your content-based similarity matching.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save Tastes'}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 shadow-md shadow-purple-600/25 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Save & Discover</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 1. Favorite Genres */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-purple-300">
            Favorite Genres
          </h2>
          <span className="text-xs text-slate-400">{genres.length} selected</span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {ALL_GENRES.map((g) => {
            const selected = genres.includes(g);
            return (
              <button
                key={g}
                type="button"
                onClick={() => toggleItem(genres, setGenres, g)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  selected
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 scale-[1.02]'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {selected && <Check className="w-3.5 h-3.5 text-cyan-300" />}
                <span>{g}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Mood Affinities */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-300">
            Mood Affinities
          </h2>
          <span className="text-xs text-slate-400">{moods.length} selected</span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {ALL_MOODS.map((m) => {
            const selected = moods.includes(m);
            return (
              <button
                key={m}
                type="button"
                onClick={() => toggleItem(moods, setMoods, m)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  selected
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30 scale-[1.02]'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {selected && <Check className="w-3.5 h-3.5 text-white" />}
                <span>{m}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Preferred Languages */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-300">
            Preferred Languages
          </h2>
          <span className="text-xs text-slate-400">{languages.length} selected</span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {ALL_LANGUAGES.map((lang) => {
            const selected = languages.includes(lang);
            return (
              <button
                key={lang}
                type="button"
                onClick={() => toggleItem(languages, setLanguages, lang)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  selected
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-[1.02]'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {selected && <Check className="w-3.5 h-3.5 text-white" />}
                <span>{lang}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Continuous Acoustic Sliders */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-300">
            Acoustic Sliders (Vector Weighting)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            These values calibrate target vectors for cosine distance calculation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Energy Slider */}
          <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-semibold text-white">
                <Zap className="w-4 h-4 text-amber-400" />
                Target Energy
              </span>
              <span className="text-xs font-mono font-bold text-amber-300">
                {Math.round(energy * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={energy}
              onChange={(e) => setEnergy(parseFloat(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Ambient / Chill (0%)</span>
              <span>High-Octane (100%)</span>
            </div>
          </div>

          {/* Danceability Slider */}
          <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-semibold text-white">
                <Music className="w-4 h-4 text-purple-400" />
                Target Danceability
              </span>
              <span className="text-xs font-mono font-bold text-purple-300">
                {Math.round(danceability * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={danceability}
              onChange={(e) => setDanceability(parseFloat(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Freeform / Organic (0%)</span>
              <span>Steady Dance Beat (100%)</span>
            </div>
          </div>

          {/* Acousticness Slider */}
          <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-semibold text-white">
                <Feather className="w-4 h-4 text-cyan-400" />
                Acousticness Tendency
              </span>
              <span className="text-xs font-mono font-bold text-cyan-300">
                {Math.round(acousticness * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={acousticness}
              onChange={(e) => setAcousticness(parseFloat(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Synthesized / Electric (0%)</span>
              <span>Natural Acoustic (100%)</span>
            </div>
          </div>

          {/* Valence Slider */}
          <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-semibold text-white">
                <Smile className="w-4 h-4 text-emerald-400" />
                Valence (Positivity)
              </span>
              <span className="text-xs font-mono font-bold text-emerald-300">
                {Math.round(valence * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={valence}
              onChange={(e) => setValence(parseFloat(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Moody / Melancholic (0%)</span>
              <span>Joyful / Euphoric (100%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
