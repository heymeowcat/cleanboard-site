import type { APIRoute } from "astro";
import { ORIGIN, BASE_PATH } from "../lib/site";

/**
 * robots.txt is generated at build time so the sitemap URL always matches the
 * deployment base path.
 *
 * Everything on this site is meant to be indexed — there are no admin,
 * preview or duplicate pages.
 */
export const GET: APIRoute = ({ site }) => {
    const origin = site?.origin ?? ORIGIN;
    const sitemap = `${origin}${BASE_PATH}/sitemap-index.xml`;

    const body = `# CleanBoard — Sinhala & English keyboard for Android
# ${origin}${BASE_PATH}/

User-agent: *
Allow: /

# Nothing here is private, but keep query-string noise out of the crawl budget.
Disallow: /*?*

Sitemap: ${sitemap}
`;

    return new Response(body, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
        },
    });
};
