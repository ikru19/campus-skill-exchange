/* =========================================================
   api.js — shared fetch helper + auth/session storage.
   New file: every other js/*.js file now calls apiRequest()
   here instead of touching a demo array or localStorage data.
   ========================================================= */

const API_URL = 'http://localhost:5000/api';

/* ---------- Session storage ---------- */
function saveSession(token, user) {
  localStorage.setItem('cse_token', token);
  localStorage.setItem('cse_user', JSON.stringify(user));
}
function getToken() {
  return localStorage.getItem('cse_token');
}
function getCurrentUser() {
  const raw = localStorage.getItem('cse_user');
  return raw ? JSON.parse(raw) : null;
}
function clearSession() {
  localStorage.removeItem('cse_token');
  localStorage.removeItem('cse_user');
}
function requireLogin() {
  if (!getToken()) window.location.href = 'login.html';
}

/* ---------- Fetch wrapper ----------
   Attaches the JWT automatically, parses JSON, and throws a
   plain Error with the backend's message on failure. */
async function apiRequest(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong. Is the backend running?');
  }
  return data;
}
