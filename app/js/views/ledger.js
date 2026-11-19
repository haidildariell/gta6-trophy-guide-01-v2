// Ledger view: the dense three-panel layout — planner and checklist on the left,
// the open trophy's full cited guide in the middle, and the numbered sources on the right.
var selectedId = 28;
function rowHtml(t) {
  var sealed = isSpoilerHidden(t);
  var name = sealed ? "Sealed story trophy" : t.name;
  var desc = sealed ? "Spoilers on: earn it in game to reveal its official text here." : t.description;
  var checked = store.earned[t.id] ? " checked" : "";
  return '<li class="trow' + (t.id === selectedId ? " sel" : "") + '" data-open="' + t.id + '">' +
    '<input type="checkbox" data-earn="' + t.id + '"' + checked + ' aria-label="Mark earned">' +
    "<span>" + medalHtml(t) + '<span class="nm">' + name + "</span>" + missBadge(t) +
    (t.hidden && !sealed ? '<span class="badge b-hidden">HIDDEN</span>' : "") +
    '<br><span class="ds">' + desc + "</span><br>" +
    '<span class="stagechip">' + stageName(t.stage) + "</span> " + citesHtml(t.sources) +
    "</span></li>";
}
function detailHtml(t) {
  var sealed = isSpoilerHidden(t);
  var h = '<h2>' + medalHtml(t) + (sealed ? "Sealed story trophy" : t.name) + missBadge(t) + "</h2>";
  h += '<p class="muted">' + t.grade + " · " + t.points + " pts · " + KIND_LABELS[t.kind] + " · " + stageName(t.stage) + (t.hidden ? " · hidden trophy" : "") + "</p>";
  if (sealed) {
    h += '<p class="official">Spoilers are on, so the official description of this unearned story trophy stays sealed. Turn spoilers off in Sources &amp; Save, or earn it in game first.</p>';
    return h;
  }
  h += '<p class="official">“' + t.description + '” ' + citesHtml([1]) + "</p>";
  h += "<h3>In short</h3><p class='inshort'>" + t.guide.inShort + "</p>";
  if (t.missable) {
    var cls = t.missable === "missable" ? "missbox red" : (t.missable === "watch" ? "missbox" : "missbox grey");
    var label = t.missable === "missable" ? "Possibly missable" : (t.missable === "watch" ? "Watch — easy to void" : "Unconfirmed trigger");
    h += '<div class="' + cls + '"><strong>' + label + ".</strong> " + t.missableNote + " " + citesHtml(t.sources) + "</div>";
  }
  h += "<h3>Steps</h3><ol class='steps'>";
  t.guide.steps.forEach(function (s) { h += "<li>" + s.text + " " + citesHtml(s.cites) + "</li>"; });
  h += "</ol>";
  h += '<p class="hiddennote">' + t.guide.note + "</p>";
  if (t.target) {
    var cur = store.counts[t.id] || 0;
    h += '<div class="counter"><span>Your count</span><button data-count="-1" aria-label="Decrease">−</button><span class="n">' + cur + " / " + t.target + '</span><button data-count="1" aria-label="Increase">+</button><span class="muted">target from PSN progress ' + citesHtml([2]) + "</span></div>";
  }
  h += '<h3>Your notes</h3><textarea id="noteBox" placeholder="Your own notes for this trophy…">' + (store.notes[t.id] || "") + "</textarea>";
  h += '<div class="btnrow"><button class="btn" data-toggle-earned>' + (store.earned[t.id] ? "Mark as not earned" : "Mark earned") + '</button><button class="btn ghost" data-save-note>Save note</button></div>';
  return h;
}
function sourcesPanelHtml() {
  var h = "<h2>Sources</h2><p class='muted'>All seven read 20 Nov 2026. Markers like [3] in every guide step point here.</p><ul class='srclist'>";
  SOURCES.forEach(function (s) {
    h += "<li><span class='srcn'>" + s.id + "</span><strong>" + s.name + "</strong> <span class='muted'>(" + s.site + ")</span><br>" + s.note + "<br><span class='muted'>Cited by " + citedBy(s.id) + " of 55 guides.</span></li>";
  });
  return h + "</ul>";
}
function renderLedger(root) {
  var counts = kindCounts();
  var chips = '<button class="chip' + (filters.kind === "all" ? " active" : "") + '" data-kind="all">All · ' + counts.all + "</button>";
  Object.keys(KIND_LABELS).forEach(function (k) {
    chips += '<button class="chip' + (filters.kind === k ? " active" : "") + '" data-kind="' + k + '">' + KIND_LABELS[k] + " · " + (counts[k] || 0) + "</button>";
  });
  var next = nextUpList().map(function (t) {
    var nm = isSpoilerHidden(t) ? "Sealed story trophy" : t.name;
    return "<li>" + medalHtml(t) + "<strong>" + nm + "</strong> " + missBadge(t) + "<br><span class='muted'>" + stageName(t.stage) + "</span></li>";
  }).join("");
  var list = roadmapOrder().filter(trophyMatches).map(rowHtml).join("");
  var sel = TROPHIES.find(function (t) { return t.id === selectedId; }) || TROPHIES[0];
  root.innerHTML =
    '<div class="ledger">' +
    '<section class="panel"><h2>Next Up</h2><ul class="nextup">' + (next || "<li>All 55 earned — platinum time.</li>") + "</ul>" +
    '<input class="search" id="searchBox" type="search" placeholder="Search trophies…" value="' + filters.q.replace(/"/g, "&quot;") + '">' +
    '<div class="chips">' + chips + "</div>" +
    '<div class="toggles"><label><input type="checkbox" id="hideEarned"' + (filters.hideEarned ? " checked" : "") + "> Hide earned</label>" +
    '<label>Spoilers <input type="checkbox" id="spoilerBox"' + (store.spoilers ? " checked" : "") + "> on</label></div>" +
    '<p class="muted" id="listCount"></p><ul class="tlist">' + list + "</ul></section>" +
    '<section class="panel detail" id="detailPanel">' + detailHtml(sel) + "</section>" +
    '<aside class="panel">' + sourcesPanelHtml() + "</aside></div>";
  var shown = roadmapOrder().filter(trophyMatches).length;
  document.getElementById("listCount").textContent = shown + " of 55 shown";
  bindLedger(root);
}
function refreshDetail() {
  var sel = TROPHIES.find(function (t) { return t.id === selectedId; }) || TROPHIES[0];
  var panel = document.getElementById("detailPanel");
  if (panel) panel.innerHTML = detailHtml(sel);
}
function bindLedger(root) {
  root.querySelectorAll("[data-kind]").forEach(function (b) {
    b.addEventListener("click", function () { filters.kind = b.getAttribute("data-kind"); renderLedger(root); });
  });
  var search = document.getElementById("searchBox");
  search.addEventListener("input", function () {
    filters.q = search.value;
    var pos = search.selectionStart;
    renderLedger(root);
    var again = document.getElementById("searchBox");
    again.focus(); again.setSelectionRange(pos, pos);
  });
  document.getElementById("hideEarned").addEventListener("change", function (e) { filters.hideEarned = e.target.checked; renderLedger(root); });
  document.getElementById("spoilerBox").addEventListener("change", function (e) { store.spoilers = e.target.checked; storeSave(); renderLedger(root); });
  root.querySelectorAll("[data-open]").forEach(function (row) {
    row.addEventListener("click", function (e) {
      if (e.target.tagName === "INPUT") return;
      selectedId = Number(row.getAttribute("data-open"));
      root.querySelectorAll(".trow").forEach(function (r) { r.classList.toggle("sel", Number(r.getAttribute("data-open")) === selectedId); });
      refreshDetail(); bindDetail(root);
    });
  });
  root.querySelectorAll("[data-earn]").forEach(function (box) {
    box.addEventListener("change", function () { setEarned(Number(box.getAttribute("data-earn")), box.checked); updateHeader(); refreshDetail(); bindDetail(root); });
  });
  bindDetail(root);
}
function bindDetail(root) {
  var panel = document.getElementById("detailPanel");
  if (!panel) return;
  panel.querySelectorAll("[data-count]").forEach(function (b) {
    b.addEventListener("click", function () {
      var t = TROPHIES.find(function (x) { return x.id === selectedId; });
      var next = Math.max(0, Math.min(t.target || 0, (store.counts[t.id] || 0) + Number(b.getAttribute("data-count"))));
      setCount(t.id, next);
      if (t.target && next >= t.target) setEarned(t.id, true);
      updateHeader(); refreshDetail(); bindDetail(root);
    });
  });
  var toggle = panel.querySelector("[data-toggle-earned]");
  if (toggle) toggle.addEventListener("click", function () { setEarned(selectedId, !store.earned[selectedId]); updateHeader(); renderLedger(document.getElementById("viewRoot")); });
  var save = panel.querySelector("[data-save-note]");
  if (save) save.addEventListener("click", function () { setNote(selectedId, document.getElementById("noteBox").value.trim()); save.textContent = "Saved ✓"; });
}
