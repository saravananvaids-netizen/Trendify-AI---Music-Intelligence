import React, { useState } from 'react';
import { Search, RefreshCw, Download, Globe, Check } from 'lucide-react';
import { getExportCsvUrl } from '../services/api';

interface HeaderProps {
  onSearch: (query: string) => void;
  selectedRegion: string;
  onRegionChange: (region: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastRefreshedAt?: string;
}

const REGIONS = [
  { code: 'GLOBAL', label: 'Global (Worldwide)' },
  { code: 'US', label: 'United States (US)' },
  { code: 'IN', label: 'India (IN)' },
  { code: 'JP', label: 'Japan (JP)' },
  { code: 'BR', label: 'Brazil (BR)' },
  { code: 'GB', label: 'United Kingdom (GB)' },
];

export const Header: React.FC<HeaderProps> = ({
  onSearch,
  selectedRegion,
  onRegionChange,
  onRefresh,
  isRefreshing,
  lastRefreshedAt,
}) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
    }
  };

  return (
    <header className="h-16 bg-[#0a0d16]/95 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Search Bar */}
      <form onSubmit={handleSubmit} className="relative w-80 lg:w-96">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search trending songs, artists, or channels..."
          className="w-full bg-[#111625] text-slate-200 text-xs pl-9 pr-4 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/50 placeholder:text-slate-500 transition-all"
        />
        {searchInput && (
          <button
            type="button"
            onClick={() => {
              setSearchInput('');
              onSearch('');
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs px-1"
          >
            ×
          </button>
        )}
      </form>

      {/* Control Actions: Region Selector, Refresh, CSV Download */}
      <div className="flex items-center gap-3">
        {/* Country Selector */}
        <div className="flex items-center gap-1.5 bg-[#111625] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs">
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <select
            value={selectedRegion}
            onChange={(e) => onRegionChange(e.target.value)}
            className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer pr-1"
          >
            {REGIONS.map((r) => (
              <option key={r.code} value={r.code} className="bg-[#111625] text-slate-200">
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Refresh Live Data */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-900/40 border border-purple-500/30 text-purple-300 hover:bg-purple-900/60 hover:text-purple-200 text-xs font-medium transition-all disabled:opacity-50"
          title="Refresh current YouTube chart snapshots"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
        </button>

        {/* CSV Export */}
        <a
          href={getExportCsvUrl()}
          download="trendify_music_dataset.csv"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111625] border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all"
          title="Download tracked dataset as CSV"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Export CSV</span>
        </a>

        {/* Timestamp */}
        {lastRefreshedAt && (
          <span className="text-[11px] text-slate-400 hidden xl:inline font-mono">
            {new Date(lastRefreshedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </header>
  );
};
