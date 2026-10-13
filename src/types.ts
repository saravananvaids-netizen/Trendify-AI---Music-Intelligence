export interface Track {
  video_id: string;
  title: string;
  channel_title: string;
  channel_id?: string;
  published_at: string;
  thumbnail_url: string;
  country_code: string;
  view_count: number;
  like_count: number | null;
  comment_count: number | null;
  category_id?: string;
  data_source?: string;
  video_age_days?: number;
  like_rate?: number | null;
  comment_rate?: number | null;
  interaction_rate?: number | null;
  share_count?: number | null;
  shares_display?: string;
  daily_velocity?: number;
  growth_rate?: number;
  is_positive_growth?: boolean;
  popularity_score?: number;
  rank?: number;
  formula_breakdown?: {
    view_factor_weight: string;
    engagement_factor_weight: string;
    velocity_recency_weight: string;
    growth_bonus_weight: string;
    normalized_view_volume: number;
    normalized_engagement: number;
    recency_velocity: number;
    growth_bonus: number;
  };
  history?: Array<{
    timestamp: string;
    view_count: number;
    like_count: number | null;
  }>;
}

export interface OverviewKPIs {
  total_videos: number;
  total_views: number;
  total_likes: number;
  average_engagement_rate: number;
  fastest_growing_song: {
    video_id: string;
    title: string;
    artist: string;
    growth_rate: number;
    views: number;
    thumbnail_url?: string;
  } | null;
  positive_growth_count: number;
  data_notice?: string;
  last_refreshed_at?: string;
}

export interface CorrelationMatrixData {
  features: string[];
  matrix: number[][];
  columns?: string[];
}

export interface CountryTrend {
  country_code: string;
  country_name: string;
  video_count: number;
  total_views: number;
  total_likes: number;
  avg_engagement_rate: number;
}

export interface EngagementDistributionBucket {
  range: string;
  min: number;
  max: number;
  count: number;
}

export interface OverviewData {
  kpis: OverviewKPIs;
  top_10_trending: Array<{
    title: string;
    full_title: string;
    artist: string;
    views: number;
    likes: number | null;
    popularity_score?: number;
    interaction_rate?: number | null;
  }>;
  views_vs_likes_scatter: Array<{
    video_id: string;
    title: string;
    artist: string;
    views: number;
    likes: number | null;
    interaction_rate: number | null;
    age_days?: number;
  }>;
  correlation_matrix: CorrelationMatrixData;
  country_trends: CountryTrend[];
  engagement_distribution: EngagementDistributionBucket[];
}

export interface ArtistComparisonRecord {
  artist: string;
  tracked_videos_count: number;
  total_views: number;
  total_likes: number;
  average_engagement_rate: number;
  best_performing_video: {
    title: string;
    views: number;
    video_id: string;
    thumbnail_url: string;
  };
  tracks: Array<{
    video_id: string;
    title: string;
    views: number;
    likes: number | null;
    popularity_score?: number;
  }>;
}

export interface MLPredictionResult {
  video_id: string;
  title: string;
  artist: string;
  current_views: number;
  horizon_days: number;
  predicted_views: number;
  projected_growth_rate: number;
  predicted_category: 'High' | 'Medium' | 'Low';
  category_color: string;
  category_description: string;
  feature_importance: Array<{
    feature: string;
    importance: number;
    percentage: number;
  }>;
  evaluation_metrics: {
    mae: number;
    r2: number;
    model?: string;
  };
  trajectory: Array<{
    day: string;
    day_number: number;
    projected_views: number;
  }>;
  has_sufficient_history: boolean;
  is_simulated: boolean;
  status_notice?: string | null;
  influencing_features_summary: string;
  disclaimer: string;
}

export interface AIInsightsData {
  headline: string;
  executive_summary: string;
  fastest_gaining_analysis?: string;
  engagement_analysis?: string;
  emerging_patterns: string[];
  fastest_gaining?: Array<{
    title: string;
    artist: string;
    growth_rate: string;
    daily_velocity: string;
    views: string;
  }>;
  highest_engagement?: Array<{
    title: string;
    artist: string;
    like_rate: string;
    interaction_rate: string;
    views: string;
  }>;
  data_quality_notes?: string;
  source: string;
}

export interface HealthStatus {
  status: string;
  service: string;
  timestamp: string;
  database: {
    total_videos: number;
    total_observations: number;
    sqlite_file?: string;
  };
  youtube_api: {
    is_configured: boolean;
    data_source: string;
    quota_status?: string;
    quota_exceeded?: boolean;
    cache_hits?: number;
    total_calls?: number;
    last_error?: string | null;
  };
  ml_model: {
    engine?: string;
    model_type?: string;
    is_trained?: boolean;
    evaluation?: { mae: number; r2: number };
  };
}
