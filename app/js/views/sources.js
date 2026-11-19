// Sources & Save view: the citation matrix (how many of the 55 guides cite each source),
// the spoiler-setting explanation, and the tracker's export / import / reset controls.
function renderSources(root) {
  var rows = SOURCES.map(function (s) {
    return "<tr><td><span class='srcn'>" + s.id + "</span></td><td><strong>" + s.name + "</strong><br><span class='muted'>" + s.site + "</span></td><td>" + s.note + "</td><td>" + citedBy(s.id) + " of 55</td></tr>";
  }).join("");
  root.innerHTML = '<div class="tiergrid" style="grid-template-columns:2fr 1fr">' +
    '<section class="panel"><h2>Sources — read 20 Nov 2026</h2>' +
    "<p class='muted'>Every specific step in every guide carries one of these numbers. Wording in this app is our own summary; trophy names and descriptions are quoted from the official list [1].</p>" +
    '<table class="matrix"><thead><tr><th>#</th><th>Source</th><th>What we used it for</th><th>Cited by</th></tr></thead><tbody>' + rows + "</tbody></table></section>" +
    '<section class="panel"><h2>Your save</h2>' +
    "<p>Progress lives only in this browser (localStorage). Export it before switching devices.</p>" +
    '<div class="btnrow"><button class="btn" id="expBtn">Export progress (JSON)</button>' +
    '<label class="btn ghost" for="impFile">Import progress</label><input id="impFile" type="file" accept="application/json" hidden>' +
    '<button class="btn ghost" id="resetBtn">Reset tracker</button></div>' +
    '<p id="saveMsg" class="muted"></p>' +
    "<h3>Spoiler setting</h3><p>With spoilers on, story trophies you have not earned yet appear sealed in the ledger: no name, no description, no hints. Their guides open once you earn them or switch spoilers off. Non-story trophies are never sealed.</p>" +
    '<label><input type="checkbox" id="spoilerBox2"' + (store.spoilers ? " checked" : "") + "> Spoilers on (seal unearned story trophies)</label>" +
    "<h3>How citations work</h3><p>Markers like [1] or [3] after a step name the source that step rests on. Steps that are only our own reading of the official description say so in the guide note, in plain words.</p></section></div>";
  document.getElementById("expBtn").addEventListener("click", storeExport);
  document.getElementById("impFile").addEventListener("change", function (e) {
    if (!e.target.files.length) return;
    storeImport(e.target.files[0], function (err) {
      document.getElementById("saveMsg").textContent = err ? "Import failed: that file is not a Leonida Legend tracker export." : "Import done — progress restored.";
      if (!err) { updateHeader(); renderSources(root); }
    });
  });
  document.getElementById("resetBtn").addEventListener("click", function () {
    storeReset(); updateHeader();
    document.getElementById("saveMsg").textContent = "Tracker reset: earned, counts, and notes cleared.";
    renderSources(root);
  });
  document.getElementById("spoilerBox2").addEventListener("change", function (e) { store.spoilers = e.target.checked; storeSave(); });
}
