// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

/**
 * Pages that exist in both languages, used to emit hreflang alternates in
 * sitemap.xml. Keep in sync with `src/lib/site.ts` and `src/data/nav.ts`.
 * @type {Array<[string, string]>}
 */
const HREFLANG_PAIRS = [
    ["/", "/si/"],
    ["/transliterate/", "/si/transliterate/"],
    ["/features/", "/si/features/"],
    ["/download/", "/si/download/"],
];

/** The path of a page relative to the site root, without the base path.
 * @param {string} pathname
 * @returns {string}
 */
function sitePath(pathname) {
    return pathname.replace(/^\/cleanboard-site/, "") || "/";
}

/**
 * @param {string} pathname
 * @returns {string | undefined}
 */
function alternateFor(pathname) {
    const path = sitePath(pathname);
    for (const [en, si] of HREFLANG_PAIRS) {
        if (path === en) return si;
        if (path === si) return en;
    }
    return undefined;
}

// https://astro.build/config
export default defineConfig({
    site: "https://heymeowcat.is-a.dev",
    base: "/cleanboard-site",
    trailingSlash: "always",
    compressHTML: true,
    build: {
        // The stylesheet is only a few KB — inlining it removes a
        // render-blocking request and saves a round trip.
        inlineStylesheets: "always",
        assets: "_astro",
    },
    image: {
        service: { entrypoint: "astro/assets/services/sharp" },
    },
    vite: {
        build: {
            // Keep every script in its own file rather than inlining small
            // chunks into the HTML, so a strict `script-src 'self'`
            // Content-Security-Policy can be used without exceptions.
            assetsInlineLimit: 0,
        },
    },
    integrations: [
        sitemap({
            filter: (page) => !page.includes("/404"),
            /**
             * @param {import("@astrojs/sitemap").SitemapItem} item
             * @returns {import("@astrojs/sitemap").SitemapItem}
             */
            serialize(item) {
                const url = new URL(item.url);
                const pathname = url.pathname;
                const alternate = alternateFor(pathname);
                const base = url.origin;

                if (!alternate) {
                    return /** @type {import("@astrojs/sitemap").SitemapItem} */ ({
                        ...item,
                        changefreq: "monthly",
                        priority: 0.7,
                    });
                }

                const path = sitePath(pathname);
                const isSinhala = path.startsWith("/si/");
                const en = isSinhala ? alternate : path;
                const si = isSinhala ? path : alternate;

                // The alternate URLs must include the deployment base path.
                const href = (/** @type {string} */ p) =>
                    `${base}/cleanboard-site${p}`;

                return /** @type {import("@astrojs/sitemap").SitemapItem} */ ({
                    ...item,
                    changefreq: "monthly",
                    priority: 0.9,
                    links: [
                        { lang: "en", url: href(en) },
                        { lang: "si", url: href(si) },
                    ],
                });
            },
        }),
    ],
});
