from fastapi import APIRouter, HTTPException, status, Query
from typing import Optional, List
from app.models.artist import Artist, ArtistDetailResponse, AlbumSummary
from app.models.song import Song
from app.database.connection import db_manager

router = APIRouter(prefix="/api/artists", tags=["Artists"])

@router.get("", response_model=List[Artist])
async def get_artists(
    search: Optional[str] = Query(None),
    genre: Optional[str] = Query(None),
    limit: int = Query(24, ge=1, le=100)
):
    artists_coll = db_manager.get_collection("artists")
    query = {}
    if genre and genre.lower() != "all":
        query["genres"] = {"$regex": f"^{genre}$", "$options": "i"}
    if search:
        query["name"] = {"$regex": search.strip(), "$options": "i"}

    cursor = artists_coll.find(query).limit(limit)
    artists = await cursor.to_list(length=limit)
    return [Artist(**a) for a in artists]

@router.get("/{id}", response_model=ArtistDetailResponse)
async def get_artist_detail(id: str):
    artists_coll = db_manager.get_collection("artists")
    songs_coll = db_manager.get_collection("songs")
    albums_coll = db_manager.get_collection("albums")

    artist_doc = await artists_coll.find_one({"artist_id": id})
    if not artist_doc:
        # Also check by name
        artist_doc = await artists_coll.find_one({"name": {"$regex": f"^{id}$", "$options": "i"}})
    if not artist_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Artist '{id}' not found.")

    artist_id = artist_doc["artist_id"]
    artist_name = artist_doc["name"]

    # Fetch artist's top songs (by popularity)
    song_cursor = songs_coll.find({"$or": [{"artist_id": artist_id}, {"artist": artist_name}]}).sort("popularity", -1).limit(10)
    top_songs_raw = await song_cursor.to_list(length=10)
    top_songs = [Song(**s) for s in top_songs_raw]

    # Fetch artist's albums
    alb_cursor = albums_coll.find({"$or": [{"artist_id": artist_id}, {"artist": artist_name}]})
    albums_raw = await alb_cursor.to_list(length=20)
    albums = [
        AlbumSummary(
            album_id=a["album_id"],
            title=a["title"],
            cover=a["cover"],
            release_date=a.get("release_date", "2024"),
            genre=a.get("genre", "Pop")
        )
        for a in albums_raw
    ]

    # Related artists (matching genres)
    primary_genre = artist_doc.get("genres", ["Pop"])[0]
    rel_cursor = artists_coll.find({
        "artist_id": {"$ne": artist_id},
        "genres": {"$regex": f"^{primary_genre}$", "$options": "i"}
    }).limit(4)
    rel_raw = await rel_cursor.to_list(length=4)
    related = [Artist(**a) for a in rel_raw]

    return ArtistDetailResponse(
        artist=Artist(**artist_doc),
        top_songs=top_songs,
        albums=albums,
        related_artists=related
    )
