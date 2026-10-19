# settlements/isle-demo: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 138 (77%) | 0 (0%) | 0 (0%) | 41 (23%) | 0 (0%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/10-isle-frame.js` | 7.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 | a town's frame and the ground Voth's editor reads, from the world's fields; the box records are data (no THREE) |
| `src/15-isle-tune.js` | 11.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/20-isle-ground.js` | 7.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/30-isle-programme.js` | 15.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/32-isle-city.js` | 46.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/34-isle-census.js` | 11.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/40-isle-sim.js` | 9.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/41-isle-nav.js` | 8.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/42-isle-people.js` | 2.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/43-isle-items.js` | 3.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/44-isle-economy.js` | 4.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/45-isle-sim-checks.js` | 8.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/46-isle-stocks.js` | 2.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/56-isle-tools.js` | 4.8 | [web] | 1 | 0 | 2 | 5 | 0 | 1 | 0 | 0 | 0 | 1 | 1 | the planner's save, towns and views over Voth's tools |
| `src/57-isle-run.js` | 2.4 | [web] | 0 | 0 | 1 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the sim's run loop, its buttons and HUD line (host code; the clock steps SIM) |
| `src/58-isle-protos.js` | 5.7 | [web] | 5 | 0 | 0 | 0 | 2 | 1 | 2 | 3 | 0 | 0 | 0 |  |
| `src/60-isle-draw.js` | 15.2 | [web] | 33 | 0 | 1 | 1 | 2 | 8 | 0 | 8 | 0 | 0 | 0 |  |
| `src/98-isle-city-start.js` | 8.9 | [web] | 0 | 0 | 6 | 7 | 6 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/98-isle-start.js` | 4.5 | [web] | 1 | 4 | 1 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 1 | decode the region, raise the town |

## Notes

(none yet: the split lists and the overrides go here)
