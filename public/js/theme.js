(function () {
  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var btn = document.querySelector('.theme-toggle');
    if (btn) btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    var icon = document.querySelector('.theme-toggle-icon');
    if (icon) icon.textContent = theme === 'dark' ? '☀' : '☾';
  }

  // Always dark by default — no OS/browser preference, no remembered choice.
  // The toggle can still preview light mode, but it never persists: the next
  // page load (or this one, on reload) always starts dark again.
  function toggle() {
    var current = document.documentElement.getAttribute('data-theme') || 'dark';
    apply(current === 'dark' ? 'light' : 'dark');
  }

  apply('dark');

  document.addEventListener('DOMContentLoaded', function () {
    apply('dark');
  });

  window.themeToggle = toggle;
})();
