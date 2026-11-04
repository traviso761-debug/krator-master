# biomes/cut: index

*Written by hand in `tools/make_index.py`'s shape; rerun the tool on the merged tree to regenerate it.*

Docs: `PLAN.md` (the plan, its Core adoption section and the owner's decisions), `README.md`, `BIOME-API.md`, `KNOWN_ISSUES.md`, `PORT.md`

Built output (never open it; edit `src/` and `stations/` and rebuild): `dist/cut.html`, `dist/cut-wall.html`, `dist/cut-face.html` (+ `dist/cut.tex.*.js`, the packs' sidecars)

Build: `cd biomes/cut && python3 build.py` (station 1), `--station wall`, `--station face`. Fragments are concatenated in filename order; a station's own fragments replace `src/`'s of the same name.

From `core/biome/`: `10-core-head.js`, `20-core-kit.js`, `30-core-foliage.js`, `31b-core-leafset.js`, `31j-core-joint.js`, `32-core-variants.js`, `33-core-fungoid.js`, `33b-core-bamboo.js`, `34-core-impostor.js`, `40-core-place.js`, `41-core-env.js`, `42-core-export.js`, `43-core-export-host.js`, `44-core-stage.js`. From `core/terrain/`: `35-core-strata.js`, `36-core-carve.js`, `38-core-relief.js`, `43-core-ground.js`, `44-core-farfield.js`, `45-core-horizon.js` (and their `host/` halves). Also core/rand, core/tags, core/space, core/export, core/shadow (KSHADOW, `?shadow=1`), core/shader's KWARP (`?bend=1`), core/water (with `ext/` 56, 57, 58, 60, 61), core/atmos (with `sky/`, `host/`, the height fog, `fx/` snow cover, rain cover, lightning), core/materials/record, core/host (the shell, the polygon tool).

Read in place: `biomes/nwlowlands/src/50, 55, 60, 70` (slots `48a`-`48d`, every station); `biomes/nhighlands/src/50, 55, 60, 70` (slots `48e`-`48h`, the face and the wall). Tests: `tests/test-cut.js`. Read by: `biomes/nhighlands` (`41`, `50`, `55`, `57`, `70`, exchanges 7 and 8).

| Fragment | KB | What |
|---|---|---|
| `src/00-head.html` | 1 | page shell |
| `src/41-cut-field.js` | 12 | the bowl on the 4.22 survey (lip by bearing, the floor and its lakes, the walls' sweep, the broken mountain), the stations' sites, the field, the warp, the horizon cast |
| `src/45-host-stage.js` | 10 | station 1's STAGE: the floor by the upper lake, the creek (and its water's line), the zones, the fields, the layers, the views |
| `src/46-biome-cut-warp.js` | 11 | CUT.warpKit: the warp, the dense air and the size steps on a read-in kit's trees (per foot) and floor plants; crown bites; the ring's species list; allowAt and the stuck fruit (exchange 5) |
| `src/47-host-land.js` | 12 | renderer, light, the layered ground mesh (its layers on KGROUND), BIO.init; the far ground (the whole bowl, on KFAR) |
| `src/50-biome-cut-species.js` | 14 | the five natives (records, harvest, tags); the card, culm (three LOD tiers, three bitten), shoot, disc and melon geometries; materials; items |
| `src/55-biome-cut-natives.js` | 10 | CUT.plan (groves, reeds, rankgrass rows: records on KRAND) and CUT.draw |
| `src/57-biome-cut-melon-lichen.js` | 6 | measure melons (three sizes, the stuck share) and circle lichen (never touching): planners, drawing, checks |
| `src/60-biome-cut-camp.js` | 6 | the cutters' camp: tagged placeholder props for Dilihan's kit |
| `src/70-biome-cut.js` | 1 | CUT.build, CUT.speciesOfItem, kitEnd |
| `src/88-host-build.js` | 4 | the build order; the terrain's horizon (KHORIZON) |
| `src/89a-host-atmos.js` | 1 | ATMOS.bindHost |
| `src/89s-host-sky.js` | 3 | the shared sky at the station's pixel, the ridges, the echoes' light |
| `src/89t-host-weather.js` | 3 | ATMOS.bindWeather, the wet hollows, the height fog (the dawn mist, the walls' cloud band), the rain cover |
| `src/89w-host-water.js` | 6 | the lake (two open surfaces, no breakers), the creek's flow and its plume, a station's still pool |
| `src/89zy-host-bend.js` | 2 | the bend: KWARP's ripple along the field (`?bend=1`, off at load) |
| `src/89zz-host-shadow.js` | 3 | the sun's shadows (KSHADOW, `?shadow=1`, off at load) |
| `src/99-host-take.js` | 13 | views, inspector, the compass, budgets, the kit's checks and negatives, the edge audit, the reflections switch, KHOST.take |
| `src/99-tail.html` | 0 | page shell |
| `stations/wall/00-head.html` | 1 | page shell (its title) |
| `stations/wall/45-host-stage.js` | 7 | the station's STAGE |
| `stations/face/00-head.html` | 1 | page shell (its title) |
| `stations/face/45-host-stage.js` | 7 | the station's STAGE |
| `stations/face/48z-host-face.js` | 4 | the polished face's mesh: KSTRATA's megabreccia sawn flat (`?strata=0`: rock.cut.polished, the beds level) |
