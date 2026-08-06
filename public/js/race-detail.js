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
  initMap();

  // ---- themed Leaflet map (CARTO Positron light / Dark Matter dark) ----------
  function initMap() {
    var el = document.getElementById('rd-map');
    if (!el || !window.L) return;
    var lat = parseFloat(el.getAttribute('data-lat'));
    var lon = parseFloat(el.getAttribute('data-lon'));
    if (isNaN(lat) || isNaN(lon)) return;

    var color = '#D5FF5F'; // brand lime

    var map = window.L.map(el, {
      scrollWheelZoom: false, zoomControl: true, attributionControl: true
    }).setView([lat, lon], 13);

    var attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' +
      ' contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
    var tileOpts = { maxZoom: 19, subdomains: 'abcd', attribution: attribution };
    var layers = {
      light: window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', tileOpts),
      dark: window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', tileOpts)
    };
    var current = null;
    function themeNow() {
      return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    }
    function syncTheme() {
      var want = themeNow();
      if (current === want) return;
      if (current) map.removeLayer(layers[current]);
      layers[want].addTo(map);
      current = want;
    }
    syncTheme();

    var pin = '<svg width="28" height="36" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M14 0C6.3 0 0 6.3 0 14c0 9.9 12.1 20.6 13.1 21.5a1.4 1.4 0 0 0 1.8 0C15.9 34.6 28 23.9 28 14 28 6.3 21.7 0 14 0z" fill="' + color + '"/>' +
      '<circle cx="14" cy="14" r="5" fill="#0B0B0B"/></svg>';
    window.L.marker([lat, lon], {
      keyboard: false,
      icon: window.L.divIcon({ className: 'rd-pin', html: pin, iconSize: [28, 36], iconAnchor: [14, 36] })
    }).addTo(map);

    // Follow the site's light/dark toggle (theme.js flips data-theme on <html>).
    new MutationObserver(syncTheme).observe(document.documentElement, {
      attributes: true, attributeFilter: ['data-theme']
    });
  }
})();
