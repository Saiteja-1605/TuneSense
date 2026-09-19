"""
Script to generate a rich, realistic dataset of 120+ songs for TuneSense.
Covers 12 genres, multiple moods, languages, audio features, and tags.
"""
import json
import os

GENRES_CONFIG = [
    {
        "genre": "Pop",
        "artists": [("Luna Vance", "Neon Reflections"), ("Maya Lin", "Sunlit Memories"), ("Electric Echoes", "Signal Boost"), ("Chloe Adams", "Vulnerability"), ("K-Nova", "Starlight")],
        "templates": [
            ("Midnight Horizon", "Energetic", "English", 88, 124.0, 0.85, 0.82, 0.12, 0.05, 0.78, "Shimmering synth-pop anthem filled with driving beats and catchy vocal hooks.", ["synthpop", "upbeat", "night drive", "electronic", "dance"]),
            ("Golden Hour Glow", "Upbeat", "English", 84, 118.0, 0.72, 0.76, 0.28, 0.00, 0.86, "Warm acoustic guitars meet buoyant modern pop percussion and joyful vocal harmonies.", ["sunny", "acoustic pop", "cheerful", "summer", "radio hit"]),
            ("Dancing in the Static", "Euphoric", "English", 79, 128.0, 0.90, 0.85, 0.06, 0.08, 0.81, "High-octane dance-pop with pulsating basslines and festival-ready drops.", ["dance pop", "party", "festival", "club", "vibrant"]),
            ("Heartstring Serenade", "Romantic", "English", 81, 96.0, 0.48, 0.58, 0.65, 0.00, 0.62, "Intimate piano pop ballad exploring tender romance and deep devotion.", ["ballad", "piano", "heartfelt", "love song", "sweet"]),
            ("Velvet Tears", "Melancholic", "Japanese", 76, 92.0, 0.42, 0.51, 0.74, 0.02, 0.31, "Bittersweet J-Pop ballad with orchestral strings and emotive vocal delivery.", ["j-pop", "emotional", "orchestral", "rainy day", "nostalgia"]),
            ("Electric Dreamer", "Upbeat", "Korean", 91, 122.0, 0.88, 0.84, 0.09, 0.01, 0.89, "Polished K-Pop hit with intricate choreography rhythms, punchy synths and rap verses.", ["k-pop", "dynamic", "catchy", "youthful", "futuristic"]),
            ("Café de Paris", "Chill", "French", 72, 104.0, 0.52, 0.66, 0.58, 0.04, 0.70, "Breezy French chanson pop blending acoustic guitar, accordion flair and relaxed rhythms.", ["french pop", "chanson", "acoustic", "morning coffee", "travel"]),
            ("Starlight Boulevard", "Euphoric", "English", 86, 126.0, 0.84, 0.79, 0.15, 0.03, 0.80, "Soaring vocal leads riding waves of lush 80s synth revival pads.", ["synthwave pop", "glamour", "80s inspired", "anthemic"]),
            ("Fading Polaroids", "Melancholic", "English", 75, 88.0, 0.38, 0.46, 0.82, 0.01, 0.28, "Reflective chamber pop song evoking faded summer memories.", ["nostalgic", "acoustic", "autumn", "gentle", "soft pop"]),
            ("Breathe into Motion", "Energetic", "English", 83, 120.0, 0.79, 0.78, 0.20, 0.00, 0.75, "Inspirational pop track packed with driving percussion and uplifting brass stabs.", ["empowering", "workout", "running", "uplifting", "positive"])
        ]
    },
    {
        "genre": "Rock",
        "artists": [("The Silver Halos", "Rust & Glory"), ("Crimson Wolves", "Howl at Dawn"), ("Apex Rift", "Seismic Shift"), ("Broken Valves", "Industrial Grit"), ("Echoing Heights", "Ascension")],
        "templates": [
            ("Overdrive Mirage", "Energetic", "English", 82, 134.0, 0.92, 0.55, 0.02, 0.15, 0.65, "Hard-hitting guitar riffs and thunderous drums with raw rock vocals.", ["garage rock", "raw energy", "heavy riffs", "driving", "adrenaline"]),
            ("Whispers in the Granite", "Melancholic", "English", 74, 98.0, 0.58, 0.42, 0.35, 0.22, 0.38, "Moody alternative rock ballad with brooding bass and atmospheric guitars.", ["alt rock", "brooding", "atmospheric", "guitar solo", "emotional"]),
            ("Neon Thunder", "Euphoric", "English", 78, 140.0, 0.94, 0.48, 0.01, 0.10, 0.72, "High-tempo stadium rock with anthemic chorus and blistering guitar solos.", ["stadium rock", "anthemic", "arena", "hype", "guitar power"]),
            ("Shadows on the Wall", "Dark", "English", 71, 112.0, 0.75, 0.45, 0.12, 0.30, 0.33, "Post-punk revival track featuring motorik beats and jagged guitar lines.", ["post-punk", "darkwave", "edgy", "rebellion", "underground"]),
            ("Rumble in the Dust", "Upbeat", "English", 77, 126.0, 0.86, 0.62, 0.18, 0.04, 0.68, "Southern blues rock with slide guitars, stomping grooves and gritty grit.", ["blues rock", "southern", "groove", "road trip", "stomping"]),
            ("Tokyo Driftline", "Energetic", "Japanese", 80, 138.0, 0.91, 0.54, 0.03, 0.08, 0.70, "Fast-paced J-Rock opening theme style song with technical guitar work.", ["j-rock", "anime style", "high tempo", "heroic", "dynamic"]),
            ("Fallen Statues", "Focus", "English", 69, 108.0, 0.64, 0.49, 0.22, 0.45, 0.45, "Instrumental-heavy progressive rock piece featuring intricate time signatures.", ["prog rock", "instrumental", "complex", "epic", "storytelling"]),
            ("Midnight Riot", "Energetic", "English", 85, 145.0, 0.95, 0.52, 0.01, 0.02, 0.60, "Raucous punk rock explosion with blazing tempo and anti-establishment spirit.", ["punk", "fast", "aggressive", "skate rock", "youth"]),
            ("Hollow Canyon", "Melancholic", "English", 73, 85.0, 0.44, 0.38, 0.68, 0.12, 0.35, "Desert rock ballad steeped in reverb, twangy guitars and solemn vocals.", ["desert rock", "psychedelic", "desert", "lonely", "spaghetti western"]),
            ("Break The Citadel", "Euphoric", "English", 81, 132.0, 0.89, 0.58, 0.05, 0.06, 0.74, "Modern alternative rock combining modern electronics and heavy distorted bass.", ["modern rock", "electronic rock", "cinematic", "empowering", "heavy"])
        ]
    },
    {
        "genre": "Electronic",
        "artists": [("AeroPulse", "Kinetic Theory"), ("CyberGrid", "Digital Frontier"), ("Vespera", "Lucid Nights"), ("SubAtomic", "Frequency Shift"), ("Kavinsky Vibes", "Outrun 99")],
        "templates": [
            ("Neon Velocity", "Euphoric", "Instrumental", 90, 128.0, 0.95, 0.82, 0.02, 0.88, 0.82, "Peak-time progressive house banger with euphoric synths and huge festival drops.", ["house", "festival", "progressive house", "euphoric", "edm"]),
            ("Subterranean Bass", "Dark", "Instrumental", 82, 140.0, 0.88, 0.75, 0.01, 0.79, 0.41, "Heavy dubstep tune with subterranean sub-bass wobbles and industrial sound design.", ["dubstep", "bass music", "heavy", "dark", "underground"]),
            ("Cybernetic Highway", "Energetic", "English", 86, 120.0, 0.84, 0.79, 0.05, 0.65, 0.77, "Synthwave retro electro track with analog synthesizers and gated snare drums.", ["synthwave", "retrowave", "cyberpunk", "cruising", "80s"]),
            ("Liquid Chillout", "Chill", "Instrumental", 78, 116.0, 0.46, 0.70, 0.32, 0.90, 0.62, "Smooth liquid drum & bass with jazzy electric piano chords and airy vocal pads.", ["liquid dnb", "chillout", "drum and bass", "smooth", "cozy"]),
            ("Berlin Deep Hours", "Focus", "Instrumental", 81, 126.0, 0.78, 0.84, 0.04, 0.86, 0.52, "Hypnotic minimal techno track tailored for late-night Berlin warehouse raves.", ["techno", "minimal", "berlin", "dark techno", "club"]),
            ("Floating on Cloud Nine", "Chill", "English", 85, 110.0, 0.56, 0.74, 0.40, 0.42, 0.80, "Tropical house summer jam with marimba melodies, steel drums and soothing vocals.", ["tropical house", "beach", "summer vibes", "sunset", "relax"]),
            ("Neural Network", "Focus", "Instrumental", 75, 124.0, 0.62, 0.68, 0.15, 0.92, 0.48, "IDM / Glitch electronica with complex syncopated percussion and micro-samples.", ["idm", "glitch", "coding", "focus", "experimental"]),
            ("Starlight Reverie", "Romantic", "French", 77, 114.0, 0.60, 0.72, 0.25, 0.50, 0.69, "French touch / Nu-disco with funky basslines, filtered guitars and vocal chops.", ["french touch", "nu-disco", "funky", "groove", "dance"]),
            ("Quantum Singularity", "Dark", "Instrumental", 73, 132.0, 0.92, 0.65, 0.01, 0.95, 0.25, "Cinematic dark synth track with aggressive distortion and dystopian brass.", ["dark electro", "dystopian", "industrial", "sci-fi", "thriller"]),
            ("Infinite Horizons", "Euphoric", "Instrumental", 84, 138.0, 0.96, 0.62, 0.03, 0.85, 0.76, "Uplifting vocal trance anthem with soaring pads and energetic rolling bassline.", ["trance", "uplifting", "festival", "anthem", "electronic"])
        ]
    },
    {
        "genre": "Hip-Hop",
        "artists": [("Kendall Verse", "City Lights"), ("Nova Jay", "Crown & Kingdom"), ("Driftwood Soul", "Vinyl & Tape"), ("Ghostline", "Concrete Echoes"), ("Sway District", "Metropolis")],
        "templates": [
            ("Apex Skyline", "Energetic", "English", 92, 142.0, 0.88, 0.86, 0.05, 0.00, 0.64, "Heavy 808 bass, crisp hi-hat rolls, and sharp rapid-fire verses.", ["trap", "hype", "workout", "flex", "808"]),
            ("Coffee Shop Chronicles", "Chill", "English", 86, 86.0, 0.45, 0.75, 0.62, 0.15, 0.72, "Mellow lo-fi hip hop beat with dusty vinyl crackles and thoughtful conscious lyrics.", ["lo-fi", "chillhop", "conscious", "relax", "study"]),
            ("Streets of Gold", "Upbeat", "English", 89, 98.0, 0.82, 0.88, 0.10, 0.00, 0.79, "Boom bap renaissance track with classic horn loops and infectious head-nodding groove.", ["boom bap", "east coast", "classic hip hop", "horns", "lyrical"]),
            ("Midnight Raindrops", "Melancholic", "English", 83, 78.0, 0.52, 0.68, 0.44, 0.02, 0.35, "Emotional melodic trap track exploring personal struggles and perseverance.", ["melodic trap", "emo rap", "late night", "emotional", "deep"]),
            ("Zona Rosa", "Upbeat", "Spanish", 87, 102.0, 0.80, 0.92, 0.14, 0.00, 0.85, "Latin trap crossover track with reggaeton syncopation and bouncy flow.", ["latin trap", "bilingual", "party", "car music", "banger"]),
            ("Cipher Dynasty", "Energetic", "English", 80, 94.0, 0.86, 0.78, 0.08, 0.00, 0.60, "Underground cypher exchange with raw lyrical wordplay and dusty drum breaks.", ["underground", "bars", "cypher", "real rap", "authentic"]),
            ("Champs-Élysées Flow", "Chill", "French", 79, 92.0, 0.65, 0.76, 0.28, 0.00, 0.68, "Smooth French rap track with jazz piano chords and effortless cadence.", ["french rap", "smooth", "chic", "jazz hop", "paris"]),
            ("Reign Supreme", "Euphoric", "English", 88, 136.0, 0.90, 0.83, 0.04, 0.00, 0.75, "Triumphant horn-driven hip-hop anthem celebrating victory and success.", ["triumphant", "anthem", "victory", "brass", "championship"]),
            ("Smoke & Neon", "Chill", "English", 81, 82.0, 0.48, 0.70, 0.50, 0.08, 0.55, "Cloud rap with ethereal synth pads, delayed vocals and hazy atmospheric 808s.", ["cloud rap", "hazy", "atmospheric", "vibes", "dreamy"]),
            ("Gridlock hustle", "Energetic", "English", 84, 130.0, 0.84, 0.81, 0.06, 0.00, 0.62, "Fast-paced drill beat with sliding bass glides and aggressive delivery.", ["drill", "hard", "grind", "energy", "urban"])
        ]
    },
    {
        "genre": "R&B",
        "artists": [("Solomon Ray", "Late Night Confessions"), ("Amara Skye", "Silk & Honey"), ("Dion Carter", "Velvet Room"), ("Talia Brooks", "Midnight Echo"), ("The Soul Project", "Heritage")],
        "templates": [
            ("Silk Sheets", "Romantic", "English", 89, 90.0, 0.45, 0.72, 0.42, 0.01, 0.65, "Sensual contemporary R&B ballad with silky falsetto and warm Rhodes keyboard.", ["contemporary r&b", "sensual", "slow jam", "romantic", "smooth"]),
            ("Midnight Groove", "Chill", "English", 85, 102.0, 0.62, 0.82, 0.24, 0.02, 0.78, "Neo-soul groove with tasty walking bassline, electric guitar riffs and soulful runs.", ["neo-soul", "groovy", "warm", "chill", "soulful"]),
            ("Candlelight Glow", "Romantic", "English", 82, 75.0, 0.38, 0.55, 0.72, 0.00, 0.58, "Timeless soul ballad backed by vintage upright piano and acoustic bass.", ["classic soul", "candlelight", "intimate", "love", "vocal showcase"]),
            ("Tears in the Cabernet", "Melancholic", "English", 80, 84.0, 0.48, 0.60, 0.54, 0.00, 0.34, "Heartbreak contemporary R&B ballad with moody atmospheric synths.", ["heartbreak", "moody", "late night", "sad", "r&b"]),
            ("Electric Sensation", "Upbeat", "English", 86, 114.0, 0.78, 0.85, 0.15, 0.00, 0.84, "R&B-pop dance track with bouncy synth bass and catchy chorus harmonies.", ["r&b pop", "dance", "bouncy", "upbeat", "summer"]),
            ("Tokyo Sunset Soul", "Chill", "Japanese", 78, 96.0, 0.54, 0.74, 0.38, 0.05, 0.70, "City pop-infused Japanese R&B with lush jazz chords and grooving percussion.", ["city pop", "japanese r&b", "groove", "aesthetic", "smooth"]),
            ("Velvet Touch", "Romantic", "French", 75, 88.0, 0.42, 0.68, 0.60, 0.02, 0.61, "Romantic Parisian soul song with acoustic guitar and passionate duet vocals.", ["parisian soul", "romantic", "duet", "acoustic", "sweet"]),
            ("Glow of the City", "Chill", "English", 83, 108.0, 0.58, 0.78, 0.30, 0.03, 0.75, "Alt-R&B with airy vocal layers, subtle synth pads and effortless head-bop beat.", ["alt-r&b", "vibes", "chill", "modern", "aesthetic"]),
            ("Don't Call It Closure", "Melancholic", "English", 79, 80.0, 0.40, 0.54, 0.66, 0.00, 0.38, "Vulnerable and emotive vocal performance dissecting an ambiguous breakup.", ["vulnerable", "breakup", "emotional", "soul", "piano"]),
            ("Summer Radiance", "Upbeat", "English", 87, 118.0, 0.82, 0.84, 0.18, 0.00, 0.88, "Uplifting funk-soul song filled with infectious horn lines and joyful clapping.", ["funk soul", "joyful", "party", "sunshine", "horns"])
        ]
    },
    {
        "genre": "Indie",
        "artists": [("The Pine Forest", "Northern Wilds"), ("Glass Lanterns", "Phosphor"), ("Velvet Dandelion", "Paper Boats"), ("Coastline Echo", "Salt & Drift"), ("The Lunar Moth", "Chrysalis")],
        "templates": [
            ("Northern Lights Over Cabin", "Chill", "English", 84, 106.0, 0.54, 0.62, 0.65, 0.08, 0.62, "Ethereal indie folk-pop with chiming acoustic guitars and warm vocal harmonies.", ["indie folk", "acoustic", "nature", "cozy", "dreamy"]),
            ("Stargazing from the Roof", "Romantic", "English", 81, 115.0, 0.65, 0.68, 0.35, 0.02, 0.76, "Breezy indie pop with jangle guitars, playful bass and whimsical lyrics.", ["indie pop", "jangle pop", "summer night", "youth", "playful"]),
            ("Ocean Salt & Fog", "Melancholic", "English", 78, 82.0, 0.36, 0.44, 0.80, 0.15, 0.32, "Introspective indie ballad with fingerpicked guitar and melancholic cello.", ["indie ballad", "foggy", "coastal", "sad", "raw"]),
            ("Kaleidoscope Morning", "Upbeat", "English", 80, 122.0, 0.78, 0.72, 0.28, 0.01, 0.83, "Bright indie rock with driving drum rhythms and euphoric chorus crescendo.", ["indie rock", "uplifting", "morning", "sunny", "festive"]),
            ("Static in the Attic", "Focus", "English", 74, 98.0, 0.50, 0.58, 0.52, 0.25, 0.50, "Dream pop track washed in lush chorus effects, shimmering guitars and tape flutter.", ["dream pop", "shoegaze", "shimmering", "ethereal", "chill"]),
            ("Midnight Train South", "Focus", "English", 76, 110.0, 0.68, 0.60, 0.42, 0.05, 0.58, "Rootsy indie rock with driving tambourine, acoustic strums and warm organ.", ["americana", "indie rock", "road trip", "heartland", "travel"]),
            ("Winter in Kyoto", "Melancholic", "Japanese", 77, 86.0, 0.34, 0.48, 0.85, 0.18, 0.30, "Delicate Japanese indie acoustic song with fingerpicked koto and gentle guitar.", ["japanese indie", "winter", "gentle", "peaceful", "solitude"]),
            ("Sunflower Fields", "Upbeat", "English", 83, 118.0, 0.74, 0.70, 0.45, 0.00, 0.87, "Cheery indie folk celebration of friendship with banjo and handclaps.", ["folk pop", "cheerful", "banjo", "friendship", "happy"]),
            ("Ghost Town Symphony", "Dark", "English", 72, 102.0, 0.60, 0.50, 0.40, 0.20, 0.36, "Moody cinematic indie song with baritone vocals and brooding western guitar.", ["dark indie", "cinematic", "spooky", "western", "brooding"]),
            ("Electric Fireflies", "Euphoric", "English", 85, 124.0, 0.82, 0.74, 0.20, 0.04, 0.81, "Synth-indie crossover with upbeat indie vocals and glistening synth arpeggios.", ["indietronica", "sparkling", "night", "magic", "dance"])
        ]
    },
    {
        "genre": "Jazz",
        "artists": [("Miles Sterling", "Blue Midnight"), ("The Clara Vance Trio", "Autumn in Soho"), ("Dexter Cole", "Harlem Strut"), ("Astrid Lind", "Nordic Breeze"), ("Bebop Collective", "After Hours")],
        "templates": [
            ("Blue Velvet Lounge", "Chill", "Instrumental", 82, 94.0, 0.32, 0.58, 0.85, 0.82, 0.56, "Late-night smoky jazz ballad featuring muted trumpet and warm double bass.", ["cool jazz", "trumpet", "smoky", "lounge", "cocktail"]),
            ("Harlem Stomp", "Upbeat", "Instrumental", 80, 148.0, 0.78, 0.75, 0.45, 0.70, 0.84, "Swinging bebop tune with blistering saxophone solos and walking bass.", ["bebop", "swing", "saxophone", "energetic", "virtuoso"]),
            ("Rain on 5th Avenue", "Melancholic", "Instrumental", 85, 78.0, 0.28, 0.45, 0.92, 0.89, 0.38, "Poignant jazz piano trio performance capturing a rainy metropolitan evening.", ["jazz piano", "rainy", "melancholic", "reflective", "peaceful"]),
            ("Copacabana Whispers", "Romantic", "English", 83, 112.0, 0.45, 0.70, 0.78, 0.35, 0.75, "Classic bossa nova with nylon acoustic guitar, soft percussion and whispery vocals.", ["bossa nova", "brazilian jazz", "breeze", "romantic", "relaxing"]),
            ("Nordic Fjord Twilight", "Focus", "Instrumental", 76, 88.0, 0.30, 0.42, 0.88, 0.92, 0.44, "Spacious ECM-style Nordic jazz with reverberant soprano saxophone and sparse piano.", ["nordic jazz", "spacious", "ambient jazz", "focus", "meditative"]),
            ("Midnight in Montmartre", "Romantic", "French", 79, 106.0, 0.50, 0.65, 0.70, 0.40, 0.72, "Gypsy jazz swing piece featuring lightning-fast acoustic guitar and violin.", ["gypsy jazz", "paris", "swing", "violin", "lively"]),
            ("Soulful Espresso", "Chill", "Instrumental", 81, 100.0, 0.40, 0.66, 0.80, 0.85, 0.68, "Warm soul jazz organ groove with tasty electric guitar comping and relaxed drums.", ["soul jazz", "hammond organ", "coffee", "cozy", "groove"]),
            ("Metropolitan Rush", "Energetic", "Instrumental", 77, 160.0, 0.85, 0.64, 0.35, 0.80, 0.78, "Fast modern jazz fusion with electric bass, synth flourishes and virtuosic drums.", ["jazz fusion", "fast", "complex", "electric", "dynamic"]),
            ("Solitary Moon", "Melancholic", "Instrumental", 75, 72.0, 0.22, 0.36, 0.95, 0.94, 0.29, "Solo jazz guitar chord melody rendition filled with rich harmonic extensions.", ["solo guitar", "intimate", "night", "tender", "serene"]),
            ("The Velvet Underground Strut", "Upbeat", "Instrumental", 78, 120.0, 0.62, 0.74, 0.60, 0.78, 0.82, "Grooving hard bop track with infectious blues-infused melody and tight rhythm section.", ["hard bop", "bluesy", "groove", "classic", "swinging"])
        ]
    },
    {
        "genre": "Classical",
        "artists": [("Vienna Philharmonic Solists", "Imperial Echoes"), ("Elena Rostova", "Preludes & Nocturnes"), ("Cambridge Baroque Ensemble", "Four Elements"), ("Klaus Richter", "Neoclassical Études"), ("Aurora String Quartet", "Opus 44")],
        "templates": [
            ("Moonlight Over Alps", "Focus", "Instrumental", 88, 68.0, 0.18, 0.30, 0.98, 0.95, 0.32, "Delicate neoclassical solo piano piece evocative of Debussy and Chopin nocturnes.", ["piano solo", "neoclassical", "calm", "study", "peaceful"]),
            ("Allegro Con Brio", "Energetic", "Instrumental", 82, 144.0, 0.86, 0.42, 0.75, 0.98, 0.74, "Thunderous orchestral symphony movement packed with soaring brass and racing violins.", ["orchestral", "symphony", "powerful", "epic", "dramatic"]),
            ("Autumn Cello Suite", "Melancholic", "Instrumental", 86, 74.0, 0.25, 0.35, 0.95, 0.92, 0.26, "Rich, resonant solo cello suite carrying deep emotional gravity and timeless beauty.", ["cello", "baroque", "emotional", "solitude", "masterpiece"]),
            ("Morning in the Royal Gardens", "Upbeat", "Instrumental", 80, 116.0, 0.55, 0.50, 0.88, 0.96, 0.84, "Vibrant baroque concerto for strings and harpsichord in sparkling major key.", ["baroque", "vibrant", "happy", "spring", "elegant"]),
            ("Requiem for the Forgotten", "Dark", "Instrumental", 79, 65.0, 0.45, 0.25, 0.90, 0.90, 0.18, "Haunting orchestral and choral movement with deep timpani and mournful strings.", ["choral", "dark classical", "cinematic", "mournful", "tragic"]),
            ("Dance of the Marionettes", "Upbeat", "Instrumental", 77, 128.0, 0.65, 0.62, 0.82, 0.95, 0.80, "Playful neoclassical chamber piece with pizzicato strings and woodwind trills.", ["chamber", "playful", "pizzicato", "whimsical", "bright"]),
            ("Twilight Sonata", "Romantic", "Instrumental", 84, 80.0, 0.32, 0.40, 0.96, 0.94, 0.48, "Romantic era violin and piano sonata with soaring melodies and expressive rubato.", ["violin sonata", "romantic classical", "expressive", "beauty", "lyrical"]),
            ("The Tempest Rises", "Energetic", "Instrumental", 83, 150.0, 0.90, 0.38, 0.65, 0.98, 0.58, "Blistering neoclassical violin concerto movement with lightning arpeggios.", ["violin concerto", "virtuosic", "stormy", "intense", "mastery"]),
            ("Sanctuary of Silence", "Chill", "Instrumental", 81, 60.0, 0.15, 0.24, 0.99, 0.96, 0.35, "Spacious minimal neoclassical composition featuring warm felt piano and subtle strings.", ["felt piano", "minimalism", "meditation", "sleep", "tranquil"]),
            ("Triumphal Procession", "Euphoric", "Instrumental", 85, 118.0, 0.82, 0.48, 0.70, 0.98, 0.88, "Grand triumphant orchestral march with soaring French horns and snare cadences.", ["march", "triumphant", "regal", "celebration", "majestic"])
        ]
    },
    {
        "genre": "Ambient",
        "artists": [("Cosmic Drift", "Interstellar Echoes"), ("Ethera", "Weightless Horizons"), ("Luminescent", "Chroma"), ("Sleep Protocol", "Delta Wave Phase"), ("Deep Current", "Abyssal Plain")],
        "templates": [
            ("Weightless in Orbit", "Chill", "Instrumental", 86, 60.0, 0.12, 0.20, 0.85, 0.98, 0.42, "Lush drone soundscape with warm analog synth swells and zero percussive elements.", ["space ambient", "weightless", "relaxation", "sleep", "drone"]),
            ("Deep Submersion", "Focus", "Instrumental", 80, 65.0, 0.18, 0.22, 0.78, 0.99, 0.36, "Gentle aquatic soundscapes with sub-bass pulses and soothing ambient textures.", ["aquatic", "focus", "deep work", "underwater", "calm"]),
            ("Glacial Shimmer", "Focus", "Instrumental", 82, 70.0, 0.22, 0.28, 0.88, 0.96, 0.45, "Crystalline bell chimes and shimmering reverb tails for high-concentration flow states.", ["crystalline", "study", "coding", "clarity", "minimal"]),
            ("Dusk over Valleys", "Melancholic", "Instrumental", 78, 62.0, 0.16, 0.25, 0.92, 0.97, 0.28, "Gentle tape-degraded ambient pads with distant acoustic guitar harmonics.", ["tape ambient", "nostalgia", "peaceful", "sunset", "autumn"]),
            ("Aurora Borealis Flow", "Euphoric", "Instrumental", 84, 75.0, 0.35, 0.32, 0.75, 0.95, 0.68, "Uplifting ambient piece featuring gradual harmonic blossoms and radiant textures.", ["uplifting ambient", "aurora", "beauty", "wonder", "ethereal"]),
            ("Event Horizon Descent", "Dark", "Instrumental", 74, 55.0, 0.25, 0.18, 0.65, 0.98, 0.15, "Ominous dark ambient drone exploring the quiet mystery of black holes.", ["dark ambient", "space", "eerie", "mystery", "drone"]),
            ("Forest Canopy Rain", "Chill", "Instrumental", 85, 60.0, 0.14, 0.22, 0.95, 0.98, 0.50, "Organic ambient incorporating pristine field recordings of gentle woodland rainfall.", ["nature sounds", "rain", "cozy", "sleep", "healing"]),
            ("Solar Wind Meditation", "Focus", "Instrumental", 79, 68.0, 0.20, 0.26, 0.82, 0.96, 0.40, "Tibetan singing bowl overtones merged with modular synthesizer resonance.", ["meditation", "sound bath", "zen", "mindfulness", "tranquility"]),
            ("Cathedral of Stars", "Romantic", "Instrumental", 77, 72.0, 0.28, 0.30, 0.88, 0.94, 0.55, "Warm choral synthesized pads echoing through a simulated infinite cathedral.", ["sacred ambient", "spacious", "reverb", "starry", "gentle"]),
            ("Binaural Awakening", "Chill", "Instrumental", 83, 60.0, 0.10, 0.18, 0.90, 0.99, 0.48, "Subtle 432Hz tuning designed to soothe anxiety and induce deep mental recovery.", ["binaural", "healing", "wellness", "serenity", "spa"])
        ]
    },
    {
        "genre": "Latin",
        "artists": [("Mateo Vega", "Fuego y Sal"), ("Paloma Sol", "Corazón Rebelde"), ("Rhythm Tropicale", "Havana Nights"), ("El Diamante", "Bailando Solo"), ("Sombra y Sol", "Isla Bonita")],
        "templates": [
            ("Fuego de la Noche", "Energetic", "Spanish", 91, 105.0, 0.88, 0.89, 0.15, 0.00, 0.92, "High-energy reggaeton banger with dembow rhythm, catchy hook and fiery synths.", ["reggaeton", "party", "club", "dance", "latin"]),
            ("Noche en La Habana", "Upbeat", "Spanish", 86, 112.0, 0.78, 0.86, 0.45, 0.05, 0.88, "Authentic Cuban salsa with brass section, congas, cowbell and piano montuno.", ["salsa", "cuba", "dancing", "tropical", "brass"]),
            ("Bailando Bajo Las Estrellas", "Romantic", "Spanish", 88, 128.0, 0.65, 0.84, 0.58, 0.01, 0.82, "Modern romantic bachata with silky guitar requinto and heartfelt vocals.", ["bachata", "romantic", "guitar", "sensual", "love"]),
            ("Sol de Verano", "Upbeat", "Spanish", 84, 118.0, 0.82, 0.82, 0.22, 0.00, 0.90, "Sun-soaked Latin pop track with breezy acoustic guitar and infectious percussion.", ["latin pop", "summer", "sunny", "joyful", "beach"]),
            ("Tango del Desamor", "Melancholic", "Spanish", 78, 120.0, 0.68, 0.65, 0.60, 0.12, 0.42, "Dramatic Argentine tango with impassioned bandoneon, sharp violin and tense tango rhythm.", ["tango", "argentina", "bandoneon", "dramatic", "passion"]),
            ("Carnaval de Rio", "Euphoric", "Portuguese", 89, 134.0, 0.94, 0.88, 0.18, 0.04, 0.95, "Explosive Brazilian samba batucada with thunderous surdo drums and whistle cues.", ["samba", "brazil", "carnival", "celebration", "percussion"]),
            ("Café y Recuerdos", "Chill", "Spanish", 79, 92.0, 0.44, 0.68, 0.74, 0.02, 0.65, "Gentle acoustic bolero blending romantic guitar melodies and soft upright bass.", ["bolero", "acoustic", "intimate", "classic latin", "relaxing"]),
            ("Urbano Caliente", "Energetic", "Spanish", 87, 100.0, 0.85, 0.90, 0.12, 0.00, 0.86, "Crisp urban dembow crossover with heavy 808 sub and infectious vocal chops.", ["dembow", "urban", "street", "hype", "fiesta"]),
            ("Ojos Esmeralda", "Romantic", "Spanish", 81, 98.0, 0.52, 0.72, 0.50, 0.00, 0.76, "Sweet Latin R&B ballad with nylon guitar flourishes and velvety bilingual vocals.", ["latin r&b", "sweet", "ballad", "guitar", "crush"]),
            ("Ritmo Tropical", "Euphoric", "Spanish", 85, 124.0, 0.86, 0.87, 0.25, 0.02, 0.91, "High-spirited cumbia modernizada with accordion hooks and driving dance beats.", ["cumbia", "fiesta", "accordion", "danceable", "tropical"])
        ]
    },
    {
        "genre": "Metal",
        "artists": [("Iron Obsidian", "Abyssal Forge"), ("Vortex of Chaos", "Cataclysm"), ("Silent Valkyrie", "Valhalla Calling"), ("Deathless Legion", "Blood & Stone"), ("Nordic Frost", "Ragnarok")],
        "templates": [
            ("Forged in Magma", "Energetic", "English", 81, 155.0, 0.98, 0.35, 0.00, 0.15, 0.45, "Furious thrash metal with double-kick drum assault and razor-sharp guitar shredding.", ["thrash metal", "fast", "heavy", "headbanging", "aggressive"]),
            ("Symphony of Valhalla", "Euphoric", "English", 84, 136.0, 0.94, 0.45, 0.08, 0.20, 0.72, "Symphonic power metal with operatic vocals, grand orchestral strings and soaring solos.", ["power metal", "symphonic metal", "epic", "heroic", "operatic"]),
            ("Cry of the Damned", "Dark", "English", 76, 120.0, 0.92, 0.38, 0.01, 0.25, 0.22, "Crushing death metal riffs with guttural growls and brutal breakdown grooves.", ["death metal", "heavy", "brutal", "dark", "intense"]),
            ("Echoes in the Void", "Melancholic", "English", 78, 95.0, 0.72, 0.42, 0.20, 0.30, 0.30, "Atmospheric blackgaze blending shimmering post-rock guitars and furious blast beats.", ["blackgaze", "post-metal", "atmospheric", "emotional", "shoegaze"]),
            ("Titan's March", "Focus", "Instrumental", 79, 110.0, 0.88, 0.50, 0.05, 0.82, 0.55, "Technical progressive metal instrumental with djent polyrhythms and clean leads.", ["prog metal", "djent", "instrumental", "technical", "rhythmic"]),
            ("Midnight Venom", "Energetic", "English", 77, 140.0, 0.91, 0.48, 0.02, 0.10, 0.60, "Classic heavy metal anthem celebrating motorcycle culture and rebellion.", ["heavy metal", "classic metal", "biker", "riffs", "rebellion"]),
            ("Frozen Fjord Battle", "Dark", "English", 82, 128.0, 0.93, 0.40, 0.04, 0.18, 0.38, "Viking melodic death metal featuring folk melodies, galloping drums and warlike chants.", ["melodic death metal", "viking metal", "folk metal", "battle", "epic"]),
            ("Down into the Mire", "Dark", "English", 73, 70.0, 0.80, 0.30, 0.10, 0.35, 0.18, "Slow sludge doom metal with massive fuzzy distortion and despairing vocals.", ["doom metal", "sludge", "slow", "heavy distortion", "crushing"]),
            ("Apex Awakening", "Euphoric", "English", 85, 138.0, 0.95, 0.52, 0.03, 0.05, 0.68, "Modern metalcore with anthemic clean chorus, aggressive verses and crushing breakdown.", ["metalcore", "modern metal", "breakdown", "anthemic", "hype"]),
            ("Cybernetic Overlord", "Energetic", "Instrumental", 80, 145.0, 0.96, 0.58, 0.01, 0.70, 0.52, "Industrial metal fusion with mechanical synth pulses and grinding guitar chords.", ["industrial metal", "cyber metal", "futuristic", "hardcore", "machine"])
        ]
    },
    {
        "genre": "Folk",
        "artists": [("Caleb Rivera", "Whispering Pines"), ("The Wandering Thistle", "Highland Path"), ("Meadow & Stone", "Valley Songs"), ("Hannah Grey", "Appalachian Spring"), ("Wildflower River", "Homeward Bound")],
        "templates": [
            ("Mountain Pine Hollow", "Chill", "English", 83, 95.0, 0.42, 0.55, 0.88, 0.02, 0.65, "Warm fingerpicked acoustic guitar, subtle banjo roll and resonant baritone vocal.", ["indie folk", "acoustic", "mountains", "campfire", "cozy"]),
            ("Appalachian Sunrise", "Upbeat", "English", 85, 125.0, 0.75, 0.72, 0.70, 0.08, 0.88, "Lively bluegrass breakdown with lightning-fast fiddle, mandolin chop and upright bass.", ["bluegrass", "fiddle", "banjo", "happy", "traditional"]),
            ("The Weaver's Daughter", "Melancholic", "English", 79, 80.0, 0.30, 0.42, 0.92, 0.05, 0.32, "Celtic folk ballad with wooden flute, tin whistle and haunting vocal storytelling.", ["celtic folk", "ballad", "irish", "tin whistle", "story"]),
            ("Homeward Train", "Upbeat", "English", 81, 108.0, 0.62, 0.66, 0.78, 0.00, 0.80, "Strummed acoustic folk with driving kick drum, harmonica solos and communal chorus.", ["americana", "folk", "harmonica", "travel", "nostalgic"]),
            ("Autumn Leaves Falling", "Romantic", "English", 84, 88.0, 0.35, 0.50, 0.89, 0.01, 0.60, "Tender folk love song with fingerstyle guitar duet and heartfelt lyrical poetry.", ["folk romance", "fingerstyle", "love", "gentle", "autumn"]),
            ("Highland Heather", "Focus", "Instrumental", 76, 92.0, 0.48, 0.54, 0.82, 0.80, 0.70, "Traditional Scottish reel played with acoustic guitars, bodhran and accordion.", ["celtic", "instrumental", "scottish", "woodland", "traditional"]),
            ("Prairie Wind Sighs", "Melancholic", "English", 78, 76.0, 0.28, 0.38, 0.94, 0.03, 0.35, "Sparse Western folk ballad echoing across empty plains with distant steel guitar.", ["western folk", "prairie", "solitude", "steel guitar", "haunting"]),
            ("Dancing at the Mill", "Euphoric", "English", 82, 130.0, 0.80, 0.78, 0.68, 0.02, 0.92, "Foot-stomping folk festival dance with accordion, fiddle and joyful hollering.", ["folk dance", "barn dance", "celebration", "fiddle", "joy"]),
            ("Riverbank Lullaby", "Chill", "English", 80, 68.0, 0.22, 0.35, 0.96, 0.08, 0.52, "Peaceful acoustic lullaby featuring nylon guitar and soft ambient river sounds.", ["lullaby", "peaceful", "sleep", "acoustic", "gentle"]),
            ("Timber & Iron", "Energetic", "English", 83, 116.0, 0.72, 0.64, 0.60, 0.01, 0.74, "Rhythmic work song with stomping percussion, acoustic strums and gravelly vocals.", ["work song", "rhythmic", "raw", "history", "americana"])
        ]
    }
]

all_songs = []
song_counter = 1

for category in GENRES_CONFIG:
    genre = category["genre"]
    artists = category["artists"]
    templates = category["templates"]
    for i, t in enumerate(templates):
        artist_name, album_name = artists[i % len(artists)]
        title, mood, language, popularity, tempo, energy, danceability, acousticness, instrumentalness, valence, desc, tags = t
        song_id = f"song_{song_counter:03d}"
        all_songs.append({
            "song_id": song_id,
            "title": title,
            "artist": artist_name,
            "album": album_name,
            "genre": genre,
            "mood": mood,
            "language": language,
            "popularity": popularity,
            "tempo": tempo,
            "energy": energy,
            "danceability": danceability,
            "acousticness": acousticness,
            "instrumentalness": instrumentalness,
            "valence": valence,
            "description": desc,
            "tags": tags
        })
        song_counter += 1

out_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "songs.json")
os.makedirs(os.path.dirname(out_path), exist_ok=True)
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(all_songs, f, indent=2, ensure_ascii=False)

print(f"Successfully generated {len(all_songs)} songs across 12 genres.")
