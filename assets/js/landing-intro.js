(() => {
  function initDattaCityLanding() {
    const overlay = document.getElementById('villageIntroOverlay');
    const enter = document.getElementById('enterVillageBtn');
    const skip = document.getElementById('skipIntroBtn');

    // Never allow a broken entrance animation to block the actual landing page.
    if (overlay) {
      const closeIntro = () => {
        overlay.classList.add('is-closing');
        window.setTimeout(() => overlay.remove(), 380);
        try { localStorage.setItem('dattacity_intro_seen', '1'); } catch (_) {}
      };
      if (enter) enter.addEventListener('click', closeIntro);
      if (skip) skip.addEventListener('click', closeIntro);

      // Decorative intro stays disabled until the core landing page is stable.
      overlay.remove();
    }
  }

  function installLiveMandiFallback() {
    // The government data.gov.in route needs a private API key. On static GitHub
    // hosting we must not expose that key in browser code. Use BajarBhav's live
    // Haryana widget instead; it is an embeddable live panel backed by Agmarknet/APMC.
    if (window.MandiService && window.MandiService.getApiKey && window.MandiService.getApiKey()) return;

    const renderWidget = () => {
      const container = document.getElementById('mandiRatesList');
      if (!container) return;

      const stamp = Date.now();
      container.innerHTML = `
        <div class="dattacity-live-mandi" style="width:100%;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:10px;padding:12px 14px;background:#e8f5e9;border:1px solid #c8e6c9;border-radius:12px;color:#1b5e20;">
            <strong>🟢 लाइव हरियाणा मंडी भाव</strong>
            <span style="font-size:12px;">Agmarknet / APMC डेटा</span>
          </div>
          <iframe
            src="https://www.bajarbhav.in/embed/state/haryana?refresh=${stamp}"
            title="Live Haryana Mandi Bhav"
            width="100%"
            style="display:block;width:100%;min-height:560px;border:1px solid #e2e8e4;border-radius:16px;background:#fff;"
            loading="eager"
            referrerpolicy="strict-origin-when-cross-origin">
          </iframe>
          <div style="margin-top:8px;text-align:center;font-size:11px;color:#777;">
            लाइव स्रोत: Agmarknet / APMC • BajarBhav widget
          </div>
        </div>`;
    };

    // The embedded panel has its own market/crop data. Hide the old API-only
    // search/filter row so users don't get controls that cannot affect the iframe.
    const search = document.getElementById('mandiCropSearch');
    const filter = document.getElementById('mandiFilter');
    const refresh = document.querySelector('#view-fasal button[onclick="refreshMandiRates()"]');
    const controls = search && search.parentElement;
    if (controls) controls.style.display = 'none';
    if (refresh) refresh.style.display = 'none';
    if (search) search.disabled = true;
    if (filter) filter.disabled = true;

    window.loadMandiRates = renderWidget;
    window.refreshMandiRates = renderWidget;

    // If the page is already on the mandi view, render immediately.
    const fasal = document.getElementById('view-fasal');
    if (fasal && fasal.classList.contains('active')) renderWidget();
  }

  function boot() {
    initDattaCityLanding();
    installLiveMandiFallback();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
