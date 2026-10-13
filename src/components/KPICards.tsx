import React from 'react';
import { OverviewKPIs } from '../types';
import { Video, Eye, ThumbsUp, Activity, Flame, TrendingUp } from 'lucide-react';

interface KPICardsProps {
  kpis: OverviewKPIs;
  onSongClick?: (videoId: string) => void;
}

export function formatCompactNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(2)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toString();
}

export const KPICards: React.FC<KPICardsProps> = ({ kpis, onSongClick }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {/* 1. Total Tracked Music Videos */}
      <div className="bg-[#0f1422] border border-slate-800/80 rounded-xl p-4 relative overflow-hidden shadow-sm hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400 font-medium">Tracked Videos</span>
          <div className="w-8 h-8 rounded-lg bg-purple-950/40 border border-purple-500/20 flex items-center justify-center">
            <Video className="w-4 h-4 text-purple-400" />
          </div>
        </div>
        <div className="text-2xl font-bold text-white tracking-tight">
          {kpis.total_videos}
        </div>
        <div className="mt-1 text-[11px] text-slate-400">
          Actively sampled catalog
        </div>
      </div>

      {/* 2. Total Views */}
      <div className="bg-[#0f1422] border border-slate-800/80 rounded-xl p-4 relative overflow-hidden shadow-sm hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400 font-medium">Total Views</span>
          <div className="w-8 h-8 rounded-lg bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center">
            <Eye className="w-4 h-4 text-cyan-400" />
          </div>
        </div>
        <div className="text-2xl font-bold text-white tracking-tight">
          {formatCompactNumber(kpis.total_views)}
        </div>
        <div className="mt-1 text-[11px] text-slate-400">
          Across tracked videos
        </div>
      </div>

      {/* 3. Total Likes */}
      <div className="bg-[#0f1422] border border-slate-800/80 rounded-xl p-4 relative overflow-hidden shadow-sm hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400 font-medium">Total Likes</span>
          <div className="w-8 h-8 rounded-lg bg-blue-950/40 border border-blue-500/20 flex items-center justify-center">
            <ThumbsUp className="w-4 h-4 text-blue-400" />
          </div>
        </div>
        <div className="text-2xl font-bold text-white tracking-tight">
          {formatCompactNumber(kpis.total_likes)}
        </div>
        <div className="mt-1 text-[11px] text-slate-400">
          Public positive ratings
        </div>
      </div>

      {/* 4. Average Engagement Rate */}
      <div className="bg-[#0f1422] border border-slate-800/80 rounded-xl p-4 relative overflow-hidden shadow-sm hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400 font-medium">Avg Engagement</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-center">
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
        <div className="text-2xl font-bold text-white tracking-tight">
          {kpis.average_engagement_rate}%
        </div>
        <div className="mt-1 text-[11px] text-slate-400">
          (Likes + Comments) / Views
        </div>
      </div>

      {/* 5. Fastest-Growing Tracked Song */}
      <div className="bg-[#0f1422] border border-slate-800/80 rounded-xl p-4 relative overflow-hidden shadow-sm hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400 font-medium">Fastest Growing</span>
          <div className="w-8 h-8 rounded-lg bg-rose-950/40 border border-rose-500/20 flex items-center justify-center">
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
        </div>
        {kpis.fastest_growing_song ? (
          <div
            className="cursor-pointer group"
            onClick={() => onSongClick && onSongClick(kpis.fastest_growing_song!.video_id)}
          >
            <div className="text-sm font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
              {kpis.fastest_growing_song.title}
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-slate-400 truncate max-w-[100px]">
                {kpis.fastest_growing_song.artist}
              </span>
              <span className="text-emerald-400 font-mono font-medium">
                +{kpis.fastest_growing_song.growth_rate}%
              </span>
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-400">Analyzing...</div>
        )}
      </div>

      {/* 6. Positive Growth Count */}
      <div className="bg-[#0f1422] border border-slate-800/80 rounded-xl p-4 relative overflow-hidden shadow-sm hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400 font-medium">Positive Growth</span>
          <div className="w-8 h-8 rounded-lg bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
        </div>
        <div className="text-2xl font-bold text-white tracking-tight">
          {kpis.positive_growth_count} <span className="text-xs text-slate-400 font-normal">/ {kpis.total_videos}</span>
        </div>
        <div className="mt-1 text-[11px] text-emerald-400/90 flex items-center gap-1">
          <span>Active upward momentum</span>
        </div>
      </div>
    </div>
  );
};
