document.addEventListener('DOMContentLoaded', () => {
  // Toggle password visibility
  document.querySelectorAll('.pw-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = btn.closest('.pw-row');
      if (!row) return;
      const input = row.querySelector('input[type="password"], input[type="text"]');
      if (!input) return;
      if (input.type === 'password') { input.type = 'text'; btn.textContent = 'Hide'; }
      else { input.type = 'password'; btn.textContent = 'Show'; }
    });
  });

  // Basic client-side validation for auth forms
  document.querySelectorAll('form.auth-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      const pw = form.querySelector('input[name="password"]');
      const confirm = form.querySelector('input[name="confirm"]');
      if (pw && pw.value.length < 6) {
        e.preventDefault();
        showFormError(form, 'Password must be at least 6 characters');
        return;
      }
      if (confirm && pw && pw.value !== confirm.value) {
        e.preventDefault();
        showFormError(form, 'Passwords do not match');
        return;
      }
      // allow submit
    });
  });
});

function showFormError(form, message){
  let el = form.querySelector('.form-error');
  if (!el){
    el = document.createElement('p');
    el.className = 'form-error';
    form.prepend(el);
  }
  el.textContent = message;
}
