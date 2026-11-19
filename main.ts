// Leonida Legend v2 — entry dossier builder (Node, no dependencies).
// Validates app/data/trophies.json, then writes a deterministic JSON dossier
// to $MAKEFUN_OUTPUT_DIR/entry.json (default: out/entry.json).
// Running it twice produces byte-identical output: keys are sorted and no
// timestamps are emitted.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || join(root, "out");
const dataPath = join(root, "app", "data", "trophies.json");

function fail(message: string): never {
  console.error("validation failed: " + message);
  process.exit(1);
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      out[key] = sortKeys((value as Record<string, unknown>)[key]);
    }
    return out;
  }
  return value;
}

const doc = JSON.parse(readFileSync(dataPath, "utf8"));
const trophies = doc.trophies;

if (!Array.isArray(trophies)) fail("trophies is not an array");
if (trophies.length !== 55) fail("expected exactly 55 trophies, found " + trophies.length);

const grades: Record<string, number> = { Platinum: 0, Gold: 0, Silver: 0, Bronze: 0 };
const missable: Record<string, number> = { possibly: 0, watch: 0, unconfirmed: 0 };
let hidden = 0;
let steps = 0;
let citedSteps = 0;
let guidesWithSource = 0;

const index = trophies.map((t: any) => {
  if (!t.name || !String(t.name).trim()) fail("trophy " + t.id + " has a blank name");
  if (!t.guide || !Array.isArray(t.guide.steps) || t.guide.steps.length < 1) {
    fail("trophy " + t.id + " has no guide steps");
  }
  for (const step of t.guide.steps) {
    if (!Array.isArray(step.cite) || step.cite.length < 1) {
      fail("trophy " + t.id + " has a step without a citation");
    }
    steps += 1;
    citedSteps += 1;
  }
  if (Array.isArray(t.sources) && t.sources.length >= 1) guidesWithSource += 1;
  grades[t.grade] = (grades[t.grade] || 0) + 1;
  if (t.hidden) hidden += 1;
  if (t.missable && missable[t.missable] !== undefined) missable[t.missable] += 1;
  return {
    grade: t.grade,
    hidden: !!t.hidden,
    id: t.id,
    kind: t.kind,
    missable: t.missable || "",
    name: t.name,
    points: t.points,
    stage: t.stage,
    steps: t.guide.steps.length,
  };
});

const audit =
  trophies.length + " official · " +
  grades.Platinum + "P " + grades.Gold + "G " + grades.Silver + "S " + grades.Bronze + "B · " +
  hidden + " hidden · " +
  guidesWithSource + "/" + trophies.length + " guides cite a source · " +
  citedSteps + "/" + steps + " steps cited · " +
  "7 sources read 20 Nov 2026 · " +
  missable.possibly + " possibly missable · " + missable.watch + " watch · " + missable.unconfirmed + " unconfirmed";

const stages: Record<string, number> = {};
for (const t of trophies) stages[t.stage] = (stages[t.stage] || 0) + 1;

const dossier = sortKeys({
  audit,
  counts: {
    citedSteps,
    grades,
    guidesWithSource,
    hidden,
    missable,
    steps,
    totalPoints: trophies.reduce((s: number, t: any) => s + t.points, 0),
    trophies: trophies.length,
  },
  entry: "Leonida Legend v2",
  competition: "gta6-trophy-guide-01",
  stages,
  game: doc.game,
  platform: doc.platform,
  trophies: index,
});

mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.json");
writeFileSync(outPath, JSON.stringify(dossier, null, 2) + "\n");
console.log("wrote " + outPath);
console.log(audit);
