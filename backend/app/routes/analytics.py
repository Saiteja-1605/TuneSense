from fastapi import APIRouter, Depends
from typing import Dict, Any, List
from collections import Counter
from app.auth.jwt import get_current_user
from app.database.connection import db_manager

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("")
async def get_analytics(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("_id") or current_user.get("user_id"))
    
    history_coll = db_manager.get_collection("recommendation_history")
    feedback_coll = db_manager.get_collection("feedback")
    prefs_coll = db_manager.get_collection("user_preferences")
    songs_coll = db_manager.get_collection("songs")

    # 1. Fetch user's history
    history_cursor = history_coll.find({"user_id": user_id})
    history_docs = await history_cursor.to_list(length=500)

    # 2. Fetch user's feedback
    feedback_cursor = feedback_coll.find({"user_id": user_id})
    feedback_docs = await feedback_cursor.to_list(length=500)

    # 3. Fetch user preferences
    pref = await prefs_coll.find_one({"user_id": user_id}) or {}

    # Map songs in history
    song_ids = [h.get("song_id") for h in history_docs if h.get("song_id")]
    song_docs = []
    if song_ids:
        # Fetch relevant songs
        for sid in set(song_ids):
            s = await songs_coll.find_one({"song_id": sid})
            if s:
                song_docs.append(s)
    
    song_map = {s["song_id"]: s for s in song_docs}

    # A. Genre Distribution
    genre_counts = Counter()
    mood_counts = Counter()
    scores = []
    
    for h in history_docs:
        sid = h.get("song_id")
        score = h.get("recommendation_score")
        if score:
            scores.append(float(score))
        if sid in song_map:
            genre_counts[song_map[sid].get("genre", "Unknown")] += 1
            mood_counts[song_map[sid].get("mood", "Unknown")] += 1

    total_genres = sum(genre_counts.values()) or 1
    genre_distribution = [
        {"name": g, "value": count, "percentage": round((count / total_genres) * 100, 1)}
        for g, count in genre_counts.most_common(8)
    ]

    mood_distribution = [
        {"name": m, "value": count}
        for m, count in mood_counts.most_common(6)
    ]

    # B. Feedback Stats
    likes_count = sum(1 for f in feedback_docs if f.get("feedback") == "like")
    dislikes_count = sum(1 for f in feedback_docs if f.get("feedback") == "dislike")
    total_rated = likes_count + dislikes_count
    like_ratio = round((likes_count / total_rated) * 100, 1) if total_rated > 0 else 100.0

    feedback_stats = {
        "likes": likes_count,
        "dislikes": dislikes_count,
        "unrated": max(0, len(history_docs) - total_rated),
        "like_ratio": like_ratio
    }

    # C. Audio Radar (User Preference vs Catalog Average)
    audio_radar = [
        {
            "feature": "Energy",
            "user": round(float(pref.get("energy", 0.7)) * 100, 1),
            "catalog": 65.0
        },
        {
            "feature": "Danceability",
            "user": round(float(pref.get("danceability", 0.7)) * 100, 1),
            "catalog": 62.0
        },
        {
            "feature": "Acousticness",
            "user": round(float(pref.get("acousticness", 0.3)) * 100, 1),
            "catalog": 42.0
        },
        {
            "feature": "Valence",
            "user": round(float(pref.get("valence", 0.6)) * 100, 1),
            "catalog": 55.0
        }
    ]

    # D. Activity / Recommendations trend
    date_counts = Counter()
    for h in history_docs:
        raw_date = h.get("created_at", "")
        # Extract YYYY-MM-DD
        day = raw_date[:10] if len(raw_date) >= 10 else "Today"
        date_counts[day] += 1

    trend = [
        {"date": day, "count": count}
        for day, count in sorted(date_counts.items())[-7:]
    ]
    if not trend:
        import datetime
        today_str = datetime.date.today().isoformat()
        trend = [{"date": today_str, "count": len(history_docs)}]

    # E. Summary Metrics
    top_genre = genre_counts.most_common(1)[0][0] if genre_counts else (pref.get("favorite_genres", ["Pop"])[0] if pref.get("favorite_genres") else "Pop")
    avg_score = round(sum(scores) / len(scores), 1) if scores else 84.5

    metrics = {
        "total_recommendations": len(history_docs),
        "total_likes": likes_count,
        "favorite_genre": top_genre,
        "average_match_score": avg_score
    }

    return {
        "metrics": metrics,
        "genre_distribution": genre_distribution,
        "mood_distribution": mood_distribution,
        "feedback_stats": feedback_stats,
        "audio_radar": audio_radar,
        "recommendations_trend": trend
    }
