"use strict";
/* Leonida Legend — Ledger view: filters + checklist | detail | next up + sources.
   All three panes live on one screen; selecting a row swaps only the detail. */

const LedgerView = {
  selectedId: null,

  render: function (root, ctx) {
    const trophies = ctx.trophies;
    if (this.selectedId == null || !trophies.some(function (t) { return t.id === LedgerView.selectedId; })) {
      this.selectedId = trophies[0].id;
    }
    const selected = trophies.find(function (t) { return t.id === LedgerView.selectedId; });
    const progress = computeProgress(trophies);
    const lvl = progress.level;

    root.innerHTML =
      '<div class="ledger">' +
        '<section class="pane pane-list">' + this.filterBarHTML(progress, lvl) + this.listHTML(trophies) + "</section>" +
        '<section class="pane pane-detail">' + this.detailHTML(selected) + "</section>" +
        '<aside class="pane pane-side">' + this.nextUpHTML(trophies) + this.sourcesRailHTML(trophies) + "</aside>" +
      "</div>";
    this.wire(root, ctx);
    const row = root.querySelector('.trow[data-id="' + this.selectedId + '"]');
    const list = root.querySelector(".checklist");
    if (row && list) {
      /* Scroll only the checklist, never the page, so the masthead stays put. */
      const delta = row.getBoundingClientRect().top - list.getBoundingClientRect().top;
      if (delta < 0 || delta > list.clientHeight - 48) list.scrollTop += delta - 12;
    }
  },

  filterBarHTML: function (progress, lvl) {
    const kindChips = KINDS.map(function (k) {
      return '<button type="button" class="chip' + (Filters.kinds.has(k) ? " is-on" : "") + '" data-kind="' + k + '">' + k + "</button>";
    }).join("");
    const gradeChips = GRADES.map(function (g) {
      return '<button type="button" class="chip' + (Filters.grades.has(g) ? " is-on" : "") + '" data-grade="' + g + '">' + g + "</button>";
    }).join("");
    const stageOpts = ['<option value="">All stages</option>'].concat(STAGES.map(function (s) {
      return '<option value="' + s.id + '"' + (Filters.stage === s.id ? " selected" : "") + ">" + s.id + " · " + esc(s.name) + "</option>";
    })).join("");
    return '<div class="filterbar">' +
      '<div class="progress-line"><strong>' + progress.earnedCount + " / 55 earned</strong> · " + progress.points + " pts · PSN level " + lvl.level +
      ' <span class="muted">(' + lvl.intoLevel + " / " + lvl.nextCost + " to next)</span></div>" +
      '<input id="f-search" type="search" placeholder="Search name, description, kind…" value="' + esc(Filters.search) + '">' +
      '<div class="chiprow" aria-label="Kind filters">' + kindChips + "</div>" +
      '<div class="chiprow" aria-label="Grade filters">' + gradeChips + "</div>" +
      '<div class="filterrow"><select id="f-stage">' + stageOpts + "</select>" +
      '<label class="toggle"><input id="f-hide" type="checkbox"' + (Filters.hideEarned ? " checked" : "") + "> Hide earned</label>" +
      '<label class="toggle"><input id="f-spoil" type="checkbox"' + (Filters.spoilers ? " checked" : "") + "> Spoilers</label></div>" +
      "</div>";
  },

  listHTML: function (trophies) {
    const rows = trophies.filter(function (t) { return Filters.matches(t); }).map(function (t) {
      const earned = Store.isEarned(t.id);
      const sealed = Filters.isSealed(t);
      const name = sealed ? '<span class="sealed-name">Hidden trophy</span>' : esc(t.name);
      return '<div class="trow' + (t.id === LedgerView.selectedId ? " is-selected" : "") + (earned ? " is-earned" : "") + '" data-id="' + t.id + '">' +
        '<input type="checkbox" class="t-check" data-id="' + t.id + '"' + (earned ? " checked" : "") + ' aria-label="Mark earned">' +
        medalDot(t.grade) +
        '<span class="t-name">' + name + "</span>" +
        (sealed ? '<span class="seal">SEALED</span>' : "") +
        '<span class="t-grade">' + esc(t.grade) + "</span>" +
        '<span class="t-points">' + t.points + " pts</span>" +
        missableBadge(t) +
        "</div>";
    }).join("");
    return '<div class="checklist">' + (rows || '<p class="muted empty-note">No trophies match the current filters.</p>') + "</div>";
  },

  detailHTML: function (t) {
    if (!t) return '<p class="muted">Select a trophy.</p>';
    const sealed = Filters.isSealed(t);
    const earned = Store.isEarned(t.id);
    const stage = stageOf(t.stage);
    let html = '<article class="detail card">';
    if (sealed) {
      html += '<div class="seal-card"><span class="seal seal-big">SEALED</span>' +
        "<h2>Hidden trophy</h2>" +
        '<p class="muted">Spoilers are on, so this hidden trophy stays sealed until you earn it or turn spoilers off. Its grade, stage and points stay visible so the roadmap still adds up.</p>' +
        '<p>' + medalDot(t.grade) + " <strong>" + esc(t.grade) + "</strong> · " + t.points + " pts · " + t.stage + " · " + esc(stage.name) + " · " + esc(t.kind) + "</p>" +
        missableBadge(t) +
        "</div>";
    } else {
      html += "<h2>" + medalDot(t.grade) + " " + esc(t.name) + "</h2>" +
        '<p class="official">“' + esc(t.description) + '”</p>' +
        '<p class="meta-line">' + esc(t.grade) + " · " + t.points + " pts · " + t.stage + " · " + esc(stage.name) + " · " + esc(t.kind) + (t.hidden ? " · hidden trophy" : "") + "</p>" +
        missableBadge(t);
      if (t.missable && t.missableNote) {
        html += '<div class="missable-box"><strong>' + esc(MISSABLE_LABEL[t.missable]) + ".</strong> " + esc(t.missableNote) + "</div>";
      }
      html += '<h3>In short</h3><p>' + esc(t.guide.inShort) + "</p>" +
        "<h3>Steps</h3><ol class=\"steps\">" +
        t.guide.steps.map(function (s) { return "<li>" + esc(s.text) + citeMarks(s.cite) + "</li>"; }).join("") +
        "</ol>" +
        '<p class="src-line">Guide sources: ' + t.sources.map(function (n) { const s = sourceByN(n); return "[" + n + "] " + esc(s ? s.name : n); }).join(" · ") + "</p>";
    }
    if (t.target) {
      html += '<div class="counter-box"><label for="count-input">Your count</label>' +
        '<input id="count-input" type="number" min="0" step="1" value="' + Store.getCount(t.id) + '">' +
        '<span class="muted">of ' + t.target.toLocaleString("en-US") + " · " + Math.min(100, Math.floor((Store.getCount(t.id) / t.target) * 100)) + "% there</span></div>";
    }
    html += '<div class="note-box"><label for="note-input">Your notes</label>' +
      '<textarea id="note-input" rows="3" placeholder="Spots, routes, reminders…">' + esc(Store.getNote(t.id)) + "</textarea></div>" +
      '<button type="button" id="btn-earned" class="earned-btn' + (earned ? " is-earned" : "") + '">' + (earned ? "Earned ✓ — tap to undo" : "Mark as earned") + "</button>" +
      "</article>";
    return html;
  },

  nextUpHTML: function (trophies) {
    const upcoming = trophies.filter(function (t) { return !Store.isEarned(t.id); }).slice().sort(function (a, b) {
      if (a.stage !== b.stage) return a.stage < b.stage ? -1 : 1;
      return GRADE_ORDER[b.grade] - GRADE_ORDER[a.grade];
    }).slice(0, 5);
    const items = upcoming.map(function (t) {
      const sealed = Filters.isSealed(t);
      const reason = t.missable ? MISSABLE_LABEL[t.missable] + " — do not leave it late"
        : (t.target ? "Counter at " + Store.getCount(t.id) + " / " + t.target.toLocaleString("en-US")
        : t.stage + " · " + stageOf(t.stage).name);
      return '<li><button type="button" class="next-item" data-open="' + t.id + '">' + medalDot(t.grade) +
        '<span class="next-name">' + (sealed ? "Hidden trophy" : esc(t.name)) + "</span>" +
        (sealed ? '<span class="seal">SEALED</span>' : "") +
        '<span class="next-reason">' + esc(reason) + "</span></button></li>";
    }).join("");
    return '<section class="card side-card"><h3>Next Up</h3>' +
      (items ? "<ul class=\"next-list\">" + items + "</ul>" : '<p class="muted">Everything is earned. Legend status.</p>') + "</section>";
  },

  sourcesRailHTML: function (trophies) {
    const counts = citationCounts(trophies).perGuide;
    const rows = SOURCES.map(function (s) {
      return '<li><span class="src-n">[' + s.n + "]</span> <strong>" + esc(s.name) + '</strong> <span class="muted">— cited by ' + (counts[s.n] || 0) + " of 55 guides</span></li>";
    }).join("");
    return '<section class="card side-card"><h3>Sources</h3><ul class="src-rail">' + rows + "</ul>" +
      '<p class="muted">Read 20 Nov 2026. Full detail in the Sources view.</p></section>';
  },

  wire: function (root, ctx) {
    const rerender = function () { LedgerView.render(root, ctx); };
    root.querySelectorAll(".trow").forEach(function (row) {
      row.addEventListener("click", function (ev) {
        if (ev.target.classList.contains("t-check")) return;
        LedgerView.selectedId = Number(row.getAttribute("data-id"));
        rerender();
      });
    });
    root.querySelectorAll(".t-check").forEach(function (box) {
      box.addEventListener("change", function () {
        Store.toggleEarned(Number(box.getAttribute("data-id")));
        rerender();
      });
    });
    root.querySelectorAll("[data-open]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        LedgerView.selectedId = Number(btn.getAttribute("data-open"));
        rerender();
      });
    });
    const search = root.querySelector("#f-search");
    if (search) search.addEventListener("input", function () {
      Filters.search = search.value;
      const list = root.querySelector(".checklist");
      if (list) {
        list.outerHTML = LedgerView.listHTML(ctx.trophies);
        LedgerView.wireListOnly(root, ctx);
      }
    });
    root.querySelectorAll("[data-kind]").forEach(function (chip) {
      chip.addEventListener("click", function () { Filters.toggleSetValue(Filters.kinds, chip.getAttribute("data-kind")); rerender(); });
    });
    root.querySelectorAll("[data-grade]").forEach(function (chip) {
      chip.addEventListener("click", function () { Filters.toggleSetValue(Filters.grades, chip.getAttribute("data-grade")); rerender(); });
    });
    const stageSel = root.querySelector("#f-stage");
    if (stageSel) stageSel.addEventListener("change", function () { Filters.stage = stageSel.value; rerender(); });
    const hide = root.querySelector("#f-hide");
    if (hide) hide.addEventListener("change", function () { Filters.hideEarned = hide.checked; rerender(); });
    const spoil = root.querySelector("#f-spoil");
    if (spoil) spoil.addEventListener("change", function () { Filters.spoilers = spoil.checked; rerender(); });
    const countInput = root.querySelector("#count-input");
    if (countInput) countInput.addEventListener("change", function () {
      Store.setCount(LedgerView.selectedId, countInput.value);
      rerender();
    });
    const noteInput = root.querySelector("#note-input");
    if (noteInput) noteInput.addEventListener("change", function () {
      Store.setNote(LedgerView.selectedId, noteInput.value);
    });
    const earnedBtn = root.querySelector("#btn-earned");
    if (earnedBtn) earnedBtn.addEventListener("click", function () {
      Store.toggleEarned(LedgerView.selectedId);
      rerender();
    });
  },

  wireListOnly: function (root, ctx) {
    root.querySelectorAll(".trow").forEach(function (row) {
      row.addEventListener("click", function (ev) {
        if (ev.target.classList.contains("t-check")) return;
        LedgerView.selectedId = Number(row.getAttribute("data-id"));
        LedgerView.render(root, ctx);
      });
    });
    root.querySelectorAll(".t-check").forEach(function (box) {
      box.addEventListener("change", function () {
        Store.toggleEarned(Number(box.getAttribute("data-id")));
        LedgerView.render(root, ctx);
      });
    });
  }
};
