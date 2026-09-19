import datetime
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from app.models.playlist import Playlist, PlaylistCreate, PlaylistUpdate, PlaylistDetailResponse
from app.models.song import Song
from app.auth.jwt import get_current_user, get_optional_current_user
from app.database.connection import db_manager

router = APIRouter(prefix="/api/playlists", tags=["Playlists"])


@router.get("", response_model=List[Playlist])
async def get_user_playlists(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("_id") or current_user.get("user_id"))
    playlists_coll = db_manager.get_collection("playlists")

    cursor = playlists_coll.find({"user_id": user_id}).sort("updated_at", -1)
    raw = await cursor.to_list(length=100)

    results = []
    for p in raw:
        songs_list = p.get("songs", [])
        results.append(Playlist(
            id=str(p["_id"]),
            user_id=p["user_id"],
            title=p["title"],
            description=p.get("description", ""),
            cover=p.get("cover") or "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60",
            is_public=p.get("is_public", False),
            song_count=len(songs_list),
            songs=songs_list,
            created_at=p.get("created_at", ""),
            updated_at=p.get("updated_at", "")
        ))
    return results

@router.post("", response_model=Playlist, status_code=status.HTTP_201_CREATED)
async def create_playlist(payload: PlaylistCreate, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("_id") or current_user.get("user_id"))
    playlists_coll = db_manager.get_collection("playlists")

    playlist_id = str(uuid.uuid4())
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    default_cover = payload.cover or "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60"

    playlist_doc = {
        "_id": playlist_id,
        "user_id": user_id,
        "title": payload.title.strip(),
        "description": payload.description or "",
        "cover": default_cover,
        "is_public": payload.is_public,
        "songs": [],
        "created_at": now_iso,
        "updated_at": now_iso
    }

    await playlists_coll.insert_one(playlist_doc)

    return Playlist(
        id=playlist_id,
        user_id=user_id,
        title=playlist_doc["title"],
        description=playlist_doc["description"],
        cover=playlist_doc["cover"],
        is_public=playlist_doc["is_public"],
        song_count=0,
        songs=[],
        created_at=now_iso,
        updated_at=now_iso
    )

@router.get("/{id}", response_model=PlaylistDetailResponse)
async def get_playlist_detail(id: str, current_user: Optional[dict] = Depends(get_optional_current_user)):
    user_id = str(current_user.get("_id") or current_user.get("user_id")) if current_user else None
    playlists_coll = db_manager.get_collection("playlists")
    songs_coll = db_manager.get_collection("songs")

    playlist_doc = await playlists_coll.find_one({"_id": id})
    if not playlist_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Playlist not found.")

    if not playlist_doc.get("is_public", False):
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required for private playlist.")
        if playlist_doc.get("user_id") != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to private playlist.")


    song_ids = playlist_doc.get("songs", [])
    tracks = []
    total_dur = 0
    if song_ids:
        # Preserve song ordering as stored in playlist
        for sid in song_ids:
            s = await songs_coll.find_one({"song_id": sid})
            if s:
                song_obj = Song(**s)
                tracks.append(song_obj)
                total_dur += song_obj.duration

    # If first track has album_art and playlist has default cover, dynamically adopt first track cover
    cover = playlist_doc.get("cover")
    if tracks and (not cover or "photo-1514525253161" in cover):
        cover = tracks[0].album_art or cover

    playlist_obj = Playlist(
        id=str(playlist_doc["_id"]),
        user_id=playlist_doc["user_id"],
        title=playlist_doc["title"],
        description=playlist_doc.get("description", ""),
        cover=cover,
        is_public=playlist_doc.get("is_public", False),
        song_count=len(tracks),
        songs=song_ids,
        created_at=playlist_doc.get("created_at", ""),
        updated_at=playlist_doc.get("updated_at", "")
    )

    return PlaylistDetailResponse(
        playlist=playlist_obj,
        tracks=tracks,
        total_duration=total_dur
    )

@router.put("/{id}", response_model=Playlist)
async def update_playlist(id: str, payload: PlaylistUpdate, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("_id") or current_user.get("user_id"))
    playlists_coll = db_manager.get_collection("playlists")

    update_fields = {"updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat()}
    if payload.title is not None:
        update_fields["title"] = payload.title.strip()
    if payload.description is not None:
        update_fields["description"] = payload.description.strip()
    if payload.cover is not None:
        update_fields["cover"] = payload.cover
    if payload.is_public is not None:
        update_fields["is_public"] = payload.is_public

    res = await playlists_coll.update_one({"_id": id, "user_id": user_id}, {"$set": update_fields})
    if res.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Playlist not found.")

    updated = await playlists_coll.find_one({"_id": id})
    songs_list = updated.get("songs", [])
    return Playlist(
        id=str(updated["_id"]),
        user_id=updated["user_id"],
        title=updated["title"],
        description=updated.get("description", ""),
        cover=updated.get("cover", ""),
        is_public=updated.get("is_public", False),
        song_count=len(songs_list),
        songs=songs_list,
        created_at=updated.get("created_at", ""),
        updated_at=updated.get("updated_at", "")
    )

@router.delete("/{id}")
async def delete_playlist(id: str, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("_id") or current_user.get("user_id"))
    playlists_coll = db_manager.get_collection("playlists")

    res = await playlists_coll.delete_one({"_id": id, "user_id": user_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Playlist not found.")

    return {"status": "success", "message": "Playlist deleted successfully."}

@router.post("/{id}/songs")
async def add_song_to_playlist(id: str, payload: dict, current_user: dict = Depends(get_current_user)):
    song_id = payload.get("song_id")
    if not song_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="song_id required.")

    user_id = str(current_user.get("_id") or current_user.get("user_id"))
    playlists_coll = db_manager.get_collection("playlists")
    songs_coll = db_manager.get_collection("songs")

    # Verify song exists
    song = await songs_coll.find_one({"song_id": song_id})
    if not song:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Song not found.")

    playlist = await playlists_coll.find_one({"_id": id, "user_id": user_id})
    if not playlist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Playlist not found.")

    if song_id in playlist.get("songs", []):
        return {"status": "success", "message": "Song already in playlist.", "songs": playlist.get("songs", [])}

    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    await playlists_coll.update_one(
        {"_id": id, "user_id": user_id},
        {
            "$push": {"songs": song_id},
            "$set": {"updated_at": now_iso}
        }
    )

    updated_pl = await playlists_coll.find_one({"_id": id, "user_id": user_id})
    return {"status": "success", "message": f"Added '{song['title']}' to playlist.", "songs": updated_pl.get("songs", [])}

@router.delete("/{id}/songs/{song_id}")
async def remove_song_from_playlist(id: str, song_id: str, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("_id") or current_user.get("user_id"))
    playlists_coll = db_manager.get_collection("playlists")

    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    res = await playlists_coll.update_one(
        {"_id": id, "user_id": user_id},
        {
            "$pull": {"songs": song_id},
            "$set": {"updated_at": now_iso}
        }
    )

    if res.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Playlist not found.")

    updated_pl = await playlists_coll.find_one({"_id": id, "user_id": user_id})
    return {"status": "success", "message": "Song removed from playlist.", "songs": updated_pl.get("songs", []) if updated_pl else []}

