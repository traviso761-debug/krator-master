# core/audio

Krator's sound: the clip catalogue and its license policy now; cues, soundscapes, the music director and the Audio Lab
next. The plan is `PLAN.md` (step A1 done 2026-10-28).

| Path | What |
|---|---|
| `PLAN.md` | the module and the lab: the four kinds of sound, the license policy, intake, the director, order of work |
| `20-core-audio-catalog.js` | `KAUDIO`: license rules applied to records, intake checks, filters and sorting, credits. `[G data]`: no Web Audio, no DOM |
| `test-audio.js` | its node test, including the catalogue itself against the policy (run by `tools/test_all.py`) |
| `22-core-audio-cues.js` | `KCUE`: SFX cues, a named sound with variants: weighted picks that never repeat the last few, random pitch and volume drawn from `KRAND`, cooldown, voice cap, distance falloff. `[G data]`; needs `core/rand` |
| `test-cues.js` | its node test (fired 20 times, never the same variant twice in a row; seeds replay; weights; cooldown; voices) |
| `data/licenses.json` | **the license policy**: which licenses may ship in the game, which may be published, which need credit |
| `data/categories.json` | the categories (`sfx.*`, `amb.element`, `amb.bed`, `music.*`, `raw`) and review statuses |
| `data/clips.json` | the catalogue: one record per clip (title, creator, source page, license, attribution, category, tags, notes, file) |
| `data/rejected.json` | clips kept out by the policy, with the reason |
| `CREDITS.md` | generated: required credits first, then courtesy credits. Never edit by hand |
| `tools/catalog.js` | `board` (rebuild from the sound board), `intake <batch>`, `check`, `credits` |
| `intake/BRIEF.md` | how anyone (Gemini included) hands new finds in |
| `lab/template.html`, `lab/build.js` | the **Audio Lab** (step A2): Library (filter by category, tag, license, status, length; sort; usage notes), Cut, Scene. `node core/audio/lab/build.js` makes previews with ffmpeg and writes `<audio folder>/lab/index.html`; `--all` adds the royalty-free clips for a local-only lab (never publish that build) |

**The Audio Lab is published** at https://claude.ai/artifact/5rro9CbXMzna9Y5joPVgB1 (the sound board's address, so its
saved scenes, cut clips and comments carried over; the lab maps the board's old clip ids). Its database keeps `scenes`,
`cuts`, `notes` (one usage note per clip id) and `cues` (one per cue id): never rename them. The page embeds `core/rand` and
`KCUE`, so the lab plays exactly what the module decides. `<audio folder>/lab/published.json` lists the previews already
online, so a publish sends only the new ones. To republish, build, copy `<audio folder>/lab` into a
folder the publishing tool can read, and publish its `index.html` and `previews/` to that address; one publish holds
at most 64 MB and a version 256 MB.

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
