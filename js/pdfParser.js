class PDFParser {
  constructor(onSongsImported) {
    this.onSongsImported = onSongsImported;
    this.pdfjsLib = null;
  }

  async init() {
    if (window.pdfjsLib) {
      this.pdfjsLib = window.pdfjsLib;
      this.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      return true;
    }
    return false;
  }

  async parseFile(file) {
    if (!file || file.type !== 'application/pdf') throw new Error('Bitte eine gültige PDF-Datei hochladen.');
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await this.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      fullText += content.items.map(item => item.str).join(' ') + '\n';
    }
    return this.extractSongs(fullText);
  }

  extractSongs(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    for (const strategy of [this.parseNumberedList, this.parseBulletList, this.parseTabSeparated, this.parsePlainLines].map(f => f.bind(this))) {
      const result = strategy(lines);
      if (result.length > 0) return result;
    }
    return lines.slice(0, 200).map((line, i) => this.createSongFromTitle(line, i));
  }

  parseNumberedList(lines) {
    const songs = [];
    for (const line of lines) {
      const match = line.match(/^(\d+)[.)]\s+(.+)/);
      if (match) songs.push(this.createSongFromLine(match[2], songs.length));
    }
    return songs.length >= 3 ? songs : [];
  }

  parseBulletList(lines) {
    const songs = [];
    for (const line of lines) {
      const match = line.match(/^[-•*]\s+(.+)/);
      if (match) songs.push(this.createSongFromLine(match[1], songs.length));
    }
    return songs.length >= 3 ? songs : [];
  }

  parseTabSeparated(lines) {
    const songs = [];
    for (const line of lines) {
      if (line.includes('\t')) {
        const parts = line.split('\t').map(p => p.trim());
        if (parts[0].length > 1) songs.push(this.createSongFromParts(parts, songs.length));
      }
    }
    return songs.length >= 3 ? songs : [];
  }

  parsePlainLines(lines) {
    return lines.filter(l => l.length >= 3 && l.length <= 100).slice(0, 200).map((line, i) => this.createSongFromTitle(line, i));
  }

  createSongFromLine(line, index) {
    const keyMatch = line.match(/\b([A-H][b#]?-?(dur|moll|Dur|Moll|major|minor))\b/i);
    const key = keyMatch ? this.normalizeKey(keyMatch[0]) : this.randomKey();
    let title = line.replace(/\s*[-–(]\s*[A-H][b#]?-?(dur|moll|Dur|Moll)\s*[)]/gi, '').replace(/\s*\|\s*.*/g, '').trim();
    return this.createSongFromTitle(title || line, index, key);
  }

  createSongFromParts(parts, index) {
    return { id: 1000 + index, title: parts[0], key: parts[1] ? this.normalizeKey(parts[1]) : this.randomKey(), tempo: parts[2] ? parseInt(parts[2]) || this.randomTempo() : this.randomTempo(), duration: this.estimateDuration(this.randomTempo()), mood: this.inferMood(parts[0]), situation: ["konzert", "festival"], energy: Math.floor(Math.random() * 4) + 5, description: 'Importiert aus PDF', lyrics: `(Liedtext noch nicht hinterlegt)`, imported: true };
  }

  createSongFromTitle(title, index, key = null) {
    const tempo = this.randomTempo();
    return { id: 1000 + index, title: title.slice(0, 80), key: key || this.randomKey(), tempo, duration: this.estimateDuration(tempo), mood: this.inferMood(title), situation: ["konzert", "festival"], energy: Math.floor(Math.random() * 4) + 5, description: 'Importiert aus PDF-Setliste', lyrics: `(Liedtext für "${title}" noch nicht hinterlegt)`, imported: true };
  }

  inferMood(title) {
    const t = title.toLowerCase();
    const moods = [];
    if (/feuer|wild|sturm|stark|rock|power/.test(t)) moods.push('energiegeladen', 'kraftvoll');
    if (/herz|liebe|bleib/.test(t)) moods.push('romantisch');
    if (/heim|berg|natur|wald/.test(t)) moods.push('feierlich', 'nachdenklich');
    if (/nacht|dunkel|trau/.test(t)) moods.push('melancholisch');
    if (/party|tanz|prost/.test(t)) moods.push('ausgelassen');
    if (/still|ruh|leise/.test(t)) moods.push('entspannt');
    return moods.length > 0 ? moods : ['feierlich', 'energiegeladen'];
  }

  normalizeKey(key) {
    return key.replace(/\b(dur|major|maj)\b/gi, 'Dur').replace(/\b(moll|minor|min)\b/gi, 'Moll');
  }

  randomKey() {
    return ['C-Dur','D-Dur','E-Dur','F-Dur','G-Dur','A-Dur','A-Moll','E-Moll','D-Moll','G-Moll','H-Moll','B-Dur'][Math.floor(Math.random() * 12)];
  }

  randomTempo() { return 80 + Math.floor(Math.random() * 80); }

  estimateDuration(tempo) {
    const s = Math.round(((32 + Math.floor(Math.random() * 32)) * 4 * 60) / tempo);
    return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
  }
}

window.PDFParser = PDFParser;