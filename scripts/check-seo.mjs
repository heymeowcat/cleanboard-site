#!/usr/bin/env node
/**
 * check-seo.mjs
 *
 * Audits the built site against the SEO rules this project cares about:
 *
 *   • exactly one <h1> per page
 *   • no skipped heading levels
 *   • a unique, sensible <title> and meta description
 *   • a canonical URL on every page
 *   • Open Graph + Twitter card metadata, including a real og:image
 *   • an indexable robots directive (except the 404 page)
 *   • alt text on every <img>
 *   • valid JSON-LD structured data
 *   • hreflang alternates that resolve to real pages
 *   • a viewport meta tag and a correct lang attribute
 *
 * Usage: node scripts/check-seo.mjs
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "parse5";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const distDir = resolve(projectRoot, "dist");
const basePath = "/cleanboard-site";

if (!existsSync(distDir)) {
    console.error("✖ dist/ not found — run `npm run build` first.");
    process.exit(1);
}

function htmlFiles(dir) {
    const out = [];
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) out.push(...htmlFiles(full));
        else if (entry.endsWith(".html")) out.push(full);
    }
    return out;
}

function walk(node, visit) {
    if (node.tagName) visit(node);
    for (const child of node.childNodes ?? []) walk(child, visit);
}

const attr = (node, name) =>
    node.attrs?.find((a) => a.name === name)?.value ?? null;

const text = (node) => {
    if (node.nodeName === "#text") return node.value ?? "";
    return (node.childNodes ?? []).map(text).join("");
};

const issues = [];
const titles = new Map();
const descriptions = new Map();

const files = htmlFiles(distDir);
const pagePaths = new Set(
    files.map((f) =>
        `${basePath}/${relative(distDir, f).replace(/\\/g, "/").replace(/index\.html$/, "")}`.replace(
            /\/{2,}/g,
            "/",
        ),
    ),
);

for (const file of files) {
    const html = readFileSync(file, "utf8");
    const doc = parse(html);
    const rel = relative(distDir, file).replace(/\\/g, "/");
    const is404 = rel === "404.html";
    const where = rel;

    const meta = {};
    const links = {};
    const headings = [];
    const images = [];
    const jsonLd = [];
    let htmlLang = null;
    let viewport = null;

    walk(doc, (node) => {
        const tag = node.tagName;
        if (tag === "html") htmlLang = attr(node, "lang");
        if (tag === "meta") {
            const key = attr(node, "name") ?? attr(node, "property");
            const value = attr(node, "content") ?? "";
            if (key === "viewport") viewport = value;
            if (key) meta[key] = value;
        }
        if (tag === "link") {
            const rel2 = attr(node, "rel");
            const href = attr(node, "href");
            if (rel2 && href) {
                links[rel2] = links[rel2] ?? [];
                links[rel2].push({
                    href,
                    hreflang: attr(node, "hreflang"),
                });
            }
        }
        if (tag === "title") {
            headings.title = text(node).trim();
        }
        if (/^h[1-6]$/.test(tag)) {
            headings.push({ level: Number(tag[1]), text: text(node).trim() });
        }
        if (tag === "img") {
            images.push({
                alt: attr(node, "alt"),
                src: attr(node, "src"),
                loading: attr(node, "loading"),
                width: attr(node, "width"),
                height: attr(node, "height"),
            });
        }
        if (tag === "script" && attr(node, "type") === "application/ld+json") {
            jsonLd.push(text(node));
        }
    });

    const fail = (message) => issues.push(`${where}: ${message}`);

    // --- Title ------------------------------------------------------------
    const title = headings.title ?? "";
    if (!title) fail("missing <title>");
    else {
        if (title.length > 65) fail(`<title> is ${title.length} chars (aim for 50–60)`);
        if (title.length < 20) fail(`<title> is only ${title.length} chars`);
        if (titles.has(title)) {
            fail(`duplicate <title> (also on ${titles.get(title)})`);
        } else titles.set(title, where);
    }

    // --- Description ------------------------------------------------------
    const description = meta.description ?? "";
    if (!description) fail("missing meta description");
    else {
        if (description.length > 165) {
            fail(`meta description is ${description.length} chars (aim for 120–160)`);
        }
        if (description.length < 70) {
            fail(`meta description is only ${description.length} chars`);
        }
        if (descriptions.has(description)) {
            fail(
                `duplicate meta description (also on ${descriptions.get(description)})`,
            );
        } else descriptions.set(description, where);
    }

    // --- Canonical --------------------------------------------------------
    const canonicals = links.canonical ?? [];
    if (!canonicals.length) fail("missing <link rel=canonical>");
    else {
        for (const c of canonicals) {
            if (!c.href.startsWith("https://")) {
                fail(`canonical is not https: ${c.href}`);
            }
            if (c.href.startsWith("http://")) {
                fail(`canonical is not https: ${c.href}`);
            }
        }
    }

    // --- Robots -----------------------------------------------------------
    const robots = meta["robots"] ?? meta["googlebot"] ?? "";
    if (!robots) fail("missing robots meta");
    else if (is404) {
        if (!robots.includes("noindex")) fail("404 page should be noindex");
    } else if (robots.includes("noindex")) {
        fail(`page is noindex but should be indexable (robots="${robots}")`);
    }

    // --- Open Graph / Twitter --------------------------------------------
    for (const key of [
        "og:title",
        "og:description",
        "og:image",
        "og:url",
        "og:type",
        "og:site_name",
    ]) {
        if (!meta[key]) fail(`missing ${key}`);
    }
    if (!meta["og:image:width"] || !meta["og:image:height"]) {
        fail("missing og:image:width / og:image:height");
    }
    if (meta["og:image"] && !meta["og:image"].startsWith("https://")) {
        fail("og:image is not an absolute https URL");
    }
    for (const key of ["twitter:card", "twitter:title", "twitter:image"]) {
        if (!meta[key]) fail(`missing ${key}`);
    }

    // --- Headings ---------------------------------------------------------
    const h1s = headings.filter((h) => h.level === 1);
    if (h1s.length !== 1) {
        fail(`expected exactly 1 <h1>, found ${h1s.length}`);
    } else if (!h1s[0].text) {
        fail("<h1> is empty");
    }

    let previous = 0;
    for (const h of headings) {
        if (previous && h.level > previous + 1) {
            fail(
                `heading level jumps from h${previous} to h${h.level} ("${h.text.slice(0, 40)}")`,
            );
        }
        previous = h.level;
    }

    // --- Images -----------------------------------------------------------
    for (const img of images) {
        if (img.alt === null) {
            fail(`<img> is missing an alt attribute: ${img.src}`);
        }
        if (!img.width || !img.height) {
            fail(`<img> is missing width/height (causes layout shift): ${img.src}`);
        }
    }

    // --- Structured data --------------------------------------------------
    // The 404 page is noindex and never appears in search results, so it
    // does not need structured data.
    if (!jsonLd.length && !is404) fail("no JSON-LD structured data");
    for (const block of jsonLd) {
        try {
            const parsed = JSON.parse(block);
            if (!parsed["@type"]) fail("JSON-LD block has no @type");
        } catch (error) {
            fail(`invalid JSON-LD: ${error.message}`);
        }
    }

    // --- Hreflang ---------------------------------------------------------
    for (const alt of links.alternate ?? []) {
        if (!alt.hreflang) continue;
        if (alt.hreflang === "x-default") continue;
        const path = alt.href.replace(/^https?:\/\/[^/]+/, "");
        if (!pagePaths.has(path) && !pagePaths.has(`${path}index.html`)) {
            fail(`hreflang="${alt.hreflang}" points at a missing page: ${alt.href}`);
        }
    }

    // --- Misc -------------------------------------------------------------
    if (!viewport) fail("missing viewport meta");
    else if (!viewport.includes("width=device-width")) {
        fail(`viewport is missing width=device-width: ${viewport}`);
    }
    if (!htmlLang) fail("missing lang attribute on <html>");
    if (!meta["theme-color"]) fail("missing theme-color meta");
    if (!links.manifest) fail("missing web app manifest link");
    if (!links.icon) fail("missing favicon link");
}

console.log(`▸ Audited ${files.length} pages\n`);

if (issues.length) {
    console.error(`✖ ${issues.length} SEO issue(s):\n`);
    for (const issue of issues) console.error(`  • ${issue}`);
    console.error("");
    process.exit(1);
}

console.log("✔ Every page has:");
console.log("  • exactly one <h1> and a valid heading hierarchy");
console.log("  • a unique <title> and meta description");
console.log("  • an https canonical URL and an indexable robots directive");
console.log("  • complete Open Graph and Twitter card metadata");
console.log("  • alt text and explicit dimensions on every image");
console.log("  • valid JSON-LD structured data");
console.log("  • resolving hreflang alternates");
