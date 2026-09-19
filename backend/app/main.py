import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database.connection import db_manager
from app.database.seed import seed_songs_if_needed
from app.ml.recommender import recommender
from app.routes.auth import router as auth_router
from app.routes.songs import router as songs_router
from app.routes.recommendations import router as recommendations_router
from app.routes.preferences import router as preferences_router
from app.routes.history import router as history_router
from app.routes.analytics import router as analytics_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("tunesense")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing TuneSense backend...")
    # 1. Connect to Database
    await db_manager.connect(settings.MONGODB_URI, settings.DATABASE_NAME)

    # 2. Seed songs catalog if empty
    await seed_songs_if_needed(db_manager.db)

    # 3. Train & Fit ML Recommender with song catalog
    songs_coll = db_manager.get_collection("songs")
    cursor = songs_coll.find({})
    songs = await cursor.to_list(length=1000)
    recommender.fit(songs)
    logger.info(f"TuneSense ML Engine ready with {len(songs)} indexed tracks.")

    yield

    logger.info("Shutting down TuneSense backend...")
    await db_manager.close()

app = FastAPI(
    title="TuneSense API",
    description="Production REST API and Machine Learning Recommender Engine for TuneSense",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for seamless cross-deployment & local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth_router)
app.include_router(songs_router)
app.include_router(recommendations_router)
app.include_router(preferences_router)
app.include_router(history_router)
app.include_router(analytics_router)

@app.get("/")
async def root():
    return {
        "service": "TuneSense API",
        "status": "online",
        "version": "1.0.0",
        "ml_status": "fitted" if recommender.is_fitted else "ready",
        "docs": "/docs"
    }

@app.get("/api/health")
async def health():
    return {
        "status": "healthy",
        "database": "mock_async" if db_manager.is_mock else "mongodb_atlas",
        "tracks_indexed": len(recommender.songs_df) if recommender.songs_df is not None else 0
    }
