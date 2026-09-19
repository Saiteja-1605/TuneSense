from fastapi import APIRouter, Query, HTTPException, status
from typing import Optional, List
from app.models.song import Song, SongListResponse, SongDetailResponse
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
