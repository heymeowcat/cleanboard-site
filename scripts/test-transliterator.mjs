#!/usr/bin/env node
/**
 * test-transliterator.mjs
 *
 * Checks the transliterator against the project's regression corpus for
 * Singlish → Sinhala output.
 *
 * The expected output in `src/data/reference-corpus.json` comes from the
 * project's regression corpus for the standard Singlish scheme.
 *
 *   • `src/data/reference-corpus.json`   — words the engine knows. These must
 *     match the expected answer exactly; that is the contract the
 *     dictionary exists to keep.
 *
 *   • `src/data/reference-heldout.json`  — words the engine does NOT know.
 *     These measure how well the deterministic rules generalise, and are
 *     held out of the dictionary precisely so the number stays honest.
 *
 * Usage:
 *   node scripts/test-transliterator.mjs           # summary
 *   node scripts/test-transliterator.mjs --verbose # every mismatch
 */

import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const verbose = process.argv.includes("--verbose");

/** The held-out accuracy the rules must keep meeting. */
const HELD_OUT_THRESHOLD = 0.7;

const { outputFiles } = await build({
    entryPoints: [resolve(projectRoot, "src/lib/transliterator.ts")],
    bundle: true,
    format: "esm",
    platform: "node",
    target: "node18",
    write: false,
    logLevel: "silent",
});

const bundle = outputFiles[0].text;
const engine = await import(
    `data:text/javascript;base64,${Buffer.from(bundle).toString("base64")}`
);

const read = (name) =>
    JSON.parse(readFileSync(resolve(projectRoot, "src/data", name), "utf8"));

const corpus = read("reference-corpus.json");
const heldOut = read("reference-heldout.json");
const formal = read("singlish-formal.json");
const curated = read("singlish-curated.json");

// Load the Sinhala frequency list, the same one the site uses at runtime.
const freqFile = resolve(projectRoot, "public/data/si-words.txt");
let frequencyCount = 0;
if (existsSync(freqFile)) {
    const map = new Map();
    for (const line of readFileSync(freqFile, "utf8").split("\n")) {
        if (!line) continue;
        const space = line.lastIndexOf(" ");
        if (space < 0) continue;
        map.set(line.slice(0, space), Number(line.slice(space + 1)));
    }
    frequencyCount = map.size;
    engine.setCandidateFrequencyLookup((word) => map.get(word) ?? 0);
    engine.setAbbreviationLexicon(map.keys());
}

const known = new Set(
    Object.keys(engine.DICTIONARY).map((k) => k.toLowerCase()),
);

const failures = [];
const heldOutMisses = [];
const probeMisses = [];

let dictionaryTotal = 0;
let dictionaryPass = 0;
let curatedTotal = 0;
let curatedPass = 0;
let probeTotal = 0;
let probePass = 0;

for (const [word, candidates] of Object.entries(corpus.entries)) {
    const referencePrimary = candidates[0];
    const expected =
        curated[word.toLowerCase()] ??
        formal[word.toLowerCase()] ??
        referencePrimary;
    const ours = engine.transliterate(word);

    if (known.has(word.toLowerCase())) {
        // A word the dictionary knows must match its canonical spelling.
        // The curated and formal layers override the captured reference
        // answer.
        dictionaryTotal++;
        if (ours.primary === expected) dictionaryPass++;
        else {
            failures.push({ word, referencePrimary: expected, ours: ours.primary });
        }
    } else {
        // The rest are rule probes — isolated fragments such as "kha" or
        // "kra" that are not words. They exercise the rules, and resolving
        // them needs the frequency model, so they are a metric rather than
        // a contract.
        probeTotal++;
        if (ours.primary === referencePrimary) probePass++;
        else {
            probeMisses.push({ word, referencePrimary, ours: ours.primary });
        }
    }
}

// Every curated word must resolve to its canonical spelling, including the
// words that are not in the captured corpus at all.
for (const [word, expected] of Object.entries(curated)) {
    curatedTotal++;
    const ours = engine.transliterate(word);
    if (ours.primary === expected) curatedPass++;
    else {
        failures.push({ word, referencePrimary: expected, ours: ours.primary });
    }
}

// Every formal word must resolve to its canonical spelling too. These are the
// Sanskrit-derived spellings the letter rules cannot derive reliably.
let formalTotal = 0;
let formalPass = 0;
for (const [word, expected] of Object.entries(formal)) {
    if (Object.prototype.hasOwnProperty.call(curated, word)) continue;
    formalTotal++;
    const ours = engine.transliterate(word);
    if (ours.primary === expected) formalPass++;
    else {
        failures.push({ word, referencePrimary: expected, ours: ours.primary });
    }
}

let heldOutTotal = 0;
let heldOutPass = 0;
let heldOutCurated = 0;

for (const [word, referencePrimary] of Object.entries(heldOut.entries)) {
    // The curated and formal dictionaries deliberately override the
    // reference for some words. They are no longer held out, so counting
    // them would make the rule score look better than it is.
    if (
        Object.prototype.hasOwnProperty.call(curated, word) ||
        Object.prototype.hasOwnProperty.call(formal, word)
    ) {
        heldOutCurated++;
        continue;
    }

    heldOutTotal++;
    const ours = engine.transliterate(word);
    if (ours.primary === referencePrimary) heldOutPass++;
    else {
        heldOutMisses.push({
            word,
            referencePrimary,
            ours: ours.primary,
            inDictionary: known.has(word.toLowerCase()),
        });
    }
}

// --- Parity checks with the Android engine ---------------------------------
// These are the examples the app's own unit tests assert. Keeping them here
// means the website cannot drift from the keyboard.
const parityFailures = [];
let parityTotal = 0;

const expectPrimary = (word, expected) => {
    parityTotal++;
    const ours = engine.transliterate(word).primary;
    if (ours !== expected) {
        parityFailures.push({ word, expected, ours, kind: "primary" });
    }
};

const expectLiteral = (word, expected) => {
    parityTotal++;
    const ours = engine.transliterateLiteral(word);
    if (ours !== expected) {
        parityFailures.push({ word, expected, ours, kind: "literal" });
    }
};

const expectCandidate = (word, expected) => {
    parityTotal++;
    if (!engine.transliterate(word).candidates.includes(expected)) {
        parityFailures.push({
            word,
            expected,
            ours: "(missing)",
            kind: "candidate",
        });
    }
};

// "ae" is the short æ and "aae" the long one.
expectLiteral("ae", "ඇ");
expectLiteral("aae", "ඈ");
expectLiteral("kae", "කැ");
expectLiteral("kaae", "කෑ");
// "ay" before another vowel is a + y, not the අයි diphthong.
expectLiteral("aya", "අය");
expectLiteral("ayata", "අයට");
expectLiteral("ayubowan", "අයුබොවන්");
expectPrimary("kaemathi", "කැමති");
expectPrimary("kaaema", "කෑම");
expectPrimary("aeya", "ඇය");

// The spellings the letter rules cannot reach on their own.
expectCandidate("kolamba", "කොළඹ");
expectCandidate("amba", "අඹ");
expectCandidate("hondai", "හොඳයි");
expectCandidate("sangeeta", "සංගීත");
expectCandidate("sinhala", "සිංහල");
expectCandidate("kramaya", "ක්‍රමය");
expectCandidate("buddha", "බුද්ධ");
expectCandidate("buddhagama", "බුද්ධගම");
expectCandidate("kruthiya", "කෘතිය");

// Abbreviated Singlish is resolved through the reverse index: the same
// top-20,000 words the app uses, keyed by how they are typed.
expectPrimary("mta", "මට");
expectPrimary("mma", "මම");
expectPrimary("krnna", "කරන්න");
expectPrimary("prshnyk", "ප්‍රශ්නයක්");
expectPrimary("hondyi", "හොඳයි");
expectPrimary("nehe", "නැහැ");

// Full phonetic input keeps the letter rules primary, so a common
// homophone cannot displace the literal spelling.
expectPrimary("mata", "මට");
expectPrimary("karanna", "කරන්න");
expectPrimary("kala", "කල");
expectPrimary("bala", "බල");

// Nothing in the strip may render as a dotted circle.
for (const word of [
    "kolamba",
    "hondai",
    "buddha",
    "kramaya",
    "sangeeta",
    "kaemathi",
]) {
    parityTotal++;
    const invalid = engine
        .transliterate(word)
        .candidates.filter(
            (candidate) => !engine.isValidSinhalaUnicode(candidate),
        );
    if (invalid.length) {
        parityFailures.push({
            word,
            expected: "all candidates valid",
            ours: invalid.join(", "),
            kind: "unicode",
        });
    }
}

const pct = (n, d) => (d === 0 ? "n/a" : `${((n / d) * 100).toFixed(1)}%`);

console.log(
    `▸ Regression corpus (${corpus._updated ?? "current"})`,
);
console.log(`▸ Sinhala frequency list: ${frequencyCount} unigrams\n`);
console.log(
    `  Known words   ${dictionaryPass}/${dictionaryTotal}  (${pct(dictionaryPass, dictionaryTotal)})`,
);
console.log(
    `  Curated words ${curatedPass}/${curatedTotal}  (${pct(curatedPass, curatedTotal)})`,
);
console.log(
    `  Formal words  ${formalPass}/${formalTotal}  (${pct(formalPass, formalTotal)})`,
);
console.log(
    `  Rule probes   ${probePass}/${probeTotal}  (${pct(probePass, probeTotal)})  ← isolated fragments, no dictionary`,
);
console.log(
    `  Held-out      ${heldOutPass}/${heldOutTotal}  (${pct(heldOutPass, heldOutTotal)})  ← rules only, no dictionary` +
        (heldOutCurated ? `, ${heldOutCurated} curated word(s) excluded` : "") +
        "\n",
);
console.log(
    `  App parity    ${parityTotal - parityFailures.length}/${parityTotal}  (${pct(parityTotal - parityFailures.length, parityTotal)})  ← examples the Android tests assert\n`,
);

if (heldOutMisses.length) {
    console.log(`  Held-out differences (expected vs. rules):\n`);
    for (const m of heldOutMisses) {
        console.log(`    ${m.word.padEnd(12)} expected: ${m.referencePrimary.padEnd(14)} ours: ${m.ours}`);
    }
    console.log("");
}

if (parityFailures.length) {
    console.error(`✖ ${parityFailures.length} app parity check(s) failed:\n`);
    for (const m of parityFailures) {
        console.error(`  ${m.word} (${m.kind})`);
        console.error(`    expected: ${m.expected}`);
        console.error(`    ours:     ${m.ours}`);
    }
    console.error("");
    process.exit(1);
}

if (verbose) {
    console.log("  Full candidate lists:\n");
    for (const m of [...failures, ...heldOutMisses]) {
        const r = engine.transliterate(m.word);
        console.log(`    ${m.word}: ${r.candidates.join(" | ")}`);
    }
    console.log("");
}

if (failures.length) {
    console.error(`✖ ${failures.length} known word(s) do not match their canonical spelling:\n`);
    for (const m of failures) {
        console.error(`  ${m.word}`);
        console.error(`    expected: ${m.referencePrimary}`);
        console.error(`    ours:     ${m.ours}`);
    }
    console.error("");
    process.exit(1);
}

const heldOutRate = heldOutTotal ? heldOutPass / heldOutTotal : 1;
if (heldOutRate < HELD_OUT_THRESHOLD) {
    console.error(
        `✖ Held-out accuracy ${(heldOutRate * 100).toFixed(1)}% is below the ${(HELD_OUT_THRESHOLD * 100).toFixed(0)}% floor.`,
    );
    process.exit(1);
}

console.log("✔ Every known, formal and curated word matches its canonical spelling.");
