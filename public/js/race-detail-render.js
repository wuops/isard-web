/**
 * Shared race-detail renderer (UMD).
 *
 * Runs both in Node (scripts/build-races.js, to pre-render the static SEO pages)
 * and in the browser (race-detail.js, to re-localize on language switch). Keeping
 * a single implementation guarantees the crawlable HTML and the client-rendered
 * HTML never drift.
 *
 * Pure string building — no DOM, no fetch — so it is safe to require() in Node.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RaceDetail = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var LANGS = ['ca', 'es', 'en'];

  // Sport glyphs — Font Awesome Free 6 solid (icons CC BY 4.0, code MIT). Road &
  // trail share the running figure and are told apart by colour, like the app.
  var SPORT_ICONS = {
    road_running:  { vb: '0 0 448 512', d: 'M320 48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM125.7 175.5c9.9-9.9 23.4-15.5 37.5-15.5c1.9 0 3.8 .1 5.6 .3L137.6 254c-9.3 28 1.7 58.8 26.8 74.5l86.2 53.9-25.4 88.8c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l28.7-100.4c5.9-20.6-2.6-42.6-20.7-53.9L238 299l30.9-82.4 5.1 12.3C289 264.7 323.9 288 362.7 288l21.3 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-21.3 0c-12.9 0-24.6-7.8-29.5-19.7l-6.3-15c-14.6-35.1-44.1-61.9-80.5-73.1l-48.7-15c-11.1-3.4-22.7-5.2-34.4-5.2c-31 0-60.8 12.3-82.7 34.3L57.4 153.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l23.1-23.1zM91.2 352L32 352c-17.7 0-32 14.3-32 32s14.3 32 32 32l69.6 0c19 0 36.2-11.2 43.9-28.5L157 361.6l-9.5-6c-17.5-10.9-30.5-26.8-37.9-44.9L91.2 352z' },
    trail_running: { vb: '0 0 448 512', d: 'M320 48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM125.7 175.5c9.9-9.9 23.4-15.5 37.5-15.5c1.9 0 3.8 .1 5.6 .3L137.6 254c-9.3 28 1.7 58.8 26.8 74.5l86.2 53.9-25.4 88.8c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l28.7-100.4c5.9-20.6-2.6-42.6-20.7-53.9L238 299l30.9-82.4 5.1 12.3C289 264.7 323.9 288 362.7 288l21.3 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-21.3 0c-12.9 0-24.6-7.8-29.5-19.7l-6.3-15c-14.6-35.1-44.1-61.9-80.5-73.1l-48.7-15c-11.1-3.4-22.7-5.2-34.4-5.2c-31 0-60.8 12.3-82.7 34.3L57.4 153.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l23.1-23.1zM91.2 352L32 352c-17.7 0-32 14.3-32 32s14.3 32 32 32l69.6 0c19 0 36.2-11.2 43.9-28.5L157 361.6l-9.5-6c-17.5-10.9-30.5-26.8-37.9-44.9L91.2 352z' },
    cycling:       { vb: '0 0 640 512', d: 'M400 96a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm27.2 64l-61.8-48.8c-17.3-13.6-41.7-13.8-59.1-.3l-83.1 64.2c-30.7 23.8-28.5 70.8 4.3 91.6L288 305.1 288 416c0 17.7 14.3 32 32 32s32-14.3 32-32l0-128c0-10.7-5.3-20.7-14.2-26.6L295 232.9l60.3-48.5L396 217c5.7 4.5 12.7 7 20 7l64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-52.8 0zM56 384a72 72 0 1 1 144 0A72 72 0 1 1 56 384zm200 0A128 128 0 1 0 0 384a128 128 0 1 0 256 0zm184 0a72 72 0 1 1 144 0 72 72 0 1 1 -144 0zm200 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0z' },
    hiking:        { vb: '0 0 384 512', d: 'M192 48a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm51.3 182.7L224.2 307l49.7 49.7c9 9 14.1 21.2 14.1 33.9l0 89.4c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-82.7-73.9-73.9c-15.8-15.8-22.2-38.6-16.9-60.3l20.4-84c8.3-34.1 42.7-54.9 76.7-46.4c19 4.8 35.6 16.4 46.4 32.7L305.1 208l30.9 0 0-24c0-13.3 10.7-24 24-24s24 10.7 24 24l0 55.8c0 .1 0 .2 0 .2s0 .2 0 .2L384 488c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-216-39.4 0c-16 0-31-8-39.9-21.4l-13.3-20zM81.1 471.9L117.3 334c3 4.2 6.4 8.2 10.1 11.9l41.9 41.9L142.9 488.1c-4.5 17.1-22 27.3-39.1 22.8s-27.3-22-22.8-39.1zm55.5-346L101.4 266.5c-3 12.1-14.9 19.9-27.2 17.9l-47.9-8c-14-2.3-22.9-16.3-19.2-30L31.9 155c9.5-34.8 41.1-59 77.2-59l4.2 0c15.6 0 27.1 14.7 23.3 29.8z' },
    other:         { vb: '0 0 320 512', d: 'M160 48a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zM126.5 199.3c-1 .4-1.9 .8-2.9 1.2l-8 3.5c-16.4 7.3-29 21.2-34.7 38.2l-2.6 7.8c-5.6 16.8-23.7 25.8-40.5 20.2s-25.8-23.7-20.2-40.5l2.6-7.8c11.4-34.1 36.6-61.9 69.4-76.5l8-3.5c20.8-9.2 43.3-14 66.1-14c44.6 0 84.8 26.8 101.9 67.9L281 232.7l21.4 10.7c15.8 7.9 22.2 27.1 14.3 42.9s-27.1 22.2-42.9 14.3L247 287.3c-10.3-5.2-18.4-13.8-22.8-24.5l-9.6-23-19.3 65.5 49.5 54c5.4 5.9 9.2 13 11.2 20.8l23 92.1c4.3 17.1-6.1 34.5-23.3 38.8s-34.5-6.1-38.8-23.3l-22-88.1-70.7-77.1c-14.8-16.1-20.3-38.6-14.7-59.7l16.9-63.5zM68.7 398l25-62.4c2.1 3 4.5 5.8 7 8.6l40.7 44.4-14.5 36.2c-2.4 6-6 11.5-10.6 16.1L81.6 505c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L68.7 398z' }
  };

  var WEEKDAYS = {
    ca: ['Dg', 'Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds'],
    es: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  };

  // Page-chrome strings for the detail page (enum vocabulary comes from labels.json).
  var UI = {
    ca: { back: 'Curses', distances: 'Distàncies', registration: 'Inscripció', status: 'Estat', links: 'Enllaços', register: 'Inscripció', official: 'Web oficial', results: 'Resultats', route: 'Recorregut', gpx: 'GPX', instagram: 'Instagram', facebook: 'Facebook', tbc: 'Data per confirmar', viewMap: 'Veure el mapa', organizer: 'Organitza', price: 'Preu' },
    es: { back: 'Carreras', distances: 'Distancias', registration: 'Inscripción', status: 'Estado', links: 'Enlaces', register: 'Inscripción', official: 'Sitio oficial', results: 'Resultados', route: 'Recorrido', gpx: 'GPX', instagram: 'Instagram', facebook: 'Facebook', tbc: 'Fecha por confirmar', viewMap: 'Ver el mapa', organizer: 'Organiza', price: 'Precio' },
    en: { back: 'Races', distances: 'Distances', registration: 'Registration', status: 'Status', links: 'Links', register: 'Register', official: 'Official site', results: 'Results', route: 'Route', gpx: 'GPX', instagram: 'Instagram', facebook: 'Facebook', tbc: 'Date to be confirmed', viewMap: 'View the map', organizer: 'Organiser', price: 'Price' }
  };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // Accent-insensitive slug (fallback only — races ship a `slug` already).
  function slugify(str) {
    return String(str || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Deterministic id → unique-slug map over the FULL race set. Run identically in
   * the build and in the client, so internal links always resolve to the right
   * page even for the handful of races that share a base slug.
   */
  function buildSlugMap(races) {
    var used = {}, map = {};
    var sorted = races.slice().sort(function (a, b) { return a.id < b.id ? -1 : a.id > b.id ? 1 : 0; });
    sorted.forEach(function (r) {
      var base = r.slug || slugify(r.name) || r.id;
      var s = base, n = 2;
      while (used[s]) s = base + '-' + (n++);
      used[s] = true;
      map[r.id] = s;
    });
    return map;
  }

  function displayName(race, lang) {
    if (lang === 'ca' && race.names && race.names.ca) return race.names.ca;
    if (lang === 'es' && race.names && race.names.es) return race.names.es;
    return race.name;
  }

  function term(labels, category, key, lang) {
    if (!key) return '';
    var cat = labels[category];
    var entry = cat && cat[key];
    return (entry && entry[lang]) || key;
  }

  function placeLine(race) {
    var loc = race.location;
    return [loc.municipality, loc.comarca, loc.province]
      .filter(function (x, i, a) { return x && a.indexOf(x) === i; })
      .join(', ');
  }

  function fullDate(labels, race, lang) {
    if (!race.date) return race.expectedYear ? String(race.expectedYear) : UI[lang].tbc;
    var y = +race.date.slice(0, 4), m = +race.date.slice(5, 7), d = +race.date.slice(8, 10);
    var wd = WEEKDAYS[lang][new Date(y, m - 1, d).getDay()];
    var month = term(labels, 'months', String(m), lang);
    var body = lang === 'en' ? (month + ' ' + d + ', ' + y) : (d + ' de ' + month + ' de ' + y);
    var out = wd + ', ' + body;
    if (race.startTime) out += ' · ' + race.startTime;
    return out;
  }

  function distanceLabel(d) {
    var km = (Number.isInteger(d.km) ? d.km : Math.round(d.km * 10) / 10) + ' km';
    return d.name ? (d.name + ' — ' + km) : km;
  }

  function iconSvg(sport) {
    var icon = SPORT_ICONS[sport] || SPORT_ICONS.other;
    return '<svg viewBox="' + icon.vb + '" aria-hidden="true" focusable="false"><path fill="currentColor" d="' + icon.d + '"/></svg>';
  }

  // ---- content blocks (localized, re-rendered on language switch) ------------

  function renderHeader(race, labels, lang, slug) {
    var t = UI[lang];
    var sportL = term(labels, 'sport', race.sport, lang);
    var formatL = term(labels, 'format', race.format, lang);
    var tagText = formatL && formatL !== sportL ? (sportL + ' · ' + formatL) : sportL;

    var html = '';
    html += '<a class="rd-back" href="/race-calendar">← ' + esc(t.back) + '</a>';
    html += '<div class="rd-eyebrow" data-sport="' + esc(race.sport) + '">' +
              '<span class="rd-eyebrow-icon">' + iconSvg(race.sport) + '</span>' +
              '<span>' + esc(tagText) + '</span>' +
            '</div>';
    html += '<h1 class="rd-title">' + esc(displayName(race, lang)) + '</h1>';
    html += '<div class="rd-meta">';
    html += '<div class="rd-meta-row"><span class="rd-meta-ico">🗓</span><span>' + esc(fullDate(labels, race, lang)) + '</span></div>';
    var place = placeLine(race);
    if (place) html += '<div class="rd-meta-row"><span class="rd-meta-ico">📍</span><span>' + esc(place) + '</span></div>';
    html += '</div>';
    return html;
  }

  function renderBody(race, labels, lang) {
    var t = UI[lang];
    var out = '';

    // Distances
    if (race.distances && race.distances.length) {
      out += section(t.distances,
        '<div class="rd-dists">' + race.distances.map(function (d) {
          return '<span class="rd-dist">' + esc(distanceLabel(d)) + '</span>';
        }).join('') + '</div>');
    } else if (race.minKm != null && race.maxKm != null) {
      var range = race.minKm === race.maxKm ? (race.minKm + ' km') : (race.minKm + '–' + race.maxKm + ' km');
      out += section(t.distances, '<div class="rd-dists"><span class="rd-dist">' + esc(range) + '</span></div>');
    }

    // Registration
    var regRows = '';
    if (race.registration && race.registration.status) {
      regRows += '<div class="rd-row"><span class="rd-row-key">' + esc(t.status) + '</span>' +
        '<span class="rd-badge rd-badge--' + esc(race.registration.status) + '">' +
        esc(term(labels, 'registration', race.registration.status, lang)) + '</span></div>';
    }
    if (race.price && (race.price.minEur != null || race.price.maxEur != null)) {
      var p = race.price;
      var pv = p.minEur != null && p.maxEur != null && p.minEur !== p.maxEur
        ? (p.minEur + '–' + p.maxEur + ' €')
        : ((p.minEur != null ? p.minEur : p.maxEur) + ' €');
      regRows += '<div class="rd-row"><span class="rd-row-key">' + esc(t.price) + '</span><span>' + esc(pv) + '</span></div>';
    }
    if (regRows) out += section(t.registration, regRows);

    // Links
    var links = race.links || {};
    var linkDefs = [
      ['registration', t.register, '↗'],
      ['official', t.official, '↗'],
      ['results', t.results, '↗'],
      ['route', t.route, '↗'],
      ['instagram', t.instagram, '↗'],
      ['facebook', t.facebook, '↗']
    ];
    var linkRows = linkDefs.filter(function (d) { return links[d[0]]; }).map(function (d) {
      return '<a class="rd-link" href="' + esc(links[d[0]]) + '" target="_blank" rel="noopener nofollow">' +
        '<span>' + esc(d[1]) + '</span><span class="rd-link-arrow">↗</span></a>';
    }).join('');
    if (linkRows) out += section(t.links, '<div class="rd-links">' + linkRows + '</div>');

    if (race.organizer && race.organizer.name) {
      out += section(t.organizer, '<div class="rd-row"><span>' + esc(race.organizer.name) + '</span></div>');
    }

    return out;
  }

  function section(title, inner) {
    return '<section class="rd-section"><h2 class="rd-section-title">' + esc(title) + '</h2>' + inner + '</section>';
  }

  // ---- SEO meta (used by the build for <head>, and by the client for title) --

  function metaFor(race, labels, lang) {
    var name = displayName(race, lang);
    var place = placeLine(race);
    var date = race.date ? fullDate(labels, race, lang) : (race.expectedYear ? String(race.expectedYear) : '');
    var sportL = term(labels, 'sport', race.sport, lang);
    var title = name + (place ? ' · ' + place : '') + ' | iSard';
    var dists = (race.distances && race.distances.length)
      ? race.distances.map(function (d) { return distanceLabel(d); }).join(', ')
      : (race.minKm != null ? (race.minKm + '–' + race.maxKm + ' km') : '');
    var descParts = [name];
    if (sportL) descParts.push(sportL);
    if (place) descParts.push(place);
    if (date) descParts.push(date);
    if (dists) descParts.push(UI[lang].distances + ': ' + dists);
    var description = descParts.join(' · ');
    if (description.length > 300) description = description.slice(0, 297) + '…';
    return { title: title, description: description };
  }

  return {
    LANGS: LANGS,
    UI: UI,
    SPORT_ICONS: SPORT_ICONS,
    esc: esc,
    slugify: slugify,
    buildSlugMap: buildSlugMap,
    displayName: displayName,
    term: term,
    placeLine: placeLine,
    fullDate: fullDate,
    renderHeader: renderHeader,
    renderBody: renderBody,
    metaFor: metaFor
  };
});
