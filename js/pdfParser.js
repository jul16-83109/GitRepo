// PDF-Parser – Setlist-Format: Titel (bold) | Interpret | Sänger | Tonart (optional)
//
// Bug-Fix: Bold-Titel und Regular-Text haben in pdf.js oft verschiedene y-Baselines (3–5pt).
// Lösung: Singer-Items als Zeilen-Anker, ±8pt Toleranz statt 3pt Pre-Grouping.

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

    const allItems = [];
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const content = await page.getTextContent();
      content.items.forEach(item => {
        const text = item.str.trim();
        if (text) {
          allItems.push({
            text,
            x: item.transform[4],
            y: item.transform[5],
            page: p
          });
        }
      });
    }

    return this.parseItemsToSongs(allItems);
  }

  parseItemsToSongs(items) {
    // Erkennt "Wes", "Zaus", "Julian", "Andi", "Zaus / Wes", "Wes / Julian" etc.
    const SINGER_RE = /^(Wes|Zaus|Julian|Andi)(\s*\/\s*(Wes|Zaus|Julian|Andi))*$/i;
    const SINGER_SINGLE_RE = /^(Wes|Zaus|Julian|Andi)$/i;

    // Singer-Items als Zeilen-Anker
    const singerItems = items.filter(i => SINGER_RE.test(i.text));

    if (singerItems.length === 0) {
      return this.parseFallback(this.groupIntoRows(items, 5));
    }

    // Avg-X der Sänger-Spalte (nur Einzel-Namen für Präzision)
    const singles = singerItems.filter(i => SINGER_SINGLE_RE.test(i.text));
    const xSamples = singles.length > 0 ? singles : singerItems;
    const avgSingerX = xSamples.reduce((s, i) => s + i.x, 0) / xSamples.length;

    const leftMargin = Math.min(...items.map(i => i.x));
    const titleArtistSplit = leftMargin + (avgSingerX - leftMargin) * 0.55;

    // 8pt Toleranz überbrückt Bold/Regular Baseline-Unterschied
    const Y_TOL = 8;
    const songs = [];
    const usedRows = new Set();

    // Singer-Items oben→unten sortieren
    [...singerItems]
      .sort((a, b) => a.page !== b.page ? a.page - b.page : b.y - a.y)
      .forEach(singerItem => {
        // Deduplizierung: "Zaus / Wes" kann als zwei separate Items kommen
        const rowKey = `${singerItem.page}-${Math.round(singerItem.y / 3) * 3}`;
        if (usedRows.has(rowKey)) return;
        usedRows.add(rowKey);

        // Alle Items dieser Seite innerhalb ±8pt der Singer-Y
        const rowItems = items
          .filter(i => i.page === singerItem.page && Math.abs(i.y - singerItem.y) <= Y_TOL)
          .sort((a, b) => a.x - b.x);

        // Singer-Text rekonstruieren (bei separaten Tokens "Zaus", "/", "Wes")
        const singerTokens = rowItems
          .filter(i => i.x >= singerItem.x - 5 && /^(Wes|Zaus|Julian|Andi|\/)$/i.test(i.text))
          .map(i => i.text.trim());
        const singer = singerTokens.length > 1
          ? singerTokens.filter(t => t !== '/').join(' / ')
          : singerItem.text.trim();

        // Spalten nach x-Position
        const titleParts  = rowItems.filter(i => i.x < titleArtistSplit);
        const artistParts = rowItems.filter(i =>
          i.x >= titleArtistSplit && i.x < singerItem.x - 5
        );
        // Tonart: nur valide Key-Texte rechts der Singer-Spalte
        const keyParts = rowItems.filter(i =>
          i.x > singerItem.x + 20 && /^[A-Hb#m]+\d*$/.test(i.text)
        );

        const title  = titleParts.map(i => i.text).join(' ').trim();
        const artist = artistParts.map(i => i.text).join(' ').trim();
        const rawKey = keyParts.map(i => i.text).join('').trim();
        // Tonart: aus PDF oder aus Datenbank (Lookup via Titel + Interpret)
        const key = rawKey || this.lookupKey(title, artist);

        if (!title || title.length < 2) return;

        songs.push({
          id:          1000 + songs.length,
          title,
          artist:      artist || '',
          key,
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

  groupIntoRows(items, tol) {
    const map = new Map();
    items.forEach(i => {
      const k = `${i.page}-${Math.round(i.y / tol) * tol}`;
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(i);
    });
    return [...map.values()]
      .map(r => r.sort((a, b) => a.x - b.x))
      .sort((a, b) => a[0].page !== b[0].page ? a[0].page - b[0].page : b[0].y - a[0].y);
  }

  // ── Fallback: text-basiertes Parsing ─────────────────────────────────────
  parseFallback(rows) {
    const songs = [];
    const SINGER_RE = /\b(Wes|Zaus|Julian|Andi)(\s*\/\s*(Wes|Zaus|Julian|Andi))?\b/i;

    rows.forEach(row => {
      const line = row.map(i => i.text).join(' ').trim();
      const match = line.match(SINGER_RE);
      if (!match) return;

      const singerIdx = line.search(SINGER_RE);
      const before    = line.slice(0, singerIdx).trim();
      const after     = line.slice(singerIdx + match[0].length).trim();
      const rawKey    = after.match(/^[A-Hb#m]+\d*/)?.[0] || '';

      const words = before.split(/\s+/);
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
        key:         rawKey || this.lookupKey(title, artist),
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

  // ── Tonart-Lookup via Titel + Interpret ──────────────────────────────────
  // Fallback wenn die PDF keine Tonart-Spalte enthält.
  lookupKey(title, artist) {
    const t = title.toLowerCase().trim();
    const a = (artist || '').toLowerCase().trim();

    const DB = {
      'sommer in der stadt':      'G',  'rote lippen':             'D',
      'alice':                    'D',  'willenlos':               'D',
      'never rains in southern':  'D',  'have you ever seen the':  'C',
      'achy breaky heart':        'A',  'centerfold':              'D',
      'beast of burden':          'E',  'honkey tonk women':       'G',
      'crazy little thing':       'D',  'everybody needs':         'C',
      'breakfast at tiffanys':    'D',  'gimme hope joana':        'C',
      'sweet caroline':           'G',  'boiler moräna':           'G',
      'expresso & chianti':       'C',  'mitn frosch im hois':     'G',
      'fürstenfeld':              'G',  'ham kummst':              'G',
      'here i go again':          'C',  'sweet home alabama':      'D',
      '500 miles':                'D',  'bobfahrer':               'G',
      'fliegerlied':              'G',  'joana':                   'G',
      'cordula grün':             'G',  'schmidtchen schleicher':  'C',
      'ein bett im kornfeld':     'G',  'viva colonia':            'C',
      'weiß der geier':           'G',  'hey baby':                'G',
      'marmor stein':             'G',  'wahnsinn':                'A',
      'bella napoli':             'Am', 'brenna duads guad':       'G',
      'skandal im sperrbezrik':   'G',  'bella ciao':              'Am',
      'hang on sloopy':           'G',  'all in':                  'G',
      'hulapalu':                 'E',  'country roads':           'G',
      'start me up':              'G',  'rockin all over the':     'G',
      'i want you to want me':    'A',  'mir san boarische band':  'G',
      'schickeria':               'G',  'kompliment':              'G',
      'narcotic':                 'Dm', 'proud mary':              'D',
      'elvis medley':             'G',  'devil in disguise':       'G',
      'rockstar':                 'G',  'runaway':                 'A',
      'highway to hell':          'A',  'shook me allnight long':  'A',
      'shut up and dance':        'D',  'sex is on fire':          'C',
      'westerland':               'D',  'pocahontas':              'C',
      '1001 nacht':               'Am', 'verdammt ich lieb dich':  'C',
      'ohne dich schlaf ich':     'F',  'purple rain':             'Bb',
      'knocking on heavens':      'G',  "sweet child o'mine":      'Eb',
      'with or without':          'D',  'angels':                  'G',
      'bad moon risin':           'C',  'du entschuldige':         'C',
      'eine neue liebe':          'C',  'haberfeldtreiber':        'Am',
      'himbeereis zum':           'G',  'i sing a liad':           'G',
      'im wagen vor mir':         'G',  'mellau':                  'G',
      'pina colada':              'G',  'marihuanabam':            'G',
      'schifoan':                 'G',  '40 jahre die flippers':   'C',
      'so a saudummer dog':       'G',  'gib des bandl':           'G',
      'zwickts mi':               'G',  'schmutzig liebe':         'G',
      'es lebe der sport':        'G',  'rote pferd':              'G',
      'cowboy und indianer':      'G',  'bella ciao':              'Am',
    };

    if (DB[t]) return DB[t];

    // Prefix-Match (z.B. "Rockin all over the World" → treffer)
    for (const [k, v] of Object.entries(DB)) {
      if (t.startsWith(k) || (t.length >= 8 && k.startsWith(t.slice(0, t.length - 2))))
        return v;
    }

    // Interpret-Fallback
    if (/ac.?dc/.test(a))                    return 'A';
    if (/rolling stones/.test(a))            return 'G';
    if (/ccr|creedence/.test(a))             return 'G';
    if (/spider.murphy/.test(a))             return 'G';
    if (/\bsts\b/.test(a))                   return 'G';
    if (/queen/.test(a))                     return 'G';
    if (/elvis presley/.test(a))             return 'G';
    if (/bon jovi/.test(a))                  return 'A';
    if (/guns.?n.?roses/.test(a))            return 'G';
    if (/\bu2\b/.test(a))                    return 'D';
    if (/whitesnake/.test(a))                return 'C';
    if (/lynyrd skynyrd/.test(a))            return 'D';

    return '';
  }

  // ── Mood / Energy / Tempo ────────────────────────────────────────────────
  inferMood(title, artist = '') {
    const t = (title + ' ' + artist).toLowerCase();
    const moods = new Set();

    if (/fire|hell|thunder|wild|crazy|storm|rage|shake|acdc|rock|pump|skandal/.test(t))
      moods.add('energiegeladen'), moods.add('kraftvoll');
    if (/love|heart|rain|baby|darling|angel|heaven|beautiful|ohne dich|purple|liebe/.test(t))
      moods.add('romantisch');
    if (/home|sweet|country|heim|land|colonia|viva|hulapalu|kornfeld|schifoan|fürstenfeld/.test(t))
      moods.add('feierlich');
    if (/alone|dark|night|pain|cry|sad|ohne|lost|nacht|dunkel|schlaf ich|westerland/.test(t))
      moods.add('melancholisch');
    if (/dance|party|yeah|celebrate|tonight|kornfeld|shut up|rock all|everybody|achy|fliegerlied|wahnsinn/.test(t))
      moods.add('ausgelassen');
    if (/slow|soft|peaceful|still|ruhig|leise|tender|easy|country roads|angels/.test(t))
      moods.add('entspannt');

    return moods.size > 0 ? [...moods] : ['feierlich', 'energiegeladen'];
  }

  inferEnergy(title, artist = '') {
    const t = (title + ' ' + artist).toLowerCase();
    if (/acdc|highway to hell|shook me|thunder|rage|metal|whitesnake|guns/.test(t)) return 9;
    if (/dance|party|viva|everybody|achy breaky|rockin|fliegerlied|wahnsinn|shut up/.test(t)) return 8;
    if (/fire|wild|crazy|narcotic|pump|skandal|kompliment/.test(t)) return 8;
    if (/purple rain|without|alone|ohne dich|schlaf|westerland|angels/.test(t)) return 3;
    if (/rain|heart|love|darling|angel|country roads|schifoan/.test(t)) return 4;
    if (/wahnsinn|proud mary|sweet home|expresso|chianti|weiß der geier|ham kummst/.test(t)) return 6;
    if (/honkey tonk|sweet child|here i go|rockin|highway|runaway/.test(t)) return 7;
    return 6;
  }

  inferTempo(title, artist = '') {
    const e = this.inferEnergy(title, artist);
    return Math.round(80 + (e / 10) * 80);
  }
}

window.PDFParser = PDFParser;
