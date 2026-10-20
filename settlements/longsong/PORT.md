# settlements/longsong: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 151 (30%) | 0 (0%) | 0 (0%) | 94 (19%) | 253 (51%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/40-ls-plan.js` | 46.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | the plan as records and pure queries (LS): the site, the rock, the buildings, the Vault, the sealed things, the people and their schedules |
| `src/40b-ls-farms.js` | 12.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 | the farms and gardens as records and pure queries (LS.FARMS): groups, cells, trees, walls, the herds, the provision |
| `src/40c-ls-rooms.js` | 62.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the rooms as records (LS.ROOMS: 320, fitted in the drawn shells, doors on shared walls) and their pure checks |
| `src/40d-ls-sim.js` | 22.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | the people's world for core/simulation: the walk graph, the places, the roles; no three.js, no DOM |
| `src/40e-ls-kchar.js` | 2.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | each person's core/charactermodels record (KCHAR.stranger on its seed, the tier by role); twin: the same call in kchar_rig.gd |
| `src/40h-ls-hamlets.js` | 3.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/42-ls-world.js` | 1.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | WORLD.init and the page's origin on the model; landH/worldWater wrappers |
| `src/45-host-stage.js` | 19.0 | [web] | 7 | 0 | 3 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | split: the land's shaping (rock, terraces, pads, pond: data) sits with the renderer and BIO.init |
| `src/57a-ls-interiors.js` | 34.4 | [web] | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | the interiors’ data: programmes and layouts, furnishRoom over the catalog runtime adapter (it measures tops with THREE), the bake’s adoption, the checks; draws nothing |
| `src/62-ls-arch.js` | 28.0 | [draw] | 10 | 0 | 0 | 0 | 0 | 48 | 1 | 0 | 0 | 0 | 0 | the architecture kit: merged per-material meshes; the vocabulary (lsBlock, lsWindows, lsGiltRoof, lsChorten...) |
| `src/63-ls-signs.js` | 8.4 | [draw] | 6 | 2 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | canvas pictures: the sigil, plaques, thangka, glyph band, seal, dial |
| `src/64-ls-monastery.js` | 54.5 | [draw] | 15 | 2 | 0 | 0 | 0 | 92 | 5 | 4 | 0 | 0 | 0 | draws the plan's records; registers each building in core/tags first |
| `src/65-ls-marks.js` | 3.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the culture marks drawn through LSSOCK (63s, core/sockets) |
| `src/66-ls-vault.js` | 40.7 | [draw] | 56 | 2 | 0 | 0 | 0 | 74 | 12 | 0 | 0 | 0 | 0 | the Vault and the Procrastinator; its own lights shader |
| `src/68-ls-life.js` | 18.8 | [draw] | 18 | 0 | 0 | 0 | 0 | 7 | 3 | 1 | 0 | 0 | 0 | draws the people from SIM.pose (40d declares their world on core/simulation; the records in 40); the activities' poses are motion as a function of time |
| `src/69-ls-figures.js` | 11.3 | [draw] | 2 | 0 | 2 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | the nearest people as KCharFigures from their records, the pieces from sidecars; Godot: kchar_figure.gd |
| `src/84-ls-ground.js` | 8.5 | [draw] | 6 | 1 | 0 | 0 | 0 | 1 | 6 | 0 | 0 | 0 | 0 |  |
| `src/85-ls-farms.js` | 30.3 | [draw] | 20 | 2 | 0 | 0 | 0 | 35 | 5 | 2 | 0 | 0 | 0 | draws LS.FARMS: the fields' ground, the crop cards' atlas, walls, mills, herds; registers each group first |
| `src/85h-ls-hamlets.js` | 11.5 | [draw] | 9 | 0 | 0 | 0 | 0 | 7 | 0 | 1 | 0 | 0 | 0 |  |
| `src/86-ls-far.js` | 2.0 | [draw] | 3 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | the far land: one ring mesh from WORLD.H (the scale model) |
| `src/87-ls-interiors.js` | 20.6 | [draw] | 8 | 0 | 0 | 0 | 2 | 10 | 0 | 0 | 0 | 0 | 0 | draws a floor at a time (the cutaway’s storey, the floor the eye stands on): room shells and the pieces in one catalog batch |
| `src/88-host-build.js` | 2.4 | [web] | 3 | 0 | 0 | 0 | 2 | 1 | 0 | 2 | 0 | 0 | 0 | the build order; the probe's samples of the merged meshes |
| `src/89w-ls-water.js` | 6.6 | [draw] | 5 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | the stream, the canal, the pond and the pools on core/water (records, one still mesh), the water's checks |
| `src/89x-ls-night.js` | 10.4 | [web] | 0 | 2 | 0 | 0 | 1 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89y-ls-festival.js` | 8.8 | [draw] | 0 | 2 | 0 | 0 | 0 | 7 | 0 | 3 | 0 | 0 | 0 | the festival day shown: the thangka hung, the camp pitched (who comes is core/simulation's: 40, 40d) |
| `src/89z-ls-atmos.js` | 2.7 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | core/atmos host: weather on the fog and lights, smoke, fireflies, cull, LOD options |
| `src/94-ls-export.js` | 9.6 | [web] | 3 | 2 | 0 | 0 | 0 | 0 | 1 | 1 | 0 | 0 | 0 | core/export contributor: reads the three.js scene at export time |
| `src/99-host-take.js` | 14.4 | [web] | 0 | 0 | 3 | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | the page handed to core/host: views, inspector words, checks |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

(none yet: the split lists and the overrides go here)
