/* Fogelwuid – Band Website JS */

/* ── Sticky nav ─────────────────────────────────────────────── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ── Mobile burger menu ──────────────────────────────────────── */
const burger = document.getElementById('nav-burger');
const navLinks = document.getElementById('nav-links');

burger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

/* ── Contact form ────────────────────────────────────────────── */
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();

    if (!name || !email) {
      showToast('Bitte Name und E-Mail angeben.', 'error');
      return;
    }

    btn.textContent = 'Wird gesendet …';
    btn.disabled = true;

    setTimeout(() => {
      showToast('Danke! Wir melden uns bald.');
      form.reset();
      btn.textContent = 'Anfrage absenden';
      btn.disabled = false;
    }, 1200);
  });
}

/* ── Toast ───────────────────────────────────────────────────── */
function showToast(msg, type = 'success') {
  let toast = document.getElementById('fw-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'fw-toast';
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '28px',
      left: '50%',
      transform: 'translateX(-50%) translateY(80px)',
      background: type === 'error' ? '#2a0e16' : '#0e1a0e',
      border: `1px solid ${type === 'error' ? 'rgba(232,64,96,0.35)' : 'rgba(72,200,120,0.35)'}`,
      color: type === 'error' ? '#f06080' : '#70d890',
      padding: '12px 24px',
      borderRadius: '24px',
      fontSize: '0.875rem',
      fontFamily: 'Inter, sans-serif',
      fontWeight: '500',
      zIndex: '9999',
      opacity: '0',
      transition: 'all 0.32s cubic-bezier(0.34,1.56,0.64,1)',
      whiteSpace: 'nowrap',
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
    });
    document.body.appendChild(toast);
  }

  toast.textContent = msg;
  toast.style.border = `1px solid ${type === 'error' ? 'rgba(232,64,96,0.35)' : 'rgba(72,200,120,0.35)'}`;
  toast.style.color = type === 'error' ? '#f06080' : '#70d890';
  toast.style.background = type === 'error' ? '#2a0e16' : '#0e1a0e';

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(80px)';
  }, 3500);
}

/* ── Animate sections on scroll ─────────────────────────────── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.gig-card, .gallery-item, .contact-item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});
