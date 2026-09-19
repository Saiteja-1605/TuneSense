from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from typing import Optional, List
from app.models.history import RecommendationHistoryResponse, RecommendationHistoryItem
from app.models.song import Song
from app.auth.jwt import get_current_user
from app.database.connection import db_manager
from app.ml.recommender import recommender

router = APIRouter(prefix="/api/history", tags=["History & Playback Logs"])

class ListeningEventCreate(BaseModel):
    song_id: str
    duration_listened: int = 0
    completed: bool = False

@router.post("")
async def record_listening_event(
    event: ListeningEventCreate,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user.get("_id") or current_user.get("user_id"))
    history_coll = db_manager.get_collection("listening_history")

    entry = {
        "user_id": user_id,
        "song_id": event.song_id,
        "duration_listened": event.duration_listened,
        "completed": event.completed,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await history_coll.insert_one(entry)

    # Inform recommender for dynamic taste adaptation
    if event.completed or event.duration_listened >= 25:
        recommender.record_listening(user_id=user_id, song_id=event.song_id)

    return {"status": "recorded", "song_id": event.song_id}

@router.get("/recently-played", response_model=List[Song])
async def get_recently_played_songs(
    limit: int = Query(20, ge=1, le=50),
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user.get("_id") or current_user.get("user_id"))
    history_coll = db_manager.get_collection("listening_history")
    songs_coll = db_manager.get_collection("songs")

    cursor = history_coll.find({"user_id": user_id}).sort("created_at", -1).limit(limit * 2)
    raw = await cursor.to_list(length=limit * 2)

    seen = set()
    unique_song_ids = []
    for entry in raw:
        sid = entry.get("song_id")
        if sid and sid not in seen:
            seen.add(sid)
            unique_song_ids.append(sid)
            if len(unique_song_ids) >= limit:
                break

    songs = []
    for sid in unique_song_ids:
        doc = await songs_coll.find_one({"song_id": sid})
        if doc:
            songs.append(Song(**doc))

    return songs


@router.get("", response_model=RecommendationHistoryResponse)
async def get_history(
    limit: int = Query(50, ge=1, le=100),
    feedback: Optional[str] = Query(None, description="Filter by feedback ('like', 'dislike')"),
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user.get("_id") or current_user.get("user_id"))
    history_coll = db_manager.get_collection("recommendation_history")
    songs_coll = db_manager.get_collection("songs")

    query = {"user_id": user_id}
    if feedback and feedback.lower() != "all":
        query["feedback"] = feedback.lower()

    cursor = history_coll.find(query).sort("created_at", -1).limit(limit)
    raw_history = await cursor.to_list(length=limit)
    total = await history_coll.count_documents(query)

    # Hydrate songs
    items = []
    for h in raw_history:
        song_doc = await songs_coll.find_one({"song_id": h.get("song_id")})
        song_obj = Song(**song_doc) if song_doc else None
        
        items.append(RecommendationHistoryItem(
            id=str(h.get("_id")),
            user_id=user_id,
            song_id=h.get("song_id"),
            song=song_obj,
            recommendation_score=float(h.get("recommendation_score", 0.0)),
            reason=h.get("reason", ""),
            feedback=h.get("feedback"),
            created_at=h.get("created_at", "")
        ))

    return RecommendationHistoryResponse(items=items, total=total)

@router.delete("/{id}")
async def delete_history_item(id: str, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("_id") or current_user.get("user_id"))
    history_coll = db_manager.get_collection("recommendation_history")

    result = await history_coll.delete_one({"_id": id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="History entry not found.")

    return {"status": "success", "message": "History entry deleted."}

@router.delete("")
async def clear_all_history(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("_id") or current_user.get("user_id"))
    history_coll = db_manager.get_collection("recommendation_history")
    await history_coll.delete_many({"user_id": user_id})
    return {"status": "success", "message": "Recommendation history cleared."}

