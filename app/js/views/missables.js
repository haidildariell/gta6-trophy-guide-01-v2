// Missables view: a three-tier reading of the official descriptions — possibly missable, watch, and
// unconfirmed. We would rather flag a risk honestly than invent a method that no source confirms.
function tierCard(title, key, intro) {
  var list = TROPHIES.filter(function (t) { return t.missable === key; });
  var rows = list.map(function (t) {
    return "<li>" + medalHtml(t) + "<strong>" + t.name + "</strong> " + citesHtml(t.sources) +
      "<br><span class='muted'>“" + t.description + "”</span><br>" + t.missableNote + "</li>";
  }).join("");
  return '<section class="panel"><h2>' + title + " (" + list.length + ')</h2><p class="muted">' + intro + '</p><ul class="srclist">' + rows + "</ul></section>";
}
function renderMissables(root) {
  root.innerHTML = "<h2 class='serif'>Missables &amp; Unconfirmed</h2>" +
    "<p class='muted'>Built from the official descriptions [1]: one-time moments and early-chapter spots read as possibly missable, conditions that can be voided read as watch, and descriptions too vague to act on stay unconfirmed until a source pins them down.</p>" +
    '<div class="tiergrid">' +
    tierCard("Possibly missable", "missable", "Do these in the stage where they first appear. Waiting for the clean-up phase is the risk.") +
    tierCard("Watch", "watch", "Repeatable in principle, but the stated condition — a partner, a unique animal, a clean retry, no detection — is easy to break by accident.") +
    tierCard("Unconfirmed", "unconfirmed", "The official text gives no clear action, count, or place, and no source we read confirms a trigger. We list them honestly instead of guessing.") +
    "</div>";
}
