/* Live fallback for static hosting: BajarBhav provides an embeddable Haryana panel
 * that refreshes from Agmarknet/APMC data without exposing an API key in DattaCity.
 */
(function (window, document) {
  'use strict';

  function showLiveHaryanaWidget() {
    const container = document.getElementById('mandiRatesList');
    if (!container) return;

    container.innerHTML = `
      <div style="width:100%;display:flex;flex-direction:column;gap:10px;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;padding:12px 14px;background:#e8f5e9;border:1px solid #c8e6c9;border-radius:12px;color:#1b5e20;">
          <strong>🟢 लाइव हरियाणा मंडी भाव</strong>
          <span style="font-size:12px;">Agmarknet/APMC स्रोत • अपने-आप अपडेट</span>
        </div>
        <iframe
          src="https://www.bajarbhav.in/embed/state/haryana"
          title="Live Haryana Mandi Bhav"
          width="100%"
          style="min-height:520px;border:1px solid #e2e8e4;border-radius:16px;background:white;"
          loading="lazy"
          referrerpolicy="strict-origin-when-cross-origin">
        </iframe>
        <p style="font-size:11px;color:#777;text-align:center;margin:0;">
          भाव ₹/क्विंटल में • Live source: Agmarknet/APMC via BajarBhav
        </p>
      </div>`;
  }

  function install() {
    // Keep the government API path when a DATA_GOV_API_KEY is configured.
    // Use the live embed only when no key is available.
    if (window.MandiService && window.MandiService.getApiKey && window.MandiService.getApiKey()) return;
    const originalLoad = window.loadMandiRates;
    if (typeof originalLoad === 'function') {
      window.loadMandiRates = function () {
        showLiveHaryanaWidget();
      };
    }
    const originalRefresh = window.refreshMandiRates;
    window.refreshMandiRates = function () {
      showLiveHaryanaWidget();
    };
    if (document.getElementById('view-fasal')?.classList.contains('active')) {
      showLiveHaryanaWidget();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once:true });
  else install();
})(window, document);
