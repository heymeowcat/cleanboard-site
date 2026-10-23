/**
 * Single source of truth for site-wide metadata.
 *
 * To move the site to a new domain or a new deployment path, change
 * `ORIGIN` and `BASE_PATH` here — canonical tags, the sitemap, robots.txt,
 * Open Graph URLs and the JSON-LD all derive from these values.
 */

/** The scheme + host, without a trailing slash. */
export const ORIGIN = "https://heymeowcat.is-a.dev";

/** The path the site is served from. Keep the leading slash, drop the trailing one. */
export const BASE_PATH = "/cleanboard-site";

/** Absolute origin + base, without a trailing slash. */
export const SITE_URL = `${ORIGIN}${BASE_PATH}`;

export const SITE_NAME = "CleanBoard";

export const SITE_TAGLINE = "The Ultimate Sinhala & English Typing Experience";

export const DEFAULT_DESCRIPTION =
  "CleanBoard is a free, private, offline-first Android keyboard for Sinhala and English. Type Singlish and get සිංහල instantly — no ads, no tracking. Optional internet features are off until you enable them.";

export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.heymeowcat.cleanboard";

export const PLAY_STORE_ID = "com.heymeowcat.cleanboard";

export const GITHUB_URL = "https://github.com/heymeowcat/CleanBoard";

export const CONTACT_EMAIL = "privacy@heymeowcat.is-a.dev";

/**
 * Search Console / Bing Webmaster verification tokens.
 *
 * Google gives you a token in Search Console → Settings → Ownership
 * verification → HTML tag. It looks like
 * `google-site-verification=ABC123...`. Paste just the value here and the
 * layout emits the `<meta name="google-site-verification">` tag on every
 * page.
 *
 * Alternatively run `npm run verify:gsc -- <token>` to write the
 * `public/google<token>.html` file instead — both methods work.
 */
export const gscToken = "";

export const bingToken = "";

export const OG_IMAGE = {
  path: "/og-image.png",
  width: 1200,
  height: 630,
  alt: "CleanBoard — the private, offline-first Sinhala & English Android keyboard with a built-in Singlish transliteration engine.",
};

export const LOCALE = {
  en: "en_US",
  si: "si_LK",
} as const;

export type LocaleKey = keyof typeof LOCALE;

/**
 * Builds an absolute URL from a site-relative path.
 *
 * Note: this concatenates rather than using `new URL()`, because a leading
 * slash in a `new URL()` base resolves to the origin root and would drop the
 * `/cleanboard-site` base path.
 */
export function absoluteUrl(path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  // A path that already points at a file keeps its exact form; everything
  // else uses the trailing-slash directory form.
  if (/\.[a-z0-9]+$/i.test(clean)) return `${SITE_URL}${clean}`;
  const trimmed = clean === "/" ? "" : clean.replace(/\/+$/, "");
  return `${SITE_URL}${trimmed}/`;
}

/** Builds a site-relative URL that is safe to use in `href`/`src`. */
export function withBase(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (clean === "/") return `${BASE_PATH}/`;
  return `${BASE_PATH}${clean.replace(/\/+$/, "")}/`;
}
