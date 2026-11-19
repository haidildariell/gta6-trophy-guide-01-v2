# Leonida Legend v2 — GTA 6 Trophy Guide & Tracker

[![Leonida Legend v2 on make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01) [![Rank](https://make.fun/badge/gta6-trophy-guide-01/haidildariell/gta6-trophy-guide-01-v2/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01) [![Reward](https://make.fun/badge/gta6-trophy-guide-01/haidildariell/gta6-trophy-guide-01-v2/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

Bounty: https://make.fun/bounty/gta6-trophy-guide-01

A fully offline trophy guide and tracker for Grand Theft Auto VI on PlayStation 5. All 55 official trophies, each with an original short guide and cited steps, a seven-stage platinum roadmap, an honest missables board, and a progress tracker that lives entirely in your browser — no account, no network, no installs.

## Features

- **Ledger** — the whole hunt on one screen: filters and the 55-trophy checklist on the left, the selected trophy's full guide in the middle (official description, short guide, numbered steps with citation markers, missable warnings, a counter for count trophies, and your own notes), and a Next Up panel plus sources rail on the right.
- **Roadmap** — seven stages from "First hours" to "100% & Platinum", each with its trophies and a progress bar in earned count and PSN points.
- **Missables** — the 11 flagged trophies grouped as Possibly missable (2), Watch (5) and Unconfirmed (4), each with its reasoning and a "sources disagree" tag where the sources genuinely split.
- **Sources** — the seven numbered sources behind the guide, with per-source citation counts and the method note.
- **Tracker** — earned checkboxes, per-trophy counters and notes, PSN points and level, spoiler mode that seals unearned hidden trophies, demo mode, and export / import / reset of your progress (localStorage only).
- **Audit strip** — the header recomputes its counts from the data at runtime, so what it claims is what the data contains.

## Screenshots

Four shots live in `screenshots/` and are specified in `shots.json`: the demo ledger with a possibly-missable trophy open, the roadmap, the missables board, and spoiler mode sealing a hidden trophy.

## How to run

- Build the entry dossier: `node main.ts` — validates `app/data/trophies.json` (55 trophies, every step cited) and writes a deterministic `out/entry.json` (or `$MAKEFUN_OUTPUT_DIR/entry.json`).
- Preview the app: `node serve.ts`, then open the local address it prints (port 8080) — or serve the `app/` folder with any static file server.
- Handy URL parameters: `?demo=1` seeds sample progress, `?view=roadmap` (or `missables` / `sources`) opens a view, `?open=37` selects a trophy, `?spoilers=on` seals hidden trophies.

## Data & sources

Trophy names, descriptions and grades reproduce the official published list exactly, so the tracker matches what the console shows. The guides themselves are original writing for this tracker — nothing is copied from the sources. Every guide step cites the numbered sources behind it: 1 Exophase (official trophy list mirror), 2 PSNProfiles, 3 PowerPyx, 4 PlayStationTrophies.org, 5 TrueTrophies, 6 KeenGamer, 7 GTA Wiki — all read 20 Nov 2026. Hidden flags (28 of 55) follow the official descriptions: story progression and deliberately vague one-liners. Missable calls are judgement from those descriptions and are labelled by confidence rather than presented as fact.

## Layout

- `app/` — the offline web app (HTML, CSS, vanilla JS, `data/trophies.json`).
- `main.ts` — validation + deterministic dossier builder.
- `serve.ts` — zero-dependency static preview server.
- `shots.json` + `screenshots/` — the screenshot set and how each shot was framed.
