# CleanBoard — website

The marketing site for **CleanBoard**, a free, private, fully offline
Android keyboard for Sinhala and English.

The site's main feature is a working **English (Singlish) → Sinhala
transliterator** that runs entirely in the browser, using the exact same
engine that ships inside the Android app.

- **Live site:** https://heymeowcat.is-a.dev/cleanboard-site/
- **Stack:** Astro 7 (static output) → GitHub Pages

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:4321/cleanboard-site/
```

```bash
npm run build        # → dist/
npm run preview      # serve the built output
```

Requires **Node 22.23.4 or newer** (CI uses Node 22). The test scripts
bundle the TypeScript engine with esbuild, so no experimental type stripping
is required.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the built site locally |
| `npm run check` | Astro + TypeScript type check |
| `npm run verify` | **The full gate** — tests, build, link check, SEO audit |
| `npm run test:transliterator` | Assert the engine against the reference corpus |
| `npm run test:links` | Assert no broken internal links, images or fragments |
| `npm run audit:seo` | Assert the on-page SEO rules (see below) |
| `npm run fetch:fonts` | Re-download the self-hosted web fonts |
| `npm run optimize:images` | Re-compress every raster asset |

---

## Project layout

```
src/
  assets/fonts/          self-hosted variable web fonts (woff2)
  components/            Header, Footer, Transliterator, PlayBadge, page bodies
  data/
    character-map.json   letter mappings used by the engine
    content.ts           marketing copy, in English and Sinhala
    nav.ts               navigation, footer links and FAQ entries
  layouts/Layout.astro   the <head>: canonical, OG, Twitter, JSON-LD, hreflang
  lib/
    site.ts              ← single source of truth for URLs and metadata
    schema.ts            JSON-LD builders
    transliterator.ts    the transliteration engine
  pages/                 one file per route
  styles/global.css      design tokens and base styles
scripts/                 build, audit and asset tooling
public/                  static files served from the site root
```

---

## The transliteration engine

The engine lives in `src/lib/transliterator.ts` and runs entirely in the
browser — nothing is sent anywhere while you type.

`npm run test:transliterator` checks every known word against the reference
corpus and reports how well the rules generalise to words the engine has
never seen. Where two spellings are possible — කෙ / කේ, ග / ඝ, ද / ඩ — a
bundled frequency table picks the most common reading.

---

## Content, URLs and metadata

`src/lib/site.ts` is the single place to change the domain or the base
path:

```ts
export const ORIGIN = "https://heymeowcat.is-a.dev";
export const BASE_PATH = "/cleanboard-site";
```

Canonical URLs, the sitemap, `robots.txt`, Open Graph URLs and the JSON-LD
all derive from those two values.

### Adding a page

1. Create `src/pages/<path>.astro`.
2. Pass `title`, `description` and `path` to `<Layout>`.
3. Pass `alternates={{ en: "...", si: "..." }}` if a Sinhala version exists.
4. Add the pair to `HREFLANG_PAIRS` in `astro.config.mjs` so the sitemap
   emits the `hreflang` alternates.
5. Add it to `navItems` in `src/data/nav.ts` if it belongs in the header.

`npm run audit:seo` will tell you if you missed anything.

---

## SEO guarantees

`npm run audit:seo` fails the build if any page breaks one of these rules:

- exactly one `<h1>` per page
- no skipped heading levels (h2 → h4 is an error)
- a unique `<title>` (50–60 chars) and meta description (120–160 chars)
- an `https` canonical URL
- an indexable robots directive (the 404 page excepted)
- complete Open Graph metadata, including `og:image` with explicit
  dimensions
- Twitter card metadata
- `alt` text and explicit `width`/`height` on every `<img>`
- valid JSON-LD on every page
- `hreflang` alternates that resolve to real pages
- a viewport meta tag and a correct `lang` attribute

`npm run test:links` fails if any internal link, image, `srcset` entry or
fragment anchor does not resolve. Add `--remote` to also check external URLs
over the network.

---

## Performance

- **No third-party requests.** The fonts and the Google Play badge are
  self-hosted, so the page never contacts Google — which also means the
  visitor's IP is not leaked to a third party.
- **Fonts** are self-hosted variable woff2 files (one per family, covering
  every weight) with `font-display: swap` and a `<link rel=preload>` for the
  two faces used above the fold.
- **CSS is inlined** into every page (`inlineStylesheets: "always"`), so
  there is no render-blocking stylesheet request.
- **JavaScript is external** (`assetsInlineLimit: 0`) so a strict
  `script-src 'self'` Content-Security-Policy works without exceptions.
- **Images** are pre-compressed with sharp: the app icon is 7.5 KB, the
  Open Graph card is ~60 KB, the Play badge is 4 KB.
- **Every image has explicit dimensions**, so there is no layout shift.
- `prefers-reduced-motion` is respected.

### The fonts

The site used to load `IBM Plex Sans Sinhala` from Google Fonts — that
family **is no longer served by Google**, so every Sinhala glyph on the
live site was silently falling back to a system font. The site now
self-hosts **Noto Sans Sinhala** and **Outfit** instead.

```bash
npm run fetch:fonts      # re-download and regenerate src/styles/fonts.css
```

---

## Security headers

`public/_headers` sets, for every response:

- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `Content-Security-Policy` with `default-src 'self'`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: SAMEORIGIN`
- `Permissions-Policy` denying camera, microphone, geolocation and payment
- long-lived `Cache-Control` for the hashed `_astro/` assets

`public/_redirects` normalises the old flat slugs to their new trailing
slash locations, so no existing inbound link 404s.

GitHub Pages enforces HTTPS itself, and the HSTS header tells browsers to
refuse plain HTTP from then on.

---

## Licence

The website code is part of the CleanBoard project. The transliteration
engine is derived from the CleanBoard Android app.
