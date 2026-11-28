# settlements/fleetborn-cove: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 133 (54%) | 0 (0%) | 0 (0%) | 31 (12%) | 83 (34%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/40-fcove-tide-rules.js` | 18.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | macrotidal graving cradles, sill slack gate, cubic-race paktong rotors, tide-mill head/duty, White Stacks causeway |
| `src/41-fcove-names.js` | 15.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | KRAND-seeded Fleet-born click names, Shore-kin 4-strand creole names, peoples.json skin/hair stops & dive traits |
| `src/42-fcove-layout.js` | 26.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | Arcoforte cliff-prow frame, 576 m reserve, cradles, port quays, 5 Shore-kin village benches, spar chute, 5 fleet berths |
| `src/43-fcove-life-plan.js` | 42.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | tide- & moot-reactive KSCHED citizen cohorts (careening crews, free-divers, byssus gatherers, 5 villages, Moot swell) |
| `src/44zz-fcove-site-patch.js` | 1.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | re-seats site:fleetborn-arcoforte 576 m footprint and positions 5 Type II cliff weeps clear of works and spar chute |
| `src/46-fcove-stage-bind.js` | 3.3 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | binds FCOVE_LAYOUT grading, village/chute keep-clear, FC raster refresh, and ARCOFORTE_OPTS |
| `src/60-fcove-sim.js` | 30.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 92-day coupled SIM + FCOVE_TIDE + KHAMLET 5 Shore-kin villages + KCAMP 5 nomad fleets (Deep-Ward <-> Arcoforte) |
| `src/70-fcove-life.js` | 13.6 | [draw] | 34 | 0 | 0 | 0 | 0 | 19 | 0 | 3 | 0 | 0 | 0 | 5-call articulated InstancedMesh citizen renderer + 12 px hover/click ray-picker |
| `src/86-fcove-works-and-fleet.js` | 44.3 | [draw] | 70 | 0 | 0 | 0 | 0 | 17 | 1 | 0 | 0 | 0 | 0 | KTAGS pre-registration, Arcoforte & port d=3 seating, cradles, spar chute, merged SKK villages, dynamic 5-fleet moorings |
| `src/89x-fcove-arcoforte-water.js` | 2.0 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | Arcoforte Central Park pools, linear canal, and cliff sluice cascade on core/water |
| `src/94-fcove-export.js` | 20.3 | [draw] | 3 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | core/export sceneReader & krator-world contributors (items, buckets, materials, textures, KTIDE water, fixtures, interiors, furniture, sim) |
| `src/99-fcove-host-take.js` | 29.7 | [web] | 1 | 0 | 14 | 1 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 11 preset views, Tide/Fleet/Citizen/Stocks HUD, KHOST.simHolds(SIM), citizen inspect, godot world export, KHOST.take |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

Read in place: `biomes/arch` + `stations/cove`, `kits/arcoforte` + `kits/ancients`, `kits/shore-kin` (`SKK` via `kit_bundle.py`), `kits/port` (`d = 3`), `kits/ringsea` (`89c..89h`), `core/charactermodels` (`peoples.json` slice), `core/sched` (`KSCHED`), `core/city`, `core/hamlet` (`shorekin`), `core/camp` (`fleet`), `core/simulation` (`SIM`), `core/water/tide` (`KTIDE`), `core/ruins` (`KRUINS`), `core/export`, `core/host`, `core/atmos`, `core/terrain`, `core/biome`. `40-fcove-tide-rules.js`, `41-fcove-names.js`, `42-fcove-layout.js`, `43-fcove-life-plan.js`, `44zz-fcove-site-patch.js`, and `60-fcove-sim.js` are pure `[G data]`.
