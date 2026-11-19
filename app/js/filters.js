"use strict";
/* Leonida Legend — ledger filter state and matching.
   One plain object holds every control; views read it, main.js mutates it. */

const KINDS = ["story", "collectible", "activity", "online", "completion", "misc"];
const GRADES = ["Platinum", "Gold", "Silver", "Bronze"];
const MISSABLE_LABEL = { possibly: "Possibly missable", watch: "Watch", unconfirmed: "Unconfirmed" };

const Filters = {
  search: "",
  kinds: new Set(),
  grades: new Set(),
  stage: "",
  hideEarned: false,
  spoilers: false,

  matches: function (t) {
    if (this.hideEarned && Store.isEarned(t.id)) return false;
    if (this.stage && t.stage !== this.stage) return false;
    if (this.kinds.size && !this.kinds.has(t.kind)) return false;
    if (this.grades.size && !this.grades.has(t.grade)) return false;
    if (this.search) {
      const hay = (t.name + " " + t.description + " " + t.kind + " " + t.grade + " " + t.stage + " " + stageOf(t.stage).name).toLowerCase();
      if (hay.indexOf(this.search.toLowerCase()) === -1) return false;
    }
    return true;
  },

  /* A trophy is sealed when spoilers are on, it is hidden, and not yet earned. */
  isSealed: function (t) {
    return this.spoilers && t.hidden && !Store.isEarned(t.id);
  },

  toggleSetValue: function (set, value) {
    if (set.has(value)) set.delete(value); else set.add(value);
  }
};

function esc(text) {
  return String(text == null ? "" : text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function medalDot(grade) {
  return '<span class="medal medal-' + grade.toLowerCase() + '" title="' + esc(grade) + '"></span>';
}

function citeMarks(cite) {
  if (!cite || !cite.length) return "";
  return ' <span class="cites">' + cite.map(function (n) { return "[" + n + "]"; }).join("") + "</span>";
}

function missableBadge(t) {
  if (!t.missable) return "";
  return '<span class="badge badge-' + t.missable + '">' + esc(MISSABLE_LABEL[t.missable]) + "</span>";
}
