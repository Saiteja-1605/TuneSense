from pydantic import BaseModel
from typing import List, Optional
from app.models.song import Song

class Album(BaseModel):
    album_id: str
    title: str
    artist: str
    artist_id: str
    cover: str
    release_date: str
    genre: str
    songs: List[str] = []

class AlbumDetailResponse(BaseModel):
    album: Album
    tracks: List[Song] = []
