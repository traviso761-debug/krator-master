# core/audio: the sound module and the Audio Lab (plan, 2026-10-28)

The owner (2026-10-28): expand the Hyperjungle Sound Board (`krator-audio/sound-board`) into an **Audio Lab**, the testbed
for a new `core/audio` module. The lab sorts through hundreds of clips by category, plays and edits them, and keeps
comments that document which file is used for what. The module has to carry four kinds of sound at once:

1. **Short SFX**: combat, tool use, footsteps, UI.
2. **Short to medium ambient sounds**: surf, rain, a waterfall, wind in reeds. Often tied to a place or a weather.
3. **Long ambient beds**: a biome's continuous background, looped seamlessly (the hyperjungle scenes).
4. **Music, as Kenshi does it**: sparse ambient pieces that come in now and then by biome or region, with long
   silences between; plus a **biome-dependent combat beat** while the player is fighting.

**Status: approved 2026-10-28.** The questions in section 8 were answered as recommended: ffmpeg installed, the lab at
`core/audio/lab/`, placeholder music stems, two combat levels, royalty-free in the game only, Gemini through intake.
A1, A2 and A3 are done (A2: the Audio Lab published at the sound board's address, 80 kbps previews; filters, sorting,
usage notes; tested against 3,000 clips. A3: `KCUE` and the lab's Cues tab). Wherever this file still says *proposed*, the detail can
change as the lab is built.

## 0. Core adoption (written first, as the working rules ask)

| Need | Module | How |
|---|---|---|
| Random choices (which variant, when a call comes, which music piece) | `core/rand` (`KRAND`) | every draw is seeded from (world, emitter or cue id, index, salt), never from how many draws came before |
| World time (day and night beds, dawn chorus, music by hour) | `core/clock` (`KCLOCK`) | read `C.hour`; motion time `C.t` drives fades and timers |
| Weather (rain, storm, wind, snow, ash layers) | `core/atmos` (`ATMOS.weather` state `W.rain`, `W.wind`, `W.snow`, `W.ash`) | read the eased state; never re-derive weather |
| Which biome the listener is in, and how much | the world's own field (`W.biomeAt` blend weights in `openworld/isle-demo`) | the director takes weights as input; it never looks up the map itself |
| Where emitters are (a waterfall, a forge, a camp) | `core/tags` | a placed sound emitter is a tags record (kind `sound`, the hyperjungle plan's H9) before anything plays it |
| Export to Godot | `core/export` | the catalogue, cues, soundscapes and music rules go into the `krator-world` container as data |

**No new infrastructure is copied in.** The director is plain functions on records (`[G data]`); playing sound is
host code (`[web]` Web Audio in the lab, Godot's audio servers in the port).

**First consumer (GODOT-PLAN.md section 6, rule 11):** the Audio Lab page itself, and then `openworld/isle-demo`.
The isle demo already blends biomes per position and runs the clock and the weather, so its ambience can crossfade
between biome beds as the player walks, which is the real test of the module.

## 1. License policy (owner, 2026-10-28)

**Only public-domain or commercially free sounds, with credit given wherever a license asks for it.**

| License | In the game | In the public repo and the shared lab | Credit |
|---|---|---|---|
| CC0, public-domain dedication | yes | yes | not required; credited anyway as a courtesy |
| US federal work (NPS, USFWS, USGS, NOAA, USDA), public domain by age (US recording before 1923) | yes | yes | not required; credited as a courtesy |
| CC BY (any version) | yes | yes | **required**: the CREDITS file carries the recordist, title, source and license |
| Royalty-free, commercial use allowed, no re-sharing of the files (Sonniss GDC, Free To Use Sounds, Mixkit, Pixabay, and the like) | yes | **no**: kept on the owner's machine, git-ignored, never published | as the license asks |
| CC BY-NC, anything "non-commercial" | **no** | no | n/a |
| CC BY-ND, "no derivatives" | **no**: we cut, pitch and filter everything | no | n/a |
| CC BY-SA, share-alike | **no**: it would bind the game's own sound files to the same license | no | n/a |
| Unknown, unverified, or a re-upload whose uploader is not the author | **no**, until verified at the original source | no | n/a |

The board already works this way: the 18 Xeno-canto (BY-NC) clips and 13 unverified Internet Archive and Library of
Congress clips are off it (`krator-audio/sound-board/held/`).

**Credits are generated, never hand-kept.** Every clip's record carries its attribution line; a tool writes
`CREDITS.md` (for the game's credits screen) from every clip a cue, soundscape or piece of music actually uses, and every
rendered or exported file ships with its credits text, as the lab's saves already do.

## 2. Intake: how new clips come in

Gemini (and any other agent or person) is finding clips. To stop finds landing without a source or a checked license
(as happened on 2026-10-28), every find goes through one folder and one check:

- `krator-audio/intake/<batch>/audio/<id>.<ext>` and `krator-audio/intake/<batch>/clips.json` (the audio folder,
  outside the repo: section 6), one record per clip:

| Field | What |
|---|---|
| `id` | source prefix plus the source's own id: `fs-486390` (Freesound), `nps-elk`, `wmc-...`, `ia-...`, `sonniss-...` |
| `title`, `creator` | the work's title and its author (the recordist, not the uploader of a compilation) |
| `source` | the item's own page, where the license can be checked |
| `license` | one of the ids in `core/audio/data/licenses.json` (`cc0`, `pd-usgov`, `pd-age`, `cc-by-3.0`, `cc-by-4.0`, `royalty-free-sonniss`, ...) |
| `attribution` | the exact credit line the license asks for, or empty |
| `category`, `tags` | from the taxonomy in section 3 |
| `notes` | what it sounds like, and what it could be used for |

- `python3 core/audio/tools/intake.py <batch>` checks every record: license id known and allowed, source URL present,
  file present and real audio, no duplicate of a clip already in the catalogue (by id, then by length and loudness).
  It reports what it rejects and why, and moves the accepted clips into the catalogue.
- Accepted clips move to `krator-audio/library/`. A clip that is allowed in the game but not re-shareable is marked
  `share: false`, so the lab on the owner's machine shows it and the published lab does not.

## 3. The catalogue and its taxonomy

`core/audio/data/clips.json`: every clip, one record (the fields above, plus `duration`, `loudness` in LUFS,
`channels`, `file`, `share`, and `status`). Hundreds of records, so the lab filters and sorts them rather than
listing them.

**Categories** (*proposed*): one per clip, from the four kinds above, plus raw material:

| Category | Examples |
|---|---|
| `sfx.combat` | hits, swings, blocks, gunfire, explosions |
| `sfx.tool` | chopping, mining, sawing, smithing |
| `sfx.move` | footsteps by surface, cloth, armour, mounts |
| `sfx.creature` | individual calls and cries used as one-shots |
| `sfx.ui` | menus, notifications |
| `amb.element` | short to medium: rain, surf, waterfall, wind, fire, thunder |
| `amb.bed` | long beds: a biome by day or night, a city, a cave |
| `music.ambient` | Kenshi-style pieces and stems |
| `music.combat` | combat beats and their layers |
| `raw` | field recordings waiting to be cut |

**Tags** (free, from a vocabulary): biome or region (`hyperjungle`, `savannah`, `throne`...), creature kind (`insect`,
`frog`, `bird`, `bat`, `giant-insect`), time (`day`, `dusk`, `night`), weather, surface, culture, mood.

**Status**, the review workflow: `candidate` (new), `approved`, `rejected`, `used` (named by a cue, soundscape or
piece). Status and usage notes are what the owner asked the comments for: "what files should be used for what".

## 4. The four kinds, as data

### 4.1 SFX: cues
A **cue** is what the game asks for by name: `sfx.combat.hit.metal`, `sfx.tool.axe.chop`. It holds several variants
(clips or cuts) and how to play them: random pitch and volume range, no immediate repeat, cooldown, maximum voices,
priority, bus, and distance falloff. (Godot: an `AudioStreamRandomizer` per cue, on an `AudioStreamPlayer3D`.)

### 4.2 Short and medium ambience: elements and emitters
An **element** is a looping or repeating sound with a source in the world: a waterfall, surf on a shore, a forge, rain
on leaves. It is played by **emitters**: tags records placed by the world (kind `sound`, with the element's id, a
radius and a loudness). Weather elements (rain, wind, thunder) follow the `ATMOS` state instead of a place.

### 4.3 Long beds: soundscapes
A **soundscape** is a biome's or region's background: the Scene model the board already has (beds and timed calls,
speed, pitch, timbre, fades, interval plus or minus randomness, chance), plus:
- **curves by hour and weather**: each layer has a weight over the day (the dawn chorus, the night insects) and over
  rain and wind;
- **biome blending**: the director mixes the soundscapes of the biomes the listener stands in by their blend weights,
  so walking from jungle into savannah crossfades over the same distance the ground does;
- **seamless loops**: the board's loop finder and loop render, kept.

Two ways to ship a soundscape (*proposed*: both): **live** (the beds and calls are played by the director at run time,
so it never repeats exactly) and **baked** (rendered to one seamless loop, for low-end hardware or a distant layer).

### 4.4 Music: the director, as Kenshi does it
Kenshi's music is sparse on purpose: its composer's talk is called "Unscoring the World of Kenshi" (GDC 2016). Pieces
come in now and then, depend on the biome (some places are nearly silent), and are put together from layers at run time
rather than looped; the player sets how often music plays.

**Ambient music** (*proposed* rules, all data per biome or region):
- a pool of pieces, each a set of stems (pad, melody, texture) that can be combined;
- **when**: on arriving in a new region (a chance), and otherwise at random after a silence of `min`..`max` minutes;
  a frequency setting scales the silences (the player's "how often");
- **which**: weighted by hour and weather; no repeat within a window;
- fades in and out over seconds, and lowers the ambience a little while it plays.

**Combat music** (*proposed*):
- each biome has a **combat beat**: a loop in stems (percussion, bass, lead), entered on the beat;
- the game gives the director an **intensity** (0 none, 1 skirmish, 2 battle); stems are added and removed with it;
- on entering combat, ambient music fades out fast; on leaving, the beat holds for a few seconds, then ends on a tail
  rather than a cut;
- the region's soundscape ducks while the beat plays.

(Godot 4.3+ has `AudioStreamInteractive` for clips with transitions and `AudioStreamSynchronized` for stems that play
together: the director's records map onto those directly.)

**Source of the music itself:** none is on the board yet. Music needs either a composer, or CC0 or CC BY music,
which exists but is thin (question 3).

### 4.5 The director and the mixer
One pure function, the **director**: `step(state, inputs, dt) -> {state, commands}`. Inputs: biome weights, hour,
weather, indoors, combat intensity, listener position, the settings. Commands: start, stop, fade, and set a bus
level, by id. No engine code in it, so the node test runs it and Godot gets a GDScript twin.

**Buses**: master, music, ambience, sfx, ui, voice. **Snapshots**: indoors (ambience low-passed and quieter),
underwater, combat (ambience ducked).

## 5. The Audio Lab (the testbed page)

`core/audio/lab/`, a build of its own (like `core/charactermodels`), grown from the sound board. Tabs:

| Tab | What it does |
|---|---|
| **Library** | every clip, filtered by category, tag, biome, license, status and length, searchable, sorted; play, speed and pitch; status and usage notes on each clip; groups fold |
| **Cut** | the board's waveform editor, loop finder and sound chain (kept) |
| **Cues** | build an SFX cue from variants; fire it ten times to hear the randomness |
| **Soundscapes** | the board's Scene, plus hour and weather sliders and a biome blend slider between two soundscapes |
| **Music** | the director run fast: a simulated hour of play on a timeline, with buttons to enter a biome, start and end combat, and change intensity; shows every decision |
| **Credits** | what the current selection would need to credit; writes CREDITS.md |

**Comments and usage notes.** Two kinds, both kept:
- **usage notes**, structured, per clip: status, the cue or soundscape it is meant for, and a line of text. Stored
  in the lab's database and pulled into the repo (`core/audio/data/notes.json`) by a sync tool, so they are reviewable
  and committed, and the module can read them;
- **comments**: claude.ai's comment threads on any clip, cue or scene, for discussion.

**Saved work carries over.** The board's scenes and cuts (3 scenes, 15 cuts) move into the lab's soundscapes and
cuts; the board's README rule (never rename a collection; migrate, keep the old) applies.

## 6. Where the audio lives, and size

**Outside the repo** (owner, 2026-10-28): no audio goes to origin until it is wired into the game. The recordings,
intake batches, previews and the sound board live in `C:\Users\travi\Documents\krator-audio` (`$KRATOR_AUDIO`); the
repo keeps the code, the license table, the catalogue's records and the credits. When a sound is wired into the game,
its shipped file (OGG) comes into the repo with the build that uses it.

**Size on one page.**

The board publishes 120 clips at 225 MB, near the 256 MB a published version may hold. The lab will publish
**previews** instead: each clip re-encoded small (*proposed*: 96 kbps stereo MP3, about 0.7 MB a minute), with the
full-quality file kept in the repo (LFS) or locally. That fits several hundred clips. It needs **ffmpeg** on this
machine (question 1). The game ships **OGG Vorbis** (Godot loops it gaplessly; MP3 pads both ends) made from the
masters.

## 7. Order of work (*proposed*)

| Step | What | Done when |
|---|---|---|
| A0 | This plan approved; questions answered | the owner says go |
| A1 | `core/audio/data` (licenses, clips, categories) built from the board's `meta.json` and `groups.json`; `intake.py` with the license check; `CREDITS.md` generated | node test of the catalogue and the license rules; the board's clips all carry an allowed license and an attribution line |
| A2 | The lab page from the board: Library with filters, status and usage notes; previews; the board's saved work migrated | published; the owner can sort 300+ clips |
| A3 | Cues and the SFX player | a cue fired 20 times never repeats a variant twice in a row; node test |
| A4 | Soundscapes with hour, weather and biome blending | the hyperjungle day scene crossfades into a savannah scene on the blend slider |
| A5 | The music director (ambient and combat), with the lab's simulator | node test of the director's decisions over a simulated day, seeded |
| A6 | First world: `openworld/isle-demo` plays its biomes' soundscapes as the player walks, with rain and the clock | verified in the page; baselined |
| A7 | Godot: export the data; the director's GDScript twin; a test scene | the Godot test passes on 4.7.2 |

## 8. Questions for the owner

1. **ffmpeg** for previews and OGG export: may I install it (`winget install Gyan.FFmpeg`)? Without it, the lab
   stays near 120 clips a page.
2. **The lab's place**: `core/audio/lab/` (a module that is also a build, like `core/charactermodels`), with
   `krator-audio/sound-board` retired into it once it works?
3. **Music**: where does it come from: a composer you work with, CC0 or CC BY music I go looking for, or
   placeholder stems I make in the lab (pads and drones from the recordings) until then?
4. **Combat intensity**: is two levels (skirmish, battle) enough, or does the game have a finer measure to feed in?
5. **Royalty-free, non-re-shareable sounds** (Sonniss, Free To Use Sounds, Mixkit): in the game, yes (they allow it),
   but never in the repo or the published lab. Is that the line you want, or should the game use only CC0, public
   domain and CC BY?
6. **Gemini's intake**: can Gemini write its finds in the section 2 format into `core/audio/intake/`? I can write
   it a one-page brief.
