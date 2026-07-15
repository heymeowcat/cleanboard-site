/**
 * Site navigation. Each entry exists in both English and Sinhala so the
 * header can be rendered from either locale without duplicating markup.
 */
export interface NavItem {
    /** Path relative to the site root, without the base path. */
    path: string;
    en: string;
    si: string;
}

export const navItems: NavItem[] = [
    { path: "/", en: "Home", si: "මුල් පිටුව" },
    { path: "/transliterate/", en: "Transliterate", si: "අකුරු පරිවර්තනය" },
    { path: "/features/", en: "Features", si: "විශේෂ ලක්ෂණ" },
    { path: "/transliteration-chart/", en: "Chart", si: "චාර්ටය" },
    { path: "/download/", en: "Download", si: "බාගන්න" },
];

export const footerGroups = [
    {
        en: {
            title: "Product",
            links: [
                { path: "/features/", label: "Features" },
                { path: "/transliterate/", label: "English to Sinhala converter" },
                { path: "/transliteration-chart/", label: "Transliteration chart" },
                { path: "/download/", label: "Download for Android" },
            ],
        },
        si: {
            title: "නිෂතය",
            links: [
                { path: "/features/", label: "විශේෂ ලක්ෂණ" },
                { path: "/transliterate/", label: "ඉංග්‍රීසි සිට සිංහල අකුරු පරිවර්තනය" },
                { path: "/transliteration-chart/", label: "අකුරු පරිවර්තන චාර්ටය" },
                { path: "/download/", label: "ඇන්ඩ්‍රොයිඩ් සඳහා බාගන්න" },
            ],
        },
    },
    {
        en: {
            title: "Legal",
            links: [
                { path: "/privacy-policy/", label: "Privacy Policy" },
                { path: "/terms-of-service/", label: "Terms of Service" },
            ],
        },
        si: {
            title: "නීතිමය",
            links: [
                { path: "/privacy-policy/", label: "පෞද්ගලිකත්ව ප්‍රතිපත්තිය" },
                { path: "/terms-of-service/", label: "සේවා කොන්දේසි" },
            ],
        },
    },
];

/** FAQ entries, reused by the FAQ schema and the visible accordion. */
export const faqs = {
    en: [
        {
            question: "What is CleanBoard?",
            answer:
                "CleanBoard is a free Android keyboard for Sinhala and English. It ships with a Singlish engine, so you type in plain English letters and it converts them to සිංහල as you type.",
        },
        {
            question: "How do I type Sinhala on this website?",
            answer:
                "Use the converter above: type English letters such as “kohomada hodai” and it is transliterated to සිංහල (කොහොමද හොඳයි) instantly in your browser. Nothing is uploaded — the conversion runs entirely on your device.",
        },
        {
            question: "Is CleanBoard really offline?",
            answer:
                "Yes. The Android app does not request the INTERNET permission, so it is technically incapable of sending your keystrokes anywhere. The website converter is also fully client-side.",
        },
        {
            question: "Does the app collect any data?",
            answer:
                "No. There is no analytics, no crash-reporting SDK and no advertising SDK. All processing happens on your device.",
        },
        {
            question: "Which Sinhala layouts are supported?",
            answer:
                "CleanBoard Classic, Wijesekara, Efficient and Google/Phonetic style layouts, plus a full Singlish mode with offline English and Sinhala dictionaries.",
        },
        {
            question: "Is CleanBoard free?",
            answer:
                "Yes, CleanBoard is completely free with no in-app purchases and no subscriptions.",
        },
    ],
    si: [
        {
            question: "CleanBoard කුමක්ද?",
            answer:
                "CleanBoard යනු සිංහල සහ ඉංග්‍රීසි භාෂාවලට නිදහස් ඇන්ඩ්‍රොයිඩ් යතුරුපුවරුවකි. Singlish එංජිනය ඇති නිසා, ඔබ සරල ඉංග්‍රීසි අකුරු ලියන විට ඒවා ස්වයංක්‍රීයව සිංහලට හරවනු ලැබේ.",
        },
        {
            question: "මෙම වෙබි අඩවියේ සිංහල ලියන්නේ කොහොමද?",
            answer:
                "ඉහත ඇති පරිවර්තකය භාවිත කරන්න: “kohomada hodai” යන ඉංග්‍රීසි අකුරු ලියන්න, ඒවා ඔබගේ බ්‍රවුසරය තුළම සිංහලට (කොහොමද හොඳයි) ස්වයංක්‍රීයව පරිවර්තනය වේ. කිසිදු දත්තයක් උඩුගානගනු ලැබේ.",
        },
        {
            question: "CleanBoard ඇත්තටම නොබැඳිද?",
            answer:
                "ඔව්. ඇන්ඩ්‍රොයිඩ් යෙදුම INTERNET අනුමතය ඉල්ලන්නේ නැත, එබැවින් එය ඔබගේ අකුරු ගලවන කිසිදු තැනකට යැමීමට නොහැකි ලෙස තිබේ.",
        },
        {
            question: "යෙදුම දත්ත රැගෙන යනවාද?",
            answer:
                "නැත. ස්ථානීය විශ්ලේෂණ, ක්‍රාෂ් වාර්තා හෝ දැන්දීම ප්‍රචාරණ යෙදුම් නොමැත. සියලු ක්‍රියා ඔබගේ දුරකථනය තුළම සිදු වේ.",
        },
        {
            question: "කුමක් හරි සිංහල පිහිටුම් මොනවාද?",
            answer:
                "CleanBoard Classic, විජේසේකර, Efficient සහ Google/Phonetic ආකෘති, මෙන්ම නොබැඳි ඉංග්‍රීසි සහ සිංහල ශබ්දකෝෂ සහිත සම්පූර්ණ Singlish ක්‍රමය ඇතුළත් වේ.",
        },
        {
            question: "CleanBoard නොමිලේ ද?",
            answer:
                "ඔව්, CleanBoard සම්පූර්ණයෙන්ම නොමිලේ වේ. යෙදුම් තුළ මිල ගණන් ගැනීම් හෝ දිගුකාලීන දියත්තු නොමැත.",
        },
    ],
} as const;
