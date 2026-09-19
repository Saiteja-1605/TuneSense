import datetime
import uuid
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from app.models.song import Song
from app.models.feedback import FeedbackCreate, FeedbackResponse
from app.auth.jwt import get_current_user
from app.database.connection import db_manager
from app.ml.recommender import recommender

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])

class RecommendationItemResponse(BaseModel):
    song: Song
    recommendation_score: float
    reason: str
    feedback: Optional[str] = None
    similarity: float

class RecommendationListResponse(BaseModel):
    items: List[RecommendationItemResponse]
    total: int
    user_preferences_summary: Dict[str, Any]

@router.get("", response_model=RecommendationListResponse)
async def get_recommendations(
    genre: Optional[str] = Query(None, description="Optional genre filter"),
    mood: Optional[str] = Query(None, description="Optional mood filter"),
    top_k: int = Query(10, ge=1, le=50),
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user.get("_id") or current_user.get("user_id"))
    
    # 1. Fetch user preferences
    prefs_coll = db_manager.get_collection("user_preferences")
    pref_doc = await prefs_coll.find_one({"user_id": user_id})
    if not pref_doc:
        pref_doc = {
            "favorite_genres": ["Pop", "Electronic"],
            "favorite_moods": ["Upbeat", "Energetic"],
            "languages": ["English"],
            "energy": 0.75,
            "danceability": 0.70,
            "acousticness": 0.30,
            "valence": 0.70
        }

    # 2. Fetch user feedback (liked and disliked songs)
    feedback_coll = db_manager.get_collection("feedback")
    feedback_cursor = feedback_coll.find({"user_id": user_id})
    user_feedbacks = await feedback_cursor.to_list(length=1000)

    liked_ids = [f["song_id"] for f in user_feedbacks if f.get("feedback") == "like"]
    disliked_ids = [f["song_id"] for f in user_feedbacks if f.get("feedback") == "dislike"]
    feedback_map = {f["song_id"]: f.get("feedback") for f in user_feedbacks}

    # 3. Generate ML recommendations
    raw_recs = recommender.recommend(
        user_pref=pref_doc,
        disliked_song_ids=disliked_ids,
        liked_song_ids=liked_ids,
        top_k=top_k,
        genre_filter=genre,
        mood_filter=mood
    )

    # 4. Save to recommendation_history in batch
    history_coll = db_manager.get_collection("recommendation_history")
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    
    items = []
    history_items = []
    for r in raw_recs:
        s_data = r["song"]
        song_id = s_data["song_id"]
        current_fb = feedback_map.get(song_id)

        history_items.append({
            "_id": str(uuid.uuid4()),
            "user_id": user_id,
            "song_id": song_id,
            "recommendation_score": r["score"],
            "reason": r["reason"],
            "feedback": current_fb,
            "created_at": now_iso
        })

        items.append(RecommendationItemResponse(
            song=Song(**s_data),
            recommendation_score=r["score"],
            reason=r["reason"],
            feedback=current_fb,
            similarity=r.get("similarity", 0.0)
        ))

    if history_items:
        try:
            await history_coll.insert_many(history_items)
        except Exception:
            pass

    return RecommendationListResponse(
        items=items,
        total=len(items),
        user_preferences_summary={
            "genres": pref_doc.get("favorite_genres", []),
            "moods": pref_doc.get("favorite_moods", []),
            "energy": pref_doc.get("energy", 0.5),
            "danceability": pref_doc.get("danceability", 0.5)
        }
    )

@router.post("/feedback", response_model=FeedbackResponse)
async def submit_feedback(payload: FeedbackCreate, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("_id") or current_user.get("user_id"))
    feedback_coll = db_manager.get_collection("feedback")
    history_coll = db_manager.get_collection("recommendation_history")
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

    # Update or insert in feedback collection
    await feedback_coll.update_one(
        {"user_id": user_id, "song_id": payload.song_id},
        {"$set": {
            "feedback": payload.feedback,
            "created_at": now_iso
        }},
        upsert=True
    )

    # Also update the latest history entry for this song
    await history_coll.update_one(
        {"user_id": user_id, "song_id": payload.song_id},
        {"$set": {"feedback": payload.feedback}}
    )

    msg = f"Song successfully marked as '{payload.feedback}'." if payload.feedback != "none" else "Feedback removed."
    return FeedbackResponse(
        status="success",
        message=msg,
        song_id=payload.song_id,
        feedback=payload.feedback
    )
