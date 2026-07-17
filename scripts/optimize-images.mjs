#!/usr/bin/env node
/**
 * optimize-images.mjs
 *
 * Produces every raster asset the site needs, already compressed:
 *
 *  - cleanboard-logo.png / .webp  — the app icon, re-encoded and downscaled
 *  - play-badge.png / .webp        — the official Google Play badge, self-hosted
 *                                    so the page makes no third-party request
 *  - og-image.png / .webp          — the 1200×630 social share card
 *  - apple-touch-icon.png          — 180×180 home-screen icon
 *
 * Run with `npm run optimize:images`.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const publicDir = resolve(projectRoot, "public");

const PLAY_BADGE_URL =
  "https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png";

if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true });

const report = [];

/**
 * Writes a PNG + WebP pair and reports the sizes.
 *
 * The Play badge is downloaded from Google with a transparent background, but
 * the RGB channels of the fully transparent pixels are not zero. Left alone
 * they bleed a coloured halo onto light backgrounds, so they are neutralised
 * before the file is written.
 */
async function writePair(name, buffer, { width, quality = 82 } = {}) {
    const pipeline = () => {
        const p = sharp(buffer);
        if (width) p.resize({ width, withoutEnlargement: true });
        return p;
    };

    const png = await pipeline()
        .png({ compressionLevel: 9, palette: true, quality: 90 })
        .toBuffer();
    const webp = await pipeline()
        .webp({ quality, effort: 6 })
        .toBuffer();

    writeFileSync(resolve(publicDir, `${name}.png`), await neutralise(png));
    writeFileSync(resolve(publicDir, `${name}.webp`), await neutralise(webp));

    report.push(
        `  ${name}.png  ${(png.length / 1024).toFixed(1)} KB` +
            `   ${name}.webp ${(webp.length / 1024).toFixed(1)} KB`,
    );
}

/** Sets the RGB of fully transparent pixels to black, killing colour fringing. */
async function neutralise(buffer) {
    const { data, info } = await sharp(buffer)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    for (let i = 0; i < data.length; i += info.channels) {
        if (data[i + 3] === 0) {
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
        }
    }

    return sharp(data, {
        raw: { width: info.width, height: info.height, channels: info.channels },
    })
        .png({ compressionLevel: 9, palette: true, quality: 90 })
        .toBuffer();
}

// --- App icon --------------------------------------------------------------
const logoSource = resolve(publicDir, "cleanboard-logo.png");
if (!existsSync(logoSource)) {
    console.error(`✖ Missing source icon: ${logoSource}`);
    process.exit(1);
}
const logoBuffer = readFileSync(logoSource);
console.log("▸ App icon");
await writePair("cleanboard-logo", logoBuffer, { width: 512 });
await writePair("apple-touch-icon", logoBuffer, { width: 180 });

// --- Favicons --------------------------------------------------------------
// The app logo is a green square with a black mark on top and the wordmark
// underneath. For the favicon we crop out just the mark and centre it on a
// square green field, so the icon reads clearly even at 16×16.
console.log("▸ Favicons");
const MARK_CROP = { left: 88, top: 98, width: 336, height: 214 };
const CANVAS = 336;
const GREEN = { r: 137, g: 249, b: 79, alpha: 1 };

// sharp applies `extend` *after* `resize`, so the square field is built with
// an explicit composite instead.
const field = await sharp({
    create: {
        width: CANVAS,
        height: CANVAS,
        channels: 4,
        background: GREEN,
    },
})
    .png()
    .toBuffer();

const mark = await sharp(logoBuffer).extract(MARK_CROP).png().toBuffer();

const markCanvas = await sharp(field)
    .composite([{ input: mark, top: 61, left: 0 }])
    .png()
    .toBuffer();

for (const size of [16, 32, 48, 180, 192, 512]) {
    const buffer = await sharp(markCanvas)
        .resize(size, size, { fit: "cover" })
        .png({ compressionLevel: 9, palette: true })
        .toBuffer();
    writeFileSync(resolve(publicDir, `favicon-${size}.png`), buffer);
    report.push(`  favicon-${size}.png  ${(buffer.length / 1024).toFixed(1)} KB`);
}

// --- Google Play badge -----------------------------------------------------
console.log("▸ Google Play badge");
const badgeRes = await fetch(PLAY_BADGE_URL, {
    headers: {
        "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
            "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
});
if (!badgeRes.ok) {
    console.error(`✖ Could not download the Play badge: ${badgeRes.status}`);
} else {
    const badgeBuffer = Buffer.from(await badgeRes.arrayBuffer());
    await writePair("play-badge", badgeBuffer, { width: 320 });
}

// --- Open Graph image ------------------------------------------------------
console.log("▸ Open Graph image");
const ogTemplate = readFileSync(resolve(publicDir, "og-image.svg"), "utf8");
// The app icon and the official Google Play badge are embedded so the share
// card shows the real brand assets.
const logoDataUri = `data:image/png;base64,${logoBuffer.toString("base64")}`;
const badgeBuffer = readFileSync(resolve(publicDir, "play-badge.png"));
const badgeDataUri = `data:image/png;base64,${badgeBuffer.toString("base64")}`;
const ogSvg = ogTemplate
    .replace("{{LOGO}}", logoDataUri)
    .replace("{{BADGE}}", badgeDataUri);
const ogBuffer = await sharp(Buffer.from(ogSvg)).png().toBuffer();
await writePair("og-image", ogBuffer, { width: 1200 });

console.log("\n✔ Compressed assets:");
for (const line of report) console.log(line);
console.log(`→ ${publicDir.replace(projectRoot, ".")}`);
