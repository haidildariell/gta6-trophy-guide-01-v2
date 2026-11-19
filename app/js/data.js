"use strict";
/* Leonida Legend — static reference data: sources and roadmap stages.
   Trophy data itself is never inlined here; it is loaded from data/trophies.json. */

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
  { id: "S1", name: "First hours", blurb: "Arrive in Leonida, learn the systems, and bank the easy first-hour trophies." },
  { id: "S2", name: "Story — first half", blurb: "Chapters 2 and 3, plus the early named missions and partner tricks." },
  { id: "S3", name: "Story — second half & side strands", blurb: "Chapter 4, the big set-piece missions, and the first stranger strands." },
  { id: "S4", name: "Story finish", blurb: "Close the remaining strands and finish the final mission with a save to spare." },
  { id: "S5", name: "Collectibles & counts", blurb: "Cards, spots, locations and counters — swept county by county." },
  { id: "S6", name: "Activities & mastery", blurb: "Ranges, races, robberies and the vague one-off feats that need a plan." },
  { id: "S7", name: "100% & Platinum", blurb: "Buy out the garages, close the 100 percent checklist, and take the Platinum." }
];

const GRADE_ORDER = { Platinum: 4, Gold: 3, Silver: 2, Bronze: 1 };
const GRADE_POINTS = { Platinum: 300, Gold: 90, Silver: 30, Bronze: 15 };

function stageOf(id) {
  return STAGES.find(function (s) { return s.id === id; }) || STAGES[0];
}

function sourceOf(n) {
  return SOURCES.find(function (s) { return s.n === n; }) || null;
}

/* "[3] PowerPyx" style label for a source number. */
function sourceLabel(n) {
  const s = sourceOf(n);
  return s ? "[" + s.n + "] " + s.name : "[" + n + "]";
}

/* Load the official trophy list. Returns a promise for the trophies array. */
function loadTrophies() {
  return fetch("data/trophies.json")
    .then(function (res) {
      if (!res.ok) throw new Error("trophies.json failed to load: " + res.status);
      return res.json();
    })
    .then(function (doc) { return doc.trophies; });
}

/* Citation counts: how many of the 55 guides cite each source number. */
function citationCounts(trophies) {
  const counts = {};
  SOURCES.forEach(function (s) { counts[s.n] = 0; });
  trophies.forEach(function (t) {
    const cited = new Set();
    (t.sources || []).forEach(function (n) { cited.add(n); });
    (t.guide.steps || []).forEach(function (step) {
      (step.cite || []).forEach(function (n) { cited.add(n); });
    });
    cited.forEach(function (n) { if (counts[n] !== undefined) counts[n] += 1; });
  });
  return counts;
}
