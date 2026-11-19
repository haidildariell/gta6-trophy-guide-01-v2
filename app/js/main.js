"use strict";
/* Leonida Legend — bootstrap: load data, build the audit strip from the
   data itself, wire navigation and header actions, honour URL params.
   Params: ?demo=1 ?view=ledger|roadmap|missables|sources ?open=<id> ?spoilers=on|off */

const App = {
  trophies: [],
  view: "ledger",

  showView: function (name) {
    this.view = name;
    document.querySelectorAll(".view-btn").forEach(function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-view") === name);
    });
    const root = document.getElementById("view");
    const ctx = { trophies: this.trophies, showView: function (v) { App.showView(v); } };
    if (name === "roadmap") RoadmapView.render(root, ctx);
    else if (name === "missables") MissablesView.render(root, ctx);
    else if (name === "sources") SourcesView.render(root, ctx);
    else LedgerView.render(root, ctx);
  },

  auditText: function () {
    const t = this.trophies;
    const count = function (fn) { return t.filter(fn).length; };
    const grades = {
      Platinum: count(function (x) { return x.grade === "Platinum"; }),
      Gold: count(function (x) { return x.grade === "Gold"; }),
      Silver: count(function (x) { return x.grade === "Silver"; }),
      Bronze: count(function (x) { return x.grade === "Bronze"; })
    };
    const hidden = count(function (x) { return x.hidden; });
    const guidesCited = count(function (x) { return x.sources && x.sources.length >= 1; });
    let steps = 0, citedSteps = 0;
    t.forEach(function (x) {
      x.guide.steps.forEach(function (s) {
        steps += 1;
        if (s.cite && s.cite.length >= 1) citedSteps += 1;
      });
    });
    const tier = function (k) { return count(function (x) { return x.missable === k; }); };
    return t.length + " official · " +
      grades.Platinum + "P " + grades.Gold + "G " + grades.Silver + "S " + grades.Bronze + "B · " +
      hidden + " hidden · " +
      guidesCited + "/" + t.length + " guides cite a source · " +
      citedSteps + "/" + steps + " steps cited · " +
      SOURCES.length + " sources read 20 Nov 2026 · " +
      tier("possibly") + " possibly missable · " +
      tier("watch") + " watch · " +
      tier("unconfirmed") + " unconfirmed";
  },

  seedDemo: function () {
    const demoEarned = [2, 3, 4, 8, 9, 10, 16, 21, 22, 33, 35, 36, 42];
    demoEarned.forEach(function (id) { Store.setEarned(id, true); });
    Store.setCount(15, 87);
    Store.setCount(25, 3);
    Store.setCount(31, 34);
    Store.setCount(35, 100);
    Store.setCount(42, 52);
    Store.setCount(48, 132);
    Store.setNote(37, "Save before VCIA Takedown — try the departure on the first pass.");
  },

  init: async function () {
    Store.load();
    const params = new URLSearchParams(window.location.search);
    if (params.get("demo") === "1" && !sessionStorage.getItem("leonida-demo-seeded")) {
      this.seedDemo();
      try { sessionStorage.setItem("leonida-demo-seeded", "1"); } catch (e) { /* ignore */ }
    }
    if (params.get("spoilers") === "on") Filters.spoilers = true;
    if (params.get("spoilers") === "off") Filters.spoilers = false;

    this.trophies = await loadTrophies();
    document.getElementById("audit").textContent = this.auditText();

    const openId = Number(params.get("open"));
    if (openId && this.trophies.some(function (t) { return t.id === openId; })) {
      LedgerView.selectedId = openId;
    }
    const startView = params.get("view");
    this.showView(["ledger", "roadmap", "missables", "sources"].indexOf(startView) >= 0 ? startView : "ledger");

    document.querySelectorAll(".view-btn").forEach(function (btn) {
      btn.addEventListener("click", function () { App.showView(btn.getAttribute("data-view")); });
    });
    document.getElementById("btn-export").addEventListener("click", function () { Store.exportJSON(); });
    document.getElementById("btn-reset").addEventListener("click", function () {
      if (window.confirm("Reset all progress, counts and notes?")) {
        Store.reset();
        App.showView(App.view);
      }
    });
    document.getElementById("import-file").addEventListener("change", function (ev) {
      const file = ev.target.files && ev.target.files[0];
      if (!file) return;
      Store.importJSON(file, function (ok) {
        if (ok) App.showView(App.view);
        else window.alert("That file could not be read as Leonida Legend progress.");
      });
    });
  }
};

document.addEventListener("DOMContentLoaded", function () {
  App.init().catch(function (err) {
    document.getElementById("view").innerHTML = '<p class="card">Failed to start: ' + esc(err.message) + "</p>";
  });
});
