import React, { useState, useEffect } from 'react';
import { Track, MLPredictionResult } from '../types';
import { fetchPrediction } from '../services/api';
import { formatCompactNumber } from './KPICards';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { Sparkles, Brain, AlertCircle, Info, CheckCircle2, TrendingUp, Sliders } from 'lucide-react';

interface MLPredictorViewProps {
  tracks: Track[];
  initialSelectedId?: string;
  onSelectSong?: (videoId: string) => void;
}

export const MLPredictorView: React.FC<MLPredictorViewProps> = ({
  tracks,
  initialSelectedId,
}) => {
  const [selectedId, setSelectedId] = useState<string>(
    initialSelectedId || (tracks[0]?.video_id || '')
  );
  const [horizonDays, setHorizonDays] = useState<number>(14);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [prediction, setPrediction] = useState<MLPredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialSelectedId) {
      setSelectedId(initialSelectedId);
    }
  }, [initialSelectedId]);

  useEffect(() => {
    if (!selectedId) return;

    let mounted = true;
    setIsLoading(true);
    setError(null);

    fetchPrediction(selectedId, horizonDays, isDemoMode)
      .then((data) => {
        if (mounted) {
          setPrediction(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message || 'Failed to load prediction');
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [selectedId, horizonDays, isDemoMode]);

  const selectedTrack = tracks.find((t) => t.video_id === selectedId);

  return (
    <div className="space-y-6">
      {/* Top Banner / Explainer */}
      <div className="bg-gradient-to-r from-purple-950/40 via-[#0f1422] to-cyan-950/30 border border-purple-500/20 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center shrink-0">
              <Brain className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Machine Learning Popularity Forecaster
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Scikit-Learn · RandomForest
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 max-w-2xl leading-relaxed">
                Estimates forward-looking playback volume, growth trajectories, and virality tiers by analyzing logarithmic view scales, interaction density, daily velocities, and non-linear decay curves.
              </p>
            </div>
          </div>

          {/* Demo Mode Toggle */}
          <div className="flex items-center gap-2 self-start md:self-auto bg-[#0a0d16] border border-slate-800 rounded-lg p-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <div className="text-xs text-slate-300">
              <label htmlFor="demo-toggle" className="cursor-pointer font-medium select-none">
                Simulated Demo Mode
              </label>
            </div>
            <input
              id="demo-toggle"
              type="checkbox"
              checked={isDemoMode}
              onChange={(e) => setIsDemoMode(e.target.checked)}
              className="accent-purple-600 cursor-pointer w-4 h-4"
            />
          </div>
        </div>

        {/* Prominent Simulated Banner when Demo Mode is Active */}
        {isDemoMode && (
          <div className="mt-3 py-1.5 px-3 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>
              <strong>Simulated Demo Mode Active:</strong> Projections use synthetic perturbation matrices for testing without requiring lengthy multi-week observation intervals.
            </span>
          </div>
        )}
      </div>

      {/* Track Selector & Horizon Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Track Picker */}
        <div className="md:col-span-2 bg-[#0f1422] border border-slate-800/80 rounded-xl p-4">
          <label className="text-xs font-semibold text-slate-400 block mb-2">
            Select Track to Analyze:
          </label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full bg-[#111625] border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            {tracks.map((t) => (
              <option key={t.video_id} value={t.video_id}>
                {t.title} ({t.channel_title}) — {formatCompactNumber(t.view_count)} views
              </option>
            ))}
          </select>
        </div>

        {/* Horizon Picker */}
        <div className="bg-[#0f1422] border border-slate-800/80 rounded-xl p-4">
          <label className="text-xs font-semibold text-slate-400 block mb-2">
            Forecast Horizon:
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {[7, 14, 30, 60].map((h) => (
              <button
                key={h}
                onClick={() => setHorizonDays(h)}
                className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                  horizonDays === h
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-[#111625] text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                +{h}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="bg-[#0f1422] border border-slate-800/80 rounded-xl p-12 text-center text-slate-400 text-xs">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span>Fitting Random Forest regressor & calculating trajectory weights...</span>
        </div>
      )}

      {error && !isLoading && (
        <div className="bg-rose-950/30 border border-rose-500/30 rounded-xl p-4 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Prediction Output Results */}
      {prediction && !isLoading && (
        <div className="space-y-6">
          {/* Top Outcome Metric Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Current Views */}
            <div className="bg-[#0f1422] border border-slate-800/80 rounded-xl p-4">
              <span className="text-xs text-slate-400">Current Observed Views</span>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {prediction.current_views.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Baseline snapshot</div>
            </div>

            {/* Projected Views */}
            <div className="bg-[#0f1422] border border-slate-800/80 rounded-xl p-4">
              <span className="text-xs text-slate-400">Estimated Views (+{prediction.horizon_days}d)</span>
              <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
                {prediction.predicted_views.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-400 mt-0.5 font-mono">
                +{prediction.projected_growth_rate}% expected growth
              </div>
            </div>

            {/* Popularity Classification Category */}
            <div className="bg-[#0f1422] border border-slate-800/80 rounded-xl p-4">
              <span className="text-xs text-slate-400">Predicted Category Tier</span>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider text-white"
                  style={{ backgroundColor: prediction.category_color }}
                >
                  {prediction.predicted_category}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                {prediction.category_description}
              </p>
            </div>

            {/* Model Evaluation Metrics (MAE & R2) */}
            <div className="bg-[#0f1422] border border-slate-800/80 rounded-xl p-4">
              <span className="text-xs text-slate-400">Validation Metrics (MAE / R²)</span>
              <div className="text-sm font-bold font-mono text-slate-200 mt-1">
                MAE: {formatCompactNumber(prediction.evaluation_metrics.mae)} · R²: {prediction.evaluation_metrics.r2}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Evaluated on historical split
              </div>
            </div>
          </div>

          {/* Insufficient History / Notice */}
          {prediction.status_notice && (
            <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3.5 text-xs text-amber-300/90 flex items-start gap-2.5">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <div>
                <p className="font-semibold text-amber-200">Sampling Horizon Notice</p>
                <p className="mt-0.5">{prediction.status_notice}</p>
              </div>
            </div>
          )}

          {/* Forecast Trajectory Chart */}
          <div className="bg-[#0f1422] border border-slate-800/80 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Trajectory Projection Curve ({prediction.horizon_days}-Day Window)
                </h3>
                <p className="text-xs text-slate-400">
                  Predicted playback decay curve computed by RandomForest momentum decay equations
                </p>
              </div>
              <span className="text-xs font-mono text-purple-400">
                Horizon: {prediction.horizon_days} Days
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={prediction.trajectory} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(v) => formatCompactNumber(v)}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip
                    formatter={(val: any) => [val.toLocaleString(), 'Estimated Views']}
                    contentStyle={{ backgroundColor: '#0b0f19', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="projected_views"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ fill: '#06b6d4', r: 4 }}
                    activeDot={{ r: 6, fill: '#ffffff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Feature Importance Visualization & Plain-Language Explanation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Feature Importance Ranking Chart */}
            <div className="bg-[#0f1422] border border-slate-800/80 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-white mb-1">Feature Importance Ranking</h3>
              <p className="text-xs text-slate-400 mb-4">
                Relative influence weights extracted from random forest tree splits
              </p>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prediction.feature_importance} layout="vertical" margin={{ top: 5, right: 30, left: 110, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis type="number" stroke="#64748b" fontSize={10} unit="%" />
                    <YAxis dataKey="feature" type="category" stroke="#94a3b8" fontSize={10} width={110} />
                    <Tooltip
                      formatter={(val: any) => [`${val}% weight`, 'Influence']}
                      contentStyle={{ backgroundColor: '#0b0f19', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Bar dataKey="percentage" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Explanation & Transparent Disclaimers */}
            <div className="bg-[#0f1422] border border-slate-800/80 rounded-xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">Algorithmic Interpretation</h3>
                <p className="text-xs text-slate-400 mb-3">Model decision logic summary</p>

                <div className="p-3 bg-[#0a0d16] rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
                  <p>{prediction.influencing_features_summary}</p>
                  <p className="text-slate-400">
                    The model incorporates diminishing marginal returns: songs with older catalog ages require significantly higher viral engagement rates to sustain double-digit growth.
                  </p>
                </div>
              </div>

              {/* Strict Disclaimers required by prompt */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Info className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span><strong>Disclaimer:</strong> {prediction.disclaimer}</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Public streaming statistics are subject to algorithmic shifts, artist promotional campaigns, and platform recommendation variance.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
