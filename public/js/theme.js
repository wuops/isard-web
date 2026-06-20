(function () {
  var STORAGE_KEY = 'isard-theme';

  function getPreferred() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var btn = document.querySelector('.theme-toggle');
    if (btn) btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    var icon = document.querySelector('.theme-toggle-icon');
    if (icon) icon.textContent = theme === 'dark' ? '☀' : '☾';
  }

  function toggle() {
    var current = document.documentElement.getAttribute('data-theme') || 'light';
    var next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEY, next);
    apply(next);
  }

  apply(getPreferred());

  document.addEventListener('DOMContentLoaded', function () {
    apply(getPreferred());
  });

  window.themeToggle = toggle;
})();
