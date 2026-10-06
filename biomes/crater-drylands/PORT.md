# biomes/crater-drylands: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 27 (14%) | 16 (9%) | 13 (7%) | 53 (28%) | 78 (42%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 2.5 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/45-host-stage.js` | 10.1 | [web] | 7 | 0 | 3 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/50-biome-craterdry-species.js` | 42.6 | [draw] | 0 | 5 | 0 | 0 | 0 | 9 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/52-biome-craterdry-fire.js` | 10.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 7 | 0 | 0 | 0 | 0 | 0 | the fire model: reads terrain and fields through BIO, writes typed arrays; the geom count is BIO.field/terrainH |
| `src/55-biome-craterdry-trees.js` | 35.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 12 | 0 | 0 | 0 | 0 | 0 |  |
| `src/60-biome-craterdry-floor.js` | 15.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/70-biome-craterdry.js` | 1.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/82-host-sky.js` | 12.7 | [G native] | 19 | 1 | 0 | 0 | 0 | 3 | 6 | 0 | 0 | 0 | 0 | becomes a core/atmos sky preset (WORLD.md: dense-air light) |
| `src/84-host-ground.js` | 16.4 | [G shader] | 13 | 3 | 0 | 0 | 0 | 2 | 12 | 0 | 0 | 0 | 0 |  |
| `src/88-host-build.js` | 0.9 | [web] | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/89-host-fire.js` | 13.9 | [web] | 13 | 0 | 5 | 2 | 0 | 1 | 11 | 2 | 2 | 0 | 0 | split: the live fire's controls and sprite pool [web]; its shader text is [G shader]; the arrival map is 52's [G data] |
| `src/90-host-camera.js` | 9.8 | [web] | 5 | 0 | 4 | 7 | 3 | 0 | 0 | 1 | 2 | 0 | 0 |  |
| `src/91-host-probe.js` | 9.6 | [web] | 2 | 0 | 0 | 0 | 0 | 1 | 0 | 4 | 0 | 0 | 0 |  |
| `src/93-host-polytool.js` | 6.2 | [web] | 9 | 0 | 12 | 6 | 0 | 2 | 0 | 0 | 1 | 0 | 0 |  |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

(none yet: the split lists and the overrides go here)
