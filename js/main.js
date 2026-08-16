/* =========================================================
   main.js — shared across every page
   Handles: mobile nav toggle, sidebar toggle, toasts, modals,
   and small reusable helpers.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
  initSidebarToggle();
  initModalTriggers();
  markActiveNav();
  renderSidebarUser();
});

/* ---------- Show the real logged-in user in the sidebar/topbar
   (guarded: pages that don't load js/api.js, like index.html,
   simply skip this — nothing breaks). ---------- */
function renderSidebarUser() {
  if (typeof getCurrentUser !== 'function') return;
  const user = getCurrentUser();
  if (!user) return;

  const userInitials = user.fullName.split(' ').filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join('');
  document.querySelectorAll('.sidebar-user .avatar').forEach(el => el.textContent = userInitials);
  document.querySelectorAll('.sidebar-user .u-name').forEach(el => el.textContent = user.fullName);
  document.querySelectorAll('.sidebar-user .u-role').forEach(el => el.textContent = user.department || '');
  document.querySelectorAll('.app-topbar .avatar').forEach(el => el.textContent = userInitials);

  document.querySelectorAll('.sidebar-user .logout').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      clearSession();
      window.location.href = 'login.html';
    });
  });
}

/* ---------- Mobile top navbar toggle (public pages) ---------- */
function initNavToggle() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
    toggle.classList.toggle('active');
  });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
}

/* ---------- Sidebar toggle (app pages) ---------- */
function initSidebarToggle() {
  const btn = document.querySelector('.sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  if (!btn || !sidebar) return;
  const open = () => { sidebar.classList.add('open'); overlay && overlay.classList.add('open'); };
  const close = () => { sidebar.classList.remove('open'); overlay && overlay.classList.remove('open'); };
  btn.addEventListener('click', () => sidebar.classList.contains('open') ? close() : open());
  overlay && overlay.addEventListener('click', close);
}

/* ---------- Highlight active nav / sidebar link based on filename ---------- */
function markActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .sidebar-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page) a.classList.add('active');
  });
}

/* ---------- Toasts ---------- */
function showToast(message, type = 'info') {
  let stack = document.querySelector('.toast-stack');
  if (!stack) {
    stack = document.createElement('div');
    stack.className = 'toast-stack';
    document.body.appendChild(stack);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  stack.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    setTimeout(() => toast.remove(), 250);
  }, 2800);
}

/* ---------- Generic modal open/close via data attributes ----------
   <button data-modal-open="modalId">Open</button>
   <div id="modalId" class="modal-overlay"> ... <button data-modal-close>...</button>
--------------------------------------------------------------- */
function initModalTriggers() {
  document.querySelectorAll('[data-modal-open]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-modal-open');
      const modal = document.getElementById(id);
      if (modal) modal.classList.add('open');
    });
  });
  document.querySelectorAll('[data-modal-close]').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.modal-overlay').classList.remove('open'));
  });
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('open'); });
  });
}

function openModal(id) { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }

/* ---------- Small helper: initials from a name for avatar fallback ---------- */
function initials(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join('');
}
