"use strict";
/* Leonida Legend — bootstrap: load data, paint the audit strip, route views.
   URL params: ?demo=1 ?view=ledger|roadmap|missables|sources ?open=<id> ?spoilers=on|off */

const VALID_VIEWS = ["ledger", "roadmap", "missables", "sources"];
let TROPHIES = [];
let currentView = "ledger";

function auditLine(trophies) {
  const grades = { Platinum: 0, Gold: 0, Silver: 0, Bronze: 0 };
  let hidden = 0;
  let steps = 0;
  let citedSteps = 0;
  let guidesWithSource = 0;
  const miss = { possibly: 0, watch: 0, unconfirmed: 0 };
  trophies.forEach(function (t) {
    grades[t.grade] = (grades[t.grade] || 0) + 1;
    if (t.hidden) hidden += 1;
    if (t.sources && t.sources.length) guidesWithSource += 1;
    if (miss[t.missable] !== undefined) miss[t.missable] += 1;
    (t.guide.steps || []).forEach(function (s) {
      steps += 1;
      if (s.cite && s.cite.length) citedSteps += 1;
    });
  });
  return trophies.length + " official · " +
    grades.Platinum + "P " + grades.Gold + "G " + grades.Silver + "S " + grades.Bronze + "B · " +
    hidden + " hidden · " +
    guidesWithSource + "/" + trophies.length + " guides cite a source · " +
    citedSteps + "/" + steps + " steps cited · " +
    SOURCES.length + " sources read 20 Nov 2026 · " +
    miss.possibly + " possibly missable · " + miss.watch + " watch · " + miss.unconfirmed + " unconfirmed";
}

function paintAudit() {
  const audit = document.getElementById("audit");
  if (audit) audit.textContent = auditLine(TROPHIES);
  const line = document.getElementById("progress-line");
  if (line) {
    const earnedCount = TROPHIES.filter(function (t) { return store.isEarned(t.id); }).length;
    const pts = pointsEarned(TROPHIES);
    const lvl = psnLevel(pts);
    line.textContent = earnedCount + "/55 earned · " + pts + "/" + pointsTotal(TROPHIES) +
      " pts · PSN level " + lvl.level;
  }
}

function render() { renderKeep(); }

function renderKeep() {
  paintAudit();
  document.querySelectorAll(".view-btn").forEach(function (b) {
    b.classList.toggle("is-active", b.getAttribute("data-view") === currentView);
  });
  const view = document.getElementById("view");
  if (currentView === "ledger") renderLedger(view, TROPHIES, renderKeep);
  else if (currentView === "roadmap") renderRoadmap(view, TROPHIES);
  else if (currentView === "missables") renderMissables(view, TROPHIES);
  else if (currentView === "sources") renderSources(view, TROPHIES);
}

function applyParams() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("demo") === "1" && !sessionStorage.getItem("ll-demo-seeded")) {
    seedDemo(TROPHIES);
    sessionStorage.setItem("ll-demo-seeded", "1");
  }
  const v = params.get("view");
  if (v && VALID_VIEWS.indexOf(v) !== -1) currentView = v;
  const open = parseInt(params.get("open") || "", 10);
  if (!Number.isNaN(open) && TROPHIES.some(function (t) { return t.id === open; })) selectedId = open;
  const sp = params.get("spoilers");
  if (sp === "on") filters.spoilers = true;
  if (sp === "off") filters.spoilers = false;
}

function wireChrome() {
  document.querySelectorAll(".view-btn").forEach(function (b) {
    b.addEventListener("click", function () {
      currentView = b.getAttribute("data-view") || "ledger";
      const params = new URLSearchParams(window.location.search);
      params.set("view", currentView);
      history.replaceState(null, "", window.location.pathname + "?" + params.toString());
      renderKeep();
    });
  });
  const exp = document.getElementById("btn-export");
  if (exp) exp.addEventListener("click", downloadExport);
  const imp = document.getElementById("file-import");
  if (imp) imp.addEventListener("change", function () {
    if (imp.files && imp.files[0]) {
      importFromFile(imp.files[0], function () { renderKeep(); });
    }
  });
  const rst = document.getElementById("btn-reset");
  if (rst) rst.addEventListener("click", function () { store.reset(); renderKeep(); });
}

loadTrophies()
  .then(function (trophies) {
    TROPHIES = trophies;
    applyParams();
    wireChrome();
    renderKeep();
  })
  .catch(function (err) {
    const view = document.getElementById("view");
    if (view) view.textContent = "Could not load trophy data: " + err.message;
  });
