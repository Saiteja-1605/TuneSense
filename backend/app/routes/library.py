from fastapi import APIRouter, Depends
from app.models.library import LibrarySummaryResponse, LikedSongsResponse
from app.models.song import Song
from app.models.playlist import Playlist
from app.auth.jwt import get_current_user
from app.database.connection import db_manager

router = APIRouter(prefix="/api/library", tags=["Library"])

@router.get("", response_model=LibrarySummaryResponse)
async def get_library_summary(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("_id") or current_user.get("user_id"))
    
    liked_coll = db_manager.get_collection("liked_songs")
    playlists_coll = db_manager.get_collection("playlists")
    history_coll = db_manager.get_collection("listening_history")
    songs_coll = db_manager.get_collection("songs")

    liked_count = await liked_coll.count_documents({"user_id": user_id})
    playlists_count = await playlists_coll.count_documents({"user_id": user_id})
    history_count = await history_coll.count_documents({"user_id": user_id})

    # Recent playlists
    p_cursor = playlists_coll.find({"user_id": user_id}).sort("updated_at", -1).limit(6)
    p_raw = await p_cursor.to_list(length=6)
    recent_playlists = [
        Playlist(
            id=str(p["_id"]),
            user_id=p["user_id"],
            title=p["title"],
            description=p.get("description", ""),
            cover=p.get("cover") or "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60",
            is_public=p.get("is_public", False),
            song_count=len(p.get("songs", [])),
            songs=p.get("songs", []),
            created_at=p.get("created_at", ""),
            updated_at=p.get("updated_at", "")
        )
        for p in p_raw
    ]

    # Recent liked songs
    l_cursor = liked_coll.find({"user_id": user_id}).sort("created_at", -1).limit(6)
    l_raw = await l_cursor.to_list(length=6)
    liked_song_ids = [item["song_id"] for item in l_raw]
    
    recent_liked_songs = []
    if liked_song_ids:
        for sid in liked_song_ids:
            s = await songs_coll.find_one({"song_id": sid})
            if s:
                recent_liked_songs.append(Song(**s))

    return LibrarySummaryResponse(
        liked_songs_count=liked_count,
        playlists_count=playlists_count,
        recent_history_count=history_count,
        recent_playlists=recent_playlists,
        recent_liked_songs=recent_liked_songs
    )

@router.get("/liked", response_model=LikedSongsResponse)
async def get_liked_songs(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("_id") or current_user.get("user_id"))
    liked_coll = db_manager.get_collection("liked_songs")
    songs_coll = db_manager.get_collection("songs")

    cursor = liked_coll.find({"user_id": user_id}).sort("created_at", -1)
    raw = await cursor.to_list(length=200)

    songs = []
    for item in raw:
        s = await songs_coll.find_one({"song_id": item["song_id"]})
        if s:
            songs.append(Song(**s))

    return LikedSongsResponse(
        items=songs,
        total=len(songs)
    )
