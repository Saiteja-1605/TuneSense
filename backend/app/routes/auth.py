import datetime
import uuid
from fastapi import APIRouter, HTTPException, status, Depends
from app.models.user import UserRegister, UserLogin, UserResponse, TokenResponse
from app.auth.security import hash_password, verify_password
from app.auth.jwt import create_access_token, get_current_user
from app.database.connection import db_manager

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister):
    users_coll = db_manager.get_collection("users")
    
    # Check if user already exists
    existing = await users_coll.find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    user_id = str(uuid.uuid4())
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    hashed = hash_password(payload.password)

    user_doc = {
        "_id": user_id,
        "name": payload.name.strip(),
        "email": payload.email.lower(),
        "password_hash": hashed,
        "created_at": now_iso
    }
    await users_coll.insert_one(user_doc)

    # Initialize default user preferences
    prefs_coll = db_manager.get_collection("user_preferences")
    default_prefs = {
        "_id": str(uuid.uuid4()),
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
    await prefs_coll.insert_one(default_prefs)

    token = create_access_token({"sub": user_id, "email": user_doc["email"]})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=user_id,
            name=user_doc["name"],
            email=user_doc["email"],
            created_at=now_iso
        )
    )

@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin):
    users_coll = db_manager.get_collection("users")
    user = await users_coll.find_one({"email": payload.email.lower()})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    user_id = str(user.get("_id") or user.get("user_id"))
    token = create_access_token({"sub": user_id, "email": user["email"]})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=user_id,
            name=user["name"],
            email=user["email"],
            created_at=user.get("created_at")
        )
    )

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=str(current_user.get("_id") or current_user.get("user_id")),
        name=current_user["name"],
        email=current_user["email"],
        created_at=current_user.get("created_at")
    )
