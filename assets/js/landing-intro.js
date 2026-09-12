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

  // Central navigation controller. It deliberately runs again on DOM ready so
  // legacy inline scripts cannot overwrite the working navigation after load.
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

  window.showView = navigate;

  function removeOldIntro() {
    const overlay = document.getElementById('villageIntroOverlay');
    if (overlay) overlay.remove();
  }

  function ensureNavigationWorks() {
    removeOldIntro();
    // Reinstall after every legacy inline script has executed.
    window.showView = navigate;

    const landing = getView('landing');
    if (landing && !document.querySelector('.view-section.active')) {
      setActiveView('landing');
    }

    // The legacy markup accidentally contains two identical overlay IDs.
    const overlays = document.querySelectorAll('#sidebarOverlay');
    overlays.forEach((el, i) => {
      if (i > 0) el.id = `sidebarOverlay${i + 1}`;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureNavigationWorks, { once: true });
  } else {
    ensureNavigationWorks();
  }
})();
