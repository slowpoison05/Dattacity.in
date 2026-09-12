(() => {
  const VIEW_IDS = ['landing', 'services', 'marketplace', 'weather', 'fasal'];

  function getView(name) {
    return document.getElementById(`view-${name}`);
  }

  function setActiveView(name) {
    const target = getView(name);
    if (!target) return false;

    document.querySelectorAll('.view-section').forEach(view => {
      const active = view === target;
      view.classList.toggle('active', active);
      view.style.display = active ? 'flex' : 'none';
    });

    const back = document.getElementById('backBtn');
    const headerButtons = document.getElementById('headerButtons');
    if (back) back.style.display = name === 'landing' ? 'none' : 'flex';
    if (headerButtons) headerButtons.style.display = name === 'landing' ? 'none' : 'flex';

    window.scrollTo({ top: 0, behavior: 'smooth' });
    return true;
  }

  const navigate = function(name) {
    if (!VIEW_IDS.includes(name) || !setActiveView(name)) return false;

    if (name === 'services' && typeof window.selectCategory === 'function') {
      try { window.selectCategory('all'); } catch (_) {}
    }
    if (name === 'marketplace' && typeof window.selectMarketCategory === 'function') {
      try { window.selectMarketCategory('marketplace-all'); } catch (_) {}
    }
    if (name === 'weather') {
      ['loadWeather', 'loadWeatherData', 'fetchWeather', 'updateWeather'].some(fn => {
        if (typeof window[fn] !== 'function') return false;
        try { window[fn](); } catch (_) {}
        return true;
      });
    }
    if (name === 'fasal' && typeof window.loadMandiRates === 'function') {
      try { window.loadMandiRates(false); } catch (_) {}
    }
    return true;
  };

  // Keep the public function for legacy inline handlers.
  window.showView = navigate;

  function removeOldIntro() {
    const overlay = document.getElementById('villageIntroOverlay');
    if (overlay) overlay.remove();
  }

  function installClickNavigation() {
    // Capture clicks before legacy inline onclick handlers. This makes the
    // new navigation reliable even if old scripts redefine showView later.
    document.addEventListener('click', event => {
      const target = event.target.closest('[onclick*="showView"]');
      if (!target) return;

      const match = target.getAttribute('onclick').match(/showView\(['\"](landing|services|marketplace|weather|fasal)['\"]\)/);
      if (!match) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      navigate(match[1]);
    }, true);
  }

  function ensureNavigationWorks() {
    removeOldIntro();
    window.showView = navigate;

    const landing = getView('landing');
    if (landing && !document.querySelector('.view-section.active')) {
      setActiveView('landing');
    }

    const overlays = document.querySelectorAll('#sidebarOverlay');
    overlays.forEach((el, i) => {
      if (i > 0) el.id = `sidebarOverlay${i + 1}`;
    });

    installClickNavigation();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureNavigationWorks, { once: true });
  } else {
    ensureNavigationWorks();
  }
})();
