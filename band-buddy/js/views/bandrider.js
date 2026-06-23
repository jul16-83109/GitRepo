// ─── Band Rider View ──────────────────────────────────────────────────────────

const BandriderView = (() => {
  const render = () => {
    const rider = BB.load('rider') || { technical: [], hospitality: [], notes: '' };

    App.setContent(`
      <div class="view-header">
        <h1 class="view-title"><span class="view-icon">🎚️</span> Bandrider</h1>
        <div class="header-actions">
          <button class="btn btn-secondary" onclick="BandriderView.exportRider()">⬇️ Export</button>
          <button class="btn btn-primary" onclick="BandriderView.openItemModal()">+ Item</button>
        </div>
      </div>

      <div class="rider-layout">
        <!-- Technical Rider -->
        <div class="rider-section">
          <div class="rider-section-header">
            <span>🔊 Technical Rider</span>
            <span class="rider-progress">${rider.technical.filter(x=>x.checked).length}/${rider.technical.length} ✓</span>
          </div>
          ${renderRiderGroup(rider.technical, 'technical')}
          <button class="btn btn-ghost btn-sm" onclick="BandriderView.openItemModal('technical')">+ Hinzufügen</button>
        </div>

        <!-- Hospitality Rider -->
        <div class="rider-section">
          <div class="rider-section-header">
            <span>🍺 Hospitality Rider</span>
            <span class="rider-progress">${rider.hospitality.filter(x=>x.checked).length}/${rider.hospitality.length} ✓</span>
          </div>
          ${renderRiderGroup(rider.hospitality, 'hospitality')}
          <button class="btn btn-ghost btn-sm" onclick="BandriderView.openItemModal('hospitality')">+ Hinzufügen</button>
        </div>
      </div>

      <!-- Notes -->
      <div class="rider-notes-wrap">
        <div class="sidebar-section-title">📝 Anmerkungen</div>
        <textarea class="input rider-notes" rows="4" placeholder="Allgemeine Anmerkungen zum Rider…"
          onblur="BandriderView.saveNotes(this.value)">${rider.notes||''}</textarea>
      </div>
    `);
  };

  const renderRiderGroup = (items, type) => {
    const groups = {};
    items.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });

    if (!Object.keys(groups).length) return '<p class="empty-hint">Keine Einträge</p>';

    return Object.entries(groups).map(([cat, catItems]) => `
      <div class="rider-category">
        <div class="rider-category-label">${cat}</div>
        ${catItems.map(item => `
          <div class="rider-item${item.checked?' rider-item-checked':''}">
            <label class="rider-check-label">
              <input type="checkbox" ${item.checked?'checked':''}
                onchange="BandriderView.toggleCheck('${type}','${item.id}',this.checked)" />
              <span class="rider-item-text">${item.item}</span>
            </label>
            <div class="rider-item-actions">
              <button class="btn-icon" onclick="BandriderView.openItemModal('${type}','${item.id}')">✏️</button>
              <button class="btn-icon" onclick="BandriderView.deleteItem('${type}','${item.id}')">✕</button>
            </div>
          </div>`).join('')}
      </div>`).join('');
  };

  const toggleCheck = (type, id, checked) => {
    const rider = BB.load('rider') || {};
    rider[type] = (rider[type]||[]).map(x => x.id===id ? {...x, checked} : x);
    BB.save('rider', rider); render();
  };

  const saveNotes = (val) => {
    const rider = BB.load('rider') || {};
    rider.notes = val;
    BB.save('rider', rider);
  };

  const openItemModal = (type='technical', id=null) => {
    const rider = BB.load('rider') || { technical: [], hospitality: [] };
    const item = id ? (rider[type]||[]).find(x=>x.id===id) : null;
    const categories = type==='technical'
      ? ['PA','Monitor','Mikrofon','Instrument','Licht','Backline','Sonstiges']
      : ['Catering','Garderobe','Parken','Sicherheit','Sonstiges'];

    App.openModal(`
      <div class="modal-header-bar">
        <h2>${id ? 'Item bearbeiten' : '+ Neues Item'}</h2>
        <span style="color:var(--text-muted)">${type==='technical'?'🔊 Technical':'🍺 Hospitality'}</span>
      </div>
      <form onsubmit="BandriderView.saveItem(event,'${type}','${id||''}')">
        <div class="form-group">
          <label>Kategorie</label>
          <select name="category" class="input">
            ${categories.map(c=>`<option${item?.category===c?' selected':''}>${c}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Beschreibung</label>
          <input name="item" type="text" class="input" value="${item?.item||''}" placeholder="z.B. 2x SM58 Mikrofon" required />
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="App.closeModal()">Abbrechen</button>
          <button type="submit" class="btn btn-primary">${id ? 'Speichern' : 'Hinzufügen'}</button>
        </div>
      </form>
    `);
  };

  const saveItem = (evt, type, id) => {
    evt.preventDefault();
    const fd = new FormData(evt.target);
    const rider = BB.load('rider') || { technical: [], hospitality: [] };
    const data = { category: fd.get('category'), item: fd.get('item'), checked: false };
    if (id) {
      rider[type] = (rider[type]||[]).map(x => x.id===id ? {...x, ...data} : x);
    } else {
      rider[type] = [...(rider[type]||[]), { id: BB.uid(), ...data }];
    }
    BB.save('rider', rider);
    App.closeModal(); render();
  };

  const deleteItem = (type, id) => {
    if (!confirm('Eintrag löschen?')) return;
    const rider = BB.load('rider') || {};
    rider[type] = (rider[type]||[]).filter(x => x.id!==id);
    BB.save('rider', rider); render();
  };

  const exportRider = () => {
    const rider = BB.load('rider') || { technical: [], hospitality: [], notes: '' };
    const lines = ['# BAND RIDER', ''];
    const section = (title, items) => {
      lines.push(`## ${title}`);
      const groups = {};
      items.forEach(i => { if(!groups[i.category]) groups[i.category]=[]; groups[i.category].push(i); });
      Object.entries(groups).forEach(([cat, its]) => {
        lines.push(`\n### ${cat}`);
        its.forEach(i => lines.push(`- [${i.checked?'x':' '}] ${i.item}`));
      });
      lines.push('');
    };
    section('Technical Rider', rider.technical);
    section('Hospitality Rider', rider.hospitality);
    if (rider.notes) { lines.push('## Anmerkungen'); lines.push(rider.notes); }
    const blob = new Blob([lines.join('\n')], {type:'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'bandrider.txt'; a.click();
  };

  return { render, toggleCheck, saveNotes, openItemModal, saveItem, deleteItem, exportRider };
})();
