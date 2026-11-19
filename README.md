# Leonida Legend v2 — GTA 6 Trophy Guide & Tracker

[![Leonida Legend v2 on make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01) [![Rank](https://make.fun/badge/gta6-trophy-guide-01/haidildariell/gta6-trophy-guide-01-v2/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01) [![Reward](https://make.fun/badge/gta6-trophy-guide-01/haidildariell/gta6-trophy-guide-01-v2/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

Bounty: https://make.fun/bounty/gta6-trophy-guide-01

An offline trophy guide and progress tracker for the official 55-trophy
Grand Theft Auto VI list (PlayStation 5): 1 Platinum, 2 Gold, 6 Silver,
46 Bronze — 28 of them hidden.

## What it is

Open `app/index.html` and you get the whole hunt on one screen:

- **Ledger** — the main view. A filterable checklist of all 55 trophies
  (search, kind and grade chips, stage filter, hide-earned), a full guide
  pane for the selected trophy, and a right rail with your next five
  trophies plus the source list. Every guide step ends with citation
  markers, e.g. [3][7], pointing at the numbered sources behind it.
- **Roadmap** — the seven-stage route: first hours, story halves, story
  finish, collectibles and counts, activities and mastery, then the
  100 percent and Platinum sweep, each with its own progress bar.
- **Missables** — nothing on the list is confirmed missable, so this page
  tiers the caution cases honestly: 2 possibly missable, 5 to watch,
  4 unconfirmed, each with a note and a "sources disagree" tag where the
  guides genuinely conflict.
- **Sources** — the seven sources behind the guides, when they were read
  (20 Nov 2026), and how many of the 55 guides cite each one.

The audit strip under the header recomputes the list's vital statistics
from the data at runtime — totals, hidden count, citation coverage and
missable tiers — so what you see is always what the data says.

## Features

- Fully offline: no accounts, no network calls beyond the local files.
- Progress tracking in `localStorage`: earned checkboxes, per-trophy
  counters for count-based trophies, and private notes per trophy.
- Export, import and reset your progress as JSON from the header.
- PSN points and level computed from your earned set.
- Spoiler seal: hidden trophies can be shown as sealed placeholders
  until you earn them (toggle in the Ledger, or `?spoilers=on`).
- Handy URL parameters: `?demo=1` seeds sample progress, `?view=` picks
  the opening view, `?open=<id>` selects a trophy in the Ledger.

## How to run

Any static server works. With Node (no dependencies, no build step):

```sh
node serve.ts
# then open http://localhost:8080
```

Or serve the folder directly, for example:

```sh
python3 -m http.server 8091 --directory app
```

Screenshots of each view live in `screenshots/`; `shots.json` records
exactly which URL produced each one, so they can be re-shot at any time.

To rebuild and validate the entry dossier:

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` validates the trophy data (exactly 55 trophies, every guide
step cited) and writes a deterministic `entry.json` summary — running
it twice gives byte-identical output.

## Data & sources

Trophy names, descriptions and grades in `app/data/trophies.json` are
the official list values. The guides themselves are written for this
tracker: every step cites the sources behind it by number — 1 Exophase,
2 PSNProfiles, 3 PowerPyx, 4 PlayStationTrophies.org, 5 TrueTrophies,
6 KeenGamer, 7 GTA Wiki — all read on 20 Nov 2026. Where sources
disagree, the tracker says so rather than quietly picking a side.
