import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics.pairwise import cosine_similarity
from app.ml.explanation import generate_recommendation_reason
import logging

logger = logging.getLogger("tunesense.ml")

class ContentBasedRecommender:
    def __init__(self):
        self.songs_df: Optional[pd.DataFrame] = None
        self.tfidf_vectorizer: Optional[TfidfVectorizer] = None
        self.tfidf_matrix = None
        self.audio_matrix: Optional[np.ndarray] = None
        self.combined_matrix: Optional[np.ndarray] = None
        self.song_id_to_idx: Dict[str, int] = {}
        self.idx_to_song_id: Dict[int, str] = {}
        self.is_fitted: bool = False

    def _prepare_text_corpus(self, df: pd.DataFrame) -> List[str]:
        corpus = []
        for _, row in df.iterrows():
            genre = str(row.get("genre", ""))
            mood = str(row.get("mood", ""))
            artist = str(row.get("artist", ""))
            lang = str(row.get("language", ""))
            tags = " ".join(row.get("tags", [])) if isinstance(row.get("tags"), list) else str(row.get("tags", ""))
            desc = str(row.get("description", ""))
            # Weight genre, mood, and tags higher by repeating tokens
            text_repr = f"{genre} {genre} {mood} {mood} {tags} {tags} {artist} {lang} {desc}"
            corpus.append(text_repr)
        return corpus

    def _prepare_audio_features(self, df: pd.DataFrame) -> np.ndarray:
        features = ["tempo", "energy", "danceability", "acousticness", "instrumentalness", "valence"]
        audio_data = []
        for _, row in df.iterrows():
            tempo = float(row.get("tempo", 120.0))
            # Normalize tempo to 0.0 - 1.0 (assuming range 60 to 180 BPM)
            tempo_norm = np.clip((tempo - 60.0) / 120.0, 0.0, 1.0)
            energy = float(row.get("energy", 0.5))
            danceability = float(row.get("danceability", 0.5))
            acousticness = float(row.get("acousticness", 0.5))
            instrumentalness = float(row.get("instrumentalness", 0.0))
            valence = float(row.get("valence", 0.5))
            audio_data.append([tempo_norm, energy, danceability, acousticness, instrumentalness, valence])
        
        return np.array(audio_data, dtype=np.float32)

    def fit(self, songs: List[Dict[str, Any]]):
        if not songs:
            logger.warning("No songs provided to train recommender.")
            return

        self.songs_df = pd.DataFrame(songs)
        self.song_id_to_idx = {s["song_id"]: i for i, s in enumerate(songs)}
        self.idx_to_song_id = {i: s["song_id"] for i, s in enumerate(songs)}

        # 1. Text TF-IDF Vectorization
        text_corpus = self._prepare_text_corpus(self.songs_df)
        self.tfidf_vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            max_features=2500,
            sublinear_tf=True
        )
        self.tfidf_matrix = self.tfidf_vectorizer.fit_transform(text_corpus).toarray()

        # 2. Audio Features Normalization
        self.audio_matrix = self._prepare_audio_features(self.songs_df)

        # 3. Normalized Feature Fusion (65% text semantics & tags, 35% audio acoustic attributes)
        # Normalize both sub-matrices
        tfidf_norms = np.linalg.norm(self.tfidf_matrix, axis=1, keepdims=True)
        tfidf_norms[tfidf_norms == 0] = 1.0
        norm_tfidf = self.tfidf_matrix / tfidf_norms

        audio_norms = np.linalg.norm(self.audio_matrix, axis=1, keepdims=True)
        audio_norms[audio_norms == 0] = 1.0
        norm_audio = self.audio_matrix / audio_norms

        # Concatenate weighted representations
        combined = np.hstack([0.65 * norm_tfidf, 0.35 * norm_audio])
        comb_norms = np.linalg.norm(combined, axis=1, keepdims=True)
        comb_norms[comb_norms == 0] = 1.0
        self.combined_matrix = combined / comb_norms

        self.is_fitted = True
        logger.info(f"Recommender fitted successfully with {len(songs)} songs. Feature vector dimension: {self.combined_matrix.shape[1]}")

    def build_user_vector(
        self,
        user_pref: Dict[str, Any],
        liked_song_ids: Optional[List[str]] = None,
        listened_song_ids: Optional[List[str]] = None
    ) -> np.ndarray:
        if not self.is_fitted:
            raise ValueError("Recommender model has not been fitted.")

        fav_genres = user_pref.get("favorite_genres", [])
        fav_moods = user_pref.get("favorite_moods", [])
        languages = user_pref.get("languages", ["English"])
        
        # 1. User text representation
        user_tokens = []
        for g in fav_genres:
            user_tokens.extend([g, g, g])
        for m in fav_moods:
            user_tokens.extend([m, m, m])
        for l in languages:
            user_tokens.append(l)

        user_text = " ".join(user_tokens) if user_tokens else "Pop Upbeat"
        user_tfidf = self.tfidf_vectorizer.transform([user_text]).toarray()
        tfidf_norm = np.linalg.norm(user_tfidf)
        if tfidf_norm > 0:
            user_tfidf = user_tfidf / tfidf_norm

        # 2. User audio profile
        target_energy = float(user_pref.get("energy", 0.6))
        target_dance = float(user_pref.get("danceability", 0.6))
        target_acoust = float(user_pref.get("acousticness", 0.3))
        target_val = float(user_pref.get("valence", 0.6))
        target_tempo_norm = 0.5  # 120 BPM midpoint
        user_audio = np.array([[target_tempo_norm, target_energy, target_dance, target_acoust, 0.0, target_val]], dtype=np.float32)
        audio_norm = np.linalg.norm(user_audio)
        if audio_norm > 0:
            user_audio = user_audio / audio_norm

        # 3. Base user vector
        user_vector = np.hstack([0.65 * user_tfidf, 0.35 * user_audio])
        norm = np.linalg.norm(user_vector)
        if norm > 0:
            user_vector = user_vector / norm

        # 4. If user has liked or listened songs, blend with centroid of interactions
        interaction_vectors = []
        if liked_song_ids:
            liked_indices = [self.song_id_to_idx[sid] for sid in liked_song_ids if sid in self.song_id_to_idx]
            if liked_indices:
                # Liked songs get double weight
                interaction_vectors.extend(self.combined_matrix[liked_indices])
                interaction_vectors.extend(self.combined_matrix[liked_indices])
        
        if listened_song_ids:
            listened_indices = [self.song_id_to_idx[sid] for sid in listened_song_ids if sid in self.song_id_to_idx]
            if listened_indices:
                interaction_vectors.extend(self.combined_matrix[listened_indices])

        if interaction_vectors:
            centroid = np.mean(np.array(interaction_vectors), axis=0, keepdims=True)
            c_norm = np.linalg.norm(centroid)
            if c_norm > 0:
                centroid = centroid / c_norm
            # Blend 55% preferences + 45% real listening/like history
            user_vector = 0.55 * user_vector + 0.45 * centroid
            u_norm = np.linalg.norm(user_vector)
            if u_norm > 0:
                user_vector = user_vector / u_norm

        return user_vector

    def recommend(
        self,
        user_pref: Dict[str, Any],
        disliked_song_ids: Optional[List[str]] = None,
        liked_song_ids: Optional[List[str]] = None,
        listened_song_ids: Optional[List[str]] = None,
        top_k: int = 10,
        genre_filter: Optional[str] = None,
        mood_filter: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        if not self.is_fitted or self.songs_df is None:
            return []

        disliked_set = set(disliked_song_ids or [])
        user_vec = self.build_user_vector(user_pref, liked_song_ids, listened_song_ids)

        # Cosine similarity between user vector and all songs
        sims = np.dot(self.combined_matrix, user_vec.T).flatten()

        # Sort indices in descending similarity
        ranked_indices = np.argsort(-sims)

        results = []
        for idx in ranked_indices:
            song_data = self.songs_df.iloc[idx].to_dict()
            song_id = song_data["song_id"]

            # Filter out disliked songs
            if song_id in disliked_set:
                continue

            # Optional genre and mood filters
            if genre_filter and genre_filter.lower() != "all" and song_data.get("genre", "").lower() != genre_filter.lower():
                continue
            if mood_filter and mood_filter.lower() != "all" and song_data.get("mood", "").lower() != mood_filter.lower():
                continue

            raw_sim = float(sims[idx])
            # Map similarity [-1, 1] into intuitive recommendation match score percentage [60% to 98%]
            score = round(max(55.0, min(99.0, (raw_sim * 40.0 + 58.0))), 1)
            reason = generate_recommendation_reason(song_data, user_pref, score)

            results.append({
                "song": song_data,
                "score": score,
                "reason": reason,
                "similarity": round(raw_sim, 4)
            })

            if len(results) >= top_k:
                break

        return results

    def get_similar_songs(self, song_id: str, top_k: int = 5) -> List[Dict[str, Any]]:
        if not self.is_fitted or song_id not in self.song_id_to_idx:
            return []

        target_idx = self.song_id_to_idx[song_id]
        target_vec = self.combined_matrix[target_idx].reshape(1, -1)

        sims = np.dot(self.combined_matrix, target_vec.T).flatten()
        ranked_indices = np.argsort(-sims)

        results = []
        for idx in ranked_indices:
            if idx == target_idx:
                continue
            song_data = self.songs_df.iloc[idx].to_dict()
            results.append(song_data)
            if len(results) >= top_k:
                break

        return results

    def record_listening(self, user_id: str, song_id: str):
        """Track real-time song play to adapt user vector on next recommendation."""
        if not hasattr(self, "_user_listening"):
            self._user_listening = {}
        if user_id not in self._user_listening:
            self._user_listening[user_id] = []
        self._user_listening[user_id].append(song_id)
        if len(self._user_listening[user_id]) > 50:
            self._user_listening[user_id] = self._user_listening[user_id][-50:]

    def record_feedback(self, user_id: str, song_id: str, feedback: str):
        """Track user feedback (like/dislike) in memory."""
        if not hasattr(self, "_user_feedback"):
            self._user_feedback = {}
        if user_id not in self._user_feedback:
            self._user_feedback[user_id] = {}
        self._user_feedback[user_id][song_id] = feedback

recommender = ContentBasedRecommender()

