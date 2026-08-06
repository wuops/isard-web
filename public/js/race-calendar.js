// @ts-check
/// <reference path="./race-types.d.ts" />
/**
 * Race-calendar list + filters (vanilla). Depends on race-data.js (window.RaceData)
 * and the site's i18n.js / header.js / theme.js.
 */
(function () {
  var SPORT_ORDER = /** @type {Sport[]} */ (['road_running', 'trail_running', 'cycling', 'hiking']);
  var DISTANCE_KEYS = ['has5k', 'has10k', 'has15k', 'hasHalfMarathon', 'hasMarathon', 'hasUltra', 'hasOther'];
  var BATCH = 40;
  var FAV_KEY = 'isard-fav-races';

  // Sport glyphs — Font Awesome Free 6 solid (icons CC BY 4.0, code MIT), the
  // closest open-source match to the app's SF Symbols (figure.run /
  // figure.outdoor.cycle / figure.hiking). Road & trail share the running figure
  // and are told apart by the brand sport colour, exactly like the native app.
  var SPORT_ICONS = {
    road_running:  { vb: '0 0 448 512', d: 'M320 48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM125.7 175.5c9.9-9.9 23.4-15.5 37.5-15.5c1.9 0 3.8 .1 5.6 .3L137.6 254c-9.3 28 1.7 58.8 26.8 74.5l86.2 53.9-25.4 88.8c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l28.7-100.4c5.9-20.6-2.6-42.6-20.7-53.9L238 299l30.9-82.4 5.1 12.3C289 264.7 323.9 288 362.7 288l21.3 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-21.3 0c-12.9 0-24.6-7.8-29.5-19.7l-6.3-15c-14.6-35.1-44.1-61.9-80.5-73.1l-48.7-15c-11.1-3.4-22.7-5.2-34.4-5.2c-31 0-60.8 12.3-82.7 34.3L57.4 153.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l23.1-23.1zM91.2 352L32 352c-17.7 0-32 14.3-32 32s14.3 32 32 32l69.6 0c19 0 36.2-11.2 43.9-28.5L157 361.6l-9.5-6c-17.5-10.9-30.5-26.8-37.9-44.9L91.2 352z' },
    trail_running: { vb: '0 0 448 512', d: 'M320 48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM125.7 175.5c9.9-9.9 23.4-15.5 37.5-15.5c1.9 0 3.8 .1 5.6 .3L137.6 254c-9.3 28 1.7 58.8 26.8 74.5l86.2 53.9-25.4 88.8c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l28.7-100.4c5.9-20.6-2.6-42.6-20.7-53.9L238 299l30.9-82.4 5.1 12.3C289 264.7 323.9 288 362.7 288l21.3 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-21.3 0c-12.9 0-24.6-7.8-29.5-19.7l-6.3-15c-14.6-35.1-44.1-61.9-80.5-73.1l-48.7-15c-11.1-3.4-22.7-5.2-34.4-5.2c-31 0-60.8 12.3-82.7 34.3L57.4 153.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l23.1-23.1zM91.2 352L32 352c-17.7 0-32 14.3-32 32s14.3 32 32 32l69.6 0c19 0 36.2-11.2 43.9-28.5L157 361.6l-9.5-6c-17.5-10.9-30.5-26.8-37.9-44.9L91.2 352z' },
    cycling:       { vb: '0 0 640 512', d: 'M400 96a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm27.2 64l-61.8-48.8c-17.3-13.6-41.7-13.8-59.1-.3l-83.1 64.2c-30.7 23.8-28.5 70.8 4.3 91.6L288 305.1 288 416c0 17.7 14.3 32 32 32s32-14.3 32-32l0-128c0-10.7-5.3-20.7-14.2-26.6L295 232.9l60.3-48.5L396 217c5.7 4.5 12.7 7 20 7l64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-52.8 0zM56 384a72 72 0 1 1 144 0A72 72 0 1 1 56 384zm200 0A128 128 0 1 0 0 384a128 128 0 1 0 256 0zm184 0a72 72 0 1 1 144 0 72 72 0 1 1 -144 0zm200 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0z' },
    hiking:        { vb: '0 0 384 512', d: 'M192 48a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm51.3 182.7L224.2 307l49.7 49.7c9 9 14.1 21.2 14.1 33.9l0 89.4c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-82.7-73.9-73.9c-15.8-15.8-22.2-38.6-16.9-60.3l20.4-84c8.3-34.1 42.7-54.9 76.7-46.4c19 4.8 35.6 16.4 46.4 32.7L305.1 208l30.9 0 0-24c0-13.3 10.7-24 24-24s24 10.7 24 24l0 55.8c0 .1 0 .2 0 .2s0 .2 0 .2L384 488c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-216-39.4 0c-16 0-31-8-39.9-21.4l-13.3-20zM81.1 471.9L117.3 334c3 4.2 6.4 8.2 10.1 11.9l41.9 41.9L142.9 488.1c-4.5 17.1-22 27.3-39.1 22.8s-27.3-22-22.8-39.1zm55.5-346L101.4 266.5c-3 12.1-14.9 19.9-27.2 17.9l-47.9-8c-14-2.3-22.9-16.3-19.2-30L31.9 155c9.5-34.8 41.1-59 77.2-59l4.2 0c15.6 0 27.1 14.7 23.3 29.8z' },
    other:         { vb: '0 0 320 512', d: 'M160 48a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zM126.5 199.3c-1 .4-1.9 .8-2.9 1.2l-8 3.5c-16.4 7.3-29 21.2-34.7 38.2l-2.6 7.8c-5.6 16.8-23.7 25.8-40.5 20.2s-25.8-23.7-20.2-40.5l2.6-7.8c11.4-34.1 36.6-61.9 69.4-76.5l8-3.5c20.8-9.2 43.3-14 66.1-14c44.6 0 84.8 26.8 101.9 67.9L281 232.7l21.4 10.7c15.8 7.9 22.2 27.1 14.3 42.9s-27.1 22.2-42.9 14.3L247 287.3c-10.3-5.2-18.4-13.8-22.8-24.5l-9.6-23-19.3 65.5 49.5 54c5.4 5.9 9.2 13 11.2 20.8l23 92.1c4.3 17.1-6.1 34.5-23.3 38.8s-34.5-6.1-38.8-23.3l-22-88.1-70.7-77.1c-14.8-16.1-20.3-38.6-14.7-59.7l16.9-63.5zM68.7 398l25-62.4c2.1 3 4.5 5.8 7 8.6l40.7 44.4-14.5 36.2c-2.4 6-6 11.5-10.6 16.1L81.6 505c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L68.7 398z' }
  };

  // Abbreviated weekday names (0 = Sunday) for the per-day group headers.
  var WEEKDAYS = {
    ca: ['Dg', 'Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds'],
    es: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  };

  // Page-chrome strings (enum vocabulary comes from labels.json instead).
  var UI = {
    ca: {
      heading: 'Curses', subtitle: 'Curses d\'asfalt, trail, ciclisme i marxes de senderisme a Espanya i Andorra.',
      search: 'Cerca per nom o població…', sport: 'Esport', territory: 'Territori', distance: 'Distància',
      month: 'Mes', allTerritories: 'Tots els territoris', wholeRegion: 'Tota la comunitat', allMonths: 'Tots els mesos',
      regOpen: 'Inscripcions obertes', favOnly: 'Preferides', reset: 'Reinicia',
      sortDate: 'Per data', sortPopular: 'Populars', count: '{n} curses', countOne: '1 cursa',
      loading: 'Carregant curses…', error: 'No s\'han pogut carregar les curses. Torna-ho a provar més tard.',
      empty: 'Cap cursa coincideix amb els filtres.', register: 'Inscripcions', moreInfo: 'Més informació',
      tbc: 'Data per confirmar', favAdd: 'Afegeix a preferides', favRemove: 'Treu de preferides',
      disclaimer: 'Un calendari de curses conegudes recollit de fonts públiques; no és una llista exhaustiva. Confirma sempre dates i inscripcions a la web oficial de cada cursa.'
    },
    es: {
      heading: 'Carreras', subtitle: 'Carreras de asfalto, trail, ciclismo y marchas de senderismo en España y Andorra.',
      search: 'Busca por nombre o población…', sport: 'Deporte', territory: 'Territorio', distance: 'Distancia',
      month: 'Mes', allTerritories: 'Todos los territorios', wholeRegion: 'Toda la comunidad', allMonths: 'Todos los meses',
      regOpen: 'Inscripciones abiertas', favOnly: 'Favoritas', reset: 'Reiniciar',
      sortDate: 'Por fecha', sortPopular: 'Populares', count: '{n} carreras', countOne: '1 carrera',
      loading: 'Cargando carreras…', error: 'No se han podido cargar las carreras. Inténtalo de nuevo más tarde.',
      empty: 'Ninguna carrera coincide con los filtros.', register: 'Inscripciones', moreInfo: 'Más información',
      tbc: 'Fecha por confirmar', favAdd: 'Añadir a favoritas', favRemove: 'Quitar de favoritas',
      disclaimer: 'Un calendario de carreras conocidas recopilado de fuentes públicas; no es una lista exhaustiva. Confirma siempre fechas e inscripciones en la web oficial de cada carrera.'
    },
    en: {
      heading: 'Races', subtitle: 'Road, trail, cycling and hiking races across Spain and Andorra.',
      search: 'Search by name or town…', sport: 'Sport', territory: 'Territory', distance: 'Distance',
      month: 'Month', allTerritories: 'All territories', wholeRegion: 'Whole region', allMonths: 'All months',
      regOpen: 'Registration open', favOnly: 'Saved', reset: 'Reset',
      sortDate: 'By date', sortPopular: 'Popular', count: '{n} races', countOne: '1 race',
      loading: 'Loading races…', error: 'Could not load races. Please try again later.',
      empty: 'No races match your filters.', register: 'Register', moreInfo: 'More info',
      tbc: 'Date to be confirmed', favAdd: 'Save race', favRemove: 'Remove from saved',
      disclaimer: 'A calendar of known races collected from public sources; not an exhaustive list. Always confirm dates and registration on each race\'s official website.'
    }
  };

  /** @type {{ lang: Lang, sports: Set<string>, territory: {type:string,value:string}, distances: Set<string>, month: number, regOpen: boolean, favOnly: boolean, search: string, sort: string }} */
  var state = {
    lang: getLang(),
    sports: new Set(), territory: { type: 'all', value: '' }, distances: new Set(),
    month: 0, regOpen: false, favOnly: false, search: '', sort: 'date'
  };

  /** @type {Race[]} */ var races = [];
  /** @type {{[id:string]:string}} */ var slugMap = {};
  /** @type {Labels} */ var labels;
  /** @type {{[k:string]:{[p:string]:boolean}}} */ var byComm = {};
  /** @type {Race[]} */ var filtered = [];
  var rendered = 0;
  /** @type {{[dayKey:string]: number}} */ var dayCounts = {};
  /** Day key of the last emitted group header, so batches stay in sync. */
  var lastDayKey = null;
  var favs = loadFavs();
  /** @type {IntersectionObserver|null} */ var observer = null;

  function getLang() {
    var l = localStorage.getItem('isard-lang');
    return /** @type {Lang} */ ((l === 'ca' || l === 'es' || l === 'en') ? l : 'es');
  }
  function t(key) { return UI[state.lang][key]; }

  function loadFavs() {
    try {
      var raw = localStorage.getItem(FAV_KEY);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch (e) { return new Set(); }
  }
  function saveFavs() {
    try { localStorage.setItem(FAV_KEY, JSON.stringify(Array.from(favs))); } catch (e) {}
  }

  // ---- small DOM helper -----------------------------------------------------
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (attrs[k] == null) continue;
      if (k === 'class') n.className = attrs[k];
      else if (k === 'text') n.textContent = attrs[k];
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
      else n.setAttribute(k, attrs[k]);
    }
    if (kids) kids.forEach(function (c) {
      if (c == null) return;
      n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return n;
  }

  // ---- boot -----------------------------------------------------------------
  function boot() {
    var root = document.getElementById('rc-root');
    if (!root) return;
    buildLangDict(); // language selector + static chrome before data arrives
    root.appendChild(el('div', { class: 'rc-status', text: t('loading') }));

    RaceData.load().then(function (data) {
      races = data.races;
      labels = data.labels;
      if (window.RaceDetail) slugMap = window.RaceDetail.buildSlugMap(races);
      indexTerritories();
      render();
    }).catch(function (err) {
      console.error('[race-calendar] load failed:', err);
      root.innerHTML = '';
      root.appendChild(el('div', { class: 'rc-status', text: t('error') }));
    });
  }

  function indexTerritories() {
    byComm = {};
    races.forEach(function (r) {
      var c = r.location.autonomousCommunity, p = r.location.province;
      if (!c) return;
      if (!byComm[c]) byComm[c] = {};
      if (p) byComm[c][p] = true;
    });
  }

  /** Feed i18n.js so the language selector renders and static bits localize. */
  function buildLangDict() {
    if (window.i18nInit) window.i18nInit(UI);
  }

  // ---- filtering + sorting --------------------------------------------------
  function matches(r) {
    if (state.sports.size && !state.sports.has(r.sport)) return false;
    if (state.territory.type === 'comm' && r.location.autonomousCommunity !== state.territory.value) return false;
    if (state.territory.type === 'prov' && r.location.province !== state.territory.value) return false;
    if (state.distances.size) {
      var hit = false;
      state.distances.forEach(function (k) { if (r.distanceFilters[k]) hit = true; });
      if (!hit) return false;
    }
    if (state.month && RaceData.raceMonth(r) !== state.month) return false;
    if (state.regOpen && r.registration.status !== 'open') return false;
    if (state.favOnly && !favs.has(r.id)) return false;
    if (state.search) {
      var q = state.search.toLowerCase();
      var hay = (r.name + ' ' + (r.names.ca || '') + ' ' + (r.names.es || '') + ' ' +
        r.location.municipality + ' ' + r.location.province).toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  }

  function sortRaces(list) {
    if (state.sort === 'popular') {
      list.sort(function (a, b) {
        return (b.popularity.score - a.popularity.score) || cmpDate(a, b);
      });
    } else {
      list.sort(cmpDate);
    }
    return list;
  }
  // Dated races ascending; undated (unconfirmed) after, by expectedYear then name.
  function cmpDate(a, b) {
    if (a.date && b.date) return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
    if (a.date) return -1;
    if (b.date) return 1;
    return (a.expectedYear || 0) - (b.expectedYear || 0) || (a.name < b.name ? -1 : 1);
  }

  function applyFilters() {
    filtered = sortRaces(races.filter(matches));
    rendered = 0;
    lastDayKey = null;
    dayCounts = {};
    filtered.forEach(function (r) {
      var k = r.date || 'tbc';
      dayCounts[k] = (dayCounts[k] || 0) + 1;
    });
  }

  // ---- render ---------------------------------------------------------------
  function render() {
    var root = document.getElementById('rc-root');
    if (!root) return;
    root.innerHTML = '';
    root.appendChild(buildFilters());

    var meta = el('div', { class: 'rc-meta' }, [
      el('span', { class: 'rc-count', id: 'rc-count' }),
      el('div', { class: 'rc-sort' }, [
        sortButton('date', t('sortDate')),
        sortButton('popular', t('sortPopular'))
      ])
    ]);
    root.appendChild(meta);

    var list = el('div', { class: 'rc-list', id: 'rc-list' });
    root.appendChild(list);
    var sentinel = el('div', { class: 'rc-sentinel', id: 'rc-sentinel' });
    root.appendChild(sentinel);
    root.appendChild(el('p', { class: 'rc-disclaimer', text: t('disclaimer') }));

    applyFilters();
    updateCount();
    renderBatch();
    setupObserver(sentinel);
  }

  function sortButton(value, label) {
    return el('button', {
      type: 'button', text: label, 'aria-pressed': String(state.sort === value),
      onclick: function () { if (state.sort !== value) { state.sort = value; render(); } }
    });
  }

  function updateCount() {
    var c = document.getElementById('rc-count');
    if (!c) return;
    c.textContent = filtered.length === 1 ? t('countOne') : t('count').replace('{n}', String(filtered.length));
  }

  function renderBatch() {
    var list = document.getElementById('rc-list');
    if (!list) return;
    if (filtered.length === 0 && rendered === 0) {
      list.appendChild(el('div', { class: 'rc-status', text: t('empty') }));
      return;
    }
    var end = Math.min(rendered + BATCH, filtered.length);
    for (var i = rendered; i < end; i++) {
      maybeDayHeader(list, filtered[i]);
      list.appendChild(card(filtered[i]));
    }
    rendered = end;
  }

  // Group the list by day (only in date order — "popular" is a flat ranking).
  // Emits a full-width header the first time a new day is reached, carrying the
  // weekday + date and the day's race count, mirroring the native app.
  function maybeDayHeader(list, r) {
    if (state.sort !== 'date') return;
    var key = r.date || 'tbc';
    if (key === lastDayKey) return;
    lastDayKey = key;
    var label = key === 'tbc'
      ? t('tbc')
      : weekdayName(r) + ', ' + RaceData.formatRaceDate(labels, r, state.lang);
    list.appendChild(el('div', { class: 'rc-dayhead' }, [
      el('span', { class: 'rc-dayhead-label', text: label }),
      el('span', { class: 'rc-dayhead-count', text: String(dayCounts[key] || 0) })
    ]));
  }

  function weekdayName(r) {
    var d = new Date(Number(r.date.slice(0, 4)), Number(r.date.slice(5, 7)) - 1, Number(r.date.slice(8, 10)));
    return WEEKDAYS[state.lang][d.getDay()];
  }

  function setupObserver(sentinel) {
    if (observer) observer.disconnect();
    observer = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting && rendered < filtered.length) renderBatch();
    }, { rootMargin: '600px' });
    observer.observe(sentinel);
  }

  // ---- filter controls ------------------------------------------------------
  function buildFilters() {
    var wrap = el('div', { class: 'rc-filters' });
    var row = el('div', { class: 'rc-filter-row' });

    // Search
    row.appendChild(el('input', {
      class: 'rc-search', type: 'search', placeholder: t('search'), value: state.search,
      'aria-label': t('search'), autocomplete: 'off',
      oninput: function (e) { state.search = e.target.value.trim(); applyFilters(); refreshList(); }
    }));

    // Sport chips
    var sportChips = el('div', { class: 'rc-chips' });
    SPORT_ORDER.forEach(function (s) {
      var chip = el('button', {
        type: 'button', class: 'rc-chip', 'data-sport': s, 'aria-pressed': String(state.sports.has(s)),
        onclick: function () {
          toggleSet(state.sports, s);
          chip.setAttribute('aria-pressed', String(state.sports.has(s)));
          applyFilters(); refreshList();
        }
      }, [
        el('span', { class: 'rc-dot' }),
        document.createTextNode(RaceData.sportLabel(labels, /** @type {any} */ ({ sport: s }), state.lang))
      ]);
      sportChips.appendChild(chip);
    });
    row.appendChild(field(t('sport'), sportChips));

    // Territory select
    row.appendChild(field(t('territory'), territorySelect()));

    // Distance chips
    var distChips = el('div', { class: 'rc-chips' });
    DISTANCE_KEYS.forEach(function (k) {
      var chip = el('button', {
        type: 'button', class: 'rc-chip', 'aria-pressed': String(state.distances.has(k)),
        text: RaceData.term(labels, 'distanceFilter', k, state.lang),
        onclick: function () {
          toggleSet(state.distances, k);
          chip.setAttribute('aria-pressed', String(state.distances.has(k)));
          applyFilters(); refreshList();
        }
      });
      distChips.appendChild(chip);
    });
    row.appendChild(field(t('distance'), distChips));

    // Month select
    row.appendChild(field(t('month'), monthSelect()));

    // Toggles
    row.appendChild(toggle(t('regOpen'), state.regOpen, function (v) { state.regOpen = v; applyFilters(); refreshList(); }));
    row.appendChild(toggle(t('favOnly'), state.favOnly, function (v) { state.favOnly = v; applyFilters(); refreshList(); }));

    row.appendChild(el('button', {
      type: 'button', class: 'rc-reset', text: t('reset'),
      onclick: resetFilters
    }));

    wrap.appendChild(row);
    return wrap;
  }

  function field(label, control) {
    return el('div', { class: 'rc-field' }, [
      el('span', { class: 'rc-field-label', text: label }), control
    ]);
  }

  function territorySelect() {
    var sel = el('select', {
      class: 'rc-select', 'aria-label': t('territory'), autocomplete: 'off',
      onchange: function (e) {
        var v = e.target.value;
        if (v === 'all') state.territory = { type: 'all', value: '' };
        else { var i = v.indexOf(':'); state.territory = { type: v.slice(0, i), value: v.slice(i + 1) }; }
        applyFilters(); refreshList();
      }
    }, [el('option', { value: 'all', text: t('allTerritories') })]);

    Object.keys(byComm).sort(cmpStr).forEach(function (comm) {
      var group = el('optgroup', { label: comm });
      var commVal = 'comm:' + comm;
      group.appendChild(el('option', { value: commVal, text: t('wholeRegion'), selected: sel && state.territory.type === 'comm' && state.territory.value === comm ? 'selected' : null }));
      Object.keys(byComm[comm]).sort(cmpStr).forEach(function (prov) {
        var pv = 'prov:' + prov;
        group.appendChild(el('option', { value: pv, text: prov, selected: state.territory.type === 'prov' && state.territory.value === prov ? 'selected' : null }));
      });
      sel.appendChild(group);
    });
    return sel;
  }

  function monthSelect() {
    var sel = el('select', {
      class: 'rc-select', 'aria-label': t('month'), autocomplete: 'off',
      onchange: function (e) { state.month = Number(e.target.value); applyFilters(); refreshList(); }
    }, [el('option', { value: '0', text: t('allMonths') })]);
    for (var m = 1; m <= 12; m++) {
      sel.appendChild(el('option', {
        value: String(m), text: RaceData.term(labels, 'months', String(m), state.lang),
        selected: state.month === m ? 'selected' : null
      }));
    }
    return sel;
  }

  function toggle(label, checked, onchange) {
    var input = el('input', {
      type: 'checkbox', checked: checked ? 'checked' : null,
      onchange: function (e) { onchange(e.target.checked); }
    });
    return el('label', { class: 'rc-toggle' }, [input, document.createTextNode(label)]);
  }

  function resetFilters() {
    state.sports.clear(); state.distances.clear();
    state.territory = { type: 'all', value: '' };
    state.month = 0; state.regOpen = false; state.favOnly = false; state.search = '';
    render();
  }

  // Re-run filters and repaint just the list + count (keeps filter DOM/focus).
  function refreshList() {
    var list = document.getElementById('rc-list');
    var sentinel = document.getElementById('rc-sentinel');
    if (!list || !sentinel) return;
    list.innerHTML = '';
    updateCount();
    renderBatch();
    setupObserver(sentinel);
  }

  function toggleSet(set, key) { if (set.has(key)) set.delete(key); else set.add(key); }

  // ---- card -----------------------------------------------------------------
  function card(r) {
    return el('article', { class: 'rc-card' }, [sportAvatar(r), cardBody(r)]);
  }

  // Circular sport avatar: a tinted disc + full-colour glyph, keyed on the data's
  // `sport` via data-sport (so the colour survives localization). Replaces the
  // old date tile — the date now lives in the day-group header.
  function sportAvatar(r) {
    var icon = SPORT_ICONS[r.sport] || SPORT_ICONS.other;
    return el('div', { class: 'rc-avatar', 'data-sport': r.sport }, [svgIcon(icon)]);
  }

  function svgIcon(icon) {
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', icon.vb);
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    var path = document.createElementNS(NS, 'path');
    path.setAttribute('d', icon.d);
    path.setAttribute('fill', 'currentColor');
    svg.appendChild(path);
    return svg;
  }

  function cardBody(r) {
    var place = [r.location.municipality, r.location.province].filter(Boolean).join(', ');

    var tags = el('div', { class: 'rc-tags' }, [
      el('span', { class: 'rc-sportchip', 'data-sport': r.sport, text: RaceData.sportLabel(labels, r, state.lang) })
    ]);
    // In "popular" order there are no day headers, so surface the date per card.
    if (state.sort === 'popular') {
      var p = RaceData.dateParts(labels, r, state.lang);
      var dateText = r.date ? (p.day + ' ' + p.month + ' ' + p.year) : (r.expectedYear ? String(r.expectedYear) : t('tbc'));
      tags.appendChild(el('span', { class: 'rc-datepill', text: dateText }));
    }
    // registration status badge (skip "" unknown)
    if (r.registration.status) {
      tags.appendChild(el('span', {
        class: 'rc-badge rc-badge--' + r.registration.status,
        text: RaceData.registrationLabel(labels, r, state.lang)
      }));
    }
    // date-status badge (skip confirmed)
    if (r.dateStatus !== 'confirmed') {
      tags.appendChild(el('span', {
        class: 'rc-badge rc-badge--' + r.dateStatus,
        text: RaceData.dateStatusLabel(labels, r, state.lang)
      }));
    }

    var distances = RaceData.distancesSummary(r);

    var isFav = favs.has(r.id);
    var favBtn = el('button', {
      class: 'rc-fav', type: 'button', 'aria-pressed': String(isFav),
      'aria-label': isFav ? t('favRemove') : t('favAdd'), text: isFav ? '★' : '☆',
      onclick: function () {
        if (favs.has(r.id)) favs.delete(r.id); else favs.add(r.id);
        saveFavs();
        var nowFav = favs.has(r.id);
        favBtn.setAttribute('aria-pressed', String(nowFav));
        favBtn.setAttribute('aria-label', nowFav ? t('favRemove') : t('favAdd'));
        favBtn.textContent = nowFav ? '★' : '☆';
        if (state.favOnly) { applyFilters(); refreshList(); }
      }
    });

    var kids = [
      el('div', { class: 'rc-name-row' }, [
        el('h3', { class: 'rc-name' }, [
          el('a', {
            class: 'rc-namelink',
            href: '/races/' + (slugMap[r.id] || r.slug),
            text: RaceData.displayName(r, state.lang)
          })
        ]),
        favBtn
      ]),
      el('div', { class: 'rc-place', text: place }),
      tags,
      distances ? el('div', { class: 'rc-distances', text: distances }) : null,
      cardFoot(r)
    ];
    return el('div', { class: 'rc-body' }, kids);
  }

  function cardFoot(r) {
    var href = r.links.registration || r.links.official;
    if (!href) return null;
    var isRegister = (r.links.registration && r.registration.status === 'open');
    var label = isRegister ? t('register') : t('moreInfo');
    var cls = 'rc-btn ' + (isRegister ? 'rc-btn--primary' : 'rc-btn--secondary');
    return el('div', { class: 'rc-foot' }, [
      el('a', { class: cls, href: href, target: '_blank', rel: 'noopener', text: label + ' →' })
    ]);
  }

  function cmpStr(a, b) { return a.localeCompare(b, state.lang); }

  // Re-render everything on language change (names/labels/month names relocalize).
  var prevLangHook = window.onLangChange;
  window.onLangChange = function (lang) {
    if (prevLangHook) prevLangHook(lang);
    state.lang = /** @type {Lang} */ (lang);
    if (races.length) render();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
