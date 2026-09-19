import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Check, ArrowRight, Music2 } from 'lucide-react';
import { preferencesApi } from '../api';

const ALL_GENRES = [
  'Pop', 'Rock', 'Electronic', 'Hip Hop', 'Lo-Fi',
  'R&B', 'Classical', 'Indie', 'Ambient', 'Jazz'
];

const ALL_MOODS = [
  'Energetic', 'Chill', 'Upbeat', 'Melancholic',
  'Focus', 'Romantic', 'Intense', 'Calm'
];

export const OnboardingPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedGenres, setSelectedGenres] = useState(['Pop', 'Electronic', 'Lo-Fi']);
  const [selectedMoods, setSelectedMoods] = useState(['Upbeat', 'Chill']);
  const [energy, setEnergy] = useState(0.7);
  const [danceability, setDanceability] = useState(0.65);
  const [acousticness, setAcousticness] = useState(0.3);
  const [valence, setValence] = useState(0.6);
  const [saving, setSaving] = useState(false);

  const toggleGenre = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  };

  const toggleMood = (mood) => {
    setSelectedMoods((prev) =>
      prev.includes(mood)
        ? prev.filter((m) => m !== mood)
        : [...prev, mood]
    );
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      await preferencesApi.updatePreferences({
        favorite_genres: selectedGenres,
        favorite_moods: selectedMoods,
        languages: ['English'],
        energy,
        danceability,
        acousticness,
        valence,
      });
      navigate('/home');
    } catch (err) {
      console.error('Failed to save preferences:', err);
      navigate('/home');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070913] text-white flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-[#0e1122] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 mx-auto flex items-center justify-center shadow-lg shadow-purple-500/25">
            <Music2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Tune Your Taste
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Tell TuneSense what resonates with you to initialize your ML profile.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                s === step
                  ? 'w-8 bg-cyan-400'
                  : s < step
                  ? 'w-4 bg-purple-500'
                  : 'w-4 bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Genres */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="text-center">
              <h2 className="text-lg font-bold text-white">Select your favorite genres</h2>
              <p className="text-xs text-slate-400 mt-0.5">Pick at least 2 genres</p>
            </div>

            <div className="flex flex-wrap justify-center gap-2.5">
              {ALL_GENRES.map((genre) => {
                const isSelected = selectedGenres.includes(genre);
                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => toggleGenre(genre)}
                    className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md shadow-purple-500/20 scale-105'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    {genre}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={selectedGenres.length < 2}
              onClick={() => setStep(2)}
              className="w-full py-3 rounded-2xl bg-cyan-400 text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-cyan-300 disabled:opacity-40 transition-all shadow-lg shadow-cyan-400/20"
            >
              Next: Favorite Moods
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Moods */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="text-center">
              <h2 className="text-lg font-bold text-white">What moods do you listen to?</h2>
              <p className="text-xs text-slate-400 mt-0.5">Pick your go-to musical states</p>
            </div>

            <div className="flex flex-wrap justify-center gap-2.5">
              {ALL_MOODS.map((mood) => {
                const isSelected = selectedMoods.includes(mood);
                return (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => toggleMood(mood)}
                    className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md shadow-cyan-500/20 scale-105'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    {mood}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                disabled={selectedMoods.length < 1}
                onClick={() => setStep(3)}
                className="flex-1 py-3 rounded-2xl bg-cyan-400 text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-cyan-300 disabled:opacity-40 transition-all shadow-lg shadow-cyan-400/20"
              >
                Next: Acoustic Taste
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Acoustic Profiling */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="text-center">
              <h2 className="text-lg font-bold text-white">Fine-tune Acoustic Vibe</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Our content-based model matches song vectors to these dials
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Energy Level</span>
                  <span className="text-cyan-400 font-mono">{Math.round(energy * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={energy}
                  onChange={(e) => setEnergy(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-white/10 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Danceability</span>
                  <span className="text-purple-400 font-mono">{Math.round(danceability * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={danceability}
                  onChange={(e) => setDanceability(parseFloat(e.target.value))}
                  className="w-full accent-purple-400 h-1.5 bg-white/10 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Acousticness</span>
                  <span className="text-indigo-400 font-mono">{Math.round(acousticness * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={acousticness}
                  onChange={(e) => setAcousticness(parseFloat(e.target.value))}
                  className="w-full accent-indigo-400 h-1.5 bg-white/10 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Valence (Positivity / Brightness)</span>
                  <span className="text-pink-400 font-mono">{Math.round(valence * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={valence}
                  onChange={(e) => setValence(parseFloat(e.target.value))}
                  className="w-full accent-pink-400 h-1.5 bg-white/10 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-3 px-5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinish}
                disabled={saving}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                {saving ? 'Calibrating...' : 'Launch TuneSense'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
