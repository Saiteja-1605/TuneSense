from fastapi import APIRouter, HTTPException, status, Query
from typing import Optional, List
from app.models.album import Album, AlbumDetailResponse
from app.models.song import Song
from app.database.connection import db_manager

router = APIRouter(prefix="/api/albums", tags=["Albums"])

@router.get("", response_model=List[Album])
async def get_albums(
    search: Optional[str] = Query(None),
    genre: Optional[str] = Query(None),
    limit: int = Query(24, ge=1, le=100)
):
    albums_coll = db_manager.get_collection("albums")
    query = {}
    if genre and genre.lower() != "all":
        query["genre"] = {"$regex": f"^{genre}$", "$options": "i"}
    if search:
        query["$or"] = [
            {"title": {"$regex": search.strip(), "$options": "i"}},
            {"artist": {"$regex": search.strip(), "$options": "i"}}
        ]

    cursor = albums_coll.find(query).limit(limit)
    albums = await cursor.to_list(length=limit)
    return [Album(**a) for a in albums]

@router.get("/{id}", response_model=AlbumDetailResponse)
async def get_album_detail(id: str):
    albums_coll = db_manager.get_collection("albums")
    songs_coll = db_manager.get_collection("songs")

    album_doc = await albums_coll.find_one({"album_id": id})
    if not album_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Album '{id}' not found.")

    # Fetch tracks in album
    song_ids = album_doc.get("songs", [])
    if song_ids:
        track_cursor = songs_coll.find({"song_id": {"$in": song_ids}})
        tracks_raw = await track_cursor.to_list(length=len(song_ids))
    else:
        track_cursor = songs_coll.find({"album_id": id})
        tracks_raw = await track_cursor.to_list(length=50)

    tracks = [Song(**s) for s in tracks_raw]

    return AlbumDetailResponse(
        album=Album(**album_doc),
        tracks=tracks
    )
