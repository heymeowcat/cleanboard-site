#!/usr/bin/env node
/**
 * check-links.mjs
 *
 * Crawls the built site in `dist/` and verifies that every link and asset
 * actually resolves.
 *
 *   • internal links  → the target file must exist in `dist/`
 *   • fragment links  → the target `id` must exist on the page
 *   • external links  → optionally checked over the network with `--remote`
 *
 * Usage:
 *   node scripts/check-links.mjs            # internal + fragment links
 *   node scripts/check-links.mjs --remote   # also check external URLs
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "parse5";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const distDir = resolve(projectRoot, "dist");
const basePath = "/cleanboard-site";
const remote = process.argv.includes("--remote");

if (!existsSync(distDir)) {
    console.error("✖ dist/ not found — run `npm run build` first.");
    process.exit(1);
}

/** Collects every .html file in dist/. */
function htmlFiles(dir) {
    const out = [];
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        const stats = statSync(full);
        if (stats.isDirectory()) {
            out.push(...htmlFiles(full));
        } else if (entry.endsWith(".html")) {
            out.push(full);
        }
    }
    return out;
}

/** Walks the parse5 tree, collecting elements we care about. */
function walk(node, visit) {
    if (node.tagName) visit(node);
    for (const child of node.childNodes ?? []) walk(child, visit);
}

const attr = (node, name) =>
    node.attrs?.find((a) => a.name === name)?.value ?? null;

const files = htmlFiles(distDir);
console.log(`▸ Scanning ${files.length} pages in dist/\n`);

/** Page URL path (e.g. "/cleanboard-site/transliterate/") for a file. */
const pagePath = (file) =>
    `${basePath}/${relative(distDir, file).replace(/\\/g, "/").replace(/index\.html$/, "")}`.replace(
        /\/{2,}/g,
        "/",
    );

/** Maps every id in the site so fragment links can be validated. */
const idMap = new Map();
for (const file of files) {
    const doc = parse(readFileSync(file, "utf8"));
    const ids = new Set();
    walk(doc, (node) => {
        const id = attr(node, "id");
        if (id) ids.add(id);
    });
    idMap.set(pagePath(file), ids);
}

/** Resolves a site-relative href to a file in dist/. */
function resolveTarget(href) {
    const clean = href.split("#")[0].split("?")[0];
    if (!clean) return { kind: "fragment", target: href };
    const withoutBase = clean.startsWith(basePath)
        ? clean.slice(basePath.length)
        : clean;
    const asIndex = withoutBase.endsWith("/")
        ? join(distDir, withoutBase, "index.html")
        : join(distDir, withoutBase);
    if (existsSync(asIndex)) return { kind: "file", target: asIndex };
    const asHtml = `${asIndex}.html`;
    if (existsSync(asHtml)) return { kind: "file", target: asHtml };
    return { kind: "missing", target: href };
}

const problems = [];
const externalUrls = new Set();
let internalCount = 0;
let fragmentCount = 0;

for (const file of files) {
    const html = readFileSync(file, "utf8");
    const doc = parse(html);
    const from = pagePath(file);

    walk(doc, (node) => {
        const href = attr(node, "href");
        const src = attr(node, "src");
        const srcset = attr(node, "srcset");

        const urls = [];
        if (href) urls.push(href);
        if (src) urls.push(src);
        if (srcset) {
            for (const part of srcset.split(",")) {
                const url = part.trim().split(/\s+/)[0];
                if (url) urls.push(url);
            }
        }

        for (const url of urls) {
            if (!url || url.startsWith("data:") || url.startsWith("mailto:")) {
                continue;
            }

            if (/^https?:\/\//i.test(url)) {
                externalUrls.add(url);
                continue;
            }

            if (url.startsWith("#")) {
                fragmentCount++;
                const id = url.slice(1);
                const ids = idMap.get(from);
                if (ids && !ids.has(id)) {
                    problems.push({
                        type: "missing-fragment",
                        from,
                        url,
                        detail: `no element with id="${id}" on this page`,
                    });
                }
                continue;
            }

            if (url.startsWith("//")) {
                externalUrls.add(`https:${url}`);
                continue;
            }

            internalCount++;

            const resolved = resolveTarget(url);

            if (resolved.kind === "missing") {
                problems.push({
                    type: "broken-link",
                    from,
                    url,
                    detail: "target does not exist in dist/",
                });
                continue;
            }

            if (resolved.kind === "fragment") {
                fragmentCount++;
                const id = url.split("#")[1];
                const ids = idMap.get(pagePath(resolved.target));
                if (ids && !ids.has(id)) {
                    problems.push({
                        type: "missing-fragment",
                        from,
                        url,
                        detail: `no element with id="${id}" on the target page`,
                    });
                }
            }
        }
    });
}

console.log(`✔ ${internalCount} internal links checked`);
console.log(`✔ ${fragmentCount} fragment links checked`);
console.log(`✔ ${externalUrls.size} unique external URLs found\n`);

// --- Optional remote check -------------------------------------------------
if (remote && externalUrls.size) {
    console.log("▸ Checking external URLs over the network…\n");
    for (const url of externalUrls) {
        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 10000);
            const res = await fetch(url, {
                method: "HEAD",
                redirect: "follow",
                signal: controller.signal,
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
                        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
                },
            });
            clearTimeout(timer);
            if (!res.ok) {
                problems.push({
                    type: "broken-external",
                    from: "(external)",
                    url,
                    detail: `HTTP ${res.status}`,
                });
            } else {
                console.log(`  ✔ ${res.status} ${url}`);
            }
        } catch (error) {
            problems.push({
                type: "broken-external",
                from: "(external)",
                url,
                detail: error.name === "AbortError" ? "timed out" : error.message,
            });
        }
    }
    console.log("");
}

// --- Report ----------------------------------------------------------------
if (problems.length) {
    console.error(`✖ ${problems.length} problem(s) found:\n`);
    for (const p of problems) {
        console.error(`  [${p.type}] ${p.from}`);
        console.error(`    → ${p.url}`);
        console.error(`      ${p.detail}`);
        console.error("");
    }
    process.exit(1);
}

console.log("✔ No broken links found.");
