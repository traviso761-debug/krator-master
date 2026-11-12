# biomes/arch: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 27 (20%) | 14 (10%) | 1 (1%) | 38 (27%) | 58 (42%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/40-biome-arch-chem.js` | 9.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/41-biome-arch-sites.js` | 7.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/42-biome-arch-meeting.js` | 3.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/45-host-stage.js` | 23.8 | [web] | 7 | 0 | 3 | 1 | 0 | 14 | 0 | 0 | 0 | 0 | 0 |  |
| `src/48-host-therm.js` | 2.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/50-biome-arch-species.js` | 16.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | split: the species records are data; the items and materials draw (BIO.def, BIO.alphaTex, the curtain's BufferGeometry) |
| `src/60-biome-arch-place.js` | 13.9 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | placement on KRAND cells and on ARCH (40) for every plant; its colours are THREE.Color (ARCHB.C): data once colours are hex |
| `src/70-biome-arch.js` | 0.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/84-host-ground.js` | 14.2 | [G shader] | 5 | 2 | 0 | 0 | 0 | 2 | 5 | 0 | 0 | 0 | 0 |  |
| `src/85-host-far.js` | 4.8 | [web] | 3 | 0 | 0 | 0 | 2 | 0 | 2 | 0 | 0 | 0 | 0 |  |
| `src/88-host-place.js` | 1.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | orders the passes (ARCHB.buildArch, curtains, combs) |
| `src/89-host-sky.js` | 1.5 | [G native] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89a-host-atmos.js` | 3.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/89b-host-steam.js` | 3.1 | [web] | 4 | 0 | 0 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89w-host-water.js` | 8.5 | [draw] | 9 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89z-host-build.js` | 5.1 | [web] | 1 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/99-host-take.js` | 17.8 | [draw] | 1 | 0 | 0 | 0 | 0 | 4 | 0 | 2 | 0 | 0 | 0 |  |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

(none yet: the split lists and the overrides go here)
