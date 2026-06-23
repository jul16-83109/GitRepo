// ─── Setlists View ───────────────────────────────────────────────────────────

const SetlistsView = (() => {
  let activeSetlistId = null;
  let dragSrc = null;

  const KEYS_ALL = ['C','Db','D','Eb','E','F','F#','G','Ab','A','Bb','B',
                    'Cm','Dbm','Dm','Ebm','Em','Fm','F#m','Gm','Abm','Am','Bbm','Bm'];

  const render = () => {
    const setlists = BB.getAll('setlists');
    const songs = BB.getAll('songs');
    if (!activeSetlistId && setlists.length) activeSetlistId = setlists[0].id;

    App.setContent(`
      <div class="view-header">
        <h1 class="view-title"><span class="view-icon">🎵</span> Setlists</h1>
        <div class="header-actions">
          <button class="btn btn-secondary" onclick="SetlistsView.openSongModal()">+ Song</button>
          <button class="btn btn-primary" onclick="SetlistsView.openSetlistModal()">+ Setlist</button>
        </div>
      </div>

      <div class="setlist-layout">
        <!-- Left: Setlist tabs + builder -->
        <div class="setlist-main">
          <div class="setlist-tabs">
            ${setlists.map(sl => `
              <button class="setlist-tab${sl.id===activeSetlistId?' active':''}"
                onclick="SetlistsView.selectSetlist('${sl.id}')">
                ${sl.name}
              </button>`).join('')}
          </div>
          ${activeSetlistId ? renderSetlistBuilder(setlists.find(s=>s.id===activeSetlistId), songs) : '<p class="empty-hint">Keine Setlist vorhanden</p>'}
        </div>

        <!-- Right: Song library -->
        <div class="song-library">
          <div class="sidebar-section-title">Song-Bibliothek</div>
          <input type="text" class="input input-sm search-input" placeholder="Suchen…" oninput="SetlistsView.filterSongs(this.value)" id="song-search" />
          <div id="song-library-list">
            ${renderSongLibrary(songs, activeSetlistId ? setlists.find(s=>s.id===activeSetlistId) : null)}
          </div>
        </div>
      </div>
    `);
  };

  const renderSetlistBuilder = (sl, songs) => {
    if (!sl) return '';
    const items = (sl.songs || []).sort((a,b)=>a.order-b.order);
    const totalBpm = items.reduce((s,i)=>{ const sg=songs.find(x=>x.id===i.song_id); return s+(sg?.bpm||0); },0);
    const avgBpm = items.length ? Math.round(totalBpm/items.length) : 0;

    return `
      <div class="setlist-builder">
        <div class="setlist-builder-header">
          <span class="setlist-stats">${items.length} Songs · Ø ${avgBpm} BPM</span>
          <div class="setlist-builder-actions">
            <button class="btn btn-ghost btn-sm" onclick="SetlistsView.openSetlistModal('${sl.id}')">✏️ Umbenennen</button>
            <button class="btn btn-ghost btn-sm" onclick="SetlistsView.exportSetlist('${sl.id}')">⬇️ Export</button>
            <button class="btn btn-danger btn-sm" onclick="SetlistsView.deleteSetlist('${sl.id}')">🗑️</button>
          </div>
        </div>
        <div class="setlist-songs" id="setlist-drop-zone">
          ${items.map((item, idx) => {
            const sg = songs.find(x=>x.id===item.song_id);
            if (!sg) return '';
            const members = BB.getAll('members');
            const singer = members.find(m=>m.id===sg.singer);
            return `
              <div class="setlist-song-row" draggable="true"
                data-song-id="${item.song_id}" data-order="${item.order}"
                ondragstart="SetlistsView.dragStart(event)"
                ondragover="SetlistsView.dragOver(event)"
                ondrop="SetlistsView.drop(event,'${sl.id}')">
                <span class="drag-handle">⠿</span>
                <span class="song-num">${idx+1}</span>
                <div class="song-row-info">
                  <span class="song-row-title">${sg.title}</span>
                  <span class="song-row-artist">${sg.artist}</span>
                </div>
                <div class="song-row-meta">
                  <span class="tag tag-key">${sg.key}</span>
                  <span class="tag tag-bpm">${sg.bpm} BPM</span>
                  ${singer ? `<span class="tag tag-singer" style="background:${singer.color}22;color:${singer.color}">${singer.name}</span>` : ''}
                </div>
                <button class="btn-icon" onclick="SetlistsView.removeSongFromSetlist('${sl.id}','${item.song_id}')">✕</button>
              </div>`;
          }).join('')}
          ${!items.length ? '<div class="drop-hint">Songs aus der Bibliothek hierher ziehen oder klicken</div>' : ''}
        </div>
      </div>`;
  };

  const renderSongLibrary = (songs, activeSetlist) => {
    const inSetlist = new Set((activeSetlist?.songs||[]).map(x=>x.song_id));
    return songs.map(sg => {
      const members = BB.getAll('members');
      const singer = members.find(m=>m.id===sg.singer);
      const inList = inSetlist.has(sg.id);
      return `
        <div class="lib-song-item${inList?' in-setlist':''}" onclick="SetlistsView.openSongModal('${sg.id}')">
          <div class="lib-song-main">
            <span class="lib-song-title">${sg.title}</span>
            <span class="lib-song-artist">${sg.artist}</span>
          </div>
          <div class="lib-song-tags">
            <span class="tag tag-key">${sg.key}</span>
            <span class="tag tag-bpm">${sg.bpm}</span>
            ${singer ? `<span class="tag tag-singer" style="color:${singer.color}">${singer.name[0]}</span>` : ''}
            ${inList ? '<span class="tag tag-in-list">✓</span>' : ''}
          </div>
          ${activeSetlistId && !inList ? `
            <button class="btn-add-to-list" title="Zur Setlist hinzufügen"
              onclick="event.stopPropagation();SetlistsView.addSongToSetlist('${activeSetlistId}','${sg.id}')">+</button>` : ''}
        </div>`;
    }).join('') || '<p class="empty-hint">Keine Songs</p>';
  };

  const filterSongs = (q) => {
    const songs = BB.getAll('songs').filter(s =>
      s.title.toLowerCase().includes(q.toLowerCase()) ||
      s.artist.toLowerCase().includes(q.toLowerCase())
    );
    const sl = activeSetlistId ? BB.getAll('setlists').find(s=>s.id===activeSetlistId) : null;
    const el = document.getElementById('song-library-list');
    if (el) el.innerHTML = renderSongLibrary(songs, sl);
  };

  const selectSetlist = (id) => { activeSetlistId = id; render(); };

  const addSongToSetlist = (slId, songId) => {
    const sl = BB.getOne('setlists', slId);
    if (!sl) return;
    if (sl.songs.find(x=>x.song_id===songId)) { App.toast('Song bereits in der Setlist'); return; }
    const maxOrder = sl.songs.reduce((m,x)=>Math.max(m,x.order),0);
    BB.update('setlists', slId, { songs: [...sl.songs, { song_id: songId, order: maxOrder+1, notes:'' }] });
    render();
  };

  const removeSongFromSetlist = (slId, songId) => {
    const sl = BB.getOne('setlists', slId);
    if (!sl) return;
    BB.update('setlists', slId, { songs: sl.songs.filter(x=>x.song_id!==songId) });
    render();
  };

  // ── Drag & Drop ──────────────────────────────────────────────────────────
  const dragStart = (evt) => { dragSrc = evt.currentTarget.dataset.songId; evt.currentTarget.classList.add('dragging'); };
  const dragOver = (evt) => { evt.preventDefault(); evt.currentTarget.classList.add('drag-over'); };
  const drop = (evt, slId) => {
    evt.preventDefault();
    const target = evt.currentTarget.closest('[data-song-id]');
    if (!target || !dragSrc || target.dataset.songId === dragSrc) { cleanDrag(); return; }
    const sl = BB.getOne('setlists', slId);
    const songs = sl.songs.sort((a,b)=>a.order-b.order);
    const srcIdx = songs.findIndex(x=>x.song_id===dragSrc);
    const tgtIdx = songs.findIndex(x=>x.song_id===target.dataset.songId);
    const reordered = [...songs];
    const [moved] = reordered.splice(srcIdx,1);
    reordered.splice(tgtIdx,0,moved);
    BB.update('setlists', slId, { songs: reordered.map((s,i)=>({...s,order:i+1})) });
    cleanDrag(); render();
  };
  const cleanDrag = () => {
    document.querySelectorAll('.dragging,.drag-over').forEach(el=>el.classList.remove('dragging','drag-over'));
    dragSrc = null;
  };

  // ── Modals ───────────────────────────────────────────────────────────────
  const openSetlistModal = (id=null) => {
    const sl = id ? BB.getOne('setlists', id) : null;
    App.openModal(`
      <h2>${sl ? 'Setlist umbenennen' : '+ Neue Setlist'}</h2>
      <form onsubmit="SetlistsView.saveSetlist(event,'${id||''}')">
        <div class="form-group">
          <label>Name</label>
          <input name="name" type="text" class="input" value="${sl?.name||''}" placeholder="Setlist-Name" required autofocus />
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="App.closeModal()">Abbrechen</button>
          <button type="submit" class="btn btn-primary">${sl ? 'Speichern' : 'Erstellen'}</button>
        </div>
      </form>
    `);
  };

  const saveSetlist = (evt, id) => {
    evt.preventDefault();
    const name = new FormData(evt.target).get('name');
    if (id) { BB.update('setlists', id, { name }); }
    else { const sl = BB.add('setlists', { name, songs: [], created: new Date().toISOString() }); activeSetlistId = sl.id; }
    App.closeModal(); render();
  };

  const deleteSetlist = (id) => {
    if (!confirm('Setlist löschen?')) return;
    BB.remove('setlists', id);
    activeSetlistId = null;
    render();
  };

  const openSongModal = (id=null) => {
    const sg = id ? BB.getOne('songs', id) : null;
    const members = BB.getAll('members');
    App.openModal(`
      <div class="modal-header-bar">
        <h2>${sg ? 'Song bearbeiten' : '+ Neuer Song'}</h2>
        ${sg ? `<button class="btn btn-danger btn-sm" onclick="SetlistsView.deleteSong('${sg.id}')">Löschen</button>` : ''}
      </div>
      <form onsubmit="SetlistsView.saveSong(event,'${id||''}')">
        <div class="form-grid-2">
          <div class="form-group">
            <label>Titel</label>
            <input name="title" type="text" class="input" value="${sg?.title||''}" required />
          </div>
          <div class="form-group">
            <label>Interpret</label>
            <input name="artist" type="text" class="input" value="${sg?.artist||''}" required />
          </div>
          <div class="form-group">
            <label>Tonart</label>
            <select name="key" class="input">
              ${KEYS_ALL.map(k=>`<option${sg?.key===k?' selected':''}>${k}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Tempo (BPM)</label>
            <input name="bpm" type="number" class="input" value="${sg?.bpm||120}" min="40" max="300" />
          </div>
          <div class="form-group">
            <label>Sänger/in</label>
            <select name="singer" class="input">
              <option value="">— kein Sänger —</option>
              ${members.map(m=>`<option value="${m.id}"${sg?.singer===m.id?' selected':''}>${m.name} (${m.role})</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Tags (kommagetrennt)</label>
            <input name="tags" type="text" class="input" value="${(sg?.tags||[]).join(', ')}" placeholder="rock, opener, crowd…" />
          </div>
        </div>
        <div class="form-group">
          <label>Notizen</label>
          <textarea name="notes" class="input" rows="2">${sg?.notes||''}</textarea>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="App.closeModal()">Abbrechen</button>
          <button type="submit" class="btn btn-primary">${sg ? 'Speichern' : 'Hinzufügen'}</button>
        </div>
      </form>
    `);
  };

  const saveSong = (evt, id) => {
    evt.preventDefault();
    const fd = new FormData(evt.target);
    const data = {
      title: fd.get('title'), artist: fd.get('artist'), key: fd.get('key'),
      bpm: parseInt(fd.get('bpm')||120), singer: fd.get('singer'),
      tags: fd.get('tags').split(',').map(t=>t.trim()).filter(Boolean),
      notes: fd.get('notes'),
    };
    if (id) BB.update('songs', id, data); else BB.add('songs', data);
    App.closeModal(); render();
  };

  const deleteSong = (id) => {
    if (!confirm('Song löschen?')) return;
    BB.remove('songs', id);
    App.closeModal(); render();
  };

  const exportSetlist = (slId) => {
    const sl = BB.getOne('setlists', slId);
    const songs = BB.getAll('songs');
    const lines = [`# ${sl.name}`, ''];
    sl.songs.sort((a,b)=>a.order-b.order).forEach((item,i)=>{
      const sg = songs.find(x=>x.id===item.song_id);
      if (sg) lines.push(`${i+1}. ${sg.title} – ${sg.artist} | ${sg.key} | ${sg.bpm} BPM`);
    });
    const blob = new Blob([lines.join('\n')], {type:'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${sl.name.replace(/\s+/g,'-')}.txt`;
    a.click();
  };

  return { render, selectSetlist, addSongToSetlist, removeSongFromSetlist,
           dragStart, dragOver, drop, filterSongs,
           openSetlistModal, saveSetlist, deleteSetlist,
           openSongModal, saveSong, deleteSong, exportSetlist };
})();
