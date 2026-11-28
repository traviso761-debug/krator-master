# biomes/arachnoids: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 34 (19%) | 0 (0%) | 1 (1%) | 30 (17%) | 112 (63%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/28-vstack-mipvar.js` | 1.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/40-biome-arach-phys.js` | 18.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/41-biome-arach-sites.js` | 10.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/45-host-stage.js` | 21.9 | [web] | 10 | 0 | 3 | 1 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/46-vstack.js` | 0.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/50-biome-arach-species.js` | 36.4 | [draw] | 0 | 1 | 0 | 0 | 0 | 11 | 3 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/60-biome-arach-place.js` | 21.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/70-biome-arachnoids.js` | 0.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/84-host-ground.js` | 20.5 | [draw] | 41 | 1 | 0 | 0 | 0 | 6 | 6 | 0 | 0 | 0 | 0 |  |
| `src/85-host-far.js` | 3.9 | [web] | 4 | 1 | 0 | 0 | 2 | 0 | 1 | 0 | 0 | 0 | 0 |  |
| `src/86-host-works.js` | 7.4 | [draw] | 14 | 0 | 0 | 0 | 0 | 12 | 0 | 0 | 0 | 0 | 0 |  |
| `src/88-host-place.js` | 0.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89-host-sky.js` | 1.4 | [G native] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89a-host-atmos.js` | 2.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/89w-host-water.js` | 3.5 | [draw] | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89z-host-build.js` | 3.1 | [web] | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/89z9-vstack-post.js` | 6.1 | [draw] | 2 | 4 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | canvas painters: TEX.def or bake |
| `src/99-host-take.js` | 16.2 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 |  |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

(none yet: the split lists and the overrides go here)
