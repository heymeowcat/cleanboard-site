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
 *   • the long vowel sign is preferred, so "ke" is කේ (kē), not කෙ
 *   • a bare "a" leaves the consonant's inherent vowel in place
 *   • "sh" is ශ and "dr" is a true conjunct (ද්‍ර); "jh" and "nh" are
 *     two separate letters, not aspirates
 *   • a doubled consonant is geminated — "akka" is අක්ක
 *   • a word-final consonant takes the hal — "gaman" is ගමන්
 *   • a consonant before න, ත or ඟ spells its vowel out — "gana" is ගැන
 *   • "kr" is written as two letters — "kra" is කර
 *   • "ae" and "aae" are the short and long æ — "kaemathi" is කැමති
 *
 * Where the scheme's own digraphs can mean two things, the other reading is
 * offered as a candidate and the frequency model decides: "kolamba" is
 * කොළඹ (ඹ), "sangeeta" is සංගීත (ං), "kramaya" is ක්‍රමය (්‍ර) and
 * "buddha" is බුද්ධ (ද්ධ).
 *
 * Where two spellings are possible — කෙ / කේ, ග / ඝ, ද / ඩ — the choice
 * is made with word frequency, the way the scheme is meant to work. The
 * frequencies come from the app's own n-gram model.
 */

import dictionary from "../data/reference-dictionary.json" with { type: "json" };
import formal from "../data/singlish-formal.json" with { type: "json" };
import curated from "../data/singlish-curated.json" with { type: "json" };

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
 * Note that "jh" and "nh" are NOT digraphs here: they are two separate
 * letters, so "jha" is ජ + හ and "nha" is න + හ. "sh" IS a digraph (ශ),
 * as are the uppercase conjunct forms (Sh is ශ), which is why they are
 * listed separately.
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
    sh: "ශ",
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
    ng: ["ඞ", "නග", "න්ග", "ංග"],
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
    sh: ["ෂ"],
    h: [],
    f: ["ඵ"],
    z: ["ස"],
    K: [],
    Kh: ["ක", "කහ"],
    G: [],
    Gh: ["ග", "ගහ"],
    Ng: ["ඟ", "නග", "න්ග", "ංග"],
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
 * Real words can break that pattern ("meka" is මේක, not මෙක), so the other
 * position's sign is always offered as an alternative and the frequency
 * model decides.
 *
 * "i" and "u" are always short, and the doubled spellings ("aa", "ee", "ii",
 * "oo", "uu") are always long. "ai" is the glide යි after a consonant
 * ("lamai" is ලමයි); word-initially it is අයි ("aiyo" is අයියෝ).
 */
export const DEPENDENT_VOWELS: Record<string, { final: string; medial: string }> = {
    "": { final: "", medial: "" },
    a: { final: "", medial: "" },
    aa: { final: "ා", medial: "ා" },
    e: { final: "ේ", medial: "ෙ" },
    ee: { final: "ී", medial: "ී" },
    ae: { final: "ැ", medial: "ැ" },
    aae: { final: "ෑ", medial: "ෑ" },
    i: { final: "ි", medial: "ි" },
    ii: { final: "ී", medial: "ී" },
    o: { final: "ෝ", medial: "ො" },
    oo: { final: "ූ", medial: "ූ" },
    u: { final: "ු", medial: "ු" },
    uu: { final: "ූ", medial: "ූ" },
    // "ai" is the glide යි at the end of a colloquial word ("lamai" is
    // ලමයි), but the diphthong ෛ inside a formal word ("chaitanya" is
    // චෛතන්‍ය). "au" works the same way: ෞ inside a word ("gaurawa" is
    // ගෞරව) and the colloquial final ු ("kau" is handled by the curated
    // dictionary as කවු).
    ai: { final: "යි", medial: "ෛ" },
    au: { final: "ු", medial: "ෞ" },
};

/**
 * The second spelling of a dependent vowel.
 *
 * For e and o the other position's sign is the useful alternative (medial
 * "ෙ" can be the long "ේ", and final "ේ" can be the short "ෙ"). For the
 * remaining vowels the alternative is the other length.
 */
function alternativeSign(vowel: string, isFinal: boolean): string | null {
    const signs = DEPENDENT_VOWELS[vowel];
    if (!signs) return null;

    const primary = isFinal ? signs.final : signs.medial;
    const other = isFinal ? signs.medial : signs.final;
    if (other !== primary) return other;

    switch (vowel) {
        case "a":
            return "ා";
        case "aa":
            return "ෑ";
        case "ae":
            return "ෑ";
        case "aae":
            return "ැ";
        case "i":
            return "ී";
        case "u":
            return "ූ";
        case "ai":
            return "ෛ";
        case "au":
            return "ෞ";
        default:
            return null;
    }
}

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
    ae: "ඇ",
    aae: "ඈ",
    o: "ඔ",
    oo: "ඌ",
    ai: "අයි",
    au: "ඖ",
    ay: "අයි",
};

/**
 * Alternative independent vowels.
 *
 * A word-initial vowel is the hardest choice in the scheme: "a" can be අ or
 * ආ ("adaraya" is ආදරය, "apita" is අපිට), "e" can be එ, ඒ, the short æ or
 * the long ඊ ("eken" is එකෙන්, "ehe" is ඒහේ, "esuru" is ඇසුරු, "elanga"
 * is ඊළඟ), and "o" can be ඔ or ඕ ("one" is ඕනේ, "oya" is ඔයා). Colloquial
 * spelling uses a bare "e" for both æ sounds and for ඊ, a bare "ay" for ආය
 * ("ayathana" is ආයතන), and "au" for the colloquial අවු ("aula" is අවුල),
 * so those readings are offered too. The letter rules cannot know which one
 * the writer meant, so every plausible reading is offered and the frequency
 * model decides.
 */
const INDEPENDENT_VOWEL_ALTERNATIVES: Record<string, string[]> = {
    a: ["ඇ", "ආ"],
    aa: ["ඈ", "අ"],
    i: ["ඊ", "ඉ"],
    ii: ["ඉ"],
    u: ["ඌ", "උ"],
    uu: ["උ"],
    e: ["එ", "ඒ", "ඇ", "ඈ", "ඊ"],
    ee: ["ඉ", "ඊ"],
    o: ["ඕ", "ඔ"],
    oo: ["උ", "ඌ"],
    ai: ["ඓ", "අයි", "ආය"],
    ay: ["ආය", "අය", "ඓ"],
    au: ["අවු"],
    ae: ["ඈ", "ඇ"],
    aae: ["ඇ", "ඈ"],
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
 * Cluster consonants with a spelling that the general rules cannot derive.
 *
 * Sinhala writes a consonant followed by ර as a rakaransaya (ක්‍ර, ප්‍ර,
 * ද්‍ර, ත්‍ර) and a consonant followed by ය as a yansaya (ද්‍ය, ත්‍ය,
 * ව්‍ය). Those are generated structurally by [tokenize], so they are not
 * listed here. The entries below are the exceptions: "sr"/"shr" are ශ්‍ර
 * rather than ස්‍ර, and "ksh" is the single conjunct ක්ෂ.
 */
export const CONJUNCTS: Record<string, string> = {
    sr: "ශ්‍ර",
    shr: "ශ්‍ර",
    ksh: "ක්ෂ",
};

/**
 * Consonants that must be followed by an explicit vowel sign, because the
 * next letter would otherwise be read as a conjunct: "gana" is ගැන, not
 * ගන, and "natha" is නැත, not නත.
 */
const NEEDS_EXPLICIT_VOWEL = new Set(["න", "ත", "ඟ"]);

/** ් — hal kirīma, written after a consonant that ends a word. */
const HAL = "්";

/** ‍ — zero-width joiner, used in Sinhala conjuncts (ක්‍ර, ද්‍ය, ක්ෂ). */
const ZWJ = "\u200D";

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
 *
 * `singlish-curated.json` is the product layer: everyday spellings that the
 * letter rules cannot know (nangi, hondai, sthuthi), English loanwords as
 * Sinhala writers actually spell them, and the standard Sinhala names of
 * Sri Lankan places. It overrides the captured reference entries.
 *
 * `singlish-formal.json` is the formal layer: Sanskrit-derived vocabulary
 * whose standard spelling the letter rules cannot derive reliably (pragna,
 * aishwarya, sanskrutha, chaitanya). It overrides the captured reference
 * entries too, but the everyday product layer still wins where the two
 * disagree.
 */
export const DICTIONARY: Record<string, string> = {
    ...dictionary,
    ...formal,
    ...curated,
};

/**
 * Reverse transliteration tables.
 *
 * The forward rules turn Singlish into Sinhala. The tables below go the other
 * way, so the engine can take every word in the frequency list, work out how
 * a writer would type it, and look the typed word up directly.
 *
 * This is what makes abbreviated Singlish work without a word-by-word
 * exception list. Writers drop the short "a" from unstressed syllables
 * ("mata" → "mta", "karanna" → "krnna", "prashnayak" → "prshnyk"), so the
 * reverse key drops the same vowel in the same places. The frequency model
 * then chooses between the real words that share a key.
 */
const REVERSE_CONSONANTS: Record<string, string> = {
    "ක": "k",
    "ඛ": "kh",
    "ග": "g",
    "ඝ": "gh",
    "ඞ": "ng",
    "ඟ": "ng",
    "ච": "ch",
    "ඡ": "ch",
    "ජ": "j",
    "ඣ": "jh",
    "ඤ": "n",
    "ඥ": "gn",
    "ඦ": "n",
    "ට": "t",
    "ඨ": "th",
    "ඩ": "d",
    "ඪ": "dh",
    "ණ": "n",
    "ත": "th",
    "ථ": "th",
    "ද": "d",
    "ධ": "dh",
    "න": "n",
    "ඬ": "nd",
    "ඳ": "nd",
    "ප": "p",
    "ඵ": "ph",
    "බ": "b",
    "භ": "bh",
    "ම": "m",
    "ඹ": "mb",
    "ය": "y",
    "ර": "r",
    "ල": "l",
    "ව": "w",
    "ශ": "sh",
    "ෂ": "sh",
    "ස": "s",
    "හ": "h",
    "ළ": "l",
    "ෆ": "f",
};

const REVERSE_INDEPENDENT_VOWELS: Record<string, string> = {
    "අ": "a",
    "ආ": "aa",
    "ඇ": "ae",
    "ඈ": "aae",
    "ඉ": "i",
    "ඊ": "ii",
    "උ": "u",
    "ඌ": "uu",
    "එ": "e",
    "ඒ": "ee",
    "ඔ": "o",
    "ඕ": "oo",
    "ඖ": "au",
    "ඓ": "ai",
};

const REVERSE_VOWEL_SIGNS: Record<string, string> = {
    "ා": "aa",
    "ැ": "ae",
    "ෑ": "aae",
    "ි": "i",
    "ී": "ii",
    "ු": "u",
    "ූ": "uu",
    "ෘ": "ru",
    "ෲ": "ruu",
    "ෙ": "e",
    "ේ": "ee",
    "ෛ": "ai",
    "ො": "o",
    "ෝ": "oo",
    "ෞ": "au",
    "්": "",
};

/**
 * How a Sinhala vowel is typed.
 *
 * Long ā is written "a" in the common scheme ("kathā" is "katha", not
 * "kathaa"), long ī is "ee", long ū is "oo", and the short and long æ sounds
 * are both "e" in everyday typing. The abbreviated key uses this collapsed
 * form; the full key below keeps the distinctions the letter rules need.
 */
const REVERSE_VOWEL_ROMAN: Record<string, string> = {
    a: "a",
    aa: "a",
    ae: "e",
    aae: "e",
    i: "i",
    ii: "ee",
    u: "u",
    uu: "oo",
    e: "e",
    ee: "e",
    o: "o",
    oo: "o",
    ai: "ai",
    au: "au",
    ru: "ru",
    ruu: "ruu",
    "": "",
};

/**
 * The full phonetic spelling of a vowel.
 *
 * This is the form the letter rules read back: "aa" is ා, "ae" is ැ and
 * "aae" is ෑ. Keeping them distinct is what stops a full key from being
 * mistaken for an abbreviated one — "nehe" is the abbreviated spelling of
 * නැහැ, while its full spelling is "naehae".
 */
const REVERSE_FULL_VOWEL_ROMAN: Record<string, string> = {
    ...REVERSE_VOWEL_ROMAN,
    aa: "aa",
    ae: "ae",
    aae: "aae",
};

interface ReverseUnit {
    /** The consonant or independent-vowel roman form. */
    base: string;
    /** The vowel that follows it: "", "a", "aa", … */
    vowel: string;
    /** True for a vowel that is a syllable on its own. */
    independent: boolean;
}

/**
 * Splits a Sinhala word into the units a writer would type.
 *
 * A consonant followed by ්‍ර / ්‍ය / ්ෂ is one unit: the joiner is
 * orthography, not a letter, so "ක්‍ර" is typed "kr" and "ද්‍ය" is "dy".
 */
function parseSinhalaWord(word: string): ReverseUnit[] {
    const units: ReverseUnit[] = [];
    let i = 0;

    while (i < word.length) {
        const char = word[i];

        if (REVERSE_CONSONANTS[char]) {
            let base = REVERSE_CONSONANTS[char];
            let vowel = "a";
            i++;

            if (word[i] === HAL) {
                i++;
                if (word[i] === ZWJ) i++;
                const next = word[i];
                if (next && (next === "ර" || next === "ය" || next === "ෂ")) {
                    base += REVERSE_CONSONANTS[next];
                    i++;
                    // The second consonant carries its own inherent vowel.
                    vowel = "a";
                    if (word[i] === HAL) {
                        vowel = "";
                        i++;
                    }
                } else {
                    vowel = "";
                }
            }

            const sign = REVERSE_VOWEL_SIGNS[word[i]];
            if (sign !== undefined) {
                vowel = sign;
                i++;
            }

            units.push({ base, vowel, independent: false });
            continue;
        }

        const independent = REVERSE_INDEPENDENT_VOWELS[char];
        if (independent !== undefined) {
            units.push({ base: independent, vowel: "", independent: true });
            i++;
            continue;
        }

        if (char === "ං") {
            units.push({ base: "n", vowel: "", independent: true });
            i++;
            continue;
        }

        if (char === "ඃ") {
            units.push({ base: "h", vowel: "", independent: true });
            i++;
            continue;
        }

        // ZWJ, ZWNJ and punctuation are not letters.
        i++;
    }

    return units;
}

/** The full phonetic spelling of a parsed word ("mata", "karanna"). */
function fullRomanKey(units: readonly ReverseUnit[]): string {
    let key = "";
    for (const unit of units) {
        if (unit.independent) {
            key += REVERSE_FULL_VOWEL_ROMAN[unit.base] ?? unit.base;
        } else {
            key += unit.base + (REVERSE_FULL_VOWEL_ROMAN[unit.vowel] ?? "");
        }
    }
    return key;
}

/**
 * The abbreviated spelling of a parsed word ("mta", "krnna", "prshnyk").
 *
 * The short "a" is dropped in every syllable but the last. That is the
 * convention behind the abbreviated style: "mama" is typed "mma", "mata" is
 * "mta", and "prashnayak" is "prshnyk".
 */
function abbreviatedRomanKey(units: readonly ReverseUnit[]): string {
    let key = "";
    for (let index = 0; index < units.length; index++) {
        const unit = units[index];
        const isFinal = index === units.length - 1;

        if (unit.independent) {
            key += REVERSE_VOWEL_ROMAN[unit.base] ?? unit.base;
            continue;
        }

        if (unit.vowel === "") {
            key += unit.base;
        } else if (unit.vowel === "a" || unit.vowel === "aa") {
            key += unit.base + (isFinal ? "a" : "");
        } else {
            key += unit.base + (REVERSE_VOWEL_ROMAN[unit.vowel] ?? "");
        }
    }
    return key;
}

/**
 * Collapses the spelling choices that writers make interchangeably.
 *
 * The reverse index and the typed word are both reduced this way, so
 * "vidyawa" and "widyawa", "prashnayak" and "prashnayaka", or "kireemta"
 * and "kirimta" all find the same word. It is deliberately lossy; the
 * frequency model resolves the collisions.
 */
function canonicalRomanKey(key: string): string {
    return key
        .toLowerCase()
        .replaceAll("sh", "s")
        .replaceAll("kh", "k")
        .replaceAll("ch", "c")
        .replaceAll("jh", "j")
        .replaceAll("nh", "n")
        .replaceAll("lh", "l")
        .replaceAll("rh", "r")
        .replaceAll("th", "t")
        .replaceAll("dh", "d")
        .replaceAll("bh", "b")
        .replaceAll("gh", "g")
        .replaceAll("ph", "f")
        .replaceAll("gn", "n")
        .replaceAll("jn", "n")
        .replaceAll("ng", "n")
        .replaceAll("nd", "n")
        .replaceAll("mb", "m")
        .replaceAll("aa", "a")
        .replaceAll("ee", "i")
        .replaceAll("oo", "u")
        .replaceAll("ae", "e")
        .replaceAll("v", "w")
        .replaceAll("z", "s");
}

/**
 * A stricter key for promotion decisions.
 *
 * Only genuinely interchangeable consonant spellings are collapsed here.
 * The lossy [canonicalRomanKey] also folds nasal clusters and vowel length,
 * which is fine for *ranking* a candidate that is already on the list, but
 * too weak to justify replacing the rule's own output: "panda" must not
 * become පණ merely because "nd" collapses to "n".
 */
function strongRomanKey(key: string): string {
    return key
        .toLowerCase()
        .replaceAll("sh", "s")
        .replaceAll("kh", "k")
        .replaceAll("ch", "c")
        .replaceAll("jh", "j")
        .replaceAll("nh", "n")
        .replaceAll("lh", "l")
        .replaceAll("rh", "r")
        .replaceAll("th", "t")
        .replaceAll("dh", "d")
        .replaceAll("bh", "b")
        .replaceAll("gh", "g")
        .replaceAll("ph", "f")
        .replaceAll("v", "w")
        .replaceAll("z", "s");
}

/** The canonical romanization of a Sinhala word, cached for fuzzy matching. */
const canonicalRomanCache = new Map<string, string>();

function canonicalRomanOfSinhala(word: string): string {
    const cached = canonicalRomanCache.get(word);
    if (cached !== undefined) return cached;
    const value = canonicalRomanKey(fullRomanKey(parseSinhalaWord(word)));
    if (canonicalRomanCache.size >= 50_000) canonicalRomanCache.clear();
    canonicalRomanCache.set(word, value);
    return value;
}

/** Levenshtein distance between two short strings. */
function editDistance(a: string, b: string): number {
    if (a === b) return 0;
    const m = a.length;
    const n = b.length;
    if (m === 0) return n;
    if (n === 0) return m;

    let previous = Array.from({ length: n + 1 }, (_, index) => index);
    let current = new Array<number>(n + 1);
    for (let i = 1; i <= m; i++) {
        current[0] = i;
        for (let j = 1; j <= n; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            current[j] = Math.min(
                previous[j] + 1,
                current[j - 1] + 1,
                previous[j - 1] + cost,
            );
        }
        [previous, current] = [current, previous];
    }
    return previous[n];
}

/** How similar a typed word is to a word's full phonetic spelling. */
function romanSimilarity(a: string, b: string): number {
    const length = Math.max(a.length, b.length);
    return length === 0 ? 1 : 1 - editDistance(a, b) / length;
}

/** Adds the standard zero-width joiner to every conjunct that lacks one. */
function withStandardJoiners(word: string): string {
    let result = "";
    for (let i = 0; i < word.length; i++) {
        result += word[i];
        if (word[i] !== HAL) continue;
        if (word[i - 1] === "ර") continue;
        const next = word[i + 1];
        if (next !== "ර" && next !== "ය" && next !== "ෂ") continue;
        if (word[i + 1] === ZWJ) continue;
        result += ZWJ;
    }
    return result;
}

/** A word and its canonical spelling, keyed by its consonant skeleton. */
interface SkeletonEntry {
    word: string;
    canonical: string;
}

/** Consonant spellings that abbreviated writers use interchangeably. */
const LOOSE_CONSONANTS: Record<string, string> = {
    sh: "s",
    kh: "k",
    gh: "g",
    ch: "c",
    jh: "j",
    th: "t",
    dh: "d",
    bh: "b",
    ph: "f",
    ng: "g",
    gn: "n",
    nd: "d",
    mb: "b",
};

/**
 * The consonant skeleton of a parsed word, with spelling variants folded
 * together and yansaya / rakaransaya bases split back into their two
 * consonants.
 *
 * Abbreviated writers drop vowels and choose freely between ශ/ෂ/ස, ත/ථ/ඨ
 * and the other interchangeable letters. Folding those choices means
 * "lekakayn" can still reach ලේඛකයන්, and "kiremya" can reach කිරීමය even
 * though one spells ම්‍ය as a conjunct and the other spells ම + ය.
 */
function looseSkeletonKey(units: readonly ReverseUnit[]): string {
    let key = "";
    for (const unit of units) {
        const base = unit.base;
        if (base.length > 1 && (base.endsWith("r") || base.endsWith("y"))) {
            const head = base.slice(0, -1);
            key += LOOSE_CONSONANTS[head] ?? head;
            key += base.slice(-1);
        } else {
            key += LOOSE_CONSONANTS[base] ?? base;
        }
    }
    return key;
}

/**
 * The skeleton key with a nasal cluster folded to the nasal alone.
 *
 * Names written with the anusvara ("rajasinghe" is රාජසිංහ) keep an "n"
 * where the modern folding keeps "g", so those words are indexed a second
 * time under this key and reached only when the typed word contains "ngh".
 */
function anusvaraSkeletonKey(units: readonly ReverseUnit[]): string {
    const fold = (base: string): string =>
        base === "ng" || base === "nd"
            ? "n"
            : base === "mb"
              ? "m"
              : (LOOSE_CONSONANTS[base] ?? base);
    let key = "";
    for (const unit of units) {
        const base = unit.base;
        if (base.length > 1 && (base.endsWith("r") || base.endsWith("y"))) {
            key += fold(base.slice(0, -1));
            key += base.slice(-1);
        } else {
            key += fold(base);
        }
    }
    return key;
}

/** Every word that can be typed with the same reverse key. */
let abbreviationFullIndex: Map<string, string[]> | null = null;
let abbreviationShortIndex: Map<string, string[]> | null = null;
let abbreviationCanonicalIndex: Map<string, string[]> | null = null;
let abbreviationStrongIndex: Map<string, string[]> | null = null;
let abbreviationSkeletonIndex: Map<string, SkeletonEntry[]> | null = null;
let abbreviationLooseSkeletonIndex: Map<string, SkeletonEntry[]> | null = null;

function addIndexEntry(
    index: Map<string, string[]>,
    key: string,
    word: string,
): void {
    if (!key) return;
    const existing = index.get(key);
    if (existing) {
        if (!existing.includes(word)) existing.push(word);
    } else {
        index.set(key, [word]);
    }
}

/**
 * Builds the reverse index from the same top-20,000 words the frequency
 * model uses.
 *
 * The app builds the identical index from the first 20,000 unigrams of its
 * n-gram model, so a word typed on the keyboard and on the website resolves
 * to the same Sinhala spelling.
 */
export function setAbbreviationLexicon(words: Iterable<string>): void {
    const full = new Map<string, string[]>();
    const short = new Map<string, string[]>();
    const canonical = new Map<string, string[]>();
    const strong = new Map<string, string[]>();
    const skeleton = new Map<string, Map<string, SkeletonEntry>>();
    const looseSkeleton = new Map<string, Map<string, SkeletonEntry>>();

    const addWord = (word: string) => {
        if (!word || /[^\u0D80-\u0DFF\u200C\u200D]/.test(word)) return;
        if (word.includes("\u0DF4")) return;
        const units = parseSinhalaWord(word);
        if (!units.length) return;

        const fullKey = fullRomanKey(units);
        const shortKey = abbreviatedRomanKey(units);
        addIndexEntry(full, fullKey, word);
        addIndexEntry(short, shortKey, word);
        // Abbreviated writers often type a long ī/ū as a single letter:
        // "wu" is වූ even though the full key is "wuu". Add the collapsed
        // key as well so the reverse index can reach those spellings.
        const collapsedKey = shortKey
            .replaceAll("oo", "u")
            .replaceAll("ee", "i");
        if (collapsedKey !== shortKey) addIndexEntry(short, collapsedKey, word);
        addIndexEntry(canonical, canonicalRomanKey(fullKey), word);
        addIndexEntry(canonical, canonicalRomanKey(shortKey), word);
        addIndexEntry(strong, strongRomanKey(fullKey), word);
        addIndexEntry(strong, strongRomanKey(shortKey), word);

        // The consonants alone are what abbreviated writers preserve most
        // reliably. Indexing them lets a spelling like "pusthaklaya" reach
        // පුස්තකාලය even though it drops a vowel the exact keys keep.
        const canonicalKey = canonicalRomanKey(fullKey);
        const addSkeleton = (
            target: Map<string, Map<string, SkeletonEntry>>,
            key: string,
        ) => {
            if (!key) return;
            let entries = target.get(key);
            if (!entries) {
                entries = new Map();
                target.set(key, entries);
            }
            if (!entries.has(word)) {
                entries.set(word, { word, canonical: canonicalKey });
            }
        };
        addSkeleton(
            skeleton,
            units.map((unit) => unit.base).join(""),
        );
        addSkeleton(looseSkeleton, looseSkeletonKey(units));
        if (units.some((unit) => unit.independent && unit.base === "n")) {
            addSkeleton(looseSkeleton, anusvaraSkeletonKey(units));
        }
    };

    for (const word of words) addWord(word);
    // The curated and formal dictionaries are part of the product even when
    // a word sits below the frequency cutoff.
    for (const word of Object.values(DICTIONARY)) addWord(word);

    abbreviationFullIndex = full;
    abbreviationShortIndex = short;
    abbreviationCanonicalIndex = canonical;
    abbreviationStrongIndex = strong;
    abbreviationSkeletonIndex = new Map(
        [...skeleton].map(([key, entries]) => [key, [...entries.values()]]),
    );
    abbreviationLooseSkeletonIndex = new Map(
        [...looseSkeleton].map(([key, entries]) => [
            key,
            [...entries.values()],
        ]),
    );
}

/** True once the reverse index is ready. */
export function hasAbbreviationLexicon(): boolean {
    return abbreviationFullIndex !== null;
}

/** Ranks reverse-index candidates by frequency, preferring standard joiners. */
function rankReverseCandidates(words: readonly string[]): string[] {
    const expanded: string[] = [];
    const seen = new Set<string>();
    for (const word of words) {
        for (const variant of [word, withStandardJoiners(word)]) {
            if (!variant || seen.has(variant)) continue;
            if (!isValidSinhalaUnicode(variant)) continue;
            seen.add(variant);
            expanded.push(variant);
        }
    }

    if (!frequencyLookup) return expanded;
    const lookup = frequencyLookup;
    const scored = expanded.map((word, index) => {
        const base = canonicalFrequency(word, lookup);
        return {
            word,
            index,
            score: base + (base > 0 && word.includes(ZWJ) ? 1 : 0),
        };
    });
    scored.sort((a, b) => b.score - a.score || a.index - b.index);
    return scored.map((entry) => entry.word);
}

interface ReverseCandidates {
    /** Words typed with the full phonetic key ("mata", "karanna"). */
    full: string[];
    /** Words typed with the abbreviated key ("mta", "krnna"). */
    short: string[];
    /** Words that match after consonant spelling normalisation. */
    strong: string[];
    /** Words that match after the lossy spelling normalisation. */
    canonical: string[];
    /** Words whose consonants match, ranked by spelling closeness. */
    fuzzy: string[];
    /** Similarity of the closest fuzzy match, or 0 when there is none. */
    fuzzySimilarity: number;
}

/**
 * The words whose consonant skeleton matches one of the rule readings,
 * ranked by how closely the typed spelling matches their full form.
 *
 * Abbreviated Singlish drops vowels in no fixed order, so an exact key can
 * never cover every spelling. The consonants survive far more reliably, and
 * the closest full spelling is the best guide to which vowel was meant.
 */
function fuzzyCandidates(
    word: string,
    forward: readonly string[],
): { word: string; similarity: number }[] {
    const index = abbreviationSkeletonIndex;
    const looseIndex = abbreviationLooseSkeletonIndex;
    const lookup = frequencyLookup;
    if (!index || !looseIndex || !lookup) return [];

    const normalized = canonicalRomanKey(
        word.toLowerCase().replaceAll("z", "s").replaceAll("v", "w"),
    );
    if (!normalized) return [];

    const seen = new Set<string>();
    const scored: {
        word: string;
        frequency: number;
        similarity: number;
    }[] = [];

    for (const reading of forward.slice(0, 5)) {
        const units = parseSinhalaWord(reading);
        if (!units.length) continue;
        const skeleton = units.map((unit) => unit.base).join("");
        const looseEntries =
            word.toLowerCase().includes("ngh")
                ? [
                      ...(looseIndex.get(looseSkeletonKey(units)) ?? []),
                      ...(looseIndex.get(anusvaraSkeletonKey(units)) ?? []),
                  ]
                : looseIndex.get(looseSkeletonKey(units));
        const entries = index.get(skeleton) ?? looseEntries;
        if (!entries) continue;

        const top = entries
            .map((entry) => ({
                entry,
                frequency: canonicalFrequency(entry.word, lookup),
            }))
            .filter((item) => item.frequency > 0)
            .sort(
                (a, b) =>
                    b.frequency - a.frequency ||
                    (a.entry.word < b.entry.word
                        ? -1
                        : a.entry.word > b.entry.word
                          ? 1
                          : 0),
            )
            .slice(0, 20);

        for (const { entry, frequency } of top) {
            if (seen.has(entry.word)) continue;
            seen.add(entry.word);
            scored.push({
                word: entry.word,
                frequency,
                similarity: romanSimilarity(normalized, entry.canonical),
            });
        }
    }

    scored.sort(
        (a, b) =>
            b.similarity - a.similarity ||
            b.frequency - a.frequency ||
            (a.word < b.word ? -1 : a.word > b.word ? 1 : 0),
    );
    return scored.slice(0, 40);
}

/** The reverse-index candidates for a typed word. */
function reverseCandidates(
    word: string,
    forward: readonly string[],
): ReverseCandidates {
    if (
        !abbreviationFullIndex ||
        !abbreviationShortIndex ||
        !abbreviationCanonicalIndex ||
        !abbreviationStrongIndex ||
        !abbreviationSkeletonIndex
    ) {
        return {
            full: [],
            short: [],
            strong: [],
            canonical: [],
            fuzzy: [],
            fuzzySimilarity: 0,
        };
    }

    const normalized = word
        .toLowerCase()
        .replaceAll("z", "s")
        .replaceAll("v", "w");
    const full = rankReverseCandidates(
        abbreviationFullIndex.get(normalized) ?? [],
    ).slice(0, 40);
    const short = rankReverseCandidates(
        abbreviationShortIndex.get(normalized) ?? [],
    ).slice(0, 40);
    const strong = rankReverseCandidates(
        abbreviationStrongIndex.get(strongRomanKey(normalized)) ?? [],
    ).slice(0, 40);
    const canonical = rankReverseCandidates(
        abbreviationCanonicalIndex.get(canonicalRomanKey(normalized)) ?? [],
    ).slice(0, 40);

    // A word that matched exactly must not appear again as a fuzzy match.
    const exactSet = new Set([...full, ...short]);
    const fuzzy = fuzzyCandidates(word, forward).filter(
        (candidate) => !exactSet.has(candidate.word),
    );
    return {
        full,
        short,
        strong: strong.filter((candidate) => !exactSet.has(candidate)),
        canonical: canonical.filter((candidate) => !exactSet.has(candidate)),
        fuzzy: fuzzy.map((candidate) => candidate.word),
        fuzzySimilarity: fuzzy[0]?.similarity ?? 0,
    };
}

/** Matches a consonant key at the start of `text`, or null. */
function matchConsonant(
    text: string,
    keys: readonly string[] = CONSONANT_KEYS,
): string | null {
    for (const key of keys) {
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
    /** The letters that produced this unit, for the character breakdown. */
    roman: string;
}

/**
 * Splits `word` into syllable units.
 *
 * `extraConsonants` lets the candidate pass read the same letters a second
 * way — "ddh" is the single aspirate ද්ධ, which no key holds.
 */
function tokenize(
    word: string,
    extraConsonants: Record<string, string> = {},
): Unit[] {
    const units: Unit[] = [];
    const hasExtras = Object.keys(extraConsonants).length > 0;
    const table = hasExtras
        ? { ...CONSONANTS, ...extraConsonants }
        : CONSONANTS;
    const keys = hasExtras
        ? [...GEMINATED_KEYS, ...Object.keys(table)].sort(
              (a, b) => b.length - a.length,
          )
        : CONSONANT_KEYS;
    let i = 0;

    const makeUnit = (
        consonant: string,
        consonantKey: string | null,
        vowel: string,
        isFinal: boolean,
        roman: string,
        extraConsonantAlternatives: readonly string[] = [],
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
            for (const alt of INDEPENDENT_VOWEL_ALTERNATIVES[vowel] ?? []) {
                add(alt);
            }
            return { primary, alternatives, consonant, vowel, roman };
        }

        // The alternative consonant comes first: the dental / retroflex and
        // aspirate choices are what the scheme most often has to decide.
        const consAlts = [
            ...(consonantKey
                ? (CONSONANT_ALTERNATIVES[consonantKey] ?? [])
                : []),
            ...extraConsonantAlternatives,
        ];
        for (const cons of consAlts) {
            if (cons === consonant) continue;
            add(cons + sign);
        }

        // Then the alternative vowel sign — the other position's sign, or
        // the other vowel length when the position makes no difference.
        const altSign = alternativeSign(vowel, isFinal);
        if (altSign !== null && altSign !== sign) {
            add(consonant + altSign);
            for (const cons of consAlts) {
                if (cons !== consonant) add(cons + altSign);
            }
        }

        // "e" is also how many writers type the short and long æ sounds:
        // "nehe" is නැහැ and "onema" is ඕනෑම. The explicit "ae"/"aae"
        // spellings exist, but everyday abbreviated Singlish uses a bare
        // "e", so offer both æ signs as well and let frequency decide.
        if (vowel === "e") {
            for (const aeSign of ["ැ", "ෑ"]) {
                if (aeSign === sign) continue;
                add(consonant + aeSign);
                for (const cons of consAlts) {
                    if (cons !== consonant) add(cons + aeSign);
                }
            }
        }

        // Sinhala orthography: a consonant that is followed by න, ත or ඟ
        // must have its vowel written out, otherwise the next letter is
        // read as a conjunct. "gana" is ගැන, not ගන. This is applied
        // below, once the following unit is known.
        return { primary, alternatives, consonant, vowel, roman };
    };

    while (i < word.length) {
        const rest = word.slice(i);

        // Conjuncts (sr, pr, …) come first — they are two letters long.
        const conjunct = matchConjunct(rest);
        if (conjunct) {
            const after = rest.slice(conjunct.length);
            let vowel = matchVowel(after) ?? "";
            let vowelLength = vowel.length;

            // As in the consonant branch, "ay" after a conjunct is the
            // vowel a plus the consonant y ("akshaya" is අක්ෂය), not the
            // single vowel key "ay".
            if (vowel === "ay") {
                vowel = "a";
                vowelLength = 1;
            }

            const isFinal = conjunct.length + vowelLength >= rest.length;
            units.push(
                makeUnit(
                    CONJUNCTS[conjunct],
                    null,
                    vowel,
                    isFinal,
                    rest.slice(0, conjunct.length + vowelLength),
                ),
            );
            i += conjunct.length + vowelLength;
            continue;
        }

        const consonantKey = matchConsonant(rest, keys);
        if (consonantKey) {
            const after = rest.slice(consonantKey.length);
            let vowel = matchVowel(after) ?? "";
            let vowelLength = vowel.length;

            // After a consonant, "ay" is the vowel a followed by the
            // consonant y — "lamaya" is ලමය, "kay" is කය් — not a single
            // vowel. At the start of a word it stays the independent අයි.
            if (vowel === "ay") {
                vowel = "a";
                vowelLength = 1;
            }

            const isFinal = consonantKey.length + vowelLength >= rest.length;
            const geminated = GEMINATED[consonantKey];
            units.push(
                makeUnit(
                    geminated ?? table[consonantKey],
                    geminated ? null : consonantKey,
                    vowel,
                    isFinal,
                    rest.slice(0, consonantKey.length + vowelLength),
                ),
            );
            i += consonantKey.length + vowelLength;
            continue;
        }

        const vowel = matchVowel(rest);
        if (vowel) {
            // "ay" before another vowel is "a" + "y" + vowel, not the
            // diphthong අයි: "ayin" is අයින් (a-yi-n), not අයිඉන්.
            if (vowel === "ay" && matchVowel(rest.slice(2))) {
                units.push(makeUnit("", null, "a", false, "a"));
                i += 1;
                continue;
            }
            units.push(
                makeUnit("", null, vowel, vowel.length >= rest.length, vowel),
            );
            i += vowel.length;
            continue;
        }

        // Anything else (a stray Latin letter) passes through untouched.
        units.push({
            primary: rest[0],
            alternatives: [],
            consonant: "",
            vowel: "",
            roman: rest[0],
        });
        i += 1;
    }

    // Sinhala writes a consonant followed by ය as a yansaya (ද්‍ය, ත්‍ය,
    // ව්‍ය) and a consonant followed by ර as a rakaransaya (ක්‍ර, ප්‍ර,
    // ත්‍ර). The scheme does not spell those as separate letters, so merge
    // the pair into one conjunct unit before the hal rules run. This is what
    // turns "vidyawa" into විද්‍යාව instead of විදයව.
    const isSingleConsonant = (value: string) =>
        /^[\u0D9A-\u0DC6]$/.test(value);
    const bareConsonantAlternatives = (unit: Unit): string[] => {
        const result: string[] = [];
        for (const alternative of unit.alternatives) {
            const base = alternative.endsWith(HAL)
                ? alternative.slice(0, -HAL.length)
                : alternative;
            if (
                isSingleConsonant(base) &&
                base !== unit.consonant &&
                !result.includes(base)
            ) {
                result.push(base);
            }
        }
        return result;
    };

    for (let index = 0; index < units.length - 1; index++) {
        const current = units[index];
        const next = units[index + 1];
        if (!current.consonant || current.vowel !== "") continue;
        if (!next.consonant) continue;
        if (!isSingleConsonant(current.consonant)) continue;
        if (current.primary.endsWith(HAL)) continue;

        const isYansaya =
            next.consonant === "ය" && current.consonant !== "ර";
        const isRakaransaya =
            next.consonant === "ර" && current.consonant !== "ර";
        if (!isYansaya && !isRakaransaya) continue;

        // The consonant alternatives are single letters; build the matching
        // conjunct for each one so the dental/retroflex and aspirate choices
        // survive the merge.
        let bases = [
            current.consonant,
            ...bareConsonantAlternatives(current),
        ];

        // A dental ත is the normal reading of t + y (nitya -> නිත්‍ය);
        // the retroflex ට්‍ය is the rarer alternative.
        if (isYansaya && current.consonant === "ට") {
            bases = ["ත", "ට", ...bases.filter((b) => b !== "ත" && b !== "ට")];
        }

        const joiner = isYansaya ? "ය" : "ර";
        const primaryBase = bases[0] + HAL + ZWJ + joiner;
        const extraBases = bases
            .slice(1)
            .map((base) => base + HAL + ZWJ + joiner);

        const mergedIsFinal = index + 1 === units.length - 1;
        const mergedSign = mergedIsFinal
            ? (DEPENDENT_VOWELS[next.vowel]?.final ?? "")
            : (DEPENDENT_VOWELS[next.vowel]?.medial ?? "");

        const merged = makeUnit(
            primaryBase,
            null,
            next.vowel,
            mergedIsFinal,
            current.roman + next.roman,
            extraBases,
        );

        // The same letters can also be read as two separate consonants:
        // "krnna" is the colloquial කරන්න, while "kramaya" is the formal
        // ක්‍රමය. Offer the plain reading and let the frequency model choose.
        for (const base of bases) {
            const plain = base + joiner + mergedSign;
            if (
                plain !== merged.primary &&
                !merged.alternatives.includes(plain)
            ) {
                merged.alternatives.push(plain);
            }
        }

        units.splice(index, 2, merged);
    }

    // A medial consonant whose vowel has been elided takes the hal, which is
    // how Sinhala writes a cluster: "kanda" is කන්ද and "hambantota" is
    // හම්බන්තොට. Before a liquid, glide or හ the plain form is the reading
    // ("kra" is කර, "sha" is සහ), so there only the hal is offered.
    const PLAIN_ONSETS = new Set(["ර", "ල", "ව", "ය", "හ"]);
    for (let i = 0; i < units.length - 1; i++) {
        const unit = units[i];
        const next = units[i + 1];
        if (!unit.consonant || unit.vowel !== "") continue;
        if (!next.consonant) continue;
        if (unit.primary.endsWith(HAL)) continue;

        const plain = unit.primary;
        // A reph is always ර් before another consonant (කර්ම, සූර්ය,
        // කාර්ය). It is never the plain ර, even before ය / ව / හ.
        if (unit.consonant === "ර") {
            unit.primary = plain + HAL;
            if (!unit.alternatives.includes(plain)) {
                unit.alternatives.push(plain);
            }
            continue;
        }
        if (PLAIN_ONSETS.has([...next.consonant][0])) {
            unit.alternatives.push(plain + HAL);
            continue;
        }
        // A bare "y" before a consonant can also be the glide with its
        // inherent vowel: "polisiyta" is පොලිසියට, not පොලිසිය්ට.
        // Offer the plain reading and let the frequency model decide.
        if (unit.consonant === "ය") {
            unit.alternatives.push(plain);
            unit.primary = plain + HAL;
            continue;
        }
        // The plain letter would be read with its inherent vowel (pa-na-da),
        // which is a different pronunciation, so only the hal is correct.
        unit.primary = plain + HAL;
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
        if (!unit.alternatives.includes(explicit)) {
            unit.alternatives.push(explicit);
        }
    }

    // A consonant at the very end of the word, with no vowel after it, is
    // written with a hal kirīma: "gaman" is ගමන්, not ගමන.
    const last = units[units.length - 1];
    if (last && last.consonant && last.vowel === "") {
        last.primary = last.primary + HAL;
        // A single-letter alternative is word-final too, so it takes a hal.
        last.alternatives = last.alternatives.map((alternative) =>
            [...alternative].length === 1 && !alternative.endsWith(HAL)
                ? alternative + HAL
                : alternative,
        );
        // The dative suffix -ට is routinely typed with a bare "t": "mat" is
        // මට, not මට්. Offer the inherent-vowel reading and let frequency
        // choose between the suffix and a genuine final hal ("bhat" is භට,
        // but "kaamath" is කෑමත්).
        if (last.consonant === "ට" && !last.alternatives.includes("ට")) {
            last.alternatives.push("ට");
        }
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
function buildCandidates(
    word: string,
    units: Unit[],
    literal: string,
): string[] {
    // A word has at most a handful of units, but every unit can have several
    // alternatives. The cap keeps the keyboard responsive on long inputs
    // while still covering the combinations that matter (a long vowel plus
    // a dental/retroflex choice, for example).
    const MAX_CANDIDATES = 800;
    const candidates: string[] = [];
    const seen = new Set<string>();
    const push = (candidate: string, force = false) => {
        // Never offer a reading that renders as a dotted circle.
        if (!candidate || !isValidSinhalaUnicode(candidate)) return;
        if (seen.has(candidate)) return;
        if (!force && candidates.length >= MAX_CANDIDATES) return;
        seen.add(candidate);
        candidates.push(candidate);
    };

    // A reading is offered directly after the spelling it was read from,
    // so the corrected forms stay near the top of the strip instead of
    // being buried under every dental/retroflex alternative.
    const pushWithReadings = (value: string) => {
        push(value);
        for (const reading of orthographicReadings(value)) push(reading);
    };

    const primaries = units.map((u) => u.primary);
    pushWithReadings(primaries.join(""));

    // One unit swapped for one of its alternatives.
    units.forEach((unit, index) => {
        for (const alt of unit.alternatives) {
            const parts = primaries.slice();
            parts[index] = alt;
            pushWithReadings(parts.join(""));
        }
    });

    // "nd" can also be the single letter ඳ, which swallows the following
    // vowel: "honda" is හොඳ, not හොන්ද.
    for (let i = 0; i < units.length - 1; i++) {
        const unit = units[i];
        const next = units[i + 1];
        if (unit.consonant !== "න" || unit.vowel !== "") continue;
        if (next.consonant !== "ද") continue;
        const parts = primaries.slice();
        parts.splice(i, 2, "ඳ" + next.primary.slice(next.consonant.length));
        pushWithReadings(parts.join(""));
    }

    // The aspirate after a geminate (ddh) is a single letter, not two.
    const aspirated = tokenize(word, { ddh: "ද්ධ" })
        .map((u) => u.primary)
        .join("");
    pushWithReadings(aspirated);

    // Every unit swapped for its first (or second) alternative at once.
    for (const pick of [0, 1]) {
        if (units.some((u) => u.alternatives.length > pick)) {
            pushWithReadings(
                units
                    .map((u) => u.alternatives[pick] ?? u.primary)
                    .join(""),
            );
        }
    }

    // Two units swapped at once. This is what reaches spellings such as
    // නිර්මාණය (long ā + ණ), where one change alone is not enough.
    for (let i = 0; i < units.length; i++) {
        const altsI = units[i].alternatives;
        if (!altsI.length) continue;
        for (let j = i + 1; j < units.length; j++) {
            const altsJ = units[j].alternatives;
            if (!altsJ.length) continue;
            for (const altI of altsI) {
                for (const altJ of altsJ) {
                    const parts = primaries.slice();
                    parts[i] = altI;
                    parts[j] = altJ;
                    pushWithReadings(parts.join(""));
                }
            }
        }
    }

    // Three units swapped at once for short words, with the same cap.
    if (units.length <= 8) {
        outer: for (let i = 0; i < units.length; i++) {
            const altsI = units[i].alternatives;
            if (!altsI.length) continue;
            for (let j = i + 1; j < units.length; j++) {
                const altsJ = units[j].alternatives;
                if (!altsJ.length) continue;
                for (let k = j + 1; k < units.length; k++) {
                    const altsK = units[k].alternatives;
                    if (!altsK.length) continue;
                    for (const altI of altsI) {
                        for (const altJ of altsJ) {
                            for (const altK of altsK) {
                                const parts = primaries.slice();
                                parts[i] = altI;
                                parts[j] = altJ;
                                parts[k] = altK;
                                pushWithReadings(parts.join(""));
                                if (candidates.length >= MAX_CANDIDATES) {
                                    break outer;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // The literal input always stays last, even when the cap was reached.
    push(literal, true);
    return candidates;
}

/**
 * The spellings the letter rules cannot reach on their own.
 *
 * Sinhala writes a prenasalised consonant as one letter (ම්බ is ඹ,
 * න්ද is ඳ), a nasal is often ං rather than න්, and the r/y conjuncts
 * carry a zero-width joiner. Each of these is a possible reading of what
 * was typed, so they join the candidate set and the frequency model ranks
 * them ("kolamba" is කොළඹ, "sangita" is සංගීත, "kramaya" is ක්‍රමය).
 */
function orthographicReadings(text: string): string[] {
    const readings: string[] = [];
    const add = (value: string) => {
        if (value !== text && !readings.includes(value)) readings.push(value);
    };

    // Prenasalised letters.
    const prenasalised = text
        .replaceAll("ම්බ", "ඹ")
        .replaceAll("න්ඩ", "ඬ")
        .replaceAll("න්ද", "ඳ");
    add(prenasalised);

    // ං instead of a nasal written with a hal: සන්ගීත -> සංගීත,
    // සින්හල -> සිංහල. ඟ is first split into න් + ග so the rules can see
    // the nasal (සඟිත -> සන්ගිත -> සංගීත).
    add(withAnusvara(text));
    add(withAnusvara(text.replaceAll("ඟ", "න්ග")));

    // Rakaransaya, yansaya and the ෘ / ෲ they stand for:
    // ක්රමය -> ක්‍රමය, ක්රුතිය -> කෘතිය.
    //
    // A reph (ර්) before ය or ර is NOT a conjunct: "surya" is සූර්ය and
    // "kaarya" is කාර්ය, never සූර්‍ය / කාර්‍ය. The lookbehind keeps the
    // joiner out of those spellings.
    const conjuncts = text
        .replaceAll(/(?<!ර)්ර/g, "්‍ර")
        .replaceAll(/(?<!ර)්ය/g, "්‍ය");
    add(conjuncts);
    // The joiner is invisible and some writers leave it out. Offer the
    // unjoined spelling too; ranking prefers the standard joined form.
    add(conjuncts.replaceAll(ZWJ, ""));
    add(conjuncts.replaceAll("්‍රු", "ෘ").replaceAll("්‍රූ", "ෲ"));
    add(withAnusvara(conjuncts));
    add(withAnusvara(prenasalised));
    return readings;
}

const NASAL_BEFORE_CONSONANT = /න්(?=[\u0D9A-\u0DC6])/g;

/** ් + න replaced by ං when a consonant follows. */
function withAnusvara(text: string): string {
    return text.replace(NASAL_BEFORE_CONSONANT, "ං");
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
const PRIMARY_BONUS = 10;

/** Injects the frequency lookup used to rank candidates. */
export function setCandidateFrequencyLookup(
    lookup: ((word: string) => number) | null,
): void {
    frequencyLookup = lookup;
}

/**
 * Orthographic variants of a word that differ only in the invisible joiner.
 *
 * Sinhala text disagrees about U+200D in conjuncts: both ක්‍රමය and ක්‍රමය
 * are written, and both සත්‍ය and සත්‍ය. The frequency list contains both,
 * so looking up only the exact spelling makes the rarer form win. These
 * variants let ranking treat both spellings as the same word.
 */
function joinerVariants(word: string): string[] {
    const variants = [word];
    const add = (value: string) => {
        if (value && !variants.includes(value)) variants.push(value);
    };

    let base = word;
    if (
        word.includes(ZWJ) ||
        word.includes("\u200C") ||
        word.includes("\u200B")
    ) {
        const stripped = word
            .replaceAll(ZWJ, "")
            .replaceAll("\u200C", "")
            .replaceAll("\u200B", "");
        if (stripped && stripped !== word) {
            add(stripped);
            base = stripped;
        }
    }

    // Only the conjuncts this engine actually writes: rakaransaya (්‍ර),
    // yansaya (්‍ය) and ක්ෂ. A reph (ර් + consonant) never takes a joiner,
    // so skip any hal that follows ර.
    const positions: number[] = [];
    for (let i = 1; i < base.length - 1; i++) {
        if (base[i] !== HAL) continue;
        if (base[i - 1] === "ර") continue;
        const next = base[i + 1];
        if (next === "ර" || next === "ය" || next === "ෂ") {
            positions.push(i + 1);
        }
    }
    if (positions.length === 0) return variants;

    const withJoiners = (chosen: readonly number[]) => {
        const selected = new Set(chosen);
        let result = "";
        for (let i = 0; i < base.length; i++) {
            if (selected.has(i)) result += ZWJ;
            result += base[i];
        }
        return result;
    };

    add(withJoiners(positions));
    for (const position of positions) add(withJoiners([position]));
    return variants;
}

/** The best frequency across a word's joiner variants. */
function canonicalFrequency(
    word: string,
    lookup: (word: string) => number,
): number {
    let best = 0;
    for (const variant of joinerVariants(word)) {
        const value = lookup(variant);
        if (value > best) best = value;
    }
    return best;
}

function rankCandidates(candidates: string[]): string[] {
    if (!frequencyLookup) return candidates;
    const lookup = frequencyLookup;

    // The rules decide the *candidate set*; the word frequencies decide the
    // *order*. That is how the scheme is meant to work: නො and නෝ are both
    // possible spellings of "no", and which one is right depends on how
    // common the word is.
    const scored = candidates.map((word, index) => {
        const base = canonicalFrequency(word, lookup);
        return {
            word,
            index,
            base,
            // The rule's own answer gets a head start, so the model only
            // displaces it when the alternative is clearly more common. "ga"
            // must stay ග rather than becoming ගා, but "no" must become නො
            // rather than නෝ. The tiny joiner bonus settles spellings that
            // are otherwise equally frequent in favour of the standard form.
            score:
                base * (index === 0 ? PRIMARY_BONUS : 1) +
                (base > 0 && word.includes(ZWJ) ? 1 : 0),
        };
    });

    // When nothing is a known word, keep the rule order.
    if (scored.every((entry) => entry.base === 0)) return candidates;

    scored.sort((a, b) => b.score - a.score || a.index - b.index);

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
 * True when a typed word omits vowels between consonants.
 *
 * Abbreviated Singlish is written by dropping the short "a": "mata" becomes
 * "mta", "karanna" becomes "krnna", "prashnayak" becomes "prshnyk". That
 * leaves consonant clusters in the middle of a word, which the full phonetic
 * scheme only produces for a handful of conjuncts — and those match a full
 * key anyway.
 */
function looksAbbreviated(word: string): boolean {
    return /[bcdfghjklmnpqrstvwxyz]{2,}/.test(word.toLowerCase());
}

/** The voiced stops that follow a nasal in a prenasalised cluster. */
const PRENASALIZED_STOPS = new Set(["ද", "ඩ", "ග", "ජ"]);

/**
 * True when a medial consonant has no vowel of its own.
 *
 * That is the signature of an abbreviated spelling: "khmda" leaves ඛ and ම
 * bare, and "pusthaklaya" leaves ස and ක bare. A final consonant with a hal
 * is normal Sinhala ("gaman" is ගමන්), and a nasal before a consonant is the
 * ordinary prenasalised spelling ("panda" is පන්ද), so neither counts.
 */
function hasElidedVowel(word: string): boolean {
    const units = tokenize(word);
    for (let index = 0; index < units.length - 1; index++) {
        const unit = units[index];
        if (unit.consonant === "" || unit.vowel !== "") continue;
        // A nasal directly before a voiced stop is the ordinary
        // prenasalised spelling (පන්ද, ගඹ), not an elided vowel.
        const next = units[index + 1].consonant;
        if (unit.consonant === "න" && PRENASALIZED_STOPS.has(next)) {
            continue;
        }
        if (unit.consonant === "ම" && next === "බ") continue;
        return true;
    }
    return false;
}

/** How much more common the abbreviated reading must be to take primary. */
const ABBREVIATED_DOMINANCE = 5;

/** The frequency floor for an abbreviated reading to outrank the rules. */
const ABBREVIATED_MINIMUM_FREQUENCY = 100_000;

/** How much closer a fuzzy consonant match must be to displace the answer. */
const FUZZY_MARGIN = 0.1;

/**
 * How close a fuzzy match must be to replace a plain rule output.
 *
 * When the rules produce no known word, a known word whose canonical Roman
 * spelling is at least this similar to what was typed is almost certainly the
 * intended word. A lower bar starts replacing valid rare spellings with
 * merely nearby common ones ("gula" → ගලා instead of ගුල); a higher bar
 * loses genuine corrections such as "nethipathi" → නීතිපති.
 */
const FUZZY_PROMOTION_SIMILARITY = 0.8;

/**
 * Merges the reverse-index candidates with the rule candidates.
 *
 * The two typing styles need different answers. Full phonetic input
 * ("karanna", "prashnayak") is what the letter rules are for, so their
 * output stays primary and the reverse matches join as alternatives.
 *
 * Abbreviated input ("krnna", "prshnyk") is not reachable by the rules at
 * all. It takes primary when the input looks abbreviated and matches no full
 * key, or when the abbreviated reading is overwhelmingly more common than
 * every full reading ("den" is දැන්, not the rare දෙන්). The dominance guard
 * keeps a common homophone from displacing the literal rule output for a
 * genuine full spelling ("kala" stays කල even though කළ is more frequent).
 *
 * Lossy canonical matches always come last, so a fuzzy match can never
 * outrank a word the writer typed exactly.
 */
function mergeCandidates(
    reverse: ReverseCandidates,
    forward: readonly string[],
    literal: string,
): string[] {
    const lookup = frequencyLookup;
    const shortBest =
        lookup && reverse.short.length > 0
            ? canonicalFrequency(reverse.short[0], lookup)
            : 0;
    const fullBest =
        lookup && reverse.full.length > 0
            ? canonicalFrequency(reverse.full[0], lookup)
            : 0;
    const abbreviatedStyle =
        reverse.short.length > 0 &&
        ((reverse.full.length === 0 && looksAbbreviated(literal)) ||
            (shortBest >= ABBREVIATED_MINIMUM_FREQUENCY &&
                shortBest >= ABBREVIATED_DOMINANCE * fullBest));
    const fuzzyEligible = hasElidedVowel(literal);

    // When the letter rules produce no known word at all, the input is
    // outside what the scheme can spell. In that case a reverse-index match
    // is stronger evidence than an invented spelling, so promote the best
    // known reverse candidate ahead of the rule output. This is what lets a
    // consonant-variant match such as "smmuka" reach සම්මුඛ; it never
    // applies while the rules still produce a real word.
    const knownFrequency = (candidate: string) =>
        lookup ? canonicalFrequency(candidate, lookup) : 0;
    const reverseLists = [reverse.full, reverse.short, reverse.strong];
    const forwardKnown = forward.some(
        (candidate) => knownFrequency(candidate) > 0,
    );
    const exactReverseKnown = reverseLists.some((list) =>
        list.some((candidate) => knownFrequency(candidate) > 0),
    );
    const reverseHasKnown =
        exactReverseKnown ||
        reverse.fuzzy.some((candidate) => knownFrequency(candidate) > 0);

    let reversePrimary: readonly string[] = [];
    if (abbreviatedStyle) {
        reversePrimary = reverse.short;
    } else if (!forwardKnown && reverseHasKnown) {
        if (exactReverseKnown) {
            // An exact or consonant-variant match is stronger evidence than
            // an invented spelling, even without a dropped vowel.
            reversePrimary =
                reverseLists
                    .filter((list) => list.length > 0)
                    .sort(
                        (a, b) =>
                            knownFrequency(b[0]) - knownFrequency(a[0]),
                    )[0] ?? [];
        } else {
            // Only the fuzzy list is left. The rule output is a weak answer
            // when it contains a dropped vowel, a final hal where a vowel
            // belongs, or a conjunct the writer did not type (a yansaya or
            // rakaransaya reading of a plain consonant sequence), or when a
            // known word's Roman spelling is almost identical to what was
            // typed. In those cases the closest known word is better evidence
            // than the invented spelling: "kiremya" reaches කිරීමය,
            // "paminenne" reaches පැමිණෙන්නේ, and "nalikaw" reaches නාලිකාව.
            const ruleLooksLossy =
                fuzzyEligible ||
                (forward[0]?.endsWith(HAL) ?? false) ||
                (forward[0]?.includes(ZWJ) ?? false) ||
                reverse.fuzzySimilarity >= FUZZY_PROMOTION_SIMILARITY;
            if (ruleLooksLossy && reverse.fuzzy.length > 0) {
                reversePrimary = reverse.fuzzy;
            }
        }
    }

    let primary: readonly string[] =
        reversePrimary.length > 0 ? reversePrimary : forward;

    // Abbreviated writers drop vowels in no fixed order, so the exact keys
    // miss spellings the consonants still identify. When a consonant match
    // is closer to what was typed than the current answer, prefer it. The
    // margin keeps a full phonetic spelling from being displaced by a
    // neighbouring word that merely shares its consonants.
    const fuzzyBest = reverse.fuzzy[0];
    if (fuzzyEligible && fuzzyBest && lookup && fuzzyBest !== primary[0]) {
        const fuzzyFrequency = knownFrequency(fuzzyBest);
        if (fuzzyFrequency > 0) {
            const current = primary[0];
            const currentFrequency = knownFrequency(current);
            if (currentFrequency === 0) {
                primary = reverse.fuzzy;
            } else {
                const inputCanonical = canonicalRomanKey(
                    literal
                        .toLowerCase()
                        .replaceAll("z", "s")
                        .replaceAll("v", "w"),
                );
                const fuzzySimilarity = romanSimilarity(
                    inputCanonical,
                    canonicalRomanOfSinhala(fuzzyBest),
                );
                const currentSimilarity = romanSimilarity(
                    inputCanonical,
                    canonicalRomanOfSinhala(current),
                );
                if (fuzzySimilarity > currentSimilarity + FUZZY_MARGIN) {
                    primary = reverse.fuzzy;
                }
            }
        }
    }

    const primaryIsFuzzy = primary === reverse.fuzzy;
    const rest = primaryIsFuzzy
        ? [
              forward,
              reverse.full,
              reverse.short,
              reverse.strong,
              reverse.canonical,
          ]
        : reversePrimary.length > 0
          ? [
                forward,
                reverse.full,
                reverse.short,
                reverse.strong,
                reverse.fuzzy,
                reverse.canonical,
            ]
          : [
                reverse.full,
                reverse.short,
                reverse.strong,
                reverse.fuzzy,
                reverse.canonical,
            ];

    const merged: string[] = [];
    const seen = new Set<string>();
    const add = (candidate: string) => {
        if (!candidate || seen.has(candidate)) return;
        seen.add(candidate);
        merged.push(candidate);
    };

    for (const candidate of primary) add(candidate);
    for (const list of rest) {
        for (const candidate of list) add(candidate);
    }

    const withoutLiteral = merged.filter((candidate) => candidate !== literal);
    const capped = withoutLiteral.slice(0, 800);
    if (merged.includes(literal)) capped.push(literal);
    return capped;
}

/**
 * Transliterates a word the way the standard scheme does.
 *
 * Dictionary words keep their exact spelling; everything else is
 * transliterated with the rules and offered with its alternatives.
 */
export function transliterate(word: string): Transliteration {
    if (!word) return { primary: "", candidates: [] };

    const forward = rankCandidates(
        buildCandidates(word, tokenize(word), word),
    );
    const reverse = reverseCandidates(word, forward);
    const merged = mergeCandidates(reverse, forward, word);

    // A word in the dictionary has a canonical spelling — that is the
    // answer, so it always comes first.
    const known = DICTIONARY[word.toLowerCase()];
    if (known !== undefined) {
        return {
            primary: known,
            candidates: [known, ...merged.filter((c) => c !== known)],
        };
    }

    return { primary: merged[0] ?? "", candidates: merged };
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

/** One syllable in a word, for the character breakdown. */
export interface TransliterationUnit {
    /** The letters that were typed. */
    roman: string;
    /** The Sinhala the engine produced for them. */
    sinhala: string;
}

/**
 * Splits a word into the syllables the engine actually reads, so the
 * breakdown shows "kae" → කැ rather than "k", "a", "e".
 */
export function breakdown(word: string): TransliterationUnit[] {
    if (!word) return [];
    return tokenize(word).map((unit) => ({
        roman: unit.roman,
        sinhala: unit.primary,
    }));
}

/**
 * The ranked alternatives for a word, for the suggestion strip.
 * The first entry is the primary output.
 */
export function generateSuggestions(input: string): string[] {
    if (!input) return [];
    return transliterate(input).candidates.slice(0, 12);
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
    return DICTIONARY[word.toLowerCase()] !== undefined;
}

