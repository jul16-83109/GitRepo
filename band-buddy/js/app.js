// ─── Band Buddy App Router ────────────────────────────────────────────────────

const App = (() => {
  const ROUTES = {
    calendar:   { label: 'Kalender',      icon: '📅', view: () => CalendarView.render() },
    setlists:   { label: 'Setlists',      icon: '🎵', view: () => SetlistsView.render() },
    rehearsals: { label: 'Proben',        icon: '🥁', view: () => RehearsalsView.render() },
    tasks:      { label: 'Aufgaben',      icon: '✅', view: () => TasksView.render() },
    upload:     { label: 'Steuerupload',  icon: '📁', view: () => UploadView.render() },
    bandrider:  { label: 'Bandrider',     icon: '🎚️', view: () => BandriderView.render() },
    qrpage:     { label: 'QR & Kontakt',  icon: '📱', view: () => QRPageView.render() },
  };

  let currentRoute = 'calendar';

  const init = () => {
    BB.seed();
    buildNav();
    const hash = location.hash.replace('#','') || 'calendar';
    navigate(ROUTES[hash] ? hash : 'calendar');
    window.addEventListener('hashchange', () => {
      const h = location.hash.replace('#','');
      if (ROUTES[h]) navigate(h, false);
    });
  };

  const buildNav = () => {
    const nav = document.getElementById('main-nav');
    if (!nav) return;
    nav.innerHTML = Object.entries(ROUTES).map(([key, r]) => `
      <a href="#${key}" class="nav-item" data-route="${key}" id="nav-${key}">
        <span class="nav-icon">${r.icon}</span>
        <span class="nav-label">${r.label}</span>
      </a>`).join('');
  };

  const navigate = (route, pushHash=true) => {
    if (!ROUTES[route]) return;
    currentRoute = route;
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const navItem = document.getElementById(`nav-${route}`);
    if (navItem) navItem.classList.add('active');
    if (pushHash) location.hash = route;
    ROUTES[route].view();
  };

  const setContent = (html) => {
    const main = document.getElementById('main-content');
    if (main) main.innerHTML = html;
  };

  // ── Modal ──────────────────────────────────────────────────────────────────
  const openModal = (html) => {
    const overlay = document.getElementById('modal-overlay');
    const body = document.getElementById('modal-body');
    if (!overlay || !body) return;
    body.innerHTML = html;
    overlay.classList.add('open');
    // focus first input
    setTimeout(() => { const f = body.querySelector('input,select,textarea'); if(f) f.focus(); }, 100);
  };

  const closeModal = () => {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.classList.remove('open');
  };

  // ── Toast ──────────────────────────────────────────────────────────────────
  let toastTimer = null;
  const toast = (msg, duration=3000) => {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), duration);
  };

  // ── Sidebar toggle (mobile) ────────────────────────────────────────────────
  const toggleSidebar = () => document.body.classList.toggle('sidebar-open');
  const closeSidebar = () => document.body.classList.remove('sidebar-open');

  return { init, navigate, setContent, openModal, closeModal, toast, toggleSidebar, closeSidebar };
})();

// ── Global keyboard shortcuts ────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') App.closeModal();
});

// Click outside modal to close
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.addEventListener('click', e => { if(e.target===overlay) App.closeModal(); });
  App.init();
});
