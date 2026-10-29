#!/usr/bin/env node
/**
 * verify-search-console.mjs
 *
 * Writes the HTML-file verification file Google Search Console asks for.
 *
 * Usage:
 *   node scripts/verify-search-console.mjs <token>
 *
 * Example:
 *   node scripts/verify-search-console.mjs AbCdEf123456
 *
 * The token is the part after `google-site-verification=` in the meta tag
 * Google shows you. The script writes
 * `public/google<token>.html` containing the verification string, which
 * GitHub Pages will serve at
 * `/cleanboard-site/google<token>.html`.
 *
 * After running this, open that URL in a browser to confirm it works, then
 * click "Verify" in Search Console.
 */

import { writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const publicDir = resolve(projectRoot, "public");

const token = (process.argv[2] ?? "").trim();

if (!token) {
    console.error("✖ Missing verification token.");
    console.error(
        "  Usage: node scripts/verify-search-console.mjs <token>\n" +
            "  The token is the value of the google-site-verification meta tag.",
    );
    process.exit(1);
}

if (!/^[A-Za-z0-9_-]{10,}$/.test(token)) {
    console.error(`✖ "${token}" does not look like a Google verification token.`);
    process.exit(1);
}

if (!existsSync(publicDir)) {
    console.error(`✖ Missing public directory: ${publicDir}`);
    process.exit(1);
}

const file = resolve(publicDir, `google${token}.html`);
writeFileSync(
    file,
    `google-site-verification=${token}\n`,
    "utf8",
);

console.log(`✔ Wrote ${file.replace(projectRoot, ".")}`);
console.log("");
console.log("Next steps:");
console.log("");
console.log("  1. In Google Search Console, click Verify on the HTML tag");
console.log(`     (or HTML file) verification method.`);
console.log("");
console.log("  2. Open this URL in your browser and check that it shows the");
console.log("     verification string:");
console.log(
    `     https://heymeowcat.is-a.dev/cleanboard-site/google${token}.html`,
);
console.log("");
console.log("  3. If Google cannot find the file, paste the token into");
console.log("     `gscToken` in src/lib/site.ts instead — the layout then");
console.log("     emits the <meta> tag on every page under the property path:");
console.log("");
console.log(`     export const gscToken = "${token}";`);
console.log("");
console.log("  4. Under Sitemaps, submit:");
console.log("     https://heymeowcat.is-a.dev/cleanboard-site/sitemap-index.xml");
console.log("");
console.log("  5. Under URL Inspection, request indexing for:");
console.log("     https://heymeowcat.is-a.dev/cleanboard-site/");
console.log("     https://heymeowcat.is-a.dev/cleanboard-site/transliterate/");
console.log("");
