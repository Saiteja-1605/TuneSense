from pydantic import BaseModel, Field
from typing import List, Optional

class UserPreferenceUpdate(BaseModel):
    favorite_genres: List[str] = Field(default_factory=list)
    favorite_moods: List[str] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=lambda: ["English"])
    energy: float = Field(0.5, ge=0.0, le=1.0)
    danceability: float = Field(0.5, ge=0.0, le=1.0)
    acousticness: float = Field(0.5, ge=0.0, le=1.0)
    valence: float = Field(0.5, ge=0.0, le=1.0)

class UserPreferenceResponse(BaseModel):
    user_id: str
    favorite_genres: List[str] = []
    favorite_moods: List[str] = []
    languages: List[str] = ["English"]
    energy: float = 0.5
    danceability: float = 0.5
    acousticness: float = 0.5
    valence: float = 0.5
    updated_at: Optional[str] = None
