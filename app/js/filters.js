// Filtering for the ledger list: kind chips, grade, text search, earned state, and the spoiler rule.
// Spoiler rule: with spoilers ON, a story trophy you have not earned yet shows as a sealed row in the list —
// its name and description stay hidden until you earn it or turn spoilers off.
var KIND_LABELS = {
  story: "Story", side: "Side strands", activities: "Activities", collectibles: "Collectibles",
  crime: "Crime", riddles: "Riddles & moments", money: "Money"
};
var filters = { kind: "all", grade: "all", q: "", state: "all", hideEarned: false };
function isSpoilerHidden(t) {
  return store.spoilers && t.kind === "story" && !store.earned[t.id];
}
function trophyMatches(t) {
  if (filters.kind !== "all" && t.kind !== filters.kind) return false;
  if (filters.grade !== "all" && t.grade !== filters.grade) return false;
  if (filters.state === "earned" && !store.earned[t.id]) return false;
  if (filters.state === "unearned" && store.earned[t.id]) return false;
  if (filters.hideEarned && store.earned[t.id]) return false;
  if (filters.q) {
    var hay = (t.name + " " + t.description + " " + t.kind + " " + t.stage).toLowerCase();
    if (hay.indexOf(filters.q.toLowerCase()) < 0) return false;
  }
  return true;
}
function kindCounts() {
  var out = { all: TROPHIES.length };
  TROPHIES.forEach(function (t) { out[t.kind] = (out[t.kind] || 0) + 1; });
  return out;
}
function roadmapOrder() {
  var rank = {};
  STAGES.forEach(function (s, i) { rank[s.id] = i; });
  return TROPHIES.slice().sort(function (a, b) {
    return (rank[a.stage] - rank[b.stage]) || (a.id - b.id);
  });
}
function nextUpList() {
  return roadmapOrder().filter(function (t) { return !store.earned[t.id]; }).slice(0, 3);
}
function missBadge(t) {
  if (t.missable === "missable") return '<span class="badge b-missable">POSSIBLY MISSABLE</span>';
  if (t.missable === "watch") return '<span class="badge b-watch">WATCH</span>';
  if (t.missable === "unconfirmed") return '<span class="badge b-unconfirmed">UNCONFIRMED</span>';
  return "";
}
function medalHtml(t) {
  var letter = { platinum: "P", gold: "G", silver: "S", bronze: "B" }[t.grade];
  return '<span class="medal m-' + t.grade + '">' + letter + "</span>";
}
