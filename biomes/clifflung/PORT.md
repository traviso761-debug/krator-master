# biomes/clifflung: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 28 (32%) | 5 (6%) | 2 (2%) | 17 (19%) | 36 (41%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/41-biome-lung-data.js` | 19.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | LUNG: the breath, the bands, the yield, the layout, the hazards, the sites, the species as plain records on KRAND; tests/test-lung.js. Godot: the same functions |
| `src/44-host-station.js` | 2.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the station's numbers (plain data) |
| `src/45-host-stage.js` | 9.9 | [web] | 7 | 0 | 3 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the stage: KRELIEF.scarp baked to KFIELD (exported: api.field), the fields, the layout called, BIO.init |
| `src/72-biome-lung.js` | 18.9 | [draw] | 0 | 1 | 0 | 0 | 0 | 17 | 0 | 0 | 0 | 0 | 0 | the lungs' items and pass: draws LUNG.layout's records; the breath on BIO.animHook (one scalar each) |
| `src/84-host-ground.js` | 5.4 | [web] | 8 | 0 | 0 | 0 | 0 | 1 | 3 | 0 | 0 | 0 | 0 | the ground mesh and its KGROUND layers |
| `src/85-host-far.js` | 3.3 | [web] | 2 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | KFAR past the map, the far lungs (KFAR.streaks), KHORIZON |
| `src/89-host-sky.js` | 1.6 | [G native] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the shared sky (ATMOS.skyBiome) |
| `src/89z-host-atmos.js` | 1.5 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | core/atmos bound: the deck and its day (ATMOS.deckDay on LUNG.DECK), weather, height fog |
| `src/89zw-host-water.js` | 2.3 | [draw] | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the wells on core/water (karstSpring) |
| `src/89zwr-host-lungrec.js` | 1.8 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the rings, mouths, bells and hazards registered (core/tags, core/hazard) |
| `src/89zx-host-build.js` | 2.1 | [web] | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | the passes in order and the bake |
| `src/89zy-host-breath.js` | 3.1 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the one tick: LUNG.breath to the items, the steam groups, the far lines, KHAZ's clock |
| `src/99-host-take.js` | 14.8 | [web] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | views, inspector, the probe's checks and negatives (PLAN.md section 16, L6) |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

(none yet: the split lists and the overrides go here)
