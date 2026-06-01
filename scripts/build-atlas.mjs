#!/usr/bin/env node
/**
 * Atlas Południa — build-time generator.
 *
 * Pipeline:
 *   1. Load src/data/atlas/wojewodztwa-min.geojson (ppatrzyk/polska-geojson, MIT).
 *   2. Split features into KEEP (4 rdzeniowe woj.) + GHOST (12 pozostałych).
 *   3. Project EPSG:4326 (lat/lon) → EPSG:2180 (PUWG 1992, Lambert Conformal Conic).
 *      — standard GUGiK dla kartografii PL, zachowuje kąty i lokalne kształty.
 *   4. Compute focal bbox over KEEP features (4 rdzeniowe województwa).
 *      Padding 8% wokół rdzenia. Aspect ratio dyktowany przez bbox po projekcji.
 *   5. Fit do SVG viewBox 920×480 z preserveAspectRatio "xMidYMid meet" w consumer.
 *   6. Project hub/base/sanctuary points przez ten sam transform.
 *   7. Generate Douglas-Peucker simplify (ε=350m w EPSG:2180) — redukuje wierzchołki
 *      ~85% przy zachowaniu kształtu konturów województw.
 *   8. Emit src/data/atlas/atlas.generated.ts (TypeScript module z d-strings + points).
 *
 * Uruchamiać: `node scripts/build-atlas.mjs` (raz, output commitowany do repo).
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import proj4 from "proj4";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// EPSG:2180 (PUWG 1992) — official GUGiK projection for Poland.
// Lambert Conformal Conic-like: tmerc with lat_0=0, lon_0=19E, k=0.9993.
proj4.defs(
  "EPSG:2180",
  "+proj=tmerc +lat_0=0 +lon_0=19 +k=0.9993 +x_0=500000 +y_0=-5300000 " +
    "+ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
);

const SRC = resolve(ROOT, "src/data/atlas/wojewodztwa-min.geojson");
const OUT_TS = resolve(ROOT, "src/data/atlas/atlas.generated.ts");

const SVG_W = 920;
const SVG_H = 480;

// 4 województwa rdzeniowe (lowercase, jak w GeoJSON properties.nazwa).
const KEEP_NAMES = new Set([
  "śląskie",
  "opolskie",
  "małopolskie",
  "świętokrzyskie",
]);

// ─────────────────────────── 1. Load + split features ───────────────────────────

const raw = JSON.parse(readFileSync(SRC, "utf-8"));
if (raw.type !== "FeatureCollection") {
  throw new Error(`Expected FeatureCollection, got ${raw.type}`);
}

const featuresKeep = raw.features.filter((f) => KEEP_NAMES.has(f.properties.nazwa));
const featuresGhost = raw.features.filter((f) => !KEEP_NAMES.has(f.properties.nazwa));

if (featuresKeep.length !== 4) {
  throw new Error(
    `Expected 4 KEEP features, got ${featuresKeep.length}: ${featuresKeep.map((f) => f.properties.nazwa).join(", ")}`,
  );
}

// ─────────────────────────── 2. Helpers: project rings ───────────────────────────

/**
 * Project one ring of [lon, lat] → [x_m, y_m] in EPSG:2180 metres.
 */
function projectRing(ring) {
  return ring.map(([lon, lat]) => proj4("EPSG:4326", "EPSG:2180", [lon, lat]));
}

function projectFeature(f) {
  const geom = f.geometry;
  if (geom.type === "Polygon") {
    return {
      ...f,
      geometry: {
        ...geom,
        coordinates: geom.coordinates.map(projectRing),
      },
    };
  }
  if (geom.type === "MultiPolygon") {
    return {
      ...f,
      geometry: {
        ...geom,
        coordinates: geom.coordinates.map((poly) => poly.map(projectRing)),
      },
    };
  }
  return f;
}

const projectedKeep = featuresKeep.map(projectFeature);
const projectedGhost = featuresGhost.map(projectFeature);

// ─────────────────────────── 3. Douglas-Peucker simplify ───────────────────────────

/**
 * Perpendicular distance from point p to line segment a-b.
 */
function perpDistance(p, a, b) {
  const [px, py] = p;
  const [ax, ay] = a;
  const [bx, by] = b;
  const dx = bx - ax;
  const dy = by - ay;
  if (dx === 0 && dy === 0) {
    const ddx = px - ax;
    const ddy = py - ay;
    return Math.sqrt(ddx * ddx + ddy * ddy);
  }
  const num = Math.abs(dy * px - dx * py + bx * ay - by * ax);
  const den = Math.sqrt(dx * dx + dy * dy);
  return num / den;
}

/**
 * Douglas-Peucker simplification. Tolerance in metres (since coords are EPSG:2180).
 * Returns simplified ring with first + last vertex preserved.
 */
function douglasPeucker(ring, tolerance) {
  if (ring.length <= 2) return ring.slice();

  let maxDist = 0;
  let maxIdx = 0;
  const last = ring.length - 1;

  for (let i = 1; i < last; i++) {
    const d = perpDistance(ring[i], ring[0], ring[last]);
    if (d > maxDist) {
      maxDist = d;
      maxIdx = i;
    }
  }

  if (maxDist > tolerance) {
    const left = douglasPeucker(ring.slice(0, maxIdx + 1), tolerance);
    const right = douglasPeucker(ring.slice(maxIdx), tolerance);
    return left.slice(0, -1).concat(right);
  }
  return [ring[0], ring[last]];
}

/**
 * Simplify all rings of a feature. Smaller tolerance dla KEEP (więcej detali),
 * większe dla GHOST (mniej wierzchołków, ledwo widoczne).
 */
function simplifyFeature(f, tolerance) {
  const geom = f.geometry;
  if (geom.type === "Polygon") {
    return {
      ...f,
      geometry: {
        ...geom,
        coordinates: geom.coordinates.map((ring) => douglasPeucker(ring, tolerance)),
      },
    };
  }
  if (geom.type === "MultiPolygon") {
    return {
      ...f,
      geometry: {
        ...geom,
        coordinates: geom.coordinates.map((poly) =>
          poly.map((ring) => douglasPeucker(ring, tolerance)),
        ),
      },
    };
  }
  return f;
}

// Tolerances tuned for editorial cartography:
//   KEEP (~250m) — zachowuje kluczowe wcięcia granic województw, ~80% redukcja.
//   GHOST (~2200m) — agresywne uproszczenie, tylko silhouette base-map context.
const KEEP_TOLERANCE_M = 250;
const GHOST_TOLERANCE_M = 2200;

const simplifiedKeep = projectedKeep.map((f) => simplifyFeature(f, KEEP_TOLERANCE_M));
const simplifiedGhost = projectedGhost.map((f) =>
  simplifyFeature(f, GHOST_TOLERANCE_M),
);

// ─────────────────────────── 4. Compute focal bbox over KEEP ───────────────────────────

let minX = Infinity;
let minY = Infinity;
let maxX = -Infinity;
let maxY = -Infinity;

function walkCoords(coords) {
  if (typeof coords[0] === "number") {
    minX = Math.min(minX, coords[0]);
    maxX = Math.max(maxX, coords[0]);
    minY = Math.min(minY, coords[1]);
    maxY = Math.max(maxY, coords[1]);
    return;
  }
  for (const c of coords) walkCoords(c);
}

for (const f of simplifiedKeep) walkCoords(f.geometry.coordinates);

// Padding asymetryczny dookoła focal bbox 4 rdzeniowych województw.
// CEL: pokazać "całą południową Polskę" jako base-map context — ghost regions
// (12 woj.) muszą mieć widoczne fragmenty stykające się z rdzeniem.
// Stąd N (góra SVG) padding zwiększony do 2.8x — pokazujemy łódzkie, mazowieckie,
// pełniej wielkopolskie i dolnośląskie. W (zachód) 1.6x — Wrocław hub headroom.
// E (wschód) 1.5x — podkarpackie + lubelskie więcej widoczne.
// S (dół) 0.7x — granica PL już blisko, niewiele do pokazania.
const widthM = maxX - minX;
const heightM = maxY - minY;
const padX = widthM * 0.08;
const padY = heightM * 0.10;
minX -= padX * 1.6; // W (zachód) — Wrocław hub + dolnośląskie context
maxX += padX * 1.5; // E (wschód) — podkarpackie + lubelskie context
minY -= padY * 0.7; // S (południe) — granica blisko
maxY += padY * 2.8; // N (północ) — łódzkie/mazowieckie/wielkopolskie context

// Aspekt po padding:
const aspectFocal = (maxX - minX) / (maxY - minY);
const aspectSvg = SVG_W / SVG_H;

// Fit-to-viewBox z preserveAspectRatio "meet" (letterbox). Jeśli focal jest
// szerszy niż viewBox, dopasowujemy do W i centrujemy w H (i odwrotnie).
let scale, offsetX, offsetY;
if (aspectFocal > aspectSvg) {
  // Focal szerszy — fit to width, letterbox vertically.
  scale = SVG_W / (maxX - minX);
  const usedH = (maxY - minY) * scale;
  offsetX = 0;
  offsetY = (SVG_H - usedH) / 2;
} else {
  // Focal węższy — fit to height, letterbox horizontally.
  scale = SVG_H / (maxY - minY);
  const usedW = (maxX - minX) * scale;
  offsetX = (SVG_W - usedW) / 2;
  offsetY = 0;
}

/**
 * Project EPSG:2180 metres → SVG pixel coordinates.
 * Y flip: SVG top-left = (0,0), Polska północna ma wyższe Y w EPSG:2180.
 */
function toSvg(point) {
  const [x, y] = point;
  return [
    offsetX + (x - minX) * scale,
    offsetY + (maxY - y) * scale, // Y odwrócone
  ];
}

// ─────────────────────────── 5. Generate SVG path d-strings ───────────────────────────

function ringToD(ring) {
  if (ring.length === 0) return "";
  const parts = ring.map((pt, i) => {
    const [x, y] = toSvg(pt);
    return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
  });
  return parts.join(" ") + " Z";
}

function geomToD(geom) {
  if (geom.type === "Polygon") {
    return geom.coordinates.map(ringToD).join(" ");
  }
  if (geom.type === "MultiPolygon") {
    return geom.coordinates.flat().map(ringToD).join(" ");
  }
  return "";
}

function slugify(s) {
  const map = { ą: "a", ć: "c", ę: "e", ł: "l", ń: "n", ó: "o", ś: "s", ź: "z", ż: "z" };
  return s
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (c) => map[c] ?? c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const keepData = simplifiedKeep.map((f) => ({
  id: slugify(f.properties.nazwa),
  name: f.properties.nazwa,
  d: geomToD(f.geometry),
}));

const ghostData = simplifiedGhost.map((f) => ({
  id: slugify(f.properties.nazwa),
  d: geomToD(f.geometry),
}));

// ─────────────────────────── 6. Project POI points ───────────────────────────

// Lat/lon for hubs, base, sanctuaries — verified against Google Maps 2026-06-01.
const POINTS = {
  // Baza
  baseTG: { lat: 50.4453, lon: 18.8528, label: "Tarnowskie Góry" },

  // Huby lotnicze
  hubPyrzowice: { lat: 50.4744, lon: 19.08, label: "Pyrzowice", time: 25 },
  hubBalice: { lat: 50.0777, lon: 19.7848, label: "Kraków-Balice", time: 90 },
  hubWroclaw: { lat: 51.1027, lon: 16.8858, label: "Wrocław", time: 150 },

  // Sanktuaria w rdzeniu (in-view)
  saintCzestochowa: { lat: 50.812, lon: 19.1208, label: "Częstochowa" },
  saintKalwaria: { lat: 49.8688, lon: 19.6831, label: "Kalwaria Zebrzydowska" },
  saintLagiewniki: { lat: 50.0167, lon: 19.9264, label: "Łagiewniki" },
  saintWadowice: { lat: 49.883, lon: 19.4925, label: "Wadowice" },

  // Sanktuaria off-view (NE od rdzenia — arrow indicator)
  saintLichen: { lat: 52.3122, lon: 18.358, label: "Licheń" },
  saintNiepokalanow: { lat: 52.2533, lon: 20.3492, label: "Niepokalanów" },
};

const projectedPoints = {};
for (const [key, p] of Object.entries(POINTS)) {
  const [xM, yM] = proj4("EPSG:4326", "EPSG:2180", [p.lon, p.lat]);
  const [svgX, svgY] = toSvg([xM, yM]);
  const inView = svgX >= 0 && svgX <= SVG_W && svgY >= 0 && svgY <= SVG_H;
  projectedPoints[key] = {
    label: p.label,
    svgX: Number(svgX.toFixed(2)),
    svgY: Number(svgY.toFixed(2)),
    inView,
    ...(p.time !== undefined ? { time: p.time } : {}),
  };
}

// ─────────────────────────── 7. Emit generated TS module ───────────────────────────

const header = `// AUTO-GENERATED przez scripts/build-atlas.mjs — nie edytuj ręcznie.
// Source: ppatrzyk/polska-geojson (MIT, wojewodztwa-min.geojson).
// Projekcja: EPSG:4326 → EPSG:2180 (PUWG 1992, GUGiK standard).
// Simplify: Douglas-Peucker; KEEP tolerance ${KEEP_TOLERANCE_M}m, GHOST tolerance ${GHOST_TOLERANCE_M}m.
// ViewBox: ${SVG_W}×${SVG_H}, scale ${scale.toFixed(6)} px/m.
// Generated: ${new Date().toISOString()}
`;

const ts = `${header}
export const SVG_W = ${SVG_W};
export const SVG_H = ${SVG_H};

export interface AtlasRegion {
  readonly id: string;
  readonly name: string;
  readonly d: string;
}

export interface AtlasGhostRegion {
  readonly id: string;
  readonly d: string;
}

export interface AtlasPoint {
  readonly label: string;
  readonly svgX: number;
  readonly svgY: number;
  readonly inView: boolean;
  readonly time?: number;
}

export const regions: readonly AtlasRegion[] = ${JSON.stringify(keepData, null, 2)};

export const ghostRegions: readonly AtlasGhostRegion[] = ${JSON.stringify(ghostData, null, 2)};

export const points: Readonly<Record<string, AtlasPoint>> = ${JSON.stringify(projectedPoints, null, 2)};
`;

writeFileSync(OUT_TS, ts);

// ─────────────────────────── 8. Diagnostic report ───────────────────────────

const tgPoint = projectedPoints.baseTG;
const pyPoint = projectedPoints.hubPyrzowice;

console.log("✓ Atlas built");
console.log(`  · KEEP features: ${keepData.length}`);
console.log(`  · GHOST features: ${ghostData.length}`);
console.log(`  · Focal bbox (m): ${minX.toFixed(0)} ${minY.toFixed(0)} → ${maxX.toFixed(0)} ${maxY.toFixed(0)}`);
console.log(`  · Aspect focal vs viewBox: ${aspectFocal.toFixed(3)} vs ${aspectSvg.toFixed(3)}`);
console.log(`  · Scale: ${scale.toFixed(4)} px/m (offset ${offsetX.toFixed(1)}, ${offsetY.toFixed(1)})`);
console.log(`  · Tarnowskie Góry SVG: (${tgPoint.svgX}, ${tgPoint.svgY})`);
console.log(`  · Pyrzowice SVG: (${pyPoint.svgX}, ${pyPoint.svgY})`);

// Sanity check: Pyrzowice (50.47°N) musi mieć MNIEJSZE svgY niż TG (50.45°N) —
// jest położone bardziej na N, więc po Y-flip w SVG jest wyżej (mniejsza wartość).
if (pyPoint.svgY >= tgPoint.svgY) {
  console.warn(
    `  ⚠ Pyrzowice svgY (${pyPoint.svgY}) >= TG svgY (${tgPoint.svgY}) — projekcja może być odwrócona!`,
  );
} else {
  console.log(`  ✓ Pyrzowice (${pyPoint.svgY}) leży WYŻEJ na SVG niż TG (${tgPoint.svgY}) — north check OK.`);
}

// Out-of-view warnings
for (const [key, p] of Object.entries(projectedPoints)) {
  if (!p.inView) {
    console.log(`  · ${key} (${p.label}) jest OFF-VIEW: svgX=${p.svgX}, svgY=${p.svgY}`);
  }
}

// Path-d sample for first KEEP feature
const firstKeep = keepData[0];
console.log(`  · Pierwszy region "${firstKeep.name}" d[0..120]: ${firstKeep.d.slice(0, 120)}…`);
