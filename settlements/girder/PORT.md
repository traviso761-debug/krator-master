# settlements/girder: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 125 (21%) | 7 (1%) | 89 (15%) | 42 (7%) | 340 (56%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 6.5 | [web] | 0 | 0 | 4 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/05-palette.js` | 10.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/10-core.js` | 8.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/20-stage.js` | 14.5 | [web] | 21 | 6 | 1 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | host: renderer, scene, lights, the canvas sky-dome painter and the eruption timer; the volcano and dome presets belong to core/atmos |
| `src/21-sky.js` | 54.3 | [G native] | 62 | 0 | 19 | 6 | 0 | 9 | 25 | 0 | 0 | 0 | 0 | the Krator sky (11 copies): a sky preset in core/atmos plus one [G shader] for the star, giant and ring layers; its panel and probe are host (GODOT-PLAN.md section 5) |
| `src/30-layout.js` | 23.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the layout as records: SLOTS, TOWERS, PLOTS, ROADS, GATES, TREES (addTree), FARTREES and the NAV graph. Exports as is; its rnd() draws (trees, clearings) move to KRAND at the reseeding event |
| `src/32-branches.js` | 4.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/45-kit.js` | 30.6 | [draw] | 41 | 0 | 0 | 0 | 0 | 14 | 21 | 2 | 0 | 0 | 0 | the geometry kit (BOX, SECTOR, emitBuckets, emitMerged). REGISTER and SITES are the tag registry: move to core/tags. The night light volume (nlv*, canvas bake) is [web]/[G native] and goes to the host |
| `src/47-texture.js` | 14.3 | [draw] | 5 | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the Phase 3 pilot (2026-10-03): every painter is a TEX.def kind (pure pixel functions; web and ghostwood are canvas kinds, baked at export); library families take materials.json's sets from the generated pack; the adapter KMAT.adapter('girder') gives window._materials, the table an exporter writes |
| `src/48-detail.js` | 6.6 | [G shader] | 5 | 3 | 0 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 |  |
| `src/50-structure.js` | 18.8 | [draw] | 0 | 0 | 0 | 0 | 0 | 40 | 0 | 0 | 0 | 0 | 0 | towers, decks, bridges, lifts, palisade and roads drawn from the layout records. rnd() here only varies concrete, rust and missing beams, so no data pass; REGISTER is not called here |
| `src/53-furnish.js` | 9.9 | [draw] | 4 | 0 | 0 | 0 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | split: the furniture glue. gfAt, FURNISH, FURNISHW, gfPlace write placement records: the placement pass in core/furnish (Phase 2). gfEmitKit, gfMergeGeos, gfFlush, gfDecal are the per-build draw adapter. gwAdd, gwBox, gwSeg, gwDisc (GWALK) collect the walk solids: [G data], export as collision |
| `src/55-arch.js` | 52.8 | [draw] | 0 | 0 | 0 | 0 | 0 | 33 | 0 | 0 | 0 | 0 | 0 | split: buildDwelling, roundHut, the house, plot and stall builders also decide identity: kind, name (N_FAM, N_CRAFT, STALL_GOODS), label and the REGISTER call. Data pass: building records (kind, name, programme, wealth) from SLOTS, HOUSES, PLOTS; draw pass reads them. yardLine and FURNISH calls go with the furnish pass |
| `src/56-interiors.js` | 16.8 | [G data] | 5 | 0 | 0 | 0 | 8 | 3 | 0 | 0 | 0 | 0 | 0 | split: gixPlan, gixPartition and gixFurnish plan the rooms and place the set items from the interiors kit: the per-building placement pass (GODOT-PLAN.md section 5), engine-neutral already. gixTick, gixAccum, gixMerge, gixMaterial queue and merge the meshes a few buildings a frame (performance.now): host, a preview workaround for the placer taking tens of seconds |
| `src/58-overgrowth.js` | 14.1 | [draw] | 0 | 0 | 0 | 0 | 0 | 7 | 0 | 0 | 0 | 0 | 0 | split: dens(), FACES and liftBlocked decide where curtains, creepers, plants, rim trees, roots and flowers go (133 rnd draws, inline). Data pass: overgrowth records per face and floor; draw pass: ribbon, bloom, cone, bush |
| `src/60-trees.js` | 40.5 | [draw] | 36 | 2 | 0 | 0 | 2 | 8 | 8 | 5 | 0 | 0 | 0 | a builder, not host code (TODO.md, Phase 2): trunks, bark, buttresses, boughs, leaf clumps; its trees cross over as meshes with the settlement. Split only for TREE_SAPLINGS (70 immature hypertrees by rejection sampling on terrainH): a placement record list. The Mav's Refuge copy is the same builder |
| `src/62-jungle.js` | 47.1 | [draw] | 19 | 6 | 0 | 0 | 0 | 14 | 0 | 0 | 0 | 0 | 0 | split: the understorey, boulders, logs, brook dressing and fireflies are placed inline (342 rnd draws, 15 terrainH reads, 10 Math.random calls for fireflies). Data pass writes LOGS, JUNGLE_ROCKS, JUNGLE_BROOK and scatter records; draw pass builds them. JUNGLE_BROOK is already the record 75-terrain reads |
| `src/64-cards.js` | 7.7 | [draw] | 10 | 3 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/72-lights.js` | 3.4 | [G native] | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/75-terrain.js` | 12.5 | [draw] | 22 | 0 | 0 | 0 | 0 | 3 | 3 | 0 | 0 | 0 | 0 | split: the ground and brook. terrGeo from terrainH (core/terrain bake), brookStations, brookLevelAt, brookBed and groundTone are [G data]; terrMat, waterUni and the water mesh are draw and [G shader] |
| `src/78-life.js` | 60.8 | [G data] | 30 | 0 | 0 | 0 | 13 | 38 | 7 | 6 | 0 | 0 | 0 | split: life layer (GODOT-PLAN.md section 5, Phase 5; core/simulation/PLAN.md section 1). NAV use, lifeAstar, lifeActiveAt, LIFE_DEST, lifeChooseDest, the agent schedule and the lift sim are [G data]: they become SIM places, roles and routes. lifeGeo, lifeMesh, lifeHook are the draw adapter. performance.now and 12 Math.random calls at run time are not reproducible from the clock |
| `src/80-camera.js` | 11.3 | [web] | 7 | 0 | 10 | 16 | 1 | 2 | 0 | 1 | 2 | 0 | 0 | fly camera, controls, polygon tool, render loop: host shell |
| `src/81-glow.js` | 5.9 | [G native] | 13 | 2 | 0 | 0 | 0 | 2 | 3 | 2 | 0 | 0 | 0 | shader hook inside |
| `src/82-daynight.js` | 6.2 | [G native] | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/83-walk.js` | 19.4 | [G native] | 1 | 0 | 6 | 8 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | split: walk mode is [G native] (Phase 6): wkStep, wkPush, wkCamera, wkKey and the pointer lock become a CharacterBody3D. wkBuild, wkRect, wkRamp, wkInsert and the GWALK solids are [G data]: the collision list, exported with the carver's blockers (core/terrain) |
| `src/84-flyers.js` | 91.5 | [draw] | 43 | 0 | 0 | 0 | 2 | 8 | 6 | 3 | 0 | 0 | 0 | split: the flyer models and the vertex-shader skeleton (FlyGeo, flySkinHook, flyBones) are draw and [G shader]. flyRoute, flyArrPts, flyDepPts, flyBays, FLY_SORTIES and the roost-stall traffic decide where the beasts go: a [G data] route pass. 64 Math.random calls at run time (flyRand = rnd during setup) |
| `src/85-probe.js` | 0.6 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/86-inspect.js` | 4.0 | [web] | 0 | 0 | 7 | 2 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/87-pathviz.js` | 3.0 | [web] | 5 | 0 | 4 | 1 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/90-atmos-host.js` | 1.8 | [web] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | binds core/atmos (init, the frame hook, the sky's light): host shell, moves to core/host/ |
| `src/98-start.js` | 0.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/99-tail.html` | 0.1 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

**Hand pass (GODOT-PLAN.md 3.3, Travis, 2026-10-02): every fragment over 10 KB is tagged by hand, and so are 47-texture and 53-furnish (under 10 KB, but named in the plan).** A note that starts "split" means the fragment mixes a data pass with a draw or host pass; the tag is the side to port. Dispositions follow GODOT-PLAN.md section 5 (`56-interiors`, `83-walk`, the `53-furnish` glue) and `core/materials/PLAN.md` (`47-texture`). `60-trees.js` is a builder, not host code (TODO.md); it was provisionally [web]. `78-life` and `84-flyers` are the life layer (Phase 5, `core/simulation/PLAN.md` section 1); they are the same forks of Mav's Refuge's. Fragments under 10 KB keep their provisional tags.

**This build's own copies (none uses `core/rand`, `core/terrain` or `core/materials` yet).** PRNG: `rnd()` at `10-core.js:9` (Park-Miller, multiplier 16807, modulus 2^31-1, `SEED` 20260920) with `rr`, `ri`, `pick`, `chance`, `shuffle` and `reseed` on top; sixteen fragments open with `reseed(N)` so each owns a stream. Other generators: `skyRnd` (LCG 1664525/1013904223, `21-sky.js:254`), `lrand` (`78-life.js:31`: `rnd` while building, `Math.random` after), `flyRand` (`84-flyers.js:331`: `rnd` during setup, `Math.random` at run time). Unseeded `Math.random` calls: 4 in `20-stage.js` (eruption), 10 in `62-jungle.js` (fireflies), 12 in `78-life.js`, 64 in `84-flyers.js`; these cannot be reproduced from a seed. Noise: `h2` (integer hash), `vn`, `fbm` (4 octaves) and `sig` at `10-core.js:26-37`, `phash` (sine hash, `10-core.js:39`) and `texNoise` (`47-texture.js:15`). `terrainH` at `10-core.js:144`: a ground plane plus `sig` bumps weighted by the distance to the brook (`nearBrook`), then edge and channel terms; `75-terrain.js` rebuilds the brook from `JUNGLE_BROOK`. Palette: `PAL` (`05-palette.js:8`), `FAMMAT` (`:112`, family to material), `BUDGET`, and the `*C` aliases from `:138`.
