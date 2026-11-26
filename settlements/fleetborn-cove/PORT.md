# settlements/fleetborn-cove: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 25 (42%) | 0 (0%) | 0 (0%) | 15 (25%) | 20 (33%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/40-fcove-tide-rules.js` | 13.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | macrotidal graving cradles, sill slack gate, |v|^3 paktong rotors, tide-mill head/duty, White Stacks causeway |
| `src/42-fcove-layout.js` | 11.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | Arcoforte cliff-prow frame, 576 m reserve & cirque grading, cradles, port quays, rotors, causeway, fleet berths |
| `src/44zz-fcove-site-patch.js` | 0.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | re-seats site:fleetborn-arcoforte 576 m footprint and positions 5 Type II cliff weeps clear of works |
| `src/46-fcove-stage-bind.js` | 2.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | binds FCOVE_LAYOUT grading, keep-clear, FC raster refresh, and ARCOFORTE_OPTS |
| `src/86-fcove-works-and-fleet.js` | 16.5 | [draw] | 24 | 0 | 0 | 0 | 0 | 12 | 0 | 0 | 0 | 0 | 0 | KTAGS pre-registration, Arcoforte & port d=3 seating, cradles, rotors, tide-mill, causeway, moored 89c-89h fleet |
| `src/89x-fcove-arcoforte-water.js` | 1.8 | [draw] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | Arcoforte Central Park pools, linear canal, and cliff sluice cascade on core/water |
| `src/99-fcove-host-take.js` | 14.5 | [web] | 4 | 0 | 6 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 7 preset views, interactive Tide & Drydock Panel, hostChecks/hostNegatives, KHOST.take |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

Read in place: `biomes/arch` + `stations/cove`, `kits/arcoforte` + `kits/ancients`, `kits/port` (`d = 3`), `kits/ringsea` (`89c..89h`), `core/water/tide` (`KTIDE`), `core/ruins` (`KRUINS`), `core/host`, `core/atmos`, `core/terrain`, `core/biome`. `40-fcove-tide-rules.js`, `42-fcove-layout.js`, and `44zz-fcove-site-patch.js` are pure `[G data]`.
