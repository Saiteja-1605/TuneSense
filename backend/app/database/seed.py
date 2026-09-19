import json
import os
import logging
from typing import List, Dict, Any

logger = logging.getLogger("tunesense.seed")

def load_json_file(filename: str) -> List[Dict[str, Any]]:
    candidates = [
        os.path.join(os.path.dirname(__file__), "data", filename),
        os.path.join(os.path.dirname(__file__), "..", "..", "data", filename),
        os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", filename),
        os.path.join(os.getcwd(), "data", filename),
        os.path.join(os.getcwd(), "backend", "data", filename),
        os.path.join(os.getcwd(), "..", "data", filename),
    ]
    for p in candidates:
        abs_p = os.path.abspath(p)
        if os.path.exists(abs_p):
            with open(abs_p, "r", encoding="utf-8") as f:
                return json.load(f)
    
    logger.error(f"{filename} not found in candidate paths.")
    return []

def load_songs_dataset() -> List[Dict[str, Any]]:
    return load_json_file("songs.json")

def load_artists_dataset() -> List[Dict[str, Any]]:
    return load_json_file("artists.json")

def load_albums_dataset() -> List[Dict[str, Any]]:
    return load_json_file("albums.json")

async def seed_demo_user_if_needed(db):
    from app.auth.security import hash_password
    users_coll = db["users"]
    prefs_coll = db["user_preferences"]
    liked_coll = db["liked_songs"]
    history_coll = db["listening_history"]
    playlists_coll = db["playlists"]
    songs_coll = db["songs"]

    demo_email = "alex@tunesense.io"
    existing_user = await users_coll.find_one({"email": demo_email})
    
    demo_user_id = "demo-alex-user-id"
    if not existing_user:
        logger.info("Seeding demo user alex@tunesense.io...")
        now_iso = "2026-01-01T00:00:00Z"
        demo_user_doc = {
            "_id": demo_user_id,
            "name": "Alex Rivera",
            "email": demo_email,
            "password_hash": hash_password("DemoPass123!"),
            "created_at": now_iso
        }
        await users_coll.insert_one(demo_user_doc)
        try:
            await users_coll.create_index("email", unique=True)
        except Exception:
            pass

    # Ensure demo user preferences exist
    existing_prefs = await prefs_coll.find_one({"user_id": demo_user_id})
    if not existing_prefs:
        demo_prefs = {
            "_id": "demo-alex-prefs-id",
            "user_id": demo_user_id,
            "favorite_genres": ["Electronic", "Pop", "Lo-Fi", "Indie"],
            "favorite_moods": ["Upbeat", "Chill", "Energetic"],
            "languages": ["English"],
            "energy": 0.80,
            "danceability": 0.75,
            "acousticness": 0.35,
            "valence": 0.70,
            "updated_at": "2026-01-01T00:00:00Z"
        }
        await prefs_coll.insert_one(demo_prefs)

    # Ensure sample liked songs and history for demo user
    sample_songs_cursor = songs_coll.find({}).limit(10)
    sample_songs = await sample_songs_cursor.to_list(length=10)
    if sample_songs:
        # Seed liked songs if none
        liked_count = await liked_coll.count_documents({"user_id": demo_user_id})
        if liked_count == 0:
            liked_docs = [
                {
                    "_id": f"demo-like-{s['song_id']}",
                    "user_id": demo_user_id,
                    "song_id": s["song_id"],
                    "created_at": "2026-01-01T12:00:00Z"
                }
                for s in sample_songs[:5]
            ]
            if liked_docs:
                await liked_coll.insert_many(liked_docs)

        # Seed listening history if none
        hist_count = await history_coll.count_documents({"user_id": demo_user_id})
        if hist_count == 0:
            hist_docs = [
                {
                    "_id": f"demo-hist-{s['song_id']}",
                    "user_id": demo_user_id,
                    "song_id": s["song_id"],
                    "duration_listened": s.get("duration", 180),
                    "completed": True,
                    "listened_at": f"2026-01-01T{10 + i:02d}:00:00Z"
                }
                for i, s in enumerate(sample_songs[:6])
            ]
            if hist_docs:
                await history_coll.insert_many(hist_docs)

        # Seed demo playlist if none
        playlist_count = await playlists_coll.count_documents({"user_id": demo_user_id})
        if playlist_count == 0:
            demo_playlist = {
                "_id": "demo-alex-playlist-1",
                "user_id": demo_user_id,
                "title": "Alex's Daily Sonic Mix",
                "description": "Electronic and Lo-Fi favorites tuned for deep focus and positive vibes.",
                "cover": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=60",
                "is_public": True,
                "songs": [s["song_id"] for s in sample_songs[:5]],
                "created_at": "2026-01-01T00:00:00Z",
                "updated_at": "2026-01-01T00:00:00Z"
            }
            await playlists_coll.insert_one(demo_playlist)

    logger.info("Demo user alex@tunesense.io successfully initialized.")


async def seed_database_if_needed(db):
    songs_coll = db["songs"]
    artists_coll = db["artists"]
    albums_coll = db["albums"]

    # 1. Seed Artists
    art_count = await artists_coll.count_documents({})
    if art_count == 0:
        artists_data = load_artists_dataset()
        if artists_data:
            logger.info(f"Seeding {len(artists_data)} artists...")
            await artists_coll.insert_many(artists_data)
            try:
                await artists_coll.create_index("artist_id", unique=True)
                await artists_coll.create_index("name")
            except Exception as e:
                logger.debug(f"Artist index notice: {e}")

    # 2. Seed Albums
    alb_count = await albums_coll.count_documents({})
    if alb_count == 0:
        albums_data = load_albums_dataset()
        if albums_data:
            logger.info(f"Seeding {len(albums_data)} albums...")
            await albums_coll.insert_many(albums_data)
            try:
                await albums_coll.create_index("album_id", unique=True)
                await albums_coll.create_index("title")
            except Exception as e:
                logger.debug(f"Album index notice: {e}")

    # 3. Seed Songs
    song_count = await songs_coll.count_documents({})
    songs_data = load_songs_dataset()
    sample_song = await songs_coll.find_one({}) if song_count > 0 else None
    needs_reseed = song_count == 0 or (sample_song and "audio_url" not in sample_song)

    if needs_reseed and songs_data:
        if song_count > 0:
            logger.info("Updating existing song catalog with audio streaming urls...")
            await songs_coll.delete_many({})
        logger.info(f"Seeding database with {len(songs_data)} songs...")
        await songs_coll.insert_many(songs_data)
        try:
            await songs_coll.create_index("song_id", unique=True)
            await songs_coll.create_index("genre")
            await songs_coll.create_index("mood")
            await songs_coll.create_index("artist")
            await songs_coll.create_index("artist_id")
            await songs_coll.create_index("album_id")
        except Exception as e:
            logger.debug(f"Song index notice: {e}")
        logger.info("Song catalog successfully indexed.")

    # 4. Seed Demo User
    await seed_demo_user_if_needed(db)

async def seed_songs_if_needed(db):
    await seed_database_if_needed(db)
