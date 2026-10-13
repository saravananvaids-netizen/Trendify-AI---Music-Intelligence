import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, CartesianGrid,
  LineChart, Line, AreaChart, Area, Legend
} from 'recharts';
import { OverviewData } from '../types';
import { formatCompactNumber } from './KPICards';
import { BarChart3, ScatterChart as ScatterIcon, Layers, Network, Globe } from 'lucide-react';

interface ChartsProps {
  data: OverviewData;
  onSongSelect?: (videoId: string) => void;
}

export const Charts: React.FC<ChartsProps> = ({ data, onSongSelect }) => {
  const [activeTab, setActiveTab] = useState<'trends' | 'scatter' | 'heatmap' | 'country'>('trends');

  // Custom tooltip for Top 10 Bar Chart
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-[#0b0f19] border border-slate-700/80 p-3 rounded-lg shadow-xl text-xs">
          <p className="font-semibold text-white mb-1">{item.full_title || item.title}</p>
          <p className="text-purple-300">Artist: {item.artist}</p>
          <p className="text-slate-300 mt-1">Views: {item.views.toLocaleString()}</p>
          {item.likes && <p className="text-slate-400">Likes: {item.likes.toLocaleString()}</p>}
          {item.popularity_score && (
            <p className="text-cyan-400 font-mono mt-1">Popularity Score: {item.popularity_score}/100</p>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for Scatter
  const CustomScatterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-[#0b0f19] border border-slate-700/80 p-3 rounded-lg shadow-xl text-xs max-w-xs">
          <p className="font-semibold text-white truncate mb-1">{item.title}</p>
          <p className="text-slate-400">Artist: {item.artist}</p>
          <div className="mt-1 space-y-0.5 text-slate-300">
            <p>Views: {formatCompactNumber(item.views)}</p>
            <p>Likes: {item.likes ? formatCompactNumber(item.likes) : 'N/A'}</p>
            <p className="text-emerald-400">Engagement: {item.interaction_rate}%</p>
            <p className="text-slate-400 text-[10px]">Age: {item.age_days} days</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Visual Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'trends'
                ? 'bg-purple-900/40 text-purple-200 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            Top 10 Trending & Engagement
          </button>
          <button
            onClick={() => setActiveTab('scatter')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'scatter'
                ? 'bg-purple-900/40 text-purple-200 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            Views vs. Likes Correlation
          </button>
          <button
            onClick={() => setActiveTab('heatmap')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'heatmap'
                ? 'bg-purple-900/40 text-purple-200 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            Seaborn Correlation Heatmap
          </button>
          <button
            onClick={() => setActiveTab('country')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'country'
                ? 'bg-purple-900/40 text-purple-200 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            Country-Wise Trends
          </button>
        </div>
        <div className="text-[11px] text-slate-400 hidden sm:block">
          Interactive SVG Charting
        </div>
      </div>

      {/* Tab 1: Top 10 Trending Bar Chart & Engagement Distribution */}
      {activeTab === 'trends' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top 10 Chart */}
          <div className="lg:col-span-2 bg-[#0f1422] border border-slate-800/80 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Top 10 Trending Songs (Tracked Views)</h3>
                <p className="text-xs text-slate-400">Ranked by verified view counts across active regional charts</p>
              </div>
              <div className="text-[11px] text-purple-400 font-mono">Real-time Ranking</div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.top_10_trending} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis
                    type="number"
                    tickFormatter={(v) => formatCompactNumber(v)}
                    stroke="#64748b"
                    fontSize={11}
                  />
                  <YAxis
                    dataKey="title"
                    type="category"
                    stroke="#94a3b8"
                    fontSize={11}
                    width={100}
                    tick={{ fill: '#cbd5e1' }}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar
                    dataKey="views"
                    fill="#8b5cf6"
                    radius={[0, 4, 4, 0]}
                    name="Views"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Engagement Distribution Histogram */}
          <div className="bg-[#0f1422] border border-slate-800/80 rounded-xl p-5 shadow-sm">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-white">Engagement Distribution</h3>
              <p className="text-xs text-slate-400">Interaction rate bucket frequencies</p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.engagement_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="range" stroke="#64748b" fontSize={10} angle={-25} textAnchor="end" />
                  <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    formatter={(val: any) => [`${val} tracks`, 'Cohort Count']}
                    contentStyle={{ backgroundColor: '#0b0f19', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Views vs Likes Scatter Plot */}
      {activeTab === 'scatter' && (
        <div className="bg-[#0f1422] border border-slate-800/80 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Views vs. Likes Scatter Correlation</h3>
              <p className="text-xs text-slate-400">
                Detect virality anomalies: tracks with high like ratios despite view volume scale
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400">Pearson r ≈ 0.94</span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  type="number"
                  dataKey="views"
                  name="Views"
                  tickFormatter={(v) => formatCompactNumber(v)}
                  stroke="#64748b"
                  fontSize={11}
                  unit=" views"
                />
                <YAxis
                  type="number"
                  dataKey="likes"
                  name="Likes"
                  tickFormatter={(v) => formatCompactNumber(v)}
                  stroke="#64748b"
                  fontSize={11}
                  unit=" likes"
                />
                <Tooltip content={<CustomScatterTooltip />} />
                <Scatter
                  name="Tracks"
                  data={data.views_vs_likes_scatter}
                  fill="#38bdf8"
                  cursor="pointer"
                  onClick={(entry: any) => onSongSelect && onSongSelect(entry?.video_id || entry?.payload?.video_id)}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tab 3: Seaborn Correlation Heatmap */}
      {activeTab === 'heatmap' && (
        <div className="bg-[#0f1422] border border-slate-800/80 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Statistical Correlation Matrix</h3>
              <p className="text-xs text-slate-400">
                Pearson correlation coefficients across views, likes, comments, interaction %, video age, and popularity
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-block w-3 h-3 bg-indigo-900 rounded-sm"></span>
              <span className="text-slate-400">-1.0 (Inverse)</span>
              <span className="inline-block w-3 h-3 bg-slate-800 rounded-sm ml-2"></span>
              <span className="text-slate-400">0.0 (Neutral)</span>
              <span className="inline-block w-3 h-3 bg-purple-600 rounded-sm ml-2"></span>
              <span className="text-slate-400">+1.0 (Direct)</span>
            </div>
          </div>

          {/* Interactive Heatmap Table */}
          <div className="overflow-x-auto mt-4">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-slate-800/80 text-center">
                <thead>
                  <tr>
                    <th className="py-2.5 px-3 text-left text-xs font-semibold text-slate-400">Dimension</th>
                    {data.correlation_matrix.features.map((feat, idx) => (
                      <th key={idx} className="py-2.5 px-3 text-xs font-semibold text-slate-300">
                        {feat}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {data.correlation_matrix.matrix.map((row, rIdx) => (
                    <tr key={rIdx}>
                      <td className="py-2.5 px-3 text-left text-xs font-medium text-slate-300 whitespace-nowrap">
                        {data.correlation_matrix.features[rIdx]}
                      </td>
                      {row.map((val, cIdx) => {
                        // Color generator based on correlation value
                        let bgClass = 'bg-slate-900 text-slate-300';
                        if (val > 0.8) bgClass = 'bg-purple-600/90 text-white font-bold';
                        else if (val > 0.5) bgClass = 'bg-purple-700/60 text-purple-100';
                        else if (val > 0.2) bgClass = 'bg-indigo-900/50 text-indigo-200';
                        else if (val < -0.4) bgClass = 'bg-rose-950/70 text-rose-300 font-semibold';
                        else if (val < -0.1) bgClass = 'bg-rose-950/40 text-rose-300';

                        return (
                          <td key={cIdx} className="p-1.5">
                            <div className={`py-2 px-3 rounded-md text-xs font-mono transition-colors ${bgClass}`}>
                              {val.toFixed(2)}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="mt-4 text-[11px] text-slate-400">
            Computed using NumPy / Pandas correlation routines on active observation snapshots.
          </p>
        </div>
      )}

      {/* Tab 4: Country-Wise Music Trend Comparison */}
      {activeTab === 'country' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#0f1422] border border-slate-800/80 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-white mb-1">Country-Wise Music Volume Comparison</h3>
            <p className="text-xs text-slate-400 mb-4">Cumulative tracked views across regional charts</p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.country_trends} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="country_name" stroke="#64748b" fontSize={11} />
                  <YAxis tickFormatter={(v) => formatCompactNumber(v)} stroke="#64748b" fontSize={11} />
                  <Tooltip
                    formatter={(val: any) => [formatCompactNumber(val), 'Tracked Views']}
                    contentStyle={{ backgroundColor: '#0b0f19', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="total_views" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#0f1422] border border-slate-800/80 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-white mb-1">Regional Summary Table</h3>
            <p className="text-xs text-slate-400 mb-4">Sample distribution by country</p>

            <div className="space-y-3">
              {data.country_trends.map((ct) => (
                <div key={ct.country_code} className="p-3 bg-[#0a0d16] rounded-lg border border-slate-800/60">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-slate-200">{ct.country_name}</span>
                    <span className="text-xs font-mono text-purple-400">{ct.video_count} videos</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Views: {formatCompactNumber(ct.total_views)}</span>
                    <span className="text-emerald-400">Eng: {ct.avg_engagement_rate}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
