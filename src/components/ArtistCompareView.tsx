import React, { useState, useEffect } from 'react';
import { ArtistComparisonRecord, Track } from '../types';
import { fetchArtistsComparison } from '../services/api';
import { formatCompactNumber } from './KPICards';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, Info, Check, Trophy, Sparkles } from 'lucide-react';

interface ArtistCompareViewProps {
  tracks: Track[];
  onSongSelect?: (videoId: string) => void;
}

export const ArtistCompareView: React.FC<ArtistCompareViewProps> = ({ tracks, onSongSelect }) => {
  const [artistsData, setArtistsData] = useState<ArtistComparisonRecord[]>([]);
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Extract distinct artists
  const allArtists = Array.from(new Set(tracks.map((t) => t.channel_title)));

  useEffect(() => {
    // Default to first 3 artists
    if (allArtists.length > 0 && selectedArtists.length === 0) {
      setSelectedArtists(allArtists.slice(0, 3));
    }
  }, [tracks]);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    fetchArtistsComparison(selectedArtists.length > 0 ? selectedArtists : undefined)
      .then((res) => {
        if (mounted) {
          setArtistsData(res.artists);
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
  }, [selectedArtists]);

  const toggleArtist = (name: string) => {
    if (selectedArtists.includes(name)) {
      if (selectedArtists.length > 1) {
        setSelectedArtists(selectedArtists.filter((a) => a !== name));
      }
    } else {
      if (selectedArtists.length < 5) {
        setSelectedArtists([...selectedArtists, name]);
      }
    }
  };

  const chartData = artistsData.map((a) => ({
    artist: a.artist.length > 16 ? a.artist.slice(0, 16) + '...' : a.artist,
    fullArtist: a.artist,
    views: a.total_views,
    likes: a.total_likes,
    engagement: a.average_engagement_rate,
    videos: a.tracked_videos_count,
  }));

  return (
    <div className="space-y-6">
      {/* Header and Artist Picker */}
      <div className="bg-[#0f1422] border border-slate-800/80 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              Multi-Artist Performance Comparison
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select 2 to 5 artists from the tracked catalog to compare aggregate metrics side-by-side.
            </p>
          </div>
          <span className="text-xs font-mono text-purple-400">
            {selectedArtists.length} Selected (Max 5)
          </span>
        </div>

        {/* Artist Chips (Clickable selectors) */}
        <div className="flex flex-wrap gap-2 pt-1">
          {allArtists.map((artist) => {
            const isSelected = selectedArtists.includes(artist);
            return (
              <button
                key={artist}
                onClick={() => toggleArtist(artist)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-[#111625] text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5" />}
                <span>{artist}</span>
              </button>
            );
          })}
        </div>

        {/* Prompt-mandated disclaimer notice */}
        <div className="p-3 bg-[#0a0d16] rounded-lg border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.2" />
          <span>
            <strong>Data Scope Notice:</strong> Results reflect the specific video records collected and tracked by Trendify AI. They do not constitute an artist's complete lifetime discography or total streaming count across other platforms like Spotify or Apple Music.
          </span>
        </div>
      </div>

      {/* Comparative Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {artistsData.map((art) => (
          <div
            key={art.artist}
            className="bg-[#0f1422] border border-slate-800/80 rounded-xl p-5 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white truncate max-w-[180px]">
                  {art.artist}
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-500/30">
                  {art.tracked_videos_count} Tracked Videos
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                <div className="p-2.5 bg-[#0a0d16] rounded-lg border border-slate-800/60">
                  <span className="text-slate-400 block text-[11px]">Total Views</span>
                  <span className="text-base font-bold font-mono text-white mt-0.5 block">
                    {formatCompactNumber(art.total_views)}
                  </span>
                </div>
                <div className="p-2.5 bg-[#0a0d16] rounded-lg border border-slate-800/60">
                  <span className="text-slate-400 block text-[11px]">Avg Engagement</span>
                  <span className="text-base font-bold font-mono text-cyan-400 mt-0.5 block">
                    {art.average_engagement_rate}%
                  </span>
                </div>
              </div>

              {/* Best Performing Video */}
              {art.best_performing_video && (
                <div className="p-3 bg-[#111625] rounded-lg border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-semibold mb-1">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Top Track in Tracked Cohort</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-200 line-clamp-1">
                    {art.best_performing_video.title}
                  </p>
                  <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
                    <span>{art.best_performing_video.views.toLocaleString()} views</span>
                    {onSongSelect && (
                      <button
                        onClick={() => onSongSelect(art.best_performing_video.video_id)}
                        className="text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        Inspect →
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-slate-400 flex justify-between">
              <span>Tracked Likes:</span>
              <span className="font-mono text-slate-300">{formatCompactNumber(art.total_likes)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Comparative Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Total Views Comparison Bar Chart */}
        <div className="bg-[#0f1422] border border-slate-800/80 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-white mb-1">Total Tracked Views by Artist</h3>
          <p className="text-xs text-slate-400 mb-4">Volume comparison across selected artists</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="artist" stroke="#64748b" fontSize={11} />
                <YAxis tickFormatter={(v) => formatCompactNumber(v)} stroke="#64748b" fontSize={11} />
                <Tooltip
                  formatter={(val: any) => [formatCompactNumber(val), 'Tracked Views']}
                  contentStyle={{ backgroundColor: '#0b0f19', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="views" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Average Engagement Comparison */}
        <div className="bg-[#0f1422] border border-slate-800/80 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-white mb-1">Average Audience Engagement Rate</h3>
          <p className="text-xs text-slate-400 mb-4">Engagement density comparison (%)</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="artist" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} unit="%" />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Engagement Rate']}
                  contentStyle={{ backgroundColor: '#0b0f19', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="engagement" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
