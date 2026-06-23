// ─── Calendar View ────────────────────────────────────────────────────────────

const CalendarView = (() => {
  let currentYear, currentMonth;

  const TYPE_ICONS = { gig: '🎸', probe: '🥁', sonstig: '📋' };
  const TYPE_LABELS = { gig: 'Auftritt', probe: 'Probe', sonstig: 'Sonstiges' };
  const TYPE_COLORS = { gig: '#e63946', probe: '#f4a261', sonstig: '#457b9d' };
  const VOTE_LABELS = { yes: '✓ Kann', no: '✗ Kann nicht', maybe: '? Vielleicht' };
  const VOTE_COLORS = { yes: '#06d6a0', no: '#e63946', maybe: '#f4a261' };

  const render = () => {
    const now = new Date();
    if (!currentYear) { currentYear = now.getFullYear(); currentMonth = now.getMonth(); }

    const events = BB.getAll('events').sort((a,b) => a.date.localeCompare(b.date));
    const members = BB.getAll('members');

    App.setContent(`
      <div class="view-header">
        <h1 class="view-title"><span class="view-icon">📅</span> Bandkalender</h1>
        <button class="btn btn-primary" onclick="CalendarView.openEventModal()">+ Termin</button>
      </div>

      <div class="calendar-layout">
        <div class="calendar-grid-wrap">
          ${renderMonthGrid(events)}
        </div>
        <div class="events-sidebar">
          <div class="sidebar-section-title">Kommende Termine</div>
          ${events.filter(e => e.date >= new Date().toISOString().split('T')[0])
            .slice(0,8).map(e => renderEventCard(e, members)).join('') || '<p class="empty-hint">Keine Termine</p>'}
        </div>
      </div>
    `);
  };

  const renderMonthGrid = (events) => {
    const MONTHS = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
    const DAYS = ['Mo','Di','Mi','Do','Fr','Sa','So'];
    const first = new Date(currentYear, currentMonth, 1);
    const daysInMonth = new Date(currentYear, currentMonth+1, 0).getDate();
    let startDow = first.getDay(); // 0=Sun
    startDow = startDow === 0 ? 6 : startDow - 1; // convert to Mon=0

    const today = new Date().toISOString().split('T')[0];
    const eventsByDate = {};
    events.forEach(e => {
      if (!eventsByDate[e.date]) eventsByDate[e.date] = [];
      eventsByDate[e.date].push(e);
    });

    let cells = '';
    for (let i = 0; i < startDow; i++) cells += '<div class="cal-cell cal-empty"></div>';
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const dayEvents = eventsByDate[dateStr] || [];
      const isToday = dateStr === today;
      cells += `
        <div class="cal-cell${isToday ? ' cal-today' : ''}${dayEvents.length ? ' cal-has-events' : ''}" onclick="CalendarView.showDay('${dateStr}')">
          <span class="cal-day-num">${d}</span>
          <div class="cal-dots">
            ${dayEvents.slice(0,3).map(e => `<span class="cal-dot" style="background:${TYPE_COLORS[e.type]}" title="${e.title}"></span>`).join('')}
          </div>
        </div>`;
    }

    return `
      <div class="cal-nav">
        <button class="btn btn-ghost" onclick="CalendarView.prevMonth()">‹</button>
        <span class="cal-month-label">${MONTHS[currentMonth]} ${currentYear}</span>
        <button class="btn btn-ghost" onclick="CalendarView.nextMonth()">›</button>
      </div>
      <div class="cal-grid">
        ${DAYS.map(d => `<div class="cal-header-cell">${d}</div>`).join('')}
        ${cells}
      </div>
      <div class="cal-legend">
        ${Object.entries(TYPE_LABELS).map(([k,v]) => `<span><span class="cal-dot" style="background:${TYPE_COLORS[k]}"></span>${v}</span>`).join('')}
      </div>`;
  };

  const renderEventCard = (e, members) => {
    const votes = e.votes || {};
    const yes = Object.values(votes).filter(v=>v==='yes').length;
    const no = Object.values(votes).filter(v=>v==='no').length;
    const maybe = Object.values(votes).filter(v=>v==='maybe').length;
    const songs = BB.getAll('songs');
    const wishSongs = (e.wishlist_songs||[]).map(id => songs.find(s=>s.id===id)?.title || id).join(', ');

    return `
      <div class="event-card event-type-${e.type}" onclick="CalendarView.openEventModal('${e.id}')">
        <div class="event-card-header">
          <span class="event-type-badge">${TYPE_ICONS[e.type]} ${TYPE_LABELS[e.type]}</span>
          <span class="event-date">${formatDate(e.date)} ${e.time||''}</span>
        </div>
        <div class="event-card-title">${e.title}</div>
        ${e.location ? `<div class="event-meta">📍 ${e.location}</div>` : ''}
        ${wishSongs ? `<div class="event-meta">🎵 ${wishSongs}</div>` : ''}
        <div class="vote-summary">
          <span class="vote-chip yes">✓ ${yes}</span>
          <span class="vote-chip maybe">? ${maybe}</span>
          <span class="vote-chip no">✗ ${no}</span>
          <span class="vote-total">${members.length - Object.keys(votes).length} ausstehend</span>
        </div>
      </div>`;
  };

  const showDay = (dateStr) => {
    const events = BB.getAll('events').filter(e => e.date === dateStr);
    if (!events.length) { openEventModal(null, dateStr); return; }
    if (events.length === 1) { openEventModal(events[0].id); return; }
    // multiple — show picker (just open first for now)
    openEventModal(events[0].id);
  };

  const prevMonth = () => {
    currentMonth--; if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    render();
  };

  const nextMonth = () => {
    currentMonth++; if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    render();
  };

  const openEventModal = (id=null, prefillDate=null) => {
    const e = id ? BB.getOne('events', id) : null;
    const members = BB.getAll('members');
    const songs = BB.getAll('songs');
    const votes = e?.votes || {};
    const wishlist = e?.wishlist_songs || [];

    const isNew = !e;
    App.openModal(`
      <div class="modal-header-bar">
        <h2>${isNew ? '+ Neuer Termin' : 'Termin bearbeiten'}</h2>
        ${!isNew ? `<button class="btn btn-danger btn-sm" onclick="CalendarView.deleteEvent('${e.id}')">Löschen</button>` : ''}
      </div>
      <form id="event-form" onsubmit="CalendarView.saveEvent(event, '${id||''}')">
        <div class="form-grid-2">
          <div class="form-group">
            <label>Typ</label>
            <select name="type" class="input">
              ${Object.entries(TYPE_LABELS).map(([k,v]) => `<option value="${k}"${e?.type===k?' selected':''}>${TYPE_ICONS[k]} ${v}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Datum</label>
            <input name="date" type="date" class="input" value="${e?.date||prefillDate||''}" required />
          </div>
          <div class="form-group">
            <label>Uhrzeit</label>
            <input name="time" type="time" class="input" value="${e?.time||''}" />
          </div>
          <div class="form-group">
            <label>Titel</label>
            <input name="title" type="text" class="input" value="${e?.title||''}" placeholder="Titel" required />
          </div>
          <div class="form-group">
            <label>Location</label>
            <input name="location" type="text" class="input" value="${e?.location||''}" placeholder="Veranstaltungsort" />
          </div>
          <div class="form-group">
            <label>Treffpunkt</label>
            <input name="meeting_point" type="text" class="input" value="${e?.meeting_point||''}" placeholder="z.B. Backstage 19:30" />
          </div>
          <div class="form-group">
            <label>Dresscode</label>
            <input name="dresscode" type="text" class="input" value="${e?.dresscode||''}" placeholder="z.B. Schwarz / Band-Shirts" />
          </div>
        </div>
        <div class="form-group">
          <label>Wunschtitel (Probenbacklog)</label>
          <div class="song-checklist">
            ${songs.map(s => `
              <label class="song-check-item">
                <input type="checkbox" name="wishlist" value="${s.id}" ${wishlist.includes(s.id)?'checked':''} />
                <span>${s.title} – ${s.artist}</span>
              </label>`).join('')}
          </div>
        </div>
        <div class="form-group">
          <label>Kommentar</label>
          <textarea name="comment" class="input" rows="2" placeholder="Notizen...">${e?.comment||''}</textarea>
        </div>

        ${!isNew ? `
        <div class="vote-section">
          <div class="vote-section-title">Verfügbarkeit</div>
          <div class="vote-grid">
            ${members.map(m => `
              <div class="vote-member-row">
                <span class="member-avatar" style="background:${m.color}">${m.name[0]}</span>
                <span class="member-name-small">${m.name}</span>
                <div class="vote-btns">
                  ${['yes','maybe','no'].map(v => `
                    <button type="button" class="vote-btn vote-${v}${votes[m.id]===v?' active':''}"
                      onclick="CalendarView.castVote('${e.id}','${m.id}','${v}')">
                      ${v==='yes'?'✓':v==='no'?'✗':'?'}
                    </button>`).join('')}
                </div>
              </div>`).join('')}
          </div>
        </div>` : ''}

        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="App.closeModal()">Abbrechen</button>
          <button type="submit" class="btn btn-primary">${isNew ? 'Erstellen' : 'Speichern'}</button>
        </div>
      </form>
    `);
  };

  const saveEvent = (evt, id) => {
    evt.preventDefault();
    const fd = new FormData(evt.target);
    const wishlist = [...evt.target.querySelectorAll('[name=wishlist]:checked')].map(x=>x.value);
    const data = {
      type: fd.get('type'), title: fd.get('title'), date: fd.get('date'),
      time: fd.get('time'), location: fd.get('location'), meeting_point: fd.get('meeting_point'),
      dresscode: fd.get('dresscode'), comment: fd.get('comment'), wishlist_songs: wishlist,
    };
    if (id) { BB.update('events', id, data); }
    else { BB.add('events', { ...data, votes: {} }); }
    App.closeModal(); render();
  };

  const castVote = (eventId, memberId, vote) => {
    const e = BB.getOne('events', eventId);
    if (!e) return;
    const votes = { ...e.votes, [memberId]: vote };
    BB.update('events', eventId, { votes });
    // refresh vote section in modal
    openEventModal(eventId);
  };

  const deleteEvent = (id) => {
    if (!confirm('Termin wirklich löschen?')) return;
    BB.remove('events', id);
    App.closeModal(); render();
  };

  const formatDate = (str) => {
    if (!str) return '';
    const [y,m,d] = str.split('-');
    return `${d}.${m}.${y}`;
  };

  return { render, prevMonth, nextMonth, showDay, openEventModal, saveEvent, castVote, deleteEvent };
})();
