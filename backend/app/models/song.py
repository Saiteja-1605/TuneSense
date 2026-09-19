from pydantic import BaseModel, Field
from typing import List, Optional

class Song(BaseModel):
    id: Optional[str] = None
    song_id: str
    title: str
    artist: str
    artist_id: Optional[str] = None
    album: str
    album_id: Optional[str] = None
    album_art: Optional[str] = None
    genre: str
    mood: str
    language: str = "English"
    duration: int = 210
    release_date: Optional[str] = None
    popularity: int = 50
    explicit: bool = False
    audio_url: str = ""
    is_preview: bool = False
    tempo: float = 120.0
    energy: float = 0.5
    danceability: float = 0.5
    acousticness: float = 0.5
    instrumentalness: float = 0.0
    valence: float = 0.5
    description: str = ""
    tags: List[str] = []

    def model_post_init(self, __context):
        if not self.id and self.song_id:
            self.id = self.song_id

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

class SearchResponse(BaseModel):
    query: str
    songs: List[Song] = []
    artists: List[dict] = []
    albums: List[dict] = []
    total_matches: int = 0

