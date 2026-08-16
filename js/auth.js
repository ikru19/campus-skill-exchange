/* =========================================================
   auth.js — handles Register + Login page behavior
   Simulated (no backend): validates, stores to localStorage
   as a demo, then redirects to the dashboard.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initPasswordToggles();
  initPasswordMeter();
  initRegisterForm();
  initLoginForm();
});

/* ---------- Show/hide password ---------- */
function initPasswordToggles() {
  document.querySelectorAll('.toggle-visibility').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      const isPass = target.type === 'password';
      target.type = isPass ? 'text' : 'password';
      btn.textContent = isPass ? 'HIDE' : 'SHOW';
    });
  });
}

/* ---------- Password strength meter (register page) ---------- */
function initPasswordMeter() {
  const pass = document.getElementById('password');
  const meter = document.querySelector('.password-meter');
  if (!pass || !meter) return;
  const bars = meter.querySelectorAll('span');
  const colors = ['var(--danger)', 'var(--warning)', '#38BDF8', 'var(--success)'];

  pass.addEventListener('input', () => {
    const val = pass.value;
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
    if (/\d/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    bars.forEach((b, i) => { b.style.background = i < score ? colors[Math.min(score,4)-1] : 'var(--border)'; });
  });
}

/* ---------- Field helpers ---------- */
function setError(fieldId, hasError) {
  const el = document.getElementById(fieldId);
  if (!el) return;
  el.classList.toggle('has-error', hasError);
}

/* ---------- Register form ---------- */
function initRegisterForm() {
  const form = document.getElementById('registerForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const fullName = document.getElementById('fullName').value.trim();
    const studentId = document.getElementById('studentId').value.trim();
    const department = document.getElementById('department').value;
    const uniEmail = document.getElementById('uniEmail').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (fullName.length < 2) { setError('f-name', true); valid = false; } else setError('f-name', false);
    if (studentId.length < 3) { setError('f-sid', true); valid = false; } else setError('f-sid', false);
    if (!department) { setError('f-dept', true); valid = false; } else setError('f-dept', false);

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(uniEmail);
    if (!emailOk) { setError('f-email', true); valid = false; } else setError('f-email', false);

    if (password.length < 8) { setError('f-pass', true); valid = false; } else setError('f-pass', false);
    if (confirmPassword !== password || confirmPassword === '') { setError('f-cpass', true); valid = false; } else setError('f-cpass', false);

    if (!valid) {
      showToast('Please fix the highlighted fields.', 'error');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    apiRequest('/auth/register', {
      method: 'POST',
      body: { fullName, studentId, department, email: uniEmail, password },
    })
      .then(() => {
        showToast('Account created! Redirecting…', 'success');
        setTimeout(() => window.location.href = 'login.html', 900);
      })
      .catch((err) => {
        showToast(err.message, 'error');
        submitBtn.disabled = false;
      });
  });
}

/* ---------- Login form ---------- */
function initLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) { setError('f-email', true); valid = false; } else setError('f-email', false);
    if (password.length < 1) { setError('f-pass', true); valid = false; } else setError('f-pass', false);

    if (!valid) {
      showToast('Please enter a valid email and password.', 'error');
      return;
    }

    performLogin(email, password);
  });

  const demoBtn = document.getElementById('demoLoginBtn');
  demoBtn && demoBtn.addEventListener('click', () => {
    // Matches the demo student seeded by `npm run seed` in the backend
    performLogin('demo@university.edu', 'demo12345');
  });
}

function performLogin(email, password) {
  apiRequest('/auth/login', { method: 'POST', body: { email, password } })
    .then((res) => {
      saveSession(res.data.token, res.data.user);
      showToast('Logged in! Redirecting…', 'success');
      setTimeout(() => window.location.href = 'dashboard.html', 700);
    })
    .catch((err) => {
      showToast(err.message, 'error');
    });
}
