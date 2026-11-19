"use strict";
/* Leonida Legend — static reference data: sources and roadmap stages.
   Trophy data itself lives in data/trophies.json and is loaded at runtime. */

const SOURCES = [
  { n: 1, name: "Exophase", kind: "Official trophy list mirror", read: "20 Nov 2026" },
  { n: 2, name: "PSNProfiles", kind: "Community guide", read: "20 Nov 2026" },
  { n: 3, name: "PowerPyx", kind: "Guide", read: "20 Nov 2026" },
  { n: 4, name: "PlayStationTrophies.org", kind: "Guide forum", read: "20 Nov 2026" },
  { n: 5, name: "TrueTrophies", kind: "Guide", read: "20 Nov 2026" },
  { n: 6, name: "KeenGamer", kind: "News and guides", read: "20 Nov 2026" },
  { n: 7, name: "GTA Wiki", kind: "World reference", read: "20 Nov 2026" }
];

const STAGES = [
  { id: "S1", name: "First hours", blurb: "Opening missions and first free-roam habits: sample activities, start discovering vehicles and areas, and grab the Ocean Beach moment early." },
  { id: "S2", name: "Story — first half", blurb: "Chapters 2 territory: named story missions, the first stranger strands, and partner play while the pair roams together." },
  { id: "S3", name: "Story — second half & side strands", blurb: "Chapter 3 and the strand grind: finish the named givers, hunt for Bret, and close eight stranger strands." },
  { id: "S4", name: "Story finish", blurb: "Chapter 4 through the finale. Keep a manual save before the point of no return and mop up partner-dependent trophies first." },
  { id: "S5", name: "Collectibles & counts", blurb: "Pure sweep work: stunts, cards, meditation spots, garages, app registrations and the long choice counter." },
  { id: "S6", name: "Activities & mastery", blurb: "Skill and nerve: range golds, race wins, robberies, and the vague one-shot trophies that need a plan and a save." },
  { id: "S7", name: "100% & Platinum", blurb: "The audit stage: close the completion checklist, finish lifetime spending, and let the platinum pop." }
];

const GRADE_POINTS = { Platinum: 300, Gold: 90, Silver: 30, Bronze: 15 };
const GRADE_ORDER = { Platinum: 4, Gold: 3, Silver: 2, Bronze: 1 };

function stageOf(id) {
  return STAGES.find(function (s) { return s.id === id; }) || STAGES[0];
}

/* Position of a stage in play order (0-based), for sorting. */
function stageIndex(id) {
  const i = STAGES.findIndex(function (s) { return s.id === id; });
  return i < 0 ? STAGES.length : i;
}

function sourceByN(n) {
  return SOURCES.find(function (s) { return s.n === n; }) || null;
}

async function loadTrophies() {
  const res = await fetch("data/trophies.json");
  if (!res.ok) throw new Error("Could not load trophy data (" + res.status + ")");
  const data = await res.json();
  return data.trophies;
}

/* How many of the 55 guides cite each source number. */
function citationCounts(trophies) {
  const perGuide = {};
  const perStep = {};
  SOURCES.forEach(function (s) { perGuide[s.n] = 0; perStep[s.n] = 0; });
  trophies.forEach(function (t) {
    const cited = new Set(t.sources || []);
    t.guide.steps.forEach(function (st) {
      (st.cite || []).forEach(function (n) { cited.add(n); perStep[n] = (perStep[n] || 0) + 1; });
    });
    cited.forEach(function (n) { perGuide[n] = (perGuide[n] || 0) + 1; });
  });
  return { perGuide: perGuide, perStep: perStep };
}
