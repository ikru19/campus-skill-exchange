/* =========================================================
   requests.js — Learning Requests page.
   Now fetches real data from /api/requests/mine (sent +
   received) and renders the Pending / Accepted / Rejected /
   History tabs dynamically. Accept/Reject/Cancel call the
   real API. Accepted "sent" requests get a "View Details"
   button that reveals the gated Meeting Link, Contact Email,
   and Resources — matching the backend's security rule.
   ========================================================= */

let sentRequests = [];
let receivedRequests = [];

document.addEventListener('DOMContentLoaded', () => {
  requireLogin();
  initTabs();
  loadRequests();
});

function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
    });
  });
}

async function loadRequests() {
  try {
    const res = await apiRequest('/requests/mine', { auth: true });
    sentRequests = res.data.sent;
    receivedRequests = res.data.received;
    renderAll();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function initials(name) {
  return (name || '?').split(' ').filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join('');
}
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function renderAll() {
  renderPending();
  renderAccepted();
  renderRejected();
  renderHistory();

  document.getElementById('countPending').textContent =
    sentRequests.filter(r => r.status === 'pending').length + receivedRequests.filter(r => r.status === 'pending').length;
  document.getElementById('countAccepted').textContent =
    sentRequests.filter(r => r.status === 'accepted').length + receivedRequests.filter(r => r.status === 'accepted').length;
  document.getElementById('countRejected').textContent =
    sentRequests.filter(r => r.status === 'rejected').length + receivedRequests.filter(r => r.status === 'rejected').length;
}

/* ---------- Pending tab: received (Accept/Decline) + sent (Cancel) ---------- */
function renderPending() {
  const list = document.getElementById('pendingList');
  const receivedPending = receivedRequests.filter(r => r.status === 'pending');
  const sentPending = sentRequests.filter(r => r.status === 'pending');

  if (receivedPending.length === 0 && sentPending.length === 0) {
    list.innerHTML = `<p class="text-muted">No pending requests right now.</p>`;
    return;
  }

  const receivedHtml = receivedPending.map(r => `
    <div class="card req-card">
      <div class="row-user">
        <div class="avatar" style="width:44px;height:44px">${initials(r.fromUser && r.fromUser.fullName)}</div>
        <div>
          <h4>${r.fromUser ? r.fromUser.fullName : 'Unknown'}</h4>
          <span class="text-muted" style="font-size:.82rem">wants to learn <strong>${r.skill ? r.skill.name : 'a skill'}</strong> from you</span>
        </div>
      </div>
      <div class="req-card-meta">
        <span class="badge badge-amber">Pending</span>
        <span class="text-muted" style="font-size:.78rem">${formatDate(r.createdAt)}</span>
      </div>
      <div class="req-actions">
        <button class="btn btn-outline btn-sm" onclick="respond('${r._id}', 'rejected')">Decline</button>
        <button class="btn btn-primary btn-sm" onclick="respond('${r._id}', 'accepted')">Accept</button>
      </div>
    </div>`).join('');

  const sentHtml = sentPending.map(r => `
    <div class="card req-card">
      <div class="row-user">
        <div class="avatar" style="width:44px;height:44px;background:var(--accent-light);color:#0284C7">${initials(r.toUser && r.toUser.fullName)}</div>
        <div>
          <h4>You → ${r.toUser ? r.toUser.fullName : 'Unknown'}</h4>
          <span class="text-muted" style="font-size:.82rem">requested <strong>${r.skill ? r.skill.name : 'a skill'}</strong></span>
        </div>
      </div>
      <div class="req-card-meta">
        <span class="badge badge-amber">Awaiting response</span>
        <span class="text-muted" style="font-size:.78rem">${formatDate(r.createdAt)}</span>
      </div>
      <div class="req-actions">
        <button class="btn btn-ghost btn-sm" onclick="cancelRequest('${r._id}')">Cancel Request</button>
      </div>
    </div>`).join('');

  list.innerHTML = receivedHtml + sentHtml;
}

/* ---------- Accepted tab ---------- */
function renderAccepted() {
  const list = document.getElementById('acceptedList');
  const receivedAccepted = receivedRequests.filter(r => r.status === 'accepted');
  const sentAccepted = sentRequests.filter(r => r.status === 'accepted');

  if (receivedAccepted.length === 0 && sentAccepted.length === 0) {
    list.innerHTML = `<p class="text-muted">No accepted requests yet.</p>`;
    return;
  }

  const receivedHtml = receivedAccepted.map(r => `
    <div class="card req-card">
      <div class="row-user">
        <div class="avatar" style="width:44px;height:44px">${initials(r.fromUser && r.fromUser.fullName)}</div>
        <div>
          <h4>${r.fromUser ? r.fromUser.fullName : 'Unknown'}</h4>
          <span class="text-muted" style="font-size:.82rem">you accepted their request for <strong>${r.skill ? r.skill.name : 'a skill'}</strong></span>
        </div>
      </div>
      <div class="req-card-meta">
        <span class="badge badge-green">Accepted</span>
        <span class="text-muted" style="font-size:.78rem">${formatDate(r.createdAt)}</span>
      </div>
      <p class="text-muted" style="font-size:.78rem">They can now see your Meeting Link, Contact Email and Resources for this skill.</p>
    </div>`).join('');

  const sentHtml = sentAccepted.map(r => `
    <div class="card req-card">
      <div class="row-user">
        <div class="avatar" style="width:44px;height:44px;background:var(--accent-light);color:#0284C7">${initials(r.toUser && r.toUser.fullName)}</div>
        <div>
          <h4>${r.toUser ? r.toUser.fullName : 'Unknown'}</h4>
          <span class="text-muted" style="font-size:.82rem">accepted your request for <strong>${r.skill ? r.skill.name : 'a skill'}</strong></span>
        </div>
      </div>
      <div class="req-card-meta">
        <span class="badge badge-green">Accepted</span>
        <span class="text-muted" style="font-size:.78rem">${formatDate(r.createdAt)}</span>
      </div>
      <div class="req-actions">
        <button class="btn btn-primary btn-sm" onclick="toggleDetails('${r._id}', '${r.skill ? r.skill._id : ''}')">View Details</button>
      </div>
      <div id="details-${r._id}"></div>
    </div>`).join('');

  list.innerHTML = receivedHtml + sentHtml;
}

/* ---------- Rejected tab ---------- */
function renderRejected() {
  const list = document.getElementById('rejectedList');
  const all = [
    ...receivedRequests.filter(r => r.status === 'rejected').map(r => ({ ...r, direction: 'received' })),
    ...sentRequests.filter(r => r.status === 'rejected').map(r => ({ ...r, direction: 'sent' })),
  ];

  if (all.length === 0) {
    list.innerHTML = `<p class="text-muted">No rejected requests.</p>`;
    return;
  }

  list.innerHTML = all.map(r => {
    const otherName = r.direction === 'received' ? (r.fromUser ? r.fromUser.fullName : 'Unknown') : (r.toUser ? r.toUser.fullName : 'Unknown');
    const line = r.direction === 'received'
      ? `you declined their request for <strong>${r.skill ? r.skill.name : 'a skill'}</strong>`
      : `declined your request for <strong>${r.skill ? r.skill.name : 'a skill'}</strong>`;
    return `
    <div class="card req-card">
      <div class="row-user">
        <div class="avatar" style="width:44px;height:44px">${initials(otherName)}</div>
        <div>
          <h4>${otherName}</h4>
          <span class="text-muted" style="font-size:.82rem">${line}</span>
        </div>
      </div>
      <div class="req-card-meta">
        <span class="badge badge-red">Rejected</span>
        <span class="text-muted" style="font-size:.78rem">${formatDate(r.createdAt)}</span>
      </div>
      ${r.direction === 'sent' ? `<div class="req-actions"><a href="browse-skills.html" class="btn btn-outline btn-sm">Browse Similar Skills</a></div>` : ''}
    </div>`;
  }).join('');
}

/* ---------- History tab ---------- */
function renderHistory() {
  const body = document.getElementById('historyBody');
  const badgeClass = { pending: 'badge-amber', accepted: 'badge-green', rejected: 'badge-red' };
  const statusLabel = { pending: 'Pending', accepted: 'Accepted', rejected: 'Rejected' };

  const rows = [
    ...receivedRequests.map(r => ({ skill: r.skill ? r.skill.name : '—', with: r.fromUser ? r.fromUser.fullName : 'Unknown', type: 'Received', status: r.status, date: r.createdAt })),
    ...sentRequests.map(r => ({ skill: r.skill ? r.skill.name : '—', with: r.toUser ? r.toUser.fullName : 'Unknown', type: 'Sent', status: r.status, date: r.createdAt })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (rows.length === 0) {
    body.innerHTML = `<tr><td colspan="5" class="text-muted">No request history yet.</td></tr>`;
    return;
  }

  body.innerHTML = rows.map(r => `
    <tr>
      <td>${r.skill}</td>
      <td>${r.with}</td>
      <td>${r.type}</td>
      <td><span class="badge ${badgeClass[r.status]}">${statusLabel[r.status]}</span></td>
      <td>${formatDate(r.date)}</td>
    </tr>`).join('');
}

/* ---------- Actions ---------- */
async function respond(id, status) {
  try {
    await apiRequest(`/requests/${id}`, { method: 'PUT', auth: true, body: { status } });
    showToast(`Request ${status}.`, status === 'accepted' ? 'success' : 'error');
    loadRequests();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function cancelRequest(id) {
  try {
    await apiRequest(`/requests/${id}`, { method: 'DELETE', auth: true });
    showToast('Request cancelled.', 'success');
    loadRequests();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

/* ---------- View unlocked skill details (accepted "sent" requests only) ---------- */
function resourceIcon(type) {
  const icons = { YouTube: '▶️', GitHub: '🐙', 'Google Drive': '📁', PDF: '📄', Website: '🔗' };
  return icons[type] || '🔗';
}

async function toggleDetails(requestId, skillId) {
  const panel = document.getElementById(`details-${requestId}`);
  if (!skillId) {
    panel.innerHTML = `<p class="text-muted" style="font-size:.8rem">This skill was removed by its owner.</p>`;
    return;
  }

  if (panel.dataset.open === 'true') {
    panel.innerHTML = '';
    panel.dataset.open = 'false';
    return;
  }

  panel.innerHTML = `<div class="details-panel">Loading details...</div>`;
  panel.dataset.open = 'true';

  try {
    const res = await apiRequest(`/skills/${skillId}/full`, { auth: true });
    const skill = res.data;

    const resourcesHtml = (skill.resources || []).length > 0
      ? `<div class="resource-card-list">
           ${skill.resources.map(r => `
             <a class="resource-card" href="${r.url}" target="_blank" rel="noopener noreferrer">
               <span class="res-type">${resourceIcon(r.type)} ${r.type}</span>
               <span class="res-title">${r.title}</span>
             </a>`).join('')}
         </div>`
      : `<p class="text-muted" style="font-size:.8rem">No resources were added for this skill.</p>`;

    panel.innerHTML = `
      <div class="details-panel">
        <h4>Unlocked: ${skill.name}</h4>
        <div class="detail-row"><strong>Learning mode:</strong> ${skill.learningMode || '-'}</div>
        ${skill.meetingLink ? `<div class="detail-row"><strong>Meeting link:</strong> <a href="${skill.meetingLink}" target="_blank" rel="noopener noreferrer">${skill.meetingLink}</a></div>` : ''}
        <div class="detail-row"><strong>Available schedule:</strong> ${skill.availableSchedule || '-'}</div>
        <div class="detail-row"><strong>Contact email:</strong> <a href="mailto:${skill.contactEmail}">${skill.contactEmail}</a></div>
        <div class="detail-row"><strong>Learning resources:</strong></div>
        ${resourcesHtml}
      </div>`;
  } catch (err) {
    panel.innerHTML = `<div class="details-panel">Could not load details: ${err.message}</div>`;
  }
}
