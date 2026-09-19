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
    # If empty or if existing songs lack audio_url, re-seed
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

async def seed_songs_if_needed(db):
    await seed_database_if_needed(db)
