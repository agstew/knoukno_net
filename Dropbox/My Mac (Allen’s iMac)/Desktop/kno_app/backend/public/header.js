document.addEventListener('DOMContentLoaded', () => {
  // Toggle admin dropdown
  const adminToggle = document.querySelector('.admin-menu > span');
  const adminList = document.querySelector('.admin-menu > ul');
  if (adminToggle && adminList){
    adminToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      adminList.classList.toggle('show');
    });
    // close when clicking outside
    document.addEventListener('click', () => adminList.classList.remove('show'));
  }

  // Make admin 'Save All' submit via AJAX to avoid full page reload (optional)
  document.querySelectorAll('.admin-menu form[action="/admin/save-all"]').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button');
      if (btn) btn.disabled = true;
      showToast('Saving all submissions...', 'info');
      try {
        const body = new URLSearchParams(new FormData(form));
        const headers = { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' };
        const meta = document.querySelector('meta[name="csrf-token"]');
        if (meta && meta.content) headers['CSRF-Token'] = meta.content;
        const res = await fetch(form.action, {
          method: form.method || 'POST',
          headers,
          body,
          credentials: 'include'
        });
        if (res.ok) {
          let json = {};
          try { json = await res.json(); } catch(_){}
          const msg = json.message || 'Save All completed';
          showToast(msg, 'success');
        } else {
          let txt = await res.text();
          showToast('Save All failed: ' + (txt || res.statusText), 'error');
        }
      } catch (err) {
        showToast('Save All failed: ' + err.message, 'error');
      } finally {
        if (btn) btn.disabled = false;
      }
    });
  });

  // Insert CSRF hidden inputs into all POST forms when meta csrf-token is present
  const meta = document.querySelector('meta[name="csrf-token"]');
  if (meta && meta.content) {
    document.querySelectorAll('form[method="post"]').forEach(f => {
      if (!f.querySelector('input[name="_csrf"]')) {
        const inp = document.createElement('input');
        inp.type = 'hidden';
        inp.name = '_csrf';
        inp.value = meta.content;
        f.prepend(inp);
      }
    });
  }
});

function showToast(message, type='info'){
  let container = document.querySelector('.toast-container');
  if (!container){
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  t.textContent = message;
  container.appendChild(t);
  setTimeout(() => { t.classList.add('visible'); }, 10);
  setTimeout(() => { t.classList.remove('visible'); setTimeout(()=>t.remove(),300); }, 4000);
}
