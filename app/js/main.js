// Boot, header maths, the audit strip, view routing, screenshot parameters, and keyboard shortcuts.
// Screenshot parameters: ?demo=1 seeds a believable mid-run tracker (only when storage is empty),
// ?view=ledger|roadmap|missables|sources picks the first view, ?open=<id> opens a trophy,
// ?spoilers=on|off sets the spoiler rule for this load.
var currentView = "ledger";
function updateHeader() {
  var earned = TROPHIES.filter(function (t) { return store.earned[t.id]; });
  document.getElementById("earnedCount").textContent = String(earned.length);
  document.getElementById("barFill").style.width = (TROPHIES.length ? (earned.length / TROPHIES.length) * 100 : 0) + "%";
  var by = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  var pts = 0;
  earned.forEach(function (t) { by[t.grade]++; pts += t.points; });
  document.getElementById("gradeLine").textContent = by.platinum + "P · " + by.gold + "G · " + by.silver + "S · " + by.bronze + "B of 1P · 2G · 6S · 46B";
  document.getElementById("pointTotal").textContent = String(pts);
}
function auditText() {
  var steps = 0, cited = 0;
  TROPHIES.forEach(function (t) {
    t.guide.steps.forEach(function (s) { steps++; if (s.cites && s.cites.length) cited++; });
  });
  var withSource = TROPHIES.filter(function (t) { return t.sources.length > 0; }).length;
  var pm = TROPHIES.filter(function (t) { return t.missable === "missable"; }).length;
  var w = TROPHIES.filter(function (t) { return t.missable === "watch"; }).length;
  var u = TROPHIES.filter(function (t) { return t.missable === "unconfirmed"; }).length;
  var hidden = TROPHIES.filter(function (t) { return t.hidden; }).length;
  return TROPHIES.length + " official · 1P 2G 6S 46B · " + hidden + " hidden · " +
    withSource + "/" + TROPHIES.length + " guides cite a source · " + cited + "/" + steps + " steps cited · " +
    "7 sources read 20 Nov 2026 · " + pm + " possibly missable · " + w + " watch · " + u + " unconfirmed";
}
function showView(name) {
  currentView = name;
  document.querySelectorAll(".tab").forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-view") === name); });
  var root = document.getElementById("viewRoot");
  if (name === "roadmap") renderRoadmap(root);
  else if (name === "missables") renderMissables(root);
  else if (name === "sources") renderSources(root);
  else renderLedger(root);
}
function seedDemo() {
  var ids = [2, 3, 16, 21, 44, 4, 8, 53, 5, 9, 22, 46, 10];
  ids.forEach(function (id) { store.earned[id] = true; });
  store.counts[15] = 87; store.counts[17] = 19; store.counts[31] = 34; store.counts[35] = 41; store.counts[28] = 6;
  store.notes[28] = "Early spot done during Chapter 1. Six meditation spots logged so far.";
  storeSave();
}
function boot() {
  var q = new URLSearchParams(location.search);
  storeLoad();
  loadTrophies().then(function () {
    if (q.get("demo") === "1" && storeIsEmpty()) seedDemo();
    if (q.get("spoilers") === "on") store.spoilers = true;
    if (q.get("spoilers") === "off") store.spoilers = false;
    var open = Number(q.get("open"));
    if (open >= 1 && open <= 55) selectedId = open;
    document.getElementById("auditStrip").textContent = auditText();
    updateHeader();
    document.querySelectorAll(".tab").forEach(function (b) {
      b.addEventListener("click", function () { showView(b.getAttribute("data-view")); });
    });
    var view = q.get("view") || "ledger";
    showView(["ledger", "roadmap", "missables", "sources"].indexOf(view) >= 0 ? view : "ledger");
  }).catch(function () {
    document.getElementById("auditStrip").textContent = "The trophy data file could not be loaded. Serve the app folder over HTTP so data/trophies.json can be fetched.";
  });
}
document.addEventListener("keydown", function (e) {
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
  var map = { 1: "ledger", 2: "roadmap", 3: "missables", 4: "sources" };
  if (map[e.key]) showView(map[e.key]);
  if (e.key === "/") { showView("ledger"); var s = document.getElementById("searchBox"); if (s) s.focus(); }
});
boot();
