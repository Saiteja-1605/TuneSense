# TuneSense – Personalized Music Recommendation System

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](https://opensource.org/licenses/MIT)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.5-F7931E.svg?logo=scikitlearn&logoColor=white)](https://scikit-learn.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg?logo=mongodb&logoColor=white)](https://www.mongodb.com)

> **TuneSense** is a full-stack, personalized music recommendation web application powered by content-based machine learning, semantic text vectorization, continuous acoustic feature modeling, and interactive data visualizations.

---

## 🎧 Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Machine Learning Recommendation Engine](#machine-learning-recommendation-engine)
- [Database Schema](#database-schema)
- [REST API Reference](#rest-api-reference)
- [Local Development Setup](#local-development-setup)
- [Environment Variables](#environment-variables)
- [Running Backend & Frontend](#running-backend--frontend)
- [Database Seeding](#database-seeding)
- [Render Production Deployment](#render-production-deployment)
- [Future Enhancements](#future-enhancements)

---

## Overview

TuneSense was built to demonstrate a complete, production-grade recommendation pipeline that moves beyond basic metadata matching. Instead of relying on closed third-party APIs, TuneSense implements an in-house **content-based recommendation engine** in Python that computes high-dimensional similarity across genre taxonomies, mood indicators, linguistic elements, and normalized acoustic attributes (energy, danceability, tempo, acousticness, valence).

The platform pairs this engine with explainable AI (generating human-readable rationales for every recommendation), active user feedback loops, persistent recommendation history, and rich interactive visual analytics.

---

## Key Features

- **Personalized Music Discovery**: Generates ranked song recommendations matching user preferences and liked songs with dynamic similarity match scores.
- **Explainable AI (XAI)**: Provides clear explanations for why each track was chosen (e.g., *"Recommended because it matches your favorite genre (Pop), fits your Energetic mood, and aligns closely with your desired tempo and rhythm (Energy: 85%, Danceability: 82%)"*).
- **Active Feedback Loop**: Like songs to steer future recommendations; dislike songs to immediately suppress them from your feed.
- **Acoustic Fingerprinting**: Continuous sliders for target energy, danceability, acousticness, and valence.
- **Interactive Visual Analytics**:
  - Recommended Genre Distribution (Bar chart)
  - Mood Proportions Breakdown (Donut/Pie chart)
  - Feedback Loop Sentiment (Likes vs Dislikes ratio)
  - User Profile Radar Chart (Target preferences vs Library average)
  - Recommendation Telemetry Trend (Area chart over time)
- **120+ Song Seed Library**: Spanning 12 distinct genres (Pop, Rock, Electronic, Hip-Hop, R&B, Indie, Jazz, Classical, Ambient, Latin, Metal, Folk).
- **Secure Authentication**: JWT-based session tokens, Passlib bcrypt salted password hashing, and protected routes.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, React Router v6, Axios, Recharts, Lucide React |
| **Backend** | Python 3.12, FastAPI, Pydantic v2, Uvicorn, Passlib (Bcrypt), PyJWT, Python-Multipart |
| **Machine Learning** | scikit-learn, NumPy, pandas, TF-IDF Vectorizer, Cosine Similarity, Feature Scaling |
| **Database** | MongoDB Atlas (Production) / Motor Async Client (with in-memory async fallback for offline testing) |
| **Deployment** | Render (FastAPI Web Service + React Static Site) with `render.yaml` Blueprint |

---

## System Architecture

```
TuneSense/
├── frontend/                     # React + Vite Client
│   ├── src/
│   │   ├── api/                  # Axios HTTP client & API service layer
│   │   ├── components/           # Reusable UI (SongCard, AudioFeaturesBar, StatCard, Toast, Navbar, Sidebar)
│   │   ├── context/              # AuthContext (state, JWT token persistence, toasts)
│   │   ├── layouts/              # AppLayout (responsive desktop sidebar + mobile bottom nav)
│   │   ├── pages/                # Landing, Login, Register, Dashboard, Discover, Catalog, SongDetail, Preferences, History, Analytics, Profile
│   │   ├── App.jsx               # Route definitions & guards
│   │   ├── index.css             # Tailwind styling and custom equalizer animations
│   │   └── main.jsx              # DOM root mount
│   ├── package.json
│   └── vite.config.js
│
├── backend/                      # Python FastAPI Service
│   ├── app/
│   │   ├── auth/                 # Bcrypt hashing & PyJWT token utilities
│   │   ├── database/             # Async Motor MongoDB connection, in-memory fallback, & seed logic
│   │   ├── ml/                   # Content-Based Recommender & Explanation Engine
│   │   ├── models/               # Pydantic v2 schemas (User, Song, Preference, History, Feedback)
│   │   ├── routes/               # REST API endpoints (Auth, Songs, Recs, History, Preferences, Analytics)
│   │   ├── config.py             # Pydantic Settings & environment variables
│   │   └── main.py               # FastAPI application, CORS, lifespan startup/shutdown
│   ├── tests/                    # Pytest test suite (ML tests, Auth tests, End-to-End API tests)
│   └── requirements.txt
│
├── data/
│   └── songs.json                # 120+ curated songs with rich metadata & acoustic audio metrics
├── render.yaml                   # Infrastructure-as-code configuration for Render deployment
└── README.md
```

---

## Machine Learning Recommendation Engine

The recommendation engine implements **Content-Based Vector Space Modeling**:

### 1. Text Semantic Vectorization (TF-IDF)
For each song in the catalog, a compound textual representation is synthesized:
$$\text{Document}(s) = \text{Genre} \times 2 + \text{Mood} \times 2 + \text{Tags} \times 2 + \text{Artist} + \text{Language} + \text{Description}$$
We fit a `TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True, stop_words='english')` across the catalog, producing an $N \times D_{\text{text}}$ sparse matrix, which is then normalized to unit Euclidean length:
$$\mathbf{v}_{\text{text}}(s) = \frac{\mathbf{t}(s)}{\|\mathbf{t}(s)\|_2}$$

### 2. Continuous Acoustic Feature Normalization
Continuous audio metrics are standardized into $[0, 1]$:
$$\mathbf{v}_{\text{audio}}(s) = \left[\frac{\text{tempo} - 60}{120},\, \text{energy},\, \text{danceability},\, \text{acousticness},\, \text{instrumentalness},\, \text{valence}\right]$$
Normalized:
$$\mathbf{v}_{\text{audio}}(s) = \frac{\mathbf{v}_{\text{audio}}(s)}{\|\mathbf{v}_{\text{audio}}(s)\|_2}$$

### 3. Composite Feature Fusion
The combined representation is formed via weighted multi-modal concatenation:
$$\mathbf{v}_{\text{combined}}(s) = \frac{\left[0.65 \cdot \mathbf{v}_{\text{text}}(s) \;\|\; 0.35 \cdot \mathbf{v}_{\text{audio}}(s)\right]}{\|\left[0.65 \cdot \mathbf{v}_{\text{text}}(s) \;\|\; 0.35 \cdot \mathbf{v}_{\text{audio}}(s)\right]\|_2}$$

### 4. Dynamic User Vector Formulation
A user vector $\mathbf{u}$ is constructed using their stated preferences (`favorite_genres`, `favorite_moods`, target energy, target danceability). When the user has liked tracks, their vector is refined by blending the user profile with the centroid of their liked tracks:
$$\mathbf{u}_{\text{refined}} = 0.65 \cdot \mathbf{u}_{\text{profile}} + 0.35 \cdot \left(\frac{1}{|L|}\sum_{l \in L}\mathbf{v}_{\text{combined}}(l)\right)$$

### 5. Cosine Similarity & Dislike Filtering
Cosine similarity is computed via dot product:
$$\text{Sim}(\mathbf{u}, s) = \mathbf{u} \cdot \mathbf{v}_{\text{combined}}(s)$$
Songs that the user has disliked ($s \in D$) are strictly excluded. The similarity is transformed into an intuitive match percentage ($60\% - 99\%$) and passed to the explanation generator.

---

## Database Schema

MongoDB Collections:
- **`users`**: `_id`, `name`, `email`, `password_hash`, `created_at`
- **`songs`**: `song_id`, `title`, `artist`, `album`, `genre`, `mood`, `language`, `popularity`, `tempo`, `energy`, `danceability`, `acousticness`, `instrumentalness`, `valence`, `description`, `tags`
- **`user_preferences`**: `user_id`, `favorite_genres`, `favorite_moods`, `languages`, `energy`, `danceability`, `acousticness`, `valence`, `updated_at`
- **`recommendation_history`**: `_id`, `user_id`, `song_id`, `recommendation_score`, `reason`, `feedback`, `created_at`
- **`feedback`**: `user_id`, `song_id`, `feedback` ("like" / "dislike"), `created_at`

---

## REST API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user, creates default preferences |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/api/auth/me` | Bearer | Get current authenticated user profile |
| `GET` | `/api/songs` | Public | List & search songs with pagination & filters |
| `GET` | `/api/songs/{id}` | Public | Song metadata & content-similar tracks |
| `GET` | `/api/recommendations` | Bearer | Fetch top personalized recommendations + score + explanation |
| `POST` | `/api/recommendations/feedback` | Bearer | Submit like / dislike feedback for a track |
| `GET` | `/api/history` | Bearer | Retrieve user's recommendation history log |
| `DELETE` | `/api/history/{id}` | Bearer | Remove item from recommendation history |
| `GET` | `/api/preferences` | Bearer | Retrieve user's acoustic preferences |
| `PUT` | `/api/preferences` | Bearer | Update user's acoustic preferences & sliders |
| `GET` | `/api/analytics` | Bearer | Aggregate telemetry for Recharts visualizations |
| `GET` | `/api/health` | Public | Service health & indexed track count check |

---

## Local Development Setup

### Prerequisites
- Python 3.10+ (tested on Python 3.12)
- Node.js 18+ & npm
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/Saiteja-1605/TuneSense.git
cd TuneSense
```

### 2. Backend Setup
```bash
cd backend
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run test suite
pytest tests -v

# Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```
Backend API will be accessible at `http://127.0.0.1:8000` with interactive Swagger docs at `http://127.0.0.1:8000/docs`.

### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend will be accessible at `http://localhost:5173`.

---

## Environment Variables

### Backend (`backend/.env`)
```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
DATABASE_NAME=tunesense
JWT_SECRET=super_secret_jwt_key_here
FRONTEND_URL=https://tunesense-frontend.onrender.com,http://localhost:5173
PORT=8000
```

### Frontend (`frontend/.env`)
```env
# Leave blank in development to leverage Vite dev proxy:
VITE_API_URL=
# In production on Render:
# VITE_API_URL=https://tunesense-backend.onrender.com
```

---

## Database Seeding

The song catalog (120+ tracks in `data/songs.json`) is **automatically loaded and indexed** into MongoDB upon startup when the database is empty. You do not need to manually import records.

To re-generate or modify the seed dataset:
```bash
python backend/app/database/generate_dataset.py
```

---

## Render Production Deployment

TuneSense is configured for 1-click deployment on [Render](https://render.com) using the included `render.yaml` blueprint:

### 1. Backend Web Service
- **Environment**: Python 3.12
- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables**:
  - `MONGODB_URI`: Your MongoDB Atlas connection URI
  - `DATABASE_NAME`: `tunesense`
  - `JWT_SECRET`: Random secure string
  - `FRONTEND_URL`: URL of your deployed frontend (for CORS)

### 2. Frontend Static Site
- **Environment**: Static
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `./dist`
- **Rewrite Rule**: `/* -> /index.html` (SPA fallback)
- **Environment Variables**:
  - `VITE_API_URL`: Your deployed backend URL (e.g., `https://tunesense-backend.onrender.com`)

---

## Future Enhancements

- **Collaborative Filtering**: Incorporate matrix factorization (SVD / ALS) once community scale exceeds 1,000+ active users.
- **Audio Preview Streams**: Integrate Web Audio API or legal 30-second preview stream URLs.
- **Playlist Export**: One-click sync to personal music library playlists.

---

## License

This project is licensed under the MIT License.
