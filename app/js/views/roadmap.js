"use strict";
/* Leonida Legend — Roadmap view: the seven stages in play order,
   each with its trophies and a progress bar (earned count + points). */

const RoadmapView = {
  render: function (root, ctx) {
    const trophies = ctx.trophies;
    const sections = STAGES.map(function (stage) {
      const mine = trophies.filter(function (t) { return t.stage === stage.id; });
      const earned = mine.filter(function (t) { return Store.isEarned(t.id); });
      const pts = earned.reduce(function (s, t) { return s + t.points; }, 0);
      const totalPts = mine.reduce(function (s, t) { return s + t.points; }, 0);
      const pct = mine.length ? Math.round((earned.length / mine.length) * 100) : 0;
      const rows = mine.map(function (t) {
        const sealed = Filters.isSealed(t);
        const done = Store.isEarned(t.id);
        return '<li class="road-row' + (done ? " is-earned" : "") + '">' + medalDot(t.grade) +
          '<button type="button" class="road-name" data-open="' + t.id + '">' + (sealed ? "Hidden trophy" : esc(t.name)) + "</button>" +
          (sealed ? '<span class="seal">SEALED</span>' : "") +
          '<span class="muted">' + esc(t.grade) + " · " + t.points + " pts</span>" + missableBadge(t) +
          (done ? '<span class="done-mark">earned</span>' : "") + "</li>";
      }).join("");
      return '<section class="card stage-card"><header class="stage-head">' +
        "<h2>" + stage.id + " · " + esc(stage.name) + "</h2>" +
        '<span class="stage-count">' + earned.length + " / " + mine.length + " earned · " + pts + " / " + totalPts + " pts · " + pct + "%</span></header>" +
        '<p class="muted stage-blurb">' + esc(stage.blurb) + "</p>" +
        '<div class="bar"><div class="bar-fill" style="width:' + pct + '%"></div></div>' +
        '<ul class="road-list">' + rows + "</ul></section>";
    }).join("");
    root.innerHTML = '<div class="stack"><p class="lede">Play the stages in order and the platinum mostly organises itself: story first, sweeps second, mastery last.</p>' + sections + "</div>";
    root.querySelectorAll("[data-open]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        LedgerView.selectedId = Number(btn.getAttribute("data-open"));
        ctx.showView("ledger");
      });
    });
  }
};
