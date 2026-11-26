# biomes/paintedhighlands: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 18 (16%) | 16 (13%) | 2 (1%) | 28 (24%) | 53 (45%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/40-biome-painted-sites.js` | 6.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/41-biome-painted-bloom.js` | 4.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/42-biome-painted-fauna.js` | 2.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/45-host-stage.js` | 15.9 | [web] | 7 | 0 | 3 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: the land per station and the fields are data (KSTRATA, KRELIEF, KRAND); the renderer and the light are the host's |
| `src/46-host-cliff.js` | 8.2 | [draw] | 1 | 1 | 0 | 0 | 0 | 1 | 0 | 1 | 0 | 0 | 0 | split: the cliff sites are core/tags records and a KMASK raster (data); the anchors and KCARVE's patches are drawn in 84 |
| `src/50-biome-painted-species.js` | 7.1 | [draw] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | split: the species records are data; the items and materials draw (BIO.def, BIO.leafMat, BIO.alphaTex) |
| `src/60-biome-painted-place.js` | 5.8 | [draw] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | placement on KRAND cells; its colours are THREE.Color (PAINTED.C): data once colours are hex |
| `src/70-biome-painted.js` | 4.7 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the trees by BIO.kin (ebadlands' builder) and the dress: placement on KRAND, KSPACE |
| `src/84-host-ground.js` | 12.5 | [G shader] | 7 | 2 | 0 | 0 | 0 | 1 | 5 | 0 | 0 | 0 | 0 | the ground's shader: KGROUND layers, KSTRATA's strataColor, the bloom's uniforms |
| `src/85-host-far.js` | 5.0 | [web] | 3 | 0 | 0 | 0 | 2 | 0 | 2 | 0 | 0 | 0 | 0 |  |
| `src/86-host-stacks.js` | 3.1 | [G shader] | 4 | 0 | 0 | 0 | 0 | 2 | 2 | 0 | 0 | 0 | 0 | KSTACKS records (data) drawn with the strata shader |
| `src/88-host-place.js` | 2.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the passes in order; the accept functions are data |
| `src/89-host-sky.js` | 1.6 | [G native] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89a-host-atmos.js` | 5.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/89w-host-water.js` | 7.7 | [draw] | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | core/water's stills, flow and springs; the melt's levels from the bloom's calendar |
| `src/89z-host-build.js` | 5.8 | [web] | 1 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/99-host-take.js` | 16.7 | [draw] | 1 | 0 | 0 | 0 | 0 | 4 | 0 | 2 | 0 | 0 | 0 | the views, inspector, checks and season select handed to core/host |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

(none yet: the split lists and the overrides go here)
