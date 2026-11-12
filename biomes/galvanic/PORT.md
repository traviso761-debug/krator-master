# biomes/galvanic: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 32 (39%) | 8 (10%) | 2 (2%) | 24 (29%) | 16 (20%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/40-galvanic-cell.js` | 9.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | GALV_PHYS and GALV_SITES: the cell's physics and the site; tests/test-galvanic.js |
| `src/45-host-stage.js` | 12.9 | [web] | 7 | 0 | 3 | 1 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/48-host-therm.js` | 1.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/50-galvanic-species.js` | 5.7 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: the species records and harvest are data; the items and materials draw (BIO.def, BIO.iridBarkMat) |
| `src/60-galvanic-place.js` | 7.8 | [draw] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | placement on KRAND cells (GALV.PLACED is its data); its colours are THREE.Color (GALV.C): data once colours are hex |
| `src/70-galvanic.js` | 0.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/84-host-ground.js` | 7.8 | [G shader] | 5 | 2 | 0 | 0 | 0 | 2 | 6 | 0 | 0 | 0 | 0 |  |
| `src/85-host-far.js` | 4.7 | [web] | 3 | 0 | 0 | 0 | 2 | 0 | 2 | 0 | 0 | 0 | 0 |  |
| `src/87-host-kin.js` | 2.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | grows the Rift's trees by BIO.kin (their builders draw) |
| `src/88-host-place.js` | 1.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | orders the passes; STORE_AT is data |
| `src/89-host-sky.js` | 1.6 | [G native] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89a-host-atmos.js` | 3.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/89w-host-water.js` | 5.6 | [draw] | 4 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89z-host-build.js` | 5.2 | [web] | 1 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/99-host-take.js` | 10.8 | [draw] | 2 | 0 | 0 | 0 | 0 | 2 | 0 | 2 | 0 | 0 | 0 |  |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

(none yet: the split lists and the overrides go here)
