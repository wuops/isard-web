/**
 * iSard race-calendar data contract — JSDoc typedefs for the vanilla-JS client.
 *
 * Reference only (no build step). These mirror docs/DATA_CONTRACT.md and the
 * canonical isard-races.ts. Editors pick them up via the `// @ts-check` +
 * `@typedef import` references in race-data.js / race-calendar.js.
 *
 * Every field is always present in the JSON; absent values are null / "" / false.
 */

/** @typedef {"ca" | "es" | "en"} Lang */

/** @typedef {"road_running" | "trail_running" | "cycling" | "hiking"} Sport */

/**
 * @typedef {(
 *   "road" | "trail" | "mountain" | "skyrace" | "vertical_kilometer" |
 *   "ultra_trail" | "cross_country" | "stair_race" | "other_running" |
 *   "road_cycling" | "granfondo" | "cyclosportive" | "mtb_marathon" |
 *   "mtb_xco" | "gravel" | "cyclocross" | "downhill_mtb" | "other_cycling" |
 *   "hiking_march" | "resistance_march" | "long_distance_trek" | "other_hiking"
 * )} RaceFormat
 */

/** @typedef {"confirmed" | "provisional" | "unconfirmed"} DateStatus */

/**
 * @typedef {(
 *   "announced" | "confirmed" | "registration_open" | "registration_closed" |
 *   "sold_out" | "postponed" | "cancelled" | "completed" | "unconfirmed"
 * )} EventStatus
 */

/** "" means unknown. @typedef {"" | "open" | "closed" | "sold_out"} RegistrationStatus */

/** @typedef {"exact_start" | "venue" | "municipality" | "approximate" | "unknown"} CoordinatePrecision */

/** @typedef {"iconic" | "major" | "established" | "regional" | "local" | "emerging_or_unknown"} PopularityTier */

/** @typedef {"verified" | "mostly_verified" | "needs_review" | "unverified"} Verification */

/**
 * @typedef {Object} Distance
 * @property {number} km
 * @property {string} name
 * @property {number | null} elevationGainM
 * @property {number | null} priceEur
 */

/**
 * @typedef {Object} RaceLocation
 * @property {string} municipality
 * @property {string} comarca            Catalonia only; "" elsewhere
 * @property {string} province
 * @property {string} autonomousCommunity
 * @property {"ES" | "AD"} country
 * @property {number | null} lat
 * @property {number | null} lon
 * @property {CoordinatePrecision} precision
 * @property {string} venue
 * @property {boolean} crossBorder
 */

/**
 * Running semantics; all false for cycling/hiking.
 * @typedef {Object} DistanceFilters
 * @property {boolean} has5k
 * @property {boolean} has10k
 * @property {boolean} has15k
 * @property {boolean} hasHalfMarathon
 * @property {boolean} hasMarathon
 * @property {boolean} hasUltra
 * @property {boolean} hasOther
 */

/**
 * @typedef {Object} Race
 * @property {string} id                 Stable UUID — key favourites/state on this.
 * @property {string} seriesId
 * @property {string} slug
 * @property {string} name               Official name — never translated.
 * @property {{ ca: string, es: string }} names
 * @property {string} canonicalName
 * @property {number | null} edition
 * @property {string} series
 * @property {string} federation
 * @property {Sport} sport
 * @property {RaceFormat} format
 * @property {string | null} date        ISO yyyy-MM-dd; null when dateStatus === "unconfirmed".
 * @property {string | null} endDate
 * @property {DateStatus} dateStatus
 * @property {number | null} expectedYear
 * @property {string} startTime          "HH:MM" or "".
 * @property {string} timezone
 * @property {RaceLocation} location
 * @property {Distance[]} distances      Sorted ascending; may be empty.
 * @property {number} distanceCount
 * @property {number | null} minKm
 * @property {number | null} maxKm
 * @property {DistanceFilters} distanceFilters
 * @property {{ official: string, registration: string, results: string, route: string, gpx: string, instagram: string, facebook: string }} links
 * @property {{ name: string, email: string, phone: string }} organizer
 * @property {{ minEur: number | null, maxEur: number | null, currency: string }} price
 * @property {{ status: RegistrationStatus, openDate: string | null, closeDate: string | null, participantLimit: number | null, soldOut: boolean | null }} registration
 * @property {{ childrenRaces: boolean | null, nightRace: boolean | null, relay: boolean | null, charity: boolean | null }} attributes
 * @property {{ score: number, tier: PopularityTier, override: number | null, calculated: number, reason: string }} popularity
 * @property {{ score: number, verification: Verification }} confidence
 * @property {EventStatus} status
 * @property {string} updatedAt
 * @property {string} firstSeenAt
 * @property {string} lastVerifiedAt
 */

/**
 * @typedef {Object} Manifest
 * @property {number} schemaVersion
 * @property {string} version            e.g. "2026-08-01"
 * @property {string} generatedAt
 * @property {number} count
 * @property {string} [contentHash]
 * @property {string} file               Hashed races file to fetch, e.g. "races.9f3a1c.json".
 * @property {Lang[]} languages
 * @property {string} labelsFile         Hashed labels file, e.g. "labels.50f15d.json".
 * @property {Partial<Record<Sport, number>>} sports
 * @property {string[]} territories
 * @property {{ startDate: string, endDate: string, countries: Array<"ES" | "AD"> }} scope
 * @property {string} [description]
 */

/** A localized term. @typedef {Record<Lang, string>} LocalizedTerm */

/**
 * labels.json — nested by category. Categories are maps of enum key → LocalizedTerm.
 * @typedef {Object} Labels
 * @property {Lang[]} languages
 * @property {Record<string, LocalizedTerm>} sport
 * @property {Record<string, LocalizedTerm>} format
 * @property {Record<string, LocalizedTerm>} dateStatus
 * @property {Record<string, LocalizedTerm>} eventStatus
 * @property {Record<string, LocalizedTerm>} registration
 * @property {Record<string, LocalizedTerm>} coordinatePrecision
 * @property {Record<string, LocalizedTerm>} popularityTier
 * @property {Record<string, LocalizedTerm>} verification
 * @property {Record<string, LocalizedTerm>} distanceFilter
 * @property {Record<string, LocalizedTerm>} months        "1".."12"
 * @property {Record<string, LocalizedTerm>} monthsAbbr
 * @property {Record<string, LocalizedTerm>} newsletter
 */

export {};
