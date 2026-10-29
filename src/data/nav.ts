/**
 * Site navigation. Each entry exists in both English and Sinhala so the
 * header can be rendered from either locale without duplicating markup.
 *
 * The Sinhala labels are code-mixed on purpose — that is how the site's
 * audience actually talks about keyboards and converters.
 */
export interface NavItem {
    /** Path relative to the site root, without the base path. */
    path: string;
    en: string;
    si: string;
}

export const navItems: NavItem[] = [
    { path: "/", en: "Home", si: "Home" },
    { path: "/transliterate/", en: "Transliterate", si: "Singlish → සිංහල" },
    { path: "/features/", en: "Features", si: "Features" },
    { path: "/download/", en: "Download", si: "Download" },
];

export const footerGroups = [
    {
        en: {
            title: "Product",
            links: [
                { path: "/features/", label: "Features" },
                { path: "/transliterate/", label: "English to Sinhala converter" },
                { path: "/download/", label: "Download for Android" },
            ],
        },
        si: {
            title: "Product",
            links: [
                { path: "/features/", label: "Features" },
                { path: "/transliterate/", label: "Singlish → සිංහල converter" },
                { path: "/download/", label: "Android එකට download" },
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
            title: "Legal",
            links: [
                { path: "/privacy-policy/", label: "Privacy Policy" },
                { path: "/terms-of-service/", label: "Terms of Service" },
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
                "Use the converter above: type English letters such as “kohomada hodai” and it is transliterated to සිංහල (කොහොමද හොඳයි) instantly in your browser. Nothing is uploaded — the conversion runs entirely on your device. The same engine powers CleanBoard, so installing the keyboard gives you this in any app.",
        },
        {
            question: "Is CleanBoard really offline?",
            answer:
                "The core keyboard is. Typing, transliteration, suggestions and the dictionaries work without a connection. GIFs, stickers, voice input and optional model or dictionary downloads use the internet, and each of those features is off until you enable it. The website converter is fully client-side.",
        },
        {
            question: "Does the app collect any data?",
            answer:
                "There is no analytics, crash-reporting or advertising SDK, and no account. Core typing stays on your device. When you use the optional GIF or sticker search, the request goes to Klipy; when you use voice input, audio is handled by your device's speech recognition service. CleanBoard does not receive or store either.",
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
            question: "CleanBoard මොකක්ද?",
            answer:
                "CleanBoard කියන්නේ Sinhala සහ English වලට හදපු free Android keyboard එකක්. Singlish engine එක built-in නිසා ඔයා English අකුරුවලින් type කරද්දීම ඒක සිංහලට convert වෙනවා.",
        },
        {
            question: "මේ website එකේ Sinhala type කරන්නේ කොහොමද?",
            answer:
                "උඩ තියෙන converter එක use කරන්න. “kohomada hodai” කියලා English අකුරුවලින් type කරන්න — ඒක ඔයාගේ browser එකේම කොහොමද හොඳයි විදිහට instantly convert වෙනවා. කිසිම දෙයක් upload වෙන්නේ නැහැ; conversion එක සම්පූර්ණයෙන්ම ඔයාගේ device එකේ වෙනවා. මේ engine එකම තමයි CleanBoard keyboard එකේ තියෙන්නේ — ඒක install කරාම ඕනම app එකක මේක ලැබෙනවා.",
        },
        {
            question: "CleanBoard ඇත්තටම offline ද?",
            answer:
                "Core keyboard එක ඔව්. Typing, conversion, suggestions සහ dictionaries internet නැතුව වැඩ කරනවා. GIFs, stickers, voice input සහ optional downloads internet use කරනවා — ඒවා ඔයා on කරනකම් off. Website converter එකත් සම්පූර්ණයෙන්ම ඔයාගේ browser එකේ වැඩ කරනවා.",
        },
        {
            question: "App එක data collect කරනවද?",
            answer:
                "Analytics, crash reports, ads හරි tracking SDKs හරි නැහැ. Account එකකුත් නැහැ. Core typing ඔයාගේ device එකේම තියෙනවා. Optional GIF/sticker search use කරද්දී request එක Klipy එකට යනවා; voice input use කරද්දී audio එක ඔයාගේ device එකේ speech recognition service එක handle කරනවා. CleanBoard ඒවා receive කරන්නේ නැහැ, store කරන්නේත් නැහැ.",
        },
        {
            question: "Sinhala layouts මොනවද තියෙන්නේ?",
            answer:
                "CleanBoard Classic, Wijesekara, Efficient සහ Google/Phonetic layouts තියෙනවා. ඒ එක්කම offline English සහ Sinhala dictionaries සහිත full Singlish mode එකක් තියෙනවා.",
        },
        {
            question: "CleanBoard free ද?",
            answer:
                "ඔව්, CleanBoard සම්පූර්ණයෙන්ම free. In-app purchases නැහැ, subscriptions නැහැ.",
        },
    ],
} as const;
