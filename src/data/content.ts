/**
 * Editorial content for the marketing pages, in both languages.
 *
 * Keeping the copy in one place makes the English/Sinhala pages easy to keep
 * in sync and lets the schema builders reuse the exact same strings.
 *
 * The Sinhala copy is deliberately code-mixed: Sinhala speakers say
 * "keyboard", "offline" and "privacy" in English in everyday speech, so the
 * page reads naturally instead of sounding like a formal textbook.
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
            title: "Singlish engine එක built-in",
            body: "English අකුරුවලින් type කරන්න, CleanBoard ඒක ඔයා type කරන ගමන්ම සිංහලට හරවනවා — common words 400කට වැඩි ගණනක් සහ phonetic variants handle කරනවා.",
            icon: "keyboard",
        },
        {
            id: "offline",
            title: "Offline by default",
            body: "Typing, suggestions, conversion සහ bundled dictionaries internet නැතුව වැඩ කරනවා. GIFs, stickers සහ voice ඔයා on කරනකම් off.",
            icon: "cloud-off",
        },
        {
            id: "privacy",
            title: "Privacy first",
            body: "Analytics, ads, tracking හරි accounts හරි නැහැ. Internet සහ microphone use වෙන්නේ ඔයා on කරන optional features වලට විතරයි — keyboard එකේ core වැඩ ඔයාගේ device එකේම.",
            icon: "shield",
        },
        {
            id: "layouts",
            title: "Sinhala layouts 4ක්",
            body: "CleanBoard Classic, Wijesekara, Efficient සහ Google/Phonetic — හැම layout එකකම full vowel signs සහ conjuncts support කරනවා.",
            icon: "grid",
        },
        {
            id: "gestures",
            title: "Gesture typing",
            body: "Delete කරන්න swipe කරන්න, numbers සහ symbols වලට flick කරන්න, spacebar එක cursor එක විදිහට use කරන්න. Suggestions bar එකේ fast calculator එකකුත් තියෙනවා.",
            icon: "swipe",
        },
        {
            id: "custom",
            title: "ඔයාගේ style එකට",
            body: "Adaptive themes, custom accent colours, Sparkle වගේ key-press effects සහ layout එකට වෙන වෙනම settings.",
            icon: "sparkles",
        },
    ],
} satisfies Record<string, Feature[]>;

/** The "how it works" steps shown on the homepage and the transliterate page. */
export const steps = {
    en: [
        {
            title: "Type in English letters",
            body: "Open the converter and type the way you would type a message — “kohomada hodai”.",
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
            title: "English අකුරුවලින් type කරන්න",
            body: "Converter එක open කරලා message එකක් type කරන විදිහටම type කරන්න — “kohomada hodai”.",
        },
        {
            title: "සිංහල instantly ලැබෙන්න",
            body: "CleanBoard app එකේ තියෙන එකම engine එක ඔයා type කරන හැම word එකක්ම convert කරනවා — dental සහ retroflex consonants වලට phonetic alternatives එක්ක.",
        },
        {
            title: "Copy කරන්න, නැත්නම් keyboard එක use කරන්න",
            body: "සිංහල text එක ඕනම තැනකට copy කරන්න, නැත්නම් CleanBoard install කරලා phone එකේ ඕනම app එකක type කරද්දී ඒ conversion එකම ගන්න.",
        },
    ],
};

/**
 * Short bullet list under the homepage converter. This is the website's demo
 * of the keyboard engine, so every point leads back to the Android app.
 */
export const benefits = {
    en: [
        "This is the same engine that runs inside the CleanBoard Android keyboard — not a cut-down demo",
        "Install the keyboard and the conversion works in WhatsApp, Messages, email and any other app",
        "No copy and paste: on your phone, සිංහල appears in the text field as you type",
        "Both run entirely on your device — nothing you type is uploaded",
        "The app adds four Sinhala layouts, suggestions and offline dictionaries",
    ],
    si: [
        "මේක CleanBoard Android keyboard එකේ තියෙන ඇත්තම engine එක — cut-down demo එකක් නෙවෙයි",
        "Keyboard එක install කරාම WhatsApp, Messages, email — ඕනම app එකක මේ conversion එකම ලැබෙනවා",
        "Copy-paste ඕන නැහැ: phone එකේ type කරන ගමන්ම සිංහල text field එකේ පේනවා",
        "දෙකේම වැඩ කරන්නේ ඔයාගේ device එකේ — type කරන දේ කොහෙවත් upload වෙන්නේ නැහැ",
        "App එකේ තව Sinhala layouts 4ක්, suggestions සහ offline dictionaries තියෙනවා",
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
            body: "Default layout එක — standard Sinhala alphabet එකට tune කරලා, commonly use කරන conjuncts ඔයාගේ thumb එකට natural විදිහට තියෙනවා.",
        },
        {
            name: "Wijesekara",
            body: "Traditional Wijesekara arrangement එක — සාම්ප්‍රදායික Sinhala keyboard එකෙන් type කරන්න පුරුදු වුණු අයට.",
        },
        {
            name: "Efficient",
            body: "Small screen එකක වැඩි keys fit වෙන compact layout එකක් — phone එකෙන් ගොඩක් type කරන අයට.",
        },
        {
            name: "Google / Phonetic",
            body: "හුරුපුරුදු phonetic layout එක — ඔයා ඔබන key එක ඔයා අහන sound එකට match වෙනවා. ඒ එක්කම full Singlish engine එක.",
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
            title: "Offline by default",
            body: "Keyboard, suggestions සහ dictionaries network එකක් නැතුව වැඩ කරනවා. Optional GIF, sticker සහ voice features ඔයා on කරනකම් off.",
        },
        {
            title: "Tracking SDKs නැහැ",
            body: "Analytics, ads, crash-reporting හරි fingerprinting SDKs හරි නැහැ. Klipy contact කරන්නේ ඔයා optional GIF/sticker search use කරද්දී විතරයි.",
        },
        {
            title: "ඔයාගේ data ඔයාගේමයි",
            body: "ඔයාගේ personal dictionary, clipboard history සහ learned words ඔයාගේ device එකේ තියෙනවා. Clipboard සහ learned-word history Android backup එකෙන් exclude කරලා.",
        },
    ],
} as const;

/** Comparison table rows for the home and features pages. */
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
        headers: ["Feature", "CleanBoard", "සාමාන්‍ය keyboard"],
        rows: [
            ["Internet access", "Optional features වලට විතරයි", "බොහෝ විට අවශ්‍ය"],
            ["Data collection", "නැහැ", "Analytics සහ crash logs"],
            ["Core typing offline", "ඔව්", "බොහෝ විට partial"],
            ["Singlish → සිංහල", "Built-in", "Rarely"],
            ["Sinhala layouts", "4 + Phonetic", "1–2"],
            ["Ad tracking", "නැහැ", "Common"],
            ["Price", "Free", "Ads එක්ක free"],
        ],
    },
} as const;

/** Install steps used by the download page and its HowTo schema. */
export const installSteps = {
    en: [
        {
            name: "Install CleanBoard",
            text: "Open the CleanBoard listing on Google Play and tap Install. It is free, with no ads and no in-app purchases.",
        },
        {
            name: "Enable it in Android settings",
            text: "Go to Settings → System → Languages & input → On-screen keyboard, then choose CleanBoard from the installed keyboards.",
        },
        {
            name: "Set it as your default",
            text: "Tap the gear icon next to CleanBoard and switch on the layouts you want. The globe key switches between them while you type.",
        },
        {
            name: "Type Sinhala",
            text: "Choose the Singlish or Phonetic layout and type plain English letters. CleanBoard converts them to සිංහල as you type, using the same engine you can try on this site.",
        },
    ],
    si: [
        {
            name: "CleanBoard install කරන්න",
            text: "Google Play එකේ CleanBoard page එක open කරලා Install tap කරන්න. App එක free — ads නැහැ, in-app purchases නැහැ.",
        },
        {
            name: "Android settings වල enable කරන්න",
            text: "Settings → System → Languages & input → On-screen keyboard වලට ගිහින් installed keyboards list එකෙන් CleanBoard තෝරන්න.",
        },
        {
            name: "Default keyboard එක කරන්න",
            text: "CleanBoard එක ළඟ තියෙන gear icon එක tap කරලා ඔයාට ඕන layouts වල switches on කරන්න. Type කරද්දී globe key එකෙන් ඒවා අතර switch වෙන්න පුළුවන්.",
        },
        {
            name: "සිංහල type කරන්න",
            text: "Singlish හරි Phonetic layout එකට switch වෙලා English අකුරුවලින් type කරන්න. CleanBoard ඒවා ඔයා type කරන ගමන්ම සිංහලට හරවනවා — මේ site එකේ try කරන්න පුළුවන් එකම engine එකෙන්.",
        },
    ],
} as const;

/** Requirements listed under the install steps. */
export const requirements = {
    en: [
        {
            strong: "Android 7.0 (API 24) or newer.",
            body: "Most phones in use today run Android 11 or later.",
        },
        {
            strong: "A Google account is not required",
            body: "A Play Store account is only needed to download the app from the store.",
        },
        {
            strong: "Offline typing and dictionaries",
            body: "Optional GIFs, stickers and voice use the internet only after you enable them.",
        },
    ],
    si: [
        {
            strong: "Android 7.0 (API 24) හරි ඊට අලුත් එකක්.",
            body: "දැන් use කරන ගොඩක් phones Android 11 හරි ඊට අලුත් version එකක් run කරනවා.",
        },
        {
            strong: "Google account එකක් අවශ්‍ය නැහැ",
            body: "Play Store එකෙන් download කරන්න විතරයි Play Store account එකක් ඕන.",
        },
        {
            strong: "Offline typing සහ dictionaries",
            body: "Optional GIFs, stickers සහ voice ඔයා enable කරන පස්සේ විතරයි internet use කරන්නේ.",
        },
    ],
} as const;
