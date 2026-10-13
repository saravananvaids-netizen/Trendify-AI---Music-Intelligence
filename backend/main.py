"""
Trendify AI – FastAPI Backend Entrypoint
Provides REST API endpoints for music tracking, engagement analytics,
Scikit-learn trend predictions, CSV export, and AI insights.
"""

import os
import io
import csv
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import FastAPI, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv

from .database import (
    init_db,
    save_videos_and_observations,
    get_all_videos,
    get_video_by_id,
    get_video_history,
    get_database_stats,
    save_prediction,
)
from .youtube_api import YouTubeAPIClient, CURATED_2026_TRACKS
from .data_processor import process_video_collection, process_video_metrics
from .analytics import (
    compute_overview_kpis,
    compute_correlation_matrix,
    compute_artist_comparison,
    compute_engagement_distribution,
    compute_country_comparison,
)
from .ml_model import predictor
from .ai_insights import generate_ai_insights, generate_deterministic_insights

load_dotenv()

app = FastAPI(
    title="Trendify AI – Trending Music Analyzer 2026 API",
    description="Discover Trends. Analyze Music. Predict Tomorrow.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

youtube_client = YouTubeAPIClient()

# Initialize database and seed if empty on launch
@app.on_event("startup")
def startup_event():
    init_db()
    stats = get_database_stats()
    if stats["total_videos"] == 0:
        # Seed baseline catalog
        save_videos_and_observations(CURATED_2026_TRACKS)
        # Train baseline predictor
        predictor.train_or_fit(CURATED_2026_TRACKS)


def get_enriched_catalog(region: str = "GLOBAL") -> List[dict]:
    """Helper to fetch from DB and process all active entries."""
    db_videos = get_all_videos()
    if not db_videos:
        save_videos_and_observations(CURATED_2026_TRACKS)
        db_videos = get_all_videos()

    # Build history map
    histories = {}
    for v in db_videos:
        vid = v["video_id"]
        histories[vid] = get_video_history(vid)

    processed = process_video_collection(db_videos, histories)
    
    if region and region.upper() != "GLOBAL":
        filtered = [v for v in processed if v.get("country_code") == region.upper()]
        if filtered:
            return filtered
    return processed


@app.get("/api/health")
def health_check():
    """Health monitor endpoint with API status indicators."""
    db_stats = get_database_stats()
    return {
        "status": "online",
        "service": "Trendify AI – 2026 Analytics Service",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "database": db_stats,
        "youtube_api": {
            "is_configured": youtube_client.is_configured(),
            "quota_exceeded": youtube_client.status["quota_exceeded"],
            "cache_hits": youtube_client.status["cache_hits"],
            "total_calls": youtube_client.status["total_calls"],
            "last_error": youtube_client.status["last_error"],
        },
        "ml_model": {
            "model_type": "RandomForestRegressor",
            "is_trained": predictor.is_trained,
            "metrics": predictor.evaluation_metrics,
        }
    }


@app.get("/api/trending")
def get_trending_songs(
    limit: int = Query(50, ge=1, le=100),
    region: str = Query("GLOBAL", description="Country code (e.g., US, IN, JP, BR, GLOBAL)"),
    sort_by: str = Query("views", description="views, likes, engagement, growth, popularity"),
    published_year: Optional[int] = Query(None, description="Filter by year like 2026 or 2024")
):
    """
    Returns trending music videos with full metrics, rankings, and filters.
    """
    catalog = get_enriched_catalog(region=region)

    if published_year:
        catalog = [
            v for v in catalog
            if v.get("published_at") and v["published_at"].startswith(str(published_year))
        ]

    # Sort
    if sort_by == "likes":
        catalog.sort(key=lambda x: int(x.get("like_count") or 0), reverse=True)
    elif sort_by == "engagement":
        catalog.sort(key=lambda x: float(x.get("interaction_rate") or 0.0), reverse=True)
    elif sort_by == "growth":
        catalog.sort(key=lambda x: float(x.get("growth_rate") or 0.0), reverse=True)
    elif sort_by == "popularity":
        catalog.sort(key=lambda x: float(x.get("popularity_score") or 0.0), reverse=True)
    else:  # default 'views'
        catalog.sort(key=lambda x: int(x.get("view_count") or 0), reverse=True)

    results = catalog[:limit]
    for idx, item in enumerate(results, start=1):
        item["rank"] = idx

    return {
        "count": len(results),
        "total_available": len(catalog),
        "region": region.upper(),
        "sort_by": sort_by,
        "items": results,
        "data_notice": "Public statistics provided via YouTube Data API v3 and regional chart records.",
    }


@app.get("/api/search")
def search_music(
    q: str = Query(..., min_length=1, description="Song title or artist query"),
    region: str = Query("GLOBAL"),
    limit: int = Query(25, ge=1, le=50)
):
    """Searches music tracks by title or channel artist name."""
    # Attempt YouTube API search or filter local catalog
    raw_results = youtube_client.search_music(q, region_code=region, max_results=limit)
    if raw_results:
        save_videos_and_observations(raw_results)

    enriched = process_video_collection(raw_results)
    return {
        "query": q,
        "count": len(enriched),
        "results": enriched,
    }


@app.get("/api/song/{video_id}")
def get_song_details(video_id: str):
    """Retrieves single song details, historical timeline, and calculated engagement."""
    video = get_video_by_id(video_id)
    if not video:
        raise HTTPException(status_code=404, detail=f"Song with ID '{video_id}' not found in tracked registry.")

    history = get_video_history(video_id)
    processed = process_video_metrics(video, history)
    
    return {
        "song": processed,
        "history": history,
        "history_count": len(history),
    }


@app.get("/api/analytics/overview")
def get_analytics_overview(region: str = Query("GLOBAL")):
    """Overview page KPIs and primary chart datasets."""
    catalog = get_enriched_catalog(region=region)
    kpis = compute_overview_kpis(catalog)
    corr = compute_correlation_matrix(catalog)
    countries = compute_country_comparison(catalog)
    engagement_dist = compute_engagement_distribution(catalog)

    # Top 10 by views for bar chart
    top_10 = sorted(catalog, key=lambda x: int(x.get("view_count") or 0), reverse=True)[:10]

    return {
        "kpis": kpis,
        "top_10_trending": [
            {
                "title": v.get("title")[:30] + "..." if len(v.get("title", "")) > 30 else v.get("title"),
                "full_title": v.get("title"),
                "artist": v.get("channel_title"),
                "views": v.get("view_count"),
                "likes": v.get("like_count"),
                "popularity_score": v.get("popularity_score"),
                "interaction_rate": v.get("interaction_rate"),
            }
            for v in top_10
        ],
        "views_vs_likes_scatter": [
            {
                "video_id": v.get("video_id"),
                "title": v.get("title"),
                "artist": v.get("channel_title"),
                "views": v.get("view_count"),
                "likes": v.get("like_count"),
                "interaction_rate": v.get("interaction_rate"),
                "age_days": v.get("video_age_days"),
            }
            for v in catalog
        ],
        "correlation_matrix": corr,
        "country_trends": countries,
        "engagement_distribution": engagement_dist,
    }


@app.get("/api/analytics/engagement")
def get_engagement_deepdive():
    """Detailed engagement analytics with formula documentation."""
    catalog = get_enriched_catalog()
    return {
        "average_like_rate": round(sum(v["like_rate"] for v in catalog if v.get("like_rate")) / max(len(catalog), 1), 2),
        "average_comment_rate": round(sum(v["comment_rate"] for v in catalog if v.get("comment_rate")) / max(len(catalog), 1), 3),
        "average_interaction_rate": round(sum(v["interaction_rate"] for v in catalog if v.get("interaction_rate")) / max(len(catalog), 1), 2),
        "formulas": {
            "like_rate": "(Likes / Views) * 100",
            "comment_rate": "(Comments / Views) * 100",
            "interaction_rate": "((Likes + Comments) / Views) * 100",
            "popularity_score": "40% Log-Views + 30% Interaction Intensity + 20% Velocity/Recency + 10% Short-term Momentum",
        },
        "highest_engagement_tracks": sorted(catalog, key=lambda x: float(x.get("interaction_rate") or 0.0), reverse=True)[:5],
    }


@app.get("/api/analytics/artists")
def get_artists_comparison(artists: Optional[str] = Query(None, description="Comma-separated artist names")):
    """Compares tracked video performance across artists."""
    target_list = [a.strip() for a in artists.split(",")] if artists else None
    catalog = get_enriched_catalog()
    comparison = compute_artist_comparison(catalog, target_artists=target_list)
    return {
        "count": len(comparison),
        "artists": comparison,
        "disclaimer": "Aggregations reflect videos collected by Trendify AI, not complete all-time platform discography."
    }


@app.get("/api/analytics/history")
def get_historical_trends():
    """Returns database observation snapshots and timeline trends."""
    catalog = get_enriched_catalog()
    rising = sorted(catalog, key=lambda x: x.get("growth_rate", 0), reverse=True)[:10]
    declining = sorted(catalog, key=lambda x: x.get("growth_rate", 0))[:5]
    
    return {
        "rising_tracks": rising,
        "declining_momentum": declining,
        "database_stats": get_database_stats(),
    }


@app.get("/api/predictions/{video_id}")
def get_ml_prediction(
    video_id: str,
    horizon_days: int = Query(7, ge=1, le=90),
    demo_mode: bool = Query(False)
):
    """
    Scikit-learn trend prediction endpoint.
    Estimates future views, confidence tier, and feature importances.
    """
    video = get_video_by_id(video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found for prediction.")

    history = get_video_history(video_id)
    processed = process_video_metrics(video, history)
    
    # Train model if not yet trained
    if not predictor.is_trained:
        all_vids = get_all_videos()
        predictor.train_or_fit(all_vids, horizon_days=horizon_days)

    pred_res = predictor.predict_future_trajectory(
        processed,
        history=history,
        horizon_days=horizon_days,
        is_demo_mode=demo_mode
    )

    save_prediction({
        "video_id": video_id,
        "horizon_days": horizon_days,
        "predicted_views": pred_res["predicted_views"],
        "predicted_growth_rate": pred_res["projected_growth_rate"],
        "category": pred_res["predicted_category"],
        "features": {f["feature"]: f["importance"] for f in pred_res["feature_importance"]},
        "mae": pred_res["evaluation_metrics"].get("mae", 0.0),
        "r2": pred_res["evaluation_metrics"].get("r2", 0.0),
    })

    return pred_res


@app.post("/api/refresh")
def refresh_data(region: str = Query("US")):
    """Refreshes live data from YouTube API or re-samples snapshots."""
    live_items = youtube_client.fetch_most_popular(region_code=region, max_results=50)
    saved_count = save_videos_and_observations(live_items)
    
    return {
        "status": "success",
        "updated_records": saved_count,
        "region": region,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "source": live_items[0].get("data_source") if live_items else "YouTube Data API v3",
    }


@app.get("/api/export/csv")
def export_csv_data():
    """Generates and downloads CSV file of current tracked dataset."""
    catalog = get_enriched_catalog()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        "video_id", "title", "artist_channel", "published_at",
        "country_code", "view_count", "like_count", "comment_count",
        "like_rate_pct", "comment_rate_pct", "interaction_rate_pct",
        "popularity_score", "growth_rate_pct", "video_age_days"
    ])

    for v in catalog:
        writer.writerow([
            v.get("video_id"),
            v.get("title"),
            v.get("channel_title"),
            v.get("published_at"),
            v.get("country_code"),
            v.get("view_count"),
            v.get("like_count"),
            v.get("comment_count"),
            v.get("like_rate"),
            v.get("comment_rate"),
            v.get("interaction_rate"),
            v.get("popularity_score"),
            v.get("growth_rate"),
            v.get("video_age_days"),
        ])

    output.seek(0)
    filename = f"trendify_music_dataset_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@app.get("/api/insights")
def get_insights(region: str = Query("GLOBAL")):
    """Returns AI-generated (Gemini 3.8 Flash) or statistical analytical summaries."""
    catalog = get_enriched_catalog(region=region)
    kpis = compute_overview_kpis(catalog)
    insights = generate_ai_insights(catalog, kpis)
    return insights


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
