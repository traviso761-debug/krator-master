# biomes/abyssal-savannah: index

*Written by hand in `tools/make_index.py`'s shape (2026-10-26); rerun that tool to regenerate it.*

Docs: `PLAN.md`, `BIOME-API.md`, `NOTES.md`, `KNOWN_ISSUES.md`, `PORT.md`

Built output (never open it; edit `src/` and rebuild): `dist/abyssal-savannah.html`

Build: `cd biomes/abyssal-savannah && python3 build.py`. Fragments are concatenated in filename order.

From `core/biome/` (shared): `10-core-head.js`, `20-core-kit.js`, `30-core-foliage.js`, `32-core-variants.js`, `40-core-place.js`, `42-core-export.js`, `43-core-export-host.js`, `44-core-stage.js`

From `core/rand`, `core/tags`, `core/export`, `core/space`, `core/materials/record`, `core/atmos` (with `sky/` and `host/`), `core/water`, `core/clock`, `core/host` (the shell and `94-host-polytool.js`): see `build.py`

Read in place from `biomes/eastabyss/src/`: `50-biome-eastabyss-species.js` (as `47a-ea-species.js`), `55-biome-eastabyss-trees.js` (as `47b-ea-trees.js`), with its library pack (`44b`)

## src/

| Fragment | KB | Sections (line) |
|---|---|---|
| `00-head.html` | 1 |  |
| `45-host-stage.js` | 18 | the rim slope as functions (40); the bake (94); the water's levels (123); the host binding (138); the ground (148); the far country (184) |
| `47c-host-eastabyss-end.js` | <1 |  |
| `50-biome-absav-species.js` | 19 | palettes (14); the species (40); harvest (78); procedural fallbacks (94); geometries (133); materials (164); instanced items (193) |
| `55-biome-absav-trees.js` | 18 | the world seed and the cells (12); the burn mosaic (32); zones (47); colour (60); keep-clear (68); far impostors (74); the builders (91); one tree alone (156); the passes (168); the pass (187) |
| `60-biome-absav-floor.js` | 9 | the kopjes (57); the caprock (71); the pass (80) |
| `70-biome-absav.js` | 1 |  |
| `88-host-build.js` | 1 |  |
| `89a-host-atmos.js` | <1 |  |
| `89s-host-sky.js` | 2 |  |
| `89w-host-water.js` | 3 |  |
| `99-host-take.js` | 8 | the inspector's words (24); the probe's budgets and checks (34); the page, handed to the host (73) |
| `99-tail.html` | <1 |  |
