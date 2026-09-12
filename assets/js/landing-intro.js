(() => {
  function initDattaCityLanding() {
    const overlay = document.getElementById('villageIntroOverlay');
    const enter = document.getElementById('enterVillageBtn');
    const skip = document.getElementById('skipIntroBtn');

    // Never allow a broken entrance animation to block the actual landing page.
    if (!overlay) return;

    const closeIntro = () => {
      overlay.classList.add('is-closing');
      window.setTimeout(() => {
        overlay.remove();
      }, 380);
      try { localStorage.setItem('dattacity_intro_seen', '1'); } catch (_) {}
    };

    if (enter) enter.addEventListener('click', closeIntro);
    if (skip) skip.addEventListener('click', closeIntro);

    // Intro is intentionally disabled by default until the core landing page is stable.
    // This prevents the decorative layer from ever blocking navigation.
    overlay.remove();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDattaCityLanding, { once: true });
  } else {
    initDattaCityLanding();
  }
})();
