// ─── Tasks View ───────────────────────────────────────────────────────────────

const TasksView = (() => {
  const STATUS = {
    open:        { label: 'Offen',       color: '#457b9d', icon: '○' },
    in_progress: { label: 'In Arbeit',   color: '#f4a261', icon: '◑' },
    done:        { label: 'Erledigt',    color: '#06d6a0', icon: '●' },
  };

  const render = () => {
    const tasks = BB.getAll('tasks');
    const members = BB.getAll('members');
    const events = BB.getAll('events');
    const songs = BB.getAll('songs');

    const open = tasks.filter(t=>t.status==='open');
    const wip  = tasks.filter(t=>t.status==='in_progress');
    const done = tasks.filter(t=>t.status==='done');

    App.setContent(`
      <div class="view-header">
        <h1 class="view-title"><span class="view-icon">✅</span> Aufgaben</h1>
        <button class="btn btn-primary" onclick="TasksView.openTaskModal()">+ Aufgabe</button>
      </div>

      <div class="tasks-stats-row">
        ${Object.entries(STATUS).map(([k,v])=>{
          const n = tasks.filter(t=>t.status===k).length;
          return `<div class="stat-chip" style="border-color:${v.color}">
            <span class="stat-icon" style="color:${v.color}">${v.icon}</span>
            <span>${v.label}</span>
            <strong>${n}</strong>
          </div>`;
        }).join('')}
      </div>

      <div class="tasks-columns">
        ${Object.entries(STATUS).map(([status, meta]) => {
          const col = tasks.filter(t=>t.status===status);
          return `
            <div class="tasks-col">
              <div class="tasks-col-header" style="color:${meta.color}">
                ${meta.icon} ${meta.label} <span class="kanban-count">${col.length}</span>
              </div>
              ${col.map(t => renderTaskCard(t, members, events, songs)).join('')}
              ${!col.length ? '<div class="kanban-empty">Keine Aufgaben</div>' : ''}
            </div>`;
        }).join('')}
      </div>
    `);
  };

  const renderTaskCard = (t, members, events, songs) => {
    const assignee = members.find(m=>m.id===t.assignee);
    const event = events.find(e=>e.id===t.event_id);
    const song  = songs.find(s=>s.id===t.song_id);
    const overdue = t.due && t.status!=='done' && new Date(t.due) < new Date();
    const dueStr = t.due ? formatDate(t.due) : '';

    return `
      <div class="task-card${overdue?' overdue':''}" onclick="TasksView.openTaskModal('${t.id}')">
        <div class="task-card-title">${t.title}</div>
        ${t.desc ? `<div class="task-card-desc">${t.desc}</div>` : ''}
        <div class="task-card-footer">
          ${assignee ? `<span class="member-avatar member-avatar-xs" style="background:${assignee.color}" title="${assignee.name}">${assignee.name[0]}</span>` : ''}
          ${dueStr ? `<span class="task-due${overdue?' task-due-overdue':''}" title="Fällig">📅 ${dueStr}</span>` : ''}
          ${event ? `<span class="task-ref">🎸 ${event.title}</span>` : ''}
          ${song  ? `<span class="task-ref">🎵 ${song.title}</span>` : ''}
        </div>
        <div class="task-status-btns">
          ${Object.entries(STATUS).map(([k,v])=>`
            <button class="task-status-btn${t.status===k?' active':''}"
              style="${t.status===k?`background:${v.color};color:#0d0d0d`:''}"
              onclick="event.stopPropagation();TasksView.setStatus('${t.id}','${k}')">
              ${v.icon}
            </button>`).join('')}
        </div>
      </div>`;
  };

  const setStatus = (id, status) => { BB.update('tasks', id, { status }); render(); };

  const openTaskModal = (id=null) => {
    const t = id ? BB.getOne('tasks', id) : null;
    const members = BB.getAll('members');
    const events = BB.getAll('events');
    const songs = BB.getAll('songs');

    App.openModal(`
      <div class="modal-header-bar">
        <h2>${t ? 'Aufgabe bearbeiten' : '+ Neue Aufgabe'}</h2>
        ${t ? `<button class="btn btn-danger btn-sm" onclick="TasksView.deleteTask('${t.id}')">Löschen</button>` : ''}
      </div>
      <form onsubmit="TasksView.saveTask(event,'${id||''}')">
        <div class="form-group">
          <label>Titel</label>
          <input name="title" type="text" class="input" value="${t?.title||''}" required />
        </div>
        <div class="form-group">
          <label>Beschreibung</label>
          <textarea name="desc" class="input" rows="2">${t?.desc||''}</textarea>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label>Zugewiesen an</label>
            <select name="assignee" class="input">
              <option value="">— niemand —</option>
              ${members.map(m=>`<option value="${m.id}"${t?.assignee===m.id?' selected':''}>${m.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Fällig am</label>
            <input name="due" type="date" class="input" value="${t?.due||''}" />
          </div>
          <div class="form-group">
            <label>Status</label>
            <select name="status" class="input">
              ${Object.entries(STATUS).map(([k,v])=>`<option value="${k}"${t?.status===k?' selected':''}>${v.icon} ${v.label}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Verknüpfter Termin</label>
            <select name="event_id" class="input">
              <option value="">— kein Termin —</option>
              ${events.map(e=>`<option value="${e.id}"${t?.event_id===e.id?' selected':''}>${e.title}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Verknüpfter Song</label>
            <select name="song_id" class="input">
              <option value="">— kein Song —</option>
              ${songs.map(s=>`<option value="${s.id}"${t?.song_id===s.id?' selected':''}>${s.title}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="App.closeModal()">Abbrechen</button>
          <button type="submit" class="btn btn-primary">${t ? 'Speichern' : 'Erstellen'}</button>
        </div>
      </form>
    `);
  };

  const saveTask = (evt, id) => {
    evt.preventDefault();
    const fd = new FormData(evt.target);
    const data = {
      title: fd.get('title'), desc: fd.get('desc'), assignee: fd.get('assignee'),
      due: fd.get('due'), status: fd.get('status'),
      event_id: fd.get('event_id'), song_id: fd.get('song_id'),
    };
    if (id) BB.update('tasks', id, data); else BB.add('tasks', data);
    App.closeModal(); render();
  };

  const deleteTask = (id) => {
    if (!confirm('Aufgabe löschen?')) return;
    BB.remove('tasks', id);
    App.closeModal(); render();
  };

  const formatDate = (str) => {
    if (!str) return '';
    const [y,m,d] = str.split('-'); return `${d}.${m}.${y}`;
  };

  return { render, openTaskModal, saveTask, deleteTask, setStatus };
})();
