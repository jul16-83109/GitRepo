// Fogelwuid Setlist Generator – Haupt-App-Logik

class SetlistApp {
  constructor() {
    this.songs = [...window.SONGS];
    this.moodKeywords = window.MOOD_KEYWORDS;
    this.situationKeywords = window.SITUATION_KEYWORDS;
    this.chatHistory = [];
    this.userProfile = {
      moods: [],
      situations: [],
      audience: '',
      extras: '',
      step: 0
    };
    this.generatedSetlist = [];
    this.pdfParser = new PDFParser((songs) => this.addImportedSongs(songs));
    this.currentSongDetail = null;
    this.init();
  }

  init() {
    this.pdfParser.init();
    this.setupEventListeners();
    this.updateSongCount();

    // Begrüßungsnachricht nach kurzem Delay
    setTimeout(() => {
      this.botMessage("Willkommen beim Fogelwuid Setlist Generator! 🎸");
    }, 400);
    setTimeout(() => {
      this.botMessage("Ich helfe dir, die perfekte Setlist für euren nächsten Auftritt zu erstellen.");
    }, 1200);
    setTimeout(() => {
      this.showStep(0);
    }, 2200);
  }

  setupEventListeners() {
    // Chat-Eingabe
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');

    sendBtn.addEventListener('click', () => this.handleUserInput());
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleUserInput();
      }
    });

    // PDF Upload
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('pdf-input');

    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('drag-over');
    });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) this.handlePDFUpload(file);
    });
    fileInput.addEventListener('change', (e) => {
      if (e.target.files[0]) this.handlePDFUpload(e.target.files[0]);
    });

    // Modal schließen
    document.getElementById('modal-close').addEventListener('click', () => this.closeModal());
    document.getElementById('song-modal').addEventListener('click', (e) => {
      if (e.target === document.getElementById('song-modal')) this.closeModal();
    });
  }

  // =====================================================================
  // CHAT-LOGIK
  // =====================================================================

  showStep(step) {
    this.userProfile.step = step;
    const steps = [
      {
        question: "Für welchen Anlass spielt ihr heute?",
        options: [
          { label: "🎸 Konzert / Gig", value: "konzert" },
          { label: "🎪 Festival / Open Air", value: "festival" },
          { label: "🍺 Bar / Kneipe", value: "bar" },
          { label: "🎉 Party / Geburtstag", value: "party" },
          { label: "💒 Hochzeit", value: "hochzeit" },
          { label: "🌲 Outdoor / Natur", value: "outdoor" }
        ],
        type: 'single'
      },
      {
        question: "Welche Energie wollt ihr erzeugen?",
        options: [
          { label: "⚡ Volle Power – Energie!", value: "energiegeladen" },
          { label: "🎊 Feierlich & Festlich", value: "feierlich" },
          { label: "❤️ Romantisch & Warm", value: "romantisch" },
          { label: "🌿 Entspannt & Chill", value: "entspannt" },
          { label: "🌙 Nachdenklich & Tief", value: "nachdenklich" },
          { label: "🔥 Ausgelassen & Ausgeflippt", value: "ausgelassen" }
        ],
        type: 'multi',
        hint: '(Mehrfachauswahl möglich)'
      },
      {
        question: "Wie groß ist euer Publikum?",
        options: [
          { label: "👥 Klein (unter 50)", value: "klein" },
          { label: "👥👥 Mittel (50–200)", value: "mittel" },
          { label: "🏟️ Groß (über 200)", value: "gross" }
        ],
        type: 'single'
      },
      {
        question: "Gibt es besondere Wünsche oder Themen für heute?",
        type: 'text',
        placeholder: 'z.B. Eröffnungs-Song, kein Ballade, viel Heimat-Gefühl...'
      }
    ];

    if (step >= steps.length) {
      this.generateSetlist();
      return;
    }

    const stepData = steps[step];
    this.renderQuestion(stepData);
  }

  renderQuestion(stepData) {
    const chatMessages = document.getElementById('chat-messages');

    // Bot-Frage-Bubble
    const bubble = document.createElement('div');
    bubble.className = 'message bot-message';

    let html = `<div class="message-content">
      <div class="bot-icon">🎸</div>
      <div class="bubble">
        <p>${stepData.question}</p>
        ${stepData.hint ? `<small class="hint">${stepData.hint}</small>` : ''}
      </div>
    </div>`;
    bubble.innerHTML = html;
    chatMessages.appendChild(bubble);

    // Optionen
    if (stepData.options) {
      const optionsDiv = document.createElement('div');
      optionsDiv.className = `chat-options ${stepData.type === 'multi' ? 'multi-select' : ''}`;
      optionsDiv.id = `options-${this.userProfile.step}`;

      if (stepData.type === 'multi') {
        optionsDiv.dataset.selected = JSON.stringify([]);
        stepData.options.forEach(opt => {
          const btn = document.createElement('button');
          btn.className = 'option-btn';
          btn.dataset.value = opt.value;
          btn.textContent = opt.label;
          btn.addEventListener('click', () => {
            btn.classList.toggle('selected');
            const selected = [...optionsDiv.querySelectorAll('.option-btn.selected')]
              .map(b => b.dataset.value);
            optionsDiv.dataset.selected = JSON.stringify(selected);
          });
          optionsDiv.appendChild(btn);
        });

        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'option-btn confirm-btn';
        confirmBtn.textContent = '✓ Weiter';
        confirmBtn.addEventListener('click', () => {
          const selected = JSON.parse(optionsDiv.dataset.selected);
          if (selected.length === 0) {
            this.showToast('Bitte wähle mindestens eine Option.');
            return;
          }
          this.handleOption(selected, stepData.options
            .filter(o => selected.includes(o.value))
            .map(o => o.label).join(', '));
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

    } else if (stepData.type === 'text') {
      // Text-Input aktivieren
      const input = document.getElementById('chat-input');
      input.placeholder = stepData.placeholder || 'Deine Antwort...';
      input.disabled = false;
      input.focus();
    }

    this.scrollChat();
  }

  handleOption(value, label) {
    const step = this.userProfile.step;

    // User-Bubble
    this.userMessage(label);

    // Optionen deaktivieren
    const optionsDiv = document.getElementById(`options-${step}`);
    if (optionsDiv) {
      optionsDiv.querySelectorAll('button').forEach(b => b.disabled = true);
      optionsDiv.style.opacity = '0.5';
    }

    // Speichern
    if (step === 0) {
      this.userProfile.situations = Array.isArray(value) ? value : [value];
    } else if (step === 1) {
      this.userProfile.moods = Array.isArray(value) ? value : [value];
    } else if (step === 2) {
      this.userProfile.audience = value;
    }

    // Bestätigungs-Antwort
    const responses = [
      "Super! Notiert. 👍",
      "Perfekt, genau das brauche ich!",
      "Verstanden!",
      "Alles klar, ich generiere jetzt eure Setlist..."
    ];
    this.botMessage(responses[step] || "Ok!");

    setTimeout(() => this.showStep(step + 1), 600);
  }

  handleUserInput() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    this.userMessage(text);
    input.value = '';
    input.placeholder = 'Tippe hier...';

    if (this.userProfile.step === 3) {
      this.userProfile.extras = text;
      this.botMessage("Wunderbar! Ich verarbeite alles und erstelle eure Setlist...");
      setTimeout(() => this.generateSetlist(), 1000);
    }
  }

  botMessage(text, isTyping = false) {
    const chatMessages = document.getElementById('chat-messages');
    const bubble = document.createElement('div');
    bubble.className = 'message bot-message';

    if (isTyping) {
      bubble.innerHTML = `
        <div class="message-content">
          <div class="bot-icon">🎸</div>
          <div class="bubble typing">
            <span></span><span></span><span></span>
          </div>
        </div>`;
    } else {
      bubble.innerHTML = `
        <div class="message-content">
          <div class="bot-icon">🎸</div>
          <div class="bubble"><p>${text}</p></div>
        </div>`;
    }

    chatMessages.appendChild(bubble);
    this.scrollChat();
    return bubble;
  }

  userMessage(text) {
    const chatMessages = document.getElementById('chat-messages');
    const bubble = document.createElement('div');
    bubble.className = 'message user-message';
    bubble.innerHTML = `
      <div class="message-content">
        <div class="bubble"><p>${text}</p></div>
      </div>`;
    chatMessages.appendChild(bubble);
    this.scrollChat();
  }

  scrollChat() {
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // =====================================================================
  // SETLIST-GENERIERUNG
  // =====================================================================

  generateSetlist() {
    const typingBubble = this.botMessage('', true);

    setTimeout(() => {
      typingBubble.remove();

      const scored = this.scoreSongs();
      this.generatedSetlist = this.selectSetlist(scored);

      if (this.generatedSetlist.length === 0) {
        this.botMessage("Leider konnten keine passenden Songs gefunden werden. Bitte mehr Songs importieren!");
        return;
      }

      this.renderSetlist();
      this.botMessage(`✅ Ich habe ${this.generatedSetlist.length} Songs für euch ausgewählt. Viel Spaß beim Spielen!`);

      // Neustart-Option
      setTimeout(() => {
        this.botMessage('Möchtest du eine neue Setlist generieren?');
        const restartDiv = document.createElement('div');
        restartDiv.className = 'chat-options';
        restartDiv.innerHTML = `
          <button class="option-btn" onclick="app.restart()">🔄 Neue Setlist generieren</button>
          <button class="option-btn" onclick="app.exportSetlist()">📋 Setlist exportieren</button>
        `;
        document.getElementById('chat-messages').appendChild(restartDiv);
        this.scrollChat();
      }, 1500);
    }, 1800);
  }

  scoreSongs() {
    return this.songs.map(song => {
      let score = 0;
      const profile = this.userProfile;

      // Stimmungs-Match
      profile.moods.forEach(mood => {
        if (song.mood.includes(mood)) score += 3;
      });

      // Situations-Match
      profile.situations.forEach(situation => {
        if (song.situation.includes(situation)) score += 2;
      });

      // Extras aus Freitext
      if (profile.extras) {
        const extrasLower = profile.extras.toLowerCase();

        // Modus prüfen
        Object.entries(this.moodKeywords).forEach(([mood, keywords]) => {
          if (keywords.some(kw => extrasLower.includes(kw))) {
            if (song.mood.includes(mood)) score += 1;
          }
        });

        Object.entries(this.situationKeywords).forEach(([sit, keywords]) => {
          if (keywords.some(kw => extrasLower.includes(kw))) {
            if (song.situation.includes(sit)) score += 1;
          }
        });

        // Direkter Titelabgleich
        if (extrasLower.includes(song.title.toLowerCase())) score += 5;
      }

      // Publikumsgröße → Energie-Anpassung
      if (profile.audience === 'gross' && song.energy >= 8) score += 1;
      if (profile.audience === 'klein' && song.energy <= 5) score += 1;

      // Kleiner Zufallsfaktor für Abwechslung
      score += (Math.random() - 0.5) * 1.5;

      return { song, score };
    });
  }

  selectSetlist(scored) {
    scored.sort((a, b) => b.score - a.score);

    const selected = [];
    const energyBuckets = { low: [], mid: [], high: [] };

    // Gruppiere nach Energie
    scored.forEach(({ song, score }) => {
      if (song.energy <= 4) energyBuckets.low.push({ song, score });
      else if (song.energy <= 7) energyBuckets.mid.push({ song, score });
      else energyBuckets.high.push({ song, score });
    });

    // Wähle top Songs, aber achte auf Abwechslung
    const topScored = scored.slice(0, 20);

    // Versuche sinnvolle Anordnung: Start mittel, steigern, Mitte langsam, Ende stark
    const structure = [
      { bucket: 'mid', fallback: 'high' },
      { bucket: 'high', fallback: 'mid' },
      { bucket: 'high', fallback: 'mid' },
      { bucket: 'low', fallback: 'mid' },
      { bucket: 'high', fallback: 'mid' }
    ];

    const usedIds = new Set();

    structure.forEach(({ bucket, fallback }) => {
      const pool = [...(energyBuckets[bucket].length > 0 ? energyBuckets[bucket] : energyBuckets[fallback])]
        .filter(({ song }) => !usedIds.has(song.id))
        .sort((a, b) => b.score - a.score);

      if (pool.length > 0) {
        selected.push(pool[0].song);
        usedIds.add(pool[0].song.id);
      }
    });

    // Falls nicht genug durch Struktur – fülle mit Top-Scored auf
    if (selected.length < 5) {
      topScored.forEach(({ song }) => {
        if (selected.length < 5 && !usedIds.has(song.id)) {
          selected.push(song);
          usedIds.add(song.id);
        }
      });
    }

    return selected.slice(0, 5);
  }

  renderSetlist() {
    const container = document.getElementById('setlist-container');
    const section = document.getElementById('setlist-section');

    container.innerHTML = '';
    section.style.display = 'block';
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Header
    const header = document.createElement('div');
    header.className = 'setlist-header';
    const situation = this.userProfile.situations[0] || '';
    const mood = this.userProfile.moods[0] || '';
    header.innerHTML = `
      <h2>Eure Setlist</h2>
      <p class="setlist-meta">
        ${new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
        ${situation ? ' · ' + this.capitalizeFirst(situation) : ''}
        ${mood ? ' · ' + this.capitalizeFirst(mood) : ''}
      </p>
    `;
    container.appendChild(header);

    // Songs
    this.generatedSetlist.forEach((song, index) => {
      const card = document.createElement('div');
      card.className = 'setlist-card';
      card.style.animationDelay = `${index * 0.1}s`;

      const energyDots = this.renderEnergyDots(song.energy);
      const moodBadges = song.mood.slice(0, 2).map(m =>
        `<span class="badge">${this.capitalizeFirst(m)}</span>`
      ).join('');

      card.innerHTML = `
        <div class="song-number">${index + 1}</div>
        <div class="song-info">
          <div class="song-title">${song.title}</div>
          <div class="song-meta">
            <span class="song-key">🎵 ${song.key}</span>
            <span class="song-tempo">♩ ${song.tempo} BPM</span>
            <span class="song-duration">⏱ ${song.duration}</span>
          </div>
          <div class="song-badges">${moodBadges}</div>
        </div>
        <div class="song-right">
          <div class="energy-display">${energyDots}</div>
          <button class="detail-btn" onclick="app.openSongDetail(${song.id})">
            Text & Details
          </button>
        </div>
      `;
      container.appendChild(card);
    });

    // Export-Button
    const exportRow = document.createElement('div');
    exportRow.className = 'export-row';
    exportRow.innerHTML = `
      <button class="export-btn" onclick="app.exportSetlist()">📋 Als Text exportieren</button>
      <button class="export-btn secondary" onclick="app.restart()">🔄 Neue Setlist</button>
    `;
    container.appendChild(exportRow);
  }

  renderEnergyDots(energy) {
    let html = '<div class="energy-dots">';
    for (let i = 1; i <= 10; i++) {
      html += `<div class="dot ${i <= energy ? 'active' : ''}"></div>`;
    }
    html += '</div><small>Energie</small>';
    return html;
  }

  // =====================================================================
  // SONG-DETAIL MODAL
  // =====================================================================

  openSongDetail(songId) {
    const song = this.songs.find(s => s.id === songId);
    if (!song) return;

    this.currentSongDetail = song;
    const modal = document.getElementById('song-modal');
    const content = document.getElementById('modal-content');

    const moodBadges = song.mood.map(m =>
      `<span class="badge">${this.capitalizeFirst(m)}</span>`
    ).join('');
    const situationBadges = song.situation.map(s =>
      `<span class="badge badge-sit">${this.capitalizeFirst(s)}</span>`
    ).join('');

    content.innerHTML = `
      <div class="modal-song-header">
        <h2>${song.title}</h2>
        <p class="modal-desc">${song.description || ''}</p>
      </div>

      <div class="modal-meta-grid">
        <div class="meta-item">
          <label>Tonart</label>
          <value>${song.key}</value>
        </div>
        <div class="meta-item">
          <label>Tempo</label>
          <value>${song.tempo} BPM</value>
        </div>
        <div class="meta-item">
          <label>Dauer</label>
          <value>${song.duration}</value>
        </div>
        <div class="meta-item">
          <label>Energie</label>
          <value>${song.energy}/10</value>
        </div>
      </div>

      <div class="modal-badges">
        <div><strong>Stimmung:</strong> ${moodBadges}</div>
        <div><strong>Situation:</strong> ${situationBadges}</div>
      </div>

      <div class="modal-lyrics">
        <h3>🎤 Liedtext</h3>
        <pre>${song.lyrics}</pre>
      </div>
    `;

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    document.getElementById('song-modal').classList.remove('open');
    document.body.style.overflow = '';
  }

  // =====================================================================
  // PDF UPLOAD
  // =====================================================================

  async handlePDFUpload(file) {
    const uploadArea = document.getElementById('upload-area');
    const statusEl = document.getElementById('upload-status');

    uploadArea.classList.add('loading');
    statusEl.textContent = '⏳ PDF wird verarbeitet...';
    statusEl.className = 'upload-status loading';

    try {
      if (!window.pdfjsLib) {
        throw new Error('PDF-Bibliothek lädt noch. Bitte kurz warten und erneut versuchen.');
      }

      await this.pdfParser.init();
      const importedSongs = await this.pdfParser.parseFile(file);

      if (importedSongs.length === 0) {
        throw new Error('Keine Songs in der PDF gefunden. Bitte prüfe das Format.');
      }

      this.addImportedSongs(importedSongs);
      statusEl.textContent = `✅ ${importedSongs.length} Songs importiert aus "${file.name}"`;
      statusEl.className = 'upload-status success';
      this.updateSongCount();
      this.botMessage(`🎵 ${importedSongs.length} Songs aus der PDF importiert! Die Songdatenbank hat jetzt ${this.songs.length} Songs.`);

    } catch (err) {
      statusEl.textContent = `❌ Fehler: ${err.message}`;
      statusEl.className = 'upload-status error';
    } finally {
      uploadArea.classList.remove('loading');
    }
  }

  addImportedSongs(newSongs) {
    // Duplikate vermeiden (nach Titel)
    const existingTitles = new Set(this.songs.map(s => s.title.toLowerCase()));
    const unique = newSongs.filter(s => !existingTitles.has(s.title.toLowerCase()));
    this.songs.push(...unique);
    this.updateSongCount();
  }

  updateSongCount() {
    const el = document.getElementById('song-count');
    if (el) el.textContent = `${this.songs.length} Songs in der Datenbank`;
  }

  // =====================================================================
  // EXPORT
  // =====================================================================

  exportSetlist() {
    if (this.generatedSetlist.length === 0) {
      this.showToast('Erst eine Setlist generieren!');
      return;
    }

    const date = new Date().toLocaleDateString('de-DE');
    let text = `FOGELWUID – SETLIST\n`;
    text += `Datum: ${date}\n`;
    text += `Anlass: ${this.userProfile.situations.join(', ')}\n`;
    text += `Stimmung: ${this.userProfile.moods.join(', ')}\n`;
    text += `${'─'.repeat(40)}\n\n`;

    this.generatedSetlist.forEach((song, i) => {
      text += `${i + 1}. ${song.title}\n`;
      text += `   Tonart: ${song.key}  |  Tempo: ${song.tempo} BPM  |  Dauer: ${song.duration}\n\n`;
    });

    // Download als .txt
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Fogelwuid_Setlist_${date.replace(/\./g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    this.showToast('Setlist exportiert! 📋');
  }

  // =====================================================================
  // HILFSFUNKTIONEN
  // =====================================================================

  restart() {
    this.userProfile = { moods: [], situations: [], audience: '', extras: '', step: 0 };
    this.generatedSetlist = [];

    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = '';

    const section = document.getElementById('setlist-section');
    section.style.display = 'none';

    const input = document.getElementById('chat-input');
    input.placeholder = 'Tippe hier...';

    setTimeout(() => {
      this.botMessage("Los geht's von vorne! 🎸 Was plant ihr für heute?");
      setTimeout(() => this.showStep(0), 800);
    }, 300);
  }

  showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// App starten wenn DOM fertig
document.addEventListener('DOMContentLoaded', () => {
  window.app = new SetlistApp();
});
