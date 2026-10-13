"""
Trendify AI – Analytics Engine
Generates KPI summaries, correlation matrices, artist comparisons,
engagement distributions, and country-wise trends.
"""

from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd


def compute_overview_kpis(processed_videos: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Calculates top-level KPI metrics for the Main Dashboard."""
    if not processed_videos:
        return {
            "total_videos": 0,
            "total_views": 0,
            "total_likes": 0,
            "average_engagement_rate": 0.0,
            "fastest_growing_song": None,
            "positive_growth_count": 0,
            "last_refreshed_at": None,
        }

    total_videos = len(processed_videos)
    total_views = sum(int(v.get("view_count") or 0) for v in processed_videos)
    total_likes = sum(int(v.get("like_count") or 0) for v in processed_videos if v.get("like_count") is not None)

    valid_eng = [v["interaction_rate"] for v in processed_videos if v.get("interaction_rate") is not None]
    avg_eng = round(float(np.mean(valid_eng)), 2) if valid_eng else 0.0

    fastest_growing = max(processed_videos, key=lambda x: x.get("growth_rate", 0.0), default=None)
    positive_growth_count = sum(1 for v in processed_videos if v.get("growth_rate", 0.0) > 0.0)

    return {
        "total_videos": total_videos,
        "total_views": total_views,
        "total_likes": total_likes,
        "average_engagement_rate": avg_eng,
        "fastest_growing_song": {
            "video_id": fastest_growing.get("video_id"),
            "title": fastest_growing.get("title"),
            "artist": fastest_growing.get("channel_title"),
            "growth_rate": fastest_growing.get("growth_rate"),
            "views": fastest_growing.get("view_count"),
            "thumbnail_url": fastest_growing.get("thumbnail_url"),
        } if fastest_growing else None,
        "positive_growth_count": positive_growth_count,
        "data_notice": "Reflects tracked videos collected via YouTube Data API v3; not complete cross-platform streaming counts.",
    }


def compute_correlation_matrix(processed_videos: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Computes Pearson correlation matrix across numerical performance dimensions.
    Returns structured heatmap grid format for frontend rendering.
    """
    if len(processed_videos) < 3:
        # Default correlation structure
        features = ["Views", "Likes", "Comments", "Interaction %", "Age (Days)", "Popularity"]
        matrix = [[1.0 if i == j else 0.5 for j in range(len(features))] for i in range(len(features))]
        return {"features": features, "matrix": matrix}

    records = []
    for v in processed_videos:
        records.append({
            "views": float(v.get("view_count") or 0),
            "likes": float(v.get("like_count") or 0),
            "comments": float(v.get("comment_count") or 0),
            "interaction_rate": float(v.get("interaction_rate") or 0.0),
            "age_days": float(v.get("video_age_days") or 30.0),
            "popularity": float(v.get("popularity_score") or 50.0),
        })

    df = pd.DataFrame(records)
    corr = df.corr().fillna(0.0)

    feature_labels = {
        "views": "Views",
        "likes": "Likes",
        "comments": "Comments",
        "interaction_rate": "Interaction %",
        "age_days": "Age (Days)",
        "popularity": "Popularity Score"
    }

    labels = [feature_labels.get(c, c) for c in df.columns]
    matrix_values = [[round(float(val), 2) for val in row] for row in corr.to_numpy()]

    return {
        "features": labels,
        "matrix": matrix_values,
        "columns": list(df.columns),
    }


def compute_artist_comparison(processed_videos: List[Dict[str, Any]], target_artists: Optional[List[str]] = None) -> List[Dict[str, Any]]:
    """
    Aggregates metrics grouped by channel_title/artist.
    If target_artists provided, filters to those artists.
    """
    artist_map: Dict[str, List[Dict[str, Any]]] = {}
    for v in processed_videos:
        artist = v.get("channel_title") or "Unknown Artist"
        if artist not in artist_map:
            artist_map[artist] = []
        artist_map[artist].append(v)

    results = []
    for artist, tracks in artist_map.items():
        if target_artists and artist not in target_artists:
            continue

        total_views = sum(int(t.get("view_count") or 0) for t in tracks)
        total_likes = sum(int(t.get("like_count") or 0) for t in tracks if t.get("like_count") is not None)
        valid_eng = [t["interaction_rate"] for t in tracks if t.get("interaction_rate") is not None]
        avg_eng = round(float(np.mean(valid_eng)), 2) if valid_eng else 0.0
        
        best_track = max(tracks, key=lambda x: int(x.get("view_count") or 0), default=None)

        results.append({
            "artist": artist,
            "tracked_videos_count": len(tracks),
            "total_views": total_views,
            "total_likes": total_likes,
            "average_engagement_rate": avg_eng,
            "best_performing_video": {
                "title": best_track.get("title"),
                "views": best_track.get("view_count"),
                "video_id": best_track.get("video_id"),
                "thumbnail_url": best_track.get("thumbnail_url"),
            } if best_track else None,
            "tracks": [{
                "video_id": t.get("video_id"),
                "title": t.get("title"),
                "views": t.get("view_count"),
                "likes": t.get("like_count"),
                "popularity_score": t.get("popularity_score")
            } for t in tracks]
        })

    results.sort(key=lambda x: x["total_views"], reverse=True)
    return results


def compute_engagement_distribution(processed_videos: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Bins engagement rates into distribution buckets for visualization."""
    bins = [
        {"range": "0 - 1%", "min": 0.0, "max": 1.0, "count": 0},
        {"range": "1 - 2%", "min": 1.0, "max": 2.0, "count": 0},
        {"range": "2 - 3%", "min": 2.0, "max": 3.0, "count": 0},
        {"range": "3 - 5%", "min": 3.0, "max": 5.0, "count": 0},
        {"range": "5 - 7%", "min": 5.0, "max": 7.0, "count": 0},
        {"range": "7%+", "min": 7.0, "max": 100.0, "count": 0},
    ]

    for v in processed_videos:
        rate = v.get("interaction_rate")
        if rate is not None:
            for b in bins:
                if b["min"] <= rate < b["max"]:
                    b["count"] += 1
                    break

    return bins


def compute_country_comparison(processed_videos: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Aggregates tracked views and videos by country code."""
    country_map: Dict[str, Dict[str, Any]] = {}
    for v in processed_videos:
        cc = v.get("country_code", "GLOBAL")
        if cc not in country_map:
            country_map[cc] = {
                "country_code": cc,
                "video_count": 0,
                "total_views": 0,
                "total_likes": 0,
                "rates": [],
            }
        country_map[cc]["video_count"] += 1
        country_map[cc]["total_views"] += int(v.get("view_count") or 0)
        country_map[cc]["total_likes"] += int(v.get("like_count") or 0)
        if v.get("interaction_rate") is not None:
            country_map[cc]["rates"].append(v["interaction_rate"])

    res = []
    country_names = {
        "US": "United States",
        "IN": "India",
        "GLOBAL": "Global / Multi-region",
        "JP": "Japan",
        "BR": "Brazil",
        "GB": "United Kingdom",
        "KR": "South Korea",
    }
    for cc, data in country_map.items():
        avg_eng = round(float(np.mean(data["rates"])), 2) if data["rates"] else 0.0
        res.append({
            "country_code": cc,
            "country_name": country_names.get(cc, cc),
            "video_count": data["video_count"],
            "total_views": data["total_views"],
            "total_likes": data["total_likes"],
            "avg_engagement_rate": avg_eng,
        })
    res.sort(key=lambda x: x["total_views"], reverse=True)
    return res
