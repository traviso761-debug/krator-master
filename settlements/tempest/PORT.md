# settlements/tempest: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 42 (50%) | 0 (0%) | 0 (0%) | 11 (13%) | 30 (36%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/80t-tp-plan-data.js` | 17.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the House's layout as records in XFORT's shape and its rules (node-tested: tests/test-tempest.js) |
| `src/80u-tp-house.js` | 8.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | draws TEMPEST's plan through the fort's builders (kits/xanadu 80g) and the Qiblai kit's chortens; its plan is 80t |
| `src/80v-tp-interiors.js` | 6.8 | [draw] | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/80w-tp-grounds-data.js` | 6.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | the crest's fields, tracks and pieces (sheet T0) and their rules (node-tested) |
| `src/80x-tp-life-data.js` | 8.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the herds by day and night, the chain of fires, and their rules: plain records |
| `targets/house/89xs-tp-interiors.js` | 0.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `targets/house/89z-rows.js` | 0.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/house/89zs-tp-site.js` | 4.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/house/90p-tp-grounds.js` | 5.1 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the crest's pieces drawn through the kit's helpers (vB, vPst, vnShedRoof) on the drawn ground; its data is src/80w |
| `targets/house/90q-tp-world.js` | 7.0 | [web] | 14 | 0 | 0 | 0 | 2 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `targets/house/90qt-tp-life.js` | 9.9 | [draw] | 14 | 0 | 0 | 0 | 0 | 3 | 0 | 1 | 2 | 0 | 0 | the herds, the fires and mirrors and the brow lookout drawn from TP_LIFE (src/80x holds the data; this only draws it) |
| `targets/house/90r-tp-house.js` | 4.2 | [web] | 2 | 0 | 0 | 0 | 2 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `targets/house/91z-views.js` | 2.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/states/89z-rows.js` | 0.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/states/91u-tp-ruins.js` | 1.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/states/91z-views.js` | 0.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |

## Notes

(none yet: the split lists and the overrides go here)
