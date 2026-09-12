(() => {
  // DattaCity now opens directly into the product UI. The old village entrance
  // animation and its conflicting third-party mandi iframe are removed.
  function boot() {
    const overlay = document.getElementById('villageIntroOverlay');
    if (overlay) overlay.remove();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
