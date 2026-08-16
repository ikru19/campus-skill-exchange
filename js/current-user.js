/**
 * current-user.js
 * ----------------
 * Fixes the "hardcoded Ayesha Rahman / Shafiq Alam" bug across all pages.
 *
 * Uses the getCurrentUser() function that ALREADY EXISTS in api.js
 * (reads from localStorage key "cse_user", saved there by saveSession()
 * after a successful login). This file does NOT redefine getCurrentUser —
 * it just uses it to fill in the sidebar/topbar/welcome-banner on every
 * page that includes it.
 *
 * Required load order:
 *   <script src="js/main.js"></script>
 *   <script src="js/api.js"></script>          <-- defines getCurrentUser()
 *   <script src="js/current-user.js"></script>  <-- this file, uses it
 *   <script src="js/browse.js"></script>        <-- (or dashboard/profile/etc.)
 */

function getInitials(name) {
  if (!name) return '--';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

function getRoleLabel(user) {
  if (user.role === 'admin') return 'Platform Admin';
  return user.department || '';
}

function renderCurrentUser() {
  const user = getCurrentUser(); // from api.js — reads localStorage "cse_user"

  if (!user) {
    console.warn('No logged-in user found — redirecting to login.');
    window.location.href = 'login.html';
    return;
  }

  const initials = getInitials(user.fullName);

  const sidebarName = document.getElementById('sidebarUserName');
  const sidebarRole = document.getElementById('sidebarUserRole');
  const sidebarAvatar = document.getElementById('sidebarAvatar');
  const topbarAvatar = document.getElementById('topbarAvatar');
  const welcomeName = document.getElementById('welcomeUserName');

  if (sidebarName) sidebarName.textContent = user.fullName;
  if (sidebarRole) sidebarRole.textContent = getRoleLabel(user);
  if (sidebarAvatar) sidebarAvatar.textContent = initials;
  if (topbarAvatar) topbarAvatar.textContent = initials;
  if (welcomeName) welcomeName.textContent = user.fullName;
}

document.addEventListener('DOMContentLoaded', renderCurrentUser);
