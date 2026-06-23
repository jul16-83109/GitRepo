// ─── Rehearsals / Kanban View ─────────────────────────────────────────────────

const RehearsalsView = (() => {
  const STATUS = {
    red:    { label: 'Backlog',      icon: '🔴', color: '#e63946' },
    yellow: { label: 'In Arbeit',    icon: '🟡', color: '#f4a261' },
    green:  { label: 'Fertig',       icon: '🟢', color: '#06d6a0' },
  };

  const render = () => {
    const items = BB.getAll('rehearsals');
    const songs = BB.getAll('songs');
    const members = BB.getAll('members');

    // Stats
    const counts = { red: 0, yellow: 0, green: 0 };
    items.forEach(i => counts[i.status]++);
    const total = items.length;
    const pct = total ? Math.round((counts.green/total)*100) : 0;

    App.setContent(`
      <div class="view-header">
        <h1 class="view-title"><span class="view-icon">🥁</span> Proben</h1>
        <button class="btn btn-primary" onclick="RehearsalsView.openItemModal()">+ Song hinzufügen</button>
      </div>

      <!-- Progress bar -->
      <div class="rehearsal-progress-wrap">
        <div class="rehearsal-progress-label">
          <span>Probenfortschritt</span>
          <span>${counts.green} / ${total} Songs bereit (${pct}%)</span>
        </div>
        <div class="progress-bar-track">
          <div class="progress-bar-fill" style="width:${pct}%"></div>
        </div>
        <div class="progress-legend">
          ${Object.entries(STATUS).map(([k,v])=>`
            <span class="progress-legend-item">
              ${v.icon} ${v.label}: <strong>${counts[k]}</strong>
            </span>`).join('')}
        </div>
      </div>

      <!-- Kanban board -->
      <div class="kanban-board">
        ${Object.entries(STATUS).map(([status, meta]) => {
          const col = items.filter(i=>i.status===status).sort((a,b)=>a.priority-b.priority);
          return `
            <div class="kanban-col" data-status="${status}"
              ondragover="RehearsalsView.dragOver(event)"
              ondrop="RehearsalsView.drop(event,'${status}')">
              <div class="kanban-col-header" style="border-color:${meta.color}">
                <span>${meta.icon} ${meta.label}</span>
                <span class="kanban-count">${col.length}</span>
              </div>
              <div class="kanban-cards">
                ${col.map(item => renderCard(item, songs, members)).join('')}
                ${!col.length ? `<div class="kanban-empty">Hierher ziehen</div>` : ''}
              </div>
            </div>`;
        }).join('')}
      </div>
    `);
  };

  const renderCard = (item, songs, members) => {
    const sg = songs.find(x=>x.id===item.song_id);
    if (!sg) return '';
    const assignee = members.find(m=>m.id===item.assignee);
    const s = STATUS[item.status];
    return `
      <div class="kanban-card" draggable="true"
        ondragstart="RehearsalsView.dragStart(event,'${item.id}')"
        onclick="RehearsalsView.openItemModal('${item.id}')">
        <div class="kanban-card-top">
          <span class="kanban-song-title">${sg.title}</span>
          <span class="ampel ampel-${item.status}" title="${s.label}">${s.icon}</span>
        </div>
        <div class="kanban-song-artist">${sg.artist}</div>
        <div class="kanban-card-meta">
          <span class="tag tag-key">${sg.key}</span>
          <span class="tag tag-bpm">${sg.bpm}</span>
        </div>
        ${item.comment ? `<div class="kanban-comment">${item.comment}</div>` : ''}
        ${assignee ? `
          <div class="kanban-assignee">
            <span class="member-avatar member-avatar-xs" style="background:${assignee.color}">${assignee.name[0]}</span>
            <span>${assignee.name}</span>
          </div>` : ''}
      </div>`;
  };

  // ── Drag & Drop ──────────────────────────────────────────────────────────
  let dragId = null;
  const dragStart = (evt, id) => { dragId = id; evt.dataTransfer.effectAllowed='move'; };
  const dragOver = (evt) => { evt.preventDefault(); evt.currentTarget.classList.add('drag-over'); };
  const drop = (evt, newStatus) => {
    evt.preventDefault();
    evt.currentTarget.classList.remove('drag-over');
    if (dragId) { BB.update('rehearsals', dragId, { status: newStatus }); dragId = null; render(); }
  };

  // ── Modal ────────────────────────────────────────────────────────────────
  const openItemModal = (id=null) => {
    const item = id ? BB.getOne('rehearsals', id) : null;
    const songs = BB.getAll('songs');
    const members = BB.getAll('members');
    // Songs not yet in backlog (for new items)
    const existingIds = new Set(BB.getAll('rehearsals').map(x=>x.song_id));

    App.openModal(`
      <div class="modal-header-bar">
        <h2>${item ? 'Proben-Eintrag bearbeiten' : '+ Song zum Backlog'}</h2>
        ${item ? `<button class="btn btn-danger btn-sm" onclick="RehearsalsView.deleteItem('${item.id}')">Entfernen</button>` : ''}
      </div>
      <form onsubmit="RehearsalsView.saveItem(event,'${id||''}')">
        <div class="form-group">
          <label>Song</label>
          <select name="song_id" class="input" ${item?'disabled':''}>
            <option value="">— Song wählen —</option>
            ${songs.filter(s => item || !existingIds.has(s.id))
              .map(s=>`<option value="${s.id}"${item?.song_id===s.id?' selected':''}>${s.title} – ${s.artist}</option>`).join('')}
          </select>
          ${item ? `<input type="hidden" name="song_id" value="${item.song_id}" />` : ''}
        </div>
        <div class="form-group">
          <label>Status (Ampel)</label>
          <div class="ampel-picker">
            ${Object.entries(STATUS).map(([k,v])=>`
              <label class="ampel-option">
                <input type="radio" name="status" value="${k}" ${(item?.status||'red')===k?'checked':''} />
                <span class="ampel-btn ampel-${k}">${v.icon} ${v.label}</span>
              </label>`).join('')}
          </div>
        </div>
        <div class="form-group">
          <label>Zugewiesen an</label>
          <select name="assignee" class="input">
            <option value="">— niemand —</option>
            ${members.map(m=>`<option value="${m.id}"${item?.assignee===m.id?' selected':''}>${m.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Kommentar</label>
          <textarea name="comment" class="input" rows="3" placeholder="Wo steht die Band mit diesem Song?">${item?.comment||''}</textarea>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="App.closeModal()">Abbrechen</button>
          <button type="submit" class="btn btn-primary">${item ? 'Speichern' : 'Hinzufügen'}</button>
        </div>
      </form>
    `);
  };

  const saveItem = (evt, id) => {
    evt.preventDefault();
    const fd = new FormData(evt.target);
    const data = {
      song_id: fd.get('song_id'), status: fd.get('status'),
      assignee: fd.get('assignee'), comment: fd.get('comment'),
    };
    if (!data.song_id) { App.toast('Bitte einen Song wählen'); return; }
    if (id) BB.update('rehearsals', id, data);
    else {
      const items = BB.getAll('rehearsals');
      const maxP = items.reduce((m,x)=>Math.max(m,x.priority||0),0);
      BB.add('rehearsals', { ...data, priority: maxP+1 });
    }
    App.closeModal(); render();
  };

  const deleteItem = (id) => {
    if (!confirm('Eintrag entfernen?')) return;
    BB.remove('rehearsals', id);
    App.closeModal(); render();
  };

  return { render, dragStart, dragOver, drop, openItemModal, saveItem, deleteItem };
})();
