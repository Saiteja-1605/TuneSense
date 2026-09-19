import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import {
  Sparkles,
  Cpu,
  BarChart2,
  ThumbsUp,
  Sliders,
  ShieldCheck,
  Disc,
  ArrowRight,
  Database,
  Music,
  CheckCircle2,
} from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#090a10] text-slate-100 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        {/* Glow backdrop effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-purple-600/30 to-cyan-500/20 blur-[120px] rounded-full -z-10 pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold tracking-wide shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Discover music that understands your taste.</span>
          </div>


          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Discover Music Engineered For Your Exact{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
              Acoustic DNA
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            TuneSense pairs <strong className="text-slate-200">TF-IDF semantic analysis</strong> with{' '}
            <strong className="text-slate-200">cosine similarity & audio feature modeling</strong> to curate personalized song recommendations with 100% explainability.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 shadow-xl shadow-purple-600/25 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              Sign In to Your Library
            </Link>
          </div>

          {/* Interactive Simulated Preview Card */}
          <div className="pt-12 max-w-2xl mx-auto">
            <div className="glass-panel rounded-2xl p-6 border border-white/10 shadow-2xl text-left space-y-4 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-mono text-slate-500 ml-2">TuneSense ML Engine v1.0</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  94.2% Similarity
                </span>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/30">
                    <Disc className="w-6 h-6 text-white animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base">Neon Velocity</h3>
                    <p className="text-xs text-slate-400">AeroPulse • Progressive Electronic</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1">
                  <span className="px-2 py-1 rounded bg-purple-500/10 text-purple-300 text-[11px] font-semibold">128 BPM</span>
                  <span className="px-2 py-1 rounded bg-cyan-500/10 text-cyan-300 text-[11px] font-semibold">Energy: 95%</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200">
                <strong className="text-cyan-300">Why recommended: </strong>
                Matches your preference for Electronic & Upbeat mood, matching your target energy profile (95%) and danceability rhythm.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-20 border-t border-white/5 bg-[#0b0d18]/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight">
              Production Architecture Built For Precision
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Engineered with modern algorithms and high performance web standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Content-Based ML Vectorizer</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Transforms song metadata, n-grams, and continuous acoustic vectors (valence, danceability, tempo, acousticness) into high-dimensional embeddings for exact cosine ranking.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <ThumbsUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Active Feedback & Filtering</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Likes dynamically shift your user profile vector towards preferred sounds, while dislikes actively suppress unwanted tracks from ever reappearing.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                <BarChart2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Interactive Visualizations</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Explore your evolving tastes through radar charts, genre distribution breakdowns, and listening history powered by Recharts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Banner */}
      <section className="py-16 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Powered By Modern Industry Stack
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-slate-300 text-sm font-semibold">
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
              <Music className="w-4 h-4 text-cyan-400" /> React 19 + Vite
            </span>
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
              <Cpu className="w-4 h-4 text-purple-400" /> Python FastAPI
            </span>
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
              <Sparkles className="w-4 h-4 text-pink-400" /> Scikit-Learn TF-IDF
            </span>
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
              <Database className="w-4 h-4 text-emerald-400" /> MongoDB Atlas
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-white/5 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} TuneSense. Built with Machine Learning & Full-Stack React.</p>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-white transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
