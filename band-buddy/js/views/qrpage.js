// ─── QR Page View ─────────────────────────────────────────────────────────────

const QRPageView = (() => {
  const render = () => {
    const profile = BB.load('qr_profile') || {
      bandName: 'Band Buddy',
      website: 'https://eureband.de',
      email: 'kontakt@eureband.de',
      phone: '',
      instagram: '',
      facebook: '',
      spotify: '',
      bookingText: 'Für Buchungsanfragen und weitere Infos kontaktiert uns gerne.',
    };

    App.setContent(`
      <div class="view-header">
        <h1 class="view-title"><span class="view-icon">📱</span> QR & Bandkontakt</h1>
        <button class="btn btn-primary" onclick="QRPageView.openEditModal()">✏️ Bearbeiten</button>
      </div>

      <div class="qr-layout">
        <!-- QR Card (printable) -->
        <div class="qr-card" id="qr-card">
          <div class="qr-card-band-name">${profile.bandName}</div>
          <div class="qr-code-wrap">
            <canvas id="qr-canvas"></canvas>
          </div>
          <div class="qr-card-url">${profile.website}</div>
          <div class="qr-card-tagline">${profile.bookingText}</div>
          <div class="qr-contacts">
            ${profile.email ? `<div class="qr-contact-item">✉️ ${profile.email}</div>` : ''}
            ${profile.phone ? `<div class="qr-contact-item">📞 ${profile.phone}</div>` : ''}
          </div>
          <div class="qr-socials">
            ${profile.instagram ? `<a class="qr-social-badge" href="${profile.instagram}" target="_blank">Instagram</a>` : ''}
            ${profile.facebook  ? `<a class="qr-social-badge" href="${profile.facebook}" target="_blank">Facebook</a>` : ''}
            ${profile.spotify   ? `<a class="qr-social-badge qr-badge-spotify" href="${profile.spotify}" target="_blank">Spotify</a>` : ''}
          </div>
        </div>

        <!-- Actions -->
        <div class="qr-actions-panel">
          <div class="sidebar-section-title">Aktionen</div>
          <button class="btn btn-secondary qr-action-btn" onclick="QRPageView.downloadQR()">
            ⬇️ QR-Code herunterladen
          </button>
          <button class="btn btn-secondary qr-action-btn" onclick="QRPageView.printCard()">
            🖨️ Karte drucken
          </button>
          <button class="btn btn-secondary qr-action-btn" onclick="QRPageView.copyUrl()">
            📋 URL kopieren
          </button>

          <div class="sidebar-section-title" style="margin-top:1.5rem">Kontaktdaten</div>
          <div class="qr-info-list">
            ${profile.website ? `<div class="qr-info-row"><span>🌐</span><span>${profile.website}</span></div>` : ''}
            ${profile.email   ? `<div class="qr-info-row"><span>✉️</span><span>${profile.email}</span></div>` : ''}
            ${profile.phone   ? `<div class="qr-info-row"><span>📞</span><span>${profile.phone}</span></div>` : ''}
            ${profile.instagram ? `<div class="qr-info-row"><span>📸</span><span>${profile.instagram}</span></div>` : ''}
          </div>
        </div>
      </div>
    `);

    // Generate QR code after DOM ready
    setTimeout(() => generateQR(profile.website), 100);
  };

  const generateQR = (url) => {
    const canvas = document.getElementById('qr-canvas');
    if (!canvas || !url) return;
    // Use qrcodejs via CDN (loaded in index.html)
    if (typeof QRCode !== 'undefined') {
      canvas.parentElement.innerHTML = '';
      const div = document.createElement('div');
      canvas.parentElement.appendChild(div);
      new QRCode(div, {
        text: url, width: 200, height: 200,
        colorDark: '#e63946', colorLight: '#1a1a1a',
        correctLevel: QRCode.CorrectLevel.H
      });
    } else {
      // Fallback: show URL as text
      const ctx = canvas.getContext('2d');
      canvas.width = 200; canvas.height = 200;
      ctx.fillStyle = '#1a1a1a'; ctx.fillRect(0,0,200,200);
      ctx.fillStyle = '#e63946'; ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('QR-Code', 100, 90);
      ctx.fillText('(qrcode.js laden)', 100, 110);
    }
  };

  const openEditModal = () => {
    const p = BB.load('qr_profile') || {};
    App.openModal(`
      <h2>✏️ Bandkontakt bearbeiten</h2>
      <form onsubmit="QRPageView.saveProfile(event)">
        <div class="form-grid-2">
          <div class="form-group">
            <label>Bandname</label>
            <input name="bandName" type="text" class="input" value="${p.bandName||''}" required />
          </div>
          <div class="form-group">
            <label>Website (QR-Ziel)</label>
            <input name="website" type="url" class="input" value="${p.website||''}" placeholder="https://…" />
          </div>
          <div class="form-group">
            <label>E-Mail</label>
            <input name="email" type="email" class="input" value="${p.email||''}" />
          </div>
          <div class="form-group">
            <label>Telefon</label>
            <input name="phone" type="tel" class="input" value="${p.phone||''}" />
          </div>
          <div class="form-group">
            <label>Instagram URL</label>
            <input name="instagram" type="url" class="input" value="${p.instagram||''}" />
          </div>
          <div class="form-group">
            <label>Facebook URL</label>
            <input name="facebook" type="url" class="input" value="${p.facebook||''}" />
          </div>
          <div class="form-group">
            <label>Spotify URL</label>
            <input name="spotify" type="url" class="input" value="${p.spotify||''}" />
          </div>
        </div>
        <div class="form-group">
          <label>Booking-Text</label>
          <textarea name="bookingText" class="input" rows="2">${p.bookingText||''}</textarea>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="App.closeModal()">Abbrechen</button>
          <button type="submit" class="btn btn-primary">Speichern</button>
        </div>
      </form>
    `);
  };

  const saveProfile = (evt) => {
    evt.preventDefault();
    const fd = new FormData(evt.target);
    const data = Object.fromEntries(fd.entries());
    BB.save('qr_profile', data);
    App.closeModal(); render();
  };

  const downloadQR = () => {
    const img = document.querySelector('#qr-canvas, .qr-code-wrap img');
    if (!img) { App.toast('QR-Code nicht verfügbar'); return; }
    const a = document.createElement('a');
    a.href = img.tagName==='IMG' ? img.src : img.toDataURL();
    a.download = 'band-qr.png'; a.click();
  };

  const printCard = () => window.print();

  const copyUrl = () => {
    const p = BB.load('qr_profile') || {};
    if (!p.website) { App.toast('Keine URL konfiguriert'); return; }
    navigator.clipboard.writeText(p.website).then(()=>App.toast('URL kopiert!'));
  };

  return { render, openEditModal, saveProfile, downloadQR, printCard, copyUrl };
})();
