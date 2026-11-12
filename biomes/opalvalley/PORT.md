# biomes/opalvalley: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 44 (36%) | 12 (10%) | 2 (1%) | 34 (28%) | 30 (25%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/40-biome-opal-sites.js` | 15.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/45-host-stage.js` | 23.1 | [web] | 7 | 0 | 3 | 1 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | split: the treads (the chain expanded) and the land are data; the renderer, the scene and BIO.init are the host's |
| `src/48-host-therm.js` | 1.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/50-biome-opal-species.js` | 11.7 | [draw] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | split: the records (OPAL.SPECIES, OPAL.KIN, OPAL.PAL, OPAL.HARVEST, OPAL.IRID) are data; the items and materials draw (BIO.def, BIO.alphaTex, BIO.iridBarkMat) |
| `src/55-biome-opal-place.js` | 7.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | placement on KRAND cells; the kin grown by their source kits' builders (BIO.kin); its colours are THREE.Color (OPAL.C): data once colours are hex |
| `src/70-biome-opal.js` | 0.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/84-host-ground.js` | 12.0 | [G shader] | 5 | 2 | 0 | 0 | 0 | 1 | 5 | 0 | 0 | 0 | 0 |  |
| `src/85-host-far.js` | 4.9 | [web] | 3 | 0 | 0 | 0 | 2 | 0 | 2 | 0 | 0 | 0 | 0 |  |
| `src/86-host-digs.js` | 6.0 | [draw] | 3 | 0 | 0 | 0 | 0 | 11 | 0 | 0 | 0 | 0 | 0 | the diggings drawn from OPAL_DIGGINGS' records (40, [G data]); registered in core/tags |
| `src/88-host-flora.js` | 2.1 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | orders the passes (the kin, the kit's own, Oidong's high country) |
| `src/89-host-sky.js` | 1.8 | [G native] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89a-host-atmos.js` | 3.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/89b-host-spray.js` | 1.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | core/atmos smoke groups: the falls' spray and the seeps' steam |
| `src/89w-host-water.js` | 8.4 | [draw] | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89z-host-build.js` | 5.2 | [web] | 1 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/99-host-take.js` | 15.6 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 |  |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

(none yet: the split lists and the overrides go here)
