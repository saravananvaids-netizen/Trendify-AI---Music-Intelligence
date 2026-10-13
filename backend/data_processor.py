"""
Trendify AI – Data Processing and Feature Engineering
Calculates engagement rates, video ages, momentum, and configurable popularity scores.
"""

import math
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional


def parse_iso_datetime(dt_str: Optional[str]) -> Optional[datetime]:
    if not dt_str:
        return None
    try:
        clean = dt_str.replace("Z", "+00:00")
        return datetime.fromisoformat(clean)
    except Exception:
        return None


def calculate_video_age_days(published_at_str: Optional[str]) -> float:
    """Returns video age in days from publication date relative to UTC now."""
    if not published_at_str:
        return 30.0  # fallback assumption
    dt = parse_iso_datetime(published_at_str)
    if not dt:
        return 30.0
    now = datetime.now(timezone.utc)
    delta = (now - dt).total_seconds()
    days = max(delta / 86400.0, 0.1)
    return round(days, 2)


def process_video_metrics(video: Dict[str, Any], history: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
    """
    Enriches a raw video object with engagement rates, popularity scores,
    and momentum indicators according to the specifications.
    """
    v = dict(video)
    views = int(v.get("view_count") or v.get("views") or 0)
    likes = v.get("like_count") if v.get("like_count") is not None else v.get("likes")
    comments = v.get("comment_count") if v.get("comment_count") is not None else v.get("comments")

    if likes is not None:
        likes = int(likes)
    if comments is not None:
        comments = int(comments)

    age_days = calculate_video_age_days(v.get("published_at"))
    v["video_age_days"] = age_days

    # 1. Like rate = (Likes / Views) * 100
    if views > 0 and likes is not None:
        v["like_rate"] = round((likes / views) * 100.0, 3)
    else:
        v["like_rate"] = None

    # 2. Comment rate = (Comments / Views) * 100
    if views > 0 and comments is not None:
        v["comment_rate"] = round((comments / views) * 100.0, 4)
    else:
        v["comment_rate"] = None

    # 3. Available interaction rate = ((Likes + Comments) / Views) * 100
    if views > 0 and (likes is not None or comments is not None):
        valid_int = (likes or 0) + (comments or 0)
        v["interaction_rate"] = round((valid_int / views) * 100.0, 3)
    else:
        v["interaction_rate"] = None

    # Shares: Explicitly label Unavailable as public API does not expose shares
    v["share_count"] = None
    v["shares_display"] = "Unavailable"

    # Momentum and growth calculation
    growth_rate = 0.0
    daily_velocity = 0.0
    if history and len(history) >= 2:
        # Calculate real historical diff
        sorted_h = sorted(history, key=lambda x: x.get("timestamp", ""))
        first_h = sorted_h[0]
        latest_h = sorted_h[-1]
        t1 = parse_iso_datetime(first_h.get("timestamp"))
        t2 = parse_iso_datetime(latest_h.get("timestamp"))
        v1 = int(first_h.get("view_count", 0))
        v2 = int(latest_h.get("view_count", 0))

        if t1 and t2 and (t2 - t1).total_seconds() > 0:
            diff_days = max((t2 - t1).total_seconds() / 86400.0, 0.01)
            delta_views = max(v2 - v1, 0)
            daily_velocity = delta_views / diff_days
            if v1 > 0:
                growth_rate = round(((v2 - v1) / v1) * 100.0, 2)
            else:
                growth_rate = round(daily_velocity / 1000.0, 2)
    else:
        # Recency-weighted momentum proxy when single observation
        # Daily average velocity over lifetime
        daily_velocity = views / max(age_days, 1.0)
        # Recency decay: newer songs get higher growth rate expectation
        growth_rate = round(min(50.0, (100.0 / (age_days + 5.0)) * 2.5), 2)

    v["growth_rate"] = growth_rate
    v["daily_velocity"] = round(daily_velocity, 0)
    v["is_positive_growth"] = growth_rate > 0.1

    # 4. Transparent, configurable Popularity Score:
    # Popularity Score (0-100) =
    #   40% Normalized Log View Volume (log10(views) / log10(1,000,000,000))
    # + 30% Interaction Intensity (Interaction Rate normalized to 10% benchmark)
    # + 20% Velocity & Recency Momentum (Daily velocity / (age_days^0.3))
    # + 10% Growth Momentum bonus
    norm_views = min(1.0, math.log10(max(views, 1000)) / 9.0) if views > 0 else 0.0
    int_rate = v["interaction_rate"] or 2.5
    norm_engagement = min(1.0, int_rate / 8.0)
    norm_recency = min(1.0, (daily_velocity / 500000.0) / (math.pow(age_days, 0.3) if age_days > 0 else 1.0))
    norm_growth = min(1.0, max(0.0, growth_rate / 25.0))

    score = (
        0.40 * norm_views +
        0.30 * norm_engagement +
        0.20 * norm_recency +
        0.10 * norm_growth
    ) * 100.0

    v["popularity_score"] = round(min(99.9, max(5.0, score)), 1)
    v["formula_breakdown"] = {
        "view_factor_weight": "40%",
        "engagement_factor_weight": "30%",
        "velocity_recency_weight": "20%",
        "growth_bonus_weight": "10%",
        "normalized_view_volume": round(norm_views * 100, 1),
        "normalized_engagement": round(norm_engagement * 100, 1),
        "recency_velocity": round(norm_recency * 100, 1),
        "growth_bonus": round(norm_growth * 100, 1),
    }

    return v


def process_video_collection(videos: List[Dict[str, Any]], histories: Optional[Dict[str, List[Dict[str, Any]]]] = None) -> List[Dict[str, Any]]:
    processed = []
    histories = histories or {}
    for v in videos:
        v_id = v.get("video_id") or v.get("id")
        h = histories.get(v_id, [])
        processed.append(process_video_metrics(v, h))
    return processed
