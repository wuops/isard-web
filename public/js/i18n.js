(function () {
  var SUPPORTED = ['es', 'ca', 'en'];
  var DEFAULT = 'es';

  function getLang() {
    var stored = localStorage.getItem('isard-lang');
    if (stored && SUPPORTED.indexOf(stored) !== -1) return stored;
    return DEFAULT;
  }

  function setLang(lang) {
    localStorage.setItem('isard-lang', lang);
  }

  function applyTranslations(translations, lang) {
    var t = translations[lang] || translations[DEFAULT];
    var els = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
      var key = els[i].getAttribute('data-i18n');
      if (t[key] !== undefined) {
        if (els[i].tagName === 'INPUT' || els[i].tagName === 'TEXTAREA') {
          els[i].placeholder = t[key];
        } else {
          els[i].innerHTML = t[key];
        }
      }
    }
    document.documentElement.lang = lang === 'ca' ? 'ca' : lang === 'en' ? 'en' : 'es';
  }

  function createSelector() {
    var lang = getLang();
    var nav = document.createElement('nav');
    nav.className = 'lang-nav';
    var select = document.createElement('select');
    select.className = 'lang-select';
    select.setAttribute('aria-label', 'Language');
    var labels = { es: 'ES', ca: 'CA', en: 'EN' };
    for (var i = 0; i < SUPPORTED.length; i++) {
      var opt = document.createElement('option');
      opt.value = SUPPORTED[i];
      opt.textContent = labels[SUPPORTED[i]];
      if (SUPPORTED[i] === lang) opt.selected = true;
      select.appendChild(opt);
    }
    select.addEventListener('change', function () {
      setLang(this.value);
      applyTranslations(window.__i18n, this.value);
      if (window.onLangChange) window.onLangChange(this.value);
    });
    nav.appendChild(select);
    document.body.insertBefore(nav, document.body.firstChild);
  }

  function init(translations) {
    window.__i18n = translations;
    createSelector();
    applyTranslations(translations, getLang());
  }

  window.i18nInit = init;
})();
