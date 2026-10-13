"""
Trendify AI – SQLite Persistence Layer
Handles storage for video metadata, historical time-series observation snapshots,
and machine learning predictions.
"""

import sqlite3
import os
import json
from datetime import datetime
from typing import List, Dict, Any, Optional

DEFAULT_DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "trendify_music.db")


def get_db_connection(db_path: str = DEFAULT_DB_PATH) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


def init_db(db_path: str = DEFAULT_DB_PATH) -> None:
    """Initializes tables if they do not exist."""
    conn = get_db_connection(db_path)
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS videos (
        video_id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        channel_title TEXT NOT NULL,
        channel_id TEXT,
        published_at TEXT,
        thumbnail_url TEXT,
        country_code TEXT DEFAULT 'GLOBAL',
        category_id TEXT DEFAULT '10',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS observations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        video_id TEXT NOT NULL,
        view_count INTEGER NOT NULL,
        like_count INTEGER,
        comment_count INTEGER,
        timestamp TEXT NOT NULL,
        like_rate REAL,
        comment_rate REAL,
        interaction_rate REAL,
        popularity_score REAL,
        FOREIGN KEY (video_id) REFERENCES videos(video_id)
    );
    """)

    cursor.execute("""
    CREATE INDEX IF NOT EXISTS idx_obs_video_id ON observations(video_id);
    """)
    cursor.execute("""
    CREATE INDEX IF NOT EXISTS idx_obs_timestamp ON observations(timestamp);
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        video_id TEXT NOT NULL,
        horizon_days INTEGER NOT NULL,
        predicted_views INTEGER NOT NULL,
        predicted_growth_rate REAL,
        category TEXT,
        features_json TEXT,
        mae REAL,
        r2 REAL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (video_id) REFERENCES videos(video_id)
    );
    """)

    conn.commit()
    conn.close()


def save_videos_and_observations(videos_data: List[Dict[str, Any]], db_path: str = DEFAULT_DB_PATH) -> int:
    """
    Persists video details and adds a new observation snapshot.
    Returns count of updated records.
    """
    init_db(db_path)
    conn = get_db_connection(db_path)
    cursor = conn.cursor()
    now_iso = datetime.utcnow().isoformat() + "Z"

    count = 0
    for v in videos_data:
        video_id = v.get("video_id") or v.get("id")
        if not video_id:
            continue

        title = v.get("title", "Unknown Title")
        channel_title = v.get("channel_title") or v.get("channelTitle", "Unknown Artist")
        channel_id = v.get("channel_id") or v.get("channelId", "")
        published_at = v.get("published_at") or v.get("publishedAt", "")
        thumbnail_url = v.get("thumbnail_url") or v.get("thumbnail", "")
        country_code = v.get("country_code", "GLOBAL")

        # Upsert into videos table
        cursor.execute("""
        INSERT INTO videos (video_id, title, channel_title, channel_id, published_at, thumbnail_url, country_code, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(video_id) DO UPDATE SET
            title=excluded.title,
            channel_title=excluded.channel_title,
            channel_id=excluded.channel_id,
            published_at=excluded.published_at,
            thumbnail_url=excluded.thumbnail_url,
            country_code=excluded.country_code,
            updated_at=excluded.updated_at
        """, (video_id, title, channel_title, channel_id, published_at, thumbnail_url, country_code, now_iso, now_iso))

        # Insert observation snapshot
        views = int(v.get("view_count") or v.get("views") or 0)
        likes = v.get("like_count") if v.get("like_count") is not None else v.get("likes")
        comments = v.get("comment_count") if v.get("comment_count") is not None else v.get("comments")
        timestamp = v.get("timestamp") or now_iso

        like_rate = (likes / views * 100.0) if views > 0 and likes is not None else None
        comment_rate = (comments / views * 100.0) if views > 0 and comments is not None else None
        interaction_rate = None
        if views > 0 and (likes is not None or comments is not None):
            valid_interactions = (likes or 0) + (comments or 0)
            interaction_rate = (valid_interactions / views) * 100.0

        popularity_score = v.get("popularity_score", 0.0)

        cursor.execute("""
        INSERT INTO observations (video_id, view_count, like_count, comment_count, timestamp, like_rate, comment_rate, interaction_rate, popularity_score)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (video_id, views, likes, comments, timestamp, like_rate, comment_rate, interaction_rate, popularity_score))

        count += 1

    conn.commit()
    conn.close()
    return count


def get_all_videos(db_path: str = DEFAULT_DB_PATH) -> List[Dict[str, Any]]:
    """Returns list of all tracked videos with their latest observation."""
    init_db(db_path)
    conn = get_db_connection(db_path)
    cursor = conn.cursor()

    query = """
    SELECT v.*, o.view_count, o.like_count, o.comment_count, o.timestamp as last_observed,
           o.like_rate, o.comment_rate, o.interaction_rate, o.popularity_score
    FROM videos v
    LEFT JOIN observations o ON o.id = (
        SELECT id FROM observations WHERE video_id = v.video_id ORDER BY timestamp DESC LIMIT 1
    )
    ORDER BY o.view_count DESC
    """
    rows = cursor.execute(query).fetchall()
    result = [dict(r) for r in rows]
    conn.close()
    return result


def get_video_by_id(video_id: str, db_path: str = DEFAULT_DB_PATH) -> Optional[Dict[str, Any]]:
    """Fetches details and latest stats for single video."""
    init_db(db_path)
    conn = get_db_connection(db_path)
    cursor = conn.cursor()

    row = cursor.execute("""
    SELECT v.*, o.view_count, o.like_count, o.comment_count, o.timestamp as last_observed,
           o.like_rate, o.comment_rate, o.interaction_rate, o.popularity_score
    FROM videos v
    LEFT JOIN observations o ON o.id = (
        SELECT id FROM observations WHERE video_id = v.video_id ORDER BY timestamp DESC LIMIT 1
    )
    WHERE v.video_id = ?
    """, (video_id,)).fetchone()

    conn.close()
    return dict(row) if row else None


def get_video_history(video_id: str, db_path: str = DEFAULT_DB_PATH) -> List[Dict[str, Any]]:
    """Retrieves full time-series observation history for a video."""
    init_db(db_path)
    conn = get_db_connection(db_path)
    cursor = conn.cursor()

    rows = cursor.execute("""
    SELECT * FROM observations
    WHERE video_id = ?
    ORDER BY timestamp ASC
    """, (video_id,)).fetchall()

    conn.close()
    return [dict(r) for r in rows]


def get_database_stats(db_path: str = DEFAULT_DB_PATH) -> Dict[str, Any]:
    """Summary counts for system monitoring."""
    init_db(db_path)
    conn = get_db_connection(db_path)
    cursor = conn.cursor()

    v_count = cursor.execute("SELECT COUNT(*) FROM videos").fetchone()[0]
    o_count = cursor.execute("SELECT COUNT(*) FROM observations").fetchone()[0]
    p_count = cursor.execute("SELECT COUNT(*) FROM predictions").fetchone()[0]
    first_obs = cursor.execute("SELECT MIN(timestamp) FROM observations").fetchone()[0]
    last_obs = cursor.execute("SELECT MAX(timestamp) FROM observations").fetchone()[0]

    conn.close()
    return {
        "total_videos": v_count,
        "total_observations": o_count,
        "total_predictions": p_count,
        "first_observation": first_obs,
        "last_observation": last_obs,
    }


def save_prediction(pred: Dict[str, Any], db_path: str = DEFAULT_DB_PATH) -> int:
    init_db(db_path)
    conn = get_db_connection(db_path)
    cursor = conn.cursor()
    now_iso = datetime.utcnow().isoformat() + "Z"

    cursor.execute("""
    INSERT INTO predictions (video_id, horizon_days, predicted_views, predicted_growth_rate, category, features_json, mae, r2, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        pred.get("video_id"),
        pred.get("horizon_days", 7),
        pred.get("predicted_views", 0),
        pred.get("predicted_growth_rate", 0.0),
        pred.get("category", "Medium"),
        json.dumps(pred.get("features", {})),
        pred.get("mae", 0.0),
        pred.get("r2", 0.0),
        now_iso
    ))
    conn.commit()
    pred_id = cursor.lastrowid or 0
    conn.close()
    return pred_id
