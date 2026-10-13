import React from 'react';
import {
  LayoutDashboard,
  Compass,
  TrendingUp,
  History,
  Users,
  Sparkles,
  Server,
  Music2,
  ExternalLink
} from 'lucide-react';

export type NavTab = 
  | 'overview' 
  | 'explorer' 
  | 'prediction' 
  | 'history' 
  | 'artists' 
  | 'insights' 
  | 'status';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  apiStatusOnline?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  apiStatusOnline = true,
}) => {
  const navItems = [
    { id: 'overview' as NavTab, label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'explorer' as NavTab, label: 'Trending Explorer', icon: Compass },
    { id: 'prediction' as NavTab, label: 'AI Trend Predictor', icon: TrendingUp },
    { id: 'history' as NavTab, label: 'Historical Tracker', icon: History },
    { id: 'artists' as NavTab, label: 'Artist Comparison', icon: Users },
    { id: 'insights' as NavTab, label: 'AI Music Insights', icon: Sparkles },
    { id: 'status' as NavTab, label: 'API & Model Status', icon: Server },
  ];

  return (
    <aside className="w-64 bg-[#0a0d16] border-r border-slate-800/80 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-purple-900/20">
            <div className="w-full h-full bg-[#0a0d16] rounded-[10px] flex items-center justify-center">
              <Music2 className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-white">Trendify</span>
              <span className="font-semibold text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">AI</span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal">2026 Music Intelligence</p>
          </div>
        </div>

        <p className="mt-3 text-[11px] text-slate-400 leading-snug">
          Discover Trends · Analyze Music · Predict Tomorrow
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="p-3 flex-1 space-y-1">
        <div className="px-3 pt-2 pb-1 text-[10px] font-semibold tracking-wider uppercase text-slate-400">
          Analytics & Models
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left group ${
                isActive
                  ? 'bg-purple-900/30 text-purple-300 border border-purple-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive ? 'text-purple-400' : 'text-slate-500 group-hover:text-slate-300'
                }`}
              />
              <span>{item.label}</span>
              {item.id === 'prediction' && (
                <span className="ml-auto text-[10px] px-1.5 py-0.2 text-cyan-400 bg-cyan-950/40 rounded border border-cyan-800/40">
                  ML
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info & API Monitor Status */}
      <div className="p-4 border-t border-slate-800/60 bg-[#080b12]">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-400">System Status</span>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                apiStatusOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-slate-300 text-[11px] font-mono">
              {apiStatusOnline ? 'ONLINE' : 'FALLBACK'}
            </span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 space-y-0.5">
          <div className="flex justify-between">
            <span>Data Engine</span>
            <span className="text-slate-300 font-mono">YouTube v3</span>
          </div>
          <div className="flex justify-between">
            <span>ML Core</span>
            <span className="text-slate-300 font-mono">Scikit-learn</span>
          </div>
          <div className="flex justify-between">
            <span>Database</span>
            <span className="text-slate-300 font-mono">SQLite (Persistent)</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-800/40 text-[10px] text-slate-400 flex items-center justify-between">
          <span>Active Year: 2026</span>
          <span className="text-purple-400/80 font-mono">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};
