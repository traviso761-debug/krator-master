# biomes/catch: index

*Written by hand (2026-10-26) in the shape `tools/make_index.py` writes; rerun it after adding or splitting fragments.*

Docs: `BIOME-API.md`, `KNOWN_ISSUES.md`, `PLAN.md`, `PORT.md`, `README.md`

Built output (never open it; edit `src/` and `stations/` and rebuild): `dist/catch.html`, `dist/catch-oasis.html`, `dist/catch-lake.html`, `dist/catch-fan.html`

Build: `cd biomes/catch && python3 build.py --all` (or `--station oasis|lake|fan`). Fragments are concatenated in filename order; a station's fragments replace `src/`'s of the same name.

From `core/terrain/`: `37-core-stacks.js`, `40-core-basin.js`

From `core/biome/`: `10-core-head.js`, `20-core-kit.js`, `30-core-foliage.js`, `40-core-place.js`, `42-core-export.js`, `43-core-export-host.js`

From `core/atmos/`: `89-atmos-0-core.js`, `89-atmos-0p-presets.js`, `89-atmos-3d-dust.js`, `89-atmos-4-weather.js`, `89-atmos-8-export.js`, `89-atmos-9-host.js`, `89-atmos-a-waves.js`, `89-atmos-b-skylight.js`; `sky/` (the shared sky); `host/89-atmos-c-hostbind.js`, `host/89-atmos-e-weatherhost.js`, `host/89-atmos-h-skyhost.js`

From `core/water/`, `core/rand/`, `core/tags/`, `core/export/`, `core/space/`, `core/materials/record/`, `core/host/` (the shell and `94-host-polytool.js`)

Read in place: `biomes/sedesert/src/50,55,60,70` (as `49a`..`49d`); `kits/mechs` (the bundle, culture stalker, as `79-host-mechs.js`)

## src/ and stations/

| Fragment | KB | Sections (line) |
|---|---|---|
| `src/00-head.html` | 1 |  |
| `src/45-host-scene.js` | 9 | helpers every stage uses (26) |
| `src/45b-host-stage.js` | 11 | the fields (FNAMES, 45-host-scene.js) (58); the station's say: STAGE (88, 89s, 89w, 99 read  (73) |
| `src/45c-host-ground.js` | 5 |  |
| `src/46-host-rock.js` | 3 |  |
| `src/49z-host-sed-end.js` | <1 |  |
| `src/50-biome-catch-species.js` | 15 | the five oases of the crossing (PLAN.md section  (22); palettes (sRGB; a library card carries its own c (38); the tree-scale species (47); the small plants and the floor, tagged (61); the fallback textures (procedural, without the p (72); materials (92); geometries (112); instanced items: the owner's sheets by cell (148) |
| `src/55-biome-catch-trees.js` | 10 | keep-clear between trees (core/space) (24); the builders: (T, st, lv) with lv 2 near, 1 mid (35); impostors (the far trees) (67); the passes (data: species, cell, acceptance by f (81) |
| `src/60-biome-catch-floor.js` | 4 |  |
| `src/70-biome-catch.js` | 1 |  |
| `src/80-host-stalkers.js` | 1 |  |
| `src/88-host-build.js` | 2 |  |
| `src/89a-host-atmos.js` | 1 |  |
| `src/89s-host-sky.js` | 2 |  |
| `src/89w-host-water.js` | 2 |  |
| `src/89x-host-weather.js` | 1 |  |
| `src/89y-host-storm.js` | 2 |  |
| `src/99-host-take.js` | 9 | the inspector's words (7); the probe's budgets and the kit's own checks (ve (21); the page, handed to the host (72) |
| `src/99-tail.html` | <1 |  |
| `stations/oasis/00-head.html` | 1 |  |
| `stations/oasis/45b-host-stage.js` | 11 | the fields (FNAMES) (52); the camps: the caravans' fire rings and the dive (64); the station's say: STAGE (78) |
| `stations/lake/00-head.html` | 1 |  |
| `stations/lake/45b-host-stage.js` | 11 | the fields (FNAMES) (51); the lake on core/water: one open surface, the tr (73) |
| `stations/fan/00-head.html` | 1 |  |
| `stations/fan/45b-host-stage.js` | 8 | the fields (FNAMES) (39) |
