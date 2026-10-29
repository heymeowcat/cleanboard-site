/**
 * JSON-LD schema builders.
 *
 * Every page gets one or more of these. They are emitted as
 * `application/ld+json` script tags in the document head.
 */

import {
  BASE_PATH,
  CONTACT_EMAIL,
  GITHUB_URL,
  LOCALE,
  PLAY_STORE_ID,
  PLAY_STORE_URL,
  SITE_NAME,
  SITE_URL,
} from "./site";

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const APP_ID = `${SITE_URL}/#softwareapplication`;

/** The publisher / author entity used across every schema. */
export function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/cleanboard-logo.png`,
      width: 512,
      height: 512,
    },
    email: CONTACT_EMAIL,
    sameAs: [GITHUB_URL],
  };
}

/** The site-level search + navigation entity. */
export function webSiteSchema() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: SITE_NAME,
    description: "Sinhala & English keyboard for Android, plus a free English to Sinhala transliteration tool.",
    inLanguage: "en",
    publisher: { "@id": ORG_ID },
  };
}

/** The app itself — a SoftwareApplication with an install URL. */
export function softwareApplicationSchema(
  overrides: Record<string, unknown> = {},
) {
  return {
    "@type": "SoftwareApplication",
    "@id": APP_ID,
    name: SITE_NAME,
    alternateName: "CleanBoard Sinhala Keyboard",
    description:
      "A free, privacy-first Android keyboard for Sinhala and English with a built-in Singlish transliteration engine.",
    url: `${SITE_URL}/`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Android",
    softwareVersion: "1.0",
    downloadUrl: PLAY_STORE_URL,
    installUrl: PLAY_STORE_URL,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    permissions: ["INTERNET", "RECORD_AUDIO"],
    featureList: [
      "Sinhala Classic, Wijesekara, Efficient and Phonetic layouts",
      "Singlish (English to Sinhala) transliteration",
      "Core typing, suggestions and dictionaries work offline",
      "No ads, no tracking and no data collection",
      "Optional GIF, sticker and voice features are off by default",
      "Gesture typing and swipe to delete",
      "Inline calculator and time/date shortcuts",
    ],
    screenshot: `${SITE_URL}/og-image.png`,
    ...overrides,
  };
}

/** The transliteration converter, described as a WebApplication. */
export function webApplicationSchema(overrides: Record<string, unknown> = {}) {
  return {
    "@type": "WebApplication",
    "@id": `${SITE_URL}/#webapp`,
    name: "CleanBoard English to Sinhala Transliterator",
    url: `${SITE_URL}/transliterate/`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any modern web browser",
    browserRequirements: "Requires JavaScript",
    description:
      "A live browser demo of the CleanBoard keyboard's English (Singlish) to Sinhala engine. Type English letters and get සිංහල instantly, on-device.",
    inLanguage: "en",
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    publisher: { "@id": ORG_ID },
    ...overrides,
  };
}

/** FAQPage — only emit this when the page actually shows the questions. */
export function faqSchema(
  items: Array<{ question: string; answer: string }>,
) {
  return {
    "@type": "FAQPage",
    "@id": `${SITE_URL}/#faq`,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

/** BreadcrumbList for sub-pages. */
export function breadcrumbSchema(
  items: Array<{ name: string; path: string }>,
) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${SITE_URL}/#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path.startsWith("/") ? item.path : `/${item.path}`}`,
    })),
  };
}

/** HowTo — used on the download page for the install steps. */
export function howToSchema(
  name: string,
  description: string,
  steps: Array<{ name: string; text: string }>,
) {
  return {
    "@type": "HowTo",
    name,
    description,
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
}

export { ORG_ID, WEBSITE_ID, APP_ID, PLAY_STORE_ID, PLAY_STORE_URL, LOCALE, BASE_PATH };
