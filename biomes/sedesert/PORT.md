# biomes/sedesert: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 9 (4%) | 0 (0%) | 2 (1%) | 75 (31%) | 157 (65%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/35-core-strata.js` | 8.7 | [draw] | 1 | 5 | 0 | 0 | 0 | 2 | 3 | 0 | 0 | 0 | 0 | canvas painters: TEX.def or bake |
| `src/45-host-stage.js` | 50.5 | [web] | 30 | 5 | 3 | 1 | 6 | 1 | 10 | 0 | 0 | 0 | 0 | split: terrainH0 is baked into a core/terrain field (TFIELD) at load and terrainH reads it; the water and fields are data still to move; the DOM goes to core/host |
| `src/50-biome-sedesert-species.js` | 35.8 | [draw] | 0 | 3 | 0 | 0 | 0 | 7 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/55-biome-sedesert-trees.js` | 39.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 14 | 0 | 0 | 0 | 0 | 0 | placement pass: `SEDESERT.buildTrees` (line 314); `mk` (line 318) makes a record and the `BIO.grid` calls push it to `TREES`, with the LOD level `T.lv` set there (see TODO.md, level-free records). Draw pass: the `TREES.forEach` loop (line 336) in the same function, which calls the per-species builder `B[sp]` (hero and stand-in) or `buildFar` for the far impostor. The two passes share one function but not one loop |
| `src/60-biome-sedesert-floor.js` | 16.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | split: places and draws in one pass (BIO.grid then BIO.put) |
| `src/65-biome-sedesert-dress.js` | 8.8 | [draw] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 2 | 0 | 0 | 0 | split: places and draws in one pass (BIO.upFaces, downFaces, sideFaces and ledgePoints over the host's shells, then BIO.put); not a BIO.grid pass |
| `src/70-biome-sedesert.js` | 1.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/75-biome-sedesert-fauna.js` | 37.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 18 | 0 | 2 | 0 | 0 | 0 | split: places and draws in one pass (BIO.grid then the body build); the deer and coyotes' layout (walkers) is data and their pose a function of the BIO clock (walkAt) |
| `src/85-host-tower.js` | 5.7 | [draw] | 8 | 2 | 0 | 0 | 0 | 10 | 0 | 0 | 0 | 0 | 0 | a preview prop builder (one Girder tower); no port |
| `src/87-host-kin.js` | 3.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/88-host-build.js` | 2.4 | [web] | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/89-host-sky.js` | 1.7 | [G native] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89w-host-water.js` | 4.2 | [draw] | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the river, the cataract and the pool drawn by core/water (their records are 45's, exported in the water section; Godot's water_import draws them) |
| `src/89x-host-air.js` | 4.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/99-host-take.js` | 21.3 | [web] | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | KHOST.take, and the editor's world: fauna put down (kits/fauna), ground strokes on TFIELD and the ground lattice lifted, replay on undo: host shell |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

**Hand pass (2026-10-03): the kit's own copies.** PRNG and noise: none of its own. `reseed`/`rng` (mulberry32), `h3` (a sin hash), `vnoise` and `fbm` are the one copy in `core/biome/10-core-head.js` (`BIO.fn`); its `rng` already equals `KRAND.stream` (`core/PORT.md`), and the sin-based `h3`, `vnoise` and `fbm` move to `core/rand` in the biome reseeding event. Terrain: its own `terrainH0` (line 90) behind the memoising `terrainH` (line 87) with `waterH` in `src/45-host-stage.js` and the climate-field bake `FC`, which is the data `core/terrain` replaces. Palette: its own `SEDESERT.PAL`, built in `src/50-biome-sedesert-species.js` (line 28).

**Station 2, the Bowl (2026-10-26; `python3 build.py --station bowl`, `stations/bowl/`, PLAN-BOWL.md).** Its fragments, tagged by hand
(`tools/audit_port.py` reads `src/` only; keep this table current when a station fragment is split or moved):

| Fragment | Tag | Note |
|---|---|---|
| `stations/bowl/00-head.html` | [web] | page shell |
| `stations/bowl/45-host-shell.js` | [web] | the shell every Bowl station shares: the error panel, the registry, the renderer, scene and lights |
| `stations/bowl/46-host-land.js` | [web] | split: the channels' grid, the baked ground (KFIELD), the local water and the fields' cache are data from the layout; BIO.init is host |
| `stations/bowl/83-host-regions.js` | [web] | the Bowl's named regions (registered volumes) |
| `stations/bowl/98-host-checks.js` | [web] | the inspector's words and the checks, shared by the Bowl's stations |
| `stations/bowl/45-host-stage.js` | [web] | split: the layout (shore `zS`, plateau, fan, dunes), `baseH`, the delta's channel lines and levels (KRELIEF.river), the kaluts' lattice (KRAND per cell) and `terrainH0` are plain maths of (x, z) and port as data; the old lake is core/terrain's KBASIN ([G data]); the ground is baked into a KFIELD field (TFIELD) and exported as the terrain; the field cache and BIO.init are host |
| `stations/bowl/56-biome-sedesert-bowl.js` | [G data] | the dense-air habit (`SEDESERT.ABYSSAL`, multipliers on H, rb, crownR) and the Bowl's tree passes as data (species, cell, acceptance, options); no three.js |
| `stations/bowl/66-biome-sedesert-halo.js` | [draw] | split: the halophytes' materials and items (library cards, BIO.libSwap('bowl')), their builders and the floor pass, placing and drawing in one pass (BIO.grid then BIO.put / BIO.tube), as 60 |
| `stations/bowl/84-host-ground.js` | [draw] | the ground mesh, its painter (canvas) and its shader hook (the library layers by vertex weight, the kit's strata on the kaluts' faces): a .gdshader rewrite, its weights data |
| `stations/bowl/86-host-shimmer.js` | [G shader] | the heat pass: screen colour and depth re-read with a wavering offset, and the inferior mirage under the horizon (Godot: hint_screen_texture and hint_depth_texture on a full-screen quad) |
| `stations/bowl/87-host-far.js` | [draw] | the far country's ring mesh from `baseH`, and Mantis's far glimpse (boxes and palms, looming x3): no port (the open world draws the region) |
| `stations/bowl/88-host-build.js` | [web] | split: data inside host code |
| `stations/bowl/89a-host-atmos.js` | [web] | ATMOS.bindHost |
| `stations/bowl/89s-host-sky.js` | [G native] | the shared sky preset at px 866,826 (1.83 atm, dusty, two ridges): Godot's krator/sky.gd reads the same preset |
| `stations/bowl/89w-host-water.js` | [draw] | the lake (two WATER.open surfaces; the banded shallows a baked tint field) and the delta's six flows, drawn by core/water and exported in its water section |
| `stations/bowl/99-host-take.js` | [web] | KHOST.take, the views, the inspector's words and the station's checks: host shell |

**Station 2b, Mantis's pocket (2026-10-26; `python3 build.py --station mantis`, `stations/mantis/`).** It inherits the Bowl's fragments
(above) and replaces or adds:

| Fragment | Tag | Note |
|---|---|---|
| `stations/mantis/45-host-stage.js` | [web] | split: the layout (shore, springs, streams, the pocket, the town's records from KRAND), groundH and fieldsAt are data; STATION its options |
| `stations/mantis/57-biome-sedesert-forest.js` | [draw] | split: the forest's five species (data, pushed onto SEDESERT.SPECIES) and their builders on the kit's tools; the pocket's passes (data) |
| `stations/mantis/67-biome-sedesert-pocket.js` | [draw] | split: the pocket's floor, placing and drawing in one pass, as 60 |
| `stations/mantis/83-host-regions.js` | [web] | the pocket's named regions |
| `stations/mantis/88-host-build.js` | [draw] | the town's edge as one mesh (its records are 45's), the gardens' trees and beds, the kit's build, the bake |
| `stations/mantis/99-host-take.js` | [web] | the views and the forest check, KHOST.take |

**Station 3, the steppe fringe (2026-10-26; `python3 build.py --station steppe`, `stations/steppe/`).** It inherits Mantis's
fragments (and so the Bowl's), drops Mantis's passes and floor (58, 67), and adds or replaces:

| Fragment | Tag | Note |
|---|---|---|
| `stations/steppe/45-host-stage.js` | [web] | split: the layout (kopjes, the pan, the wadi, the fairy lattice from KRAND) and fieldsAt are data; STATION its options |
| `stations/steppe/47-host-rock.js` | [draw] | split: the tors, the mesa and the hoodoos are KSTACKS records ([G data]); the mesh and its tafoni shader are drawing |
| `stations/steppe/59-biome-sedesert-steppe.js` | [draw] | split: the steppe habit, the species and passes are data; the items' geometries, the plants and the sun-dials' and lanterns' motion draw |
| `stations/steppe/67-biome-sedesert-steppefloor.js` | [draw] | split: the floor, placing and drawing in one pass |
| `stations/steppe/83-host-regions.js` | [web] | the steppe's named regions |
| `stations/steppe/88-host-build.js` | [web] | split: the fairy discs handed to the floor, the build, the bake |
| `stations/steppe/99-host-take.js` | [web] | the views, the rare and alien check, the sun-dial check, KHOST.take |

