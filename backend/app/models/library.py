from pydantic import BaseModel
from typing import List
from app.models.song import Song
from app.models.playlist import Playlist
from app.models.album import Album

class LibrarySummaryResponse(BaseModel):
    liked_songs_count: int = 0
    playlists_count: int = 0
    recent_history_count: int = 0
    recent_playlists: List[Playlist] = []
    recent_liked_songs: List[Song] = []

class LikedSongsResponse(BaseModel):
    items: List[Song]
    total: int
