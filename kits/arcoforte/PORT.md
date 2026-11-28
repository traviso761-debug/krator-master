# kits/arcoforte: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 123 (56%) | 0 (0%) | 0 (0%) | 13 (6%) | 83 (38%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 0.8 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/30-af-plan.js` | 44.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | unified Arcoforte layout, terrain/bathymetry section, water records, walk graph |
| `src/31-af-interiors.js` | 71.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | living, work, and rec room plates, hall recipes, area/capacity census, sim places |
| `src/32-af-rules.js` | 8.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | layout and interior invariants, each with a broken-input negative |
| `src/45-host-stage.js` | 19.5 | [draw] | 44 | 0 | 1 | 0 | 0 | 9 | 2 | 0 | 0 | 0 | 0 | renderer, coastal strata terrain mesh (KDRAWN), refurbished glazing and concrete materials |
| `src/60-af-draw-base.js` | 16.6 | [draw] | 14 | 0 | 0 | 0 | 0 | 34 | 0 | 0 | 0 | 0 | 0 | KTAGS registration; harbour lift platform, marina, sub-cliff works, park, amphitheatre, linear city |
| `src/62-af-draw-ring.js` | 8.9 | [draw] | 0 | 0 | 0 | 0 | 0 | 9 | 0 | 0 | 0 | 0 | 0 | 9 battered neocliff dwelling bastions, vaulted city center, 13 skylight oculi, promenade belvederes |
| `src/64-af-draw-crown.js` | 13.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 22 | 0 | 0 | 0 | 0 | 0 | fluted domed rotunda, 7 H-plan cliff skyscrapers, cantilevered trays, 300 m sky-crown & heliport |
| `src/75-af-interiors-host.js` | 19.5 | [draw] | 21 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | KFURN camera-independent records, KDOOR leaves, on-demand cutaway drawer, live culture socket |
| `src/89z-host-water-sky.js` | 4.8 | [draw] | 5 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | ATMOS.skyBiome, bindHost, skylight, core/water sea/stream/pools/fall, KRUINS watch |
| `src/99-host-take.js` | 11.9 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | views, cutaway units, state & culture controls, hostChecks/hostNegatives, KHOST.take |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

Read in place: `kits/ancients` runtime (`kits/ancients/PORT.md`), `core/rand`, `core/drawn`, `core/space`, `core/terrain`, `core/tags`, `core/furnish`, `core/door`, `core/walk`, `core/ruins`, `core/atmos`, `core/water`, `core/lod`, `core/host`. `30-af-plan.js`, `31-af-interiors.js`, and `32-af-rules.js` are pure `[G data]` and run directly in Node (`tests/test-arcoforte.js`) and Godot.
