/**
 * Astro content collections — Via Viator.
 *
 * Collections:
 *  - `legal`: polityki prawne (prywatność, cookies, regulamin) w PL i EN,
 *    renderowane przez strony Astro w `/src/pages/`. Frontmatter zwalidowany
 *    przez Zod schema (title, locale, version, publishedAt, summary).
 *  - `cases`: case studies (placeholder — zostanie wypełniony w Phase 3+).
 *  - `features`: opisy funkcji (placeholder).
 *
 * Zasada wersjonowania `legal`:
 *  - `version` — semver-like (np. "1.0", "1.1", "2.0"). Zmiana minor = drobna
 *    poprawka redakcyjna. Zmiana major = istotna zmiana zakresu przetwarzania
 *    danych, dostawców lub praw użytkownika — wymaga ponownej akceptacji
 *    consent UI (banner z informacją o aktualizacji).
 *  - `publishedAt` — data wejścia w życie (ISO 8601, YYYY-MM-DD).
 */

import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const legal = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/legal" }),
  schema: z.object({
    title: z.string(),
    locale: z.enum(["pl", "en"]),
    version: z.string(),
    publishedAt: z.string(), // ISO date YYYY-MM-DD
    summary: z.string().optional(),
  }),
});

const cases = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/cases" }),
  schema: z.object({
    title: z.string(),
    locale: z.enum(["pl", "en"]),
    summary: z.string().optional(),
    publishedAt: z.string().optional(),
  }),
});

const features = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/features" }),
  schema: z.object({
    title: z.string(),
    locale: z.enum(["pl", "en"]),
    summary: z.string().optional(),
  }),
});

export const collections = { legal, cases, features };
