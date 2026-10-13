"""
Sample Pytest test cases for Trendify AI FastAPI Backend.
Run using: pytest backend/tests/test_api.py -v
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "youtube_api" in data
    assert "database" in data
    assert "ml_model" in data


def test_trending_endpoint():
    response = client.get("/api/trending?limit=10&region=GLOBAL")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) <= 10
    if data["items"]:
        first = data["items"][0]
        assert "video_id" in first
        assert "view_count" in first
        assert "popularity_score" in first


def test_analytics_overview():
    response = client.get("/api/analytics/overview")
    assert response.status_code == 200
    data = response.json()
    assert "kpis" in data
    assert "top_10_trending" in data
    assert "correlation_matrix" in data
    assert "features" in data["correlation_matrix"]


def test_song_details_and_prediction():
    # First get trending to find a valid video_id
    trending_res = client.get("/api/trending?limit=1")
    items = trending_res.json().get("items", [])
    if items:
        video_id = items[0]["video_id"]
        # Test song details
        song_res = client.get(f"/api/song/{video_id}")
        assert song_res.status_code == 200
        assert song_res.json()["song"]["video_id"] == video_id

        # Test prediction
        pred_res = client.get(f"/api/predictions/{video_id}?horizon_days=7&demo_mode=true")
        assert pred_res.status_code == 200
        pred_data = pred_res.json()
        assert "predicted_views" in pred_data
        assert "predicted_category" in pred_data
        assert "feature_importance" in pred_data


def test_csv_export():
    response = client.get("/api/export/csv")
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/csv")
    assert "video_id,title" in response.text
