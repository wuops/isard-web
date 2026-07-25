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

  // Page-chrome strings (enum vocabulary comes from labels.json instead).
  var UI = {
    ca: {
      heading: 'Calendari de curses', subtitle: 'Curses de ruta, muntanya, ciclisme i marxes a Espanya i Andorra.',
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
      heading: 'Calendario de carreras', subtitle: 'Carreras de ruta, montaña, ciclismo y marchas en España y Andorra.',
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
      heading: 'Race calendar', subtitle: 'Road, trail, cycling and hiking races across Spain and Andorra.',
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
  /** @type {Labels} */ var labels;
  /** @type {{[k:string]:{[p:string]:boolean}}} */ var byComm = {};
  /** @type {Race[]} */ var filtered = [];
  var rendered = 0;
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
    for (var i = rendered; i < end; i++) list.appendChild(card(filtered[i]));
    rendered = end;
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
    return el('article', { class: 'rc-card' }, [dateTile(r), cardBody(r)]);
  }

  function dateTile(r) {
    if (!r.date) {
      return el('div', { class: 'rc-date' }, [
        el('span', { class: 'rc-date-tbc', text: t('tbc') }),
        r.expectedYear ? el('span', { class: 'rc-date-year', text: String(r.expectedYear) }) : null
      ]);
    }
    var p = RaceData.dateParts(labels, r, state.lang);
    return el('div', { class: 'rc-date' }, [
      el('span', { class: 'rc-date-day', text: p.day }),
      el('span', { class: 'rc-date-month', text: p.month }),
      el('span', { class: 'rc-date-year', text: p.year })
    ]);
  }

  function cardBody(r) {
    var place = [r.location.municipality, r.location.province].filter(Boolean).join(', ');

    var tags = el('div', { class: 'rc-tags' }, [
      el('span', { class: 'rc-sportchip', 'data-sport': r.sport, text: RaceData.sportLabel(labels, r, state.lang) })
    ]);
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
        el('h3', { class: 'rc-name', text: RaceData.displayName(r, state.lang) }),
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
