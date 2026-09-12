(() => {
  const VIEWS = ['landing', 'services', 'marketplace', 'weather', 'fasal'];

  const getView = name => document.getElementById('view-' + name);

  function cleanOverlays() {
    document.querySelectorAll('#villageIntroOverlay, .village-intro-overlay').forEach(el => {
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
    if (back) back.style.display = name === 'landing' ? 'none' : 'inline-flex';
    if (buttons) buttons.style.display = name === 'landing' ? 'none' : 'flex';

    const userBtn = document.getElementById('headerAddServiceBtn');
    const marketBtn = document.getElementById('headerMarketplaceBtn');
    if (userBtn) userBtn.style.display = name === 'services' ? 'inline-block' : 'none';
    if (marketBtn) marketBtn.style.display = name === 'services' ? 'inline-block' : 'none';

    window.scrollTo(0, 0);

    try {
      if (name === 'services') {
        if (typeof window.selectCategory === 'function') window.selectCategory('all');
        else if (typeof window.renderServices === 'function') window.renderServices();
      }
      if (name === 'marketplace') {
        if (typeof window.selectMarketCategory === 'function') window.selectMarketCategory('marketplace-all');
        else if (typeof window.renderMarketplace === 'function') window.renderMarketplace();
      }
      if (name === 'fasal' && typeof window.loadMandiRates === 'function') window.loadMandiRates(false);
      if (name === 'weather' && typeof window.fetchAndRenderWeather === 'function') window.fetchAndRenderWeather();
    } catch (e) {
      console.warn('Datta City module init:', e);
    }
    return true;
  }

  window.showView = show;
  window.openDattaView = show;

  function viewFromCard(card) {
    if (!card) return null;
    if (card.classList.contains('card-services')) return 'services';
    if (card.classList.contains('card-buy') || card.classList.contains('card-sell')) return 'marketplace';
    if (card.classList.contains('card-weather')) return 'weather';
    if (card.classList.contains('card-fasal')) return 'fasal';
    return null;
  }

  function navigateFromElement(el, event) {
    if (!el) return false;
    if (el.id === 'backBtn') {
      if (event) { event.preventDefault(); event.stopPropagation(); }
      return show('landing');
    }
    const view = viewFromCard(el);
    if (!view) return false;
    if (event) { event.preventDefault(); event.stopPropagation(); }
    return show(view);
  }

  function install() {
    cleanOverlays();

    // Bind directly to the actual cards. This avoids conflicts with the old inline handlers.
    document.querySelectorAll('.landing-card').forEach(card => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', e => navigateFromElement(card, e), false);
      card.addEventListener('pointerup', e => navigateFromElement(card, e), false);
      card.addEventListener('touchend', e => navigateFromElement(card, e), false);
    });

    const back = document.getElementById('backBtn');
    if (back) {
      back.addEventListener('click', e => navigateFromElement(back, e), false);
    }

    // Capture fallback for dynamically recreated landing cards.
    document.addEventListener('click', e => {
      const card = e.target && e.target.closest ? e.target.closest('.landing-card') : null;
      if (card) navigateFromElement(card, e);
    }, true);

    // Legacy intro must never block the application.
    cleanOverlays();
    show('landing');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();