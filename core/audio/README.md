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
| `24-core-audio-soundscape.js` | `KSOUNDSCAPE`: dynamic soundscapes with 24h cyclic hour curves, weather curves (rain/wind/fog), biome blend mixing (e.g. Hyperjungle ⟷ Savannah crossfading), and deterministic seeded `KRAND` event scheduling. `[G data]`; needs `core/rand` |
| `test-soundscape.js` | its node test (Step A4 acceptance test: crossfading biomes, cyclic hour interpolation, weather modulation, seeded repeatability) |
| `26-core-audio-music.js` | `KMUSIC`: pure functional music director (step A5). Sparse ambient music (combinable stems, regional arrival stingers, 3–10 min silences scaled by frequency, hour & weather weighting, strict no-repeat window, soundscape ducking) and adaptive synchronized combat beats (skirmish &rarr; battle stem layering, disengagement hold tail). `[G data]`; needs `core/rand` |
| `test-music.js` | its node test (Step A5 acceptance test: pure state immutability, ambient stems, arrival stingers, combat interrupt & stem escalation, hold tails, ducking, seeded 24h day simulation) |
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

**The rule (owner, 2026-10-28, restated 2026-11-09): the Audio Lab and everything in `core/audio` (the code, the cue, soundscape and
music records, the catalogue's text, the credits) go into the krator-master repo like any other core module; the clips themselves go in
only when a cue, soundscape or piece the game plays names them.** Until then the recordings live
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
node core/audio/test-cues.js
node core/audio/test-soundscape.js
node core/audio/test-music.js
node core/audio/test-playback-limits.js
node core/audio/tools/catalog.js check
node core/audio/tools/catalog.js intake 2026-10-29-gemini
node core/audio/tools/catalog.js credits
```

## Live soundtrack controls

The Soundtrack & Music Director saves playback limits with each soundtrack. The live list shows active clip names and
their playback categories. The default cap is four environmental/minor beds, with a two-minute minimum sting interval,
four sting starts per rolling five minutes, and one sting playing at a time. Settings accept 1–16 beds, 0–1800 seconds
between stings, 1–20 starts per five minutes, and 1–8 simultaneous stings. Existing active beds keep priority when a
lower cap takes effect; excess beds are silenced on the next scheduler tick. Sting slots release when the audio source
ends, and the rolling count expires each start at five minutes.

Run `node core/audio/test-playback-limits.js` to check validation, bed selection, concurrent sting starts, minimum
spacing, and the rolling window.

## Biome and culture soundtrack layers

Choose a **Layer 1 Biome** for environmental loops and a **Layer 2 Culture** for musical beds and identity. **Combo** composes both; **Edit Culture** and **Edit Biome** let you work on one layer at a time. Loading a saved combo restores its layer selections.

Use **Save to Protected Folder** to save in `C:\Users\travi\Documents\krator-audio\saved_presets\soundtracks` and download a backup. **Load from Disk** reads saved presets from that folder; **Import JSON** imports a file and also saves a protected copy. For disk save/load, start `python core/audio/lab/server.py` from the project and open `http://localhost:8080`. Use Export JSON for a portable file.

## Rhythm alignment tools

In the **Beat grid & alignment** panel:

1. Set **Tempo (BPM)** and **Meter**, or press **Tap Tempo** four or more times at the desired pulse. Krator keeps a rolling tap estimate and updates BPM/BPS.
2. Choose **Transition grid**: Instant, Beat, Bar, or a 2, 4, or 8 bar phrase. Combat/danger level changes and cross-region transitions use the shared Web Audio clock and selected boundary.
3. Set **Phase nudge** in milliseconds if the grid is consistently early or late. Positive values move the grid later; negative values move it earlier. Start with 5–10 ms adjustments.
4. Press **8-Beat Click Test** to hear the grid. The first beat of each meter is accented.
5. In a major/minor bed or combat/danger track, open its **Intro & Loop** editor and press **Detect BPM / BPS**. Review the confidence label and the half/double-time candidates. Choose the right tempo if the detector picked a subdivision.
6. **Use as grid tempo** changes the soundtrack tempo used for transition scheduling. **Snap track to grid** adjusts that clip's playback speed to the soundtrack tempo, applies the first-beat offset, saves it, and restarts live playback if needed. Because snapping changes playback speed, it also changes pitch; it does not time-stretch while preserving pitch.
7. Adjust **First beat offset** manually to skip leading silence before the first beat. Use small steps, listen, and save the loop settings.

Auto BPM uses repeated positive loudness onsets. Treat low-confidence results as a starting point, especially for ambience, sparse percussion, or compressed audio. Detection does not time-stretch a whole soundtrack automatically; snap rhythmic clips one at a time after reviewing each estimate.

The 1,007-entry catalogue is intact. The default build has 518 shareable clips; royalty-free clips that cannot be re-shared are excluded from it. For a private local lab containing all 1,007 imported clips, build with `node core/audio/lab/build.js --all`. Keep that local-only build private and do not publish it.
