import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { songsApi } from '../api';
import { AudioFeaturesBar } from '../components/AudioFeaturesBar';
import { SongCard } from '../components/SongCard';
import {
  ArrowLeft,
  Disc,
  Sparkles,
  Tag,
  Globe,
  Flame,
  Music,
  Disc3
} from 'lucide-react';

export const SongDetailPage = () => {
  const { id } = useParams();
  const [song, setSong] = useState(null);
  const [similarSongs, setSimilarSongs] = useState([]);
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await songsApi.getSongDetail(id);
        setSong(res.song);
        setSimilarSongs(res.similar_songs || []);
        setExplanation(res.explanation || '');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Disc3 className="w-10 h-10 text-cyan-400 animate-spin" />
        <p className="text-xs text-slate-400">Loading track acoustic blueprint...</p>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-base text-slate-300">Track not found.</p>
        <Link to="/discover" className="text-xs text-cyan-400 font-semibold hover:underline">
          Return to Recommendations
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Back navigation */}
      <Link
        to="/discover"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Recommendations</span>
      </Link>

      {/* Main Track Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-purple-950/40 via-[#121424] to-[#090a10] border border-purple-500/20 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Simulated Vinyl Disc Art */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-400 p-1 flex-shrink-0 shadow-2xl shadow-purple-600/30">
            <div className="w-full h-full bg-[#0e101f] rounded-[14px] flex items-center justify-center">
              <Disc className="w-12 h-12 text-cyan-300 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
          </div>

          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-600/30 text-purple-200 border border-purple-500/30">
                {song.genre}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {song.mood}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Globe className="w-3.5 h-3.5" />
                {song.language}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {song.title}
            </h1>
            <p className="text-base sm:text-lg text-slate-300 font-medium">
              {song.artist} <span className="text-slate-500 font-normal">• {song.album}</span>
            </p>

            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl pt-1 leading-relaxed">
              {song.description}
            </p>

            {/* Tags */}
            {song.tags && song.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                {song.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-white/5 text-slate-400 border border-white/5"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Audio Features Visualizer */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <span>Acoustic Profile Analysis</span>
        </h2>
        <p className="text-xs text-slate-400">
          Normalized continuous audio dimensions extracted for vector similarity modeling.
        </p>

        <AudioFeaturesBar song={song} />
      </div>

      {/* Similar Songs Section (Content-based similarity) */}
      {similarSongs.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Music className="w-5 h-5 text-purple-400" />
              <span>Similar Acoustic Fingerprints</span>
            </h2>
            <p className="text-xs text-slate-400">
              Songs in the catalog with highest Cosine Similarity to "{song.title}".
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {similarSongs.map((simSong) => (
              <SongCard key={simSong.song_id} song={simSong} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
