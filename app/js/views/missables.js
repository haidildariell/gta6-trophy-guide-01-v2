"use strict";
/* Leonida Legend — Missables view: the eleven flagged trophies grouped
   by confidence tier, each with its note. "Sources disagree" marks the
   flags where the read sources do not tell the same story. */

const DISAGREE_IDS = { 37: true, 38: true, 48: true, 49: true, 51: true };

const MissablesView = {
  render: function (root, ctx) {
    const tiers = [
      { key: "possibly", title: "Possibly missable", blurb: "Best evidence says a real window exists. Protect these with a manual save." },
      { key: "watch", title: "Watch", blurb: "Not proven missable, but each depends on a partner, a chain or a clean attempt. Handle with care." },
      { key: "unconfirmed", title: "Unconfirmed", blurb: "The descriptions are too vague to call. Attempts are cheap; keep a save and try." }
    ];
    const groups = tiers.map(function (tier) {
      const mine = ctx.trophies.filter(function (t) { return t.missable === tier.key; });
      const cards = mine.map(function (t) {
        const sealed = Filters.isSealed(t);
        return '<article class="card miss-card"><h3>' + medalDot(t.grade) +
          ' <button type="button" class="miss-name" data-open="' + t.id + '">' + (sealed ? "Hidden trophy" : esc(t.name)) + "</button>" +
          (sealed ? ' <span class="seal">SEALED</span>' : "") + "</h3>" +
          (sealed ? "" : '<p class="official">“' + esc(t.description) + '”</p>') +
          '<p>' + esc(t.missableNote || "") + "</p>" +
          '<p class="meta-line">' + t.stage + " · " + esc(stageOf(t.stage).name) + (Store.isEarned(t.id) ? ' · <span class="done-mark">earned — safe now</span>' : " · not yet earned") + " · sources " + t.sources.map(function (n) { return "[" + n + "]"; }).join("") +
          (DISAGREE_IDS[t.id] ? ' · <span class="badge badge-disagree">sources disagree</span>' : "") + "</p></article>";
      }).join("");
      return '<section class="miss-group"><h2>' + tier.title + ' <span class="muted">(' + mine.length + ")</span></h2>" +
        '<p class="muted">' + tier.blurb + "</p>" + cards + "</section>";
    }).join("");
    root.innerHTML = '<div class="stack"><p class="lede">Eleven of the 55 trophies carry a missable flag. Everything else can be cleaned up in free roam after the credits — these eleven get a plan and a save file.</p>' + groups + "</div>";
    root.querySelectorAll("[data-open]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        LedgerView.selectedId = Number(btn.getAttribute("data-open"));
        ctx.showView("ledger");
      });
    });
  }
};
