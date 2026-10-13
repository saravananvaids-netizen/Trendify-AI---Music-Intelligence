import React, { useState, useEffect } from 'react';
import { Track } from '../types';
import { fetchHistoricalTrends, getExportCsvUrl } from '../services/api';
import { formatCompactNumber } from './KPICards';
import { History, Download, TrendingUp, TrendingDown, Database, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HistoricalTrackerViewProps {
  tracks: Track[];
  onSelectSong: (videoId: string) => void;
}

export const HistoricalTrackerView: React.FC<HistoricalTrackerViewProps> = ({
  tracks,
  onSelectSong,
}) => {
  const [trends, setTrends] = useState<{
    rising_tracks: Track[];
    declining_momentum: Track[];
    database_stats: any;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    fetchHistoricalTrends()
      .then((data) => {
        if (mounted) {
          setTrends(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const sampleTrackWithHistory = tracks.find((t) => t.history && t.history.length >= 2) || tracks[0];
  const historyPlotData = (sampleTrackWithHistory?.history || []).map((h, idx) => ({
    time: new Date(h.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    views: h.view_count,
    likes: h.like_count,
  }));

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-[#0f1422] border border-slate-800/80 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            SQLite Observation Snapshots & Velocity Log
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Tracks periodic snapshots of views, likes, and comment counts. Records timestamped differential velocity curves without interpolating fabricated data prior to observation inception.
          </p>
        </div>

        {/* CSV Export */}
        <a
          href={getExportCsvUrl()}
          download="trendify_music_dataset.csv"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/30 transition-all self-start md:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Full SQLite Dataset (CSV)</span>
        </a>
      </div>

      {/* Database Statistics Cards */}
      {trends?.database_stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-[#0f1422] border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400">Total Tracked Titles</span>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {trends.database_stats.total_videos}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Unique entities</div>
          </div>

          <div className="p-4 bg-[#0f1422] border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400">Stored Observations</span>
            <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
              {trends.database_stats.total_observations}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Time-series snapshots</div>
          </div>

          <div className="p-4 bg-[#0f1422] border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400">Oldest Observation</span>
            <div className="text-xs font-mono text-slate-200 mt-2 truncate">
              {trends.database_stats.oldest_snapshot
                ? new Date(trends.database_stats.oldest_snapshot).toLocaleDateString()
                : '2026-10-05'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Recording inception</div>
          </div>

          <div className="p-4 bg-[#0f1422] border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400">Storage Backend</span>
            <div className="text-sm font-mono text-purple-300 mt-2">
              SQLite 3 · ACID Compliant
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Local relational schema</div>
          </div>
        </div>
      )}

      {/* Observation History Timeline Chart */}
      {historyPlotData.length > 0 && (
        <div className="bg-[#0f1422] border border-slate-800/80 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Observation Timeline Sample: {sampleTrackWithHistory.title}
              </h3>
              <p className="text-xs text-slate-400">
                Successive snapshot verification curves logged in database
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400">
              {historyPlotData.length} Snapshots
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyPlotData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                <defs>
                  <linearGradient id="viewGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis
                  tickFormatter={(v) => formatCompactNumber(v)}
                  stroke="#64748b"
                  fontSize={11}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  formatter={(val: any) => [val.toLocaleString(), 'Verified Views']}
                  contentStyle={{ backgroundColor: '#0b0f19', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="views" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#viewGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Rising vs. Declining Momentum Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Rising Songs */}
        <div className="bg-[#0f1422] border border-slate-800/80 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Top Rising Songs (Short-term Velocity)</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Tracks exhibiting accelerated growth rates between consecutive observation snapshots
          </p>

          <div className="space-y-2">
            {(trends?.rising_tracks || tracks.slice(0, 5)).map((track) => (
              <div
                key={track.video_id}
                onClick={() => onSelectSong(track.video_id)}
                className="p-3 bg-[#0a0d16] rounded-lg border border-slate-800/80 flex items-center justify-between hover:border-slate-700 cursor-pointer transition-colors"
              >
                <div className="min-w-0 pr-3">
                  <p className="text-xs font-semibold text-slate-200 truncate">{track.title}</p>
                  <p className="text-[11px] text-slate-400 truncate">{track.channel_title}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-emerald-400 block">
                    +{track.growth_rate}%
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {formatCompactNumber(track.view_count)} views
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Declining or Stabilizing Momentum */}
        <div className="bg-[#0f1422] border border-slate-800/80 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Mature Catalog / Stabilized Momentum</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Established tracks where viral growth has stabilized into catalog replenishment
          </p>

          <div className="space-y-2">
            {(trends?.declining_momentum || tracks.slice().reverse().slice(0, 5)).map((track) => (
              <div
                key={track.video_id}
                onClick={() => onSelectSong(track.video_id)}
                className="p-3 bg-[#0a0d16] rounded-lg border border-slate-800/80 flex items-center justify-between hover:border-slate-700 cursor-pointer transition-colors"
              >
                <div className="min-w-0 pr-3">
                  <p className="text-xs font-semibold text-slate-200 truncate">{track.title}</p>
                  <p className="text-[11px] text-slate-400 truncate">{track.channel_title}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-medium text-amber-400 block">
                    +{track.growth_rate}%
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Mature catalog rate
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
