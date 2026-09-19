import datetime
from fastapi import APIRouter, Depends
from app.models.preference import UserPreferenceUpdate, UserPreferenceResponse
from app.auth.jwt import get_current_user
from app.database.connection import db_manager

router = APIRouter(prefix="/api/preferences", tags=["Preferences"])

@router.get("", response_model=UserPreferenceResponse)
async def get_preferences(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("_id") or current_user.get("user_id"))
    prefs_coll = db_manager.get_collection("user_preferences")
    pref = await prefs_coll.find_one({"user_id": user_id})
    if not pref:
        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
        pref = {
            "user_id": user_id,
            "favorite_genres": ["Pop", "Electronic"],
            "favorite_moods": ["Upbeat", "Energetic"],
            "languages": ["English"],
            "energy": 0.75,
            "danceability": 0.70,
            "acousticness": 0.30,
            "valence": 0.70,
            "updated_at": now_iso
        }
        await prefs_coll.insert_one(pref)

    return UserPreferenceResponse(
        user_id=user_id,
        favorite_genres=pref.get("favorite_genres", []),
        favorite_moods=pref.get("favorite_moods", []),
        languages=pref.get("languages", ["English"]),
        energy=float(pref.get("energy", 0.5)),
        danceability=float(pref.get("danceability", 0.5)),
        acousticness=float(pref.get("acousticness", 0.5)),
        valence=float(pref.get("valence", 0.5)),
        updated_at=pref.get("updated_at")
    )

@router.put("", response_model=UserPreferenceResponse)
async def update_preferences(payload: UserPreferenceUpdate, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("_id") or current_user.get("user_id"))
    prefs_coll = db_manager.get_collection("user_preferences")
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

    update_doc = {
        "favorite_genres": payload.favorite_genres,
        "favorite_moods": payload.favorite_moods,
        "languages": payload.languages,
        "energy": payload.energy,
        "danceability": payload.danceability,
        "acousticness": payload.acousticness,
        "valence": payload.valence,
        "updated_at": now_iso
    }

    await prefs_coll.update_one(
        {"user_id": user_id},
        {"$set": update_doc},
        upsert=True
    )

    return UserPreferenceResponse(
        user_id=user_id,
        favorite_genres=payload.favorite_genres,
        favorite_moods=payload.favorite_moods,
        languages=payload.languages,
        energy=payload.energy,
        danceability=payload.danceability,
        acousticness=payload.acousticness,
        valence=payload.valence,
        updated_at=now_iso
    )
