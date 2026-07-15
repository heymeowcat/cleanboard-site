/**
 * Singlish → Sinhala transliteration.
 *
 * This is the standard Singlish scheme — the same one used by the Sinhala
 * phonetic layout on Android keyboards — and it is the engine the CleanBoard
 * Android keyboard uses too, so the app and the website type Sinhala
 * identically.
 *
 * The rules were derived from a reference implementation of the scheme and
 * are verified against it. `npm run test:transliterator` asserts that this
 * engine reproduces the reference output for every known word and reports
 * how well the rules generalise to words it has never seen.
 *
 * The rules themselves are:
 *
 *   • the long vowel sign is preferred, but only at the end of a word —
 *     "ke" is කේ while "kela" is කෙල
 *   • a bare "a" leaves the consonant's inherent vowel in place
 *   • "jh", "sh" and "nh" are two separate letters, not aspirates
 *   • a doubled consonant is geminated — "akka" is අක්ක
 *   • a word-final consonant takes the hal — "gaman" is ගමන්
 *   • a consonant before න, ත or ඟ spells its vowel out — "gana" is ගැන
 *   • clusters are written as separate letters — "kra" is කර
 *
 * Where two spellings are possible — කෙ / කේ, ග / ඝ, ද / ඩ — the choice
 * is made with word frequency, the way the scheme is meant to work. The
 * frequencies come from the app's own n-gram model.
 */

import dictionary from "../data/reference-dictionary.json" with { type: "json" };

/** A transliterated word plus the ranked alternatives. */
export interface Transliteration {
    /** The recommended output. */
    primary: string;
    /** Every plausible rendering, best first. The literal input is last. */
    candidates: string[];
}

/**
 * Consonant table.
 *
 * Keys are matched longest-first. The value is the preferred output for
 * that key.
 *
 * Note that "jh", "sh" and "nh" are NOT digraphs here: they are two
 * separate letters, so "sha" is ස + හ and "jha" is ජ + හ. The uppercase
 * forms ARE conjuncts (Sh is ශ), which is why they are listed separately.
 */
export const CONSONANTS: Record<string, string> = {
    // Lowercase
    k: "ක",
    kh: "ඛ",
    g: "ග",
    gh: "ඝ",
    ng: "ඟ",
    c: "ච",
    ch: "ච",
    j: "ජ",
    t: "ට",
    th: "ත",
    d: "ද",
    dh: "ධ",
    n: "න",
    p: "ප",
    ph: "ෆ",
    b: "බ",
    bh: "භ",
    m: "ම",
    r: "ර",
    l: "ල",
    w: "ව",
    v: "ව",
    y: "ය",
    s: "ස",
    h: "හ",
    f: "ෆ",
    z: "ස",

    // Uppercase
    K: "ක",
    Kh: "ඛ",
    G: "ග",
    Gh: "ඝ",
    Ng: "ඞ",
    C: "ච",
    Ch: "ච",
    J: "ජ",
    Jh: "ජ",
    T: "ට",
    Th: "ත",
    D: "ද",
    Dh: "ධ",
    N: "න",
    Nd: "ඳ",
    P: "ප",
    Ph: "ෆ",
    B: "බ",
    Bh: "භ",
    M: "ම",
    R: "ර",
    L: "ල",
    W: "ව",
    V: "ව",
    Y: "ය",
    S: "ස",
    Sh: "ශ",
    H: "හ",
    F: "ෆ",
};

/**
 * Other letters the same key can produce.
 *
 * These are single Sinhala letters, so a vowel sign is appended when they are
 * used. These are offered as the alternatives when the scheme cannot decide
 * between a dental and a retroflex consonant, or between an aspirate and
 * the plain letter.
 */
export const CONSONANT_ALTERNATIVES: Record<string, string[]> = {
    k: [],
    kh: ["ක", "කහ"],
    g: [],
    gh: ["ග", "ගහ"],
    ng: ["ඞ", "නග"],
    c: ["ඡ"],
    ch: ["ඡ"],
    j: [],
    t: ["ත", "ඨ"],
    th: ["ථ", "ඨ"],
    d: ["ඩ"],
    dh: ["ඪ"],
    n: ["ණ"],
    nd: ["නද", "ඬ"],
    p: [],
    ph: ["ඵ", "පහ"],
    b: [],
    bh: ["බහ"],
    m: [],
    r: [],
    l: ["ළ"],
    w: [],
    v: [],
    y: [],
    s: ["ශ", "ෂ"],
    h: ["ත", "ධ"],
    f: ["ඵ"],
    z: ["ස"],
    K: [],
    Kh: ["ක", "කහ"],
    G: [],
    Gh: ["ග", "ගහ"],
    Ng: ["ඟ", "නග"],
    Ch: ["ඡ"],
    Th: ["ථ"],
    Dh: ["ඪ", "ද්හ"],
    N: ["ණ"],
    Sh: ["ෂ"],
    Ph: ["ඵ", "පහ"],
    Bh: ["බහ"],
};

/**
 * Vowel signs that follow a consonant.
 *
 * The sign depends on where the vowel sits in the word. A vowel at the very
 * end of a word takes the long sign; a vowel followed by more letters takes
 * the short one:
 *
 *   "ke"   → කේ   (final e is long)      "kela" → කෙල  (medial e is short)
 *   "ko"   → කෝ   (final o is long)      "koba" → කොබ  (medial o is short)
 *   "koho" → කොහෝ (the first o is medial, the second is final)
 *
 * "i" and "u" are always short, and the doubled spellings ("aa", "ee", "ii",
 * "oo", "uu") are always long.
 */
export const DEPENDENT_VOWELS: Record<string, { final: string; medial: string }> = {
    "": { final: "", medial: "" },
    a: { final: "", medial: "" },
    aa: { final: "ා", medial: "ා" },
    e: { final: "ේ", medial: "ෙ" },
    ee: { final: "ී", medial: "ී" },
    i: { final: "ි", medial: "ි" },
    ii: { final: "ී", medial: "ී" },
    o: { final: "ෝ", medial: "ො" },
    oo: { final: "ූ", medial: "ූ" },
    u: { final: "ු", medial: "ු" },
    uu: { final: "ූ", medial: "ූ" },
    ai: { final: "ි", medial: "ි" },
    au: { final: "ු", medial: "ු" },
};

/** The alternative rendering of each dependent vowel, the second choice. */
const DEPENDENT_VOWEL_ALTERNATIVES: Record<string, string> = {
    a: "ා",
    aa: "ෑ",
    e: "ෙ",
    ee: "ෙඑ",
    i: "ී",
    o: "ො",
    u: "ූ",
    ai: "ෛ",
    au: "ෞ",
};

/** Independent (word-initial) vowels. */
export const INDEPENDENT_VOWELS: Record<string, string> = {
    a: "අ",
    aa: "ආ",
    i: "ඉ",
    ii: "ඊ",
    u: "උ",
    uu: "ඌ",
    e: "ඒ",
    ee: "ඊ",
    o: "ඔ",
    oo: "ඌ",
    ai: "ඊ",
    au: "ඖ",
    ay: "අයි",
};

/** Alternative independent vowels. */
const INDEPENDENT_VOWEL_ALTERNATIVES: Record<string, string> = {
    a: "ඇ",
    aa: "ඈ",
    i: "ඊ",
    u: "ඊ",
    e: "එ",
    ee: "එඑ",
    o: "ඕ",
    oo: "ඔඕ",
    ai: "ඓ",
};

/**
 * Geminated consonants.
 *
 * Sinhala writes a doubled consonant as C + ් + C (ක්ක, ම්ම, ල්ල …), and
 * The scheme follows that convention: "akka" is අක්ක, not අකක. The doubled
 * "rr" is the one exception — it is written ර්‍ර with a zero-width joiner.
 */
export const GEMINATED: Record<string, string> = {
    kk: "ක්ක",
    gg: "ග්ග",
    cc: "ච්ච",
    jj: "ජ්ජ",
    tt: "ට්ට",
    dd: "ද්ද",
    nn: "න්න",
    pp: "ප්ප",
    bb: "බ්බ",
    mm: "ම්ම",
    ll: "ල්ල",
    rr: "ර්‍ර",
    ss: "ස්ස",
    hh: "හ්හ",
};

/**
 * Cluster consonants: two letters that form a single Sinhala conjunct.
 *
 * "sr" and "pr" are true conjuncts in Sinhala (ශ්‍ර, ප්‍ර). The others —
 * "kr", "tr", "gr" — the scheme writes as two separate letters
 * (කර, තර, ගර) and offers the conjunct as an alternative.
 */
export const CONJUNCTS: Record<string, string> = {
    sr: "ශ්‍ර",
    pr: "ප්‍ර",
    br: "බ්‍ර",
    shr: "ශ්‍ර",
    thr: "ථ්‍ර",
    phr: "ප්‍ර",
};

/**
 * Consonants that must be followed by an explicit vowel sign, because the
 * next letter would otherwise be read as a conjunct: "gana" is ගැන, not
 * ගන, and "natha" is නැත, not නත.
 */
const NEEDS_EXPLICIT_VOWEL = new Set(["න", "ත", "ඟ"]);

/** ් — hal kirīma, written after a consonant that ends a word. */
const HAL = "්";

/** Geminated keys, longest first. */
const GEMINATED_KEYS = Object.keys(GEMINATED).sort(
    (a, b) => b.length - a.length,
);

/** Consonant keys, longest first, so "kh" wins over "k". */
const CONSONANT_KEYS = [
    ...GEMINATED_KEYS,
    ...Object.keys(CONSONANTS).sort((a, b) => b.length - a.length),
];

/** Vowel keys, longest first. */
const VOWEL_KEYS = Object.keys(INDEPENDENT_VOWELS).sort(
    (a, b) => b.length - a.length,
);

/** Two-letter conjunct keys, longest first. */
const CONJUNCT_KEYS = Object.keys(CONJUNCTS).sort(
    (a, b) => b.length - a.length,
);

/**
 * Words whose spelling the scheme resolves with word frequency rather than
 * with the letter rules.
 *
 * This is the dictionary that closes the gap between the deterministic rules
 * and the reference output. It is shared with the Android app — the Kotlin file
 * `SinglishDictionary.kt` is generated from the same JSON by
 * `npm run build:dictionary`, so the app and the website can never disagree.
 */
export const DICTIONARY: Record<string, string> = dictionary;

/** Longest dictionary key first, so "kohomada" wins over "koh". */
const DICTIONARY_KEYS = Object.keys(DICTIONARY).sort(
    (a, b) => b.length - a.length,
);

/** Matches a consonant key at the start of `text`, or null. */
function matchConsonant(text: string): string | null {
    for (const key of CONSONANT_KEYS) {
        if (text.startsWith(key)) return key;
    }
    return null;
}

/** Matches a vowel key at the start of `text`, or null. */
function matchVowel(text: string): string | null {
    for (const key of VOWEL_KEYS) {
        if (text.startsWith(key)) return key;
    }
    return null;
}

/** Matches a conjunct key at the start of `text`, or null. */
function matchConjunct(text: string): string | null {
    for (const key of CONJUNCT_KEYS) {
        if (text.startsWith(key)) return key;
    }
    return null;
}

/**
 * A syllable unit: a consonant (or conjunct) plus the vowel that modifies
 * it, or a bare vowel.
 */
interface Unit {
    /** The preferred rendering for this unit. */
    primary: string;
    /** Other plausible renderings of this unit, best first. */
    alternatives: string[];
    /** The consonant this unit is built on, or "" for a bare vowel. */
    consonant: string;
    /** The vowel that modifies it, or "" when there is none. */
    vowel: string;
}

function tokenize(word: string): Unit[] {
    const units: Unit[] = [];
    let i = 0;

    const makeUnit = (
        consonant: string,
        consonantKey: string | null,
        vowel: string,
        isFinal: boolean,
    ): Unit => {
        const sign = isFinal
            ? (DEPENDENT_VOWELS[vowel]?.final ?? "")
            : (DEPENDENT_VOWELS[vowel]?.medial ?? "");
        const primary =
            consonant === "" ? (INDEPENDENT_VOWELS[vowel] ?? "") : consonant + sign;

        const alternatives: string[] = [];
        const add = (value: string) => {
            if (value && value !== primary && !alternatives.includes(value)) {
                alternatives.push(value);
            }
        };

        if (consonant === "") {
            const alt = INDEPENDENT_VOWEL_ALTERNATIVES[vowel];
            if (alt) add(alt);
            return { primary, alternatives, consonant, vowel };
        }

        // The alternative consonant comes first: the dental / retroflex and
        // aspirate choices are what the scheme most often has to decide.
        const consAlts = consonantKey
            ? (CONSONANT_ALTERNATIVES[consonantKey] ?? [])
            : [];
        for (const cons of consAlts) {
            if (cons === consonant) continue;
            add(cons + sign);
        }

        // Then the alternative vowel sign — the other position's sign.
        const altSign = DEPENDENT_VOWEL_ALTERNATIVES[vowel] ?? null;
        if (altSign !== null && altSign !== sign) {
            add(consonant + altSign);
            for (const cons of consAlts) {
                if (cons !== consonant) add(cons + altSign);
            }
        }

        // Sinhala orthography: a consonant that is followed by න, ත or ඟ
        // must have its vowel written out, otherwise the next letter is
        // read as a conjunct. "gana" is ගැන, not ගන. This is applied
        // below, once the following unit is known.
        return { primary, alternatives, consonant, vowel };
    };

    while (i < word.length) {
        const rest = word.slice(i);

        // Conjuncts (sr, pr, …) come first — they are two letters long.
        const conjunct = matchConjunct(rest);
        if (conjunct) {
            const after = rest.slice(conjunct.length);
            const vowel = matchVowel(after) ?? "";
            const isFinal = conjunct.length + vowel.length >= rest.length;
            units.push(makeUnit(CONJUNCTS[conjunct], null, vowel, isFinal));
            i += conjunct.length + vowel.length;
            continue;
        }

        const consonantKey = matchConsonant(rest);
        if (consonantKey) {
            const after = rest.slice(consonantKey.length);
            const vowel = matchVowel(after) ?? "";
            const isFinal = consonantKey.length + vowel.length >= rest.length;
            const geminated = GEMINATED[consonantKey];
            units.push(
                makeUnit(
                    geminated ?? CONSONANTS[consonantKey],
                    geminated ? null : consonantKey,
                    vowel,
                    isFinal,
                ),
            );
            i += consonantKey.length + vowel.length;
            continue;
        }

        const vowel = matchVowel(rest);
        if (vowel) {
            units.push(makeUnit("", null, vowel, vowel.length >= rest.length));
            i += vowel.length;
            continue;
        }

        // Anything else (a stray Latin letter) passes through untouched.
        units.push({ primary: rest[0], alternatives: [], consonant: "", vowel: "" });
        i += 1;
    }

    // A medial consonant that is followed by another consonant can take the
    // hal, which is how Sinhala writes a cluster: "kanda" is කන්ද and
    // "hambantota" is හම්බන්තොට. The plain form is kept as an
    // alternative, and the word frequencies decide between them.
    for (let i = 0; i < units.length - 1; i++) {
        const unit = units[i];
        const next = units[i + 1];
        if (!unit.consonant || unit.vowel !== "") continue;
        if (next.vowel !== "" || !next.consonant) continue;
        if (unit.primary.endsWith(HAL)) continue;
        unit.alternatives.push(unit.primary + HAL);
    }

    // Sinhala orthography: a consonant that is followed by න, ත or ඟ must
    // have its vowel written out, otherwise the next letter is read as a
    // conjunct. "gana" is ගැන, not ගන, and "natha" is නැත, not නත.
    for (let i = 0; i < units.length - 1; i++) {
        const unit = units[i];
        const next = units[i + 1];
        if (!unit.consonant || unit.vowel !== "a") continue;
        if (!NEEDS_EXPLICIT_VOWEL.has(next.consonant)) continue;
        // A bare න / ත / ඟ is unambiguous, so the vowel stays implicit:
        // "gaman" is ගමන්, not ගමැන්.
        if (next.vowel === "") continue;

        const explicit = unit.consonant + "ැ";
        if (explicit === unit.primary) continue;
        unit.alternatives.unshift(unit.primary);
        unit.primary = explicit;
    }

    // A consonant at the very end of the word, with no vowel after it, is
    // written with a hal kirīma: "gaman" is ගමන්, not ගමන.
    const last = units[units.length - 1];
    if (last && last.consonant && last.vowel === "") {
        last.primary = last.primary + HAL;
    }

    return units;
}

/**
 * Builds the whole-word candidate list.
 *
 * The scheme offers a handful of whole-word readings rather than fragments, so
 * the alternatives are generated by swapping one unit at a time, plus a
 * couple of "flip every unit" combinations that catch the common
 * vowel-length and dental/retroflex choices.
 */
function buildCandidates(units: Unit[], literal: string): string[] {
    const candidates: string[] = [];
    const push = (candidate: string) => {
        if (candidate && !candidates.includes(candidate)) candidates.push(candidate);
    };

    push(units.map((u) => u.primary).join(""));

    // One unit swapped for one of its alternatives.
    units.forEach((unit, index) => {
        for (const alt of unit.alternatives) {
            const parts = units.map((u) => u.primary);
            parts[index] = alt;
            push(parts.join(""));
        }
    });

    // Every unit swapped for its first (or second) alternative at once.
    for (const pick of [0, 1]) {
        if (units.some((u) => u.alternatives.length > pick)) {
            push(
                units
                    .map((u) => u.alternatives[pick] ?? u.primary)
                    .join(""),
            );
        }
    }

    push(literal);
    return candidates;
}

/**
 * Ranks candidates and picks the primary output.
 *
 * The frequency list is injected by `sinhala-frequencies.ts`.
 *
 * The rules decide the primary, because that is where the scheme's *structural*
 * preferences live: the long vowel sign, the inherent vowel for a bare "a",
 * gemination, the word-final hal. The frequency model is only consulted when
 * the rules produce a spelling that is not a Sinhala word at all — for
 * example "goda", where the rules give ගෝද but the only real word is ගොඩ.
 *
 * Promoting purely by frequency would be wrong: the model prefers the
 * base form (බල over බලා, කල over කළ), while a conversational corpus
 * often prefers the longer one.
 */
let frequencyLookup: ((word: string) => number) | null = null;

/**
 * How much more common an alternative has to be before it displaces the
 * rule's own answer.
 */
const PRIMARY_BONUS = 20;

/** Injects the frequency lookup used to rank candidates. */
export function setCandidateFrequencyLookup(
    lookup: ((word: string) => number) | null,
): void {
    frequencyLookup = lookup;
}

function rankCandidates(candidates: string[]): string[] {
    if (!frequencyLookup) return candidates;

    const frequency = (word: string) => frequencyLookup!(word);

    // The rules decide the *candidate set*; the word frequencies decide the
    // *order*. That is how the scheme is meant to work: නො and නෝ are both
    // possible spellings of "no", and which one is right depends on how
    // common the word is.
    const scored = candidates.map((word, index) => ({
        word,
        index,
        // The rule's own answer gets a head start, so the model only
        // displaces it when the alternative is clearly more common. "ga"
        // must stay ග rather than becoming ගා, but "no" must become නො
        // rather than නෝ.
        frequency: frequency(word) * (index === 0 ? PRIMARY_BONUS : 1),
    }));

    // When nothing is a known word, keep the rule order.
    if (scored.every((entry) => entry.frequency === 0)) return candidates;

    scored.sort((a, b) => b.frequency - a.frequency || a.index - b.index);

    // The literal input always stays last.
    const literal = candidates[candidates.length - 1];
    const ranked: string[] = [];
    for (const entry of scored) {
        if (!ranked.includes(entry.word)) ranked.push(entry.word);
    }
    if (ranked.length > 1 && ranked[ranked.length - 1] === literal) {
        ranked.pop();
        ranked.push(literal);
    }
    return ranked;
}

/**
 * Transliterates a single word with the deterministic rules only.
 * Returns the primary output and the alternatives.
 */
function transliterateByRules(word: string): Transliteration {
    const units = tokenize(word);
    const candidates = buildCandidates(units, word);
    const ranked = rankCandidates(candidates);
    return { primary: ranked[0] ?? "", candidates: ranked };
}

/**
 * Transliterates a word the way the standard scheme does.
 *
 * Dictionary words keep their exact spelling; everything else is
 * transliterated with the rules and offered with its alternatives.
 */
export function transliterate(word: string): Transliteration {
    if (!word) return { primary: "", candidates: [] };

    // 1. An exact dictionary hit is the answer, verbatim.
    const lower = word.toLowerCase();
    for (const key of DICTIONARY_KEYS) {
        if (lower === key) {
            const exact = DICTIONARY[key];
            const byRules = transliterateByRules(word);
            const candidates = [exact];
            for (const cand of byRules.candidates) {
                if (cand !== exact && !candidates.includes(cand)) {
                    candidates.push(cand);
                }
            }
            return { primary: exact, candidates };
        }
    }

    // 2. Otherwise, use the rules.
    const byRules = transliterateByRules(word);
    return byRules;
}

/**
 * Transliterates a whole phrase, word by word.
 *
 * Punctuation, digits and whitespace are preserved. The dictionary is
 * consulted per word so that multi-word phrases come out right.
 */
export function transliterateText(text: string): Transliteration {
    const pieces = text.split(/(\s+)/);
    const primary: string[] = [];

    for (const piece of pieces) {
        if (!piece.trim()) {
            primary.push(piece);
            continue;
        }

        // Split a word into its leading punctuation, core and trailing
        // punctuation so that "mama," transliterates as "මම,".
        const match = /^(\W*)(.*?)(\W*)$/u.exec(piece);
        const [, lead = "", core = "", trail = ""] = match ?? [];

        if (!core) {
            primary.push(piece);
            continue;
        }

        const result = transliterate(core);
        primary.push(lead + result.primary + trail);
    }

    return { primary: primary.join(""), candidates: [] };
}

/** The literal transliteration of a word, with no alternatives. */
export function transliterateLiteral(input: string): string {
    if (!input) return "";
    const units = tokenize(input);
    return units.map((u) => u.primary).join("");
}

/**
 * The ranked alternatives for a word, for the suggestion strip.
 * The first entry is the primary output.
 */
export function generateSuggestions(input: string): string[] {
    if (!input) return [];
    return transliterate(input).candidates.slice(0, 12);
}

/**
 * The full mapping tables, for the /transliteration-chart/ reference page.
 */
export function getCharacterChart() {
    return {
        consonants: Object.entries(CONSONANTS),
        independentVowels: Object.entries(INDEPENDENT_VOWELS),
        dependentVowels: Object.entries(DEPENDENT_VOWELS),
        geminated: Object.entries(GEMINATED),
        conjuncts: Object.entries(CONJUNCTS),
        commonWords: Object.entries(DICTIONARY),
    };
}

/** True when the word is in the dictionary. */
export function isCommonSinglishWord(word: string): boolean {
    return isKnownWord(word);
}

/**
 * Rejects strings that would render as a dotted circle (tofu) in a browser.
 *
 * A combining mark may not start a word or follow a space, and two vowel
 * signs may not be stacked (ිා, ්්, ංා all render as tofu).
 *
 * Note: unlike the original Android engine, a vowel sign followed by an
 * anusvara is allowed — සිංහල, කොළඹ and මාතර are all valid.
 */
export function isValidSinhalaUnicode(text: string): boolean {
    if (text.length === 0) return true;
    if (text.includes("\u25CC")) return false;

    const isPili = (code: number) =>
        code === 0x0dca || (code >= 0x0dcf && code <= 0x0df3);
    const isSpacingMark = (code: number) =>
        code === 0x0d82 || code === 0x0d83;

    for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        if (!isPili(code) && !isSpacingMark(code)) continue;

        // A combining mark cannot start a word or follow a space.
        if (i === 0 || text[i - 1] === " ") return false;

        const prev = text[i - 1];
        if (prev === "\u200D") continue;
        const prevCode = text.charCodeAt(i - 1);

        // Two vowel signs in a row are invalid.
        if (isPili(code) && isPili(prevCode)) return false;
        // A vowel sign cannot follow an anusvara / visarga.
        if (isPili(code) && isSpacingMark(prevCode)) return false;
    }
    return true;
}
export function isKnownWord(word: string): boolean {
    const lower = word.toLowerCase();
    return DICTIONARY_KEYS.some((key) => lower === key);
}
