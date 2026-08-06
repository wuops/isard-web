// @ts-check
/**
 * Race-detail page bootstrap (vanilla).
 *
 * The HTML arrives pre-rendered in the default language (great for crawlers).
 * On load we re-render into the visitor's language, and re-render again whenever
 * they switch language — reusing the shared RaceDetail renderer so the client
 * output matches the baked HTML exactly. Theme (light/dark) is handled by the
 * shared theme.js.
 */
(function () {
  var race = window.__RACE__;
  var labels = window.__LABELS__;
  var slug = window.__SLUG__;
  if (!race || !labels || !window.RaceDetail) return;

  var SUPPORTED = ['es', 'ca', 'en'];

  function getLang() {
    try {
      var param = new URLSearchParams(window.location.search).get('lang');
      if (param && SUPPORTED.indexOf(param) !== -1) return param;
    } catch (e) {}
    var stored = localStorage.getItem('isard-lang');
    return (stored && SUPPORTED.indexOf(stored) !== -1) ? stored : 'es';
  }

  function apply(lang) {
    var head = document.getElementById('rd-header');
    var body = document.getElementById('rd-body');
    if (head) head.innerHTML = window.RaceDetail.renderHeader(race, labels, lang, slug);
    if (body) body.innerHTML = window.RaceDetail.renderBody(race, labels, lang);

    var meta = window.RaceDetail.metaFor(race, labels, lang);
    document.title = meta.title;
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', meta.description);
    document.documentElement.lang = lang;
  }

  // Build the header language selector (header.js already inserted .header-lang).
  if (window.i18nInit) window.i18nInit({});

  var prev = window.onLangChange;
  window.onLangChange = function (lang) {
    if (prev) prev(lang);
    apply(lang);
  };

  apply(getLang());
})();
