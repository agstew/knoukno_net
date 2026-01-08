document.addEventListener('DOMContentLoaded', () => {
  const printBtn = document.getElementById('btn-print');
  if (printBtn) printBtn.addEventListener('click', () => window.print());

  // animate progress fills
  document.querySelectorAll('.progress-fill').forEach(el => {
    const w = el.style.width || '0%';
    el.style.width = '0%';
    setTimeout(()=> el.style.width = w, 60);
  });

  // confirm destructive admin actions
  document.querySelectorAll('form button.button-danger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (!confirm('Are you sure? This action cannot be undone.')) e.preventDefault();
    });
  });
});
