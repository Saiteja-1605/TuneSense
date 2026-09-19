import pytest
from app.ml.recommender import recommender
from app.ml.explanation import generate_recommendation_reason

SAMPLE_SONGS = [
    {
        "song_id": "test_pop_01",
        "title": "Neon Beat",
        "artist": "Synth Artist",
        "album": "Retro",
        "genre": "Pop",
        "mood": "Energetic",
        "language": "English",
        "popularity": 85,
        "tempo": 128.0,
        "energy": 0.9,
        "danceability": 0.85,
        "acousticness": 0.1,
        "instrumentalness": 0.05,
        "valence": 0.8,
        "description": "Upbeat synth pop club hit.",
        "tags": ["dance", "synth", "party"]
    },
    {
        "song_id": "test_rock_01",
        "title": "Thunder Riff",
        "artist": "Rock Band",
        "album": "Grit",
        "genre": "Rock",
        "mood": "Energetic",
        "language": "English",
        "popularity": 75,
        "tempo": 135.0,
        "energy": 0.95,
        "danceability": 0.5,
        "acousticness": 0.02,
        "instrumentalness": 0.1,
        "valence": 0.6,
        "description": "Hard-hitting garage rock.",
        "tags": ["rock", "guitar", "loud"]
    },
    {
        "song_id": "test_ambient_01",
        "title": "Cloud Waves",
        "artist": "Zen Master",
        "album": "Calm",
        "genre": "Ambient",
        "mood": "Chill",
        "language": "Instrumental",
        "popularity": 70,
        "tempo": 60.0,
        "energy": 0.1,
        "danceability": 0.2,
        "acousticness": 0.95,
        "instrumentalness": 0.9,
        "valence": 0.3,
        "description": "Peaceful soothing meditation tones.",
        "tags": ["peaceful", "meditation", "sleep"]
    }
]

def test_recommender_fit_and_recommend():
    recommender.fit(SAMPLE_SONGS)
    assert recommender.is_fitted is True

    # User likes Pop and energetic dance music
    user_pref = {
        "favorite_genres": ["Pop"],
        "favorite_moods": ["Energetic"],
        "languages": ["English"],
        "energy": 0.85,
        "danceability": 0.80,
        "acousticness": 0.15,
        "valence": 0.75
    }

    recs = recommender.recommend(user_pref, top_k=2)
    assert len(recs) == 2
    # The top recommended song should be the Pop energetic song
    assert recs[0]["song"]["song_id"] == "test_pop_01"
    assert recs[0]["score"] > 60.0
    assert "reason" in recs[0]
    assert len(recs[0]["reason"]) > 10

def test_recommender_dislike_filter():
    recommender.fit(SAMPLE_SONGS)
    user_pref = {
        "favorite_genres": ["Pop", "Rock"],
        "favorite_moods": ["Energetic"],
        "languages": ["English"],
        "energy": 0.9,
        "danceability": 0.7
    }

    # Dislike the Pop song
    recs = recommender.recommend(user_pref, disliked_song_ids=["test_pop_01"], top_k=2)
    # The disliked song must NOT appear in recommendations
    rec_ids = [r["song"]["song_id"] for r in recs]
    assert "test_pop_01" not in rec_ids
    assert "test_rock_01" in rec_ids

def test_explanation_generator():
    song = SAMPLE_SONGS[0]
    user_pref = {
        "favorite_genres": ["Pop"],
        "favorite_moods": ["Energetic"],
        "energy": 0.85,
        "danceability": 0.8
    }
    reason = generate_recommendation_reason(song, user_pref, 88.0)
    assert "Pop" in reason or "Energetic" in reason or "rhythm" in reason
    assert reason.startswith("Recommended because")
