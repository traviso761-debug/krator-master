# biomes/necanyons: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 38 (25%) | 0 (0%) | 2 (1%) | 21 (14%) | 94 (61%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/45-host-stage.js` | 9.6 | [web] | 7 | 0 | 3 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/46-biome-necanyons-layout.js` | 8.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/47-host-land.js` | 35.2 | [draw] | 17 | 1 | 0 | 0 | 0 | 5 | 12 | 1 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/50-biome-necanyons-species.js` | 27.8 | [draw] | 0 | 1 | 0 | 0 | 0 | 3 | 4 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/55-biome-necanyons-trees.js` | 20.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 14 | 0 | 0 | 0 | 0 | 0 |  |
| `src/57-biome-necanyons-carnivores.js` | 10.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/60-biome-necanyons-floor.js` | 2.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/70-biome-necanyons.js` | 1.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/83-host-far.js` | 5.0 | [web] | 2 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/88-host-build.js` | 3.3 | [web] | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/89-host-sky.js` | 1.6 | [G native] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89a-host-atmos.js` | 2.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | ATMOS.bindHost, the clock on the world hour |
| `src/89g-host-nightlife.js` | 2.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the night's life on core/atmos: glow cards at the monkeycups' lures (57's NECANYONS.LURES records), fireflies over the creek banks, seeps and rain pools (centres by KRAND hash). A port draws the same two sprite sets from ATMOS.export's records |
| `src/89n-host-night.js` | 3.1 | [draw] | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the night: the lights, the fog, the dome and the exposure by the world hour (core/atmos's night curve); Pinnacle Rock reads it in place. A port sets its environment from the same two light sets |
| `src/89w-host-water.js` | 5.8 | [draw] | 6 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | core/water draws the creek (a flow) and the rain pools (still water: one mesh, WATER.stillMaterial) from 47's records; core/atmos bound on the host's hour |
| `src/99-host-take.js` | 15.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

(none yet: the split lists and the overrides go here)
