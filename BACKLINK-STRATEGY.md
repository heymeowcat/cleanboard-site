# Backlink strategy — CleanBoard

A practical plan for earning links to `https://heymeowcat.is-a.dev/cleanboard-site/`.

The premise: **the converter is the link magnet.** A free, fast, offline
English → Sinhala transliteration tool is exactly the kind of page people
link to from blogs, forums, university pages, documentation sites and
newsletters — because it solves a problem their readers have and they cannot
host themselves.

Everything below is designed to make linking to us *easy, useful and
reciprocal*.

---

## 1. The linkable assets

These pages exist to be linked to. Each one is genuinely useful on its own,
so a link is worth making rather than just tolerated.

| Asset | URL | Who links to it |
|---|---|---|
| English → Sinhala converter | `/transliterate/` | Bloggers, Sinhala language teachers, students, expat guides, translation freelancers |
| Sinhala transliteration chart | `/transliteration-chart/` | Wikipedia-style references, language guides, Stack Exchange answers, printable references |
| Feature page | `/features/` | Review sites, "best Android keyboards" roundups, privacy-tool directories |
| Download page | `/download/` | App roundups, tutorials, "how to type Sinhala" guides |
| Home (with the tool embedded) | `/` | General mentions, press, GitHub README |

### Why the chart is the sleeper hit

`/transliteration-chart/` is a **reference page** — a table of every letter
mapping. Reference pages earn links passively for years because people cite
them. It has:

- a stable, self-describing URL
- real, crawlable content (not an image)
- `<h2>` sections for every table, so it can be deep-linked to an anchor
- JSON-LD and internal links to the converter

**Do this:** every time you write about Sinhala anywhere — a forum answer, a
Reddit comment, a Stack Overflow answer, a Wikipedia talk page — link to the
chart, not the homepage. Link to the deepest relevant page.

---

## 2. On-site link equity

Already in place, keep it that way:

- The header nav links to every page from every page.
- The footer repeats the important links with keyword-rich anchor text
  ("English to Sinhala converter", "Transliteration chart").
- The chart page links to the converter and the download page.
- The converter page links to the chart, the features page and the download
  page.
- The homepage embeds the converter and links to the dedicated page.

**Rule:** every page must be reachable within one click of every other page,
and every page must link *down* to the converter and the Play Store listing.
Anchor text should be descriptive and varied — never "click here".

---

## 3. Outreach targets

### Tier 1 — high relevance, low effort (do these first)

| Target | Why | Action |
|---|---|---|
| Sinhala language blogs & YouTube channels | Their readers type in English letters daily | Offer the converter as a free tool for their readers; offer a guest post on Sinhala typing |
| Sinhala subreddits / Facebook groups | Huge volume of people who type Singlish | Post the tool as a genuinely useful freebie, not spam. Answer questions and link only when it helps |
| University / school IT pages in Sri Lanka | Students and staff need Sinhala keyboards | Offer a "how to type Sinhala on Android" guide with the chart embedded |
| GitHub repositories about Sinhala NLP, romanization, transliteration | The maintainers are the technical audience | Open a PR or issue: "we built a web version of the standard rules — here is the chart, may be useful for your docs" |
| Wikipedia / Wikiwand Sinhala articles | They often link to transliteration references | Suggest the chart as a reference for the romanization section |
| Stack Exchange (English Language, Travel, Software) | "How do I type Sinhala?" questions | Answer with the tool and the chart |

### Tier 2 — directories and roundups (slow, compounding)

- Privacy-friendly app directories (the "no internet permission" angle is the hook)
- "Best Android keyboards" listicles
- Sinhala software / app directories
- Open-source app collections
- AlternativeTo entries

### Tier 3 — content that earns links passively

Publish genuinely linkable content **on the site**, then seed it:

1. **"Sinhala keyboard layouts compared: Classic, Wijesekara, Efficient and Phonetic"** — a table people will cite.
2. **"How Sinhala typing works: a beginner's guide to Singlish"** — the educational version of the chart.
3. **"Why we built a keyboard that cannot phone home"** — a privacy story, which travels well on Hacker News, Reddit and indie blogs.
4. **A printable A4 PDF of the transliteration chart** — hosted on the site and linked from the chart page. Printable references get linked from forums and tutorials.
5. **A short GIF/animated demo** of typing "kohomada hodai" and getting කොහොමද හොඳයි — embeddable in any tutorial.

---

## 4. The outreach template that works

```
Subject: Free offline English → Sinhala converter for your readers

Hi <name>,

I built a small web tool that converts English (Singlish) text to Sinhala
සිංහල as you type:

https://heymeowcat.is-a.dev/cleanboard-site/transliterate/

It runs entirely in the browser, so nothing is uploaded and it works
offline. It uses the same engine as CleanBoard, a free Android keyboard
that does not request the Internet permission.

If it would be useful for your readers, feel free to link to it or embed
it — no permission needed. There is also a reference chart with every
letter mapping here:

https://heymeowcat.is-a.dev/cleanboard-site/transliteration-chart/

Either way, thanks for the work you put in.

<name>
```

Send it to sites where the tool genuinely fits. Do not mass-send.

---

## 5. Channels beyond links

Links are one signal. These drive the same traffic and reinforce each other:

- **GitHub** — put the live converter link at the top of the CleanBoard
  repository README, and in the repo's "About" and social preview. Every
  star and fork can carry a link.
- **The Play Store listing** — put the converter URL in the app description
  and the website field. This is the single highest-value link you control,
  and it points from the world's biggest app store to the site.
- **YouTube** — a 60-second screen recording of the converter, with the URL
  in the description. Videos rank and convert to clicks.
- **Social** — a short demo clip, posted with the URL in the post and the
  first comment.
- **Communities** — answer Singlish questions on Stack Overflow, Reddit,
  Quora, and Sinhala forums. Be a helpful participant for a few weeks
  *before* you ever link anything.

---

## 6. Tracking

Add these to a spreadsheet:

| Date | Target | Page linked | Anchor text | Contact | Status | Live URL | Follow-up date |
|---|---|---|---|---|---|---|---|

Also monitor with:

- Google Search Console → **Links** report (the "External links" tab)
- Google Search Console → **Performance** → filter by page
- Bing Webmaster Tools → **Links**
- Ahrefs / Semrush / Moz free tiers → ** referring domains for the domain
- `curl -sL <url> | grep -i cleanboard` in a monthly sweep of your outreach list

---

## 7. Rules that keep this legitimate

1. **No paid link schemes** and no `rel="sponsored"` links sold as organic.
   If you ever pay for a placement, tag it `rel="sponsored"`.
2. **No link exchanges with unrelated sites** — a Sinhala keyboard linking
   to a random blog helps nobody and Google ignores it.
3. **No comment or forum spam.** A link dropped into a comment section is
   worth nothing and costs reputation.
4. **Every link you earn should be to a page a reader would find useful.**
   If the anchor text has to be awkward to fit, the placement is wrong.
5. **Do not build a private blog network.** PBN links are the fastest way to
   get a manual action.

---

## 8. First 30 days — the actual checklist

- [ ] Add the converter link to the **Play Store listing** description and
      website field. *(Highest ROI — do this on day one.)*
- [ ] Add the converter + chart links to the **GitHub README** of the
      CleanBoard repository and the `heymeowcat.github.io` site.
- [ ] Add the chart link to the **Wikipedia Sinhala** article's references
      or its talk page, and to the **Wiktionary** / **Wikipedia** romanization
      discussion pages.
- [ ] Publish the **printable chart PDF** and link it from the chart page.
- [ ] Record and publish the **60-second demo video**.
- [ ] Answer **10 questions** across Stack Exchange, Reddit and Sinhala
      forums with genuinely helpful answers — link only where it fits.
- [ ] Contact **10 Sinhala-language YouTubers/bloggers** with the outreach
      template above.
- [ ] Submit to **5 app directories** that focus on privacy-respecting or
      open-source software.
- [ ] Open **3 GitHub issues/PRs** on Sinhala romanization projects offering
      the chart as a reference.
- [ ] Set up **Search Console** and the **Bing Webmaster Tools** account, and
      submit the sitemap (see `README.md` for the exact steps).
