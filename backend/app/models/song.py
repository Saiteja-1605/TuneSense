from pydantic import BaseModel, Field
from typing import List, Optional

class Song(BaseModel):
    song_id: str
    title: str
    artist: str
    album: str
    genre: str
    mood: str
    language: str
    popularity: int = 50
    tempo: float = 120.0
    energy: float = 0.5
    danceability: float = 0.5
    acousticness: float = 0.5
    instrumentalness: float = 0.0
    valence: float = 0.5
    description: str = ""
    tags: List[str] = []

class SongDetailResponse(BaseModel):
    song: Song
    similar_songs: List[Song] = []
    explanation: Optional[str] = None

class SongListResponse(BaseModel):
    items: List[Song]
    total: int
    page: int
    limit: int
    genres: List[str]
    moods: List[str]
    languages: List[str]
