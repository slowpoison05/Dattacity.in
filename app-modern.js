(() => {
  const $ = id => document.getElementById(id);
  const validViews = new Set(['home','services','marketplace','weather','fasal','info']);

  function go(name) {
    if (!validViews.has(name)) name = 'home';
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = $(name);
    if (target) target.classList.add('active');
    document.querySelectorAll('[data-go]').forEach(b => b.classList.toggle('active', b.dataset.go === name));
    if (location.hash.slice(1) !== name) history.replaceState(null, '', '#' + name);
    window.scrollTo({top: 0, behavior: 'instant'});
    if (name === 'weather' && typeof window.loadWeather === 'function') window.loadWeather();
    if (name === 'fasal' && typeof window.loadMandi === 'function') window.loadMandi();
  }

  function bindNavigation() {
    document.addEventListener('click', event => {
      const button = event.target.closest('[data-go]');
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      go(button.dataset.go);
    }, true);

    document.querySelectorAll('.back').forEach(button => {
      button.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        go('home');
      }, true);
    });

    document.querySelectorAll('[data-external]').forEach(button => {
      button.addEventListener('click', event => {
        event.preventDefault();
        window.location.href = button.dataset.external;
      }, true);
    });

    window.addEventListener('hashchange', () => go(location.hash.slice(1)));
    const initial = location.hash.slice(1);
    go(validViews.has(initial) ? initial : 'home');
  }

  document.addEventListener('DOMContentLoaded', bindNavigation, {once:true});

  try {
    const firebaseConfig = {
      apiKey:'AIzaSyCvaXtUjp8xY5nRFXroL-H1ospFSgM7qQ0',
      authDomain:'superkisan-33b7e.firebaseapp.com',
      databaseURL:'https://superkisan-33b7e-default-rtdb.firebaseio.com',
      projectId:'superkisan-33b7e',
      storageBucket:'superkisan-33b7e.firebasestorage.app',
      messagingSenderId:'744234922644',
      appId:'1:744234922644:web:20b4c062d50d6265fdba81'
    };
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    const db = firebase.database();
    let services = [], market = [];

    const esc = value => String(value ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    const visible = x => !['pending','rejected','blocked'].includes(String(x.status || '').toLowerCase());

    window.loadWeather = async function() {
      try {
        const r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=29.15&longitude=75.72&current=temperature_2m&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FKolkata');
        const d = await r.json();
        $('weatherNow').innerHTML = `<b style="font-size:38px">${Math.round(d.current.temperature_2m)}°C</b><div class="muted">Hisar · live</div>`;
        $('weatherDays').innerHTML = d.daily.time.slice(0,5).map((x,i) => `<div class="day"><b>${i ? 'Day '+(i+1) : 'Today'}</b><div>${Math.round(d.daily.temperature_2m_max[i])}° / ${Math.round(d.daily.temperature_2m_min[i])}°</div></div>`).join('');
      } catch(e) { $('weatherNow').textContent = 'Weather unavailable'; }
    };

    function renderServices() {
      const q = ($('globalSearch').value || '').toLowerCase();
      const list = services.filter(visible).filter(x => !q || JSON.stringify(x).toLowerCase().includes(q));
      $('serviceCount').textContent = list.length;
      $('servicesList').innerHTML = list.length ? list.map(x => `<article class="card"><div class="row"><div class="thumb">${x.image ? `<img class="thumb" src="${esc(x.image)}" alt="">` : '◉'}</div><div class="info"><h3>${esc(x.name || x.title || x.serviceName || 'Service')}</h3><div class="muted">${esc(x.details || x.description || x.address || '')}</div><span class="tag">${esc(x.category || x.type || 'other')}</span>${x.phone || x.mobile || x.contact ? `<div class="actions"><a class="call" href="tel:${esc(x.phone || x.mobile || x.contact)}">Call</a></div>` : ''}</div></div></article>`).join('') : '<div class="notice">No services found.</div>';
    }

    function renderMarket() {
      const q = ($('globalSearch').value || '').toLowerCase();
      const list = market.filter(visible).filter(x => !q || JSON.stringify(x).toLowerCase().includes(q));
      $('marketCount').textContent = list.length;
      $('marketList').innerHTML = list.length ? list.map(x => `<article class="card"><div class="row"><div class="thumb">${x.image ? `<img class="thumb" src="${esc(x.image)}" alt="">` : '◇'}</div><div class="info"><h3>${esc(x.productName || x.name || x.title || 'Listing')}</h3><div class="muted">${esc(x.description || x.details || '')}</div>${x.price ? `<b>₹${esc(x.price)}</b>` : ''}<div><span class="tag">${String(x.listingType || '').toLowerCase() === 'buy' ? 'Wanted' : 'For sale'}</span></div>${x.phone || x.mobile || x.contact ? `<div class="actions"><a class="call" href="tel:${esc(x.phone || x.mobile || x.contact)}">Call</a></div>` : ''}</div></div></article>`).join('') : '<div class="notice">No listings found.</div>';
    }

    window.loadMandi = async function() {
      const box = $('mandiTable');
      box.innerHTML = '<div class="notice">Loading live mandi prices…</div>';
      try {
        const r = await fetch('/api/mandi?t=' + Date.now(), {cache:'no-store'});
        const d = await r.json();
        window.mandi = d.records || [];
        renderMandi();
      } catch(e) { box.innerHTML = '<div class="notice">Live mandi data unavailable. Try Refresh.</div>'; }
    };

    function renderMandi() {
      const q = ($('mandiSearch').value || '').toLowerCase();
      const list = (window.mandi || []).filter(x => `${x.commodity} ${x.market}`.toLowerCase().includes(q));
      $('mandiTable').innerHTML = list.length ? `<table><tr><th>Crop</th><th>Mandi</th><th>Min</th><th>Max</th><th>Modal</th></tr>${list.map(x => `<tr><td>${esc(x.commodity)}</td><td>${esc(x.market)}</td><td>₹${esc(x.min_price)}</td><td>₹${esc(x.max_price)}</td><td><b>₹${esc(x.modal_price)}</b></td></tr>`).join('')}</table>` : '<div class="notice">No matching prices.</div>';
    }

    function readNode(path, callback) {
      db.ref(path).once('value').then(snap => {
        const rows = [];
        snap.forEach(c => {
          const value = c.val();
          if (value && typeof value === 'object') rows.push({_key:c.key, ...value});
        });
        callback(rows);
      }).catch(error => {
        console.error('Firebase read error:', path, error);
        const status = $('dbStatus');
        if (status) status.textContent = 'Firebase error';
      });
    }

    document.addEventListener('DOMContentLoaded', () => {
      $('globalSearch').oninput = () => { renderServices(); renderMarket(); };
      $('mandiSearch').oninput = renderMandi;
      $('mandiRefresh').onclick = window.loadMandi;

      // Read the existing Firebase database only. Nothing is written, deleted, or migrated.
      db.ref('services').on('value', snap => {
        services = [];
        snap.forEach(c => { const value = c.val(); if (value && typeof value === 'object') services.push({_key:c.key, ...value}); });
        renderServices();
        $('dbStatus').textContent = 'Live';
      }, error => { console.error(error); $('dbStatus').textContent = 'Firebase error'; });

      db.ref('marketplace').on('value', snap => {
        market = [];
        snap.forEach(c => { const value = c.val(); if (value && typeof value === 'object') market.push({_key:c.key, ...value}); });
        renderMarket();
      }, error => { console.error(error); $('dbStatus').textContent = 'Firebase error'; });
    }, {once:true});
  } catch (error) {
    console.error('Firebase unavailable:', error);
    const status = $('dbStatus');
    if (status) status.textContent = 'Offline';
  }
})();
