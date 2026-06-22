// PDF-Parser – optimiert für Setlist-Format:
// Spalten: Titel (bold) | Interpret | Sänger (Wes/Zaus/Julian/Andi) | Tonart
//
// Strategie: pdf.js gibt Textelemente MIT x/y-Koordinaten zurück.
// Wir gruppieren nach Zeile (y-Position) und nutzen den Sänger-Eintrag
// als Spalten-Anker um Titel und Interpret zu trennen.

class PDFParser {
  constructor(onSongsImported) {
    this.onSongsImported = onSongsImported;
  }

  async init() {
    if (window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
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
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    // Alle Text-Items mit Positionsdaten sammeln
    const allItems = [];
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const content = await page.getTextContent();
      content.items.forEach(item => {
        const text = item.str.trim();
        if (text) {
          allItems.push({
            text,
            x: item.transform[4],   // x-Position (links → rechts)
            y: item.transform[5],   // y-Position (pdf: unten → oben)
            page: p
          });
        }
      });
    }

    return this.parseItemsToSongs(allItems);
  }

  parseItemsToSongs(items) {
    // ── Schritt 1: Zeilen gruppieren (nach page + gerundeter y-Position) ──
    const rowMap = new Map();
    items.forEach(item => {
      // 3px-Toleranz beim Rundung → Zeilen die leicht versetzt sind, werden zusammengefasst
      const rowKey = `${item.page}-${Math.round(item.y / 3) * 3}`;
      if (!rowMap.has(rowKey)) rowMap.set(rowKey, []);
      rowMap.get(rowKey).push(item);
    });

    // Zeilen sortieren: page aufsteigend, innerhalb page y absteigend (= oben → unten)
    const rows = [...rowMap.values()]
      .map(row => row.sort((a, b) => a.x - b.x)) // innerhalb Zeile: links → rechts
      .sort((a, b) => {
        if (a[0].page !== b[0].page) return a[0].page - b[0].page;
        return b[0].y - a[0].y; // höheres y = weiter oben auf der Seite
      });

    // ── Schritt 2: Sänger-Spalte orten ──
    // Sänger sind immer exakt: Wes, Zaus, Julian, Andi (ggf. "Wes / Andi")
    const SINGER_RE = /^(Wes|Zaus|Julian|Andi)$/i;

    const singerXs = [];
    rows.forEach(row => {
      const si = row.find(i => SINGER_RE.test(i.text));
      if (si) singerXs.push(si.x);
    });

    if (singerXs.length === 0) {
      // Fallback: kein Sänger gefunden → text-basiertes Parsing
      return this.parseFallback(rows);
    }

    // Durchschnittliche x-Position der Sänger-Spalte
    const avgSingerX = singerXs.reduce((a, b) => a + b, 0) / singerXs.length;

    // Trennpunkt Titel / Interpret:
    // Titel beginnt am linken Rand (ca. x ≈ 50–60 pts für A4 mit Normalrand)
    // Interpret beginnt bei ca. 55–65% des Abstands zwischen linkem Rand und Sänger-Spalte
    const leftMargin = Math.min(...items.map(i => i.x)); // tatsächlicher linker Rand
    const titleArtistSplit = leftMargin + (avgSingerX - leftMargin) * 0.6;

    // ── Schritt 3: Songs extrahieren ──
    const songs = [];

    rows.forEach(row => {
      // Nur Zeilen mit Sänger verarbeiten
      const singerItem = row.find(i =>
        SINGER_RE.test(i.text) || /^Wes\s*\/\s*Andi$/i.test(i.text)
      );
      if (!singerItem) return;

      // Elemente in Spalten aufteilen
      const titleItems   = row.filter(i => i.x <  titleArtistSplit);
      const artistItems  = row.filter(i => i.x >= titleArtistSplit && i.x < singerItem.x - 5);
      const keyItems     = row.filter(i => i.x >  singerItem.x + 20);

      const title  = titleItems.map(i => i.text).join(' ').trim();
      const artist = artistItems.map(i => i.text).join(' ').trim();
      const key    = keyItems.map(i => i.text).join('').trim();
      const singer = singerItem.text.trim();

      if (!title || title.length < 2) return;

      songs.push({
        id:          1000 + songs.length,
        title,
        artist:      artist || '',
        key:         key    || '',
        singer,
        tempo:       this.inferTempo(title, artist),
        duration:    '3:30',
        mood:        this.inferMood(title, artist),
        situation:   ['konzert', 'festival', 'party', 'bar'],
        energy:      this.inferEnergy(title, artist),
        description: artist || 'Importiert',
        lyrics:      `(Liedtext für "${title}" noch nicht hinterlegt.\nBitte hier einfügen.)`,
        imported:    true
      });
    });

    return songs;
  }

  // ── Fallback: Text-basiertes Parsing wenn keine Positionsdaten ──────────
  parseFallback(rows) {
    const songs = [];
    const SINGER_RE = /\b(Wes(?:\s*\/\s*Andi)?|Zaus|Julian|Andi)\b/i;

    rows.forEach(row => {
      const line = row.map(i => i.text).join(' ').trim();
      const match = line.match(SINGER_RE);
      if (!match) return;

      const singerIdx = line.search(SINGER_RE);
      const before    = line.slice(0, singerIdx).trim();
      const after     = line.slice(singerIdx + match[0].length).trim();
      const key       = after.match(/^[A-Hb#m0-9]+/)?.[0] || '';

      // Titel / Interpret aus "before" trennen – letzten 1-3 Wörter als Interpret
      const words = before.trim().split(/\s+/);
      let artistWords = 0;
      for (let i = words.length - 1; i >= 1; i--) {
        const w = words[i];
        if (/^[A-ZÄÖÜ]/.test(w) || /^(the|von|de|di|van)$/i.test(w)) {
          artistWords++;
          if (artistWords >= 3) break;
        } else break;
      }

      const title  = words.slice(0, words.length - artistWords).join(' ') || before;
      const artist = words.slice(words.length - artistWords).join(' ');

      if (!title || title.length < 2) return;

      songs.push({
        id:          1000 + songs.length,
        title,
        artist,
        key,
        singer:      match[0],
        tempo:       this.inferTempo(title, artist),
        duration:    '3:30',
        mood:        this.inferMood(title, artist),
        situation:   ['konzert', 'festival', 'party', 'bar'],
        energy:      this.inferEnergy(title, artist),
        description: artist || 'Importiert',
        lyrics:      `(Liedtext für "${title}" noch nicht hinterlegt.)`,
        imported:    true
      });
    });

    return songs;
  }

  // ── Hilfsfunktionen ──────────────────────────────────────────────────────

  inferMood(title, artist = '') {
    const t = (title + ' ' + artist).toLowerCase();
    const moods = new Set();

    if (/fire|hell|thunder|wild|crazy|storm|rage|shake|acdc|rock|pump/.test(t))
      moods.add('energiegeladen'), moods.add('kraftvoll');
    if (/love|heart|rain|baby|darling|angel|heaven|beautiful|ohne dich|purple/.test(t))
      moods.add('romantisch');
    if (/home|sweet|country|heim|land|colonia|prost|bier|viva|hulapalu/.test(t))
      moods.add('feierlich');
    if (/alone|dark|night|pain|cry|sad|ohne|lost|nacht|dunkel|schlaf ich/.test(t))
      moods.add('melancholisch');
    if (/dance|party|yeah|celebrate|tonight|kornfeld|shut up|rock all|everybody|achy/.test(t))
      moods.add('ausgelassen');
    if (/slow|soft|peaceful|still|ruhig|leise|tender|easy/.test(t))
      moods.add('entspannt');

    return moods.size > 0 ? [...moods] : ['feierlich', 'energiegeladen'];
  }

  inferEnergy(title, artist = '') {
    const t = (title + ' ' + artist).toLowerCase();

    if (/acdc|highway to hell|shook me|sturmwind|thunder|rage|metal|hard rock|whitesnake|guns/.test(t))
      return 9;
    if (/dance|party|yeah|viva|prost|everybody|achy breaky|rockin|all over/.test(t))
      return 8;
    if (/fire|wild|crazy|narcotic|rausch|pump|adrenalin|shut up/.test(t))
      return 8;
    if (/purple rain|without|alone|ohne dich|schlaf|slow|tender|soft|leise/.test(t))
      return 3;
    if (/rain|heart|love|darling|angel/.test(t))
      return 4;
    if (/wahnsinn|proud mary|sweet home|expresso|chianti|weiß der geier/.test(t))
      return 6;
    if (/honkey tonk|sweet child|here i go|rockin|highway/.test(t))
      return 7;
    return 6;
  }

  inferTempo(title, artist = '') {
    const energy = this.inferEnergy(title, artist);
    // Grobe Tempo-Schätzung aus Energie
    const base = 80;
    const range = 80;
    return Math.round(base + (energy / 10) * range);
  }
}

window.PDFParser = PDFParser;
