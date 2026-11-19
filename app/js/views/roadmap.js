"use strict";
/* Leonida Legend — Roadmap view: the seven stages, in play order. */

function renderRoadmap(root, trophies) {
  root.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "roadmap";

  const intro = document.createElement("p");
  intro.className = "view-intro";
  intro.textContent = "Play the stages in order and almost nothing can strand you: story first, strands before the finale, then collectibles, mastery, and the 100 percent sweep.";
  wrap.appendChild(intro);

  STAGES.forEach(function (stage) {
    const inStage = trophies.filter(function (t) { return t.stage === stage.id; });
    const earned = inStage.filter(function (t) { return store.isEarned(t.id); });
    const pts = inStage.reduce(function (s, t) { return s + t.points; }, 0);
    const ptsEarned = earned.reduce(function (s, t) { return s + t.points; }, 0);
    const pct = inStage.length ? Math.round((earned.length / inStage.length) * 100) : 0;

    const sec = document.createElement("section");
    sec.className = "stage-card";

    const head = document.createElement("div");
    head.className = "stage-head";
    const title = document.createElement("h2");
    title.textContent = stage.id + " · " + stage.name;
    head.appendChild(title);
    const stat = document.createElement("span");
    stat.className = "stage-stat";
    stat.textContent = earned.length + "/" + inStage.length + " earned · " + ptsEarned + "/" + pts + " pts · " + pct + "%";
    head.appendChild(stat);
    sec.appendChild(head);

    const blurb = document.createElement("p");
    blurb.className = "stage-blurb";
    blurb.textContent = stage.blurb;
    sec.appendChild(blurb);

    const bar = document.createElement("div");
    bar.className = "progress";
    const fill = document.createElement("div");
    fill.className = "progress-fill";
    fill.style.width = pct + "%";
    bar.appendChild(fill);
    sec.appendChild(bar);

    const list = document.createElement("ul");
    list.className = "stage-trophies";
    inStage.forEach(function (t) {
      const li = document.createElement("li");
      li.className = store.isEarned(t.id) ? "is-earned" : "";
      const dot = document.createElement("span");
      dot.className = "medal medal-" + t.grade.toLowerCase();
      li.appendChild(dot);
      const name = document.createElement("span");
      name.textContent = displayName(t) + (store.isEarned(t.id) ? " ✓" : "");
      li.appendChild(name);
      list.appendChild(li);
    });
    sec.appendChild(list);
    wrap.appendChild(sec);
  });

  root.appendChild(wrap);
}
