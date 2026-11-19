// Leonida Legend — entry builder for the make.fun gta6-trophy-guide-01 bounty.
// Copies the static app and the screenshots into the output directory, checks the
// trophy data one last time, and writes the dossier file the scorer expects.
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The guide stands or falls on its data, so refuse to package a broken list:
// exactly 55 trophies, every one with a name, an official description, a grade,
// a non-empty short guide, at least one step, and a citation on every step.
const raw = JSON.parse(readFileSync(join(here, 'app', 'data', 'trophies.json'), 'utf8'));
const list = raw.trophies;
if (!Array.isArray(list) || list.length !== 55) {
  throw new Error(`trophies.json must hold exactly 55 trophies, found ${Array.isArray(list) ? list.length : 'none'}`);
}
let stepTotal = 0;
for (const t of list) {
  if (!t.name || !t.description || !t.grade) throw new Error(`trophy ${t.id}: name, description and grade are required`);
  if (!t.guide || !t.guide.inShort || !Array.isArray(t.guide.steps) || t.guide.steps.length === 0) {
    throw new Error(`trophy ${t.id} (${t.name}): guide.inShort and at least one step are required`);
  }
  for (const s of t.guide.steps) {
    stepTotal++;
    if (!s.text || !Array.isArray(s.cites) || s.cites.length === 0) {
      throw new Error(`trophy ${t.id} (${t.name}): every step needs text and at least one citation`);
    }
  }
  if (!Array.isArray(t.sources) || t.sources.length === 0) throw new Error(`trophy ${t.id} (${t.name}): sources are required`);
}

mkdirSync(outDir, { recursive: true });
for (const part of ['app', 'screenshots']) {
  const target = join(outDir, part);
  if (existsSync(target)) rmSync(target, { recursive: true, force: true });
  cpSync(join(here, part), target, { recursive: true });
}

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);

console.log(`Leonida Legend packaged: 55 trophies, ${stepTotal} cited steps, dossier ${dossier.length} bytes -> ${outDir}`);
