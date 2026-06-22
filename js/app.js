class SetlistApp {
  constructor() {
    this.songs = [...window.SONGS];
    this.moodKeywords = window.MOOD_KEYWORDS;
    this.situationKeywords = window.SITUATION_KEYWORDS;
    this.userProfile = { moods: [], situations: [], audience: '', extras: '', step: 0 };
    this.generatedSetlist = [];
    this.pdfParser = new PDFParser((songs) => this.addImportedSongs(songs));
    this.init();
  }

  init() {
    this.pdfParser.init();
    this.setupEventListeners();
    this.updateSongCount();
    setTimeout(() => this.botMessage('Willkommen beim Fogelwuid Setlist Generator! 🎸'), 400);
    setTimeout(() => this.botMessage('Ich helfe dir, die perfekte Setlist für euren nächsten Auftritt zu erstellen.'), 1200);
    setTimeout(() => this.showStep(0), 2200);
  }

  setupEventListeners() {
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    sendBtn.addEventListener('click', () => this.handleUserInput());
    input.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.handleUserInput(); } });
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('pdf-input');
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('drag-over'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
    uploadArea.addEventListener('drop', (e) => { e.preventDefault(); uploadArea.classList.remove('drag-over'); const file = e.dataTransfer.files[0]; if (file) this.handlePDFUpload(file); });
    fileInput.addEventListener('change', (e) => { if (e.target.files[0]) this.handlePDFUpload(e.target.files[0]); });
    document.getElementById('modal-close').addEventListener('click', () => this.closeModal());
    document.getElementById('song-modal').addEventListener('click', (e) => { if (e.target === document.getElementById('song-modal')) this.closeModal(); });
  }

  showStep(step) {
    this.userProfile.step = step;
    const steps = [
      { question: 'Für welchen Anlass spielt ihr heute?', options: [{label:'🎸 Konzert / Gig',value:'konzert'},{label:'🎪 Festival / Open Air',value:'festival'},{label:'🍺 Bar / Kneipe',value:'bar'},{label:'🎉 Party / Geburtstag',value:'party'},{label:'💒 Hochzeit',value:'hochzeit'},{label:'🌲 Outdoor / Natur',value:'outdoor'}], type:'single' },
      { question: 'Welche Energie wollt ihr erzeugen?', options: [{label:'⚡ Volle Power – Energie!',value:'energiegeladen'},{label:'🎊 Feierlich & Festlich',value:'feierlich'},{label:'❤️ Romantisch & Warm',value:'romantisch'},{label:'🌿 Entspannt & Chill',value:'entspannt'},{label:'🌙 Nachdenklich & Tief',value:'nachdenklich'},{label:'🔥 Ausgelassen & Ausgeflippt',value:'ausgelassen'}], type:'multi', hint:'(Mehrfachauswahl möglich)' },
      { question: 'Wie groß ist euer Publikum?', options: [{label:'👥 Klein (unter 50)',value:'klein'},{label:'👥👥 Mittel (50–200)',value:'mittel'},{label:'🏟️ Groß (über 200)',value:'gross'}], type:'single' },
      { question: 'Gibt es besondere Wünsche oder Themen für heute?', type:'text', placeholder:'z.B. Eröffnungs-Song, keine Ballade, viel Heimat-Gefühl...' }
    ];
    if (step >= steps.length) { this.generateSetlist(); return; }
    this.renderQuestion(steps[step]);
  }

  renderQuestion(stepData) {
    const chatMessages = document.getElementById('chat-messages');
    const bubble = document.createElement('div');
    bubble.className = 'message bot-message';
    bubble.innerHTML = `<div class="message-content"><div class="bot-icon">🎸</div><div class="bubble"><p>${stepData.question}</p>${stepData.hint ? `<small class="hint">${stepData.hint}</small>` : ''}</div></div>`;
    chatMessages.appendChild(bubble);
    if (stepData.options) {
      const optionsDiv = document.createElement('div');
      optionsDiv.className = `chat-options${stepData.type === 'multi' ? ' multi-select' : ''}`;
      optionsDiv.id = `options-${this.userProfile.step}`;
      if (stepData.type === 'multi') {
        optionsDiv.dataset.selected = JSON.stringify([]);
        stepData.options.forEach(opt => {
          const btn = document.createElement('button');
          btn.className = 'option-btn'; btn.dataset.value = opt.value; btn.textContent = opt.label;
          btn.addEventListener('click', () => { btn.classList.toggle('selected'); optionsDiv.dataset.selected = JSON.stringify([...optionsDiv.querySelectorAll('.option-btn.selected')].map(b => b.dataset.value)); });
          optionsDiv.appendChild(btn);
        });
        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'option-btn confirm-btn'; confirmBtn.textContent = '✓ Weiter';
        confirmBtn.addEventListener('click', () => { const selected = JSON.parse(optionsDiv.dataset.selected); if (selected.length === 0) { this.showToast('Bitte wähle mindestens eine Option.'); return; } this.handleOption(selected, stepData.options.filter(o => selected.includes(o.value)).map(o => o.label).join(', ')); });
        optionsDiv.appendChild(confirmBtn);
      } else {
        stepData.options.forEach(opt => { const btn = document.createElement('button'); btn.className = 'option-btn'; btn.textContent = opt.label; btn.addEventListener('click', () => this.handleOption(opt.value, opt.label)); optionsDiv.appendChild(btn); });
      }
      chatMessages.appendChild(optionsDiv);
    } else if (stepData.type === 'text') {
      const input = document.getElementById('chat-input');
      input.placeholder = stepData.placeholder || 'Deine Antwort...';
      input.disabled = false; input.focus();
    }
    this.scrollChat();
  }

  handleOption(value, label) {
    const step = this.userProfile.step;
    this.userMessage(label);
    const optionsDiv = document.getElementById(`options-${step}`);
    if (optionsDiv) { optionsDiv.querySelectorAll('button').forEach(b => b.disabled = true); optionsDiv.style.opacity = '0.5'; }
    if (step === 0) this.userProfile.situations = Array.isArray(value) ? value : [value];
    else if (step === 1) this.userProfile.moods = Array.isArray(value) ? value : [value];
    else if (step === 2) this.userProfile.audience = value;
    this.botMessage(['Super! Notiert. 👍', 'Perfekt, genau das brauche ich!', 'Verstanden!', 'Alles klar, ich generiere jetzt eure Setlist...'][step] || 'Ok!');
    setTimeout(() => this.showStep(step + 1), 600);
  }

  handleUserInput() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;
    this.userMessage(text);
    input.value = ''; input.placeholder = 'Tippe hier...';
    if (this.userProfile.step === 3) { this.userProfile.extras = text; this.botMessage('Wunderbar! Ich verarbeite alles und erstelle eure Setlist...'); setTimeout(() => this.generateSetlist(), 1000); }
  }

  botMessage(text, isTyping = false) {
    const chatMessages = document.getElementById('chat-messages');
    const bubble = document.createElement('div');
    bubble.className = 'message bot-message';
    bubble.innerHTML = isTyping
      ? `<div class="message-content"><div class="bot-icon">🎸</div><div class="bubble typing"><span></span><span></span><span></span></div></div>`
      : `<div class="message-content"><div class="bot-icon">🎸</div><div class="bubble"><p>${text}</p></div></div>`;
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

  scrollChat() { const el = document.getElementById('chat-messages'); el.scrollTop = el.scrollHeight; }

  generateSetlist() {
    const typingBubble = this.botMessage('', true);
    setTimeout(() => {
      typingBubble.remove();
      const scored = this.scoreSongs();
      this.generatedSetlist = this.selectSetlist(scored);
      if (this.generatedSetlist.length === 0) { this.botMessage('Leider keine passenden Songs gefunden. Bitte mehr Songs importieren!'); return; }
      this.renderSetlist();
      this.botMessage(`✅ Ich habe ${this.generatedSetlist.length} Songs für euch ausgewählt. Viel Spaß beim Spielen!`);
      setTimeout(() => {
        this.botMessage('Möchtest du eine neue Setlist generieren?');
        const div = document.createElement('div'); div.className = 'chat-options';
        div.innerHTML = `<button class="option-btn" onclick="app.restart()">🔄 Neue Setlist</button><button class="option-btn" onclick="app.exportSetlist()">📋 Exportieren</button>`;
        document.getElementById('chat-messages').appendChild(div); this.scrollChat();
      }, 1500);
    }, 1800);
  }

  scoreSongs() {
    return this.songs.map(song => {
      let score = 0;
      this.userProfile.moods.forEach(m => { if (song.mood.includes(m)) score += 3; });
      this.userProfile.situations.forEach(s => { if (song.situation.includes(s)) score += 2; });
      if (this.userProfile.extras) {
        const ext = this.userProfile.extras.toLowerCase();
        Object.entries(this.moodKeywords).forEach(([m, kws]) => { if (kws.some(k => ext.includes(k)) && song.mood.includes(m)) score += 1; });
        Object.entries(this.situationKeywords).forEach(([s, kws]) => { if (kws.some(k => ext.includes(k)) && song.situation.includes(s)) score += 1; });
        if (ext.includes(song.title.toLowerCase())) score += 5;
      }
      if (this.userProfile.audience === 'gross' && song.energy >= 8) score += 1;
      if (this.userProfile.audience === 'klein' && song.energy <= 5) score += 1;
      score += (Math.random() - 0.5) * 1.5;
      return { song, score };
    });
  }

  selectSetlist(scored) {
    scored.sort((a, b) => b.score - a.score);
    const buckets = { low: [], mid: [], high: [] };
    scored.forEach(({ song, score }) => {
      if (song.energy <= 4) buckets.low.push({ song, score });
      else if (song.energy <= 7) buckets.mid.push({ song, score });
      else buckets.high.push({ song, score });
    });
    const structure = [{b:'mid',f:'high'},{b:'high',f:'mid'},{b:'high',f:'mid'},{b:'low',f:'mid'},{b:'high',f:'mid'}];
    const selected = []; const usedIds = new Set();
    structure.forEach(({ b, f }) => {
      const pool = [...(buckets[b].length > 0 ? buckets[b] : buckets[f])].filter(({ song }) => !usedIds.has(song.id)).sort((a, b) => b.score - a.score);
      if (pool.length > 0) { selected.push(pool[0].song); usedIds.add(pool[0].song.id); }
    });
    if (selected.length < 5) scored.forEach(({ song }) => { if (selected.length < 5 && !usedIds.has(song.id)) { selected.push(song); usedIds.add(song.id); } });
    return selected.slice(0, 5);
  }

  renderSetlist() {
    const container = document.getElementById('setlist-container');
    const section = document.getElementById('setlist-section');
    container.innerHTML = '';
    section.style.display = 'block';
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const header = document.createElement('div'); header.className = 'setlist-header';
    header.innerHTML = `<h2>Eure Setlist</h2><p class="setlist-meta">${new Date().toLocaleDateString('de-DE')}${this.userProfile.situations[0] ? ' · ' + this.cap(this.userProfile.situations[0]) : ''}${this.userProfile.moods[0] ? ' · ' + this.cap(this.userProfile.moods[0]) : ''}</p>`;
    container.appendChild(header);
    this.generatedSetlist.forEach((song, i) => {
      const card = document.createElement('div'); card.className = 'setlist-card'; card.style.animationDelay = `${i * 0.1}s`;
      let dots = '<div class="energy-dots">';
      for (let j = 1; j <= 10; j++) dots += `<div class="dot${j <= song.energy ? ' active' : ''}"></div>`;
      dots += '</div><small>Energie</small>';
      card.innerHTML = `<div class="song-number">${i+1}</div><div class="song-info"><div class="song-title">${song.title}</div><div class="song-meta"><span class="song-key">🎵 ${song.key}</span><span class="song-tempo">♩ ${song.tempo} BPM</span><span class="song-duration">⏱ ${song.duration}</span></div><div class="song-badges">${song.mood.slice(0,2).map(m=>`<span class="badge">${this.cap(m)}</span>`).join('')}</div></div><div class="song-right"><div class="energy-display">${dots}</div><button class="detail-btn" onclick="app.openSongDetail(${song.id})">Text & Details</button></div>`;
      container.appendChild(card);
    });
    const row = document.createElement('div'); row.className = 'export-row';
    row.innerHTML = `<button class="export-btn" onclick="app.exportSetlist()">📋 Als Text exportieren</button><button class="export-btn secondary" onclick="app.restart()">🔄 Neue Setlist</button>`;
    container.appendChild(row);
  }

  openSongDetail(songId) {
    const song = this.songs.find(s => s.id === songId);
    if (!song) return;
    const modal = document.getElementById('song-modal');
    document.getElementById('modal-content').innerHTML = `<div class="modal-song-header"><h2>${song.title}</h2><p class="modal-desc">${song.description||''}</p></div><div class="modal-meta-grid"><div class="meta-item"><label>Tonart</label><value>${song.key}</value></div><div class="meta-item"><label>Tempo</label><value>${song.tempo} BPM</value></div><div class="meta-item"><label>Dauer</label><value>${song.duration}</value></div><div class="meta-item"><label>Energie</label><value>${song.energy}/10</value></div></div><div class="modal-badges"><div><strong>Stimmung:</strong>${song.mood.map(m=>`<span class="badge">${this.cap(m)}</span>`).join('')}</div><div><strong>Situation:</strong>${song.situation.map(s=>`<span class="badge badge-sit">${this.cap(s)}</span>`).join('')}</div></div><div class="modal-lyrics"><h3>🎤 Liedtext</h3><pre>${song.lyrics}</pre></div>`;
    modal.classList.add('open'); document.body.style.overflow = 'hidden';
  }

  closeModal() { document.getElementById('song-modal').classList.remove('open'); document.body.style.overflow = ''; }

  async handlePDFUpload(file) {
    const uploadArea = document.getElementById('upload-area');
    const statusEl = document.getElementById('upload-status');
    uploadArea.classList.add('loading'); statusEl.textContent = '⏳ PDF wird verarbeitet...'; statusEl.className = 'upload-status loading';
    try {
      if (!window.pdfjsLib) throw new Error('PDF-Bibliothek lädt noch. Bitte kurz warten.');
      await this.pdfParser.init();
      const importedSongs = await this.pdfParser.parseFile(file);
      if (importedSongs.length === 0) throw new Error('Keine Songs gefunden. Bitte Format prüfen.');
      this.addImportedSongs(importedSongs);
      statusEl.textContent = `✅ ${importedSongs.length} Songs importiert aus "${file.name}"`; statusEl.className = 'upload-status success';
      this.botMessage(`🎵 ${importedSongs.length} Songs importiert! Datenbank: ${this.songs.length} Songs.`);
    } catch (err) { statusEl.textContent = `❌ Fehler: ${err.message}`; statusEl.className = 'upload-status error'; }
    finally { uploadArea.classList.remove('loading'); }
  }

  addImportedSongs(newSongs) {
    const existing = new Set(this.songs.map(s => s.title.toLowerCase()));
    this.songs.push(...newSongs.filter(s => !existing.has(s.title.toLowerCase())));
    this.updateSongCount();
  }

  updateSongCount() { const el = document.getElementById('song-count'); if (el) el.textContent = `${this.songs.length} Songs in der Datenbank`; }

  exportSetlist() {
    if (this.generatedSetlist.length === 0) { this.showToast('Erst eine Setlist generieren!'); return; }
    const date = new Date().toLocaleDateString('de-DE');
    let text = `FOGELWUID – SETLIST\nDatum: ${date}\nAnlass: ${this.userProfile.situations.join(', ')}\nStimmung: ${this.userProfile.moods.join(', ')}\n${'─'.repeat(40)}\n\n`;
    this.generatedSetlist.forEach((s, i) => { text += `${i+1}. ${s.title}\n   Tonart: ${s.key}  |  Tempo: ${s.tempo} BPM  |  Dauer: ${s.duration}\n\n`; });
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], {type:'text/plain;charset=utf-8'}));
    a.download = `Fogelwuid_Setlist_${date.replace(/\./g,'-')}.txt`; a.click();
    this.showToast('Setlist exportiert! 📋');
  }

  restart() {
    this.userProfile = { moods: [], situations: [], audience: '', extras: '', step: 0 };
    this.generatedSetlist = [];
    document.getElementById('chat-messages').innerHTML = '';
    document.getElementById('setlist-section').style.display = 'none';
    document.getElementById('chat-input').placeholder = 'Tippe hier...';
    setTimeout(() => { this.botMessage("Los geht's von vorne! 🎸 Was plant ihr für heute?"); setTimeout(() => this.showStep(0), 800); }, 300);
  }

  showToast(message) { const t = document.getElementById('toast'); t.textContent = message; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 3000); }
  cap(str) { return str.charAt(0).toUpperCase() + str.slice(1); }
}

document.addEventListener('DOMContentLoaded', () => { window.app = new SetlistApp(); });