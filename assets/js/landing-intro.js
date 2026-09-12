(() => {
  const VIEWS = ['landing', 'services', 'marketplace', 'weather', 'fasal'];

  const getView = name => document.getElementById('view-' + name);

  function cleanOverlays() {
    document.querySelectorAll('#villageIntroOverlay, .village-intro-overlay').forEach(el => {
      el.style.display = 'none';
      el.style.pointerEvents = 'none';
      el.remove();
    });
    document.body.classList.remove('village-intro-active');
  }

  function show(name) {
    if (!VIEWS.includes(name)) return false;
    const target = getView(name);
    if (!target) return false;
    cleanOverlays();

    document.querySelectorAll('.view-section').forEach(view => {
      view.classList.remove('active');
      view.style.display = 'none';
    });
    target.classList.add('active');
    target.style.display = 'flex';

    const back = document.getElementById('backBtn');
    const buttons = document.getElementById('headerButtons');
    if (back) back.style.display = name === 'landing' ? 'none' : 'flex';
    if (buttons) buttons.style.display = name === 'landing' ? 'none' : 'flex';
    window.scrollTo(0, 0);

    // Initialise the existing page modules when available.
    try {
      if (name === 'services' && typeof window.selectCategory === 'function') window.selectCategory('all');
      if (name === 'marketplace' && typeof window.selectMarketCategory === 'function') window.selectMarketCategory('marketplace-all');
      if (name === 'fasal' && typeof window.loadMandiRates === 'function') window.loadMandiRates(false);
      if (name === 'weather') {
        ['loadWeather','loadWeatherData','fetchWeather','updateWeather'].some(fn => {
          if (typeof window[fn] !== 'function') return false;
          window[fn]();
          return true;
        });
      }
    } catch (e) { console.warn('Datta City module init:', e); }
    return true;
  }

  // Public API for existing code.
  window.showView = show;
  window.openDattaView = show;

  function viewFromCard(card) {
    if (card.classList.contains('card-services')) return 'services';
    if (card.classList.contains('card-buy') || card.classList.contains('card-sell')) return 'marketplace';
    if (card.classList.contains('card-weather')) return 'weather';
    if (card.classList.contains('card-fasal')) return 'fasal';
    return null;
  }

  function handleNavigation(event) {
    const el = event.target && event.target.closest ? event.target.closest('.landing-card, #backBtn') : null;
    if (!el) return;

    if (el.id === 'backBtn') {
      event.preventDefault();
      event.stopImmediatePropagation();
      show('landing');
      return;
    }

    const view = viewFromCard(el);
    if (!view) return; // Kheti keeps its normal external link.

    event.preventDefault();
    event.stopImmediatePropagation();
    show(view);
  }

  function install() {
    cleanOverlays();
    // Capture phase runs before old inline handlers and legacy scripts.
    document.addEventListener('click', handleNavigation, true);
    document.addEventListener('pointerup', handleNavigation, true);
    document.addEventListener('touchend', handleNavigation, true);
    show('landing');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
