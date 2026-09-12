(() => {
  const VIEW_IDS = ['landing', 'services', 'marketplace', 'weather', 'fasal'];

  function getView(name) {
    return document.getElementById(`view-${name}`);
  }

  function removeBlockingOverlays() {
    document.querySelectorAll('#villageIntroOverlay, .village-intro-overlay').forEach(el => el.remove());
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
    window.scrollTo(0, 0);
    return true;
  }

  function navigate(name) {
    if (!VIEW_IDS.includes(name)) return false;
    removeBlockingOverlays();
    if (!setActiveView(name)) return false;

    try {
      if (name === 'services' && typeof window.selectCategory === 'function') window.selectCategory('all');
      if (name === 'marketplace' && typeof window.selectMarketCategory === 'function') window.selectMarketCategory('marketplace-all');
      if (name === 'fasal' && typeof window.loadMandiRates === 'function') window.loadMandiRates(false);
      if (name === 'weather') {
        ['loadWeather', 'loadWeatherData', 'fetchWeather', 'updateWeather'].some(fn => {
          if (typeof window[fn] !== 'function') return false;
          window[fn]();
          return true;
        });
      }
    } catch (_) {}
    return true;
  }

  window.showView = navigate;

  function installNavigation() {
    removeBlockingOverlays();

    // Directly handle the landing cards. This avoids all legacy inline
    // onclick/showView code and works on both touch and desktop clicks.
    document.addEventListener('click', event => {
      const card = event.target.closest('.landing-card');
      if (card) {
        let view = null;
        if (card.classList.contains('card-services')) view = 'services';
        else if (card.classList.contains('card-buy') || card.classList.contains('card-sell')) view = 'marketplace';
        else if (card.classList.contains('card-weather')) view = 'weather';
        else if (card.classList.contains('card-fasal')) view = 'fasal';
        else if (card.classList.contains('card-kheti')) return; // keep external Kheti link
        if (view) {
          event.preventDefault();
          event.stopImmediatePropagation();
          navigate(view);
          return;
        }
      }

      const back = event.target.closest('#backBtn');
      if (back) {
        event.preventDefault();
        event.stopImmediatePropagation();
        navigate('landing');
      }
    }, true);

    const landing = getView('landing');
    if (landing) setActiveView('landing');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installNavigation, { once: true });
  } else {
    installNavigation();
  }
})();
