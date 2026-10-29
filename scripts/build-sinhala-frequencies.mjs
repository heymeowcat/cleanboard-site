#!/usr/bin/env node
/**
 * build-sinhala-frequencies.mjs
 *
 * Extracts the Sinhala unigram frequencies from the CleanBoard app's own
 * n-gram language model and writes them as a static asset the website can
 * use to rank transliteration candidates.
 *
 * Why this matters: the Singlish scheme picks between readings like
 * ගොඩ and ගෝද (or මහා and මහ) using a word-frequency model, not a
 * rule. The app already ships such a model (`models/si.ngram`), so the
 * website can make the same choice without a network call and without
 * breaking the offline promise.
 *
 * Usage:
 *   node scripts/build-sinhala-frequencies.mjs [path/to/si.ngram] [count]
 *
 * Defaults:
 *   source  ~/AndroidStudioProjects/CleanBoard/models/si.ngram
 *   count   20000 unigrams
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

const source = resolve(
    process.argv[2] ??
        join(
            homedir(),
            "AndroidStudioProjects/CleanBoard/models/si.ngram",
        ),
);
const count = Number(process.argv[3] ?? 20000);

const outDir = resolve(projectRoot, "public/data");
const outFile = resolve(outDir, "si-words.txt");

if (!existsSync(source)) {
    console.error(`✖ n-gram model not found: ${source}`);
    console.error(
        "  Pass the path as an argument, or run the app's train_models.py first.",
    );
    process.exit(1);
}

console.log(`▸ Reading ${source}`);
const raw = gunzipSync(readFileSync(source)).toString("utf8");

// The file is: "# UNIGRAMS", then "word\tfrequency" lines, then
// "# BIGRAMS", then "word1\tword2\tfrequency" lines, and so on.
const unigrams = [];
let inUnigrams = false;

for (const line of raw.split("\n")) {
    if (line.startsWith("#")) {
        inUnigrams = line.trim() === "# UNIGRAMS";
        continue;
    }
    if (!inUnigrams || !line) continue;

    const tab = line.lastIndexOf("\t");
    if (tab < 0) continue;

    const word = line.slice(0, tab);
    const frequency = Number(line.slice(tab + 1));
    if (!word || !Number.isFinite(frequency)) continue;

    unigrams.push([word, frequency]);
}

// The model is already sorted by descending frequency, but sort anyway so
// the output does not depend on that.
unigrams.sort((a, b) => b[1] - a[1]);

const kept = unigrams.slice(0, count);
const text = kept.map(([word, frequency]) => `${word} ${frequency}`).join("\n");

mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, `${text}\n`, "utf8");

const bytes = Buffer.byteLength(text, "utf8");
console.log(
    `✔ ${kept.length} unigrams → ${outFile.replace(projectRoot, ".")} ` +
        `(${(bytes / 1024).toFixed(0)} KB)`,
);
console.log(
    `  most common: ${kept
        .slice(0, 8)
        .map(([w]) => w)
        .join(", ")}`,
);
