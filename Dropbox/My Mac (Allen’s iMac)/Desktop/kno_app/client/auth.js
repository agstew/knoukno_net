// Simple client-side auth UI and fetch helpers (vanilla JS)
;(function () {
  const root = document.getElementById('root');

  function el(tag, attrs = {}, ...children) {
    const n = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => { if (k === 'class') n.className = v; else n.setAttribute(k, v); });
    children.flat().forEach(c => { if (typeof c === 'string') n.appendChild(document.createTextNode(c)); else if (c) n.appendChild(c); });
    return n;
  }

  function parseJwt(token) {
    try {
      const p = token.split('.')[1];
      const json = decodeURIComponent(atob(p.replace(/-/g, '+').replace(/_/g, '/')).split('').map(function(c){return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)}).join(''))
      return JSON.parse(json);
    } catch (e) { return null }
  }

  function setMessage(container, msg, isErr) {
    container.textContent = msg;
    container.style.color = isErr ? '#b00' : '#080';
  }

  function createForm() {
    const wrapper = el('div', { class: 'auth-wrapper' });
    const title = el('h2', {}, 'Auth');
    const msg = el('div', { class: 'auth-msg' });

    const email = el('input', { type: 'email', placeholder: 'Email', id: 'email' });
    const password = el('input', { type: 'password', placeholder: 'Password', id: 'password' });
    const registerBtn = el('button', { type: 'button' }, 'Register');
    const loginBtn = el('button', { type: 'button' }, 'Login');

    registerBtn.addEventListener('click', async () => {
      setMessage(msg, 'Registering...', false);
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.value, password: password.value })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Register failed');
        localStorage.setItem('token', data.token);
        setMessage(msg, 'Registered. Token saved.', false);
        renderProfile();
      } catch (err) { setMessage(msg, err.message || String(err), true); }
    });

    loginBtn.addEventListener('click', async () => {
      setMessage(msg, 'Logging in...', false);
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.value, password: password.value })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        localStorage.setItem('token', data.token);
        setMessage(msg, 'Logged in. Token saved.', false);
        renderProfile();
      } catch (err) { setMessage(msg, err.message || String(err), true); }
    });

    wrapper.appendChild(title);
    wrapper.appendChild(email);
    wrapper.appendChild(password);
    wrapper.appendChild(el('div', { class: 'btn-row' }, registerBtn, loginBtn));
    wrapper.appendChild(msg);
    return wrapper;
  }

  function renderProfile() {
    const token = localStorage.getItem('token');
    const profileArea = document.getElementById('profile-area');
    if (!profileArea) return;
    profileArea.innerHTML = '';
    if (!token) {
      profileArea.appendChild(el('p', {}, 'Not logged in.'));
      return;
    }
    const payload = parseJwt(token) || {};
    profileArea.appendChild(el('p', {}, `Token payload: ${JSON.stringify(payload)}`));
    const logout = el('button', {}, 'Logout');
    logout.addEventListener('click', () => { localStorage.removeItem('token'); renderProfile(); });
    profileArea.appendChild(logout);
  }

  function init() {
    const container = el('div', { class: 'client-container' });
    container.appendChild(createForm());
    container.appendChild(el('hr'));
    container.appendChild(el('div', { id: 'profile-area' }));
    root.innerHTML = '';
    root.appendChild(container);
    renderProfile();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
