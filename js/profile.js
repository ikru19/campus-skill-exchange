/* =========================================================
   profile.js — My Profile page.
   Now loads the real logged-in user (js/api.js) and their
   real skills instead of the hardcoded "Ayesha Rahman" demo.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  requireLogin();
  loadProfile();
  loadSkillsOffered();

  const saveBtn = document.getElementById('saveProfileBtn');
  if (saveBtn) saveBtn.addEventListener('click', saveProfile);
});

function initialsOf(name) {
  return (name || '?').split(' ').filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join('');
}

async function loadProfile() {
  try {
    const res = await apiRequest('/auth/me', { auth: true });
    const user = res.data;
    renderProfile(user);
    fillEditForm(user);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderProfile(user) {
  const ini = initialsOf(user.fullName);
  document.getElementById('heroAvatar').textContent = ini;
  document.getElementById('heroName').textContent = user.fullName;
  document.getElementById('heroDeptYear').textContent = user.department || '';
  document.getElementById('heroStudentId').textContent = `Student ID: ${user.studentId}`;

  document.getElementById('infoName').textContent = user.fullName;
  document.getElementById('infoStudentId').textContent = user.studentId;
  document.getElementById('infoEmail').textContent = user.email;
  document.getElementById('infoDept').textContent = user.department;
  document.getElementById('infoBio').textContent = user.bio || 'No bio added yet.';
}

function fillEditForm(user) {
  document.getElementById('epName').value = user.fullName;
  document.getElementById('epDept').value = user.department;
  document.getElementById('epBio').value = user.bio || '';
}

async function loadSkillsOffered() {
  const container = document.getElementById('skillsOfferedList');
  try {
    const res = await apiRequest('/skills/mine', { auth: true });
    const skills = res.data;

    if (skills.length === 0) {
      container.innerHTML = `<p class="text-muted" style="font-size:.85rem">You haven't added any skills yet.</p>`;
      return;
    }

    const levelToDots = { Beginner: 1, Intermediate: 2, Advanced: 3, Expert: 4 };
    container.innerHTML = skills.map(s => {
      const dots = levelToDots[s.level] || 0;
      const dotsHtml = [0, 1, 2, 3].map(i => `<span class="${i < dots ? 'on' : ''}"></span>`).join('');
      return `<div class="tag-skill"><span>${s.name}</span><div class="level-dots">${dotsHtml}</div></div>`;
    }).join('');
  } catch (err) {
    container.innerHTML = `<p class="text-muted" style="font-size:.85rem">Could not load your skills.</p>`;
  }
}

async function saveProfile() {
  const fullName = document.getElementById('epName').value.trim();
  const department = document.getElementById('epDept').value;
  const bio = document.getElementById('epBio').value.trim();

  if (!fullName) {
    showToast('Full name cannot be empty.', 'error');
    return;
  }

  try {
    const res = await apiRequest('/users/profile', { method: 'PUT', auth: true, body: { fullName, department, bio } });
    const updated = res.data;

    // Keep the locally stored session in sync with the change
    const session = getCurrentUser();
    saveSession(getToken(), { ...session, fullName: updated.fullName, department: updated.department });

    renderProfile(updated);
    closeModal('editProfileModal');
    showToast('Profile updated successfully.', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}
