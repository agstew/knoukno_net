// Simple client-side auth UI and navigation handlers (vanilla JS)
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
    container.style.color = isErr ? 'var(--gold)' : 'var(--blue)';
  }

  function createAuthForm(mode = 'login') {
    const wrapper = el('div', { class: 'auth-wrapper' });
    const title = el('h2', {}, mode === 'login' ? 'Login' : 'Register');
    const msg = el('div', { class: 'auth-msg' });

    const email = el('input', { type: 'email', placeholder: 'Email', id: `email-${mode}` });
    const password = el('input', { type: 'password', placeholder: 'Password', id: `password-${mode}` });
    const submitBtn = el('button', { type: 'button', class: 'btn' }, mode === 'login' ? 'Login' : 'Register');

    submitBtn.addEventListener('click', async () => {
      setMessage(msg, mode === 'login' ? 'Logging in...' : 'Registering...', false);
      try {
        const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
        const res = await fetch(url, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.value, password: password.value })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || (mode === 'login' ? 'Login failed' : 'Register failed'));
        localStorage.setItem('token', data.token);
        setMessage(msg, 'Success. Token saved.', false);
        renderProfile();
      } catch (err) { setMessage(msg, err.message || String(err), true); }
    });

    wrapper.appendChild(title);
    wrapper.appendChild(email);
    wrapper.appendChild(password);
    const btnRow = el('div', { class: 'btn-row' }, submitBtn);
    if (mode === 'login') {
      const forgot = el('a', { href: '#', class: 'forgot-link' }, 'Forgot password?');
      forgot.addEventListener('click', async (e) => {
        e.preventDefault();
        const em = prompt('Enter your account email to get a reset link:');
        if (!em) return;
        try {
          const res = await fetch('/api/auth/forgot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: em }) });
          showNotice('If that email exists, a reset link was generated (check server logs).', 'success');
        } catch (err) { showNotice('Unable to request reset', 'error'); }
      });
      btnRow.appendChild(forgot);
    }
    wrapper.appendChild(btnRow);
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
    const logout = el('button', { class: 'btn' }, 'Logout');
    logout.addEventListener('click', () => { localStorage.removeItem('token'); renderProfile(); });
    profileArea.appendChild(el('div', { class: 'profile-row' }, logout));
    const recordsBtn = el('button', { class: 'btn' }, 'My Records');
    recordsBtn.addEventListener('click', () => { renderRecordsView(); });
    profileArea.appendChild(recordsBtn);
  }

  function renderView(view) {
    root.innerHTML = '';
    // set active nav link based on view
    setActiveNav(view);
    const profileArea = el('div', { id: 'profile-area' });
    if (view === 'login') {
      root.appendChild(createAuthForm('login'));
      root.appendChild(el('hr'));
      root.appendChild(profileArea);
      renderProfile();
    } else if (view === 'register') {
      root.appendChild(createAuthForm('register'));
      root.appendChild(el('hr'));
      root.appendChild(profileArea);
      renderProfile();
    } else if (view === 'about') {
      root.appendChild(el('div', { class: 'content' }, el('h2', {}, 'About'), el('p', {}, 'This is the About section for Kno U Kno.')));
    } else if (view === 'price') {
      root.appendChild(
        el('div', { class: 'content' },
          el('h2', {}, 'Pricing'),
          el('div', { class: 'pricing' },
            // Free tier
            el('div', { class: 'tier' },
              el('h3', {}, 'Free Tier'),
              el('ul', {},
                el('li', {}, 'Questions: 5 (3 days)'),
                el('li', {}, el('button', { class: 'action-btn', 'data-action': 'save', 'data-tier': 'free' }, 'Save page')),
                el('li', {}, el('button', { class: 'action-btn', 'data-action': 'print', 'data-tier': 'free' }, 'Print page')),
                el('li', {}, 'Price: $0 (3 days)'),
                el('li', {}, '* No Bonus.')
              )
            ),

            // Members tier
            el('div', { class: 'tier' },
              el('h3', {}, 'Members Tier — 50 questions / Month'),
              el('ul', {},
                el('li', {}, 'Features:'),
                el('li', {}, 'Print page'),
                el('li', {}, 'Save page'),
                el('li', {}, 'Grade page'),
                el('li', {}, 'Rate page'),
                el('li', {}, 'Average page'),
                el('li', {}, 'Price: $39.00'),
                el('li', {}, 'Discount 20% — $49.00 → $39.00 (save $10.00)'),
                el('li', {}, el('button', { class: 'btn buy-btn', 'data-tier': 'members', 'data-price': '39.00' }, 'Buy Members — $39'))
              )
            ),

            // Pro tier
            el('div', { class: 'tier' },
              el('h3', {}, 'Pro Tier — 75 questions / Year'),
              el('ul', {},
                el('li', {}, 'Features:'),
                el('li', {}, 'Print page'),
                el('li', {}, 'Save page'),
                el('li', {}, 'Grade page'),
                el('li', {}, 'Rate page'),
                el('li', {}, 'Average page'),
                el('li', {}, 'Price: $675.00'),
                el('li', {}, 'Discount 35% — $675.00 → $436.00 (save $239.00)'),
                el('li', {}, el('button', { class: 'btn buy-btn', 'data-tier': 'pro', 'data-price': '436.00' }, 'Buy Pro — $436'))
              )
            ),

            // Bonus offer
            el('div', { class: 'tier bonus' },
              el('h4', {}, 'Bonus Offer'),
              el('p', {}, '* Bonus: 100 questions for $100.00 if you buy now'),
              el('p', {}, el('button', { class: 'btn buy-btn', 'data-tier': 'bonus', 'data-price': '100.00' }, 'Buy Bonus — $100'))
            )
          )
        )
      );

      // attach handlers to buy buttons and action buttons
      setTimeout(() => {
        const buyButtons = document.querySelectorAll('.buy-btn');
        buyButtons.forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const tier = btn.getAttribute('data-tier');
            try {
              // include email if available from token
              let body = { tier };
              try {
                const t = localStorage.getItem('token');
                if (t) {
                  const p = parseJwt(t) || {};
                  if (p.email) body.email = p.email;
                  const possibleId = p.sub || p.id || p._id || p.userId;
                  if (possibleId) body.userId = possibleId;
                }
              } catch (e) { /* ignore */ }
              const res = await fetch('/api/pay/create-checkout-session', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(body)
                    });
              const data = await res.json().catch(() => ({}));
              if (!res.ok) throw new Error(data.error || 'Payment failed');
              if (data.url) window.location = data.url; else alert('Checkout session created');
            } catch (err) { alert('Payment error: ' + (err.message || err)); }
          });
        });

        const actionButtons = document.querySelectorAll('.action-btn');
        actionButtons.forEach(abtn => {
          abtn.addEventListener('click', (e) => {
            const action = abtn.getAttribute('data-action');
            const tier = abtn.getAttribute('data-tier');
            handleAction(action, tier);
          });
        });
      }, 50);
    } else if (view === 'home') {
      // Home card with guidance (~300 words) plus paginated questions
      const intro = `Starting a business means joining creativity with practical planning. Begin by clarifying the problem you solve and the customers you serve; validate demand through simple tests like interviews, landing pages, or small pre-sales. Next, build a compact plan that lists one-time startup costs (equipment, licenses), recurring expenses (rent, payroll, marketing), and a conservative cash-flow projection for the first 6–12 months. Identify funding options that match your risk tolerance: personal savings, friends/family, microloans, small business loans, grants, or pre-sales/crowdfunding. Keep an emergency buffer and aim to cover at least three months of operating expenses while you iterate.`;
      const money = `The Money: prioritize essential spend and separate personal from business finances. Open a business bank account, track expenses from day one, and use simple accounting software. Consider phased spending: launch a minimal viable product (MVP) before heavy investment, and measure customer willingness to pay.`;
      const law = `The Law: choose and register the right legal entity (sole proprietor, LLC, S-corp, etc.) based on liability and tax needs. Register for required local and state permits, collect and remit taxes correctly, and use written agreements with suppliers and customers. For intellectual property or complex contracts, consult a lawyer.`;
      const grade = `The Grade: create a short readiness checklist (market validation, MVP, financial runway, team capability, initial customers). Score each item honestly to reveal gaps. Use these scores to form a 90-day action plan with measurable milestones and the fewest assumptions to test.`;

      const card = el('div', { class: 'card' },
        el('h3', {}, 'How to get business started'),
        el('p', {}, intro),
        el('h4', {}, 'Example — How to get started'),
        el('p', {}, 'Example: start by selling a small batch of your product at a local market or via a simple online form. Use revenue from those sales to refine product and messaging.'),
        el('h4', {}, 'The Money'),
        el('p', {}, money),
        el('h4', {}, 'The Law'),
        el('p', {}, law),
        el('h4', {}, 'The Grade'),
        el('p', {}, grade)
      );

      // Questions (you make the questions) with simple pagination
      const questions = [
        'What problem does your business solve?',
        'Who are your first 50 potential customers?',
        'What is the minimum product you can offer to test demand?',
        'How much money do you need to reach break-even?',
        'Which legal registrations or permits do you need?',
        'What are your top three marketing channels to get customers?',
        'How will you measure success in the first 90 days?'
      ];
      const perPage = 3;
      let page = 0;

      function renderQuestions() {
        const start = page * perPage;
        const pageItems = questions.slice(start, start + perPage);
        const qwrap = el('div', { class: 'questions' });
        qwrap.appendChild(el('h4', {}, 'Questions'));
        const ul = el('ul');
        pageItems.forEach((q, i) => ul.appendChild(el('li', {}, q)));
        qwrap.appendChild(ul);
        const pager = el('div', { class: 'pager' },
          el('button', { class: 'btn', id: 'prev-q' }, 'Previous'),
          el('span', { class: 'pager-info' }, ` Page ${page + 1} of ${Math.ceil(questions.length / perPage)} `),
          el('button', { class: 'btn', id: 'next-q' }, 'Next')
        );
        qwrap.appendChild(pager);
        return qwrap;
      }

      const qcontainer = el('div', { id: 'q-container' }, renderQuestions());
      root.appendChild(card);
      root.appendChild(qcontainer);

      // attach pagination handlers
      setTimeout(() => {
        const update = () => {
          const container = document.getElementById('q-container');
          if (!container) return;
          container.innerHTML = '';
          container.appendChild(renderQuestions());
          attachQuestionButtons();
        };
        function attachQuestionButtons() {
          const prev = document.getElementById('prev-q');
          const next = document.getElementById('next-q');
          if (prev) prev.addEventListener('click', () => { if (page > 0) { page--; update(); } });
          if (next) next.addEventListener('click', () => { if ((page + 1) * perPage < questions.length) { page++; update(); } });
        }
        attachQuestionButtons();
      }, 50);
      } else if (view === 'questions') {
        // Questions UI: one per page, topic filter, count selection
        const controls = el('div', { class: 'content' },
          el('h2', {}, 'Questions'),
          el('div', { class: 'controls' },
            el('label', {}, 'Topic: '),
            el('select', { id: 'q-topic' },
              el('option', { value: 'start' }, 'Start a Business'),
              el('option', { value: 'manage' }, 'Manage'),
              el('option', { value: 'money' }, 'Money')
            ),
            el('label', {}, ' Count: '),
            el('select', { id: 'q-count' }, el('option', { value: '50' }, '50'), el('option', { value: '75' }, '75'), el('option', { value: '100' }, '100'))
          ),
          el('div', { id: 'question-wrap' }, el('p', {}, 'Load a topic and count to begin'))
        );
        root.appendChild(controls);

        let page = 0;
        async function loadQuestion() {
          const topic = document.getElementById('q-topic').value;
          const count = document.getElementById('q-count').value;
          const res = await apiGet(`/api/questions?topic=${encodeURIComponent(topic)}&page=${page}&perPage=1&count=${encodeURIComponent(count)}`);
          const wrap = document.getElementById('question-wrap');
          wrap.innerHTML = '';
          if (!res.ok) { wrap.appendChild(el('div', { class: 'notice error' }, 'Unable to load question')); return; }
          const items = res.json && res.json.items ? res.json.items : [];
          if (!items.length) { wrap.appendChild(el('p', {}, 'No question')); return; }
          const q = items[0];
          const qEl = el('div', { class: 'question-card' }, el('h3', {}, `Question ${q.ordinal || ''}`), el('p', {}, q.text));
          const ta = el('textarea', { id: 'answer-area', rows: 6, cols: 60, placeholder: 'Type your answer here...' });
          const saveBtn = el('button', { class: 'btn' }, 'Save Answer');
          saveBtn.addEventListener('click', async () => {
            const text = ta.value.trim();
            if (!text) { showNotice('Answer is empty', 'error'); return; }
            // optimistic UI
            saveBtn.disabled = true;
            const r = await apiFetch('/api/data/save-answers', { question: q.text, answers: [text] });
            saveBtn.disabled = false;
            if (r.ok) showNotice('Answer saved', 'success'); else showNotice('Save failed', 'error');
          });

          const nav = el('div', { class: 'pager' },
            el('button', { class: 'btn', id: 'q-prev' }, 'Previous'),
            el('span', { class: 'pager-info' }, ` Page ${page + 1} `),
            el('button', { class: 'btn', id: 'q-next' }, 'Next')
          );
          wrap.appendChild(qEl);
          wrap.appendChild(ta);
          wrap.appendChild(el('div', { class: 'btn-row' }, saveBtn));
          wrap.appendChild(nav);

          // attach nav
          document.getElementById('q-prev').addEventListener('click', () => { if (page > 0) { page--; loadQuestion(); } });
          document.getElementById('q-next').addEventListener('click', () => { page++; loadQuestion(); });
        }

        // attach change handlers
        setTimeout(() => {
          const tSel = document.getElementById('q-topic');
          const cSel = document.getElementById('q-count');
          tSel.addEventListener('change', () => { page = 0; loadQuestion(); });
          cSel.addEventListener('change', () => { page = 0; loadQuestion(); });
        }, 50);
      } else {
    } else {
      root.appendChild(el('div', { class: 'content' }, el('h2', {}, 'Welcome'), el('p', {}, 'Use the navigation to access Login, Register, About, or Price.')));
    }
  }

  function setActiveNav(view) {
    const map = { home: 'nav-home', register: 'nav-register', login: 'nav-login', about: 'nav-about', price: 'nav-price' };
    const id = map[view];
    document.querySelectorAll('.main-nav ul li a').forEach(a => a.classList.remove('active'));
    if (id) {
      const node = document.getElementById(id);
      if (node) node.classList.add('active');
    }
  }

  // Render reset password UI
  function renderResetView() {
    root.innerHTML = '';
    const profileArea = el('div', { id: 'profile-area' });
    const container = el('div', { class: 'content' }, el('h2', {}, 'Reset Password'));
    const info = el('p', {}, 'Enter a new password to reset your account.');
    const pw = el('input', { type: 'password', id: 'reset-pw', placeholder: 'New password' });
    const pw2 = el('input', { type: 'password', id: 'reset-pw2', placeholder: 'Confirm password' });
    const submit = el('button', { class: 'btn' }, 'Set Password');
    container.appendChild(info);
    container.appendChild(pw);
    container.appendChild(pw2);
    container.appendChild(el('div', { class: 'btn-row' }, submit));
    container.appendChild(profileArea);
    root.appendChild(container);

    // token may be on window.__resetToken or in URL
    const token = window.__resetToken || new URLSearchParams(window.location.search).get('token');

    submit.addEventListener('click', async () => {
      const a = document.getElementById('reset-pw').value || '';
      const b = document.getElementById('reset-pw2').value || '';
      if (a.length < 8) { showNotice('Password must be at least 8 characters', 'error'); return; }
      if (a !== b) { showNotice('Passwords do not match', 'error'); return; }
      if (!token) { showNotice('Missing reset token', 'error'); return; }
      try {
        const res = await fetch('/api/auth/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password: a }) });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) { showNotice(json.error || 'Reset failed', 'error'); return; }
        showNotice('Password reset successful — redirecting to login', 'success');
        setTimeout(() => { renderView('login'); }, 1200);
      } catch (err) { showNotice('Reset failed', 'error'); }
    });
  }

    function attachNavHandlers() {
    const map = {
      'nav-home': 'home',
      'nav-login': 'login',
        'nav-register': 'register',
        'nav-questions': 'questions',
      'nav-home-brand': 'home'
    };
    Object.keys(map).forEach(id => {
      const elNode = document.getElementById(id);
      if (elNode) elNode.addEventListener('click', (e) => { e.preventDefault(); renderView(map[id]); });
    });
    // links for About and Price navigate to sections but also update main
    const about = document.querySelector('a[href="#about"]');
    if (about) about.addEventListener('click', (e) => { e.preventDefault(); renderView('about'); });
    const price = document.querySelector('a[href="#price"]');
    if (price) price.addEventListener('click', (e) => { e.preventDefault(); renderView('price'); });
    const questions = document.querySelector('a[href="#questions"]');
    if (questions) questions.addEventListener('click', (e) => { e.preventDefault(); renderView('questions'); });
  }

  // Action handlers for pricing buttons
  function showNotice(text, type = 'success') {
    const n = el('div', { class: `notice ${type === 'success' ? 'success' : 'error'}` }, text);
    document.body.insertBefore(n, document.body.firstChild);
    setTimeout(() => n.remove(), 7000);
  }

  // Small helper to call the API with auth if available
  function apiFetch(path, body) {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    return fetch(path, { method: 'POST', headers, body: JSON.stringify(body) })
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        return { ok: res.ok, status: res.status, json };
      });
  }

  // GET helper
  function apiGet(path) {
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) headers['Authorization'] = 'Bearer ' + token;
    return fetch(path, { method: 'GET', headers })
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        return { ok: res.ok, status: res.status, json };
      });
  }

  // DELETE helper
  function apiDelete(path) {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    return fetch(path, { method: 'DELETE', headers })
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        return { ok: res.ok, status: res.status, json };
      });
  }

  // Render a simple records list with optimistic delete
  function renderRecordsView() {
    root.innerHTML = '';
    const container = el('div', { class: 'content' }, el('h2', {}, 'My Records'));
    const listWrap = el('div', { id: 'records-list' }, el('p', {}, 'Loading...'));
    container.appendChild(listWrap);
    root.appendChild(container);

    apiGet('/api/data/list?page=0&limit=100').then(res => {
      if (!res.ok) {
        listWrap.innerHTML = '';
        listWrap.appendChild(el('div', { class: 'notice error' }, 'Unable to fetch records'));
        return;
      }
      const items = res.json && res.json.items ? res.json.items : [];
      listWrap.innerHTML = '';
      if (!items.length) {
        listWrap.appendChild(el('p', {}, 'No records yet.'));
        return;
      }
      const ul = el('ul');
      items.forEach(it => {
        const li = el('li', {}, el('div', { class: 'record-item' },
          el('strong', {}, it.type || 'record'), ' — ', el('span', {}, it.question || ''),
          el('div', { class: 'record-meta' }, ` ${it.createdAt ? new Date(it.createdAt).toLocaleString() : ''}`)
        ));
        const btn = el('button', { class: 'btn small' }, 'Delete');
        btn.addEventListener('click', () => {
          // optimistic remove
          li.style.opacity = '0.4';
          btn.disabled = true;
          apiDelete('/api/data/' + encodeURIComponent(it._id)).then(r => {
            if (r.ok) {
              li.remove();
              showNotice('Record deleted', 'success');
            } else {
              li.style.opacity = '1';
              btn.disabled = false;
              showNotice('Delete failed', 'error');
            }
          }).catch(() => { li.style.opacity = '1'; btn.disabled = false; showNotice('Delete failed', 'error'); });
        });
        li.appendChild(btn);
        ul.appendChild(li);
      });
      listWrap.appendChild(ul);
    }).catch(() => { listWrap.innerHTML = ''; listWrap.appendChild(el('div', { class: 'notice error' }, 'Unable to fetch records')); });
  }

  function handleAction(action, tier) {
    if (action === 'print') {
      window.print();
      return;
    }
    if (action === 'save') {
      try {
        const html = '<!doctype html>\n' + document.documentElement.outerHTML;
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kno_u_kno_${tier || 'page'}.html`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        showNotice('Page saved locally.', 'success');
        // also try to save to server if logged in
        if (localStorage.getItem('token')) {
          apiFetch('/api/data/save-all', { question: document.title, answers: [], meta: { tier } })
            .then(r => { if (r.ok) showNotice('Saved to server.', 'success'); else showNotice('Server save failed', 'error'); })
            .catch(() => showNotice('Server save failed', 'error'));
        }
      } catch (err) { showNotice('Save failed: ' + err.message, 'error'); }
      return;
    }
    if (action === 'grade') {
      const val = prompt('Enter grade (0-100):');
      const g = parseFloat(val);
      if (Number.isFinite(g)) {
        const key = `grades_${tier || 'global'}`;
        const arr = JSON.parse(localStorage.getItem(key) || '[]');
        arr.push(g);
        localStorage.setItem(key, JSON.stringify(arr));
        showNotice(`Saved grade ${g} for ${tier || 'page'}.`, 'success');
        if (localStorage.getItem('token')) {
          apiFetch('/api/data/save-grade', { question: document.title, grade: g })
            .then(r => { if (r.ok) showNotice('Grade saved to server.', 'success'); else showNotice('Server grade save failed', 'error'); })
            .catch(() => showNotice('Server grade save failed', 'error'));
        }
      } else showNotice('Invalid grade.', 'error');
      return;
    }
    if (action === 'rate') {
      const val = prompt('Rate 1-5:');
      const r = parseInt(val, 10);
      if (r >= 1 && r <= 5) {
        const key = `ratings_${tier || 'global'}`;
        const arr = JSON.parse(localStorage.getItem(key) || '[]');
        arr.push(r);
        localStorage.setItem(key, JSON.stringify(arr));
        showNotice(`Saved rating ${r} for ${tier || 'page'}.`, 'success');
        if (localStorage.getItem('token')) {
          apiFetch('/api/data/save-rated', { question: document.title, rated: r })
            .then(res => { if (res.ok) showNotice('Rating saved to server.', 'success'); else showNotice('Server rating save failed', 'error'); })
            .catch(() => showNotice('Server rating save failed', 'error'));
        }
      } else showNotice('Invalid rating.', 'error');
      return;
    }
    if (action === 'average') {
      const rkey = `ratings_${tier || 'global'}`;
      const gkey = `grades_${tier || 'global'}`;
      const ratings = JSON.parse(localStorage.getItem(rkey) || '[]');
      const grades = JSON.parse(localStorage.getItem(gkey) || '[]');
      const avg = (arr => arr.length ? (arr.reduce((s,x)=>s+x,0)/arr.length).toFixed(2) : 'n/a');
      showNotice(`Average rating: ${avg(ratings)} — Average grade: ${avg(grades)}`, 'success');
      if (localStorage.getItem('token')) {
        const gradeAvg = grades.length ? (grades.reduce((s,x)=>s+x,0)/grades.length) : null;
        apiFetch('/api/data/save-average', { question: document.title, average: gradeAvg })
          .then(res => { if (res.ok) showNotice('Average saved to server.', 'success'); else showNotice('Server average save failed', 'error'); })
          .catch(() => showNotice('Server average save failed', 'error'));
      }
      return;
    }
    showNotice('Unknown action', 'error');
  }

  document.addEventListener('DOMContentLoaded', () => {
    attachNavHandlers();
    // Show payment success/cancel notices or fetch session details if present
    const params = new URLSearchParams(window.location.search);
    if (params.get('canceled')) {
      root.appendChild(el('div', { class: 'notice error' }, 'Payment canceled.'));
    }
    const sessionId = params.get('session_id') || params.get('sessionId');
    if (sessionId) {
      // fetch session details from server
      fetch(`/api/pay/session?sessionId=${encodeURIComponent(sessionId)}`)
        .then(r => r.json())
        .then(data => {
          if (data && data.session) {
            const s = data.session;
            const amount = (s.amount_total || (s.display_items && s.display_items[0] && s.display_items[0].amount)) || s.line_items_amount || 0;
            const text = `Payment succeeded — ${s.payment_status || ''} — ${s.amount_total ? '$' + (s.amount_total/100).toFixed(2) : ''}`;
            root.appendChild(el('div', { class: 'notice success' }, text));
          } else if (data && data.error) {
            root.appendChild(el('div', { class: 'notice error' }, 'Payment succeeded but session fetch failed.'));
          }
        }).catch(err => { root.appendChild(el('div', { class: 'notice error' }, 'Payment succeeded — unable to fetch session details.')); });
    }

    // Reset password token handling and default view
    const token = params.get('token');
    const path = window.location.pathname || '/';
    if (token || path === '/reset-password') {
      // render reset form and pass token (token may be empty if user opened path)
      renderView('reset');
      // expose token to form renderer via global param
      window.__resetToken = token || null;
      return;
    }

    // On reload/show, prefer pathname, then hash, then default home
    const pathname = (window.location.pathname || '/').replace(/\/$/, '');
    const route = pathname === '' || pathname === '/' ? 'home' : pathname.replace(/^[\/]/, '');
    // map route names we support to view keys
    const routeMap = { 'about': 'about', 'price': 'price', 'login': 'login', 'register': 'register', 'questions': 'questions' };
    if (routeMap[route]) {
      renderView(routeMap[route]);
    } else {
      // fallback to hash if present
      const hash = window.location.hash && window.location.hash.replace('#','');
      if (hash && routeMap[hash]) renderView(hash); else renderView('home');
    }
  });
})();
