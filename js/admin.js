let rowToRemove = null;

document.addEventListener('DOMContentLoaded', () => {
  initAdminTabs();
  initRemoveActions();
  document.getElementById('confirmRemoveBtn').addEventListener('click', confirmRemove);
});

function initAdminTabs() {
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

function initRemoveActions() {
  document.querySelectorAll('.remove-row').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = btn.closest('tr');
      rowToRemove = row;
      document.getElementById('removeContentName').textContent = `"${row.dataset.name}"`;
      openModal('removeContentModal');
    });
  });
}

function confirmRemove() {
  if (rowToRemove) {
    rowToRemove.style.opacity = '0';
    setTimeout(() => rowToRemove.remove(), 250);
    showToast(`Removed "${rowToRemove.dataset.name}".`, 'success');
  }
  closeModal('removeContentModal');
}
