/* =========================================================
   browse.js — Browse Skills page
   Now fetches the real skill catalogue from the backend and
   sends real learning requests, instead of a hardcoded array.
   ========================================================= */

let catalogue = [];
let activeSearch = '';
let activeCategory = 'all';
let activeLevel = 'all';
let selectedSkillId = null;

document.addEventListener('DOMContentLoaded', () => {
  requireLogin();
  loadCatalogue();

  document.getElementById('searchInput').addEventListener('input', (e) => {
    activeSearch = e.target.value.trim().toLowerCase();
    loadCatalogue();
  });
  document.getElementById('categoryFilter').addEventListener('change', (e) => {
    activeCategory = e.target.value;
    loadCatalogue();
  });
  document.getElementById('levelFilter').addEventListener('change', (e) => {
    activeLevel = e.target.value;
    loadCatalogue();
  });
  document.getElementById('sendRequestBtn').addEventListener('click', sendRequest);
});

const levelToDots = { Beginner: 1, Intermediate: 2, Advanced: 3, Expert: 4 };
const categoryBadgeClass = { Programming: 'badge-blue', Design: 'badge-green', Language: 'badge-amber', Music: 'badge-blue', Business: 'badge-gray', Lifestyle: 'badge-amber' };

async function loadCatalogue() {
  const params = new URLSearchParams();
  if (activeSearch) params.append('search', activeSearch);
  if (activeCategory !== 'all') params.append('category', activeCategory);
  if (activeLevel !== 'all') params.append('level', activeLevel);

  try {
    const res = await apiRequest(`/skills?${params.toString()}`);
    catalogue = res.data;
    renderCatalogue();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderCatalogue() {
  const grid = document.getElementById('browseGrid');
  const empty = document.getElementById('browseEmpty');
  const countEl = document.getElementById('resultsCount');
  const me = getCurrentUser();

  // A student's own skills don't show up in their own browse list
  const filtered = catalogue.filter(s => !me || !s.user || s.user._id !== me.id);

  countEl.textContent = `Showing ${filtered.length} skill${filtered.length !== 1 ? 's' : ''}`;

  if (filtered.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  grid.innerHTML = filtered.map(s => {
    const dots = levelToDots[s.level] || 0;
    const dotsHtml = [0, 1, 2, 3].map(d => `<span class="${d < dots ? 'on' : ''}"></span>`).join('');
    const badgeClass = categoryBadgeClass[s.category] || 'badge-gray';
    const teacherName = s.user ? s.user.fullName : 'Unknown';
    const initials = teacherName.split(' ').filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join('');
    const modeLine = [s.learningMode, s.availableSchedule].filter(Boolean).join(' · ');
    return `
      <article class="card browse-card">
        <div class="browse-card-top">
          <span class="badge ${badgeClass}">${s.category}</span>
          <span class="badge badge-gray">${s.level}</span>
        </div>
        <h3>${s.name}</h3>
        <p>${s.desc || ''}</p>
        ${modeLine ? `<p class="text-muted" style="font-size:.78rem">${modeLine}</p>` : ''}
        <p class="locked-note">🔒 Meeting link, contact email &amp; resources unlock once your request is accepted</p>
        <div class="browse-card-teacher">
          <div class="row-user">
            <div class="avatar" style="width:34px;height:34px;font-size:.72rem">${initials}</div>
            <div>
              <strong>${teacherName}</strong>
              <div class="level-dots">${dotsHtml}</div>
            </div>
          </div>
          <button class="btn btn-outline btn-sm" onclick="openRequestModal('${s._id}')">Request</button>
        </div>
      </article>`;
  }).join('');
}

function openRequestModal(skillId) {
  const skill = catalogue.find(s => s._id === skillId);
  if (!skill) return;
  selectedSkillId = skillId;
  const teacherName = skill.user ? skill.user.fullName : 'Unknown';
  const initials = teacherName.split(' ').filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join('');
  document.getElementById('reqAvatar').textContent = initials;
  document.getElementById('reqSkillName').textContent = skill.name;
  document.getElementById('reqTeacherName').textContent = `Taught by ${teacherName}`;
  document.getElementById('reqMessage').value = '';
  openModal('requestModal');
}

async function sendRequest() {
  if (!selectedSkillId) return;
  const message = document.getElementById('reqMessage').value.trim();
  try {
    await apiRequest('/requests', { method: 'POST', auth: true, body: { skillId: selectedSkillId, message } });
    closeModal('requestModal');
    showToast('Request sent!', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}
