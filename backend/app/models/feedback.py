from pydantic import BaseModel, Field
from typing import Literal

class FeedbackCreate(BaseModel):
    song_id: str
    feedback: Literal["like", "dislike", "none"] = Field(..., json_schema_extra={"example": "like"})

class FeedbackResponse(BaseModel):
    status: str = "success"
    message: str
    song_id: str
    feedback: str
