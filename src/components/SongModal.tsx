import React from 'react';
import { Track } from '../types';
import { formatCompactNumber } from './KPICards';
import { X, ExternalLink, Sparkles, Eye, ThumbsUp, MessageSquare, Share2, Calendar, Clock, BarChart2 } from 'lucide-react';

interface SongModalProps {
  song: Track | null;
  onClose: () => void;
  onPredict: (videoId: string) => void;
}

export const SongModal: React.FC<SongModalProps> = ({ song, onClose, onPredict }) => {
  if (!song) return null;

  const pubDateStr = song.published_at
    ? new Date(song.published_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Unknown Date';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0f1422] border border-slate-700/80 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/60 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-700/50"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Video Thumbnail & Banner Header */}
        <div className="relative h-56 bg-slate-900 overflow-hidden">
          <img
            src={song.thumbnail_url}
            alt={song.title}
            className="w-full h-full object-cover filter brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f1422] via-[#0f1422]/40 to-transparent" />

          <div className="absolute bottom-4 left-6 right-6">
            <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-semibold bg-purple-950/70 border border-purple-500/30 px-2 py-0.5 rounded">
              YouTube Music Track · {song.country_code}
            </span>
            <h2 className="text-xl font-bold text-white mt-1 leading-tight line-clamp-2">
              {song.title}
            </h2>
            <p className="text-xs text-purple-200 mt-0.5 font-medium">
              {song.channel_title}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Core Raw Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-[#0a0d16] border border-slate-800 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>Views</span>
              </div>
              <div className="text-base font-bold font-mono text-white">
                {song.view_count.toLocaleString()}
              </div>
            </div>

            <div className="p-3 bg-[#0a0d16] border border-slate-800 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <ThumbsUp className="w-3.5 h-3.5 text-purple-400" />
                <span>Likes</span>
              </div>
              <div className="text-base font-bold font-mono text-white">
                {song.like_count !== null ? song.like_count.toLocaleString() : 'Unavailable'}
              </div>
            </div>

            <div className="p-3 bg-[#0a0d16] border border-slate-800 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                <span>Comments</span>
              </div>
              <div className="text-base font-bold font-mono text-white">
                {song.comment_count !== null ? song.comment_count.toLocaleString() : 'Unavailable'}
              </div>
            </div>

            <div className="p-3 bg-[#0a0d16] border border-slate-800 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Public Shares</span>
              </div>
              <div className="text-sm font-mono text-slate-400 font-medium">
                {song.shares_display || 'Unavailable'}
              </div>
            </div>
          </div>

          {/* Engagement Rates Section */}
          <div className="bg-[#0a0d16] border border-slate-800/80 rounded-xl p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-purple-400" />
              Verified Engagement Rates
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-[#111625] rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400">Like Rate</span>
                <div className="text-lg font-bold font-mono text-purple-300 mt-0.5">
                  {song.like_rate !== null ? `${song.like_rate}%` : '—'}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">
                  (Likes / Views) × 100
                </div>
              </div>

              <div className="p-3 bg-[#111625] rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400">Comment Rate</span>
                <div className="text-lg font-bold font-mono text-blue-300 mt-0.5">
                  {song.comment_rate !== null ? `${song.comment_rate}%` : '—'}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">
                  (Comments / Views) × 100
                </div>
              </div>

              <div className="p-3 bg-[#111625] rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400">Interaction Rate</span>
                <div className="text-lg font-bold font-mono text-cyan-300 mt-0.5">
                  {song.interaction_rate !== null ? `${song.interaction_rate}%` : '—'}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">
                  ((Likes + Comments) / Views) × 100
                </div>
              </div>
            </div>
          </div>

          {/* Transparent Popularity Score Formula Breakdown */}
          <div className="bg-[#0a0d16] border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-slate-300">
                Transparent Popularity Score: <span className="text-purple-400 font-mono text-sm">{song.popularity_score || 50}/100</span>
              </h4>
              <span className="text-[10px] font-mono text-slate-400">Multi-factor Algorithm</span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
              Avoids equating raw lifetime playback with current momentum. Combines normalized view volume (40%), audience interaction intensity (30%), recency & velocity (20%), and positive growth acceleration (10%).
            </p>

            {song.formula_breakdown && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                <div className="p-2 bg-[#111625] rounded border border-slate-800/60">
                  <span className="text-slate-400 block text-[10px]">Volume (40%)</span>
                  <span className="text-slate-200">{song.formula_breakdown.normalized_view_volume} pts</span>
                </div>
                <div className="p-2 bg-[#111625] rounded border border-slate-800/60">
                  <span className="text-slate-400 block text-[10px]">Interactions (30%)</span>
                  <span className="text-slate-200">{song.formula_breakdown.normalized_engagement} pts</span>
                </div>
                <div className="p-2 bg-[#111625] rounded border border-slate-800/60">
                  <span className="text-slate-400 block text-[10px]">Velocity/Age (20%)</span>
                  <span className="text-slate-200">{song.formula_breakdown.recency_velocity} pts</span>
                </div>
                <div className="p-2 bg-[#111625] rounded border border-slate-800/60">
                  <span className="text-slate-400 block text-[10px]">Growth Bonus (10%)</span>
                  <span className="text-slate-200">{song.formula_breakdown.growth_bonus} pts</span>
                </div>
              </div>
            )}
          </div>

          {/* Metadata & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {pubDateStr}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Age: {song.video_age_days} days
              </span>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={`https://www.youtube.com/watch?v=${song.video_id}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#111625] border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Watch on YouTube</span>
              </a>

              <button
                onClick={() => {
                  onClose();
                  onPredict(song.video_id);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/30 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Predict Trend with ML</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
