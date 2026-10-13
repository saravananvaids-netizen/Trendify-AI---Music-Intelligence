import {
  Track,
  OverviewData,
  ArtistComparisonRecord,
  MLPredictionResult,
  AIInsightsData,
  HealthStatus
} from '../types';

const BASE_URL = '/api';

export async function fetchHealth(): Promise<HealthStatus> {
  const res = await fetch(`${BASE_URL}/health`);
  if (!res.ok) throw new Error('Failed to fetch health status');
  return res.json();
}

export async function fetchTrending(params: {
  limit?: number;
  region?: string;
  sortBy?: string;
  publishedYear?: number;
}): Promise<{
  count: number;
  total_available: number;
  region: string;
  sort_by: string;
  items: Track[];
  data_notice?: string;
  last_refresh_time?: string;
}> {
  const searchParams = new URLSearchParams();
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.region) searchParams.set('region', params.region);
  if (params.sortBy) searchParams.set('sort_by', params.sortBy);
  if (params.publishedYear) searchParams.set('published_year', params.publishedYear.toString());

  const res = await fetch(`${BASE_URL}/trending?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch trending music');
  return res.json();
}

export async function searchMusic(q: string, region = 'GLOBAL', limit = 25): Promise<{
  query: string;
  count: number;
  results: Track[];
}> {
  const searchParams = new URLSearchParams({ q, region, limit: limit.toString() });
  const res = await fetch(`${BASE_URL}/search?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

export async function fetchSongDetails(videoId: string): Promise<{
  song: Track;
  history: Array<{ timestamp: string; view_count: number; like_count: number | null }>;
  history_count: number;
}> {
  const res = await fetch(`${BASE_URL}/song/${videoId}`);
  if (!res.ok) throw new Error(`Failed to fetch song ${videoId}`);
  return res.json();
}

export async function fetchOverviewAnalytics(region = 'GLOBAL'): Promise<OverviewData> {
  const res = await fetch(`${BASE_URL}/analytics/overview?region=${region}`);
  if (!res.ok) throw new Error('Failed to fetch overview analytics');
  return res.json();
}

export async function fetchArtistsComparison(artists?: string[]): Promise<{
  count: number;
  artists: ArtistComparisonRecord[];
  disclaimer: string;
}> {
  const params = artists && artists.length > 0 ? `?artists=${encodeURIComponent(artists.join(','))}` : '';
  const res = await fetch(`${BASE_URL}/analytics/artists${params}`);
  if (!res.ok) throw new Error('Failed to fetch artist comparisons');
  return res.json();
}

export async function fetchHistoricalTrends(): Promise<{
  rising_tracks: Track[];
  declining_momentum: Track[];
  database_stats: {
    total_videos: number;
    total_observations: number;
    oldest_snapshot?: string;
    latest_snapshot?: string;
  };
}> {
  const res = await fetch(`${BASE_URL}/analytics/history`);
  if (!res.ok) throw new Error('Failed to fetch historical trends');
  return res.json();
}

export async function fetchPrediction(
  videoId: string,
  horizonDays = 7,
  demoMode = false
): Promise<MLPredictionResult> {
  const res = await fetch(
    `${BASE_URL}/predictions/${videoId}?horizon_days=${horizonDays}&demo_mode=${demoMode}`
  );
  if (!res.ok) throw new Error('Failed to compute machine learning prediction');
  return res.json();
}

export async function refreshData(region = 'US'): Promise<{
  status: string;
  updated_records: number;
  region: string;
  timestamp: string;
  source: string;
}> {
  const res = await fetch(`${BASE_URL}/refresh?region=${region}`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to refresh data');
  return res.json();
}

export function getExportCsvUrl(): string {
  return `${BASE_URL}/export/csv`;
}

export async function fetchInsights(region = 'GLOBAL'): Promise<AIInsightsData> {
  const res = await fetch(`${BASE_URL}/insights?region=${region}`);
  if (!res.ok) throw new Error('Failed to generate insights');
  return res.json();
}
