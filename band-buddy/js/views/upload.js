// ─── Steuerupload View ────────────────────────────────────────────────────────

const UploadView = (() => {
  const CATEGORIES = ['Honorarrechnung','Ausgabenbeleg','Vertrag','Genehmigung','Sonstiges'];

  const render = () => {
    const uploads = BB.getAll('uploads') || [];

    App.setContent(`
      <div class="view-header">
        <h1 class="view-title"><span class="view-icon">📁</span> Steuerupload</h1>
      </div>

      <div class="upload-layout">
        <div class="upload-drop-area" id="upload-drop" ondragover="UploadView.dragOver(event)" ondrop="UploadView.dropFile(event)">
          <div class="upload-drop-icon">📂</div>
          <div class="upload-drop-label">Dateien hier ablegen</div>
          <div class="upload-drop-sub">oder</div>
          <label class="btn btn-primary" style="cursor:pointer">
            Dateien auswählen
            <input type="file" multiple style="display:none" onchange="UploadView.handleFiles(this.files)" />
          </label>
          <div class="upload-drop-hint">PDF, JPEG, PNG, XLSX – max. 10 MB pro Datei</div>
        </div>

        <div class="upload-list-wrap">
          <div class="sidebar-section-title">Hochgeladene Dokumente (${uploads.length})</div>
          ${uploads.length ? `
            <div class="upload-filter-row">
              <select class="input input-sm" onchange="UploadView.filterByCategory(this.value)">
                <option value="">Alle Kategorien</option>
                ${CATEGORIES.map(c=>`<option>${c}</option>`).join('')}
              </select>
            </div>
            <div class="upload-list" id="upload-list">
              ${renderUploadList(uploads)}
            </div>` : '<p class="empty-hint">Noch keine Dokumente hochgeladen</p>'}
        </div>
      </div>

      <div class="upload-info-cards">
        <div class="info-card">
          <div class="info-card-icon">💡</div>
          <div class="info-card-title">Honorarrechnungen</div>
          <div class="info-card-text">Rechnungen für Auftritte, Steuernummer und USt-ID nicht vergessen.</div>
        </div>
        <div class="info-card">
          <div class="info-card-icon">🧾</div>
          <div class="info-card-title">Ausgabenbelege</div>
          <div class="info-card-text">Equipment, Proberaum, Werbung – alle Belege sammeln.</div>
        </div>
        <div class="info-card">
          <div class="info-card-icon">📋</div>
          <div class="info-card-title">Verträge</div>
          <div class="info-card-text">Auftragsverträge, GEMA-Anmeldungen, Veranstaltungsverträge.</div>
        </div>
      </div>
    `);
  };

  const renderUploadList = (uploads) => uploads.map(u => `
    <div class="upload-item">
      <span class="upload-item-icon">${fileIcon(u.name)}</span>
      <div class="upload-item-info">
        <span class="upload-item-name">${u.name}</span>
        <span class="upload-item-meta">${u.category} · ${u.date} · ${formatSize(u.size)}</span>
      </div>
      <button class="btn btn-ghost btn-sm" onclick="UploadView.editCategory('${u.id}')">✏️</button>
      <button class="btn btn-danger btn-sm" onclick="UploadView.removeFile('${u.id}')">🗑️</button>
    </div>`).join('');

  const fileIcon = (name) => {
    const ext = name.split('.').pop().toLowerCase();
    return { pdf:'📄', jpg:'🖼️', jpeg:'🖼️', png:'🖼️', xlsx:'📊', xls:'📊', docx:'📝' }[ext] || '📎';
  };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes+'B';
    if (bytes < 1048576) return (bytes/1024).toFixed(1)+'KB';
    return (bytes/1048576).toFixed(1)+'MB';
  };

  const dragOver = (evt) => { evt.preventDefault(); evt.currentTarget.classList.add('drag-active'); };

  const dropFile = (evt) => {
    evt.preventDefault();
    evt.currentTarget.classList.remove('drag-active');
    handleFiles(evt.dataTransfer.files);
  };

  const handleFiles = (files) => {
    if (!files.length) return;
    const arr = Array.from(files);
    arr.forEach(f => {
      if (f.size > 10*1024*1024) { App.toast(`${f.name} zu groß (max 10MB)`); return; }
      pickCategory(f);
    });
  };

  const pickCategory = (file) => {
    App.openModal(`
      <h2>📁 Dokument kategorisieren</h2>
      <p style="color:var(--text-muted)">${file.name} (${formatSize(file.size)})</p>
      <form onsubmit="UploadView.confirmUpload(event)">
        <input type="hidden" name="filename" value="${file.name}" />
        <input type="hidden" name="filesize" value="${file.size}" />
        <div class="form-group">
          <label>Kategorie</label>
          <select name="category" class="input">
            ${CATEGORIES.map(c=>`<option>${c}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Notiz (optional)</label>
          <input name="note" type="text" class="input" placeholder="z.B. Stadtfest 2025" />
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="App.closeModal()">Abbrechen</button>
          <button type="submit" class="btn btn-primary">Speichern</button>
        </div>
      </form>
    `);
  };

  const confirmUpload = (evt) => {
    evt.preventDefault();
    const fd = new FormData(evt.target);
    const today = new Date().toLocaleDateString('de-DE');
    BB.add('uploads', {
      name: fd.get('filename'), size: parseInt(fd.get('filesize')),
      category: fd.get('category'), note: fd.get('note'), date: today,
    });
    App.toast('Dokument gespeichert');
    App.closeModal(); render();
  };

  const editCategory = (id) => {
    const u = BB.getOne('uploads', id);
    App.openModal(`
      <h2>Kategorie ändern</h2>
      <p style="color:var(--text-muted)">${u.name}</p>
      <form onsubmit="UploadView.updateCategory(event,'${id}')">
        <div class="form-group">
          <label>Kategorie</label>
          <select name="category" class="input">
            ${CATEGORIES.map(c=>`<option${u.category===c?' selected':''}>${c}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Notiz</label>
          <input name="note" type="text" class="input" value="${u.note||''}" />
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="App.closeModal()">Abbrechen</button>
          <button type="submit" class="btn btn-primary">Speichern</button>
        </div>
      </form>
    `);
  };

  const updateCategory = (evt, id) => {
    evt.preventDefault();
    const fd = new FormData(evt.target);
    BB.update('uploads', id, { category: fd.get('category'), note: fd.get('note') });
    App.closeModal(); render();
  };

  const removeFile = (id) => {
    if (!confirm('Dokument entfernen?')) return;
    BB.remove('uploads', id); render();
  };

  const filterByCategory = (cat) => {
    const uploads = BB.getAll('uploads').filter(u => !cat || u.category===cat);
    const el = document.getElementById('upload-list');
    if (el) el.innerHTML = renderUploadList(uploads);
  };

  return { render, dragOver, dropFile, handleFiles, confirmUpload,
           editCategory, updateCategory, removeFile, filterByCategory };
})();
