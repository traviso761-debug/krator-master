# kits/catalog: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 11 (1%) | 0 (0%) | 10 (1%) | 55 (4%) | 1425 (95%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `inspector.js` | 19.0 | [web] | 11 | 0 | 19 | 6 | 0 | 2 | 0 | 0 | 2 | 0 | 0 |  |
| `krator-asset-engine.js` | 10.8 | [web] | 22 | 3 | 1 | 9 | 4 | 5 | 0 | 0 | 0 | 0 | 0 |  |
| `krator-furniture-core.js` | 61.9 | [draw] | 43 | 3 | 0 | 0 | 0 | 105 | 0 | 0 | 0 | 0 | 0 |  |
| `krator-furniture-kit.js` | 135.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 643 | 0 | 0 | 0 | 0 | 0 |  |
| `krator-furniture-runtime.js` | 8.4 | [draw] | 12 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 |  |
| `krator-furniture-detail.js` | 3.9 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | optional (`bundle(tex=True)`); the detail-map shader is a three.js stand-in for StandardMaterial3D triplanar, one texture per family from `tex/pack.json` |
| `krator-master-buildings-beast-rider.js` | 69.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 508 | 0 | 0 | 0 | 0 | 0 |  |
| `krator-master-buildings-voth.js` | 74.7 | [draw] | 0 | 0 | 0 | 0 | 0 | 573 | 0 | 0 | 0 | 0 | 0 |  |
| `krator-master-furniture-beast-rider.js` | 71.7 | [draw] | 0 | 0 | 0 | 0 | 0 | 322 | 0 | 0 | 0 | 0 | 0 |  |
| `krator-master-furniture-eastabyss.js` | 56.9 | [draw] | 0 | 0 | 0 | 0 | 0 | 277 | 0 | 0 | 0 | 0 | 0 |  |
| `krator-master-furniture-generic-fruit.js` | 56.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 268 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `krator-master-furniture-generic-goods.js` | 90.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 586 | 0 | 0 | 0 | 0 | 0 |  |
| `krator-master-furniture-generic.js` | 4.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 9 | 0 | 0 | 0 | 0 | 0 |  |
| `krator-master-furniture-hykkousoi.js` | 1.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `krator-master-furniture-islander.js` | 4.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 |  |
| `krator-master-furniture-iziz.js` | 13.9 | [draw] | 0 | 0 | 0 | 0 | 0 | 50 | 0 | 0 | 0 | 0 | 0 |  |
| `krator-master-furniture-jobs.js` | 20.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 84 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `krator-master-furniture-lizardmen.js` | 5.8 | [draw] | 0 | 0 | 0 | 0 | 0 | 13 | 0 | 0 | 0 | 0 | 0 |  |
| `krator-master-furniture-nomad.js` | 5.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 16 | 0 | 0 | 0 | 0 | 0 |  |
| `krator-master-furniture-painted.js` | 50.1 | [draw] | 0 | 0 | 0 | 0 | 0 | 268 | 0 | 0 | 0 | 0 | 0 |  |
| `krator-master-furniture-post-apoc.js` | 8.9 | [draw] | 0 | 0 | 0 | 0 | 0 | 23 | 0 | 0 | 0 | 0 | 0 |  |
| `krator-master-furniture-reedlake.js` | 12.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 45 | 0 | 0 | 0 | 0 | 0 |  |
| `krator-master-furniture-republican.js` | 74.3 | [draw] | 0 | 0 | 0 | 0 | 0 | 384 | 0 | 0 | 0 | 0 | 0 |  |
| `krator-master-furniture-rustic.js` | 36.9 | [draw] | 0 | 0 | 0 | 0 | 0 | 188 | 0 | 0 | 0 | 0 | 0 |  |
| `krator-master-furniture-scrap.js` | 97.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 492 | 0 | 0 | 0 | 0 | 0 |  |
| `krator-master-furniture-screamer.js` | 5.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 13 | 0 | 0 | 0 | 0 | 0 |  |
| `krator-master-furniture-scyvoi.js` | 83.1 | [draw] | 0 | 0 | 0 | 0 | 0 | 501 | 0 | 0 | 0 | 0 | 0 |  |
| `krator-master-furniture-voth.js` | 6.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 20 | 0 | 0 | 0 | 0 | 0 |  |
| `krator-master-furniture-xanadu.js` | 6.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 17 | 0 | 0 | 0 | 0 | 0 |  |
| `krator-master-furniture.js` | 275.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 2242 | 0 | 0 | 0 | 0 | 0 |  |
| `krator-master-plants.js` | 91.7 | [draw] | 0 | 0 | 0 | 0 | 0 | 755 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `krator-symbols.js` | 9.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/00-head.html` | 4.1 | [web] | 0 | 0 | 4 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/80-sky-hash.js` | 0.5 | [G native] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/81-sky.js` | 9.5 | [G native] | 23 | 4 | 0 | 0 | 0 | 3 | 6 | 0 | 0 | 0 | 0 | shader hook inside |
| `src/90-sheet.js` | 12.7 | [web] | 3 | 3 | 8 | 2 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/92-hover.js` | 3.3 | [web] | 2 | 0 | 8 | 3 | 0 | 0 | 0 | 0 | 2 | 0 | 0 |  |
| `src/93-polygon.js` | 4.7 | [web] | 6 | 0 | 9 | 9 | 0 | 2 | 0 | 0 | 1 | 0 | 0 |  |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

(none yet: the split lists and the overrides go here)
