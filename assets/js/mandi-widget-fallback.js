/* Live Haryana mandi panel for static/client pages.
 * DattaCity calls its own /api/mandi server route so the browser is not
 * dependent on a third-party iframe or CORS policy.
 */
(function (window, document) {
  'use strict';

  const API = '/api/mandi';
  let allRecords = [];
  let loadedAt = '';

  const esc = value => String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

  const money = value => value == null || value === '' ? '—' : '₹' + Number(value).toLocaleString('en-IN');

  function container() {
    return document.getElementById('mandiRatesList');
  }

  function shell() {
    const el = container();
    if (!el) return null;
    el.innerHTML = `
      <div class="dattacity-mandi-live" style="width:100%;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;padding:12px 14px;background:#e8f5e9;border:1px solid #c8e6c9;border-radius:12px;color:#1b5e20;margin-bottom:12px;">
          <strong>🟢 लाइव हरियाणा मंडी भाव</strong>
          <span id="mandiSourceStatus" style="font-size:12px;">Agmarknet / APMC डेटा</span>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">
          <input id="liveMandiCrop" type="search" placeholder="🔎 फसल खोजें…" style="flex:1;min-width:170px;padding:11px 12px;border:1px solid #d6ddd6;border-radius:10px;font-size:15px;">
          <select id="liveMandiMarket" style="min-width:155px;padding:11px 12px;border:1px solid #d6ddd6;border-radius:10px;font-size:15px;background:#fff;">
            <option value="">सभी मंडियां</option>
          </select>
          <button id="liveMandiRefresh" type="button" style="padding:11px 15px;border:0;border-radius:10px;background:#2e7d32;color:#fff;font-weight:700;cursor:pointer;">↻ ताज़ा करें</button>
        </div>
        <div id="liveMandiTable" style="overflow:auto;border:1px solid #e0e7e0;border-radius:14px;background:#fff;min-height:180px;"></div>
        <div id="liveMandiMeta" style="font-size:11px;color:#777;text-align:center;margin-top:8px;"></div>
      </div>`;

    document.getElementById('liveMandiCrop').addEventListener('input', render);
    document.getElementById('liveMandiMarket').addEventListener('change', render);
    document.getElementById('liveMandiRefresh').addEventListener('click', () => load(true));
    return el;
  }

  function render() {
    const table = document.getElementById('liveMandiTable');
    if (!table) return;

    const crop = String(document.getElementById('liveMandiCrop')?.value || '').trim().toLowerCase();
    const market = String(document.getElementById('liveMandiMarket')?.value || '').trim().toLowerCase();

    const rows = allRecords.filter(r => {
      const c = String(r.commodity || '').toLowerCase();
      const m = String(r.market || '').toLowerCase();
      return (!crop || c.includes(crop)) && (!market || m === market);
    }).slice(0, 100);

    if (!rows.length) {
      table.innerHTML = '<div style="padding:35px 15px;text-align:center;color:#777;">इस खोज के लिए कोई मंडी भाव नहीं मिला।</div>';
      return;
    }

    table.innerHTML = `
      <table style="width:100%;border-collapse:collapse;font-size:14px;min-width:560px;">
        <thead><tr style="background:#f2f7f2;color:#285c2c;text-align:left;">
          <th style="padding:11px 10px;">फसल</th>
          <th style="padding:11px 10px;">मंडी</th>
          <th style="padding:11px 10px;text-align:right;">न्यूनतम</th>
          <th style="padding:11px 10px;text-align:right;">अधिकतम</th>
          <th style="padding:11px 10px;text-align:right;">मोडल भाव</th>
        </tr></thead>
        <tbody>${rows.map(r => `
          <tr style="border-top:1px solid #edf1ed;">
            <td style="padding:10px;font-weight:600;">${esc(r.commodity)}</td>
            <td style="padding:10px;">${esc(r.market)}</td>
            <td style="padding:10px;text-align:right;">${money(r.min_price)}</td>
            <td style="padding:10px;text-align:right;">${money(r.max_price)}</td>
            <td style="padding:10px;text-align:right;font-weight:700;color:#1b5e20;">${money(r.modal_price)}</td>
          </tr>`).join('')}</tbody>
      </table>`;

    const meta = document.getElementById('liveMandiMeta');
    if (meta) meta.textContent = `${rows.length} भाव दिखाए जा रहे हैं • ₹/क्विंटल • ${loadedAt ? 'डेटा प्राप्त: ' + loadedAt : ''}`;
  }

  function fillMarkets() {
    const select = document.getElementById('liveMandiMarket');
    if (!select) return;
    const markets = [...new Set(allRecords.map(r => String(r.market || '').trim()).filter(Boolean))].sort((a,b) => a.localeCompare(b));
    select.innerHTML = '<option value="">सभी मंडियां</option>' + markets.map(m => `<option value="${esc(m)}">${esc(m)}</option>`).join('');
  }

  async function load(force) {
    const el = shell();
    if (!el) return;
    const table = document.getElementById('liveMandiTable');
    const status = document.getElementById('mandiSourceStatus');
    if (table) table.innerHTML = '<div style="padding:45px 15px;text-align:center;color:#666;">⏳ आज के मंडी भाव लोड हो रहे हैं…</div>';

    try {
      const url = force ? `${API}?t=${Date.now()}` : API;
      const response = await fetch(url, { cache: 'no-store', headers: { Accept: 'application/json' } });
      const data = await response.json();
      if (!response.ok || !Array.isArray(data.records) || !data.records.length) {
        throw new Error(data?.error || 'No mandi records');
      }
      allRecords = data.records;
      loadedAt = new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });
      if (status) status.textContent = data.sourceLabel || 'Agmarknet / APMC डेटा';
      fillMarkets();
      render();
    } catch (error) {
      if (table) table.innerHTML = `
        <div style="padding:38px 15px;text-align:center;color:#777;">
          <div style="font-size:38px;margin-bottom:8px;">⚠️</div>
          <strong style="color:#555;">मंडी भाव अभी लोड नहीं हो पाए</strong>
          <div style="font-size:12px;margin:8px 0 15px;">इंटरनेट जांचें और फिर ताज़ा करें।</div>
          <button type="button" onclick="window.loadMandiRates(true)" style="padding:10px 18px;border:0;border-radius:9px;background:#2e7d32;color:white;font-weight:700;">↻ फिर कोशिश करें</button>
        </div>`;
      if (status) status.textContent = 'डेटा उपलब्ध नहीं';
      console.warn('DattaCity mandi feed failed:', error);
    }
  }

  function install() {
    // If an official data.gov.in key is configured, keep the existing service path.
    if (window.MandiService && window.MandiService.getApiKey && window.MandiService.getApiKey()) return;
    window.loadMandiRates = function (forceRefresh) { return load(Boolean(forceRefresh)); };
    window.refreshMandiRates = function () { return load(true); };
    if (document.getElementById('view-fasal')?.classList.contains('active')) load(false);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})(window, document);
