"use strict";
/* Leonida Legend — progress store.
   Persists earned trophies, per-trophy counters and notes to localStorage. */

const STORE_KEY = "leonida-legend-v2";

function emptyState() {
  return { earned: {}, counts: {}, notes: {} };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    return {
      earned: parsed.earned || {},
      counts: parsed.counts || {},
      notes: parsed.notes || {}
    };
  } catch (err) {
    return emptyState();
  }
}

const store = {
  state: loadState(),

  save: function () {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(this.state)); } catch (err) { /* storage full/blocked: keep in-memory state */ }
  },

  isEarned: function (id) { return !!this.state.earned[id]; },

  setEarned: function (id, on) {
    if (on) this.state.earned[id] = true; else delete this.state.earned[id];
    this.save();
  },

  toggleEarned: function (id) { this.setEarned(id, !this.isEarned(id)); },

  getCount: function (id) { return Number(this.state.counts[id] || 0); },

  setCount: function (id, value) {
    const n = Math.max(0, Math.floor(Number(value) || 0));
    if (n > 0) this.state.counts[id] = n; else delete this.state.counts[id];
    this.save();
  },

  getNote: function (id) { return this.state.notes[id] || ""; },

  setNote: function (id, text) {
    const t = String(text || "");
    if (t.trim()) this.state.notes[id] = t; else delete this.state.notes[id];
    this.save();
  },

  reset: function () {
    this.state = emptyState();
    this.save();
  },

  replace: function (next) {
    this.state = {
      earned: (next && next.earned) || {},
      counts: (next && next.counts) || {},
      notes: (next && next.notes) || {}
    };
    this.save();
  },

  exportJSON: function () {
    return JSON.stringify({ app: "leonida-legend-v2", state: this.state }, null, 2);
  }
};

/* PSN-style points and level from the earned set. */
function pointsEarned(trophies) {
  return trophies.reduce(function (sum, t) {
    return sum + (store.isEarned(t.id) ? t.points : 0);
  }, 0);
}

function pointsTotal(trophies) {
  return trophies.reduce(function (sum, t) { return sum + t.points; }, 0);
}

function psnLevel(points) {
  /* Simplified level curve: each level needs progressively more points. */
  let level = 1;
  let remaining = points;
  let cost = 60;
  while (remaining >= cost && level < 999) {
    remaining -= cost;
    level += 1;
    cost = 60 + (level - 1) * 30;
  }
  return { level: level, into: remaining, nextCost: cost };
}

function downloadExport() {
  const blob = new Blob([store.exportJSON()], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "leonida-legend-progress.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 500);
}

function importFromFile(file, done) {
  const reader = new FileReader();
  reader.onload = function () {
    try {
      const parsed = JSON.parse(String(reader.result || ""));
      const state = parsed.state || parsed;
      if (!state || typeof state !== "object") throw new Error("bad file");
      store.replace(state);
      done(null);
    } catch (err) {
      done(err);
    }
  };
  reader.onerror = function () { done(new Error("read failed")); };
  reader.readAsText(file);
}

/* Demo seeding for screenshots and first-look tours (?demo=1). */
function seedDemo(trophies) {
  /* 13 earned across the early stages, plus a few partial counters. */
  const picks = [2, 3, 4, 5, 8, 9, 16, 20, 21, 35, 36, 42, 44]
    .filter(function (id) { return trophies.some(function (t) { return t.id === id; }); });
  picks.forEach(function (id) { store.state.earned[id] = true; });
  store.state.counts[15] = 96;
  store.state.counts[31] = 41;
  store.state.counts[35] = 100;
  store.state.counts[52] = 87500;
  store.state.notes[37] = "Do this before the finale — airport access changes.";
  store.save();
}
