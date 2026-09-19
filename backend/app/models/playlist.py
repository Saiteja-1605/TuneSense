from pydantic import BaseModel, Field
from typing import List, Optional
from app.models.song import Song

class PlaylistCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100, json_schema_extra={"example": "Night Drive Vibes"})
    description: Optional[str] = Field(default="", max_length=300)
    cover: Optional[str] = None
    is_public: bool = False

class PlaylistUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=300)
    cover: Optional[str] = None
    is_public: Optional[bool] = None

class Playlist(BaseModel):
    id: str
    user_id: str
    title: str
    description: str = ""
    cover: str = ""
    is_public: bool = False
    song_count: int = 0
    songs: List[str] = []
    created_at: str
    updated_at: str

class PlaylistDetailResponse(BaseModel):
    playlist: Playlist
    tracks: List[Song] = []
    total_duration: int = 0
