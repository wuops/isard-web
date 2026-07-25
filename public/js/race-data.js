// @ts-check
/// <reference path="./race-types.d.ts" />
/**
 * Race-calendar data layer (vanilla, no build step).
 *
 * Loads the static JSON published by the pipeline into /data/ and exposes it
 * plus a set of localization helpers. Follows DATA_CONTRACT.md:
 *   - fetch manifest.json every load (no long cache); read the content-hashed
 *     `file` / `labelsFile` from it (never hardcode the hash) and fetch those.
 *     The pipeline writes the manifest + its hashed files in one atomic commit
 *     and Vercel deploys atomically, so the manifest can never point at a
 *     missing hash — we fetch exactly what it names and fail loudly otherwise.
 *   - pin to schemaVersion; refuse to render an unknown shape.
 *   - key user state on race.id; date is null when unconfirmed → use expectedYear.
 *
 * Exposes a single global `RaceData` (matching the site's other vanilla scripts).
 */
(function () {
  var DATA_DIR = '/data/';
  var SUPPORTED_SCHEMA = 1;

  /**
   * @param {string} url
   * @param {RequestCache} [cacheMode]  'no-cache' for the manifest (always
   *   revalidate); default for the content-hashed files (immutable → the
   *   browser may serve them from cache permanently, honouring Cache-Control).
   */
  function fetchJson(url, cacheMode) {
    return fetch(url, { cache: cacheMode || 'default' }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + url);
      return res.json();
    });
  }

  /**
   * Load manifest → races + labels. The manifest is the only file that changes
   * month to month; the hashed files it names are immutable (cached permanently
   * by the browser). We fetch exactly what the manifest points at — no aliases,
   * no fallback — so a bad deploy surfaces instead of silently serving stale data.
   * @returns {Promise<{ manifest: Manifest, races: Race[], labels: Labels }>}
   */
  function load() {
    return fetchJson(DATA_DIR + 'manifest.json', 'no-cache').then(function (/** @type {Manifest} */ manifest) {
      if (manifest.schemaVersion !== SUPPORTED_SCHEMA) {
        throw new Error(
          'Unsupported schemaVersion ' + manifest.schemaVersion +
          ' (client supports ' + SUPPORTED_SCHEMA + ')'
        );
      }
      return Promise.all([
        fetchJson(DATA_DIR + manifest.file),
        fetchJson(DATA_DIR + manifest.labelsFile)
      ]).then(function (parts) {
        return { manifest: manifest, races: /** @type {Race[]} */ (parts[0]), labels: /** @type {Labels} */ (parts[1]) };
      });
    });
  }

  // ---- Localization helpers -------------------------------------------------

  /**
   * A race/place name is a proper noun: prefer the official CA/ES variant when it
   * genuinely exists, else the original `name`. English always uses `name`.
   * @param {Race} race
   * @param {Lang} lang
   */
  function displayName(race, lang) {
    if (lang === 'ca' && race.names && race.names.ca) return race.names.ca;
    if (lang === 'es' && race.names && race.names.es) return race.names.es;
    return race.name;
  }

  /**
   * Look up a localized enum term from labels.json, falling back to the raw key.
   * @param {Labels} labels
   * @param {keyof Labels} category
   * @param {string} key
   * @param {Lang} lang
   */
  function term(labels, category, key, lang) {
    if (!key) return '';
    var cat = /** @type {Record<string, LocalizedTerm>} */ (labels[category]);
    var entry = cat && cat[key];
    return (entry && entry[lang]) || key;
  }

  /** @param {Labels} labels @param {Race} race @param {Lang} lang */
  function sportLabel(labels, race, lang) {
    return term(labels, 'sport', race.sport, lang);
  }

  /** @param {Labels} labels @param {Race} race @param {Lang} lang */
  function formatLabel(labels, race, lang) {
    return term(labels, 'format', race.format, lang);
  }

  /**
   * Registration status → localized term. "" (unknown) returns "".
   * @param {Labels} labels @param {Race} race @param {Lang} lang
   */
  function registrationLabel(labels, race, lang) {
    return term(labels, 'registration', race.registration.status, lang);
  }

  /** @param {Labels} labels @param {Race} race @param {Lang} lang */
  function dateStatusLabel(labels, race, lang) {
    return term(labels, 'dateStatus', race.dateStatus, lang);
  }

  /**
   * The effective year of a race whether or not its date is confirmed.
   * date is null exactly when dateStatus === "unconfirmed" → use expectedYear.
   * @param {Race} race
   * @returns {number | null}
   */
  function raceYear(race) {
    if (race.date) return Number(race.date.slice(0, 4));
    return race.expectedYear;
  }

  /**
   * 1-based month of a dated race, or null when the date is unconfirmed.
   * @param {Race} race
   * @returns {number | null}
   */
  function raceMonth(race) {
    if (!race.date) return null;
    return Number(race.date.slice(5, 7));
  }

  /**
   * Human date for a race, honestly reflecting dateStatus.
   * - confirmed/provisional: "dd <month> yyyy" localized (weekday omitted for scannability).
   * - unconfirmed: just the expected year (or a localized "date TBC" when even that is null).
   * @param {Labels} labels @param {Race} race @param {Lang} lang
   */
  function formatRaceDate(labels, race, lang) {
    if (!race.date) {
      return race.expectedYear ? String(race.expectedYear) : '';
    }
    var y = race.date.slice(0, 4);
    var m = String(Number(race.date.slice(5, 7)));
    var d = String(Number(race.date.slice(8, 10)));
    var monthName = term(labels, 'months', m, lang);
    // CA/ES: "6 de setembre de 2026" reads naturally; EN: "6 September 2026".
    if (lang === 'en') return d + ' ' + monthName + ' ' + y;
    return d + ' de ' + monthName + ' de ' + y;
  }

  /**
   * Compact date for the calendar tile: day number + abbreviated month.
   * @param {Labels} labels @param {Race} race @param {Lang} lang
   * @returns {{ day: string, month: string, year: string }}
   */
  function dateParts(labels, race, lang) {
    if (!race.date) {
      return { day: '', month: '', year: race.expectedYear ? String(race.expectedYear) : '' };
    }
    var m = String(Number(race.date.slice(5, 7)));
    return {
      day: String(Number(race.date.slice(8, 10))),
      month: term(labels, 'monthsAbbr', m, lang),
      year: race.date.slice(0, 4)
    };
  }

  /**
   * Short distances summary, e.g. "10K · 21K" or "12–48 km" for non-running.
   * Running races expose named distances; cycling/hiking rely on min/max km.
   * @param {Race} race
   */
  function distancesSummary(race) {
    if (race.distances && race.distances.length) {
      return race.distances.map(function (d) {
        return d.name || (formatKm(d.km) + ' km');
      }).join(' · ');
    }
    if (race.minKm != null && race.maxKm != null) {
      if (race.minKm === race.maxKm) return formatKm(race.minKm) + ' km';
      return formatKm(race.minKm) + '–' + formatKm(race.maxKm) + ' km';
    }
    return '';
  }

  /** @param {number} km */
  function formatKm(km) {
    return Number.isInteger(km) ? String(km) : String(Math.round(km * 10) / 10);
  }

  window.RaceData = {
    SUPPORTED_SCHEMA: SUPPORTED_SCHEMA,
    load: load,
    displayName: displayName,
    term: term,
    sportLabel: sportLabel,
    formatLabel: formatLabel,
    registrationLabel: registrationLabel,
    dateStatusLabel: dateStatusLabel,
    raceYear: raceYear,
    raceMonth: raceMonth,
    formatRaceDate: formatRaceDate,
    dateParts: dateParts,
    distancesSummary: distancesSummary
  };
})();
