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

def test_artists_and_albums(client):
    # Test Artists
    res_artists = client.get("/api/artists")
    assert res_artists.status_code == 200
    artists_data = res_artists.json()
    assert len(artists_data) > 0
    first_artist = artists_data[0]
    artist_id = first_artist["artist_id"]

    res_artist_detail = client.get(f"/api/artists/{artist_id}")
    assert res_artist_detail.status_code == 200
    detail = res_artist_detail.json()
    assert detail["artist"]["artist_id"] == artist_id
    assert len(detail["top_songs"]) > 0

    # Test Albums
    res_albums = client.get("/api/albums")
    assert res_albums.status_code == 200
    albums_data = res_albums.json()
    assert len(albums_data) > 0
    first_album = albums_data[0]
    album_id = first_album["album_id"]

    res_album_detail = client.get(f"/api/albums/{album_id}")
    assert res_album_detail.status_code == 200
    alb_detail = res_album_detail.json()
    assert alb_detail["album"]["album_id"] == album_id
    assert len(alb_detail["tracks"]) > 0

def test_search_and_likes(client):
    # Register a user
    reg_res = client.post("/api/auth/register", json={
        "name": "Search Fan",
        "email": "searcher@tunesense.io",
        "password": "Password123!"
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Universal search
    search_res = client.get("/api/songs/search?q=Midnight")
    assert search_res.status_code == 200
    s_data = search_res.json()
    assert s_data["total_matches"] > 0
    assert len(s_data["songs"]) > 0
    target_song_id = s_data["songs"][0]["song_id"]

    # Like song
    like_res = client.post(f"/api/songs/{target_song_id}/like", headers=headers)
    assert like_res.status_code == 200
    assert like_res.json()["is_liked"] is True

    # Check is liked
    check_res = client.get(f"/api/songs/{target_song_id}/liked", headers=headers)
    assert check_res.status_code == 200
    assert check_res.json()["is_liked"] is True

    # Unlike song
    unlike_res = client.delete(f"/api/songs/{target_song_id}/like", headers=headers)
    assert unlike_res.status_code == 200
    assert unlike_res.json()["is_liked"] is False

def test_playlists_and_library_and_home(client):
    # Register user
    reg_res = client.post("/api/auth/register", json={
        "name": "DJ Playlist",
        "email": "dj@tunesense.io",
        "password": "Password123!"
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create Playlist
    create_res = client.post("/api/playlists", json={
        "title": "Late Night Vibes",
        "description": "Chill beats for nocturnal coding",
        "is_public": True
    }, headers=headers)
    assert create_res.status_code == 201
    playlist = create_res.json()
    playlist_id = playlist["id"]
    assert playlist["title"] == "Late Night Vibes"

    # 2. Add song to playlist
    songs_res = client.get("/api/songs?limit=3")
    sample_songs = songs_res.json()["items"]
    song_to_add = sample_songs[0]["song_id"]

    add_res = client.post(f"/api/playlists/{playlist_id}/songs", json={"song_id": song_to_add}, headers=headers)
    assert add_res.status_code == 200
    assert song_to_add in add_res.json()["songs"]

    # 3. Get playlist detail
    get_pl_res = client.get(f"/api/playlists/{playlist_id}")
    assert get_pl_res.status_code == 200
    assert len(get_pl_res.json()["tracks"]) >= 1

    # 4. Remove song from playlist
    del_song_res = client.delete(f"/api/playlists/{playlist_id}/songs/{song_to_add}", headers=headers)
    assert del_song_res.status_code == 200
    assert song_to_add not in del_song_res.json()["songs"]

    # 5. Record playback history
    play_res = client.post("/api/history", json={
        "song_id": song_to_add,
        "duration_listened": 45,
        "completed": True
    }, headers=headers)
    assert play_res.status_code == 200

    # 6. Check recently played
    recent_res = client.get("/api/history/recently-played", headers=headers)
    assert recent_res.status_code == 200
    recent_songs = recent_res.json()
    assert any(s["song_id"] == song_to_add for s in recent_songs)

    # 7. Check Library summary
    lib_res = client.get("/api/library", headers=headers)
    assert lib_res.status_code == 200
    lib_data = lib_res.json()
    assert lib_data["playlists_count"] >= 1

    # 8. Check Home Feed
    home_res = client.get("/api/home", headers=headers)
    assert home_res.status_code == 200
    home_data = home_res.json()
    assert "greeting" in home_data
    assert len(home_data["trending"]) > 0
    assert len(home_data["mood_mixes"]) > 0
    assert len(home_data["featured_artists"]) > 0

    # 9. Clean up playlist
    del_pl = client.delete(f"/api/playlists/{playlist_id}", headers=headers)
    assert del_pl.status_code == 200

