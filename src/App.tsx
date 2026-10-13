import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { KPICards } from './components/KPICards';
import { Charts } from './components/Charts';
import { TrendingExplorer } from './components/TrendingExplorer';
import { MLPredictorView } from './components/MLPredictorView';
import { ArtistCompareView } from './components/ArtistCompareView';
import { HistoricalTrackerView } from './components/HistoricalTrackerView';
import { AIInsightsView } from './components/AIInsightsView';
import { APIStatusView } from './components/APIStatusView';
import { SongModal } from './components/SongModal';
import { Track, OverviewData } from './types';
import {
  fetchOverviewAnalytics,
  fetchTrending,
  searchMusic,
  refreshData,
  fetchSongDetails
} from './services/api';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [selectedRegion, setSelectedRegion] = useState<string>('GLOBAL');
  const [limit, setLimit] = useState<number>(25);
  const [sortBy, setSortBy] = useState<string>('views');
  const [yearFilter, setYearFilter] = useState<number | null>(null);

  const [tracks, setTracks] = useState<Track[]>([]);
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Selected song for details modal
  const [selectedSongModal, setSelectedSongModal] = useState<Track | null>(null);
  // Song targeted for prediction
  const [targetPredictionId, setTargetPredictionId] = useState<string>('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadAllData = async (region = selectedRegion) => {
    setIsLoading(true);
    setError(null);
    try {
      const [overviewRes, trendingRes] = await Promise.all([
        fetchOverviewAnalytics(region),
        fetchTrending({ limit: 50, region, sortBy, publishedYear: yearFilter || undefined }),
      ]);
      setOverviewData(overviewRes);
      setTracks(trendingRes.items);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to connect to analytics engine');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData(selectedRegion);
  }, [selectedRegion, sortBy, yearFilter]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await refreshData(selectedRegion);
      showToast(`Refreshed ${res.updated_records} tracks via ${res.source}`);
      await loadAllData(selectedRegion);
    } catch (err: any) {
      showToast(`Refresh error: ${err.message}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query) {
      loadAllData(selectedRegion);
      return;
    }
    setIsLoading(true);
    try {
      const res = await searchMusic(query, selectedRegion, 50);
      setTracks(res.results);
      setCurrentTab('explorer');
      showToast(`Found ${res.count} tracks matching "${query}"`);
    } catch (err: any) {
      showToast(`Search failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSongInspect = async (videoId: string) => {
    try {
      const res = await fetchSongDetails(videoId);
      setSelectedSongModal(res.song);
    } catch (err) {
      // Fallback to finding in active array
      const found = tracks.find((t) => t.video_id === videoId);
      if (found) setSelectedSongModal(found);
    }
  };

  const handleTriggerPrediction = (videoId: string) => {
    setTargetPredictionId(videoId);
    setCurrentTab('prediction');
  };

  return (
    <div className="flex h-screen bg-[#07090e] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        apiStatusOnline={!error}
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          onSearch={handleSearch}
          selectedRegion={selectedRegion}
          onRegionChange={setSelectedRegion}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          lastRefreshedAt={overviewData?.kpis?.last_refreshed_at}
        />

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed bottom-6 right-6 z-50 bg-[#111625] border border-purple-500/50 text-purple-200 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-medium flex items-center gap-2 animate-bounce">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-4 text-xs text-rose-300 flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => loadAllData(selectedRegion)}
                className="px-2.5 py-1 rounded bg-rose-900/60 text-white font-medium hover:bg-rose-800"
              >
                Retry
              </button>
            </div>
          )}

          {/* TAB 1: Overview Dashboard */}
          {currentTab === 'overview' && overviewData && (
            <div className="space-y-6">
              {/* KPIs Header */}
              <KPICards
                kpis={overviewData.kpis}
                onSongClick={handleSongInspect}
              />

              {/* Visualization Suites */}
              <Charts
                data={overviewData}
                onSongSelect={handleSongInspect}
              />

              {/* Top Trending Music Preview Table */}
              <div className="bg-[#0f1422] border border-slate-800/80 rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Current Chart Leaders Preview
                    </h3>
                    <p className="text-xs text-slate-400">
                      Top ranking tracks in the active dataset
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentTab('explorer')}
                    className="text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    View All Tracks in Explorer →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {tracks.slice(0, 4).map((t) => (
                    <div
                      key={t.video_id}
                      onClick={() => handleSongInspect(t.video_id)}
                      className="p-3 bg-[#0a0d16] border border-slate-800/80 rounded-lg hover:border-slate-700 cursor-pointer transition-all flex items-center gap-3 group"
                    >
                      <img
                        src={t.thumbnail_url}
                        alt={t.title}
                        className="w-12 h-12 rounded object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-100 truncate group-hover:text-purple-300 transition-colors">
                          {t.title}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {t.channel_title}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 font-mono">
                          <span>{t.view_count.toLocaleString()} views</span>
                          <span>·</span>
                          <span className="text-emerald-400">+{t.growth_rate}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Trending Explorer */}
          {currentTab === 'explorer' && (
            <TrendingExplorer
              tracks={tracks}
              limit={limit}
              onLimitChange={setLimit}
              sortBy={sortBy}
              onSortChange={setSortBy}
              yearFilter={yearFilter}
              onYearFilterChange={setYearFilter}
              onSelectSong={handleSongInspect}
            />
          )}

          {/* TAB 3: Machine Learning Trend Prediction */}
          {currentTab === 'prediction' && (
            <MLPredictorView
              tracks={tracks}
              initialSelectedId={targetPredictionId}
              onSelectSong={handleSongInspect}
            />
          )}

          {/* TAB 4: Historical Tracker */}
          {currentTab === 'history' && (
            <HistoricalTrackerView
              tracks={tracks}
              onSelectSong={handleSongInspect}
            />
          )}

          {/* TAB 5: Artist Comparison */}
          {currentTab === 'artists' && (
            <ArtistCompareView
              tracks={tracks}
              onSongSelect={handleSongInspect}
            />
          )}

          {/* TAB 6: AI Music Insights */}
          {currentTab === 'insights' && (
            <AIInsightsView
              region={selectedRegion}
            />
          )}

          {/* TAB 7: API Status & Settings */}
          {currentTab === 'status' && (
            <APIStatusView />
          )}
        </main>
      </div>

      {/* Deep-Dive Song Modal */}
      <SongModal
        song={selectedSongModal}
        onClose={() => setSelectedSongModal(null)}
        onPredict={handleTriggerPrediction}
      />
    </div>
  );
}
