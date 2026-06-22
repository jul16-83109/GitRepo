// Setlist Generator – Haupt-App-Logik

class SetlistApp {
  constructor() {
    this.songs = [...window.SONGS];
    this.moodKeywords = window.MOOD_KEYWORDS;
    this.situationKeywords = window.SITUATION_KEYWORDS;
    this.userProfile = { moods: [], situations: [], audience: '', count: 10, extras: '', step: 0 };
    this.generatedSetlist = [];
    this.pdfParser = new PDFParser();
    this.chatStarted = false;
    this._enriching = false;
    this.init();
  }

  init() {
    this.pdfParser.init();
    this.setupEventListeners();
    this.updateSongCount();

    setTimeout(() => this.botMessage('Willkommen beim Setlist-Generator! 🎵'), 400);
    setTimeout(() => this.botMessage('Lade zuerst deine Setlist als PDF hoch – dann erstellen wir gemeinsam die perfekte Auswahl.'), 1200);
  }

  setupEventListeners() {
    const input   = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');

    sendBtn.addEventListener('click', () => this.handleUserInput());
    input.addEventListener('keypress', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.handleUserInput(); }
    });

    const uploadArea = document.getElementById('upload-area');
    const fileInput  = document.getElementById('pdf-input');

    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover',  e => { e.preventDefault(); uploadArea.classList.add('drag-over'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
    uploadArea.addEventListener('drop', e => {
      e.preventDefault();
      uploadArea.classList.remove('drag-over');
      if (e.dataTransfer.files[0]) this.handlePDFUpload(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', e => {
      if (e.target.files[0]) this.handlePDFUpload(e.target.files[0]);
    });

    document.getElementById('modal-close').addEventListener('click', () => this.closeModal());
    document.getElementById('song-modal').addEventListener('click', e => {
      if (e.target === document.getElementById('song-modal')) this.closeModal();
    });
  }

  // =====================================================================
  // PDF UPLOAD
  // =====================================================================

  async handlePDFUpload(file) {
    const uploadArea = document.getElementById('upload-area');
    const statusEl   = document.getElementById('upload-status');

    uploadArea.classList.add('loading');
    statusEl.textContent = '⏳ PDF wird verarbeitet...';
    statusEl.className = 'upload-status loading';

    try {
      if (!window.pdfjsLib) throw new Error('PDF-Bibliothek lädt noch – bitte kurz warten.');

      await this.pdfParser.init();
      const imported = await this.pdfParser.parseFile(file);
      if (imported.length === 0) throw new Error('Keine Songs erkannt. Bitte PDF-Format prüfen.');

      const wasEmpty = this.songs.length === 0;
      this.addImportedSongs(imported);

      statusEl.textContent = `✅ ${imported.length} Songs importiert aus „${file.name}"`;
      statusEl.className = 'upload-status success';

      this.botMessage(`🎵 ${this.songs.length} Songs geladen! Ich hole jetzt Musikdaten aus dem Internet...`);

      // Background enrichment via iTunes API – improves genre/energy/duration data
      this.enrichSongsInBackground(statusEl);

      if (wasEmpty || !this.chatStarted) {
        this.chatStarted = true;
        setTimeout(() => this.showStep(0), 1200);
      }

    } catch (err) {
      statusEl.textContent = `❌ Fehler: ${err.message}`;
      statusEl.className = 'upload-status error';
    } finally {
      uploadArea.classList.remove('loading');
    }
  }

  addImportedSongs(newSongs) {
    const existing = new Set(this.songs.map(s => s.title.toLowerCase()));
    const unique   = newSongs.filter(s => !existing.has(s.title.toLowerCase()));
    this.songs.push(...unique);
    this.updateSongCount();
  }

  updateSongCount() {
    const el = document.getElementById('song-count');
    if (el) el.textContent = `${this.songs.length} Songs geladen`;
  }

  // =====================================================================
  // METADATA ENRICHMENT
  // Deezer: real BPM + genre. iTunes: genre + duration fallback.
  // All fetches are best-effort; failures are silently ignored.
  // =====================================================================

  async enrichSongsInBackground(statusEl) {
    if (this._enriching) return;
    this._enriching = true;

    const toEnrich = this.songs.filter(s => !s._enriched);
    if (toEnrich.length === 0) { this._enriching = false; return; }

    let done = 0;
    const BATCH = 3;   // 3 songs × ~3 requests each ≈ 9 concurrent
    const DELAY = 300; // ms between batches

    for (let i = 0; i < toEnrich.length; i += BATCH) {
      const batch = toEnrich.slice(i, i + BATCH);

      await Promise.allSettled(batch.map(async song => {
        try { await this.enrichSong(song); } catch { /* best-effort */ }
        song._enriched = true;
        done++;
      }));

      if (statusEl) {
        statusEl.textContent = `📡 Musikdaten: ${done}/${toEnrich.length} Songs analysiert...`;
        statusEl.className = 'upload-status loading';
      }

      if (i + BATCH < toEnrich.length) {
        await new Promise(r => setTimeout(r, DELAY));
      }
    }

    if (statusEl) {
      statusEl.textContent = `✅ ${done} Songs mit Musikdaten angereichert`;
      statusEl.className = 'upload-status success';
    }
    this._enriching = false;
  }

  async enrichSong(song) {
    const q = encodeURIComponent(`${song.title} ${song.artist || ''}`);

    // Deezer: real BPM + genre (two-step: search → track detail)
    try {
      const r1 = await fetch(`https://api.deezer.com/search?q=${q}&limit=1`);
      if (r1.ok) {
        const d1 = await r1.json();
        if (d1.data && d1.data[0]) {
          const trackId = d1.data[0].id;
          const r2 = await fetch(`https://api.deezer.com/track/${trackId}`);
          if (r2.ok) {
            const d2 = await r2.json();
            if (d2.bpm && d2.bpm > 40) {
              song.tempo      = Math.round(d2.bpm);
              song._bpmSource = 'deezer';
            }
            if (d2.genres && d2.genres.data && d2.genres.data[0]) {
              this.applyGenre(song, d2.genres.data[0].name);
            }
          }
        }
      }
    } catch { /* CORS or network – fall through to iTunes */ }

    // iTunes: genre + duration (always runs, supplements Deezer data)
    try {
      const res = await fetch(
        `https://itunes.apple.com/search?term=${q}&entity=song&limit=1&media=music`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results[0]) {
          const t = data.results[0];
          if (t.primaryGenreName && !song._genre) this.applyGenre(song, t.primaryGenreName);
          if (t.trackTimeMillis) {
            const s = Math.round(t.trackTimeMillis / 1000);
            song.duration = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
          }
        }
      }
    } catch { /* skip */ }
  }

  applyGenre(song, genre) {
    const g = genre.toLowerCase();

    // Genre → energy adjustment (blend with existing keyword-derived energy)
    const energyByGenre = [
      [/metal|hard rock/,          9],
      [/rock|punk|alternative/,    8],
      [/dance|electronic|techno/,  8],
      [/pop|schlager|volksmusik/,  6],
      [/country|folk|bluegrass/,   5],
      [/r&b|soul|funk/,            6],
      [/blues|jazz/,               4],
      [/classical|soundtrack/,     3],
      [/singer.songwriter/,        4],
    ];
    for (const [re, e] of energyByGenre) {
      if (re.test(g)) { song.energy = Math.round((song.energy + e) / 2); break; }
    }

    // Recalculate tempo from energy only when we don't have a real BPM
    if (!song._bpmSource) song.tempo = Math.round(80 + (song.energy / 10) * 80);

    // Genre → mood enrichment
    const moodByGenre = [
      [/metal|hard rock|punk/,   ['energiegeladen', 'kraftvoll']],
      [/rock|alternative/,       ['energiegeladen']],
      [/dance|electronic/,       ['ausgelassen']],
      [/pop|schlager/,           ['feierlich', 'ausgelassen']],
      [/country|folk/,           ['feierlich', 'entspannt']],
      [/r&b|soul/,               ['romantisch']],
      [/blues/,                  ['melancholisch']],
      [/jazz|classical/,         ['entspannt', 'nachdenklich']],
    ];
    for (const [re, moods] of moodByGenre) {
      if (re.test(g)) {
        moods.forEach(m => { if (!song.mood.includes(m)) song.mood.unshift(m); });
        break;
      }
    }

    song._genre = genre;
  }

  // =====================================================================
  // CHAT
  // =====================================================================

  showStep(step) {
    this.userProfile.step = step;

    const steps = [
      {
        question: 'Für welchen Anlass spielt ihr heute?',
        options: [
          { label: '🎸 Konzert / Gig',       value: 'konzert'  },
          { label: '🎪 Festival / Open Air',  value: 'festival' },
          { label: '🍺 Bar / Kneipe',         value: 'bar'      },
          { label: '🎉 Party / Geburtstag',   value: 'party'    },
          { label: '💒 Hochzeit',             value: 'hochzeit' },
          { label: '🌲 Outdoor / Natur',      value: 'outdoor'  },
        ],
        type: 'single',
      },
      {
        question: 'Welche Energie wollt ihr erzeugen?',
        options: [
          { label: '⚡ Volle Power',           value: 'energiegeladen' },
          { label: '🎊 Feierlich & Festlich',  value: 'feierlich'      },
          { label: '❤️ Romantisch & Warm',     value: 'romantisch'     },
          { label: '🌿 Entspannt & Chill',     value: 'entspannt'      },
          { label: '🌙 Nachdenklich & Tief',   value: 'nachdenklich'   },
          { label: '🔥 Ausgelassen & Wild',    value: 'ausgelassen'    },
        ],
        type: 'multi',
        hint: '(Mehrfachauswahl möglich)',
      },
      {
        question: 'Wie groß ist euer Publikum?',
        options: [
          { label: '👥 Klein (unter 50)',    value: 'klein'  },
          { label: '👥👥 Mittel (50–200)',   value: 'mittel' },
          { label: '🏟️ Groß (über 200)',    value: 'gross'  },
        ],
        type: 'single',
      },
      {
        question: 'Wie viele Songs soll die Setlist haben?',
        options: [
          { label: '5 Songs  ·  Zugabe / Encore',  value: '5'  },
          { label: '8 Songs  ·  Kurzes Set',        value: '8'  },
          { label: '10 Songs  ·  Standard Set',     value: '10' },
          { label: '15 Songs  ·  Langes Set',       value: '15' },
          { label: '20 Songs  ·  Full Show',        value: '20' },
        ],
        type: 'single',
        hint: '(Oder eigene Zahl eintippen)',
        allowText: true,
      },
    ];

    if (step >= steps.length) { this.generateSetlist(); return; }
    this.renderQuestion(steps[step]);
  }

  renderQuestion(stepData) {
    const chatMessages = document.getElementById('chat-messages');
    const bubble = document.createElement('div');
    bubble.className = 'message bot-message';
    bubble.innerHTML = `<div class="message-content"><div class="bot-icon">🎵</div><div class="bubble"><p>${stepData.question}</p>${stepData.hint ? `<small class="hint">${stepData.hint}</small>` : ''}</div></div>`;
    chatMessages.appendChild(bubble);

    if (stepData.options) {
      const optionsDiv = document.createElement('div');
      optionsDiv.className = `chat-options${stepData.type === 'multi' ? ' multi-select' : ''}`;
      optionsDiv.id = `options-${this.userProfile.step}`;

      if (stepData.type === 'multi') {
        optionsDiv.dataset.selected = '[]';
        stepData.options.forEach(opt => {
          const btn = document.createElement('button');
          btn.className = 'option-btn';
          btn.dataset.value = opt.value;
          btn.textContent = opt.label;
          btn.addEventListener('click', () => {
            btn.classList.toggle('selected');
            optionsDiv.dataset.selected = JSON.stringify(
              [...optionsDiv.querySelectorAll('.option-btn.selected')].map(b => b.dataset.value)
            );
          });
          optionsDiv.appendChild(btn);
        });
        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'option-btn confirm-btn';
        confirmBtn.textContent = '✓ Weiter';
        confirmBtn.addEventListener('click', () => {
          const selected = JSON.parse(optionsDiv.dataset.selected);
          if (selected.length === 0) { this.showToast('Bitte mindestens eine Option wählen.'); return; }
          this.handleOption(selected, stepData.options.filter(o => selected.includes(o.value)).map(o => o.label).join(', '));
        });
        optionsDiv.appendChild(confirmBtn);
      } else {
        stepData.options.forEach(opt => {
          const btn = document.createElement('button');
          btn.className = 'option-btn';
          btn.textContent = opt.label;
          btn.addEventListener('click', () => this.handleOption(opt.value, opt.label));
          optionsDiv.appendChild(btn);
        });
      }
      chatMessages.appendChild(optionsDiv);
    }

    // Text input is always shown for 'text' steps, and optionally for steps with allowText
    if (stepData.type === 'text' || stepData.allowText) {
      const input = document.getElementById('chat-input');
      input.placeholder = stepData.placeholder || (stepData.allowText ? 'Oder Zahl eingeben...' : 'Deine Antwort...');
      input.disabled = false;
      input.focus();
    }

    this.scrollChat();
  }

  handleOption(value, label) {
    const step = this.userProfile.step;
    this.userMessage(label);
    const optionsDiv = document.getElementById(`options-${step}`);
    if (optionsDiv) {
      optionsDiv.querySelectorAll('button').forEach(b => b.disabled = true);
      optionsDiv.style.opacity = '0.5';
    }

    if      (step === 0) this.userProfile.situations = Array.isArray(value) ? value : [value];
    else if (step === 1) this.userProfile.moods      = Array.isArray(value) ? value : [value];
    else if (step === 2) this.userProfile.audience   = value;
    else if (step === 3) this.userProfile.count      = parseInt(value, 10) || 10;

    const responses = [
      'Super! 👍',
      'Perfekt!',
      'Verstanden!',
      `${this.userProfile.count} Songs – alles klar! Ich erstelle die Setlist...`,
    ];
    this.botMessage(responses[step] || 'Ok!');
    // Step 3 is the last step – go directly to generation
    if (step === 3) setTimeout(() => this.generateSetlist(), 1200);
    else setTimeout(() => this.showStep(step + 1), 600);
  }

  handleUserInput() {
    const input = document.getElementById('chat-input');
    const text  = input.value.trim();
    if (!text) return;
    this.userMessage(text);
    input.value = '';

    const step = this.userProfile.step;

    // Step 3: count – user typed a custom number
    if (step === 3) {
      const n = parseInt(text, 10);
      if (n > 0 && n <= 100) {
        this.userProfile.count = n;
        const optionsDiv = document.getElementById('options-3');
        if (optionsDiv) { optionsDiv.querySelectorAll('button').forEach(b => b.disabled = true); optionsDiv.style.opacity = '0.5'; }
        input.placeholder = 'Tippe hier...';
        this.botMessage(`${n} Songs – alles klar! Ich erstelle die Setlist...`);
        setTimeout(() => this.generateSetlist(), 1000);
      } else {
        this.botMessage('Bitte eine Zahl zwischen 1 und 100 eingeben.');
      }
    }
  }

  botMessage(text, isTyping = false) {
    const chatMessages = document.getElementById('chat-messages');
    const bubble = document.createElement('div');
    bubble.className = 'message bot-message';
    bubble.innerHTML = isTyping
      ? `<div class="message-content"><div class="bot-icon">🎵</div><div class="bubble typing"><span></span><span></span><span></span></div></div>`
      : `<div class="message-content"><div class="bot-icon">🎵</div><div class="bubble"><p>${text}</p></div></div>`;
    chatMessages.appendChild(bubble);
    this.scrollChat();
    return bubble;
  }

  userMessage(text) {
    const chatMessages = document.getElementById('chat-messages');
    const bubble = document.createElement('div');
    bubble.className = 'message user-message';
    bubble.innerHTML = `<div class="message-content"><div class="bubble"><p>${text}</p></div></div>`;
    chatMessages.appendChild(bubble);
    this.scrollChat();
  }

  scrollChat() {
    const el = document.getElementById('chat-messages');
    el.scrollTop = el.scrollHeight;
  }

  // =====================================================================
  // SETLIST-GENERIERUNG
  // =====================================================================

  generateSetlist() {
    if (this.songs.length === 0) {
      this.botMessage('Keine Songs geladen. Bitte zuerst eine PDF-Setlist hochladen!');
      return;
    }

    const typingBubble = this.botMessage('', true);

    setTimeout(() => {
      typingBubble.remove();
      const scored = this.scoreSongs();
      this.generatedSetlist = this.selectSetlist(scored);

      if (this.generatedSetlist.length === 0) {
        this.botMessage('Keine passenden Songs gefunden. Bitte Stimmung anpassen.');
        return;
      }

      this.renderSetlist();
      this.botMessage(`✅ ${this.generatedSetlist.length} Songs ausgewählt. Viel Spaß!`);

      setTimeout(() => {
        this.botMessage('Neue Setlist generieren?');
        const div = document.createElement('div');
        div.className = 'chat-options';
        div.innerHTML = `
          <button class="option-btn" onclick="app.restart()">🔄 Neue Setlist</button>
          <button class="option-btn" onclick="app.exportSetlist()">📋 Exportieren</button>
        `;
        document.getElementById('chat-messages').appendChild(div);
        this.scrollChat();
      }, 1500);
    }, 1800);
  }

  scoreSongs() {
    return this.songs.map(song => {
      let score = 0;

      // Mood match (genre-enriched mood scores higher)
      this.userProfile.moods.forEach(m => {
        if (song.mood[0] === m) score += 4;       // primary mood
        else if (song.mood.includes(m)) score += 2;
      });

      // Situation match
      this.userProfile.situations.forEach(s => { if (song.situation.includes(s)) score += 2; });

      // Genre bonus: iTunes-enriched songs score slightly higher (better data)
      if (song._genre) score += 0.5;

      // Extras text scan
      if (this.userProfile.extras) {
        const ext = this.userProfile.extras.toLowerCase();
        Object.entries(this.moodKeywords).forEach(([m, kws]) => {
          if (kws.some(k => ext.includes(k)) && song.mood.includes(m)) score += 1;
        });
        if (ext.includes(song.title.toLowerCase())) score += 6;
        if (song.artist && ext.includes(song.artist.toLowerCase())) score += 3;
      }

      // Audience energy fit
      if (this.userProfile.audience === 'gross' && song.energy >= 8) score += 1;
      if (this.userProfile.audience === 'klein' && song.energy <= 5) score += 1;

      score += (Math.random() - 0.5) * 1.5;
      return { song, score };
    });
  }

  // Returns target energy (1–10) for each slot.
  // Arc: opener → build → peak → breather → second wind → emotional → finale
  buildEnergyPlan(count) {
    const plan = [];
    for (let i = 0; i < count; i++) {
      const p = count <= 1 ? 1 : i / (count - 1);
      let e;
      if      (p < 0.08) e = 6;   // opener: punchy but not maximum
      else if (p < 0.25) e = 8;   // build
      else if (p < 0.52) e = 9;   // first peak
      else if (p < 0.62) e = 5;   // mid-set breather
      else if (p < 0.77) e = 8;   // second wind
      else if (p < 0.88) e = 3;   // emotional moment
      else               e = 9;   // big finale
      plan.push(e);
    }
    return plan;
  }

  selectSetlist(scored) {
    const count = Math.max(1, this.userProfile.count || 10);
    scored.sort((a, b) => b.score - a.score);

    // Draw from top candidates to preserve relevance
    const pool    = scored.slice(0, Math.min(scored.length, count * 2 + 10));
    const plan    = this.buildEnergyPlan(count);
    const selected = [];
    const usedIds  = new Set();

    plan.forEach(targetEnergy => {
      let best = null;
      let bestCost = Infinity;
      for (const { song, score } of pool) {
        if (usedIds.has(song.id)) continue;
        // Energy match is primary; score breaks ties within same energy distance
        const cost = Math.abs(song.energy - targetEnergy) * 20 - score;
        if (cost < bestCost) { bestCost = cost; best = song; }
      }
      if (best) { selected.push(best); usedIds.add(best.id); }
    });

    // Fill any remaining slots from full list
    scored.forEach(({ song }) => {
      if (selected.length < count && !usedIds.has(song.id)) {
        selected.push(song);
        usedIds.add(song.id);
      }
    });

    return selected.slice(0, count);
  }

  renderSetlist() {
    const container = document.getElementById('setlist-container');
    const section   = document.getElementById('setlist-section');
    container.innerHTML = '';
    section.style.display = 'block';
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Calculate total duration
    let totalSecs = 0;
    this.generatedSetlist.forEach(s => {
      const parts = (s.duration || '3:30').split(':');
      totalSecs += parseInt(parts[0], 10) * 60 + parseInt(parts[1] || '0', 10);
    });
    const totalMin = Math.floor(totalSecs / 60);
    const totalSec = totalSecs % 60;
    const durationStr = `ca. ${totalMin}:${String(totalSec).padStart(2, '0')} min`;

    const header = document.createElement('div');
    header.className = 'setlist-header';
    header.innerHTML = `
      <h2>Generierte Setlist</h2>
      <p class="setlist-meta">
        ${new Date().toLocaleDateString('de-DE')}
        ${this.userProfile.situations[0] ? ' · ' + this.cap(this.userProfile.situations[0]) : ''}
        ${this.userProfile.moods[0]      ? ' · ' + this.cap(this.userProfile.moods[0])      : ''}
        · ${this.generatedSetlist.length} Songs · ${durationStr}
      </p>`;
    container.appendChild(header);

    this.generatedSetlist.forEach((song, i) => {
      const card = document.createElement('div');
      card.className = 'setlist-card';
      card.style.animationDelay = `${i * 0.07}s`;

      // Equalizer bar heights: arc shape (taller in the middle)
      const EQ_H = [38, 52, 66, 78, 88, 90, 80, 66, 50, 36];
      let bars = '<div class="energy-bars">';
      for (let j = 1; j <= 10; j++) {
        bars += `<div class="energy-bar${j <= song.energy ? ' active' : ''}" style="height:${EQ_H[j-1]}%"></div>`;
      }
      bars += '</div>';
      const dots = `<div class="energy-display">${bars}<small>${song.energy}/10 Energie</small></div>`;

      const keyBadge   = song.key    ? `<span class="song-key">🎵 ${song.key}</span>` : '';
      const genreBadge = song._genre ? `<span class="song-genre">${song._genre}</span>` : '';
      const moodBadge  = song.mood.slice(0, 2).map(m => `<span class="badge">${this.cap(m)}</span>`).join('');

      card.innerHTML = `
        <div class="song-number">${i + 1}</div>
        <div class="song-info">
          <div class="song-title">${song.title}</div>
          <div class="song-artist">${song.artist || ''}</div>
          <div class="song-meta">
            ${keyBadge}
            <span class="song-tempo">♩ ${song.tempo} BPM</span>
            <span class="song-duration">⏱ ${song.duration}</span>
            ${song.singer ? `<span class="song-singer">🎤 ${song.singer}</span>` : ''}
          </div>
          <div class="song-badges">${moodBadge}${genreBadge}</div>
        </div>
        <div class="song-right">
          ${dots}
          <button class="detail-btn" onclick="app.openSongDetail(${song.id})">Details</button>
        </div>`;
      container.appendChild(card);
    });

    const row = document.createElement('div');
    row.className = 'export-row';
    row.innerHTML = `
      <button class="export-btn" onclick="app.exportSetlist()">📋 Als Text exportieren</button>
      <button class="export-btn secondary" onclick="app.restart()">🔄 Neue Setlist</button>`;
    container.appendChild(row);
  }

  // =====================================================================
  // SONG-DETAIL MODAL
  // =====================================================================

  openSongDetail(songId) {
    const song = this.songs.find(s => s.id === songId);
    if (!song) return;

    const hasLyrics = song.lyrics && !song.lyrics.startsWith('(Liedtext für');

    document.getElementById('modal-content').innerHTML = `
      <div class="modal-song-header">
        <h2>${song.title}</h2>
        <p class="modal-artist">${song.artist || ''}</p>
      </div>
      <div class="modal-meta-grid">
        <div class="meta-item"><label>Tonart</label><value>${song.key || '–'}</value></div>
        <div class="meta-item"><label>Tempo</label><value>${song.tempo} BPM</value></div>
        <div class="meta-item"><label>Sänger</label><value>${song.singer || '–'}</value></div>
        <div class="meta-item"><label>Energie</label><value>${song.energy}/10</value></div>
      </div>
      <div class="modal-badges">
        <div><strong>Stimmung:</strong>${song.mood.map(m => `<span class="badge">${this.cap(m)}</span>`).join('')}</div>
        <div><strong>Situation:</strong>${song.situation.map(s => `<span class="badge badge-sit">${this.cap(s)}</span>`).join('')}</div>
        ${song._genre ? `<div><strong>Genre:</strong><span class="badge">${song._genre}</span></div>` : ''}
      </div>
      <div class="modal-lyrics">
        <div class="lyrics-header">
          <h3>🎤 Liedtext</h3>
          <button class="lyrics-reload-btn" onclick="app.fetchLyrics(${songId})">↻ Neu laden</button>
        </div>
        <pre id="lyrics-pre-${songId}">${hasLyrics ? song.lyrics : '⏳ Suche Liedtext...'}</pre>
      </div>`;

    document.getElementById('song-modal').classList.add('open');
    document.body.style.overflow = 'hidden';

    if (!hasLyrics) this.fetchLyrics(songId);
  }

  async fetchLyrics(songId) {
    const song = this.songs.find(s => s.id === songId);
    const pre  = document.getElementById(`lyrics-pre-${songId}`);
    if (!song || !pre) return;

    pre.textContent = '⏳ Suche Liedtext...';

    const artist = (song.artist || '').trim();
    const title  = song.title.trim();

    // 1. lrclib.net exact lookup
    try {
      const res = await fetch(
        `https://lrclib.net/api/get?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(title)}`
      );
      if (res.ok) {
        const data = await res.json();
        const text = data.plainLyrics || data.syncedLyrics;
        if (text && text.trim()) { song.lyrics = text.trim(); pre.textContent = song.lyrics; return; }
      }
    } catch { }

    // 2. lrclib.net free-text search (handles artist name mismatches)
    try {
      const q   = encodeURIComponent(`${title}${artist ? ' ' + artist : ''}`);
      const res = await fetch(`https://lrclib.net/api/search?q=${q}`);
      if (res.ok) {
        const results = await res.json();
        if (Array.isArray(results) && results.length > 0) {
          const text = results[0].plainLyrics || results[0].syncedLyrics;
          if (text && text.trim()) { song.lyrics = text.trim(); pre.textContent = song.lyrics; return; }
        }
      }
    } catch { }

    // 3. lyrics.ovh fallback
    try {
      const a   = encodeURIComponent(artist || 'unknown');
      const t   = encodeURIComponent(title);
      const res = await fetch(`https://api.lyrics.ovh/v1/${a}/${t}`);
      if (res.ok) {
        const data = await res.json();
        if (data.lyrics && data.lyrics.trim()) { song.lyrics = data.lyrics.trim(); pre.textContent = song.lyrics; return; }
      }
    } catch { }

    pre.textContent = `(Kein Liedtext online verfügbar für „${song.title}" – bitte hier einfügen.)`;
  }

  closeModal() {
    document.getElementById('song-modal').classList.remove('open');
    document.body.style.overflow = '';
  }

  // =====================================================================
  // EXPORT & RESET
  // =====================================================================

  exportSetlist() {
    if (this.generatedSetlist.length === 0) { this.showToast('Erst Setlist generieren!'); return; }
    const date = new Date().toLocaleDateString('de-DE');
    let text = `SETLIST – ${this.generatedSetlist.length} Songs\nDatum: ${date}\nAnlass: ${this.userProfile.situations.join(', ')}\nStimmung: ${this.userProfile.moods.join(', ')}\n${'─'.repeat(40)}\n\n`;
    this.generatedSetlist.forEach((s, i) => {
      text += `${i + 1}. ${s.title}`;
      if (s.artist)  text += `  (${s.artist})`;
      if (s._genre)  text += `  [${s._genre}]`;
      text += `\n   Tonart: ${s.key || '–'}  |  ${s.tempo} BPM  |  ${s.duration}  |  Sänger: ${s.singer || '–'}\n\n`;
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    a.download = `Setlist_${date.replace(/\./g, '-')}.txt`;
    a.click();
    this.showToast('Setlist exportiert! 📋');
  }

  restart() {
    this.userProfile = { moods: [], situations: [], audience: '', count: 10, extras: '', step: 0 };
    this.generatedSetlist = [];
    document.getElementById('chat-messages').innerHTML = '';
    document.getElementById('setlist-section').style.display = 'none';
    document.getElementById('chat-input').placeholder = 'Tippe hier...';
    setTimeout(() => {
      this.botMessage('Los geht\'s! 🎵 Was plant ihr für heute?');
      setTimeout(() => this.showStep(0), 800);
    }, 300);
  }

  showToast(message) {
    const t = document.getElementById('toast');
    t.textContent = message;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
  }

  cap(str) { return str.charAt(0).toUpperCase() + str.slice(1); }
}

document.addEventListener('DOMContentLoaded', () => { window.app = new SetlistApp(); });
