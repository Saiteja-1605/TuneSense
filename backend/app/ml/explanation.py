from typing import Dict, Any, List

def generate_recommendation_reason(song: Dict[str, Any], user_pref: Dict[str, Any], score: float) -> str:
    """
    Generates a natural, transparent explanation for why a song was recommended
    based on the user's profile and content-based similarity.
    """
    fav_genres = [g.lower() for g in user_pref.get("favorite_genres", [])]
    fav_moods = [m.lower() for m in user_pref.get("favorite_moods", [])]
    languages = [l.lower() for l in user_pref.get("languages", [])]
    
    song_genre = song.get("genre", "").lower()
    song_mood = song.get("mood", "").lower()
    song_lang = song.get("language", "").lower()
    
    target_energy = float(user_pref.get("energy", 0.5))
    target_danceability = float(user_pref.get("danceability", 0.5))
    
    reasons: List[str] = []

    # 1. Genre alignment
    if song_genre in fav_genres:
        reasons.append(f"matches your favorite genre ({song.get('genre')})")
    
    # 2. Mood alignment
    if song_mood in fav_moods:
        reasons.append(f"fits your {song.get('mood')} mood")
        
    # 3. Audio rhythm & energy alignment
    energy_diff = abs(song.get("energy", 0.5) - target_energy)
    dance_diff = abs(song.get("danceability", 0.5) - target_danceability)
    
    if energy_diff <= 0.2 and dance_diff <= 0.2:
        reasons.append(f"aligns closely with your desired tempo and rhythm (Energy: {int(song.get('energy', 0.5)*100)}%, Danceability: {int(song.get('danceability', 0.5)*100)}%)")
    elif energy_diff <= 0.25:
        if song.get("energy", 0.5) >= 0.7:
            reasons.append("has high, vibrant energy matching your preference")
        else:
            reasons.append("has relaxed acoustic energy matching your pace")
            
    # 4. Language or special tags
    if song_lang in languages and song_lang != "english" and song_lang != "instrumental":
        reasons.append(f"features vocals in {song.get('language')}")
        
    # 5. Tags/style highlight if reasons are sparse
    if len(reasons) < 2 and song.get("tags"):
        top_tags = ", ".join(song.get("tags")[:2])
        reasons.append(f"shares key stylistic elements ({top_tags})")

    if not reasons:
        reasons.append(f"shares strong acoustic profile and harmonic signature with your preferred {song.get('genre', 'music')}")

    explanation = "Recommended because it " + " and ".join(reasons) + "."
    return explanation
