# settlements/isle-demo: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 361 (82%) | 0 (0%) | 0 (0%) | 70 (16%) | 9 (2%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/10-isle-frame.js` | 7.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 | a town's frame and the ground Voth's editor reads, from the world's fields; the box records are data (no THREE) |
| `src/15-isle-tune.js` | 52.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/20-isle-ground.js` | 7.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/30-isle-programme.js` | 15.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/32-isle-city.js` | 49.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/33-isle-spurs.js` | 10.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the streets outside the gates (laid out with the plan, closed until the sim opens them), their lots registered in core/tags; no three.js, no DOM |
| `src/34-isle-census.js` | 11.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/40-isle-sim.js` | 13.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/41-isle-nav.js` | 8.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/42-isle-people.js` | 11.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/43-isle-items.js` | 8.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/44-isle-economy.js` | 7.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/45-isle-sim-checks.js` | 11.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/46-isle-stocks.js` | 2.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/47-isle-trade.js` | 13.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/47b-isle-build.js` | 12.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the isles' empty lots, projects and upkeep (PLAN-POLITICS section 4) on core/simulation's building, their stages for the drawing, books and checks; no three.js, no DOM |
| `src/47c-isle-crime.js` | 10.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | crime on the isles (SIM.crime with the isles' roles), its books and checks; no three.js, no geometry, no DOM |
| `src/47h-isle-hamlets.js` | 33.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/47m-isle-money.js` | 20.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the isles' accounts (money's M0: Kautoan shells, the treasury owning every workplace), their books and checks; no three.js, no DOM |
| `src/47r-isle-refugees.js` | 15.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the weekly refugee ship, the camps (a ration line, their own class), their households housed first; books and checks; no three.js, no DOM |
| `src/47u-isle-unrest.js` | 4.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the isles' unrest (PLAN-MONEY M6: the happiness pool's stages, demands to the polity, strikes, treason), its books and checks; no three.js, no DOM |
| `src/48-isle-week.js` | 23.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/49-isle-govern.js` | 2.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/50-isle-export.js` | 10.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the sim export section (krator-sim: SIM.export and the towns' books, routes); no three.js, no DOM |
| `src/56-isle-tools.js` | 4.8 | [web] | 1 | 0 | 2 | 5 | 0 | 1 | 0 | 0 | 0 | 1 | 1 | the planner's save, towns and views over Voth's tools |
| `src/57-isle-run.js` | 2.4 | [web] | 0 | 0 | 1 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the sim's run loop, its buttons and HUD line (host code; the clock steps SIM) |
| `src/58-isle-protos.js` | 9.4 | [web] | 5 | 0 | 0 | 0 | 2 | 1 | 2 | 3 | 0 | 0 | 0 |  |
| `src/59-isle-citizens.js` | 6.3 | [draw] | 8 | 0 | 0 | 0 | 0 | 2 | 0 | 2 | 0 | 0 | 0 | the citizens near the camera as instanced stand-ins, posed from SIM.pose (the choice and the check read SIM only) |
| `src/60-isle-draw.js` | 29.2 | [web] | 49 | 2 | 1 | 1 | 2 | 15 | 5 | 9 | 0 | 0 | 0 |  |
| `src/61-isle-canoes.js` | 2.9 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the canoe line's vessels at their berths, shown while docked (reads SIM.tradeReport; RINGSEA meshes) |
| `src/62-isle-export-scene.js` | 9.8 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the drawn town's core/export contributor (items, buckets, materials, textures) through core/export's scene reader; redraws the near set over the box at export time, draws nothing new |
| `src/98-isle-city-start.js` | 10.2 | [web] | 0 | 0 | 7 | 8 | 6 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/98-isle-start.js` | 4.5 | [web] | 1 | 4 | 1 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 1 | decode the region, raise the town |

## Notes

(none yet: the split lists and the overrides go here)
