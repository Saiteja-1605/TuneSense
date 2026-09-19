import json
import os
import logging
from typing import List, Dict, Any

logger = logging.getLogger("tunesense.seed")

def load_songs_dataset() -> List[Dict[str, Any]]:
    # Search common locations for data/songs.json
    candidates = [
        os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "songs.json"),
        os.path.join(os.getcwd(), "data", "songs.json"),
        os.path.join(os.getcwd(), "..", "data", "songs.json"),
    ]
    for p in candidates:
        abs_p = os.path.abspath(p)
        if os.path.exists(abs_p):
            with open(abs_p, "r", encoding="utf-8") as f:
                return json.load(f)
    
    logger.error("data/songs.json not found in any candidate path.")
    return []

async def seed_songs_if_needed(db):
    songs_collection = db["songs"]
    count = await songs_collection.count_documents({})
    if count == 0:
        dataset = load_songs_dataset()
        if dataset:
            logger.info(f"Seeding database with {len(dataset)} songs...")
            await songs_collection.insert_many(dataset)
            # Create indexes for optimal performance
            try:
                await songs_collection.create_index("song_id", unique=True)
                await songs_collection.create_index("genre")
                await songs_collection.create_index("mood")
                await songs_collection.create_index("artist")
            except Exception as e:
                logger.debug(f"Index creation notice: {e}")
            logger.info("Song catalog successfully seeded.")
        else:
            logger.warning("No songs found to seed.")
    else:
        logger.info(f"Song catalog already contains {count} songs. Skipping seed.")
