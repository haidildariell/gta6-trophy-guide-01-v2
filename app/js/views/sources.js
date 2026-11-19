"use strict";
/* Leonida Legend — Sources view: the seven numbered sources, when they
   were read, and how much of the guide rests on each one. */

const SourcesView = {
  render: function (root, ctx) {
    const counts = citationCounts(ctx.trophies);
    const totalSteps = ctx.trophies.reduce(function (s, t) { return s + t.guide.steps.length; }, 0);
    const rows = SOURCES.map(function (s) {
      return '<article class="card src-card"><h3><span class="src-n">[' + s.n + "]</span> " + esc(s.name) + "</h3>" +
        '<p class="meta-line">' + esc(s.kind) + " · read " + esc(s.read) + "</p>" +
        '<p>Cited by <strong>' + (counts.perGuide[s.n] || 0) + " of 55</strong> guides (" + Math.round(((counts.perGuide[s.n] || 0) / 55) * 100) + "%) · " + (counts.perStep[s.n] || 0) + " step citations</p></article>";
    }).join("");
    root.innerHTML = '<div class="stack">' +
      '<p class="lede">Seven sources, all read on 20 Nov 2026, stand behind the ' + totalSteps + ' steps in this guide.</p>' +
      rows +
      '<section class="card method-card"><h3>Method</h3>' +
      "<p>Every step cites the sources behind it; nothing here is copied text — guides are written for this tracker.</p>" +
      "<p>The official names, descriptions and grades come from the published trophy list (source [1]) and are reproduced exactly, because a tracker must match what the console shows. Everything else — the short guides, the steps, the roadmap order and the missable calls — is original writing for Leonida Legend, cross-checked across the sources above. Where sources disagree, the Missables view says so instead of picking a winner quietly.</p></section>" +
      "</div>";
  }
};
