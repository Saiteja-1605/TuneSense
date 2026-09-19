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

class BecauseYouLiked(BaseModel):
    anchor_song: Song
    recommendations: List[Song]

class HomeResponse(BaseModel):
    greeting: str
    recently_played: List[Song] = []
    made_for_you: List[Song] = []
    because_you_liked: Optional[BecauseYouLiked] = None
    trending: List[Song] = []
    mood_mixes: List[MoodMix] = []
    featured_artists: List[Artist] = []
    featured_albums: List[Album] = []
    user_playlists: List[Playlist] = []
