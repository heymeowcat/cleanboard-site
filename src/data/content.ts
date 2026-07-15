/**
 * Editorial content for the marketing pages, in both languages.
 *
 * Keeping the copy in one place makes the English/Sinhala pages easy to keep
 * in sync and lets the schema builders reuse the exact same strings.
 */

export interface Feature {
    id: string;
    title: string;
    body: string;
    icon: string;
}

export const features = {
    en: [
        {
            id: "singlish",
            title: "Singlish engine built in",
            body: "Type plain English letters and CleanBoard converts them to සිංහල as you type — with 160+ common words and phonetic variants handled for you.",
            icon: "keyboard",
        },
        {
            id: "offline",
            title: "Works completely offline",
            body: "Downloadable English and Sinhala dictionaries, offline suggestions, and an inline translator that never touches the network.",
            icon: "cloud-off",
        },
        {
            id: "privacy",
            title: "No internet permission",
            body: "The app does not request the INTERNET permission, so it is technically incapable of sending your keystrokes anywhere. No analytics, no ads, no tracking.",
            icon: "shield",
        },
        {
            id: "layouts",
            title: "Four Sinhala layouts",
            body: "CleanBoard Classic, Wijesekara, Efficient and Google/Phonetic style layouts, each with full vowel signs and conjunct support.",
            icon: "grid",
        },
        {
            id: "gestures",
            title: "Gesture typing",
            body: "Swipe to delete, flick up for numbers and symbols, and use the spacebar as a cursor. A fast calculator lives in the suggestions bar.",
            icon: "swipe",
        },
        {
            id: "custom",
            title: "Make it yours",
            body: "Adaptive theming, custom accent colours, key-press effects such as Sparkle, and per-layout settings you control.",
            icon: "sparkles",
        },
    ],
    si: [
        {
            id: "singlish",
            title: "ඇතුළත් Singlish එංජිනය",
            body: "සරල ඉංග්‍රීසි අකුරු ලියන්න, CleanBoard ඒවා ඔබ ලියන විටම සිංහලට හරවයි — පොදු භාෂා 160කට වැඩි සම්පූර්ණ කරන ලද උපක්‍රම සමඟ.",
            icon: "keyboard",
        },
        {
            id: "offline",
            title: "සම්පූර්ණයෙන්ම නොබැඳිය",
            body: "බාගන්න කළ හැකි ඉංග්‍රීසි සහ සිංහල ශබ්දකෝෂ, නොබැඳි යෝජනා, සහ ජාලය භාවිත නොකරන ඇතුළත් පරිවර්තකය.",
            icon: "cloud-off",
        },
        {
            id: "privacy",
            title: "අන්තර්ජාල අනුමතය නැත",
            body: "යෙදුම INTERNET අනුමතය ඉල්ලන්නේ නැත, එබැවින් ඔබගේ අකුරු ගලවන කිසිදු තැනකට යැමීමට නොහැකි ලෙස පවතී. විශ්ලේෂණ, දැන්දීම ප්‍රචාරණ නැත.",
            icon: "shield",
        },
        {
            id: "layouts",
            title: "සිංහල පිහිටුම් හතර",
            body: "CleanBoard Classic, විජේසේකර, Efficient සහ Google/Phonetic ආකෘති — සියල්ලම සම්පූර්ණ ශක්ති සලකුණු සහ ඡේය අකුරු සමඟ.",
            icon: "grid",
        },
        {
            id: "gestures",
            title: "අභින ටයිප් කිරීම",
            body: "මකීමට swipe කරන්න, අංක සහ සංකේත සඳහා flick කරන්න, spacebar එක cursor එකක් ලෙස භාවිත කරන්න. යෝජනා පෘ්තියේ වේගවත් ගණකයක් ඇත.",
            icon: "swipe",
        },
        {
            id: "custom",
            title: "ඔබගේ ආකාරයට සකසන්න",
            body: "ප්‍රතිචාර ශීලි තේමා, ඔබගේ අභින පැහැය, Sparkle වැනි key-press effects, සහ ඔබ පාලනය කරන පිහිටුම් සැකසුම්.",
            icon: "sparkles",
        },
    ],
} satisfies Record<string, Feature[]>;

/** The "how it works" steps shown on the homepage and the transliterate page. */
export const steps = {
    en: [
        {
            title: "Type in English letters",
            body: "Open the converter above and type the way you would type a message — “kohomada hodai”.",
        },
        {
            title: "Get සිංහල instantly",
            body: "The same engine that runs inside the CleanBoard app converts each word as you type, with phonetic alternatives for dental and retroflex consonants.",
        },
        {
            title: "Copy, or use the keyboard",
            body: "Copy the Sinhala text anywhere, or install CleanBoard and get the same conversion while you type in any app on your phone.",
        },
    ],
    si: [
        {
            title: "ඉංග්‍රීසි අකුරු ලියන්න",
            body: "ඉහත ඇති පරිවර්තකය විවෘත කර, පණිස්තාවක් ලියන ආකාරයටම ටයිප් කරන්න — “kohomada hodai”.",
        },
        {
            title: "සිංහල ක්ෂණිකව ලබා ගන්න",
            body: "CleanBoard යෙදුම තුළ ධඟුන එංජිනයම ඔබ ලියන සෑම එක් එක් ජනනයක්ම හරවයි, දන්ත සහ රෙට්‍රෝස් පරිමාව සඳහා ශබ්දානුකූල අනුවර්තන සමඟ.",
        },
        {
            title: "පිටපත් කරන්න, හෝ යතුරුපුවරුව භාවිත කරන්න",
            body: "සිංහල පෙළ ඕනෑම තැනකට පිටපත් කරන්න, හෝ CleanBoard ස්ථාපනය කර ඔබගේ දුරකථනයේ ඕනෑම යෙදුමේ ලියද්දී එම පරිවර්තනය ලබා ගන්න.",
        },
    ],
};

/** Short bullet list used under the hero on the transliterate page. */
export const benefits = {
    en: [
        "Runs 100% in your browser — no account, no upload, no tracking",
        "Powered by the same engine that ships inside the CleanBoard Android app",
        "Handles aspirated consonants (ඛ ඝ ඡ ඣ), geminated consonants and the ං anusvara",
        "Shows alternative spellings so you can pick the one you meant",
        "Works on phones, tablets and desktops",
    ],
    si: [
        "සම්පූර්ණයෙන්ම ඔබගේ බ්‍රවුසරය තුළම ක්‍රියා කරයි — ගිණුමක්, උඩුගානනයක් හෝ ලුණු කිරීමක් නැත",
        "CleanBoard ඇන්ඩ්‍රොයිඩ් යෙදුම තුළ ඇති එම එංජිනයම භාවිත කරයි",
        "මහප්‍රාණ අකුරු (ඛ ඝ ඡ ඣ), ගෙල්ලු අකුරු සහ ං අනුස්වරය නිවැරදිව හසුරුවයි",
        "ඔබංසුමනය කළ අකුරු ලියුම් පෙන්වා දෙනවා",
        "දුරකථන, පැටිට්ටි සහ පරිගන්නියක ක්‍රියා කරයි",
    ],
};

/** The Sinhala keyboard layouts CleanBoard ships with. */
export const layouts = {
    en: [
        {
            name: "CleanBoard Classic",
            body: "The default layout, tuned for the standard Sinhala alphabet with the most-used conjuncts placed where your thumbs naturally land.",
        },
        {
            name: "Wijesekara",
            body: "The traditional Wijesekara arrangement, for anyone who learned to type on a traditional Sinhala keyboard.",
        },
        {
            name: "Efficient",
            body: "A compact layout that fits more keys on a small screen, for people who type a lot on a phone.",
        },
        {
            name: "Google / Phonetic",
            body: "The familiar phonetic layout, where the key you press is the sound you hear — plus the full Singlish engine.",
        },
    ],
    si: [
        {
            name: "CleanBoard Classic",
            body: "පෙරටම තිබූ පෙරණි පිහිටුම, සාමාන්‍ය සිංහල අකුරු අනුව පිරිසැලසුම් කර ඇත.",
        },
        {
            name: "විජේසේකර",
            body: "සාම්ප්‍රදායික සිංහල යතුරුපුවරුවෙන් ඉගෙන ගත් අයට සුදුසු සාම්ප්‍රදායික පිහිටුම.",
        },
        {
            name: "Efficient",
            body: "කුඩා තිරයේ වැඩි යතුරු ගැනීමට හැකි කුඩා පිහිටුම, දුරකථනයෙන් බොහෝ ලියන අයට.",
        },
        {
            name: "Google / Phonetic",
            body: "ඔබ අසන ශබ්දයට ගැලපෙන යතුරු පිහිටුම, එයින් පසු Singlish එංජිනය ද ඇතුළත්.",
        },
    ],
} as const;

/** The three "privacy is a feature" pillars on the features page. */
export const privacyPillars = {
    en: [
        {
            title: "No INTERNET permission",
            body: "The app never asks for network access, so the operating system will not let it send anything. Privacy enforced by the platform, not by a promise.",
        },
        {
            title: "No third-party SDKs",
            body: "No analytics, no advertising, no crash reporting, no fingerprinting, no A/B testing. There is nothing in the app that talks to anyone.",
        },
        {
            title: "Offline dictionaries",
            body: "English and Sinhala dictionaries download once and live on your device. Suggestions work on a plane, in the countryside, or with data turned off.",
        },
    ],
    si: [
        {
            title: "INTERNET අනුමතය නැත",
            body: "යෙදුම ජාල ප්‍රවේශය ඉල්ලන්නේ නැත, එබැවින් මෙහෙලුපාඩිය එයට යැමීමට ඉඩ නොදෙයි. පෞද්ගලිකත්වය ප්‍රතිඥා මත නොපිළිතුරුව මෙහෙලුපාඩිය මගින් බලාතැන්නේ.",
        },
        {
            title: "තෙත් පාර්චි යෙදුම් නැත",
            body: "විශ්ලේෂණ, දැන්දීම ප්‍රචාරණ, ක්‍රාෂ් වාර්තා වාර්තා කිරීම, ඇඟිල්ලේ මුද්ධන, A/B පරීක්ෂණ — යෙදුම තුළ කිසිවෙකුගේ සමඟ කතා කරන දෙයක් නැත.",
        },
        {
            title: "නොබැඳි ශබ්දකෝෂ",
            body: "ඉංග්‍රීසි සහ සිංහල ශබ්දකෝෂ එක් වරට බාගන්න ලද ඔබගේ දුරකථනයේ රැඳී ඇත. චාප ගමේ, ගිනි නිල්ලේ නොවේ ඔබට යෝජනා ක්‍රියා කරයි.",
        },
    ],
} as const;

/** Comparison table rows for the features page. */
export const comparison = {
    en: {
        headers: ["Feature", "CleanBoard", "Typical keyboard"],
        rows: [
            ["Internet permission", "None", "Often required"],
            ["Data collection", "None", "Analytics & crash logs"],
            ["Works fully offline", "Yes", "Often partial"],
            ["Singlish → සිංහල conversion", "Built in", "Rarely"],
            ["Sinhala layouts", "4 + Phonetic", "1–2"],
            ["Ad tracking", "None", "Common"],
            ["Price", "Free", "Free with ads"],
        ],
    },
    si: {
        headers: ["විශේෂත්වය", "CleanBoard", "සාමාන්‍ය යතුරුපුවරුව"],
        rows: [
            ["අන්තර්ජාල අනුමතය", "නැත", "නොතිරාත්තර අවශ්‍යයි"],
            ["දත්ත රැගෙන යාම", "නැත", "විශ්ලේෂණ සහ දෝෂ වාර්තා"],
            ["සම්පූර්ණයෙන්ම නොබැඳිය", "ඔව්", "නොපූර්ණයි"],
            ["Singlish → සිංහල පරිවර්තනය", "ඇතුළත්", "ඉතා දුර්ල"],
            ["සිංහල පිහිටුම්", "4 + Phonetic", "1–2"],
            ["දැන්දීම ප්‍රචාරණ", "නැත", "පොදුයි"],
            ["මිල", "නොමිලේ", "දැන්දීම සමඟ නොමිලේ"],
        ],
    },
} as const;
