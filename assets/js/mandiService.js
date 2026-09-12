/* DattaCity Live Mandi Service
 * Primary source: Government of India Open Government Data / Agmarknet dataset.
 * When no data.gov.in API key is configured, use DattaCity's own Vercel
 * server route (/api/mandi) so the browser does not depend on CORS or iframes.
 */
(function (window) {
  'use strict';

  const RESOURCE = '9ef84268-d588-465a-a308-a864a43d0070';
  const API_BASE = 'https://api.data.gov.in/resource/' + RESOURCE;
  const SERVER_API = '/api/mandi';
  const CACHE_KEY = 'dattacity_mandi_cache_v3';
  const CACHE_TTL = 30 * 60 * 1000;

  const MANDIS = [
    { key: 'Hisar', name: 'हिसार मंडी (Hisar)' },
    { key: 'Hansi', name: 'हांसी मंडी (Hansi)' },
    { key: 'Barwala', name: 'बरवाला मंडी (Barwala)' },
    { key: 'Adampur', name: 'आदमपुर मंडी (Adampur)' },
    { key: 'Sirsa', name: 'सिरसा मंडी (Sirsa)' },
    { key: 'Fatehabad', name: 'फतेहाबाद मंडी (Fatehabad)' }
  ];

  function getApiKey() {
    const runtimeKey = window.DATTA_MANDI_API_KEY || '';
    if (runtimeKey.trim()) return runtimeKey.trim();
    try { return localStorage.getItem('dattacity_mandi_api_key') || ''; } catch (_) { return ''; }
  }

  function normalizeCommodity(value) {
    const v = String(value || '').trim();
    const low = v.toLowerCase();
    if (low.includes('wheat') || low.includes('गेह')) return 'Wheat';
    if (low.includes('bajra') || low.includes('pearl millet')) return 'Bajra';
    if (low.includes('cotton') || low.includes('kapas')) return 'Cotton';
    if (low.includes('paddy') || low.includes('dhan') || low.includes('धान')) return 'Paddy';
    if (low.includes('mustard') || low.includes('sarson') || low.includes('राय')) return 'Sarson';
    if (low.includes('barley') || low.includes('जौ')) return 'Barley';
    if (low.includes('gram') || low.includes('chana') || low.includes('चना')) return 'Gram';
    if (low.includes('guar')) return 'Guar';
    if (low.includes('moong')) return 'Moong';
    return v;
  }

  function normalizeMarket(value) {
    const v = String(value || '').trim();
    const low = v.toLowerCase();
    const match = MANDIS.find(m => low === m.key.toLowerCase() || low.includes(m.key.toLowerCase()));
    return match ? match.key : v;
  }

  function normalizeRecord(r) {
    return {
      commodity: normalizeCommodity(r.commodity),
      commodityRaw: r.commodity || '',
      market: normalizeMarket(r.market),
      marketRaw: r.market || '',
      min_price: r.min_price,
      max_price: r.max_price,
      modal_price: r.modal_price,
      arrival_date: r.arrival_date || r.arrivalDate || '',
      updated_at: r.updated_at || r.timestamp || ''
    };
  }

  function readCache() {
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (cached && Array.isArray(cached.records)) return cached;
    } catch (_) {}
    return null;
  }

  function writeCache(records) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), records }));
    } catch (_) {}
  }

  async function request(url) {
    const response = await fetch(url, { cache: 'no-store', headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('Mandi API HTTP ' + response.status);
    const data = await response.json();
    if (!Array.isArray(data.records)) throw new Error('Mandi API returned no records');
    return data.records.map(normalizeRecord);
  }

  async function fetchServerLive() {
    const records = await request(SERVER_API + '?t=' + Date.now());
    if (!records.length) throw new Error('NO_SERVER_MANDI_RECORDS');
    return records;
  }

  async function fetchGovernmentLive(key) {
    const params = new URLSearchParams({
      'api-key': key,
      format: 'json',
      limit: '500',
      offset: '0'
    });
    params.set('filters[state]', 'Haryana');
    const records = await request(API_BASE + '?' + params.toString());

    const wanted = new Set(MANDIS.map(m => m.key.toLowerCase()));
    const filtered = records.filter(r => wanted.has(String(r.market).toLowerCase()));
    if (!filtered.length) throw new Error('NO_HARYANA_MANDI_RECORDS');
    return filtered;
  }

  async function fetchLive() {
    const key = getApiKey();
    if (key) return fetchGovernmentLive(key);
    return fetchServerLive();
  }

  async function getRates(forceRefresh) {
    const cached = readCache();
    if (!forceRefresh && cached && (Date.now() - cached.savedAt) < CACHE_TTL) {
      return cached.records;
    }

    try {
      const live = await fetchLive();
      writeCache(live);
      return live;
    } catch (error) {
      if (cached && Array.isArray(cached.records) && cached.records.length) {
        return cached.records.map(r => ({ ...r, fromCache: true }));
      }
      throw error;
    }
  }

  window.MandiService = {
    RESOURCE,
    MANDIS,
    getRates,
    getApiKey,
    setApiKey(key) {
      try { localStorage.setItem('dattacity_mandi_api_key', String(key || '').trim()); } catch (_) {}
    },
    clearApiKey() {
      try { localStorage.removeItem('dattacity_mandi_api_key'); } catch (_) {}
    }
  };

  /*
   * Navigation fails in the legacy page because several generations of inline
   * handlers compete for the same view state. This runtime-level router is
   * intentionally independent of those handlers and works with touch/click.
   * It is installed from mandiService because that script is already part of
   * the application boot sequence, so no new HTML script tag is required.
   */
  const VIEW_NAMES = ['landing', 'services', 'marketplace', 'weather', 'fasal'];
  let routerInstalled = false;
  let currentView = 'landing';

  function setView(name, push) {
    if (!VIEW_NAMES.includes(name)) return false;
    const target = document.getElementById('view-' + name);
    if (!target) return false;

    document.querySelectorAll('.view-section').forEach(view => {
      view.classList.remove('active');
      view.style.display = 'none';
      view.setAttribute('aria-hidden', 'true');
    });

    target.classList.add('active');
    target.style.display = 'flex';
    target.setAttribute('aria-hidden', 'false');
    currentView = name;

    const back = document.getElementById('backBtn');
    if (back) back.style.display = name === 'landing' ? 'none' : 'inline-flex';

    const headerButtons = document.getElementById('headerButtons');
    if (headerButtons) headerButtons.style.display = name === 'services' ? 'flex' : 'none';

    const add = document.getElementById('headerAddServiceBtn');
    const market = document.getElementById('headerMarketplaceBtn');
    if (add) add.style.display = name === 'services' ? 'inline-block' : 'none';
    if (market) market.style.display = name === 'services' ? 'inline-block' : 'none';

    if (push) {
      try { history.pushState({ dattacityView: name }, '', '#' + name); } catch (_) {}
    }

    window.scrollTo({ top: 0, behavior: 'instant' });

    // Let existing modules refresh their content after the view becomes visible.
    try {
      if (name === 'services' && typeof window.renderServices === 'function') window.renderServices();
      if (name === 'marketplace' && typeof window.renderMarketplace === 'function') window.renderMarketplace();
      if (name === 'weather' && typeof window.fetchAndRenderWeather === 'function') window.fetchAndRenderWeather();
      if (name === 'fasal' && typeof window.loadMandiRates === 'function') window.loadMandiRates(false);
    } catch (error) {
      console.warn('DattaCity view initialization:', error);
    }
    return true;
  }

  function viewForElement(element) {
    if (!element) return null;
    if (element.id === 'backBtn') return 'landing';
    if (element.classList.contains('card-services')) return 'services';
    if (element.classList.contains('card-buy') || element.classList.contains('card-sell')) return 'marketplace';
    if (element.classList.contains('card-weather')) return 'weather';
    if (element.classList.contains('card-fasal')) return 'fasal';
    return null;
  }

  function handleNavigationEvent(event) {
    const target = event.target;
    if (!target || !target.closest) return;
    const element = target.closest('.landing-card, #backBtn');
    const name = viewForElement(element);
    if (!name) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    setView(name, true);
  }

  function installRouter() {
    if (routerInstalled) return;
    routerInstalled = true;

    // Capture phase guarantees this runs before legacy inline onclick handlers.
    document.addEventListener('click', handleNavigationEvent, true);

    // Touch support for Android WebViews/browsers that do not synthesize click.
    document.addEventListener('touchend', handleNavigationEvent, { capture: true, passive: false });

    window.addEventListener('popstate', () => {
      const name = location.hash.replace('#', '');
      setView(VIEW_NAMES.includes(name) ? name : 'landing', false);
    });

    window.showView = function (name) { return setView(name, true); };
    window.openDattaView = window.showView;

    const hash = location.hash.replace('#', '');
    setView(VIEW_NAMES.includes(hash) ? hash : 'landing', false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installRouter, { once: true });
  } else {
    installRouter();
  }
})(window);
