# core/audio

Krator's sound: the clip catalogue and its license policy now; cues, soundscapes, the music director and the Audio Lab
next. The plan is `PLAN.md` (step A1 done 2026-10-28).

| Path | What |
|---|---|
| `PLAN.md` | the module and the lab: the four kinds of sound, the license policy, intake, the director, order of work |
| `20-core-audio-catalog.js` | `KAUDIO`: license rules applied to records, intake checks, filters and sorting, credits. `[G data]`: no Web Audio, no DOM |
| `test-audio.js` | its node test, including the catalogue itself against the policy (run by `tools/test_all.py`) |
| `data/licenses.json` | **the license policy**: which licenses may ship in the game, which may be published, which need credit |
| `data/categories.json` | the categories (`sfx.*`, `amb.element`, `amb.bed`, `music.*`, `raw`) and review statuses |
| `data/clips.json` | the catalogue: one record per clip (title, creator, source page, license, attribution, category, tags, notes, file) |
| `data/rejected.json` | clips kept out by the policy, with the reason |
| `CREDITS.md` | generated: required credits first, then courtesy credits. Never edit by hand |
| `tools/catalog.js` | `board` (rebuild from the sound board), `intake <batch>`, `check`, `credits` |
| `intake/BRIEF.md` | how anyone (Gemini included) hands new finds in |

## Where the audio is

**Not in this repo** (owner, 2026-10-28): no audio goes to origin until it is wired into the game. The recordings live
in the audio folder beside the repo, `C:\Users\travi\Documents\krator-audio` (set `KRATOR_AUDIO` to move it):

| Path in the audio folder | What |
|---|---|
| `library/` | clips accepted through intake |
| `intake/<batch>/` | new finds waiting to be checked (`intake/BRIEF.md`) |
| `sound-board/` | the Hyperjungle Sound Board: its page, scripts and recordings (`audio/`, `held/`), until the Audio Lab replaces it |

Every record's `file` in `data/clips.json` is a path inside that folder. The repo keeps only text: the code, the
license table, the catalogue's records and the credits. `core/audio/.gitignore` refuses audio files here.

## Rules

- **Licenses** (owner, 2026-10-28): public domain, CC0, CC BY (credited), and royalty-free licenses that allow
  commercial use. Never NonCommercial, NoDerivatives, ShareAlike, or anything unverified at its source. The table in
  `data/licenses.json` is the policy; code only applies it.
- **New clips come in through intake only** (`intake/BRIEF.md`). Nothing is copied into `data/` by hand.
- **Credits are generated** (`node core/audio/tools/catalog.js credits`) and every exported or rendered file carries
  its credits text.
- `legacy` holds the board's old id (bare Freesound numbers), which the board's saved scenes use.

## Commands

```
node core/audio/test-audio.js
node core/audio/tools/catalog.js check
node core/audio/tools/catalog.js intake 2026-10-29-gemini
node core/audio/tools/catalog.js credits
```
