from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.models.song import Song
from app.models.artist import Artist
from app.models.album import Album
from app.models.playlist import Playlist

class MoodMix(BaseModel):
    mood: str
    title: str
    description: str
    cover: str
    songs: List[Song]

class MadeForYouItem(BaseModel):
    song: Song
    score: float = 85.0
    reason: str = "Matches your musical vibe & preferred energy"

class BecauseYouLikedItem(BaseModel):
    liked_song_id: str
    liked_title: str
    liked_artist: str = ""
    similar_songs: List[Song] = []

class HomeResponse(BaseModel):
    greeting: str
    recently_played: List[Song] = []
    made_for_you: List[MadeForYouItem] = []
    because_you_liked: List[BecauseYouLikedItem] = []
    trending: List[Song] = []
    mood_mixes: List[MoodMix] = []
    featured_artists: List[Artist] = []
    featured_albums: List[Album] = []
    popular_albums: List[Album] = []
    user_playlists: List[Playlist] = []
