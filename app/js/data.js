// Data layer: the seven numbered sources, the roadmap stages, and the trophy list loader.
// Source sites are named as plain text only; this app never contacts the network at runtime
// beyond fetching its own trophies.json sitting next to the page.
var SOURCES = [
  { id: 1, name: "Exophase", site: "exophase.com", note: "The official PS5 trophy list: names, descriptions, and grades as published for the platform." },
  { id: 2, name: "PSNProfiles", site: "psnprofiles.com", note: "Trophy list mirror plus PSN progress targets and counters for counted trophies." },
  { id: 3, name: "PowerPyx", site: "powerpyx.com", note: "GTA 6 Trophy Guide & Roadmap: ordering, strand flow, and clean-up advice." },
  { id: 4, name: "PlayStationTrophies.org", site: "playstationtrophies.org", note: "GTA 6 guide: activity, race, shooting-range, and crime trophy methods." },
  { id: 5, name: "TrueTrophies", site: "truetrophies.com", note: "GTA 6 trophies: collectible, location, and exploration coverage." },
  { id: 6, name: "KeenGamer", site: "keengamer.com", note: "GTA 6 platinum roadmap: stage order, money pacing, and endgame planning." },
  { id: 7, name: "GTA Wiki", site: "gta.fandom.com", note: "Mission and activity reference for Leonida: story order and strand structure." }
];
var STAGES = [
  { id: "S1", name: "First hours", blurb: "Opening mission, Chapter 1, first activities, and the two early moments we flag as possibly missable." },
  { id: "S2", name: "Story — first half", blurb: "Chapters 2 and 3 plus the first stranger strands that open alongside them." },
  { id: "S3", name: "Story — second half & side strands", blurb: "Chapter 4, the remaining named missions, and the rest of the stranger strands." },
  { id: "S4", name: "Story finish", blurb: "The final mission and the late, vague story-adjacent trophies to test while the world is fresh." },
  { id: "S5", name: "Collectibles & counts", blurb: "Meditation spots, card sets, WAiNK locations, vehicles, areas, garages, and registrations." },
  { id: "S6", name: "Activities & mastery", blurb: "Stunts, the Shooting Range, races, challenges, and the crime set-pieces." },
  { id: "S7", name: "100% & the Platinum", blurb: "The long money grind, the 100% completion gold, and the platinum itself." }
];
var TROPHIES = [];
function stageName(id) {
  for (var i = 0; i < STAGES.length; i++) if (STAGES[i].id === id) return STAGES[i].id + " · " + STAGES[i].name;
  return id;
}
function loadTrophies() {
  return fetch("data/trophies.json").then(function (r) {
    if (!r.ok) throw new Error("trophies.json failed to load");
    return r.json();
  }).then(function (doc) {
    TROPHIES = doc.trophies.slice().sort(function (a, b) { return a.id - b.id; });
    return TROPHIES;
  });
}
function citedBy(sourceId) {
  var n = 0;
  TROPHIES.forEach(function (t) { if (t.sources.indexOf(sourceId) >= 0) n++; });
  return n;
}
function citesHtml(cites) {
  return cites.map(function (c) { return '<span class="cite">[' + c + "]</span>"; }).join(" ");
}
