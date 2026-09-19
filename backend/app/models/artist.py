from pydantic import BaseModel
from typing import List, Optional
from app.models.song import Song

class Artist(BaseModel):
    artist_id: str
    name: str
    image: str
    genres: List[str] = []
    bio: str = ""
    popularity: int = 75

class AlbumSummary(BaseModel):
    album_id: str
    title: str
    cover: str
    release_date: str
    genre: str

class ArtistDetailResponse(BaseModel):
    artist: Artist
    top_songs: List[Song] = []
    albums: List[AlbumSummary] = []
    related_artists: List[Artist] = []
