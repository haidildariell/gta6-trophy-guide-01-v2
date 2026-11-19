# Leonida Legend — GTA 6 Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/haidildariell/gta6-trophy-guide-01-v2/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/haidildariell/gta6-trophy-guide-01-v2/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Bounty: https://make.fun/bounty/gta6-trophy-guide-01

A fully offline web app that tracks all **55 official PlayStation 5 trophies** for Grand Theft Auto VI and guides you, stage by stage, to the platinum. No build step, no network at runtime, no game artwork or logos — just static files under `app/`.

## What it does

- **Ledger (3-panel)** — Next Up planner (the next 3 unearned trophies in roadmap order), kind chips with counts, search, grade breakdown, and the full checklist on the left; the open trophy's complete guide in the middle; the numbered Sources panel on the right.
- **Cited guides** — every trophy has a short summary plus numbered steps, and **every step carries a citation marker** like [1] or [3] pointing at the Sources panel. 167 steps, all cited. Steps that are only our own reading of the official description say so in plain words.
- **Audit strip** — one line, computed live from the data: 55 official · 1P 2G 6S 46B · 28 hidden · 55/55 guides cite a source · 167/167 steps cited · 7 sources read 20 Nov 2026 · 2 possibly missable · 5 watch · 4 unconfirmed.
- **Roadmap** — seven stages (S1 First hours → S7 100% & the Platinum) with all 55 trophies placed exactly once and per-stage progress bars. Built from the official descriptions.
- **Missables, tiered** — built from the official descriptions: 2 *possibly missable* (every meditation spot including an early-chapter spot; the Ocean Beach cocktail moment), 5 *watch* (partner conditions, a unique animal, fail-then-pass, no-detection), 4 *unconfirmed* (descriptions too vague to act on — flagged honestly instead of inventing a method).
- **Tracker** — earned checkboxes, per-trophy counters against PSN targets (your count / target), personal notes, and a header with earned count, grade split, and trophy points (platinum 300, gold 90, silver 30, bronze 15). Progress is stored in `localStorage` and can be **exported / imported as JSON** or reset.
- **Spoiler setting** — with spoilers on, unearned story trophies are sealed in the ledger: no name or description until you earn them or switch spoilers off.
- **Screenshot-friendly URLs** — `?demo=1` seeds a mid-run tracker (only when storage is empty), `?view=ledger|roadmap|missables|sources`, `?open=<id>`, `?spoilers=on|off`. Keyboard: `1–4` switch views, `/` jumps to search.

## Run it

Serve the `app/` folder with any static server, for example:

```sh
node serve.ts          # preview server on http://localhost:8080/
```

or `python3 -m http.server -d app 8080`. Then open the page in a browser.

To package the entry the way the bounty scorer does:

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts   # validates trophies.json, copies app/ + screenshots/, writes dossier.json
```

## Sources (read 20 Nov 2026)

1. Exophase — official PS5 trophy list
2. PSNProfiles — trophy list & PSN progress targets
3. PowerPyx — GTA 6 Trophy Guide & Roadmap
4. PlayStationTrophies.org — GTA 6 guide
5. TrueTrophies — GTA 6 trophies
6. KeenGamer — GTA 6 platinum roadmap
7. GTA Wiki (gta.fandom.com) — missions & activities

Guide wording is our own; trophy names and descriptions are the official list [1].
