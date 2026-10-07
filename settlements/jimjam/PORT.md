# settlements/jimjam: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 7 (2%) | 23 (5%) | 10 (2%) | 34 (8%) | 355 (83%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 2.6 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/10-core.js` | 3.0 | [web] | 0 | 0 | 2 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/12-stats.js` | 1.2 | [web] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 1 | 0 | 0 | 0 |  |
| `src/30-kit.js` | 3.0 | [draw] | 9 | 0 | 0 | 0 | 0 | 2 | 2 | 5 | 0 | 0 | 0 |  |
| `src/32-surfaces.js` | 7.7 | [draw] | 16 | 0 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 | 0 |  |
| `src/34-kitdefs.js` | 9.0 | [draw] | 24 | 2 | 0 | 0 | 0 | 27 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/36-decor.js` | 13.2 | [draw] | 12 | 0 | 0 | 0 | 0 | 3 | 0 | 1 | 0 | 0 | 0 |  |
| `src/37-sockets.js` | 2.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/38-helpers2.js` | 7.8 | [draw] | 14 | 0 | 0 | 0 | 0 | 9 | 0 | 0 | 0 | 0 | 0 |  |
| `src/50-registry.js` | 0.6 | [draw] | 3 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/54-mat-concrete.js` | 4.2 | [draw] | 8 | 2 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/60-jj-mat.js` | 18.9 | [G shader] | 23 | 2 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 | 0 |  |
| `src/61-jj-helpers.js` | 24.1 | [draw] | 23 | 0 | 0 | 0 | 0 | 13 | 0 | 0 | 0 | 0 | 0 |  |
| `src/62-jj-culture.js` | 14.5 | [draw] | 8 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 |  |
| `src/63-jj-zfix.js` | 7.4 | [web] | 0 | 0 | 0 | 0 | 2 | 1 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/70-jj-housing.js` | 56.1 | [draw] | 12 | 0 | 0 | 0 | 0 | 9 | 0 | 0 | 0 | 0 | 0 |  |
| `src/71-jj-shops.js` | 42.3 | [draw] | 12 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/72-jj-hospitality.js` | 29.5 | [draw] | 8 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/73-jj-civic.js` | 23.8 | [draw] | 5 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/74-jj-sacred.js` | 18.2 | [draw] | 11 | 0 | 0 | 0 | 0 | 7 | 0 | 0 | 0 | 0 | 0 |  |
| `src/75-jj-palace.js` | 22.0 | [draw] | 6 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 |  |
| `src/76-jj-military.js` | 31.3 | [draw] | 11 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 |  |
| `src/77-jj-agri.js` | 25.7 | [draw] | 11 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 |  |
| `src/80-cultures.js` | 15.3 | [draw] | 2 | 1 | 0 | 0 | 0 | 13 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/81-sky.js` | 9.5 | [G native] | 23 | 4 | 0 | 0 | 0 | 3 | 6 | 0 | 0 | 0 | 0 | shader hook inside |
| `src/84-jj-furniture.js` | 5.2 | [draw] | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/85-jj-flora-placeholder.js` | 1.7 | [draw] | 3 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/90-scene.js` | 3.9 | [web] | 9 | 0 | 1 | 0 | 0 | 2 | 1 | 0 | 0 | 0 | 0 |  |
| `src/91-probe.js` | 6.2 | [web] | 4 | 0 | 0 | 0 | 0 | 0 | 1 | 2 | 2 | 0 | 0 |  |
| `src/92-camera.js` | 9.9 | [web] | 12 | 0 | 20 | 14 | 4 | 2 | 0 | 1 | 3 | 0 | 0 |  |
| `src/93-labels.js` | 4.0 | [G shader] | 6 | 2 | 0 | 0 | 0 | 1 | 3 | 0 | 0 | 0 | 0 |  |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `targets/kit/89z-rows.js` | 2.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/kit/91z-views.js` | 2.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |

## Notes

(none yet: the split lists and the overrides go here)
