"use strict";
/* Leonida Legend — Sources view: every source, when it was read, and how
   many of the 55 guides lean on it. */

function renderSources(root, trophies) {
  root.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "sources-view";

  const intro = document.createElement("p");
  intro.className = "view-intro";
  intro.textContent = "Every guide in this tracker stands on the seven sources below, all read on 20 Nov 2026. Citation counts show how many of the 55 guides cite each source in their steps.";
  wrap.appendChild(intro);

  const counts = citationCounts(trophies);
  const list = document.createElement("ol");
  list.className = "source-list";
  SOURCES.forEach(function (s) {
    const li = document.createElement("li");
    li.className = "source-entry";
    const name = document.createElement("strong");
    name.textContent = "[" + s.n + "] " + s.name;
    li.appendChild(name);
    const meta = document.createElement("span");
    meta.className = "source-meta";
    meta.textContent = " — " + s.kind + " · read " + s.read + " · cited by " + (counts[s.n] || 0) + " of 55 guides";
    li.appendChild(meta);
    list.appendChild(li);
  });
  wrap.appendChild(list);

  const totalCites = SOURCES.reduce(function (s, src) { return s + (counts[src.n] || 0); }, 0);
  const totalLine = document.createElement("p");
  totalLine.className = "view-intro";
  totalLine.textContent = "Across all 55 guides, the sources are cited " + totalCites + " times in total (a guide can cite several sources).";
  wrap.appendChild(totalLine);

  const method = document.createElement("div");
  method.className = "method-note";
  const mh = document.createElement("h2");
  mh.textContent = "Method";
  method.appendChild(mh);
  const mp = document.createElement("p");
  mp.textContent = "Every step cites the sources behind it; nothing here is copied text — guides are written for this tracker.";
  method.appendChild(mp);
  const mp2 = document.createElement("p");
  mp2.textContent = "Trophy names, descriptions and grades are the official list values. Where sources disagree — most often on missability — the Missables page says so instead of picking a side quietly.";
  method.appendChild(mp2);
  wrap.appendChild(method);

  root.appendChild(wrap);
}
