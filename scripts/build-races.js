#!/usr/bin/env node
/**
 * Static per-race SEO page generator.
 *
 * Reads the committed race JSON (public/data, via manifest.json) and writes one
 * pre-rendered HTML page per race at public/races/<slug>/index.html, plus a
 * sitemap.xml. Runs at Vercel build time (see vercel.json buildCommand), so the
 * pages are always regenerated from the latest committed data and nothing static
 * is checked into the repo.
 *
 * No dependencies — pure Node fs. Shares the render logic with the browser via
 * public/js/race-detail-render.js so the crawlable HTML matches the client.
 */
'use strict';

var fs = require('fs');
var path = require('path');
var RaceDetail = require('../public/js/race-detail-render.js');
var HUBS = require('./hubs.js');

var PUBLIC = path.join(__dirname, '..', 'public');
var DATA = path.join(PUBLIC, 'data');
var OUT = path.join(PUBLIC, 'races');
var SITE = 'https://www.isard.app';
var DEFAULT_LANG = 'es';
var LANGS = ['es', 'ca', 'en'];
var HUB_MIN = 8; // minimum upcoming events for a hub to be indexable

function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

var manifest = readJson(path.join(DATA, 'manifest.json'));
var races = readJson(path.join(DATA, manifest.file));
var labels = readJson(path.join(DATA, manifest.labelsFile));
var slugMap = RaceDetail.buildSlugMap(races);

// Only the label categories the client renderer needs — keeps each page small.
var trimmedLabels = {
  sport: labels.sport,
  format: labels.format,
  registration: labels.registration,
  months: labels.months
};

var esc = RaceDetail.esc;
// Safe to embed inside <script> / <script type=ld+json>: neutralise `</`.
function jsonInline(obj) { return JSON.stringify(obj).replace(/</g, '\\u003c'); }

// Themed Leaflet map (CARTO Positron light / Dark Matter dark) initialised
// client-side from these data attributes by race-detail.js. No coords → no map.
function mapEmbed(race) {
  var loc = race.location;
  if (loc.lat == null || loc.lon == null) return '';
  return '<div class="rd-map" id="rd-map" data-lat="' + loc.lat + '" data-lon="' + loc.lon +
    '" data-sport="' + esc(race.sport) + '"></div>';
}

var AVAILABILITY = {
  open: 'https://schema.org/InStock',
  closed: 'https://schema.org/OutOfStock',
  sold_out: 'https://schema.org/SoldOut'
};
var EVENT_STATUS = {
  cancelled: 'https://schema.org/EventCancelled',
  postponed: 'https://schema.org/EventPostponed'
};

function jsonLd(race, canonical, description, lang) {
  lang = lang || DEFAULT_LANG;
  var loc = race.location;
  var name = RaceDetail.displayName(race, lang);
  var obj = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: name,
    url: canonical,
    image: SITE + '/iSard_icon.png',
    inLanguage: lang,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode'
  };
  if (description) obj.description = description;
  var sportEn = RaceDetail.term(labels, 'sport', race.sport, 'en');
  if (sportEn) obj.sport = sportEn;
  if (race.date) obj.startDate = race.startTime ? (race.date + 'T' + race.startTime) : race.date;
  if (race.endDate) obj.endDate = race.endDate;
  obj.eventStatus = EVENT_STATUS[race.status] || 'https://schema.org/EventScheduled';

  var place = {
    '@type': 'Place',
    name: loc.venue || loc.municipality || name,
    address: {
      '@type': 'PostalAddress',
      addressLocality: loc.municipality || undefined,
      addressRegion: loc.province || undefined,
      addressCountry: loc.country || undefined
    }
  };
  if (loc.lat != null && loc.lon != null) {
    place.geo = { '@type': 'GeoCoordinates', latitude: loc.lat, longitude: loc.lon };
  }
  obj.location = place;

  if (race.organizer && race.organizer.name) {
    obj.organizer = { '@type': 'Organization', name: race.organizer.name };
  }
  var regUrl = race.links && (race.links.registration || race.links.official);
  if (regUrl) {
    var offer = { '@type': 'Offer', url: regUrl };
    var av = race.registration && AVAILABILITY[race.registration.status];
    if (av) offer.availability = av;
    if (race.price && race.price.minEur != null) {
      offer.price = race.price.minEur;
      offer.priceCurrency = race.price.currency || 'EUR';
    }
    obj.offers = offer;
  }
  return jsonInline(obj);
}

// og:locale + breadcrumb label per language.
var LANG_OG = { es: 'es_ES', ca: 'ca_ES', en: 'en' };
var CRUMB_CALENDAR = { es: 'Carreras', ca: 'Curses', en: 'Races' };

// Home → Carreras → this race. Gives search engines the internal hierarchy and
// makes the page eligible for breadcrumb rich results.
function breadcrumbLd(race, canonical, lang) {
  lang = lang || DEFAULT_LANG;
  var name = RaceDetail.displayName(race, lang);
  var obj = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'iSard', item: SITE + '/' + lang + '/' },
      { '@type': 'ListItem', position: 2, name: CRUMB_CALENDAR[lang] || CRUMB_CALENDAR.es, item: SITE + '/' + lang + '/race-calendar' },
      { '@type': 'ListItem', position: 3, name: name, item: canonical }
    ]
  };
  return jsonInline(obj);
}

// Reciprocal hreflang across the three server-rendered locales + x-default → es.
// Every localized page and the legacy /races/<slug> page share this same cluster.
function hreflangLinks(slug) {
  var out = LANGS.map(function (l) {
    return '<link rel="alternate" hreflang="' + l + '" href="' + esc(SITE + '/' + l + '/races/' + slug) + '">';
  });
  out.push('<link rel="alternate" hreflang="x-default" href="' + esc(SITE + '/es/races/' + slug) + '">');
  return out.join('\n  ');
}

function ogLocaleTags(lang) {
  var out = ['<meta property="og:locale" content="' + (LANG_OG[lang] || 'es_ES') + '">'];
  LANGS.forEach(function (l) {
    if (l !== lang) out.push('<meta property="og:locale:alternate" content="' + (LANG_OG[l] || l) + '">');
  });
  return out.join('\n  ');
}

// ---- localized static pages (homepage, race calendar) ----------------------
// These two indexable content pages are localized by transforming their existing
// source HTML at build time: the inline CSS/markup is preserved and only the
// <head> SEO tags, <html lang>, internal /race-calendar links and the visible
// [data-i18n] leaf text are rewritten per locale. Utility/funnel pages
// (contact, privacy, race-alerts) stay single-URL and localize client-side.
//
// `path` is the URL suffix after the locale ('' = home, '/race-calendar').
// `i18n[lang]` provides the visible-text translations keyed by data-i18n key;
// `meta[lang]` provides the localized <title>/description.
var STATIC_PAGES = [
  {
    src: path.join(PUBLIC, 'index.html'),
    path: '',
    meta: {
      es: { title: 'iSard — App de running, senderismo y ciclismo + carreras', description: 'iSard es la app para registrar running, trail, senderismo y ciclismo por GPS, crear tarjetas y vídeos 3D de tus rutas, y descubrir carreras en España y Andorra.' },
      ca: { title: 'iSard — App de running, senderisme i ciclisme + curses', description: 'iSard és l\'app per registrar running, trail, senderisme i ciclisme per GPS, crear targetes i vídeos 3D de les teves rutes, i descobrir curses a Espanya i Andorra.' },
      en: { title: 'iSard — Running, hiking & cycling tracker + race calendar', description: 'iSard records your running, trail, hiking and cycling by GPS, creates shareable cards and 3D route-replay videos, and helps you discover races across Spain and Andorra.' }
    },
    i18n: {
      es: { tagline: 'iSard es una app de running, senderismo y ciclismo que te permite registrar actividades deportivas, diseñar tarjetas compartibles y exportar vídeos de animación 3D de tus rutas.', about_title: '¿Qué funciones ofrece la app de iSard?', f_record: 'Registro por GPS de running, trail, senderismo y ciclismo.', f_cards: 'Tarjetas de entrenamiento y ruta para compartir.', f_video: 'Vídeos de animación 3D que reproducen tus rutas.', f_races: 'Calendario de carreras y alertas para España y Andorra.', cta_calendar: 'Ver calendario de carreras', cta_alerts: 'Crear alertas de carreras', privacy: 'Política de Privacidad' },
      ca: { tagline: 'iSard és una app de running, senderisme i ciclisme que et permet registrar activitats esportives, dissenyar targetes compartibles i exportar vídeos d\'animació 3D de les teves rutes.', about_title: 'Quines funcions ofereix l\'app d\'iSard?', f_record: 'Registre per GPS de running, trail, senderisme i ciclisme.', f_cards: 'Targetes d\'entrenament i ruta per compartir.', f_video: 'Vídeos d\'animació 3D que reprodueixen les teves rutes.', f_races: 'Calendari de curses i alertes per a Espanya i Andorra.', cta_calendar: 'Veure el calendari de curses', cta_alerts: 'Crear alertes de curses', privacy: 'Política de Privacitat' },
      en: { tagline: 'iSard is a running, hiking and cycling tracker app that lets you record workout activities, design shareable cards, and export replay 3D animation videos of your routes.', about_title: 'What features does the iSard app offer?', f_record: 'GPS recording for running, trail running, hiking and cycling.', f_cards: 'Shareable workout and route cards.', f_video: '3D animated videos that replay your routes.', f_races: 'Race calendar and alerts for Spain and Andorra.', cta_calendar: 'Browse the race calendar', cta_alerts: 'Set up race alerts', privacy: 'Privacy Policy' }
    }
  },
  {
    src: path.join(PUBLIC, 'race-calendar', 'index.html'),
    path: '/race-calendar',
    meta: {
      es: { title: 'Calendario de carreras en España y Andorra — running, trail, ciclismo | iSard', description: 'Descubre carreras de asfalto, trail running, ciclismo y marchas de senderismo en España y Andorra. Filtra por deporte, territorio, distancia y mes, y crea alertas de carreras.' },
      ca: { title: 'Calendari de curses a Espanya i Andorra — running, trail, ciclisme | iSard', description: 'Descobreix curses d\'asfalt, trail running, ciclisme i marxes de senderisme a Espanya i Andorra. Filtra per esport, territori, distància i mes, i crea alertes de curses.' },
      en: { title: 'Race calendar in Spain and Andorra — running, trail, cycling | iSard', description: 'Discover road, trail, cycling and hiking races across Spain and Andorra. Filter by sport, territory, distance and month, and set up race alerts.' }
    },
    i18n: {
      es: { heading: 'Carreras', subtitle: 'Carreras de asfalto, trail, ciclismo y marchas de senderismo en España y Andorra.' },
      ca: { heading: 'Curses', subtitle: 'Curses d\'asfalt, trail, ciclisme i marxes de senderisme a Espanya i Andorra.' },
      en: { heading: 'Races', subtitle: 'Road, trail, cycling and hiking races across Spain and Andorra.' }
    }
  }
];

function staticHreflang(pathSuffix) {
  var slash = pathSuffix === '' ? '/' : '';
  var out = LANGS.map(function (l) {
    return '<link rel="alternate" hreflang="' + l + '" href="' + esc(SITE + '/' + l + pathSuffix + slash) + '">';
  });
  out.push('<link rel="alternate" hreflang="x-default" href="' + esc(SITE + '/es' + pathSuffix + slash) + '">');
  return out.join('\n    ');
}

// Replace the visible text of a leaf [data-i18n="key"] element (text-only, no
// nested tags — true for the homepage/calendar keys). Order-independent.
function applyI18nLeaf(html, dict) {
  Object.keys(dict).forEach(function (key) {
    var re = new RegExp('(data-i18n="' + key + '"[^>]*>)([^<]*)(<)', 'g');
    html = html.replace(re, function (_, open) { return open + esc(dict[key]) + '<'; });
  });
  return html;
}

function localizeStatic(src, spec, lang) {
  var suffix = spec.path;
  var canonical = SITE + '/' + lang + suffix + (suffix === '' ? '/' : '');
  var m = spec.meta[lang];
  var html = src;
  html = html.replace(/<html lang="[^"]*">/, '<html lang="' + lang + '">');
  html = html.replace(/<title>[\s\S]*?<\/title>/, '<title>' + esc(m.title) + '</title>');
  html = html.replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="' + esc(m.description) + '">');
  // Drop any hreflang alternates from the source, then inject the localized set
  // right after the (rewritten) canonical so there's exactly one cluster.
  html = html.replace(/[ \t]*<link rel="alternate" hreflang="[^"]*" href="[^"]*">\n?/g, '');
  html = html.replace(/<link rel="canonical" href="[^"]*">/, '<link rel="canonical" href="' + esc(canonical) + '">\n    ' + staticHreflang(suffix));
  html = html.replace(/<meta property="og:url" content="[^"]*">/, '<meta property="og:url" content="' + esc(canonical) + '">');
  html = html.replace(/<meta property="og:title" content="[^"]*">/, '<meta property="og:title" content="' + esc(m.title) + '">');
  html = html.replace(/<meta property="og:description" content="[^"]*">/, '<meta property="og:description" content="' + esc(m.description) + '">');
  html = html.replace(/<meta property="og:locale" content="[^"]*">/, '<meta property="og:locale" content="' + (LANG_OG[lang] || 'es_ES') + '">');
  // Point the in-page calendar links at the localized calendar.
  html = html.replace(/href="\/race-calendar"/g, 'href="/' + lang + '/race-calendar"');
  // Localize the calendar's JSON-LD URLs (CollectionPage url/@id + breadcrumb)
  // so structured data references the canonical locale URL, not a 301.
  html = html.replace(/https:\/\/www\.isard\.app\/race-calendar/g, SITE + '/' + lang + '/race-calendar');
  // Inject the per-locale hub index into the homepage (no-op elsewhere).
  html = html.replace('<!--HUBS-->', homeHubIndex(lang));
  html = applyI18nLeaf(html, spec.i18n[lang]);
  return html;
}

function buildStaticPages() {
  var n = 0;
  STATIC_PAGES.forEach(function (spec) {
    var src = fs.readFileSync(spec.src, 'utf8');
    LANGS.forEach(function (lang) {
      var dir = path.join(PUBLIC, lang, spec.path.replace(/^\//, ''));
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'index.html'), localizeStatic(src, spec, lang));
      n++;
    });
  });
  return n;
}

// Renders one race page in `lang`. canonicalOverride lets the legacy
// /races/<slug> page point its canonical at the /es version instead of itself.
function page(race, lang, canonicalOverride) {
  lang = lang || DEFAULT_LANG;
  var slug = slugMap[race.id];
  var canonical = canonicalOverride || (SITE + '/' + lang + '/races/' + slug);
  var meta = RaceDetail.metaFor(race, labels, lang);
  var header = RaceDetail.renderHeader(race, labels, lang, slug);
  var body = RaceDetail.renderBody(race, labels, lang);
  var map = mapEmbed(race);
  var ogImage = SITE + '/iSard_icon.png';

  return '<!DOCTYPE html>\n' +
'<html lang="' + lang + '">\n' +
'<head>\n' +
'  <meta charset="UTF-8">\n' +
'  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
'  <title>' + esc(meta.title) + '</title>\n' +
'  <meta name="description" content="' + esc(meta.description) + '">\n' +
'  <link rel="canonical" href="' + esc(canonical) + '">\n' +
'  ' + hreflangLinks(slug) + '\n' +
'  <meta property="og:type" content="website">\n' +
'  <meta property="og:site_name" content="iSard">\n' +
'  <meta property="og:title" content="' + esc(meta.title) + '">\n' +
'  <meta property="og:description" content="' + esc(meta.description) + '">\n' +
'  <meta property="og:url" content="' + esc(canonical) + '">\n' +
'  <meta property="og:image" content="' + esc(ogImage) + '">\n' +
'  ' + ogLocaleTags(lang) + '\n' +
'  <meta name="twitter:card" content="summary">\n' +
'  <link rel="icon" type="image/png" href="/iSard_icon.png">\n' +
'  <link rel="stylesheet" href="/css/tokens.css">\n' +
'  <link rel="stylesheet" href="/css/theme.css">\n' +
'  <link rel="stylesheet" href="/css/header.css">\n' +
'  <link rel="stylesheet" href="/vendor/leaflet/leaflet.css">\n' +
'  <link rel="stylesheet" href="/css/race-detail.css">\n' +
'  <script src="/js/theme.js"></script>\n' +
'  <script type="application/ld+json">' + jsonLd(race, canonical, meta.description, lang) + '</script>\n' +
'  <script type="application/ld+json">' + breadcrumbLd(race, canonical, lang) + '</script>\n' +
'  <style>\n' +
'    * { margin: 0; padding: 0; box-sizing: border-box; }\n' +
'    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;\n' +
'           background-color: var(--bg-page); color: var(--text-primary); min-height: 100vh; }\n' +
'  </style>\n' +
'</head>\n' +
'<body>\n' +
'  <main class="rd-main">\n' +
'    <div id="rd-header">' + header + '</div>\n' +
'    ' + map + '\n' +
'    <div id="rd-body">' + body + '</div>\n' +
'  </main>\n' +
'  <script>window.__RACE__=' + jsonInline(race) + ';window.__LABELS__=' + jsonInline(trimmedLabels) + ';window.__SLUG__=' + JSON.stringify(slug) + ';</script>\n' +
'  <script src="/vendor/leaflet/leaflet.js"></script>\n' +
'  <script src="/js/header.js"></script>\n' +
'  <script src="/js/i18n.js"></script>\n' +
'  <script src="/js/race-detail-render.js"></script>\n' +
'  <script src="/js/race-detail.js"></script>\n' +
'</body>\n' +
'</html>\n';
}

// W3C-datetime lastmod. Accepts an ISO timestamp or falls back to the build date.
function lastmod(ts) {
  var d = ts ? new Date(ts) : new Date();
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

// ---- content-rich hubs (prototype: distance hubs, see scripts/hubs.js) -------

function hubUrl(hub, lang) {
  return SITE + '/' + lang + '/' + HUBS.PREFIX[lang] + '/' + hub.slug[lang];
}
function hubPath(hub, lang) { return '/' + lang + '/' + HUBS.PREFIX[lang] + '/' + hub.slug[lang]; }

// Hub index injected into the localized homepage (replaces the <!--HUBS--> marker):
// browse by distance, by sport, and by territory (top communities, set in main()).
var HOME_HUBS_TITLE = {
  distance: { es: 'Explora carreras por distancia', ca: 'Explora curses per distància', en: 'Browse races by distance' },
  sport: { es: 'Explora por deporte', ca: 'Explora per esport', en: 'Browse by sport' },
  location: { es: 'Explora por territorio', ca: 'Explora per territori', en: 'Browse by territory' }
};
var homeTopLocations = [];
function homeHubGroup(title, hubs, lang) {
  if (!hubs.length) return '';
  var chips = hubs.map(function (h) {
    return '<a class="home-hub" href="' + esc(hubPath(h, lang)) + '">' + esc(h.name[lang]) + '</a>';
  }).join('');
  return '<h2>' + esc(title) + '</h2><div class="home-hub-links">' + chips + '</div>';
}
function homeHubIndex(lang) {
  return homeHubGroup(HOME_HUBS_TITLE.distance[lang], HUBS.distanceHubs, lang) +
    homeHubGroup(HOME_HUBS_TITLE.sport[lang], HUBS.sportHubs, lang) +
    homeHubGroup(HOME_HUBS_TITLE.location[lang], homeTopLocations, lang);
}

function hubHreflang(hub) {
  var out = LANGS.map(function (l) {
    return '<link rel="alternate" hreflang="' + l + '" href="' + esc(hubUrl(hub, l)) + '">';
  });
  out.push('<link rel="alternate" hreflang="x-default" href="' + esc(hubUrl(hub, 'es')) + '">');
  return out.join('\n  ');
}

function hubAlternatesXml(hub) {
  var links = LANGS.map(function (l) {
    return '    <xhtml:link rel="alternate" hreflang="' + l + '" href="' + esc(hubUrl(hub, l)) + '"/>';
  });
  links.push('    <xhtml:link rel="alternate" hreflang="x-default" href="' + esc(hubUrl(hub, 'es')) + '"/>');
  return links.join('\n');
}

// Server-rendered event list (crawlable internal links into the race pages).
function hubEventList(matched, lang, cap) {
  var shown = matched.slice(0, cap);
  var items = shown.map(function (r) {
    var name = RaceDetail.displayName(r, lang);
    var date = r.date ? RaceDetail.fullDate(labels, r, lang) : '';
    var place = RaceDetail.placeLine(r) || '';
    var meta = [date, place].filter(Boolean).join(' · ');
    return '<li class="h-ev"><a class="h-ev-link" href="/' + lang + '/races/' + slugMap[r.id] + '">' +
      '<span class="h-ev-name">' + esc(name) + '</span>' +
      (meta ? '<span class="h-ev-meta">' + esc(meta) + '</span>' : '') + '</a></li>';
  }).join('');
  return { html: '<ol class="h-evlist">' + items + '</ol>', shown: shown };
}

function hubFaqHtml(faq) {
  return '<div class="h-faq">' + faq.map(function (f) {
    return '<details class="h-faq-item"><summary>' + esc(f.q) + '</summary>' +
      '<div class="h-faq-a"><p>' + esc(f.a) + '</p></div></details>';
  }).join('') + '</div>';
}

function hubRelatedHtml(hub, lang, relatedList) {
  return relatedList.filter(function (h) { return h.id !== hub.id; }).map(function (h) {
    return '<a class="h-chip" href="' + esc(hubPath(h, lang)) + '">' + esc(h.name[lang]) + '</a>';
  }).join('');
}

function hubJsonLd(hub, lang, canonical, c, shown) {
  var collection = {
    '@type': 'CollectionPage', '@id': canonical + '#webpage', url: canonical,
    name: c.h1, description: c.description, inLanguage: lang,
    isPartOf: { '@id': SITE + '/#website' }
  };
  var itemList = {
    '@type': 'ItemList',
    itemListElement: shown.map(function (r, i) {
      return { '@type': 'ListItem', position: i + 1, url: SITE + '/' + lang + '/races/' + slugMap[r.id], name: RaceDetail.displayName(r, lang) };
    })
  };
  var breadcrumb = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'iSard', item: SITE + '/' + lang + '/' },
      { '@type': 'ListItem', position: 2, name: HUBS.CAL[lang], item: SITE + '/' + lang + '/race-calendar' },
      { '@type': 'ListItem', position: 3, name: hub.name[lang], item: canonical }
    ]
  };
  var faqPage = {
    '@type': 'FAQPage',
    mainEntity: c.faq.map(function (f) {
      return { '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } };
    })
  };
  return jsonInline({ '@context': 'https://schema.org', '@graph': [collection, itemList, breadcrumb, faqPage] });
}

var HUB_CSS = '\n' +
'    .h-main { max-width: 900px; margin: 0 auto; padding: 24px 20px 80px; }\n' +
'    .h-crumb { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 16px; }\n' +
'    .h-crumb a { color: var(--text-muted); text-decoration: none; }\n' +
'    .h-crumb a:hover { color: var(--text-primary); }\n' +
'    .h-main h1 { font-size: 1.8rem; font-weight: 700; margin-bottom: 12px; }\n' +
'    .h-lead { font-size: 1.05rem; line-height: 1.6; color: var(--text-muted); max-width: 720px; margin-bottom: 28px; }\n' +
'    .h-section { margin: 32px 0; }\n' +
'    .h-section h2 { font-size: 1.25rem; font-weight: 700; margin: 24px 0 12px; }\n' +
'    .h-section p { line-height: 1.65; margin-bottom: 12px; }\n' +
'    .h-evlist { list-style: none; display: grid; gap: 8px; margin: 0; padding: 0; }\n' +
'    .h-ev-link { display: flex; flex-direction: column; gap: 2px; padding: 12px 14px; border: 1px solid var(--border-color); border-radius: 10px; text-decoration: none; color: var(--text-primary); transition: border-color 0.15s ease; }\n' +
'    .h-ev-link:hover { border-color: var(--accent); }\n' +
'    .h-ev-name { font-weight: 600; }\n' +
'    .h-ev-meta { font-size: 0.85rem; color: var(--text-muted); }\n' +
'    .h-more { display: inline-block; margin-top: 16px; font-weight: 600; color: var(--accent); text-decoration: none; }\n' +
'    .h-table-wrap { overflow-x: auto; }\n' +
'    .h-table { width: 100%; border-collapse: collapse; font-size: 0.95rem; margin: 8px 0; }\n' +
'    .h-table th, .h-table td { text-align: left; padding: 8px 12px; border-bottom: 1px solid var(--border-color); }\n' +
'    .h-table th { font-weight: 700; }\n' +
'    .h-faq-item { border: 1px solid var(--border-color); border-radius: 10px; padding: 4px 14px; margin-bottom: 8px; }\n' +
'    .h-faq-item summary { cursor: pointer; font-weight: 600; padding: 10px 0; }\n' +
'    .h-faq-a { padding-bottom: 10px; color: var(--text-muted); line-height: 1.6; }\n' +
'    .h-related { display: flex; flex-wrap: wrap; gap: 10px; }\n' +
'    .h-chip { padding: 8px 14px; border: 1px solid var(--border-color); border-radius: 999px; text-decoration: none; color: var(--text-primary); font-size: 0.9rem; font-weight: 600; }\n' +
'    .h-chip:hover { border-color: var(--accent); }\n';

function hubPage(hub, lang, matched, indexable, relatedList) {
  var c = hub.content[lang];
  var canonical = hubUrl(hub, lang);
  var list = hubEventList(matched, lang, 60);
  var lead = c.lead.replace('{count}', String(matched.length));
  var ogImage = SITE + '/iSard_icon.png';
  var UI_MORE = { es: 'Ver todas en el calendario', ca: 'Veure-les totes al calendari', en: 'See all in the calendar' };
  var robots = indexable ? '' : '  <meta name="robots" content="noindex,follow">\n';
  var switchMap = {};
  LANGS.forEach(function (l) { switchMap[l] = hubPath(hub, l); });

  return '<!DOCTYPE html>\n' +
'<html lang="' + lang + '">\n' +
'<head>\n' +
'  <meta charset="UTF-8">\n' +
'  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
'  <title>' + esc(c.title) + '</title>\n' +
'  <meta name="description" content="' + esc(c.description) + '">\n' +
robots +
'  <link rel="canonical" href="' + esc(canonical) + '">\n' +
'  ' + hubHreflang(hub) + '\n' +
'  <meta property="og:type" content="website">\n' +
'  <meta property="og:site_name" content="iSard">\n' +
'  <meta property="og:title" content="' + esc(c.title) + '">\n' +
'  <meta property="og:description" content="' + esc(c.description) + '">\n' +
'  <meta property="og:url" content="' + esc(canonical) + '">\n' +
'  <meta property="og:image" content="' + esc(ogImage) + '">\n' +
'  ' + ogLocaleTags(lang) + '\n' +
'  <meta name="twitter:card" content="summary">\n' +
'  <link rel="icon" type="image/png" href="/iSard_icon.png">\n' +
'  <link rel="stylesheet" href="/css/tokens.css">\n' +
'  <link rel="stylesheet" href="/css/theme.css">\n' +
'  <link rel="stylesheet" href="/css/header.css">\n' +
'  <script src="/js/theme.js"></script>\n' +
'  <script type="application/ld+json">' + hubJsonLd(hub, lang, canonical, c, list.shown) + '</script>\n' +
'  <style>\n' +
'    * { margin: 0; padding: 0; box-sizing: border-box; }\n' +
'    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;\n' +
'           background-color: var(--bg-page); color: var(--text-primary); min-height: 100vh; }\n' +
HUB_CSS +
'  </style>\n' +
'</head>\n' +
'<body>\n' +
'  <main class="h-main">\n' +
'    <nav class="h-crumb" aria-label="Breadcrumb"><a href="/' + lang + '/">iSard</a> › <a href="/' + lang + '/race-calendar">' + esc(HUBS.CAL[lang]) + '</a> › <span>' + esc(hub.name[lang]) + '</span></nav>\n' +
'    <h1>' + esc(c.h1) + '</h1>\n' +
'    <p class="h-lead">' + esc(lead) + '</p>\n' +
'    <section class="h-section"><h2>' + esc(c.listTitle) + '</h2>' + list.html +
'      <a class="h-more" href="/' + lang + '/race-calendar">' + esc(UI_MORE[lang]) + ' →</a></section>\n' +
(c.body ? '    <section class="h-section">' + c.body + '</section>\n' : '') +
'    <section class="h-section"><h2>' + esc(c.faqTitle) + '</h2>' + hubFaqHtml(c.faq) + '</section>\n' +
'    <section class="h-section"><h2>' + esc(c.relatedTitle) + '</h2><div class="h-related">' + hubRelatedHtml(hub, lang, relatedList) + '</div></section>\n' +
'  </main>\n' +
'  <script src="/js/header.js"></script>\n' +
'  <script src="/js/i18n.js"></script>\n' +
'  <script>if(window.i18nInit)i18nInit({});window.onLangChange=function(l){var u=' + jsonInline(switchMap) + ';if(u[l])window.location.assign(u[l]);};</script>\n' +
'</body>\n' +
'</html>\n';
}

function byDateAsc(a, b) { var x = a.date || '', y = b.date || ''; return x < y ? -1 : x > y ? 1 : 0; }

// Attach matched (sorted) + indexable to a hub descriptor. `pre` skips re-filtering.
function finalizeHub(d, pre) {
  d.matched = (pre || races.filter(d.filter)).slice().sort(byDateAsc);
  d.indexable = d.matched.length >= HUB_MIN;
  return d;
}

// All hub descriptors: distance + sport (explicit content) and location
// (templated content built from the community's real count + provinces).
function buildHubDescriptors() {
  var out = [];
  HUBS.distanceHubs.forEach(function (h) {
    out.push(finalizeHub({ id: h.id, family: 'distance', filter: h.filter, slug: h.slug, name: h.name, content: h.content }));
  });
  HUBS.sportHubs.forEach(function (h) {
    var sport = h.sport;
    out.push(finalizeHub({ id: 'sport-' + h.id, family: 'sport', filter: function (r) { return r.sport === sport; }, slug: h.slug, name: h.name, content: h.content }));
  });
  HUBS.COMMUNITIES.forEach(function (comm) {
    var key = comm.key;
    var matched = races.filter(function (r) { return r.location && r.location.autonomousCommunity === key; });
    if (!matched.length) return;
    var seen = {}, provinces = [];
    matched.forEach(function (r) { var p = r.location.province; if (p && !seen[p]) { seen[p] = 1; provinces.push(p); } });
    provinces.sort();
    var ctx = { name: comm.name, count: matched.length, provinces: provinces.length >= 2 ? provinces : [] };
    var content = {};
    LANGS.forEach(function (l) { content[l] = HUBS.locationContent(l, ctx); });
    out.push(finalizeHub({
      id: 'loc-' + comm.slug, family: 'location',
      filter: function (r) { return r.location && r.location.autonomousCommunity === key; },
      slug: { es: comm.slug, ca: comm.slug, en: comm.slug }, name: comm.name, content: content
    }, matched));
  });
  return out;
}

function writeHubPages(descriptors, relatedList) {
  var pages = 0, indexed = [];
  descriptors.forEach(function (d) {
    LANGS.forEach(function (lang) {
      var dir = path.join(PUBLIC, lang, HUBS.PREFIX[lang], d.slug[lang]);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'index.html'), hubPage(d, lang, d.matched, d.indexable, relatedList));
      pages++;
    });
    if (d.indexable) indexed.push(d);
  });
  return { pages: pages, indexed: indexed };
}

// The <xhtml:link> alternates block shared by every locale entry of one race.
function raceAlternatesXml(slug) {
  var links = LANGS.map(function (l) {
    return '    <xhtml:link rel="alternate" hreflang="' + l + '" href="' + esc(SITE + '/' + l + '/races/' + slug) + '"/>';
  });
  links.push('    <xhtml:link rel="alternate" hreflang="x-default" href="' + esc(SITE + '/es/races/' + slug) + '"/>');
  return links.join('\n');
}

// hreflang alternates for a localized static page (suffix '' = home).
function staticAlternatesXml(suffix) {
  var slash = suffix === '' ? '/' : '';
  var links = LANGS.map(function (l) {
    return '    <xhtml:link rel="alternate" hreflang="' + l + '" href="' + esc(SITE + '/' + l + suffix + slash) + '"/>';
  });
  links.push('    <xhtml:link rel="alternate" hreflang="x-default" href="' + esc(SITE + '/es' + suffix + slash) + '"/>');
  return links.join('\n');
}

function writeSitemap(races, indexedHubs) {
  var siteMod = lastmod(manifest.generatedAt);
  // Localized homepage + calendar (one <url> per locale, with alternates); the
  // legacy '/' and '/race-calendar' are omitted (they canonicalise to /es).
  var staticEntries = [];
  STATIC_PAGES.forEach(function (spec) {
    var slash = spec.path === '' ? '/' : '';
    var alts = staticAlternatesXml(spec.path);
    LANGS.forEach(function (l) {
      staticEntries.push('  <url><loc>' + esc(SITE + '/' + l + spec.path + slash) +
        '</loc><lastmod>' + siteMod + '</lastmod>\n' + alts + '\n  </url>');
    });
  });
  // Single-URL utility/funnel pages (client-localized for now).
  ['/race-alerts', '/contact', '/privacy'].forEach(function (p) {
    staticEntries.push('  <url><loc>' + esc(SITE + p) + '</loc><lastmod>' + siteMod + '</lastmod></url>');
  });
  // One <url> per locale per race, each carrying the full hreflang alternate set.
  // The legacy /races/<slug> URL is intentionally omitted — it canonicalises to /es.
  var raceEntries = [];
  races.forEach(function (r) {
    var slug = slugMap[r.id];
    var mod = lastmod(r.updatedAt);
    var alts = raceAlternatesXml(slug);
    LANGS.forEach(function (l) {
      raceEntries.push('  <url><loc>' + esc(SITE + '/' + l + '/races/' + slug) +
        '</loc><lastmod>' + mod + '</lastmod>\n' + alts + '\n  </url>');
    });
  });
  // Indexable hubs (one <url> per locale, with alternates).
  var hubEntries = [];
  (indexedHubs || []).forEach(function (hub) {
    var alts = hubAlternatesXml(hub);
    LANGS.forEach(function (l) {
      hubEntries.push('  <url><loc>' + esc(hubUrl(hub, l)) +
        '</loc><lastmod>' + siteMod + '</lastmod>\n' + alts + '\n  </url>');
    });
  });
  var body = staticEntries.concat(hubEntries).concat(raceEntries).join('\n');
  var xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"' +
    ' xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' + body + '\n</urlset>\n';
  fs.writeFileSync(path.join(PUBLIC, 'sitemap.xml'), xml);
}

function writeRace(dir, html) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
}

function main() {
  var start = Date.now();
  // Legacy /races/<slug> is no longer generated: vercel.json 301-redirects
  // /races/* → /es/races/* (see the cutover redirects), so those URLs
  // consolidate onto the localized pages instead of being served directly.
  if (fs.existsSync(OUT)) fs.rmSync(OUT, { recursive: true, force: true });
  var pages = 0;
  races.forEach(function (race) {
    var slug = slugMap[race.id];
    // One server-rendered page per locale: /es|ca|en/races/<slug>.
    LANGS.forEach(function (lang) {
      writeRace(path.join(PUBLIC, lang, 'races', slug), page(race, lang));
      pages++;
    });
  });
  // Hub descriptors first, so the homepage index can list the top territories.
  var descriptors = buildHubDescriptors();
  homeTopLocations = descriptors
    .filter(function (d) { return d.family === 'location' && d.indexable; })
    .sort(function (a, b) { return b.matched.length - a.matched.length; })
    .slice(0, 8);
  // Every hub cross-links to the sport + distance hubs (connects the graph).
  var relatedList = descriptors.filter(function (d) { return d.family === 'sport' || d.family === 'distance'; });

  var staticN = buildStaticPages();
  var hubs = writeHubPages(descriptors, relatedList);
  writeSitemap(races, hubs.indexed);
  console.log('[build-races] wrote ' + pages + ' race pages (' + races.length +
    ' races × ' + LANGS.length + ' locales) + ' + staticN +
    ' localized static pages + ' + hubs.pages + ' hub pages (' +
    hubs.indexed.length + '/' + descriptors.length + ' indexable) + sitemap.xml in ' +
    ((Date.now() - start) / 1000).toFixed(1) + 's');
}

main();
