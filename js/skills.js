/* =========================================================
   skills.js — Skill Management page (Add / Edit / Delete)
   Now calls the real backend API (js/api.js) instead of an
   in-memory demo array. Rendering markup/classes unchanged.
   ========================================================= */

let skills = [];
let deleteTargetId = null;

const categoryBadgeClass = {
  Programming: 'badge-blue',
  Design: 'badge-green',
  Language: 'badge-amber',
  Music: 'badge-blue',
  Business: 'badge-gray',
  Lifestyle: 'badge-amber',
};
const levelToDots = { Beginner: 1, Intermediate: 2, Advanced: 3, Expert: 4 };

document.addEventListener('DOMContentLoaded', () => {
  requireLogin();
  loadMySkills();

  document.getElementById('addSkillBtn').addEventListener('click', () => openSkillModal());
  document.getElementById('saveSkillBtn').addEventListener('click', saveSkill);
  document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);
  document.getElementById('addResourceBtn').addEventListener('click', () => addResourceRow());
});

async function loadMySkills() {
  try {
    const res = await apiRequest('/skills/mine', { auth: true });
    skills = res.data;
    renderSkills();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderSkills() {
  const grid = document.getElementById('skillGrid');
  const empty = document.getElementById('emptyState');
  if (!grid) return;

  if (skills.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  grid.innerHTML = skills.map(skill => {
    const dots = levelToDots[skill.level] || 0;
    const dotsHtml = [0, 1, 2, 3].map(i => `<span class="${i < dots ? 'on' : ''}"></span>`).join('');
    const badgeClass = categoryBadgeClass[skill.category] || 'badge-gray';
    return `
      <article class="card manage-card">
        <div class="manage-card-top">
          <span class="badge ${badgeClass}">${skill.category || 'Uncategorized'}</span>
          <div class="row-actions">
            <button class="icon-btn" aria-label="Edit skill" onclick="openSkillModal('${skill._id}')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
            </button>
            <button class="icon-btn danger" aria-label="Delete skill" onclick="askDeleteSkill('${skill._id}')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
        </div>
        <h3>${escapeHtml(skill.name)}</h3>
        <p>${escapeHtml(skill.desc || 'No description added yet.')}</p>
        <p class="text-muted" style="font-size:.78rem; margin-top:6px">${escapeHtml(skill.learningMode || '')}${skill.availableSchedule ? ' · ' + escapeHtml(skill.availableSchedule) : ''}</p>
        <div class="manage-card-foot">
          <span class="text-muted" style="font-size:.78rem">Level</span>
          <div class="level-dots">${dotsHtml}</div>
        </div>
      </article>`;
  }).join('');
}

/* ---------- Dynamic resource rows ---------- */
function addResourceRow(data) {
  data = data || { title: '', type: 'YouTube', url: '' };
  const row = document.createElement('div');
  row.className = 'resource-row';
  row.innerHTML = `
    <input class="input" type="text" placeholder="Resource title" value="${escapeHtml(data.title)}">
    <select class="input">
      <option>YouTube</option>
      <option>GitHub</option>
      <option>Google Drive</option>
      <option>PDF</option>
      <option>Website</option>
    </select>
    <input class="input" type="url" placeholder="https://..." value="${escapeHtml(data.url)}">
    <button type="button" class="btn btn-outline btn-sm remove-resource-btn">✕</button>
  `;
  row.querySelector('select').value = data.type;
  row.querySelector('.remove-resource-btn').addEventListener('click', () => row.remove());
  document.getElementById('resourcesContainer').appendChild(row);
}

function collectResources() {
  const rows = document.querySelectorAll('#resourcesContainer .resource-row');
  const resources = [];
  rows.forEach(row => {
    const inputs = row.querySelectorAll('input');
    const title = inputs[0].value.trim();
    const type = row.querySelector('select').value;
    const url = inputs[1].value.trim();
    if (title && url) resources.push({ title, type, url });
  });
  return resources;
}

function openSkillModal(id) {
  const form = document.getElementById('skillForm');
  form.reset();
  ['f-skillName', 'f-skillCategory', 'f-skillLevel', 'f-learningMode', 'f-availableSchedule', 'f-meetingLink'].forEach(f => document.getElementById(f).classList.remove('has-error'));
  document.getElementById('resourcesContainer').innerHTML = '';

  if (id) {
    const skill = skills.find(s => s._id === id);
    document.getElementById('skillModalTitle').textContent = 'Edit Skill';
    document.getElementById('skillId').value = skill._id;
    document.getElementById('skillName').value = skill.name;
    document.getElementById('skillCategory').value = skill.category;
    document.getElementById('skillLevel').value = skill.level;
    document.getElementById('skillDesc').value = skill.desc || '';
    document.getElementById('learningMode').value = skill.learningMode || '';
    document.getElementById('meetingLink').value = skill.meetingLink || '';
    document.getElementById('availableSchedule').value = skill.availableSchedule || '';
    document.getElementById('contactEmail').value = skill.contactEmail || '';
    (skill.resources || []).forEach(r => addResourceRow(r));
  } else {
    document.getElementById('skillModalTitle').textContent = 'Add a Skill';
    document.getElementById('skillId').value = '';
    const user = getCurrentUser();
    document.getElementById('contactEmail').value = user ? user.email : '';
  }
  openModal('skillModal');
}

async function saveSkill() {
  const name = document.getElementById('skillName').value.trim();
  const category = document.getElementById('skillCategory').value;
  const level = document.getElementById('skillLevel').value;
  const desc = document.getElementById('skillDesc').value.trim();
  const learningMode = document.getElementById('learningMode').value;
  const meetingLink = document.getElementById('meetingLink').value.trim();
  const availableSchedule = document.getElementById('availableSchedule').value.trim();
  const contactEmail = document.getElementById('contactEmail').value.trim();
  const resources = collectResources();
  const id = document.getElementById('skillId').value;

  let valid = true;
  toggleFieldError('f-skillName', name.length < 2); if (name.length < 2) valid = false;
  toggleFieldError('f-skillCategory', !category); if (!category) valid = false;
  toggleFieldError('f-skillLevel', !level); if (!level) valid = false;
  toggleFieldError('f-learningMode', !learningMode); if (!learningMode) valid = false;
  toggleFieldError('f-availableSchedule', !availableSchedule); if (!availableSchedule) valid = false;

  const needsMeetingLink = learningMode === 'Online' || learningMode === 'Hybrid';
  toggleFieldError('f-meetingLink', needsMeetingLink && !meetingLink);
  if (needsMeetingLink && !meetingLink) valid = false;

  if (!valid) {
    showToast('Please complete all required fields.', 'error');
    return;
  }

  const body = { name, category, level, desc, learningMode, meetingLink, availableSchedule, contactEmail, resources };

  try {
    if (id) {
      await apiRequest(`/skills/${id}`, { method: 'PUT', auth: true, body });
      showToast('Skill updated.', 'success');
    } else {
      await apiRequest('/skills', { method: 'POST', auth: true, body });
      showToast('Skill added.', 'success');
    }
    closeModal('skillModal');
    loadMySkills();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function toggleFieldError(fieldId, hasError) {
  document.getElementById(fieldId).classList.toggle('has-error', hasError);
}

function askDeleteSkill(id) {
  const skill = skills.find(s => s._id === id);
  deleteTargetId = id;
  document.getElementById('deleteSkillName').textContent = `"${skill.name}"`;
  openModal('deleteSkillModal');
}

async function confirmDelete() {
  try {
    await apiRequest(`/skills/${deleteTargetId}`, { method: 'DELETE', auth: true });
    closeModal('deleteSkillModal');
    showToast('Skill deleted.', 'success');
    loadMySkills();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}
