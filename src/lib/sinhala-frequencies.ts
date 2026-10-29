/**
 * Sinhala word frequencies.
 *
 * The scheme decides between readings like ගොඩ and ගෝද using word
 * frequency rather than a rule. The CleanBoard app already ships exactly
 * such a model (`models/si.ngram`), so the website uses the same
 * frequencies — extracted at build time by
 * `scripts/build-sinhala-frequencies.mjs` — to rank the alternatives the
 * same way.
 *
 * The data is loaded lazily so it never costs the first paint.
 */

/** word → frequency, or null when the list has not been loaded yet. */
let frequencies: Map<string, number> | null = null;

/** The in-flight load, so concurrent callers share one request. */
let pending: Promise<Map<string, number>> | null = null;

/** The frequency of a Sinhala word, or 0 when it is unknown. */
export function sinhalaFrequency(word: string): number {
    return frequencies?.get(word) ?? 0;
}

/** True once the frequency list has been loaded. */
export function hasSinhalaFrequencies(): boolean {
    return frequencies !== null;
}

/**
 * Loads the frequency list.
 *
 * `url` must include the deployment base path — pass
 * `import.meta.env.BASE_URL + "data/si-words.txt"`.
 */
export function loadSinhalaFrequencies(url: string): Promise<Map<string, number>> {
    if (frequencies) return Promise.resolve(frequencies);
    if (pending) return pending;

    pending = fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error(
                    `Could not load the Sinhala frequency list: HTTP ${response.status}`,
                );
            }
            return response.text();
        })
        .then((text) => {
            const map = new Map<string, number>();
            for (const line of text.split("\n")) {
                if (!line) continue;
                const space = line.lastIndexOf(" ");
                if (space < 0) continue;
                const word = line.slice(0, space);
                const frequency = Number(line.slice(space + 1));
                if (word && Number.isFinite(frequency)) map.set(word, frequency);
            }
            frequencies = map;
            return map;
        })
        .catch((error) => {
            // The converter still works without the list — it just falls back
            // to the deterministic rules.
            console.warn(error);
            frequencies = new Map();
            return frequencies;
        });

    return pending;
}

/** Injects a frequency list directly. Used by the tests. */
export function setSinhalaFrequencies(map: Map<string, number>): void {
    frequencies = map;
}
