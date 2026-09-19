import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../api';
import { StatCard } from '../components/StatCard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import {
  BarChart3,
  PieChart as PieIcon,
  Activity,
  Disc3,
  ThumbsUp,
  Sparkles,
  Music2
} from 'lucide-react';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#6366f1', '#14b8a6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-xl bg-slate-900/95 border border-white/10 shadow-2xl backdrop-blur-md text-xs">
        <p className="font-bold text-white mb-1">{label || payload[0]?.name}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color || '#06b6d4' }} className="font-mono">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await analyticsApi.getAnalytics();
        setData(res);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Disc3 className="w-10 h-10 text-cyan-400 animate-spin" />
        <p className="text-xs text-slate-400">Aggregating telemetry & visual analytics...</p>
      </div>
    );
  }

  const metrics = data?.metrics || {
    total_recommendations: 0,
    total_likes: 0,
    favorite_genre: 'Pop',
    average_match_score: 85,
  };

  const genreData = data?.genre_distribution || [
    { name: 'Pop', value: 8 },
    { name: 'Electronic', value: 6 },
    { name: 'Rock', value: 4 },
    { name: 'Indie', value: 3 },
    { name: 'R&B', value: 3 },
  ];

  const moodData = data?.mood_distribution || [
    { name: 'Energetic', value: 10 },
    { name: 'Upbeat', value: 7 },
    { name: 'Chill', value: 5 },
    { name: 'Euphoric', value: 4 },
  ];

  const feedbackData = [
    { name: 'Liked Tracks', value: data?.feedback_stats?.likes || 0, color: '#10b981' },
    { name: 'Disliked Tracks', value: data?.feedback_stats?.dislikes || 0, color: '#f43f5e' },
    { name: 'Unrated', value: data?.feedback_stats?.unrated || 0, color: '#64748b' },
  ].filter((item) => item.value > 0);

  const radarData = data?.audio_radar || [
    { feature: 'Energy', user: 75, catalog: 65 },
    { feature: 'Danceability', user: 70, catalog: 62 },
    { feature: 'Acousticness', user: 30, catalog: 42 },
    { feature: 'Valence', user: 70, catalog: 55 },
  ];

  const trendData = data?.recommendations_trend || [
    { date: 'Session 1', count: 4 },
    { date: 'Session 2', count: 8 },
    { date: 'Session 3', count: 12 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          <BarChart3 className="w-7 h-7 text-cyan-400" />
          <span>Interactive Listening Analytics</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Visual metrics reflecting your content-based taste evolution, affinity patterns, and feedback loops.
        </p>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Explored"
          value={metrics.total_recommendations}
          subtitle="Indexed recommendations"
          icon={Music2}
          color="purple"
        />
        <StatCard
          title="Favorited Tracks"
          value={metrics.total_likes}
          subtitle={`${data?.feedback_stats?.like_ratio || 100}% like ratio`}
          icon={ThumbsUp}
          color="emerald"
        />
        <StatCard
          title="Dominant Genre"
          value={metrics.favorite_genre}
          subtitle="Strongest cosine affinity"
          icon={Activity}
          color="cyan"
        />
        <StatCard
          title="Acoustic Alignment"
          value={`${metrics.average_match_score}%`}
          subtitle="Average match score"
          icon={Sparkles}
          color="amber"
        />
      </div>

      {/* Primary Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Genre Affinity Distribution */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span>Recommended Genres Distribution</span>
            </h2>
            <span className="text-[11px] text-slate-500">Track counts</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={genreData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={11}
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Tracks" fill="#8b5cf6" radius={[6, 6, 0, 0]}>
                  {genreData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Mood Affinity Breakdown */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-cyan-400" />
              <span>Mood Energy Breakdown</span>
            </h2>
            <span className="text-[11px] text-slate-500">Proportions</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={moodData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {moodData.map((_, index) => (
                    <Cell key={`mood-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(val) => <span className="text-xs text-slate-300">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Audio Radar: User Target vs Catalog */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Acoustic Profile Radar</span>
            </h2>
            <span className="text-[11px] text-slate-500">User vs Catalog Avg</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="feature" stroke="#94a3b8" fontSize={11} />
                <PolarRadiusAxis stroke="#475569" angle={30} domain={[0, 100]} />
                <Radar
                  name="Your Target Profile"
                  dataKey="user"
                  stroke="#06b6d4"
                  fill="#06b6d4"
                  fillOpacity={0.4}
                />
                <Radar
                  name="Catalog Average"
                  dataKey="catalog"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.2}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(val) => <span className="text-xs text-slate-300">{val}</span>}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Recommendation Feedback Sentiment */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-amber-400" />
              <span>Feedback Loop Sentiment</span>
            </h2>
            <span className="text-[11px] text-slate-500">Likes vs Dislikes</span>
          </div>

          {feedbackData.length > 0 ? (
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={feedbackData}
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {feedbackData.map((entry, index) => (
                      <Cell key={`fb-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs">
              <ThumbsUp className="w-8 h-8 mb-2 opacity-40" />
              <span>Rate recommendations in Discover to visualize feedback sentiment.</span>
            </div>
          )}
        </div>
      </div>

      {/* 5. Recommendation Activity Timeline */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Recommendation Telemetry Trend</span>
          </h2>
          <span className="text-[11px] text-slate-500">Activity volume</span>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                name="Tracks Computed"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRec)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
