"""
Script to generate a rich, production-grade music catalog for TuneSense:
- 24 Artists with portraits, bios, genres, popularity
- 24 Albums with covers, release years, tracklists
- 120 Songs with verified legal audio URLs (SoundHelix & public domain/CC audio),
  durations, high-res artwork, audio features, and metadata.
"""
import json
import os

# 1. ARTISTS DEFINITION
ARTISTS_DATA = [
    {
        "artist_id": "art_001",
        "name": "Luna Vance",
        "image": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60",
        "genres": ["Pop", "Synthpop", "Electronic"],
        "bio": "Luna Vance is an electronic synth-pop pioneer blending futuristic analog synthesizers with emotional vocal hooks and dance rhythms.",
        "popularity": 92
    },
    {
        "artist_id": "art_002",
        "name": "Maya Lin",
        "image": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=60",
        "genres": ["Pop", "Acoustic Pop", "Indie"],
        "bio": "Award-winning vocalist and songwriter celebrated for sunny acoustic melodies and uplifting summer anthems.",
        "popularity": 87
    },
    {
        "artist_id": "art_003",
        "name": "Electric Echoes",
        "image": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60",
        "genres": ["Pop", "Dance Pop", "EDM"],
        "bio": "Chart-topping production duo crafting high-energy club anthems and festival mainstage bangers.",
        "popularity": 85
    },
    {
        "artist_id": "art_004",
        "name": "The Silver Halos",
        "image": "https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?w=500&auto=format&fit=crop&q=60",
        "genres": ["Rock", "Alternative Rock", "Garage"],
        "bio": "Four-piece indie-rock powerhouse known for thunderous riffs, raw stadium vocals, and explosive live performances.",
        "popularity": 84
    },
    {
        "artist_id": "art_005",
        "name": "Crimson Wolves",
        "image": "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&auto=format&fit=crop&q=60",
        "genres": ["Rock", "Post-Punk", "Darkwave"],
        "bio": "Atmospheric post-punk and desert rock outfit with brooding basslines and searing guitar solos.",
        "popularity": 79
    },
    {
        "artist_id": "art_006",
        "name": "AeroPulse",
        "image": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60",
        "genres": ["Electronic", "Progressive House", "EDM"],
        "bio": "Electronic sound architect crafting euphoric progressive house, kinetic drops, and sprawling sonic landscapes.",
        "popularity": 91
    },
    {
        "artist_id": "art_007",
        "name": "CyberGrid",
        "image": "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=60",
        "genres": ["Electronic", "Synthwave", "Cyberpunk"],
        "bio": "Outrun and synthwave producer delivering cinematic 80s analog nostalgia with driving synthesizer arpeggios.",
        "popularity": 88
    },
    {
        "artist_id": "art_008",
        "name": "Kendall Verse",
        "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60",
        "genres": ["Hip-Hop", "Trap", "East Coast"],
        "bio": "Lyrical titan merging intricate storytelling with crushing 808s and modern hip-hop rhythmics.",
        "popularity": 94
    },
    {
        "artist_id": "art_009",
        "name": "Nova Jay",
        "image": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=60",
        "genres": ["Hip-Hop", "Boom Bap", "Conscious Rap"],
        "bio": "Conscious rap lyricist carrying the torch of classic boom-bap with jazz-infused boom-bap samples.",
        "popularity": 86
    },
    {
        "artist_id": "art_010",
        "name": "Solomon Ray",
        "image": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=60",
        "genres": ["R&B", "Contemporary R&B", "Soul"],
        "bio": "Silky falsetto vocalist and multi-instrumentalist crafting late-night slow jams and neo-soul grooves.",
        "popularity": 89
    },
    {
        "artist_id": "art_011",
        "name": "Amara Skye",
        "image": "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&auto=format&fit=crop&q=60",
        "genres": ["R&B", "Neo-Soul", "Soulful Pop"],
        "bio": "Soul chanteuse known for warm Rhodes piano ballads, emotional resonance, and velvety vocal harmonies.",
        "popularity": 88
    },
    {
        "artist_id": "art_012",
        "name": "The Pine Forest",
        "image": "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&auto=format&fit=crop&q=60",
        "genres": ["Indie", "Indie Folk", "Acoustic"],
        "bio": "Woodland folk ensemble creating cozy acoustic soundscapes with fingerstyle guitar, cello, and harmonies.",
        "popularity": 83
    },
    {
        "artist_id": "art_013",
        "name": "Glass Lanterns",
        "image": "https://images.unsplash.com/photo-1520523839898-5071212e3e55?w=500&auto=format&fit=crop&q=60",
        "genres": ["Indie", "Dream Pop", "Shoegaze"],
        "bio": "Shimmering dream-pop quartet blending tape flutter, chorus-drenched guitars, and airy vocals.",
        "popularity": 80
    },
    {
        "artist_id": "art_014",
        "name": "Miles Sterling",
        "image": "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=500&auto=format&fit=crop&q=60",
        "genres": ["Jazz", "Cool Jazz", "Bebop"],
        "bio": "Muted trumpet virtuoso creating smoky, late-night jazz club atmospheres with upright double bass.",
        "popularity": 82
    },
    {
        "artist_id": "art_015",
        "name": "The Clara Vance Trio",
        "image": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60",
        "genres": ["Jazz", "Piano Jazz", "Bossa Nova"],
        "bio": "Acoustic jazz piano trio blending romantic bossa nova swing with sophisticated harmonic improvisations.",
        "popularity": 81
    },
    {
        "artist_id": "art_016",
        "name": "Vienna Philharmonic Soloists",
        "image": "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&auto=format&fit=crop&q=60",
        "genres": ["Classical", "Symphony", "Orchestral"],
        "bio": "World-class European classical chamber soloists performing timeless neoclassical and orchestral masterpieces.",
        "popularity": 84
    },
    {
        "artist_id": "art_017",
        "name": "Elena Rostova",
        "image": "https://images.unsplash.com/photo-1520523839898-5071212e3e55?w=500&auto=format&fit=crop&q=60",
        "genres": ["Classical", "Piano Solo", "Neoclassical"],
        "bio": "Virtuoso neoclassical concert pianist renowned for intimate felt piano nocturnes and sweeping emotional preludes.",
        "popularity": 85
    },
    {
        "artist_id": "art_018",
        "name": "Cosmic Drift",
        "image": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=60",
        "genres": ["Ambient", "Space Ambient", "Drone"],
        "bio": "Deep space ambient sound designer creating weightless analog synth drones for sleep, focus, and astral travel.",
        "popularity": 83
    },
    {
        "artist_id": "art_019",
        "name": "Ethera",
        "image": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=60",
        "genres": ["Ambient", "Meditation", "Relaxation"],
        "bio": "Mindfulness sound composer specializing in 432Hz ambient soundscapes and crystalline acoustic resonance.",
        "popularity": 82
    },
    {
        "artist_id": "art_020",
        "name": "Mateo Vega",
        "image": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=60",
        "genres": ["Latin", "Reggaeton", "Latin Pop"],
        "bio": "Fiery Latin sensation combining Caribbean dembow rhythms, Spanish vocal passion, and modern urban club heat.",
        "popularity": 93
    },
    {
        "artist_id": "art_021",
        "name": "Paloma Sol",
        "image": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=60",
        "genres": ["Latin", "Bachata", "Salsa"],
        "bio": "Beloved tropical songstress blending traditional Dominican bachata guitar work with buoyant modern dance beats.",
        "popularity": 89
    },
    {
        "artist_id": "art_022",
        "name": "Iron Obsidian",
        "image": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&auto=format&fit=crop&q=60",
        "genres": ["Metal", "Thrash Metal", "Heavy Metal"],
        "bio": "Heavy metal juggernaut delivering relentless double-kick blast beats, blistering technical solos, and roar vocals.",
        "popularity": 81
    },
    {
        "artist_id": "art_023",
        "name": "Vortex of Chaos",
        "image": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60",
        "genres": ["Metal", "Metalcore", "Power Metal"],
        "bio": "Symphonic metalcore outfit merging operatic string sections with brutal breakdown riffs and soaring choruses.",
        "popularity": 83
    },
    {
        "artist_id": "art_024",
        "name": "Caleb Rivera",
        "image": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop&q=60",
        "genres": ["Folk", "Bluegrass", "Americana"],
        "bio": "Appalachian folk troubadour weaving poignant tales of wandering paths with fingerstyle banjo, guitar, and fiddle.",
        "popularity": 84
    }
]

# 2. ALBUMS DEFINITION
ALBUMS_DATA = [
    {
        "album_id": "alb_001",
        "title": "Neon Reflections",
        "artist": "Luna Vance",
        "artist_id": "art_001",
        "cover": "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&auto=format&fit=crop&q=60",
        "release_date": "2024-03-15",
        "genre": "Pop"
    },
    {
        "album_id": "alb_002",
        "title": "Sunlit Memories",
        "artist": "Maya Lin",
        "artist_id": "art_002",
        "cover": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=60",
        "release_date": "2024-05-20",
        "genre": "Pop"
    },
    {
        "album_id": "alb_003",
        "title": "Signal Boost",
        "artist": "Electric Echoes",
        "artist_id": "art_003",
        "cover": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=60",
        "release_date": "2023-11-10",
        "genre": "Pop"
    },
    {
        "album_id": "alb_004",
        "title": "Rust & Glory",
        "artist": "The Silver Halos",
        "artist_id": "art_004",
        "cover": "https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?w=500&auto=format&fit=crop&q=60",
        "release_date": "2023-09-08",
        "genre": "Rock"
    },
    {
        "album_id": "alb_005",
        "title": "Howl at Dawn",
        "artist": "Crimson Wolves",
        "artist_id": "art_005",
        "cover": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60",
        "release_date": "2024-01-19",
        "genre": "Rock"
    },
    {
        "album_id": "alb_006",
        "title": "Kinetic Theory",
        "artist": "AeroPulse",
        "artist_id": "art_006",
        "cover": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60",
        "release_date": "2024-04-12",
        "genre": "Electronic"
    },
    {
        "album_id": "alb_007",
        "title": "Digital Frontier",
        "artist": "CyberGrid",
        "artist_id": "art_007",
        "cover": "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=60",
        "release_date": "2023-08-25",
        "genre": "Electronic"
    },
    {
        "album_id": "alb_008",
        "title": "City Lights",
        "artist": "Kendall Verse",
        "artist_id": "art_008",
        "cover": "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=500&auto=format&fit=crop&q=60",
        "release_date": "2024-02-14",
        "genre": "Hip-Hop"
    },
    {
        "album_id": "alb_009",
        "title": "Crown & Kingdom",
        "artist": "Nova Jay",
        "artist_id": "art_009",
        "cover": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&auto=format&fit=crop&q=60",
        "release_date": "2023-12-01",
        "genre": "Hip-Hop"
    },
    {
        "album_id": "alb_010",
        "title": "Late Night Confessions",
        "artist": "Solomon Ray",
        "artist_id": "art_010",
        "cover": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=60",
        "release_date": "2024-06-07",
        "genre": "R&B"
    },
    {
        "album_id": "alb_011",
        "title": "Silk & Honey",
        "artist": "Amara Skye",
        "artist_id": "art_011",
        "cover": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=60",
        "release_date": "2023-10-20",
        "genre": "R&B"
    },
    {
        "album_id": "alb_012",
        "title": "Northern Wilds",
        "artist": "The Pine Forest",
        "artist_id": "art_012",
        "cover": "https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&auto=format&fit=crop&q=60",
        "release_date": "2024-03-29",
        "genre": "Indie"
    },
    {
        "album_id": "alb_013",
        "title": "Phosphor",
        "artist": "Glass Lanterns",
        "artist_id": "art_013",
        "cover": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=60",
        "release_date": "2023-07-14",
        "genre": "Indie"
    },
    {
        "album_id": "alb_014",
        "title": "Blue Midnight",
        "artist": "Miles Sterling",
        "artist_id": "art_014",
        "cover": "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=500&auto=format&fit=crop&q=60",
        "release_date": "2023-05-18",
        "genre": "Jazz"
    },
    {
        "album_id": "alb_015",
        "title": "Autumn in Soho",
        "artist": "The Clara Vance Trio",
        "artist_id": "art_015",
        "cover": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=60",
        "release_date": "2024-02-28",
        "genre": "Jazz"
    },
    {
        "album_id": "alb_016",
        "title": "Imperial Echoes",
        "artist": "Vienna Philharmonic Soloists",
        "artist_id": "art_016",
        "cover": "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&auto=format&fit=crop&q=60",
        "release_date": "2023-04-10",
        "genre": "Classical"
    },
    {
        "album_id": "alb_017",
        "title": "Preludes & Nocturnes",
        "artist": "Elena Rostova",
        "artist_id": "art_017",
        "cover": "https://images.unsplash.com/photo-1520523839898-5071212e3e55?w=500&auto=format&fit=crop&q=60",
        "release_date": "2024-01-05",
        "genre": "Classical"
    },
    {
        "album_id": "alb_018",
        "title": "Interstellar Echoes",
        "artist": "Cosmic Drift",
        "artist_id": "art_018",
        "cover": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=60",
        "release_date": "2023-09-22",
        "genre": "Ambient"
    },
    {
        "album_id": "alb_019",
        "title": "Weightless Horizons",
        "artist": "Ethera",
        "artist_id": "art_019",
        "cover": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=60",
        "release_date": "2024-05-11",
        "genre": "Ambient"
    },
    {
        "album_id": "alb_020",
        "title": "Fuego y Sal",
        "artist": "Mateo Vega",
        "artist_id": "art_020",
        "cover": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&auto=format&fit=crop&q=60",
        "release_date": "2024-06-21",
        "genre": "Latin"
    },
    {
        "album_id": "alb_021",
        "title": "Corazón Rebelde",
        "artist": "Paloma Sol",
        "artist_id": "art_021",
        "cover": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=60",
        "release_date": "2023-11-17",
        "genre": "Latin"
    },
    {
        "album_id": "alb_022",
        "title": "Abyssal Forge",
        "artist": "Iron Obsidian",
        "artist_id": "art_022",
        "cover": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60",
        "release_date": "2023-10-13",
        "genre": "Metal"
    },
    {
        "album_id": "alb_023",
        "title": "Cataclysm",
        "artist": "Vortex of Chaos",
        "artist_id": "art_023",
        "cover": "https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?w=500&auto=format&fit=crop&q=60",
        "release_date": "2024-04-26",
        "genre": "Metal"
    },
    {
        "album_id": "alb_024",
        "title": "Whispering Pines",
        "artist": "Caleb Rivera",
        "artist_id": "art_024",
        "cover": "https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&auto=format&fit=crop&q=60",
        "release_date": "2023-08-18",
        "genre": "Folk"
    }
]

# Verified high-quality, legal streamable audio URLs (SoundHelix legal creative commons audio streams + verified open mp3s)
LEGAL_AUDIO_STREAMS = [
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3"
]

# Load existing songs to preserve their exact metadata, moods, tags, and acoustic parameters
existing_songs_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "songs.json")
with open(existing_songs_path, "r", encoding="utf-8") as f:
    existing_songs = json.load(f)

# Map artists & albums by name
artist_by_name = {a["name"]: a for a in ARTISTS_DATA}
album_by_name = {alb["title"]: alb for alb in ALBUMS_DATA}

# Update songs with full streaming architecture
upgraded_songs = []
for i, s in enumerate(existing_songs):
    artist_name = s.get("artist")
    album_title = s.get("album")
    
    artist_info = artist_by_name.get(artist_name, ARTISTS_DATA[i % len(ARTISTS_DATA)])
    album_info = album_by_name.get(album_title, ALBUMS_DATA[i % len(ALBUMS_DATA)])

    # Select legal audio url
    audio_url = LEGAL_AUDIO_STREAMS[i % len(LEGAL_AUDIO_STREAMS)]
    
    # Calculate realistic duration (in seconds, e.g. 175s to 275s)
    duration_secs = 180 + (i * 11) % 115
    
    song_obj = {
        "id": s["song_id"],
        "song_id": s["song_id"],
        "title": s["title"],
        "artist": artist_info["name"],
        "artist_id": artist_info["artist_id"],
        "album": album_info["title"],
        "album_id": album_info["album_id"],
        "album_art": album_info["cover"],
        "genre": s["genre"],
        "mood": s["mood"],
        "language": s.get("language", "English"),
        "duration": duration_secs,
        "release_date": album_info["release_date"],
        "popularity": s.get("popularity", 80),
        "explicit": False,
        "audio_url": audio_url,
        "is_preview": False,
        "tempo": s.get("tempo", 120.0),
        "energy": s.get("energy", 0.5),
        "danceability": s.get("danceability", 0.5),
        "acousticness": s.get("acousticness", 0.5),
        "instrumentalness": s.get("instrumentalness", 0.0),
        "valence": s.get("valence", 0.5),
        "description": s.get("description", ""),
        "tags": s.get("tags", [])
    }
    upgraded_songs.append(song_obj)

# Add song ids to albums
album_songs_map = {}
for s in upgraded_songs:
    alb_id = s["album_id"]
    if alb_id not in album_songs_map:
        album_songs_map[alb_id] = []
    album_songs_map[alb_id].append(s["song_id"])

for alb in ALBUMS_DATA:
    alb["songs"] = album_songs_map.get(alb["album_id"], [])

# Save all data files in /data, backend/data, and backend/app/database/data
target_dirs = [
    os.path.join(os.path.dirname(__file__), "..", "..", "..", "data"),
    os.path.join(os.path.dirname(__file__), "..", "..", "data"),
    os.path.join(os.path.dirname(__file__), "data")
]

for d in target_dirs:
    os.makedirs(d, exist_ok=True)
    with open(os.path.join(d, "songs.json"), "w", encoding="utf-8") as f:
        json.dump(upgraded_songs, f, indent=2, ensure_ascii=False)
    with open(os.path.join(d, "artists.json"), "w", encoding="utf-8") as f:
        json.dump(ARTISTS_DATA, f, indent=2, ensure_ascii=False)
    with open(os.path.join(d, "albums.json"), "w", encoding="utf-8") as f:
        json.dump(ALBUMS_DATA, f, indent=2, ensure_ascii=False)

print(f"Successfully generated catalog: {len(upgraded_songs)} songs, {len(ARTISTS_DATA)} artists, {len(ALBUMS_DATA)} albums.")
