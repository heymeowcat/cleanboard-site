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
            body: "Type plain English letters and CleanBoard converts them to සිංහල as you type — with 400+ common words and phonetic variants handled for you.",
            icon: "keyboard",
        },
        {
            id: "offline",
            title: "Offline by default",
            body: "Typing, suggestions, transliteration and the bundled dictionaries work without a connection. Optional GIFs, stickers and voice are opt-in.",
            icon: "cloud-off",
        },
        {
            id: "privacy",
            title: "Private by design",
            body: "No analytics, ads, tracking or accounts. Internet and microphone access are used only by optional features you turn on; the keyboard itself stays local.",
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
            title: "ඇතුළත් Singlish එන්ජිම",
            body: "සරල ඉංග්‍රීසි අකුරු ලියන්න, CleanBoard ඒවා ඔබ ලියන විටම සිංහලට හරවයි — පොදු වචන 400කට වැඩි ගණනක් සහ ශබ්දානුකූල විකල්ප ඔබ වෙනුවෙන් හසුරුවයි.",
            icon: "keyboard",
        },
        {
            id: "offline",
            title: "පෙරනිමියෙන් නොබැඳි",
            body: "ටයිප් කිරීම, යෝජනා, පරිවර්තනය සහ ඇතුළත් ශබ්දකෝෂ සම්බන්ධතාවයක් නොමැතිව ක්‍රියා කරයි. GIF, ස්ටිකර් සහ හඬ ඔබ සක්‍රිය කරන තෙක් නිශ්චලය.",
            icon: "cloud-off",
        },
        {
            id: "privacy",
            title: "පෞද්ගලිකත්වය සැලසුමෙන්",
            body: "විශ්ලේෂණ, දැන්වීම්, ලුහුබැඳීම හෝ ගිණුම් නැත. අන්තර්ජාලය සහ මයික්‍රොෆෝනය භාවිත වන්නේ ඔබ සක්‍රිය කරන අමතර අංග සඳහා පමණි; යතුරුපුවරුවේ මූලික කටයුතු ඔබගේ උපකරණයේම සිදු වේ.",
            icon: "shield",
        },
        {
            id: "layouts",
            title: "සිංහල පිහිටුම් හතර",
            body: "CleanBoard Classic, විජේසේකර, Efficient සහ Google/Phonetic ආකෘති — සියල්ලම සම්පූර්ණ ස්වර සලකුණු සහ සංයුක්ත අකුරු සමඟ.",
            icon: "grid",
        },
        {
            id: "gestures",
            title: "අභිනයෙන් ටයිප් කිරීම",
            body: "මකීමට swipe කරන්න, අංක සහ සංකේත සඳහා flick කරන්න, spacebar එක cursor එකක් ලෙස භාවිත කරන්න. යෝජනා පෘ්තියේ වේගවත් ගණකයක් ඇත.",
            icon: "swipe",
        },
        {
            id: "custom",
            title: "ඔබගේ ආකාරයට සකසන්න",
            body: "අනුවර්තනය වන තේමා, ඔබට කැමති වර්ණ, Sparkle වැනි යතුරු-එබීම් ප්‍රයෝග සහ ඔබ පාලනය කරන පිහිටුම් සැකසුම්.",
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
            body: "CleanBoard යෙදුම තුළ ඇති එම එන්ජිම ඔබ ලියන සෑම වචනයක්ම හරවයි, දන්ත සහ මූර්ධන්‍ය අකුරු සඳහා ශබ්දානුකූල විකල්ප සමඟ.",
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
        "සම්පූර්ණයෙන්ම ඔබගේ බ්‍රවුසරය තුළම ක්‍රියා කරයි — ගිණුමක්, උඩුගැන්වීමක් හෝ ලුහුබැඳීමක් නැත",
        "CleanBoard ඇන්ඩ්‍රොයිඩ් යෙදුම තුළ ඇති එම එන්ජිමම භාවිත කරයි",
        "මහප්‍රාණ අකුරු (ඛ ඝ ඡ ඣ), ද්විත්ව අකුරු සහ ං අනුස්වරය නිවැරදිව හසුරුවයි",
        "විකල්ප අක්ෂර වින්‍යාස පෙන්වයි, ඔබට අවශ්‍ය එක තෝරා ගත හැක",
        "දුරකථන, ටැබ්ලට් සහ පරිගණකවල ක්‍රියා කරයි",
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
            body: "ඔබ අසන ශබ්දයට ගැලපෙන යතුරු පිහිටුම, එයින් පසු Singlish එන්ජිම ද ඇතුළත්.",
        },
    ],
} as const;

/** The three "privacy is a feature" pillars on the features page. */
export const privacyPillars = {
    en: [
        {
            title: "Offline by default",
            body: "The keyboard, suggestions and dictionaries work without a network. Optional GIF, sticker and voice features are off until you enable them.",
        },
        {
            title: "No tracking SDKs",
            body: "No analytics, advertising, crash-reporting or fingerprinting SDKs. Klipy is contacted only when you use the optional GIF or sticker search.",
        },
        {
            title: "Your data stays yours",
            body: "Your personal dictionary, clipboard history and learned words live on your device. Clipboard and learned-word history are excluded from Android backup.",
        },
    ],
    si: [
        {
            title: "පෙරනිමියෙන් නොබැඳි",
            body: "යතුරුපුවරුව, යෝජනා සහ ශබ්දකෝෂ ජාලයක් නොමැතිව ක්‍රියා කරයි. GIF, ස්ටිකර් සහ හඬ ඔබ සක්‍රිය කරන තෙක් නිශ්චලය.",
        },
        {
            title: "ලුහුබැඳීම් SDK නැත",
            body: "විශ්ලේෂණ, දැන්වීම්, දෝෂ වාර්තා හෝ ඇඟිලි සලකුණු කිරීමේ SDK නැත. Klipy සම්බන්ධ වන්නේ ඔබ අමතර GIF හෝ ස්ටිකර් සෙවීම භාවිත කරන විට පමණි.",
        },
        {
            title: "ඔබගේ දත්ත ඔබ සතුයි",
            body: "ඔබගේ පුද්ගලික ශබ්දකෝෂය, පසුරු පුවරු ඉතිහාසය සහ ඉගෙන ගත් වචන ඔබගේ උපකරණයේ රැඳී ඇත. පසුරු පුවරු සහ ඉගෙන ගත් ඉතිහාසය Android උපස්ථයෙන් බැහැර කර ඇත.",
        },
    ],
} as const;

/** Comparison table rows for the features page. */
export const comparison = {
    en: {
        headers: ["Feature", "CleanBoard", "Typical keyboard"],
        rows: [
            ["Internet access", "Only for opt-in features", "Often required"],
            ["Data collection", "None", "Analytics & crash logs"],
            ["Core typing offline", "Yes", "Often partial"],
            ["Singlish → සිංහල conversion", "Built in", "Rarely"],
            ["Sinhala layouts", "4 + Phonetic", "1–2"],
            ["Ad tracking", "None", "Common"],
            ["Price", "Free", "Free with ads"],
        ],
    },
    si: {
        headers: ["විශේෂත්වය", "CleanBoard", "සාමාන්‍ය යතුරුපුවරුව"],
        rows: [
            ["අන්තර්ජාල ප්‍රවේශය", "ඔප්ට්-ඉන් අංග සඳහා පමණි", "බොහෝ විට අවශ්‍යයි"],
            ["දත්ත රැගෙන යාම", "නැත", "විශ්ලේෂණ සහ දෝෂ වාර්තා"],
            ["මූලික ටයිප් කිරීම නොබැඳිව", "ඔව්", "බොහෝ විට අර්ධ"],
            ["Singlish → සිංහල පරිවර්තනය", "ඇතුළත්", "දුර්ලභ"],
            ["සිංහල පිහිටුම්", "4 + Phonetic", "1–2"],
            ["දැන්වීම් ලුහුබැඳීම", "නැත", "සාමාන්‍යයි"],
            ["මිල", "නොමිලේ", "දැන්වීම් සමඟ නොමිලේ"],
        ],
    },
} as const;
