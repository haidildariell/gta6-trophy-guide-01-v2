// Leonida Legend v2 — entry builder for make.fun.
// Validates app/data/trophies.json, then writes a deterministic JSON
// dossier to $MAKEFUN_OUTPUT_DIR/entry.json (default: out/entry.json).
// No dependencies; runs with plain `node main.ts` on modern Node.
// Determinism: keys are sorted recursively, arrays keep data order,
// and no timestamps or random values are emitted — two runs over the
// same data produce byte-identical output.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const dataPath = join(root, "app", "data", "trophies.json");
const outDir = process.env.MAKEFUN_OUTPUT_DIR || join(root, "out");
const outPath = join(outDir, "entry.json");

function fail(message) {
  console.error("VALIDATION FAILED: " + message);
  process.exit(1);
}

function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    const out = {};
    for (const key of Object.keys(value).sort()) out[key] = sortKeys(value[key]);
    return out;
  }
  return value;
}

const raw = readFileSync(dataPath, "utf8");
const data = JSON.parse(raw);
const trophies = data.trophies;

if (!Array.isArray(trophies)) fail("trophies is not an array");
if (trophies.length !== 55) fail("expected exactly 55 trophies, found " + trophies.length);

const seenIds = new Set();
let totalSteps = 0;
let citedSteps = 0;
for (const t of trophies) {
  if (seenIds.has(t.id)) fail("duplicate trophy id " + t.id);
  seenIds.add(t.id);
  if (!t.name || !String(t.name).trim()) fail("trophy " + t.id + " has a blank name");
  if (!t.guide || !Array.isArray(t.guide.steps) || t.guide.steps.length < 1) {
    fail("trophy " + t.id + " has no guide steps");
  }
  if (!Array.isArray(t.sources) || t.sources.length < 1) {
    fail("trophy " + t.id + " cites no source");
  }
  for (const step of t.guide.steps) {
    totalSteps += 1;
    if (!Array.isArray(step.cite) || step.cite.length < 1) {
      fail("trophy " + t.id + " has a step without a citation");
    }
    citedSteps += 1;
  }
}

const byGrade = {};
const byStage = {};
const byKind = {};
const missableTiers = { possibly: 0, watch: 0, unconfirmed: 0, none: 0 };
let hiddenCount = 0;
let totalPoints = 0;
for (const t of trophies) {
  byGrade[t.grade] = (byGrade[t.grade] || 0) + 1;
  byStage[t.stage] = (byStage[t.stage] || 0) + 1;
  byKind[t.kind] = (byKind[t.kind] || 0) + 1;
  if (t.hidden) hiddenCount += 1;
  totalPoints += t.points;
  if (t.missable) missableTiers[t.missable] = (missableTiers[t.missable] || 0) + 1;
  else missableTiers.none += 1;
}

const dataSha256 = createHash("sha256").update(raw).digest("hex");

const dossier = sortKeys({
  entry: "Leonida Legend v2",
  competition: "gta6-trophy-guide-01",
  dataSha256: dataSha256,
  game: data.game,
  platform: data.platform,
  app: "app/index.html",
  summary: {
    trophies: trophies.length,
    totalPoints: totalPoints,
    totalSteps: totalSteps,
    citedSteps: citedSteps,
    hidden: hiddenCount,
    byGrade: byGrade,
    byStage: byStage,
    byKind: byKind,
    missableTiers: missableTiers
  },
  trophies: trophies.map((t) => ({
    id: t.id,
    name: t.name,
    grade: t.grade,
    points: t.points,
    hidden: t.hidden,
    kind: t.kind,
    stage: t.stage,
    missable: t.missable || "",
    steps: t.guide.steps.length,
    sources: t.sources
  }))
});

const json = JSON.stringify(dossier, null, 2) + "\n";
mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, json);
const sha = createHash("sha256").update(json).digest("hex");
console.log("OK: 55 trophies validated, " + totalSteps + " steps, " + citedSteps + " cited");
console.log("Wrote " + outPath + " (" + Buffer.byteLength(json) + " bytes, sha256 " + sha + ")");
