// Tracker store: earned flags, personal counters, personal notes, and the spoiler flag, kept in localStorage.
// Nothing leaves the browser except the JSON file the player chooses to export.
var STORE_KEY = "leonida-legend-v2";
var store = { earned: {}, counts: {}, notes: {}, spoilers: false };
function storeLoad() {
  try {
    var raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      var parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        store.earned = parsed.earned || {};
        store.counts = parsed.counts || {};
        store.notes = parsed.notes || {};
        store.spoilers = !!parsed.spoilers;
      }
    }
  } catch (e) { /* a fresh tracker is a fine fallback */ }
  return store;
}
function storeSave() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) { /* storage full or blocked */ }
}
function storeIsEmpty() {
  return Object.keys(store.earned).length === 0 && Object.keys(store.counts).length === 0 && Object.keys(store.notes).length === 0;
}
function setEarned(id, on) {
  if (on) store.earned[id] = true; else delete store.earned[id];
  storeSave();
}
function setCount(id, n) {
  if (n > 0) store.counts[id] = n; else delete store.counts[id];
  storeSave();
}
function setNote(id, text) {
  if (text) store.notes[id] = text; else delete store.notes[id];
  storeSave();
}
function storeExport() {
  var blob = new Blob([JSON.stringify(store, null, 2)], { type: "application/json" });
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "leonida-legend-progress.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
}
function storeImport(file, done) {
  var reader = new FileReader();
  reader.onload = function () {
    try {
      var parsed = JSON.parse(String(reader.result));
      if (!parsed || typeof parsed !== "object") throw new Error("not a tracker file");
      store.earned = parsed.earned || {};
      store.counts = parsed.counts || {};
      store.notes = parsed.notes || {};
      store.spoilers = !!parsed.spoilers;
      storeSave();
      done(null);
    } catch (e) { done(e); }
  };
  reader.readAsText(file);
}
function storeReset() {
  store = { earned: {}, counts: {}, notes: {}, spoilers: store.spoilers };
  storeSave();
}
