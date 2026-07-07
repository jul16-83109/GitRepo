/* Fogelwuid – Band Website JS */

/* ── Sticky nav ─────────────────────────────────────────────── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('on', window.scrollY > 36);
}, { passive: true });

/* ── Mobile burger menu ──────────────────────────────────────── */
const burger = document.getElementById('burger');
const navUl = document.getElementById('nav-ul');

burger.addEventListener('click', () => {
  const open = navUl.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

navUl.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navUl.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

/* ── Theme toggle ────────────────────────────────────────────── */
const themes = ['auto', 'dark', 'light'];
const icons  = { auto: '☽', dark: '☽', light: '☀' };
let themeIdx = 0;
const themeBtn = document.getElementById('theme-btn');

themeBtn.addEventListener('click', () => {
  themeIdx = (themeIdx + 1) % themes.length;
  const t = themes[themeIdx];
  if (t === 'auto') {
    delete document.documentElement.dataset.theme;
  } else {
    document.documentElement.dataset.theme = t;
  }
  themeBtn.textContent = icons[t];
});

/* ── Scroll reveal ───────────────────────────────────────────── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('vis');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* Stagger gig cards */
document.querySelectorAll('.gig.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${i * 80}ms`;
});

/* ── Contact form ────────────────────────────────────────────── */
const form = document.getElementById('cform');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name  = document.getElementById('fn').value.trim();
    const email = document.getElementById('fe').value.trim();

    if (!name || !email) {
      showToast('Bitte Name und E-Mail angeben.', 'err');
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Wird gesendet …';
    btn.disabled = true;

    setTimeout(() => {
      showToast('Danke! Wir melden uns bald.');
      form.reset();
      btn.textContent = 'Anfrage absenden';
      btn.disabled = false;
    }, 1100);
  });
}

/* ── Toast ───────────────────────────────────────────────────── */
function showToast(msg, type = 'ok') {
  const toast = document.getElementById('toast');
  Object.assign(toast.style, {
    position:   'fixed',
    bottom:     '26px',
    left:       '50%',
    transform:  'translateX(-50%) translateY(0)',
    padding:    '11px 22px',
    borderRadius: '24px',
    font:       '500 .85rem/1 system-ui,sans-serif',
    zIndex:     '9999',
    opacity:    '1',
    whiteSpace: 'nowrap',
    transition: 'all .32s cubic-bezier(.34,1.56,.64,1)',
    boxShadow:  '0 8px 32px rgba(0,0,0,.6)',
    background: type === 'err' ? '#280a10' : '#0a1a0a',
    border:     `1px solid ${type === 'err' ? 'rgba(220,60,80,.4)' : 'rgba(60,180,80,.35)'}`,
    color:      type === 'err' ? '#e06070' : '#60c870',
  });
  toast.textContent = msg;

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(60px)';
  }, 3400);
}

/* ── Toast initial hidden state ─────────────────────────────── */
(function () {
  const t = document.getElementById('toast');
  if (t) {
    t.style.position  = 'fixed';
    t.style.bottom    = '26px';
    t.style.left      = '50%';
    t.style.transform = 'translateX(-50%) translateY(60px)';
    t.style.opacity   = '0';
    t.style.pointerEvents = 'none';
  }
})();
