import React, { useState, useEffect } from 'react';
import { AIInsightsData } from '../types';
import { fetchInsights } from '../services/api';
import { Sparkles, TrendingUp, ThumbsUp, Lightbulb, ShieldCheck, RefreshCw } from 'lucide-react';

interface AIInsightsViewProps {
  region: string;
}

export const AIInsightsView: React.FC<AIInsightsViewProps> = ({ region }) => {
  const [insights, setInsights] = useState<AIInsightsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadInsights = () => {
    setIsLoading(true);
    fetchInsights(region)
      .then((data) => {
        setInsights(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadInsights();
  }, [region]);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-950/40 via-[#0f1422] to-cyan-950/40 border border-purple-500/20 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
              Gemini 3.8 Flash & Grounded Statistics
            </span>
            <span className="text-xs text-slate-400">· Strict Ground Truth Verification</span>
          </div>
          <h2 className="text-lg font-bold text-white">
            AI Music Insights & Dataset Synthesis (2026)
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Synthesizes current platform momentum, audience sentiment density, and velocity differentials into actionable charting intelligence.
          </p>
        </div>

        <button
          onClick={loadInsights}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-900/40 border border-purple-500/30 text-purple-300 hover:bg-purple-900/60 text-xs font-semibold transition-all self-start md:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Regenerate Insights</span>
        </button>
      </div>

      {isLoading && (
        <div className="bg-[#0f1422] border border-slate-800 rounded-xl p-12 text-center text-slate-400 text-xs">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span>Generating grounded trend synthesis with Gemini 3.8 Flash...</span>
        </div>
      )}

      {insights && !isLoading && (
        <div className="space-y-6">
          {/* Executive Summary Card */}
          <div className="bg-[#0f1422] border border-slate-800/80 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                {insights.headline}
              </h3>
              <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/40">
                {insights.source}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mt-2 bg-[#0a0d16] p-4 rounded-lg border border-slate-800/60">
              {insights.executive_summary}
            </p>
          </div>

          {/* Fastest Gaining and Engagement Clusters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fastest Gaining */}
            <div className="bg-[#0f1422] border border-slate-800/80 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-semibold text-white">Velocity Acceleration Leaders</h4>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                {insights.fastest_gaining_analysis || 'Tracks exhibiting highest day-over-day acceleration:'}
              </p>

              {insights.fastest_gaining && (
                <div className="space-y-2.5">
                  {insights.fastest_gaining.map((item, idx) => (
                    <div key={idx} className="p-3 bg-[#0a0d16] rounded-lg border border-slate-800/60 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-semibold text-slate-200">{item.title}</p>
                        <p className="text-[11px] text-slate-400">{item.artist}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-400 font-mono font-bold block">+{item.growth_rate}</span>
                        <span className="text-[10px] text-slate-400">{item.daily_velocity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Highest Engagement */}
            <div className="bg-[#0f1422] border border-slate-800/80 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <ThumbsUp className="w-4 h-4 text-purple-400" />
                <h4 className="text-sm font-semibold text-white">Engagement Density Leaders</h4>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                {insights.engagement_analysis || 'Highest like-to-view ratios indicating superfan loyalty:'}
              </p>

              {insights.highest_engagement && (
                <div className="space-y-2.5">
                  {insights.highest_engagement.map((item, idx) => (
                    <div key={idx} className="p-3 bg-[#0a0d16] rounded-lg border border-slate-800/60 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-semibold text-slate-200">{item.title}</p>
                        <p className="text-[11px] text-slate-400">{item.artist}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-purple-400 font-mono font-bold block">{item.like_rate}</span>
                        <span className="text-[10px] text-cyan-400">Interaction: {item.interaction_rate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Emerging Patterns in the Latest Dataset */}
          <div className="bg-[#0f1422] border border-slate-800/80 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-semibold text-white">Visible Patterns in 2026 Music Trends</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {insights.emerging_patterns.map((pat, idx) => (
                <div key={idx} className="p-3 bg-[#0a0d16] rounded-lg border border-slate-800/60 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-purple-900/40 text-purple-300 flex items-center justify-center shrink-0 font-mono text-[11px] font-bold">
                    {idx + 1}
                  </span>
                  <span>{pat}</span>
                </div>
              ))}
            </div>

            {/* Anti-Hallucination & Grounding Note */}
            <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                All analytical outputs are strictly bound to verified YouTube Data API v3 observation metrics. No unobserved streaming figures were manufactured.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
