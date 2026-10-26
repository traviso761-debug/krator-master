# biomes/cut: index

*Written by hand in `tools/make_index.py`'s shape; rerun the tool on the merged tree to regenerate it.*

Docs: `PLAN.md` (the plan, its Core adoption section and the owner's decisions), `README.md`, `BIOME-API.md`, `KNOWN_ISSUES.md`, `PORT.md`

Built output (never open it; edit `src/` and `stations/` and rebuild): `dist/cut.html`, `dist/cut-wall.html`, `dist/cut-face.html` (+ `dist/cut.tex.*.js`, the packs' sidecars)

Build: `cd biomes/cut && python3 build.py` (station 1), `--station wall`, `--station face`. Fragments are concatenated in filename order; a station's own fragments replace `src/`'s of the same name.

From `core/biome/`: `10-core-head.js`, `20-core-kit.js`, `30-core-foliage.js`, `32-core-variants.js`, `40-core-place.js`, `42-core-export.js`, `43-core-export-host.js`. From `core/terrain/`: `36-core-carve.js`, `38-core-relief.js`. Also core/rand, core/tags, core/space, core/export, core/water, core/atmos (with `sky/`, `host/`, `fx/89-atmos-fx-snowcover.js`), core/materials/record, core/host (the shell, the polygon tool).

Read in place: `biomes/nwlowlands/src/50, 55, 60, 70` (slots `48a`-`48d`, every station); `biomes/nhighlands/src/50, 55, 60, 70` (slots `48e`-`48h`, the face). Tests: `tests/test-cut.js`.

| Fragment | KB | What |
|---|---|---|
| `src/00-head.html` | 1 | page shell |
| `src/41-cut-field.js` | 12 | the bowl on the 4.22 survey (lip by bearing, the floor and its lakes, the walls' sweep, the broken mountain), the stations' sites, the field, the warp, the horizon cast |
| `src/45-host-stage.js` | 9 | station 1's STAGE: the floor by the upper lake, the creek, the zones, the fields, the layers, the views |
| `src/46-biome-cut-warp.js` | 8 | CUT.warpKit: the warp, the dense air and the size steps on a read-in kit's trees (per foot) and floor plants; crown bites; the ring's species list |
| `src/47-host-land.js` | 9 | renderer, light, the layered ground mesh, BIO.init; the far ground (the whole bowl) |
| `src/50-biome-cut-species.js` | 14 | the five natives (records, harvest, tags); the card, culm (three LOD tiers, three bitten), shoot, disc and melon geometries; materials; items |
| `src/55-biome-cut-natives.js` | 10 | CUT.plan (groves, reeds, rankgrass rows: records on KRAND) and CUT.draw |
| `src/57-biome-cut-melon-lichen.js` | 6 | measure melons (three sizes, the stuck share) and circle lichen (never touching): planners, drawing, checks |
| `src/60-biome-cut-camp.js` | 6 | the cutters' camp: tagged placeholder props for Dilihan's kit |
| `src/70-biome-cut.js` | 1 | CUT.build, CUT.speciesOfItem, kitEnd |
| `src/88-host-build.js` | 2 | the build order |
| `src/89a-host-atmos.js` | 1 | ATMOS.bindHost |
| `src/89s-host-sky.js` | 3 | the shared sky at the station's pixel, the ridges, the echoes' light |
| `src/89t-host-weather.js` | 1 | ATMOS.bindWeather |
| `src/89w-host-water.js` | 3 | the lake (two open surfaces), a station's still pool |
| `src/99-host-take.js` | 10 | views, inspector, the compass, budgets, the kit's checks and negatives, KHOST.take |
| `src/99-tail.html` | 0 | page shell |
| `stations/wall/00-head.html` | 1 | page shell (its title) |
| `stations/wall/45-host-stage.js` | 7 | the station's STAGE |
| `stations/face/00-head.html` | 1 | page shell (its title) |
| `stations/face/45-host-stage.js` | 7 | the station's STAGE |
| `stations/face/48z-host-face.js` | 2 | the polished face's mesh (rock.cut.polished, the beds level) |
