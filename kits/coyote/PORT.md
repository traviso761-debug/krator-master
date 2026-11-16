# kits/coyote: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 15 (16%) | 0 (0%) | 0 (0%) | 5 (5%) | 75 (79%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/26k-kit.js` | 3.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/32-cy-contour.js` | 4.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/34-cy-rows.js` | 4.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/40-cy-kit.js` | 14.9 | [draw] | 9 | 0 | 0 | 0 | 0 | 26 | 0 | 0 | 0 | 0 | 0 |  |
| `src/50-cy-valley.js` | 12.0 | [draw] | 1 | 0 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 | 0 |  |
| `src/52-cy-works.js` | 10.2 | [draw] | 10 | 0 | 0 | 0 | 0 | 26 | 0 | 0 | 0 | 0 | 0 |  |
| `src/54-cy-peak.js` | 15.0 | [draw] | 2 | 0 | 0 | 0 | 0 | 21 | 0 | 0 | 0 | 0 | 0 |  |
| `src/56-cy-village.js` | 4.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/58-cy-herders.js` | 14.3 | [draw] | 13 | 0 | 0 | 0 | 0 | 22 | 0 | 0 | 0 | 0 | 0 |  |
| `src/60-cy-stones.js` | 4.6 | [draw] | 1 | 0 | 0 | 0 | 0 | 9 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89-rows.js` | 2.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/99-host-tz-cy.js` | 3.7 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the probe's fields for verify.py (window._api): host code |

## Notes

(none yet: the split lists and the overrides go here)
