"use strict";
/* Leonida Legend — progress store.
   Persists earned trophies, per-trophy counters and notes in localStorage
   under one versioned key. Everything stays on this device. */

const STORE_KEY = "leonida-legend-v2";

const Store = {
  state: { earned: {}, counts: {}, notes: {} },

  load: function () {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.state = {
          earned: parsed.earned || {},
          counts: parsed.counts || {},
          notes: parsed.notes || {}
        };
      }
    } catch (e) {
      this.state = { earned: {}, counts: {}, notes: {} };
    }
    return this.state;
  },

  save: function () {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(this.state)); } catch (e) { /* storage full/blocked: progress simply will not persist */ }
  },

  isEarned: function (id) { return !!this.state.earned[id]; },

  toggleEarned: function (id) {
    if (this.state.earned[id]) delete this.state.earned[id];
    else this.state.earned[id] = true;
    this.save();
  },

  setEarned: function (id, on) {
    if (on) this.state.earned[id] = true; else delete this.state.earned[id];
    this.save();
  },

  getCount: function (id) { return this.state.counts[id] || 0; },

  setCount: function (id, value) {
    const n = Math.max(0, Math.floor(Number(value) || 0));
    this.state.counts[id] = n;
    this.save();
    return n;
  },

  getNote: function (id) { return this.state.notes[id] || ""; },

  setNote: function (id, text) {
    if (text) this.state.notes[id] = text; else delete this.state.notes[id];
    this.save();
  },

  reset: function () {
    this.state = { earned: {}, counts: {}, notes: {} };
    try { localStorage.removeItem(STORE_KEY); } catch (e) { /* ignore */ }
    this.save();
  },

  exportJSON: function () {
    const payload = {
      app: "leonida-legend",
      version: 2,
      earned: this.state.earned,
      counts: this.state.counts,
      notes: this.state.notes
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const earnedTotal = Object.keys(this.state.earned).length;
    a.download = "leonida-legend-progress-" + earnedTotal + "of55.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 500);
  },

  importJSON: function (file, done) {
    const reader = new FileReader();
    reader.onload = function () {
      try {
        const parsed = JSON.parse(String(reader.result));
        Store.state = {
          earned: parsed.earned || {},
          counts: parsed.counts || {},
          notes: parsed.notes || {}
        };
        Store.save();
        done(true);
      } catch (e) { done(false); }
    };
    reader.onerror = function () { done(false); };
    reader.readAsText(file);
  }
};

/* PSN-style points and level from a trophy list + earned set. */
function computeProgress(trophies) {
  let points = 0, earnedCount = 0;
  const byGrade = { Platinum: 0, Gold: 0, Silver: 0, Bronze: 0 };
  trophies.forEach(function (t) {
    if (Store.isEarned(t.id)) {
      earnedCount += 1;
      points += t.points;
      byGrade[t.grade] += 1;
    }
  });
  const totalPoints = trophies.reduce(function (sum, t) { return sum + t.points; }, 0);
  return {
    points: points,
    totalPoints: totalPoints,
    earnedCount: earnedCount,
    byGrade: byGrade,
    level: psnLevel(points)
  };
}

/* Simplified PSN level curve: each level costs more than the last. */
function psnLevel(points) {
  let level = 1, remaining = points, cost = 60;
  while (remaining >= cost && level < 999) {
    remaining -= cost;
    level += 1;
    cost = Math.round(cost * 1.18);
  }
  return { level: level, intoLevel: remaining, nextCost: cost };
}
