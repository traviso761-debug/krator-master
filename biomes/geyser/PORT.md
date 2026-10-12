# biomes/geyser: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 38 (21%) | 38 (21%) | 14 (8%) | 47 (27%) | 41 (23%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 3.0 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/45-host-stage.js` | 14.8 | [web] | 7 | 0 | 3 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/46-biome-geyser-layout.js` | 23.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the thermal ground: records, relief, heat, run-off, cycles (port as is) |
| `src/47-host-land.js` | 5.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/50-biome-geyser-species.js` | 20.8 | [draw] | 0 | 1 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/55-biome-geyser-trees.js` | 17.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 13 | 0 | 0 | 0 | 0 | 0 |  |
| `src/57-biome-geyser-sinter.js` | 2.9 | [draw] | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 |  |
| `src/60-biome-geyser-floor.js` | 6.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/65-biome-geyser-show.js` | 17.5 | [G shader] | 0 | 0 | 0 | 0 | 0 | 5 | 22 | 0 | 0 | 0 | 0 | the springs, mud pots, steam, eruptions: spatial shaders and GPUParticles3D; the cycle is GEYSER.cycle (46), the records GEYSER.records() |
| `src/70-biome-geyser.js` | 2.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/82-host-sky.js` | 14.3 | [G native] | 19 | 1 | 0 | 0 | 0 | 3 | 6 | 0 | 0 | 0 | 0 | shader hook inside |
| `src/84-host-ground.js` | 14.0 | [G shader] | 11 | 2 | 0 | 0 | 0 | 1 | 5 | 0 | 0 | 0 | 0 | the thermal paint: the kit's record per vertex; the mats, the film and the Stair's pools in the fragment shader |
| `src/86-host-water.js` | 6.1 | [G shader] | 7 | 0 | 0 | 0 | 0 | 2 | 10 | 0 | 0 | 0 | 0 |  |
| `src/88-host-build.js` | 1.4 | [web] | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/90-host-camera.js` | 11.2 | [web] | 5 | 0 | 9 | 11 | 3 | 0 | 0 | 1 | 2 | 0 | 0 |  |
| `src/91-host-probe.js` | 10.6 | [web] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 |  |
| `src/93-host-polytool.js` | 6.2 | [web] | 9 | 0 | 12 | 6 | 0 | 2 | 0 | 0 | 1 | 0 | 0 |  |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

(none yet: the split lists and the overrides go here)
