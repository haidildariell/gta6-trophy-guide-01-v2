"use strict";
/* Leonida Legend — Missables view: the three caution tiers, with notes. */

const MISSABLE_TIERS = [
  { key: "possibly", title: "Possibly missable", blurb: "Evidence points to a real lock. Do these before the story moves past them, or keep a save." },
  { key: "watch", title: "Watch", blurb: "Probably safe, but strand-style trophies have a habit of stalling. Clear them before the finale." },
  { key: "unconfirmed", title: "Unconfirmed", blurb: "The descriptions are vague and guides have not converged. Best current readings are noted; normal play likely covers them." }
];

/* Trophies where the sources visibly disagree get an extra tag. */
const DISAGREE_IDS = { 22: true, 23: true, 24: true, 26: true, 27: true, 37: true, 38: true, 48: true, 50: true };

function renderMissables(root, trophies) {
  root.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "missables";

  const intro = document.createElement("p");
  intro.className = "view-intro";
  intro.textContent = "Nothing on the official list is confirmed missable. This page tracks the trophies worth caution, tiered by how strong the evidence is — and says plainly where sources disagree.";
  wrap.appendChild(intro);

  MISSABLE_TIERS.forEach(function (tier) {
    const group = trophies.filter(function (t) { return t.missable === tier.key; });
    const sec = document.createElement("section");
    sec.className = "tier-card tier-" + tier.key;

    const h = document.createElement("h2");
    h.textContent = tier.title + " (" + group.length + ")";
    sec.appendChild(h);
    const blurb = document.createElement("p");
    blurb.className = "tier-blurb";
    blurb.textContent = tier.blurb;
    sec.appendChild(blurb);

    group.forEach(function (t) {
      const card = document.createElement("article");
      card.className = "missable-card";
      const dot = document.createElement("span");
      dot.className = "medal medal-" + t.grade.toLowerCase();
      card.appendChild(dot);
      const body = document.createElement("div");
      const name = document.createElement("strong");
      name.textContent = t.name + (store.isEarned(t.id) ? " ✓ earned" : "");
      body.appendChild(name);
      body.appendChild(document.createTextNode(" — " + t.description));
      const note = document.createElement("p");
      note.className = "missable-note";
      note.textContent = t.missableNote || "";
      body.appendChild(note);
      if (DISAGREE_IDS[t.id]) {
        const tag = document.createElement("span");
        tag.className = "disagree-tag";
        tag.textContent = "sources disagree";
        body.appendChild(tag);
      }
      card.appendChild(body);
      sec.appendChild(card);
    });

    wrap.appendChild(sec);
  });

  root.appendChild(wrap);
}
