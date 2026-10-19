# settlements/hook: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 41 (41%) | 0 (0%) | 0 (0%) | 52 (53%) | 6 (6%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/75d-hook-world.js` | 5.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/76-hook-ground.js` | 3.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/79-hook-ancient.js` | 6.2 | [draw] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 |  |
| `src/88-hook-programme.js` | 8.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/90a-hook-city.js` | 10.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/90b-hook-city-draw.js` | 14.0 | [web] | 25 | 0 | 0 | 1 | 4 | 6 | 1 | 6 | 0 | 0 | 0 |  |
| `targets/hook/89z-rows.js` | 9.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/hook/91z-views.js` | 3.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/hook-site/94-hook-site-adapter.js` | 11.9 | [web] | 8 | 6 | 0 | 4 | 0 | 1 | 0 | 0 | 2 | 0 | 0 |  |
| `targets/hook-site/96-hook-site-model.js` | 24.0 | [web] | 1 | 2 | 13 | 3 | 0 | 1 | 0 | 0 | 0 | 1 | 1 |  |
| `targets/hook-site/98-hook-site-start.js` | 2.3 | [web] | 1 | 2 | 2 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |  |

## Notes

(none yet: the split lists and the overrides go here)
