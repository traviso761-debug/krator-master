# settlements/pinnacle-rock: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 86 (48%) | 0 (0%) | 0 (0%) | 23 (13%) | 71 (40%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/40-pr-layout.js` | 17.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the settled plan as records and pure queries (PR) |
| `src/42-pr-world.js` | 0.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/43-pr-roosts.js` | 41.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the roosts as records (PRR.plan on KSTACKS bodies): decks, Girder-shaped stalls and bridges, climbs, lifts, the Stair |
| `src/45-host-stage.js` | 9.6 | [web] | 7 | 0 | 3 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/47b-host-roosts-plan.js` | 2.9 | [web] | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | runs PRR's plan (43) before the kits build, adds its ways to PR, cuts the lift road's bench into LAND.talus and re-seats the floor mesh there |
| `src/54-pr-town.js` | 26.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the town on the top as records (PRT.plan: one core/city instance, steps 0-5 from the layout, the module's builder 6-12; the trades it carries) |
| `src/54b-host-town-plan.js` | 0.8 | [web] | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | runs PRT's plan (54) on this page's rock and roost plan with the Beast Riders' sizes (CAT.dims); core/city registers every lot in core/tags |
| `src/86-pr-far.js` | 3.2 | [draw] | 3 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | the far land: one ring mesh from WORLD.H (the scale model) |
| `src/87-pr-talus.js` | 1.7 | [draw] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | the debris slope's fallen blocks: one biome item placed per 6 m cell (KRAND); the slope's height is LAND.talus (45) |
| `src/88-host-build.js` | 2.1 | [web] | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/89-host-roosts.js` | 25.4 | [draw] | 10 | 0 | 0 | 0 | 0 | 4 | 0 | 1 | 0 | 0 | 0 | draws PRR's records (merged meshes by material, the Beast Riders kit's maps) and registers them; the lifts' cages move on a tick |
| `src/89c-host-town.js` | 5.9 | [draw] | 13 | 0 | 0 | 0 | 2 | 2 | 0 | 2 | 0 | 0 | 0 | draws TOWN's records: the streets as ribbons, the squares paved, each building built once (CAT.proto, isleProto) and instanced |
| `src/99-host-take.js` | 40.4 | [draw] | 7 | 0 | 0 | 0 | 0 | 13 | 0 | 2 | 4 | 0 | 0 |  |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

(none yet: the split lists and the overrides go here)
