from pydantic import BaseModel
from typing import List, Optional
from app.models.song import Song

class RecommendationHistoryItem(BaseModel):
    id: str
    user_id: str
    song_id: str
    song: Optional[Song] = None
    recommendation_score: float
    reason: str
    feedback: Optional[str] = None
    created_at: str

class RecommendationHistoryResponse(BaseModel):
    items: List[RecommendationHistoryItem]
    total: int
