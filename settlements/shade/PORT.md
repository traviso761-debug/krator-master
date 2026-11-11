# settlements/shade: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 51 (31%) | 0 (0%) | 0 (0%) | 65 (40%) | 46 (28%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/44-host-layout.js` | 28.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/45-host-stage.js` | 24.6 | [web] | 34 | 5 | 3 | 1 | 0 | 4 | 15 | 0 | 0 | 0 | 0 |  |
| `src/77a-kit-nomad-core.js` | 12.8 | [draw] | 16 | 7 | 0 | 0 | 0 | 8 | 5 | 0 | 0 | 0 | 0 |  |
| `src/77b-kit-nomad-carved.js` | 7.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 9 | 0 | 0 | 0 | 0 | 0 |  |
| `src/77c-kit-nomad-pueblo.js` | 9.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 |  |
| `src/77d-kit-nomad-khan.js` | 6.0 | [draw] | 1 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 |  |
| `src/77e-kit-nomad-camp.js` | 4.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/78b-host-matlib.js` | 1.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/80-host-buildings.js` | 6.9 | [web] | 4 | 0 | 0 | 0 | 2 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/84-host-life.js` | 11.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/86-host-overlay.js` | 2.9 | [draw] | 6 | 2 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/87-host-views.js` | 3.1 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/88-host-build.js` | 0.6 | [web] | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/89-host-sky.js` | 1.8 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the shared sky: ATMOS.skyBiome at the south-east desert's place (core/atmos; replaced sedesert's 82-host-sky.js read in place) |
| `src/89s-shade-trades.js` | 6.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the Voth census table SHADE_TRADES: no three.js, no geometry, no DOM |
| `src/89t-shade-tags.js` | 3.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the page's core/tags records (KTAGS.page) from REG and PLACES |
| `src/91-shade-probe.js` | 28.0 | [web] | 7 | 0 | 0 | 0 | 0 | 4 | 0 | 5 | 0 | 0 | 0 | Shade's window._api fields and checks, handed to core/host's probe (was 91-host-probe.js) |
| `src/99-shade-take.js` | 3.8 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the take: KHOST.take (core/host; replaced 90-host-camera.js) |

## Notes

(none yet: the split lists and the overrides go here)
