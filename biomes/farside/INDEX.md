# biomes/farside: index

*Written by hand in the shape `tools/make_index.py` writes (rerun it to regenerate).*

Docs: `PLAN.md` (the plan, the owner's answers, the Core adoption), `NOTES.md`, `BIOME-API.md`, `KNOWN_ISSUES.md`, `PORT.md`

Built output (never open it; edit `src/` and `stations/` and rebuild): `dist/farside.html`, `dist/farside-strand.html`,
`dist/farside-front.html`, `dist/farside-cloud.html`; the texture sidecars `dist/farside.tex.farside.js`, `dist/farside.tex.nwlowlands.js`

Build: `cd biomes/farside && python3 build.py --all` (one station: `python3 build.py`, `python3 build.py --station strand|front|cloud`).
Fragments are concatenated in filename order; a station's `stations/<name>/` files replace `src/`'s of the same name.
Textures: `python3 gen_materials.py` writes `materials.json`; `python3 tools/textures/pack.py biomes/farside` (from the root) writes `tex/`.

From `core/biome/`: `10-core-head.js`, `20-core-kit.js`, `30-core-foliage.js`, `32-core-variants.js`, `40-core-place.js`, `42-core-export.js`, `43-core-export-host.js`, `44-core-stage.js`
From `core/rand`, `core/tags`, `core/export`, `core/space`, `core/materials/record`; `core/atmos` (`89-atmos-0-core`, `0p-presets`, `3-particles`, `4-weather`, `8-export`, `9-host`, `a-waves`, `b-skylight`; `host/` `c-hostbind`, `e-weatherhost`, `h-skyhost`; `sky/` `e-skymodel`, `f-skypresets`, `g-sky`); `core/water` (`20`, `21`, `22`, `50`, `51`)
From `core/host/` (with `core/clock`): `90-host-camera.js`, `91-host-loop.js`, `92-host-panel.js`, `95-host-probe.js`, `94-host-polytool.js`
Read in place: `biomes/nwlowlands/src/` `50`, `55`, `60`, `70` (slots `49a`..`49d`), and its `tex/` pack

## src/

| Fragment | KB | Sections |
|---|---|---|
| `00-head.html` | 1 | page shell |
| `44z-host-shell.js` | 2 | errors, ticks, the register, renderer, scene, camera, lights (every station) |
| `45-host-stage.js` | 6 | station 1, Farport's kelp coast: the coast (u inland, v along it) (18); the station's say: STAGE (43) |
| `47-host-land.js` | 11 | the height and the water's levels (7); the fields (16); the masks (26); the library layers (42); the ground (61); the far country (90) |
| `50-biome-farside-species.js` | 16 | palettes (19); harvest (31); the species (33); procedural fallbacks (77); geometries (85); materials (117); the buckets and items (134) |
| `55-biome-farside-trees.js` | 11 | zones (16); the grid on core/rand (23); colour (33); the land kelp (45); the dead at the front (77); the passes (87) |
| `60-biome-farside-floor.js` | 6 | the floor's passes in two LOD bands |
| `65-biome-farside-dress.js` | 4 | the sea's weed on trees (FARSIDE.dressTrees) |
| `70-biome-farside.js` | 1 | FARSIDE.build / dress / canopyH |
| `86-host-works.js` | 9 | the people's works, Eternian furniture |
| `88-host-build.js` | 2 | the build order |
| `89a-host-atmos.js` | 1 | ATMOS.bindHost |
| `89s-host-sky.js` | 3 | the shared sky at the station's pixel, the weather into it |
| `89w-host-water.js` | 4 | the sea (open + shore grid + tint), the outer sea, the streams |
| `89x-host-weather.js` | 1 | ATMOS.bindWeather |
| `99-host-take.js` | 9 | the views (5); the inspector's words (22); budgets and the kit's checks (34); the page (70) |
| `99-tail.html` | 0 | page shell |

## stations/

| Station | Page | Stage |
|---|---|---|
| `strand` | `dist/farside-strand.html` | `45-host-stage.js` (5 KB) |
| `front` | `dist/farside-front.html` | `45-host-stage.js` (4 KB) |
| `cloud` | `dist/farside-cloud.html` | `45-host-stage.js` (3 KB) |
