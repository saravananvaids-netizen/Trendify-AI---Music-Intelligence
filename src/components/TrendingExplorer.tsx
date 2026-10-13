import React, { useState } from 'react';
import { Track } from '../types';
import { formatCompactNumber } from './KPICards';
import { ExternalLink, Flame, ThumbsUp, Eye, MessageSquare, Play, Sparkles } from 'lucide-react';

interface TrendingExplorerProps {
  tracks: Track[];
  limit: number;
  onLimitChange: (limit: number) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  yearFilter: number | null;
  onYearFilterChange: (year: number | null) => void;
  onSelectSong: (videoId: string) => void;
}

export const TrendingExplorer: React.FC<TrendingExplorerProps> = ({
  tracks,
  limit,
  onLimitChange,
  sortBy,
  onSortChange,
  yearFilter,
  onYearFilterChange,
  onSelectSong,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTracks = tracks.filter((t) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return t.title.toLowerCase().includes(q) || t.channel_title.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      {/* Controls Bar: Top 10/25/50, Sort, Year Filter */}
      <div className="bg-[#0f1422] border border-slate-800/80 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Ranking mode buttons */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400 mr-1">Display Limit:</span>
          {[10, 25, 50].map((l) => (
            <button
              key={l}
              onClick={() => onLimitChange(l)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                limit === l
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-[#111625] text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Top {l}
            </button>
          ))}
        </div>

        {/* Sort by dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-[#111625] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="views">Most Views</option>
            <option value="likes">Most Likes</option>
            <option value="engagement">Highest Engagement Rate</option>
            <option value="growth">Fastest Growth Rate</option>
            <option value="popularity">Popularity Score</option>
          </select>
        </div>

        {/* Year Filter: All, 2026 Releases, 2024-2025 */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400 mr-1">Release Year:</span>
          <button
            onClick={() => onYearFilterChange(null)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
              yearFilter === null
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-[#111625] text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            All Years
          </button>
          <button
            onClick={() => onYearFilterChange(2026)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
              yearFilter === 2026
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'bg-[#111625] text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            2026 Releases
          </button>
        </div>

        {/* Quick In-List Search Filter */}
        <div className="w-full sm:w-60">
          <input
            type="text"
            placeholder="Quick filter in list..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111625] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Table of Songs */}
      <div className="bg-[#0f1422] border border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 bg-[#0a0d16]/70 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 text-center w-12">#</th>
                <th className="py-3 px-4">Song & Artist</th>
                <th className="py-3 px-4 text-right">Views</th>
                <th className="py-3 px-4 text-right">Likes</th>
                <th className="py-3 px-4 text-right">Engagement</th>
                <th className="py-3 px-4 text-right">Popularity</th>
                <th className="py-3 px-4 text-right">Growth</th>
                <th className="py-3 px-4 text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-xs text-slate-200">
              {filteredTracks.map((track, idx) => {
                const pubYear = track.published_at ? new Date(track.published_at).getFullYear() : '—';
                const rankNumber = track.rank || idx + 1;

                return (
                  <tr
                    key={track.video_id}
                    className="hover:bg-slate-900/60 transition-colors group cursor-pointer"
                    onClick={() => onSelectSong(track.video_id)}
                  >
                    {/* Rank */}
                    <td className="py-3 px-4 text-center font-mono text-slate-400 group-hover:text-purple-400 font-medium">
                      {rankNumber}
                    </td>

                    {/* Thumbnail, Title, Artist, and Year */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-9 rounded-md overflow-hidden bg-slate-800 shrink-0 relative">
                          <img
                            src={track.thumbnail_url}
                            alt={track.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                        <div className="min-w-0 max-w-sm lg:max-w-md">
                          <p className="font-semibold text-slate-100 truncate group-hover:text-purple-300 transition-colors">
                            {track.title}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span className="truncate">{track.channel_title}</span>
                            <span>·</span>
                            <span>{pubYear}</span>
                            <span>·</span>
                            <span className="text-slate-400">{track.country_code}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Views */}
                    <td className="py-3 px-4 text-right font-mono font-medium text-slate-100">
                      {track.view_count.toLocaleString()}
                    </td>

                    {/* Likes */}
                    <td className="py-3 px-4 text-right font-mono text-slate-300">
                      {track.like_count !== null ? track.like_count.toLocaleString() : 'Unavailable'}
                    </td>

                    {/* Engagement Rate */}
                    <td className="py-3 px-4 text-right">
                      {track.interaction_rate !== null ? (
                        <span className="font-mono text-cyan-400 font-medium">
                          {track.interaction_rate}%
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>

                    {/* Popularity Score */}
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-950/40 border border-purple-500/20 text-purple-300 font-mono font-semibold text-xs">
                        {track.popularity_score || 50}/100
                      </div>
                    </td>

                    {/* Growth Rate */}
                    <td className="py-3 px-4 text-right">
                      <span className="font-mono text-emerald-400 font-medium">
                        +{track.growth_rate}%
                      </span>
                    </td>

                    {/* Actions: View / External YouTube */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectSong(track.video_id);
                          }}
                          className="p-1.5 rounded hover:bg-purple-900/40 text-purple-400 hover:text-purple-300 transition-colors"
                          title="Deep Analytics & ML Predict"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={`https://www.youtube.com/watch?v=${track.video_id}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                          title="Open on YouTube"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredTracks.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-xs">
            No music tracks matched the search or filter criteria.
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
        <span>Showing {filteredTracks.length} of {tracks.length} tracked tracks</span>
        <span>Public share counts: Unavailable via API</span>
      </div>
    </div>
  );
};
