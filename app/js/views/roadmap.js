// Roadmap view: the seven stages to the platinum, every one of the 55 trophies placed exactly once,
// with per-stage progress bars. Stage order follows the platinum roadmaps in our sources [3][6].
function renderRoadmap(root) {
  var cards = STAGES.map(function (s) {
    var list = TROPHIES.filter(function (t) { return t.stage === s.id; });
    var done = list.filter(function (t) { return store.earned[t.id]; }).length;
    var pct = list.length ? Math.round((done / list.length) * 100) : 0;
    var rows = list.map(function (t) {
      return "<li>" + medalHtml(t) + (store.earned[t.id] ? "✓ " : "") + t.name + missBadge(t) + " " + citesHtml(t.sources) + "</li>";
    }).join("");
    return '<section class="panel stagecard"><h2>' + s.id + " · " + s.name + "</h2>" +
      '<p class="muted">' + s.blurb + "</p>" +
      '<div class="bar"><div class="barfill" style="width:' + pct + '%"></div></div>' +
      '<p class="muted">' + done + " / " + list.length + " earned in this stage</p>" +
      '<ul class="srclist">' + rows + "</ul></section>";
  }).join("");
  root.innerHTML = "<h2 class='serif'>Roadmap to the Platinum</h2>" +
    "<p class='muted'>Seven stages, all 55 trophies placed once. Built from the official descriptions [1] and ordered with the platinum roadmaps [3][6]. Finish a stage before leaning on the next and the platinum stays a checklist, not a grind.</p>" +
    '<div class="stagegrid">' + cards + "</div>";
}
