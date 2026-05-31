// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import partytown from "@astrojs/partytown";
import vercel from "@astrojs/vercel";

const SITE = process.env.PUBLIC_SITE_URL ?? "https://viaviator.pl";

export default defineConfig({
  site: SITE,
  output: "static",
  adapter: vercel({
    webAnalytics: { enabled: false },
    imageService: true,
  }),
  integrations: [
    react(),
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: "pl",
        locales: { pl: "pl-PL", en: "en-US" },
      },
      // Wykluczamy endpointy API (POST-only, nie indexowalne)
      // oraz wewnętrzną dokumentację briefu klienta (private).
      // robots.txt też je blokuje — to defense in depth.
      filter: (page) =>
        !page.includes("/api/") && !page.includes("/_brief/"),
      // Higher changefreq dla home + segmentów (treść/oferty się zmieniają),
      // niższy dla stron prawnych. Priorytet: home=1.0, segmenty=0.9,
      // o-nas/kontakt=0.7, jakosc=0.5, prawne=0.3.
      serialize(item) {
        const url = new URL(item.url);
        const path = url.pathname;
        // Home → priorytet 1.0
        if (path === "/" || path === "/en/" || path === "/en") {
          return { ...item, priority: 1.0, changefreq: "weekly" };
        }
        // Segmenty (6 PL slugs + 6 EN slugs) → priorytet 0.9
        const segmentSlugs = [
          "transfery-korporacyjne",
          "pielgrzymki",
          "transport-dostepny",
          "przewozy-rodzinne",
          "wynajem-busa",
          "imprezy",
          "corporate-transfers",
          "pilgrimages",
          "accessible-transport",
          "family-transport",
          "van-rental",
          "events",
        ];
        if (segmentSlugs.some((slug) => path.includes(`/${slug}`))) {
          return { ...item, priority: 0.9, changefreq: "weekly" };
        }
        // Strony prawne — najniższy priorytet, niska częstotliwość zmian
        if (
          path.includes("polityka") ||
          path.includes("privacy") ||
          path.includes("cookie")
        ) {
          return { ...item, priority: 0.3, changefreq: "yearly" };
        }
        // O nas / Kontakt / Jakość → mid priority
        return { ...item, priority: 0.7, changefreq: "monthly" };
      },
    }),
    partytown({ config: { forward: ["dataLayer.push"] } }),
  ],
  i18n: {
    defaultLocale: "pl",
    locales: ["pl", "en"],
    routing: { prefixDefaultLocale: false, redirectToDefaultLocale: false },
  },
  prefetch: { prefetchAll: true, defaultStrategy: "viewport" },
  build: { inlineStylesheets: "auto" },
  vite: {
    ssr: { noExternal: ["motion"] },
    resolve: {
      alias: {
        "@": "/src",
        "@components": "/src/components",
        "@layouts": "/src/layouts",
        "@lib": "/src/lib",
        "@content": "/src/content",
        "@data": "/src/data",
        "@i18n": "/src/i18n",
        "@styles": "/src/styles",
      },
    },
  },
});
