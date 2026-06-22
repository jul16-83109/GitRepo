// PDF-Upload und Parsing via pdf.js (CDN)
// Parst hochgeladene Setlisten und fügt Songs zur Datenbank hinzu

class PDFParser {
  constructor(onSongsImported) {
    this.onSongsImported = onSongsImported;
    this.pdfjsLib = null;
  }

  async init() {
    // pdf.js wird über CDN geladen
    if (window.pdfjsLib) {
      this.pdfjsLib = window.pdfjsLib;
      this.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      return true;
    }
    return false;
  }

  async parseFile(file) {
    if (!file || file.type !== 'application/pdf') {
      throw new Error('Bitte eine gültige PDF-Datei hochladen.');
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await this.pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }

    return this.extractSongs(fullText);
  }

  extractSongs(text) {
    const songs = [];
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    // Verschiedene Parsing-Strategien
    const strategies = [
      this.parseNumberedList.bind(this),
      this.parseBulletList.bind(this),
      this.parseTabSeparated.bind(this),
      this.parsePlainLines.bind(this)
    ];

    for (const strategy of strategies) {
      const result = strategy(lines);
      if (result.length > 0) return result;
    }

    // Fallback: jede nicht-leere Zeile als Songtitel
    return lines.slice(0, 200).map((line, i) => this.createSongFromTitle(line, i));
  }

  // "1. Songname - Tonart" oder "1. Songname (D-Dur)"
  parseNumberedList(lines) {
    const songs = [];
    const regex = /^(\d+)[.)]\s+(.+)/;

    for (const line of lines) {
      const match = line.match(regex);
      if (match) {
        songs.push(this.createSongFromLine(match[2], songs.length));
      }
    }
    return songs.length >= 3 ? songs : [];
  }

  // "- Songname" oder "• Songname"
  parseBulletList(lines) {
    const songs = [];
    const regex = /^[-•*]\s+(.+)/;

    for (const line of lines) {
      const match = line.match(regex);
      if (match) {
        songs.push(this.createSongFromLine(match[1], songs.length));
      }
    }
    return songs.length >= 3 ? songs : [];
  }

  // "Songname\tD-Dur\t120bpm"
  parseTabSeparated(lines) {
    const songs = [];
    for (const line of lines) {
      if (line.includes('\t')) {
        const parts = line.split('\t').map(p => p.trim());
        if (parts[0].length > 1) {
          songs.push(this.createSongFromParts(parts, songs.length));
        }
      }
    }
    return songs.length >= 3 ? songs : [];
  }

  // Einfache Zeilen
  parsePlainLines(lines) {
    // Ignoriere sehr kurze oder sehr lange Zeilen (Header, Seitenzahlen etc.)
    const songLines = lines.filter(l => l.length >= 3 && l.length <= 100);
    return songLines.slice(0, 200).map((line, i) => this.createSongFromTitle(line, i));
  }

  createSongFromLine(line, index) {
    // Extrahiere Tonart aus dem Text wenn vorhanden
    const keyMatch = line.match(/\b([A-H][b#]?-?(dur|moll|Dur|Moll|major|minor|maj|min))\b/i);
    const key = keyMatch ? this.normalizeKey(keyMatch[0]) : this.randomKey();

    // Extrahiere Titel (ohne Tonart-Info)
    let title = line.replace(/\s*[-–(]\s*[A-H][b#]?-?(dur|moll|Dur|Moll)\s*[)]/gi, '').trim();
    title = title.replace(/\s*\|\s*.*/g, '').trim(); // Entferne alles nach |

    return this.createSongFromTitle(title || line, index, key);
  }

  createSongFromParts(parts, index) {
    const title = parts[0];
    const key = parts[1] ? this.normalizeKey(parts[1]) : this.randomKey();
    const tempo = parts[2] ? parseInt(parts[2]) || this.randomTempo() : this.randomTempo();

    return {
      id: 1000 + index,
      title,
      key,
      tempo,
      duration: this.estimateDuration(tempo),
      mood: this.inferMood(title),
      situation: ["konzert", "festival"],
      energy: Math.floor(Math.random() * 4) + 5,
      description: `Importiert aus PDF`,
      lyrics: `(Liedtext für "${title}" noch nicht hinterlegt)\n\nBitte Text hier einfügen.`,
      imported: true
    };
  }

  createSongFromTitle(title, index, key = null) {
    const k = key || this.randomKey();
    const tempo = this.randomTempo();
    return {
      id: 1000 + index,
      title: title.slice(0, 80),
      key: k,
      tempo,
      duration: this.estimateDuration(tempo),
      mood: this.inferMood(title),
      situation: ["konzert", "festival"],
      energy: Math.floor(Math.random() * 4) + 5,
      description: `Importiert aus PDF-Setliste`,
      lyrics: `(Liedtext für "${title}" noch nicht hinterlegt)\n\nBitte Text hier einfügen.`,
      imported: true
    };
  }

  inferMood(title) {
    const t = title.toLowerCase();
    const moods = [];

    if (/feuer|wild|sturm|stark|rock|power|blitz/.test(t)) moods.push("energiegeladen", "kraftvoll");
    if (/herz|liebe|liebes|du und ich|bleib/.test(t)) moods.push("romantisch");
    if (/heim|berg|natur|wald|land/.test(t)) moods.push("feierlich", "nachdenklich");
    if (/nacht|dunkel|trau|wein/.test(t)) moods.push("melancholisch");
    if (/party|tanz|feiern|prost/.test(t)) moods.push("ausgelassen");
    if (/still|ruh|sanft|leise/.test(t)) moods.push("entspannt");

    return moods.length > 0 ? moods : ["feierlich", "energiegeladen"];
  }

  normalizeKey(key) {
    const map = {
      'dur': 'Dur', 'major': 'Dur', 'maj': 'Dur',
      'moll': 'Moll', 'minor': 'Moll', 'min': 'Moll'
    };
    return key.replace(/\b(dur|moll|major|minor|maj|min)\b/gi,
      m => map[m.toLowerCase()] || m);
  }

  randomKey() {
    const keys = [
      'C-Dur', 'D-Dur', 'E-Dur', 'F-Dur', 'G-Dur', 'A-Dur', 'H-Dur',
      'A-Moll', 'E-Moll', 'D-Moll', 'G-Moll', 'H-Moll', 'C-Moll', 'F-Moll',
      'Fis-Dur', 'B-Dur', 'Es-Dur'
    ];
    return keys[Math.floor(Math.random() * keys.length)];
  }

  randomTempo() {
    return 80 + Math.floor(Math.random() * 80);
  }

  estimateDuration(tempo) {
    const bars = 32 + Math.floor(Math.random() * 32);
    const seconds = Math.round((bars * 4 * 60) / tempo);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}

window.PDFParser = PDFParser;
