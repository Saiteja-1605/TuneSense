import pytest
from starlette.testclient import TestClient
from app.main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_health_and_root(client):
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["service"] == "TuneSense API"

    res_health = client.get("/api/health")
    assert res_health.status_code == 200
    assert res_health.json()["status"] == "healthy"

def test_user_registration_and_login(client):
    # Register
    reg_data = {
        "name": "Alex Test",
        "email": "alex.test@tunesense.io",
        "password": "Password123!"
    }
    res_reg = client.post("/api/auth/register", json=reg_data)
    assert res_reg.status_code == 201
    reg_json = res_reg.json()
    assert "access_token" in reg_json
    token = reg_json["access_token"]
    assert reg_json["user"]["email"] == "alex.test@tunesense.io"

    # Login
    login_data = {
        "email": "alex.test@tunesense.io",
        "password": "Password123!"
    }
    res_login = client.post("/api/auth/login", json=login_data)
    assert res_login.status_code == 200
    assert "access_token" in res_login.json()

    # Get Me
    headers = {"Authorization": f"Bearer {token}"}
    res_me = client.get("/api/auth/me", headers=headers)
    assert res_me.status_code == 200
    assert res_me.json()["name"] == "Alex Test"

def test_song_endpoints(client):
    # Get songs list
    res = client.get("/api/songs?page=1&limit=10")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] > 0
    assert len(data["items"]) > 0
    first_song = data["items"][0]
    song_id = first_song["song_id"]

    # Get song details & similar songs
    res_detail = client.get(f"/api/songs/{song_id}")
    assert res_detail.status_code == 200
    detail = res_detail.json()
    assert detail["song"]["song_id"] == song_id
    assert len(detail["similar_songs"]) > 0

def test_preferences_flow(client):
    # Register user
    reg_res = client.post("/api/auth/register", json={
        "name": "Taylor Music",
        "email": "taylor@tunesense.io",
        "password": "Password123!"
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Get initial preferences
    get_res = client.get("/api/preferences", headers=headers)
    assert get_res.status_code == 200

    # Update preferences
    update_data = {
        "favorite_genres": ["Rock", "Electronic"],
        "favorite_moods": ["Energetic"],
        "languages": ["English"],
        "energy": 0.90,
        "danceability": 0.75,
        "acousticness": 0.20,
        "valence": 0.80
    }
    put_res = client.put("/api/preferences", json=update_data, headers=headers)
    assert put_res.status_code == 200
    assert "Rock" in put_res.json()["favorite_genres"]

def test_recommendations_and_feedback_and_analytics(client):
    reg_res = client.post("/api/auth/register", json={
        "name": "Jordan Beats",
        "email": "jordan@tunesense.io",
        "password": "Password123!"
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch recommendations
    rec_res = client.get("/api/recommendations?top_k=5", headers=headers)
    assert rec_res.status_code == 200
    rec_data = rec_res.json()
    assert len(rec_data["items"]) > 0
    first_rec = rec_data["items"][0]
    assert "reason" in first_rec
    assert "recommendation_score" in first_rec

    # Submit feedback (like)
    target_id = first_rec["song"]["song_id"]
    fb_res = client.post("/api/recommendations/feedback", json={
        "song_id": target_id,
        "feedback": "like"
    }, headers=headers)
    assert fb_res.status_code == 200
    assert fb_res.json()["status"] == "success"

    # Check history
    hist_res = client.get("/api/history", headers=headers)
    assert hist_res.status_code == 200
    assert len(hist_res.json()["items"]) > 0

    # Check analytics
    analytics_res = client.get("/api/analytics", headers=headers)
    assert analytics_res.status_code == 200
    analytics_data = analytics_res.json()
    assert "genre_distribution" in analytics_data
    assert "feedback_stats" in analytics_data
    assert analytics_data["feedback_stats"]["likes"] >= 1
