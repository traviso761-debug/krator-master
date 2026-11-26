# kits/metropolis: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 250 (43%) | 4 (1%) | 0 (0%) | 46 (8%) | 286 (49%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.3 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/40-mp-records.js` | 20.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/41-mp-plans.js` | 36.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/42-mp-facade.js` | 4.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/43-mp-shell.js` | 6.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/44-mp-audit.js` | 4.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/44b-mp-sockets.js` | 23.8 | [draw] | 0 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/45-host-stage.js` | 1.5 | [web] | 6 | 0 | 3 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/46-mp-designs.js` | 4.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/46b-mp-ancients.js` | 8.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/46c-mp-planned.js` | 56.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/46d-mp-gridplan.js` | 67.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/46e-mp-industry.js` | 10.2 | [draw] | 4 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/46f-mp-farm.js` | 17.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/46f-mp-yards.js` | 15.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/47-host-land.js` | 1.6 | [draw] | 2 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/50-mp-kit.js` | 12.0 | [draw] | 18 | 0 | 0 | 0 | 0 | 7 | 3 | 1 | 0 | 0 | 0 |  |
| `src/52-mp-hero-spindle.js` | 13.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 42 | 0 | 0 | 0 | 0 | 0 |  |
| `src/53-mp-hero-ledger.js` | 14.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 28 | 0 | 0 | 0 | 0 | 0 |  |
| `src/54-mp-hero-designs.js` | 38.7 | [draw] | 0 | 0 | 0 | 0 | 0 | 71 | 0 | 0 | 0 | 0 | 0 |  |
| `src/54f-mp-hero-farm.js` | 28.3 | [draw] | 0 | 0 | 0 | 0 | 0 | 36 | 0 | 0 | 0 | 0 | 0 |  |
| `src/55-mp-hero-ancients.js` | 24.0 | [draw] | 15 | 0 | 0 | 0 | 0 | 6 | 0 | 8 | 4 | 0 | 0 |  |
| `src/56-mp-interiors.js` | 22.2 | [draw] | 10 | 0 | 0 | 0 | 5 | 18 | 0 | 3 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/57-mp-debris.js` | 5.8 | [draw] | 12 | 0 | 0 | 0 | 0 | 6 | 0 | 1 | 0 | 0 | 0 |  |
| `src/57y-mp-yards-draw.js` | 12.8 | [draw] | 9 | 0 | 0 | 0 | 0 | 42 | 0 | 0 | 0 | 0 | 0 |  |
| `src/58-mp-cutaway.js` | 3.8 | [G shader] | 3 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 2 | 0 | 0 |  |
| `src/59-mp-floors.js` | 17.6 | [draw] | 6 | 0 | 0 | 0 | 0 | 8 | 0 | 2 | 0 | 0 | 0 |  |
| `src/59b-mp-ruin-design.js` | 12.8 | [draw] | 11 | 0 | 0 | 0 | 0 | 4 | 0 | 2 | 0 | 0 | 0 |  |
| `src/59d-mp-flora.js` | 3.6 | [draw] | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/59e-mp-overgrow.js` | 20.6 | [draw] | 6 | 0 | 0 | 0 | 0 | 12 | 0 | 1 | 0 | 0 | 0 |  |
| `src/60-mp-shell-host.js` | 24.1 | [draw] | 14 | 0 | 0 | 0 | 0 | 1 | 15 | 4 | 0 | 0 | 0 |  |
| `src/70-mp-stage.js` | 25.3 | [web] | 9 | 0 | 0 | 0 | 5 | 2 | 1 | 6 | 0 | 0 | 0 |  |
| `src/70f-mp-stage-farm.js` | 17.4 | [web] | 7 | 0 | 0 | 0 | 2 | 1 | 0 | 4 | 0 | 0 | 0 |  |
| `src/89-host-sky.js` | 0.4 | [G native] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/99-host-take.js` | 6.6 | [G data] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

(none yet: the split lists and the overrides go here)
