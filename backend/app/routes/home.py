import datetime
import asyncio
from fastapi import APIRouter, Depends
from typing import List
from app.models.home import HomeResponse, MoodMix, MadeForYouItem, BecauseYouLikedItem
from app.models.song import Song
from app.models.artist import Artist
from app.models.album import Album
from app.models.playlist import Playlist
from app.auth.jwt import get_current_user
from app.database.connection import db_manager
from app.ml.recommender import recommender

router = APIRouter(prefix="/api/home", tags=["Home"])

def get_time_greeting(name: str) -> str:
    hour = datetime.datetime.now().hour
    if 5 <= hour < 12:
        period = "Good morning"
    elif 12 <= hour < 17:
        period = "Good afternoon"
    else:
        period = "Good evening"
    return f"{period}, {name}"

@router.get("", response_model=HomeResponse)
async def get_home_feed(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("_id") or current_user.get("user_id"))
    user_name = current_user.get("name", "Explorer")

    songs_coll = db_manager.get_collection("songs")
    artists_coll = db_manager.get_collection("artists")
    albums_coll = db_manager.get_collection("albums")
    playlists_coll = db_manager.get_collection("playlists")
    history_coll = db_manager.get_collection("listening_history")
    liked_coll = db_manager.get_collection("liked_songs")
    feedback_coll = db_manager.get_collection("feedback")
    prefs_coll = db_manager.get_collection("user_preferences")

    # 1. Fetch user preferences, likes, feedbacks, history concurrently
    async def fetch_user_data():
        pref_doc, liked_docs, feedback_docs, hist_docs = await asyncio.gather(
            prefs_coll.find_one({"user_id": user_id}),
            liked_coll.find({"user_id": user_id}).sort("created_at", -1).to_list(length=50),
            feedback_coll.find({"user_id": user_id}).to_list(length=100),
            history_coll.find({"user_id": user_id}).sort("listened_at", -1).limit(30).to_list(length=30)
        )
        return pref_doc, liked_docs, feedback_docs, hist_docs

    user_pref, liked_docs, feedback_docs, hist_docs = await fetch_user_data()

    if not user_pref:
        user_pref = {
            "favorite_genres": ["Pop", "Electronic"],
            "favorite_moods": ["Upbeat", "Energetic"],
            "languages": ["English"],
            "energy": 0.75,
            "danceability": 0.70,
            "acousticness": 0.30,
            "valence": 0.70
        }

    liked_song_ids = [d["song_id"] for d in liked_docs if "song_id" in d]
    disliked_ids = [d["song_id"] for d in feedback_docs if d.get("feedback") == "dislike"]

    # 2. Recently Played: batch fetch with $in
    seen_history_ids = set()
    unique_recent_ids = []
    for h in hist_docs:
        sid = h.get("song_id")
        if sid and sid not in seen_history_ids:
            seen_history_ids.add(sid)
            unique_recent_ids.append(sid)
            if len(unique_recent_ids) >= 6:
                break

    recently_played = []
    if unique_recent_ids:
        recent_cursor = songs_coll.find({"song_id": {"$in": unique_recent_ids}})
        recent_docs = await recent_cursor.to_list(length=len(unique_recent_ids))
        doc_map = {d["song_id"]: d for d in recent_docs}
        recently_played = [Song(**doc_map[sid]) for sid in unique_recent_ids if sid in doc_map]

    # If user has no listening history yet, populate recently played with popular tracks
    if not recently_played:
        pop_cursor = songs_coll.find({}).sort("popularity", -1).limit(6)
        pop_raw = await pop_cursor.to_list(length=6)
        recently_played = [Song(**s) for s in pop_raw]

    # 3. Made For You (Personalized ML ranking)
    recs = recommender.recommend(
        user_pref=user_pref,
        disliked_song_ids=disliked_ids,
        liked_song_ids=liked_song_ids,
        listened_song_ids=list(seen_history_ids),
        top_k=8
    )
    made_for_you: List[MadeForYouItem] = []
    for r in recs:
        try:
            made_for_you.append(MadeForYouItem(
                song=Song(**r["song"]),
                score=float(r.get("score", 88.0)),
                reason=str(r.get("reason", "Personalized for your acoustic taste"))
            ))
        except Exception:
            continue

    # Fallback if recommender had empty output
    if not made_for_you:
        pop_cursor = songs_coll.find({}).sort("popularity", -1).limit(8)
        pop_raw = await pop_cursor.to_list(length=8)
        for s in pop_raw:
            made_for_you.append(MadeForYouItem(
                song=Song(**s),
                score=90.0,
                reason=f"Popular in {s.get('genre', 'Music')} • Matches preferred energy"
            ))

    # 4. Because You Liked... section (List of items, always safe empty list for new users)
    because_you_liked: List[BecauseYouLikedItem] = []
    if liked_song_ids:
        for lid in liked_song_ids[:2]:
            anchor_doc = await songs_coll.find_one({"song_id": lid})
            if anchor_doc:
                similar_raw = recommender.get_similar_songs(lid, top_k=5)
                if similar_raw:
                    because_you_liked.append(BecauseYouLikedItem(
                        liked_song_id=lid,
                        liked_title=anchor_doc.get("title", "Track"),
                        liked_artist=anchor_doc.get("artist", "Artist"),
                        similar_songs=[Song(**s) for s in similar_raw]
                    ))

    # 5. Trending Tracks, Mood Mixes, Artists, Albums, and Playlists (Concurrent fetch)
    async def fetch_catalog_sections():
        trend_cursor = songs_coll.find({}).sort("popularity", -1).skip(4).limit(8)
        art_cursor = artists_coll.find({}).sort("popularity", -1).limit(6)
        alb_cursor = albums_coll.find({}).limit(6)
        p_cursor = playlists_coll.find({"user_id": user_id}).sort("updated_at", -1).limit(6)

        trend_raw, art_raw, alb_raw, p_raw = await asyncio.gather(
            trend_cursor.to_list(length=8),
            art_cursor.to_list(length=6),
            alb_cursor.to_list(length=6),
            p_cursor.to_list(length=6)
        )
        return trend_raw, art_raw, alb_raw, p_raw

    trend_raw, art_raw, alb_raw, p_raw = await fetch_catalog_sections()

    trending = [Song(**s) for s in trend_raw]
    featured_artists = [Artist(**a) for a in art_raw]
    featured_albums = [Album(**a) for a in alb_raw]
    popular_albums = list(featured_albums)

    # 6. Mood Mixes
    mood_definitions = [
        ("Chill", "Chill & Relaxing Wave", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=60"),
        ("Energetic", "High-Energy Workout", "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=60"),
        ("Focus", "Deep Focus & Study", "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=60"),
        ("Euphoric", "Late Night Euphoria", "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&auto=format&fit=crop&q=60"),
    ]
    mood_mixes = []
    for mood, title, cover in mood_definitions:
        m_cursor = songs_coll.find({"mood": {"$regex": f"^{mood}$", "$options": "i"}}).limit(6)
        m_raw = await m_cursor.to_list(length=6)
        if m_raw:
            mood_mixes.append(MoodMix(
                mood=mood,
                title=title,
                description=f"Curated {mood.lower()} soundscapes and rhythmic flow.",
                cover=cover,
                songs=[Song(**s) for s in m_raw]
            ))

    user_playlists = [
        Playlist(
            id=str(p["_id"]),
            user_id=p["user_id"],
            title=p["title"],
            description=p.get("description", ""),
            cover=p.get("cover") or "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60",
            is_public=p.get("is_public", False),
            song_count=len(p.get("songs", [])),
            songs=p.get("songs", []),
            created_at=p.get("created_at", ""),
            updated_at=p.get("updated_at", "")
        )
        for p in p_raw
    ]

    return HomeResponse(
        greeting=get_time_greeting(user_name),
        recently_played=recently_played,
        made_for_you=made_for_you,
        because_you_liked=because_you_liked,
        trending=trending,
        mood_mixes=mood_mixes,
        featured_artists=featured_artists,
        featured_albums=featured_albums,
        popular_albums=popular_albums,
        user_playlists=user_playlists
    )
