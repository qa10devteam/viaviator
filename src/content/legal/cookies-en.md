---
title: "Via Viator Cookie Policy"
locale: "en"
version: "1.0"
publishedAt: "2026-05-31"
summary: "Full list of cookies and similar technologies used on viaviator.pl. What we use by default, what we need consent for, how you manage your choices."
---

## 1. What cookies are

Cookies are small text files saved by a web browser on a user's device when visiting a website. They typically contain the name of the originating site, a unique identifier, a retention period and a value. Cookies allow websites to "remember" certain information between visits (e.g. the selected language) and are widely used across the internet.

Alongside cookies, similar technologies include in particular:

- **localStorage** and **sessionStorage** — browser data stores, similar to cookies, but not automatically sent to the server with every request. localStorage is persistent (until cleared by the user or site), sessionStorage is cleared when the tab is closed.
- **IndexedDB** — an in-browser database for larger data sets. We do not use it.
- **Web beacons / tracking pixels** — tiny elements (e.g. a 1×1 px image) used to track impressions. We do not use them.

This Cookie Policy describes which of these technologies are used on the **viaviator.pl** website (the "Website") and how you can manage them.

This Cookie Policy supplements the [Privacy Policy](/en/privacy-policy) — the full context of personal data processing, legal bases and your rights is provided there.

## 2. Categories of technologies used on viaviator.pl

On viaviator.pl we use **only strictly necessary** technologies for the Website to operate and — **only upon your explicit consent** — a privacy-respecting analytics tool.

### 2.1. Strictly necessary (always active — no consent required)

Saved automatically because they are required for the proper functioning of the Website and for delivering the information society service you have explicitly requested (Article 173(3) of the Polish Telecommunications Act of 16 July 2004; Article 5(3) of Directive 2002/58/EC — the "ePrivacy Directive").

| Name | Provider | Technology | Retention | Purpose |
|------|----------|------------|-----------|---------|
| `vv:consent:v1` | Via Viator (first party) | localStorage | 12 months or until browser data is cleared | Remembering your choices in the consent manager (consent or refusal for cookie categories). Without this entry the consent banner would appear on every visit. |
| `vv:locale` | Via Viator (first party) | localStorage | 12 months or until browser data is cleared | Remembering language preference (PL / EN) if you used the language switcher. Optional — set only if you switch language manually. |

**Why we don't ask for consent:** under Article 173(3) of the Polish Telecommunications Act (implementing Article 5(3) of Directive 2002/58/EC), consent is not required for cookies strictly necessary for the transmission of, or the provision of, a service explicitly requested by the user. `vv:consent:v1` is necessary to fulfil the user's request related to consent management; `vv:locale` is necessary to maintain the chosen language preference.

### 2.2. Analytics (consent required)

Upon expressing consent in the cookie banner, we activate the **Plausible Analytics** tool. Plausible is a deliberately privacy-first project — built as an alternative to tools such as Google Analytics, which are more invasive to user privacy.

**Plausible Analytics characteristics on viaviator.pl:**

- **Does not use cookies** or other persistent device identifiers.
- **Does not collect identifiable IP addresses** — the IP address is hashed immediately and discarded.
- **Does not build user profiles** — does not track an individual user's path across sessions.
- **Does not share data with third parties** for advertising purposes.
- All infrastructure is located **in Germany** (Hetzner Online GmbH) — no transfer outside the EEA.
- The analytics script is loaded from the `plausible.io` domain — provider: Plausible Insights OÜ, Estonia.

**What Plausible collects:** aggregated, anonymised data — entry country, device type (mobile/desktop), traffic source (e.g. "direct", "google.com", "facebook.com"), number of subpage visits, time on subpage. All **in a form that does not identify a specific person**.

| Name | Provider | Technology | Retention | Purpose |
|------|----------|------------|-----------|---------|
| (none — Plausible does not use cookies) | Plausible Insights OÜ (Estonia / Germany) | JavaScript loaded from `plausible.io` after consent | Aggregated data retained for up to 24 months on Plausible's side (no person identification) | Website traffic statistics — how many people, where from, what they read. No profiling. |

**Legal basis:** Article 6(1)(a) GDPR — your consent; Article 173(1) of the Polish Telecommunications Act — consent for the use of information stored on the terminal device (although Plausible does not store information on the device — we ask for consent out of caution and full transparency).

### 2.3. Marketing (none)

**We do not place by default any marketing cookies, tracking pixels, social-media trackers or external advertising scripts.**

Specifically — on viaviator.pl we **do not load**:

- Google Analytics, Google Ads, Google Tag Manager (reserved for optional opt-in deployment, currently inactive).
- Facebook Pixel, Meta Pixel.
- LinkedIn Insight Tag.
- TikTok Pixel.
- Hotjar, Microsoft Clarity, FullStory or other session-recording tools.
- Affiliate network advertising scripts.

In the future, if Via Viator decides to expand marketing activities (e.g. implement remarketing on opt-in basis), we will update this Cookie Policy and ask you for fresh consent — with an option to refuse without losing Website functionality.

## 3. Summary table

| Category | Name / provider | Technology | Retention | Purpose | Consent required? |
|----------|------------------|------------|-----------|---------|--------------------|
| Necessary | `vv:consent:v1` — Via Viator | localStorage | 12 months | Remembering consent manager choices | No (Art. 173(3) PL Telecoms Act) |
| Necessary | `vv:locale` — Via Viator | localStorage | 12 months | Language preference PL/EN | No (Art. 173(3) PL Telecoms Act) |
| Analytics | Plausible Analytics | JS script (no cookies) | n/a (no cookies); aggregated data up to 24 months | Traffic statistics, no profiling | Yes (Art. 6(1)(a) GDPR) |
| Marketing | none | — | — | — | n/a |

## 4. How to manage your consent

### 4.1. Cookie banner on first visit

On your first visit to viaviator.pl you will see a cookie banner with three options:

1. **"Accept all"** — you consent to activating Plausible Analytics (and any future categories that may appear after a Policy update).
2. **"Necessary only"** — Plausible Analytics will not activate. The Website works normally.
3. **"Settings"** — you may choose categories individually. Currently available categories are only "Necessary" (always on, cannot be deselected) and "Analytics" (optional). The "Marketing" category is visible in the UI for full transparency but is currently empty — no script will load regardless of your choice in this category.

Your choice is stored in `vv:consent:v1` (localStorage). The banner will not appear again until:

- you clear browser data for the viaviator.pl domain,
- the version of the consent manager changes (e.g. a new category is added — the banner will reappear to ask for a fresh decision),
- you open "Cookie settings" yourself via the link in the footer.

### 4.2. Changing your choice at any time

In the Website footer you will find a **"Manage consents"** link — clicking it opens the consent manager with current settings. You can deselect any previously accepted category (except necessary). Once you save new settings:

- if you withdraw consent for analytics — Plausible will stop loading on subsequent visits,
- if you previously declined and just granted consent — Plausible will start loading from the next page load.

### 4.3. Reset from the browser

Independently of the Via Viator consent manager, you can manage cookies and browser data at the browser level — including deletion, blocking for specific domains, or complete disabling. Instructions from the most popular browser vendors:

- **Google Chrome**: [Clear, allow and manage cookies in Chrome — Help](https://support.google.com/chrome/answer/95647)
- **Mozilla Firefox**: [Cookies — Information that websites store on your computer](https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer)
- **Apple Safari** (macOS / iOS): [Manage cookies and website data in Safari on Mac](https://support.apple.com/guide/safari/sfri11471/mac)
- **Microsoft Edge**: [Delete cookies in Microsoft Edge](https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09)
- **Opera**: [Clear browsing data — Opera Help](https://help.opera.com/en/latest/web-preferences/#cookies)

Note that blocking cookies entirely in the browser may affect the operation of many websites — for viaviator.pl it makes the consent manager less useful (the banner will appear on every visit because we cannot remember your choice).

### 4.4. Private browsing mode

In private mode (Incognito, Private Browsing) cookies and localStorage exist only for the duration of the session — they are removed when the window is closed. This means that on every new private-mode visit, the cookie banner will appear again.

## 5. What happens if you refuse analytics

**The Website works identically** regardless of your decision on analytics. Refusing consent for Plausible:

- does not restrict access to any part of the Website,
- does not affect appearance, features or loading speed,
- does not affect the ability to submit the contact form, order a service or ask a question.

Plausible serves us only for a general traffic overview. The absence of data from your visit has no consequence for you.

## 6. Cookies from embedded third-party content

The viaviator.pl Website **does not currently embed external content** (YouTube/Vimeo videos, Google Maps, social-media widgets) in a way that would load third-party cookies.

If in the future we decide to add, for example, an interactive map of our operational base (e.g. Google Maps or OpenStreetMap), then:

- if the map requires consent (Google Maps) — it will load only after your consent, with an additional, one-off notice in the embed location,
- if the map does not require consent (OpenStreetMap with self-hosted tiles) — it will load directly.

Updates to this Policy in case of such changes — see Section 8.

## 7. Cookie-related contact

Questions about cookies, the consent manager, tracking technologies or the exercise of rights related to analytics — please address to:

- **e-mail**: kontakt@viaviator.pl
- **phone**: +48 690 691 886

We reply during business hours (Mon-Fri 7:00-20:00 CET/CEST, Sat 8:00-16:00 CET/CEST).

For GDPR matters — see the [Privacy Policy](/en/privacy-policy), Section 8 (Your rights) and Section 15 (Contact).

## 8. Versioning and changes

- **Version**: 1.0
- **Date of publication**: 31 May 2026
- **Effective date**: 31 May 2026
- **Next planned review**: in case of analytics provider change, addition of a new cookie category, or change in legal requirements.

Any material change in the scope of cookies (new provider, new category, new processing purpose) triggers a **reset of previously expressed consent** — the cookie banner will reappear so that you can express consent knowingly with respect to the updated scope.

---

**Website contractor:** QA10 sp. z o.o. (qa10.io). Consent management and cookie handling were designed in line with the **QA10 Quality Seal v1.0** standard, "Privacy" dimension — no tracker loads before consent is granted. Full quality standard specification: [/en/quality](/en/quality).
