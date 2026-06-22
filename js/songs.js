// Songdatenbank – wird ausschließlich per PDF-Upload befüllt
const SONGS = [];

const MOOD_KEYWORDS = {
  energiegeladen: ["energie", "power", "stark", "wild", "feuer", "rock", "hard", "pump", "fire", "hell", "thunder", "rage", "crazy"],
  ausgelassen:    ["party", "feiern", "spaß", "tanzen", "dance", "yeah", "prost", "viva", "celebrate", "fun", "tonight"],
  feierlich:      ["feier", "besonder", "jubil", "colonia", "home", "sweet", "country", "pride", "great"],
  romantisch:     ["liebe", "love", "heart", "rain", "herz", "baby", "darling", "angel", "heaven", "beautiful", "without"],
  melancholisch:  ["ohne", "alone", "dark", "night", "nacht", "pain", "cry", "sad", "purple", "rain", "lost"],
  entspannt:      ["chill", "ruhig", "leise", "soft", "slow", "easy", "laid", "peaceful", "still"],
  nachdenklich:   ["wonder", "reflection", "deep", "think", "dream", "träum", "sinnend", "remember"],
  kraftvoll:      ["power", "strong", "mighty", "loud", "heavy", "bang", "shout", "scream", "thunder", "highway"]
};

const SITUATION_KEYWORDS = {
  konzert:  ["konzert", "gig", "auftritt", "bühne", "venue", "club", "halle"],
  festival: ["festival", "open air", "sommer", "outdoor", "openair"],
  outdoor:  ["outdoor", "draußen", "natur", "wald", "wiese", "freiluft"],
  party:    ["party", "feier", "geburtstag", "silvester", "sause"],
  hochzeit: ["hochzeit", "heirat", "trauung", "wedding"],
  bar:      ["bar", "kneipe", "pub", "lokal", "intim"],
  akustik:  ["akustik", "unplugged", "leise", "solo", "ruhig"],
  zugabe:   ["zugabe", "encore", "abschluss", "letzte"]
};

window.SONGS = SONGS;
window.MOOD_KEYWORDS = MOOD_KEYWORDS;
window.SITUATION_KEYWORDS = SITUATION_KEYWORDS;
