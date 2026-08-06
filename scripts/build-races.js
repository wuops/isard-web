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

var PUBLIC = path.join(__dirname, '..', 'public');
var DATA = path.join(PUBLIC, 'data');
var OUT = path.join(PUBLIC, 'races');
var SITE = 'https://isard.app';
var DEFAULT_LANG = 'es';
var LANGS = ['es', 'ca', 'en'];

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

function jsonLd(race, canonical) {
  var loc = race.location;
  var name = RaceDetail.displayName(race, DEFAULT_LANG);
  var obj = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: name,
    url: canonical
  };
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

function altLinks(canonical) {
  var out = LANGS.map(function (l) {
    return '<link rel="alternate" hreflang="' + l + '" href="' + esc(canonical + '?lang=' + l) + '">';
  });
  out.push('<link rel="alternate" hreflang="x-default" href="' + esc(canonical) + '">');
  return out.join('\n  ');
}

function page(race) {
  var slug = slugMap[race.id];
  var canonical = SITE + '/races/' + slug;
  var meta = RaceDetail.metaFor(race, labels, DEFAULT_LANG);
  var header = RaceDetail.renderHeader(race, labels, DEFAULT_LANG, slug);
  var body = RaceDetail.renderBody(race, labels, DEFAULT_LANG);
  var map = mapEmbed(race);
  var ogImage = SITE + '/iSard_icon.png';

  return '<!DOCTYPE html>\n' +
'<html lang="es">\n' +
'<head>\n' +
'  <meta charset="UTF-8">\n' +
'  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
'  <title>' + esc(meta.title) + '</title>\n' +
'  <meta name="description" content="' + esc(meta.description) + '">\n' +
'  <link rel="canonical" href="' + esc(canonical) + '">\n' +
'  ' + altLinks(canonical) + '\n' +
'  <meta property="og:type" content="website">\n' +
'  <meta property="og:site_name" content="iSard">\n' +
'  <meta property="og:title" content="' + esc(meta.title) + '">\n' +
'  <meta property="og:description" content="' + esc(meta.description) + '">\n' +
'  <meta property="og:url" content="' + esc(canonical) + '">\n' +
'  <meta property="og:image" content="' + esc(ogImage) + '">\n' +
'  <meta name="twitter:card" content="summary">\n' +
'  <link rel="icon" type="image/png" href="/iSard_icon.png">\n' +
'  <link rel="stylesheet" href="/css/tokens.css">\n' +
'  <link rel="stylesheet" href="/css/theme.css">\n' +
'  <link rel="stylesheet" href="/css/header.css">\n' +
'  <link rel="stylesheet" href="/vendor/leaflet/leaflet.css">\n' +
'  <link rel="stylesheet" href="/css/race-detail.css">\n' +
'  <script src="/js/theme.js"></script>\n' +
'  <script type="application/ld+json">' + jsonLd(race, canonical) + '</script>\n' +
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

function writeSitemap(slugs) {
  var staticPaths = ['/', '/race-calendar', '/race-alerts', '/contact', '/privacy'];
  var urls = staticPaths.map(function (p) { return SITE + p; })
    .concat(slugs.map(function (s) { return SITE + '/races/' + s; }));
  var body = urls.map(function (u) {
    return '  <url><loc>' + esc(u) + '</loc></url>';
  }).join('\n');
  var xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + body + '\n</urlset>\n';
  fs.writeFileSync(path.join(PUBLIC, 'sitemap.xml'), xml);
}

function main() {
  var start = Date.now();
  fs.mkdirSync(OUT, { recursive: true });
  var slugs = [];
  races.forEach(function (race) {
    var slug = slugMap[race.id];
    slugs.push(slug);
    var dir = path.join(OUT, slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), page(race));
  });
  writeSitemap(slugs);
  console.log('[build-races] wrote ' + races.length + ' race pages + sitemap.xml in ' +
    ((Date.now() - start) / 1000).toFixed(1) + 's');
}

main();
