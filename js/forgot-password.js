/**
 * forgot-password.js
 * -------------------
 * Simple (no real email) password reset flow:
 *   Step 1: user enters their email -> we ask backend if that email exists
 *   Step 2: if it exists, show a "set new password" form
 *   Step 3: submit new password directly to backend, done
 *
 * Uses apiRequest() from api.js. Requires two new backend endpoints:
 *   POST /api/auth/check-email      { email }              -> { success, exists }
 *   POST /api/auth/reset-password   { email, newPassword }  -> { success }
 */

const stepEmail = document.getElementById('stepEmail');
const stepReset = document.getElementById('stepReset');
const stepDone = document.getElementById('stepDone');
const confirmedEmailEl = document.getElementById('confirmedEmail');

let verifiedEmail = null;

/* ---------- Step 1: verify email exists ---------- */
document.getElementById('verifyEmailForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const emailInput = document.getElementById('fpEmail');
  const email = emailInput.value.trim();
  const fieldWrap = document.getElementById('f-fpEmail');

  if (!email || !email.includes('@')) {
    fieldWrap.classList.add('has-error');
    return;
  }
  fieldWrap.classList.remove('has-error');

  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Checking…';

  try {
    const res = await apiRequest('/auth/check-email', {
      method: 'POST',
      body: { email },
    });

    if (res.exists) {
      verifiedEmail = email;
      confirmedEmailEl.textContent = email;
      stepEmail.style.display = 'none';
      stepReset.style.display = 'block';
    } else {
      alert('No account found with that email address.');
    }
  } catch (err) {
    alert(err.message || 'Something went wrong. Is the backend running?');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Continue';
  }
});

/* ---------- Step 2: submit new password ---------- */
document.getElementById('resetPasswordForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const newPassword = document.getElementById('newPassword').value;
  const confirmNewPassword = document.getElementById('confirmNewPassword').value;

  const passField = document.getElementById('f-newPass');
  const confirmField = document.getElementById('f-confirmNewPass');
  passField.classList.remove('has-error');
  confirmField.classList.remove('has-error');

  const passwordOk = newPassword.length >= 8 && /\d/.test(newPassword);
  if (!passwordOk) {
    passField.classList.add('has-error');
    return;
  }
  if (newPassword !== confirmNewPassword) {
    confirmField.classList.add('has-error');
    return;
  }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Resetting…';

  try {
    await apiRequest('/auth/reset-password', {
      method: 'POST',
      body: { email: verifiedEmail, newPassword },
    });

    stepReset.style.display = 'none';
    stepDone.style.display = 'block';
  } catch (err) {
    alert(err.message || 'Something went wrong. Is the backend running?');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Reset Password';
  }
});

/* ---------- Show/hide password (reuses the same pattern as main.js) ---------- */
document.querySelectorAll('.toggle-visibility').forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = document.getElementById(btn.dataset.target);
    if (target.type === 'password') {
      target.type = 'text';
      btn.textContent = 'HIDE';
    } else {
      target.type = 'password';
      btn.textContent = 'SHOW';
    }
  });
});
