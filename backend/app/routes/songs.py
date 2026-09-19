from datetime import datetime, timezone
from fastapi import APIRouter, Query, HTTPException, status, Depends
from typing import Optional, List
from app.models.song import Song, SongListResponse, SongDetailResponse, SearchResponse
from app.auth.jwt import get_current_user
from app.database.connection import db_manager
from app.ml.recommender import recommender


router = APIRouter(prefix="/api/songs", tags=["Songs"])

@router.get("", response_model=SongListResponse)
async def get_songs(
    search: Optional[str] = Query(None, description="Search by title, artist, or tags"),
    genre: Optional[str] = Query(None, description="Filter by genre"),
    mood: Optional[str] = Query(None, description="Filter by mood"),
    language: Optional[str] = Query(None, description="Filter by language"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    songs_coll = db_manager.get_collection("songs")
    query = {}
    if genre and genre.lower() != "all":
        query["genre"] = {"$regex": f"^{genre}$", "$options": "i"}
    if mood and mood.lower() != "all":
        query["mood"] = {"$regex": f"^{mood}$", "$options": "i"}
    if language and language.lower() != "all":
        query["language"] = {"$regex": f"^{language}$", "$options": "i"}
    if search:
        s = search.strip()
        query["$or"] = [
            {"title": {"$regex": s, "$options": "i"}},
            {"artist": {"$regex": s, "$options": "i"}},
            {"tags": {"$regex": s, "$options": "i"}},
            {"album": {"$regex": s, "$options": "i"}},
        ]

    total = await songs_coll.count_documents(query)
    skip = (page - 1) * limit
    cursor = songs_coll.find(query).skip(skip).limit(limit)
    raw_songs = await cursor.to_list(length=limit)

    # Get distinct metadata for filter dropdowns
    all_genres = await songs_coll.distinct("genre")
    all_moods = await songs_coll.distinct("mood")
    all_languages = await songs_coll.distinct("language")

    items = [Song(**s) for s in raw_songs]

    return SongListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        genres=sorted([str(g) for g in all_genres if g]),
        moods=sorted([str(m) for m in all_moods if m]),
        languages=sorted([str(l) for l in all_languages if l])
    )

@router.get("/search", response_model=SearchResponse)
async def search_catalog(
    q: str = Query(..., min_length=1, description="Search query across songs, artists, and albums"),
    type: Optional[str] = Query("all", description="Entity filter: all, songs, artists, albums"),
    limit: int = Query(20, ge=1, le=50)
):
    query_str = q.strip()
    songs_coll = db_manager.get_collection("songs")
    artists_coll = db_manager.get_collection("artists")
    albums_coll = db_manager.get_collection("albums")

    matched_songs = []
    matched_artists = []
    matched_albums = []

    regex_pattern = {"$regex": query_str, "$options": "i"}

    # Search songs
    if type in ["all", "songs"]:
        song_filter = {
            "$or": [
                {"title": regex_pattern},
                {"artist": regex_pattern},
                {"album": regex_pattern},
                {"genre": regex_pattern},
                {"mood": regex_pattern},
                {"tags": regex_pattern}
            ]
        }
        raw_songs = await songs_coll.find(song_filter).limit(limit).to_list(length=limit)
        matched_songs = [Song(**s) for s in raw_songs]

    # Search artists
    if type in ["all", "artists"]:
        artist_filter = {
            "$or": [
                {"name": regex_pattern},
                {"bio": regex_pattern},
                {"genres": regex_pattern}
            ]
        }
        raw_artists = await artists_coll.find(artist_filter).limit(limit).to_list(length=limit)
        matched_artists = [
            {
                "artist_id": a["artist_id"],
                "name": a["name"],
                "image": a.get("image", ""),
                "genres": a.get("genres", []),
                "popularity": a.get("popularity", 75)
            }
            for a in raw_artists
        ]

    # Search albums
    if type in ["all", "albums"]:
        album_filter = {
            "$or": [
                {"title": regex_pattern},
                {"artist": regex_pattern},
                {"genre": regex_pattern}
            ]
        }
        raw_albums = await albums_coll.find(album_filter).limit(limit).to_list(length=limit)
        matched_albums = [
            {
                "album_id": al["album_id"],
                "title": al["title"],
                "artist": al.get("artist", ""),
                "artist_id": al.get("artist_id", ""),
                "cover": al.get("cover", ""),
                "release_date": al.get("release_date", ""),
                "genre": al.get("genre", "")
            }
            for al in raw_albums
        ]

    total = len(matched_songs) + len(matched_artists) + len(matched_albums)
    return SearchResponse(
        query=query_str,
        songs=matched_songs,
        artists=matched_artists,
        albums=matched_albums,
        total_matches=total
    )

@router.get("/{id}", response_model=SongDetailResponse)
async def get_song_detail(id: str):
    songs_coll = db_manager.get_collection("songs")
    song_doc = await songs_coll.find_one({"song_id": id})
    if not song_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Song with id '{id}' not found."
        )

    # Find content-similar songs using the ML engine
    similar_raw = recommender.get_similar_songs(id, top_k=6)
    similar_songs = [Song(**s) for s in similar_raw]

    return SongDetailResponse(
        song=Song(**song_doc),
        similar_songs=similar_songs,
        explanation=f"Matches the sonic profile, {song_doc.get('genre')} genre elements, and {song_doc.get('mood')} mood dynamics."
    )

@router.post("/{id}/like")
async def like_song(id: str, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("_id") or current_user.get("user_id"))
    songs_coll = db_manager.get_collection("songs")
    liked_coll = db_manager.get_collection("liked_songs")

    song = await songs_coll.find_one({"song_id": id})
    if not song:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Song not found")

    existing = await liked_coll.find_one({"user_id": user_id, "song_id": id})
    if not existing:
        await liked_coll.insert_one({
            "user_id": user_id,
            "song_id": id,
            "created_at": datetime.now(timezone.utc).isoformat()
        })

    # Log positive feedback into recommender
    recommender.record_feedback(user_id=user_id, song_id=id, feedback="like")

    return {"status": "liked", "song_id": id, "is_liked": True}

@router.delete("/{id}/like")
async def unlike_song(id: str, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("_id") or current_user.get("user_id"))
    liked_coll = db_manager.get_collection("liked_songs")

    await liked_coll.delete_one({"user_id": user_id, "song_id": id})
    return {"status": "unliked", "song_id": id, "is_liked": False}

@router.get("/{id}/liked")
async def check_is_liked(id: str, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("_id") or current_user.get("user_id"))
    liked_coll = db_manager.get_collection("liked_songs")

    existing = await liked_coll.find_one({"user_id": user_id, "song_id": id})
    return {"song_id": id, "is_liked": bool(existing)}

