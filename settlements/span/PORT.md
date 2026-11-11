# settlements/span: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 74 (69%) | 0 (0%) | 0 (0%) | 15 (14%) | 19 (17%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 0.8 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/30-span-layout.js` | 48.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the layout: every part, way, link and cut by id (the one source) |
| `src/31-span-rules.js` | 25.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/45-host-stage.js` | 7.4 | [web] | 12 | 0 | 1 | 0 | 0 | 1 | 4 | 0 | 0 | 0 | 0 |  |
| `src/69f-host-dalab.js` | 0.6 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the Dalab set's garden trees and plants: none on this page yet |
| `src/89z-host-sky.js` | 0.8 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8at-host-place.js` | 18.5 | [draw] | 11 | 0 | 0 | 0 | 2 | 19 | 0 | 0 | 0 | 0 | 0 | the layout's parts to the builders: no position decided here (the layout's) |
| `src/99-host-take.js` | 5.9 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

Read in place, not tagged here: the Ancients kit's runtime and Span's pieces (`kits/ancients/PORT.md`), the Dalab set (`settlements/dalab/PORT.md`), core/rand, core/space, core/tags, core/atmos, core/host. The pieces cross to Godot as meshes ([draw]); the layout and its rules ([G data]) port as they are, with `SPAN.groundAt` the section the station carves.
