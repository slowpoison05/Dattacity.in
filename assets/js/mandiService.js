/* DattaCity Live Mandi Service
 * Source: Government of India Open Government Data / Agmarknet dataset.
 * The API key is intentionally supplied at deploy/runtime, never hard-coded in source.
 */
(function (window) {
  'use strict';

  const RESOURCE = '9ef84268-d588-465a-a308-a864a43d0070';
  const API_BASE = 'https://api.data.gov.in/resource/' + RESOURCE;
  const CACHE_KEY = 'dattacity_mandi_cache_v2';
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
    if (!data.records || !Array.isArray(data.records)) throw new Error('Mandi API returned no records');
    return data.records.map(normalizeRecord);
  }

  async function fetchLive() {
    const key = getApiKey();
    if (!key) {
      throw new Error('DATA_GOV_API_KEY_MISSING');
    }

    const params = new URLSearchParams({
      'api-key': key,
      format: 'json',
      limit: '500',
      offset: '0'
    });

    // Pull Haryana records, then keep the requested Hisar-area mandis in the browser.
    params.set('filters[state]', 'Haryana');
    const records = await request(API_BASE + '?' + params.toString());

    const wanted = new Set(MANDIS.map(m => m.key.toLowerCase()));
    const filtered = records.filter(r => wanted.has(String(r.market).toLowerCase()));
    if (!filtered.length) {
      throw new Error('NO_HARYANA_MANDI_RECORDS');
    }
    return filtered;
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
      // Never manufacture a price. If the live API is unavailable, use only a recent
      // real cache; otherwise surface the reason to the UI.
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
})(window);
