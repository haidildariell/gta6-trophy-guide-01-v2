"use strict";
/* Leonida Legend — Ledger view: filters + checklist | detail | next up + sources.
   All three panes live on one screen so a trophy can be checked, read and
   planned without leaving the view. */

let selectedId = null;

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}

function medalDot(grade) {
  const d = el("span", "medal medal-" + grade.toLowerCase());
  d.title = grade;
  return d;
}

function missableBadge(t) {
  if (!t.missable) return null;
  const labels = { possibly: "Possibly missable", watch: "Watch", unconfirmed: "Unconfirmed" };
  return el("span", "badge badge-" + t.missable, labels[t.missable] || t.missable);
}

function citeMarks(step) {
  const wrap = el("span", "cites");
  (step.cite || []).forEach(function (n) {
    wrap.appendChild(el("span", "cite", "[" + n + "]"));
  });
  return wrap;
}

function renderLedger(root, trophies, rerender) {
  root.innerHTML = "";
  const layout = el("div", "ledger-grid");

  /* ---- Left pane: filters + checklist ---- */
  const left = el("section", "pane pane-left");
  left.appendChild(buildFilterBar(trophies, rerender));
  const list = el("div", "checklist");
  const visible = trophies.filter(function (t) { return trophyMatches(t, filters); });
  if (!visible.length) list.appendChild(el("p", "empty", "No trophies match these filters."));
  visible.forEach(function (t) {
    list.appendChild(checklistRow(t, rerender));
  });
  left.appendChild(list);
  layout.appendChild(left);

  /* ---- Middle pane: detail ---- */
  const mid = el("section", "pane pane-mid");
  const current = trophies.find(function (t) { return t.id === selectedId; }) || visible[0] || trophies[0];
  if (current) {
    selectedId = current.id;
    mid.appendChild(buildDetail(current, rerender));
  }
  layout.appendChild(mid);

  /* ---- Right pane: next up + sources rail ---- */
  const right = el("aside", "pane pane-right");
  right.appendChild(buildNextUp(trophies, rerender));
  right.appendChild(buildSourcesRail(trophies));
  layout.appendChild(right);

  root.appendChild(layout);

  /* Keep the selected checklist row in view inside the scrolling list. */
  const selRow = list.querySelector(".row.is-selected");
  if (selRow) {
    const listRect = list.getBoundingClientRect();
    const rowRect = selRow.getBoundingClientRect();
    list.scrollTop += rowRect.top - listRect.top - 60;
  }
}

function buildFilterBar(trophies, rerender) {
  const bar = el("div", "filter-bar");

  const search = el("input", "search");
  search.type = "search";
  search.placeholder = "Search name, description, kind…";
  search.value = filters.text;
  search.addEventListener("input", function () {
    filters.text = search.value;
    rerender(false);
    const again = document.querySelector(".search");
    if (again) { again.focus(); again.setSelectionRange(again.value.length, again.value.length); }
  });
  bar.appendChild(search);

  bar.appendChild(chipRow("Kind", KINDS, filters.kinds, function (v) {
    filters.kinds.has(v) ? filters.kinds.delete(v) : filters.kinds.add(v);
    rerender();
  }));
  bar.appendChild(chipRow("Grade", GRADES, filters.grades, function (v) {
    filters.grades.has(v) ? filters.grades.delete(v) : filters.grades.add(v);
    rerender();
  }));

  const stageSel = el("select", "stage-select");
  const all = el("option", "", "All stages");
  all.value = "";
  stageSel.appendChild(all);
  STAGES.forEach(function (s) {
    const o = el("option", "", s.id + " · " + s.name);
    o.value = s.id;
    stageSel.appendChild(o);
  });
  stageSel.value = filters.stage;
  stageSel.addEventListener("change", function () { filters.stage = stageSel.value; rerender(); });
  bar.appendChild(stageSel);

  const hideLab = el("label", "toggle");
  const hideBox = el("input");
  hideBox.type = "checkbox";
  hideBox.checked = filters.hideEarned;
  hideBox.addEventListener("change", function () { filters.hideEarned = hideBox.checked; rerender(); });
  hideLab.appendChild(hideBox);
  hideLab.appendChild(el("span", "", "Hide earned"));
  bar.appendChild(hideLab);

  const spoilLab = el("label", "toggle");
  const spoilBox = el("input");
  spoilBox.type = "checkbox";
  spoilBox.checked = filters.spoilers;
  spoilBox.addEventListener("change", function () { filters.spoilers = spoilBox.checked; rerender(); });
  spoilLab.appendChild(spoilBox);
  spoilLab.appendChild(el("span", "", "Spoiler seal"));
  bar.appendChild(spoilLab);

  return bar;
}

function checklistRow(t, rerender) {
  const row = el("div", "row" + (t.id === selectedId ? " is-selected" : "") + (store.isEarned(t.id) ? " is-earned" : ""));
  const box = el("input", "row-check");
  box.type = "checkbox";
  box.checked = store.isEarned(t.id);
  box.setAttribute("aria-label", "Mark " + t.name + " earned");
  box.addEventListener("click", function (ev) { ev.stopPropagation(); });
  box.addEventListener("change", function () { store.setEarned(t.id, box.checked); rerender(); });
  row.appendChild(box);
  row.appendChild(medalDot(t.grade));

  const main = el("span", "row-main");
  if (isSealed(t)) {
    main.appendChild(el("span", "sealed-name", "— sealed —"));
    main.appendChild(el("span", "seal-stamp", "SEALED"));
  } else {
    main.appendChild(el("span", "row-name", t.name));
  }
  let meta = t.grade + " · " + t.points + " pts · " + t.stage;
  if (t.target && store.getCount(t.id) > 0 && !store.isEarned(t.id)) {
    meta += " · " + store.getCount(t.id) + "/" + t.target;
  }
  main.appendChild(el("span", "row-meta", meta));
  row.appendChild(main);

  const badge = missableBadge(t);
  if (badge) row.appendChild(badge);

  row.addEventListener("click", function () { selectedId = t.id; rerender(); });
  return row;
}

function buildDetail(t, rerender) {
  const d = el("article", "detail");
  const head = el("div", "detail-head");
  head.appendChild(medalDot(t.grade));
  if (isSealed(t)) {
    head.appendChild(el("h2", "sealed-name", "— sealed trophy —"));
    head.appendChild(el("span", "seal-stamp big", "SEALED"));
  } else {
    head.appendChild(el("h2", "", t.name));
  }
  d.appendChild(head);

  d.appendChild(el("p", "detail-meta",
    t.grade + " · " + t.points + " points · " + stageOf(t.stage).id + " " + stageOf(t.stage).name +
    " · " + t.kind + (t.hidden ? " · hidden trophy" : "")));

  if (!isSealed(t)) {
    d.appendChild(el("p", "official-desc", t.description));
    d.appendChild(el("h3", "", "In short"));
    d.appendChild(el("p", "in-short", t.guide.inShort));
    d.appendChild(el("h3", "", "Steps"));
    const ol = el("ol", "steps");
    t.guide.steps.forEach(function (step) {
      const li = el("li", "step");
      li.appendChild(el("span", "step-text", step.text + " "));
      li.appendChild(citeMarks(step));
      ol.appendChild(li);
    });
    d.appendChild(ol);
  } else {
    d.appendChild(el("p", "in-short", "This trophy is hidden and the spoiler seal is on. Earn it, or switch the seal off, to reveal its guide."));
  }

  if (t.missable) {
    const box = el("div", "missable-box missable-" + t.missable);
    box.appendChild(el("strong", "", (missableBadge(t) || {}).textContent || t.missable));
    box.appendChild(el("p", "", t.missableNote || ""));
    d.appendChild(box);
  }

  if (t.target) {
    const counter = el("div", "counter");
    counter.appendChild(el("label", "", "Your count (target " + t.target + ")"));
    const input = el("input", "count-input");
    input.type = "number";
    input.min = "0";
    input.value = String(store.getCount(t.id) || "");
    input.placeholder = "0";
    input.addEventListener("change", function () { store.setCount(t.id, input.value); rerender(); });
    counter.appendChild(input);
    d.appendChild(counter);
  }

  const noteWrap = el("div", "notes");
  noteWrap.appendChild(el("label", "", "Your notes"));
  const area = el("textarea", "note-area");
  area.rows = 3;
  area.value = store.getNote(t.id);
  area.placeholder = "Private notes for this trophy…";
  area.addEventListener("change", function () { store.setNote(t.id, area.value); });
  noteWrap.appendChild(area);
  d.appendChild(noteWrap);

  const earnBtn = el("button", "earn-btn" + (store.isEarned(t.id) ? " is-earned" : ""),
    store.isEarned(t.id) ? "Earned ✓ — tap to undo" : "Mark as earned");
  earnBtn.type = "button";
  earnBtn.addEventListener("click", function () { store.toggleEarned(t.id); rerender(); });
  d.appendChild(earnBtn);

  return d;
}

function nextUpReason(t) {
  if (t.missable === "possibly") return "Possibly missable — do it before the story moves on";
  if (t.missable === "watch") return "On the missable watch list";
  if (t.target && store.getCount(t.id) > 0) return "In progress: " + store.getCount(t.id) + " / " + t.target;
  return stageOf(t.stage).name + " · " + t.grade + " (" + t.points + " pts)";
}

function buildNextUp(trophies, rerender) {
  const panel = el("div", "next-up");
  panel.appendChild(el("h3", "", "Next Up"));
  const upcoming = trophies
    .filter(function (t) { return !store.isEarned(t.id) && t.id !== 1; })
    .sort(function (a, b) {
      if (a.stage !== b.stage) return a.stage < b.stage ? -1 : 1;
      return GRADE_ORDER[b.grade] - GRADE_ORDER[a.grade];
    })
    .slice(0, 5);
  if (!upcoming.length) panel.appendChild(el("p", "empty", "Everything is earned. Legend status achieved."));
  upcoming.forEach(function (t) {
    const item = el("button", "next-item");
    item.type = "button";
    item.appendChild(medalDot(t.grade));
    const txt = el("span", "next-text");
    txt.appendChild(el("span", "next-name", displayName(t)));
    txt.appendChild(el("span", "next-reason", nextUpReason(t)));
    item.appendChild(txt);
    item.addEventListener("click", function () { selectedId = t.id; rerender(); });
    panel.appendChild(item);
  });
  return panel;
}

function buildSourcesRail(trophies) {
  const rail = el("div", "sources-rail");
  rail.appendChild(el("h3", "", "Sources"));
  const counts = citationCounts(trophies);
  SOURCES.forEach(function (s) {
    const row = el("div", "source-row");
    row.appendChild(el("span", "source-n", "[" + s.n + "]"));
    const txt = el("span", "source-text");
    txt.appendChild(el("span", "source-name", s.name));
    txt.appendChild(el("span", "source-cited", "cited by " + (counts[s.n] || 0) + " of 55 guides"));
    row.appendChild(txt);
    rail.appendChild(row);
  });
  return rail;
}
