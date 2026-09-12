(() => {
  const VIEW_IDS = ['landing', 'services', 'marketplace', 'weather', 'fasal'];

  function getView(name) {
    return document.getElementById(`view-${name}`);
  }

  function setActiveView(name) {
    const target = getView(name);
    if (!target) return false;

    document.querySelectorAll('.view-section').forEach(view => {
      view.classList.toggle('active', view === target);
      if (view !== target) view.style.display = 'none';
    });

    target.classList.add('active');
    target.style.display = name === 'landing' ? 'flex' : 'flex';

    const back = document.getElementById('backBtn');
    const headerButtons = document.getElementById('headerButtons');
    if (back) back.style.display = name === 'landing' ? 'none' : 'flex';
    if (headerButtons) headerButtons.style.display = name === 'landing' ? 'none' : 'flex';

    window.scrollTo({ top: 0, behavior: 'smooth' });
    return true;
  }

  // Central navigation controller. Keep it independent from the visual redesign
  // so every existing landing-card/category button continues to reveal its view.
  window.showView = function(name) {
    if (!VIEW_IDS.includes(name)) return false;
    const opened = setActiveView(name);
    if (!opened) return false;

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
    if (name === 'fasal') {
      if (typeof window.loadMandiRates === 'function') {
        try { window.loadMandiRates(false); } catch (_) {}
      }
    }

    return true;
  };

  function removeOldIntro() {
    const overlay = document.getElementById('villageIntroOverlay');
    if (overlay) overlay.remove();
  }

  function ensureNavigationWorks() {
    removeOldIntro();

    // Some older handlers rely on the landing view being explicitly active.
    const landing = getView('landing');
    if (landing && !document.querySelector('.view-section.active')) {
      setActiveView('landing');
    }

    // Fix duplicate mobile overlay IDs from the legacy markup without deleting
    // either element's functionality.
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
