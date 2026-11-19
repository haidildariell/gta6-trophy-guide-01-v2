"use strict";
/* Leonida Legend — filter state for the Ledger checklist. */

const KINDS = ["story", "collectible", "activity", "online", "completion", "misc"];
const GRADES = ["Platinum", "Gold", "Silver", "Bronze"];

const filters = {
  text: "",
  kinds: new Set(),
  grades: new Set(),
  stage: "",
  hideEarned: false,
  spoilers: false
};

function trophyMatches(t, f) {
  if (f.hideEarned && store.isEarned(t.id)) return false;
  if (f.stage && t.stage !== f.stage) return false;
  if (f.kinds.size && !f.kinds.has(t.kind)) return false;
  if (f.grades.size && !f.grades.has(t.grade)) return false;
  if (f.text) {
    const hay = (t.name + " " + t.description + " " + t.kind + " " + t.grade).toLowerCase();
    if (hay.indexOf(f.text.toLowerCase()) === -1) return false;
  }
  return true;
}

function clearFilters() {
  filters.text = "";
  filters.kinds.clear();
  filters.grades.clear();
  filters.stage = "";
  filters.hideEarned = false;
}

/* A hidden trophy is sealed while spoilers are on and it is not yet earned. */
function isSealed(t) {
  return filters.spoilers && t.hidden && !store.isEarned(t.id);
}

function displayName(t) {
  return isSealed(t) ? "Sealed trophy" : t.name;
}

function chipRow(label, values, activeSet, onToggle) {
  const wrap = document.createElement("div");
  wrap.className = "chip-row";
  const lab = document.createElement("span");
  lab.className = "chip-label";
  lab.textContent = label;
  wrap.appendChild(lab);
  values.forEach(function (v) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip" + (activeSet.has(v) ? " is-on" : "");
    b.textContent = v;
    b.addEventListener("click", function () { onToggle(v); });
    wrap.appendChild(b);
  });
  return wrap;
}
