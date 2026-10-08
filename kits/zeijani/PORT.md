# kits/zeijani: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 5 (2%) | 32 (12%) | 10 (4%) | 75 (28%) | 147 (55%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 3.3 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/10-core.js` | 3.6 | [web] | 0 | 0 | 2 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/27-mat.js` | 12.2 | [G shader] | 18 | 0 | 0 | 0 | 0 | 0 | 9 | 0 | 0 | 0 | 0 |  |
| `src/30-geo.js` | 22.9 | [draw] | 46 | 1 | 0 | 0 | 0 | 25 | 0 | 0 | 0 | 0 | 0 |  |
| `src/36-def.js` | 6.0 | [draw] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/37-zj-walk.js` | 4.2 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/40-zj-cave.js` | 19.3 | [G shader] | 10 | 0 | 0 | 0 | 2 | 1 | 6 | 0 | 0 | 0 | 0 | the cave material (per-vertex weights over triplanar library sets) is the .gdshader; the rest is glue (local plans to world through CM; chunk arrays to BufferGeometry: Godot imports the exported meshes) |
| `src/41-zj-block.js` | 3.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | split: the void plan is data (the cavern carves it, core/walk takes its floors); three box() calls draw the lintel |
| `src/42-zj-forms.js` | 9.9 | [draw] | 4 | 0 | 0 | 0 | 0 | 29 | 0 | 0 | 0 | 0 | 0 |  |
| `src/43-zj-wood.js` | 7.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 19 | 0 | 0 | 0 | 0 | 0 |  |
| `src/44-zj-gallery.js` | 3.8 | [draw] | 0 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 | the galleries' fronts and the well's stair; their plans are data in `kits/interiors/sets/zeijani.js` |
| `src/45-zj-estate.js` | 4.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 14 | 0 | 0 | 0 | 0 | 0 |  |
| `src/46-zj-built.js` | 8.9 | [draw] | 0 | 0 | 0 | 0 | 0 | 22 | 0 | 0 | 0 | 0 | 0 |  |
| `src/47-zj-shops.js` | 4.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 7 | 0 | 0 | 0 | 0 | 0 |  |
| `src/48-zj-sacred.js` | 11.8 | [draw] | 4 | 1 | 0 | 0 | 0 | 23 | 0 | 0 | 0 | 0 | 0 |  |
| `src/49-zj-civic.js` | 15.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 45 | 0 | 0 | 0 | 0 | 0 |  |
| `src/50-zj-works.js` | 13.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 26 | 0 | 0 | 0 | 0 | 0 |  |
| `src/51-zj-guard.js` | 12.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 34 | 0 | 0 | 0 | 0 | 0 |  |
| `src/52-zj-trade.js` | 6.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 16 | 0 | 0 | 0 | 0 | 0 |  |
| `src/53-zj-additions.js` | 8.8 | [draw] | 3 | 0 | 0 | 0 | 0 | 16 | 0 | 0 | 0 | 0 | 0 |  |
| `src/54-zj-square.js` | 7.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 13 | 0 | 0 | 0 | 0 | 0 |  |
| `src/81-sky.js` | 9.5 | [G native] | 23 | 4 | 0 | 0 | 0 | 3 | 6 | 0 | 0 | 0 | 0 | shader hook inside |
| `src/89-rows.js` | 1.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/90-scene.js` | 8.4 | [web] | 18 | 0 | 1 | 0 | 2 | 1 | 1 | 0 | 0 | 0 | 0 |  |
| `src/91-probe.js` | 26.7 | [web] | 2 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 2 | 0 | 0 |  |
| `src/91f-furnish.js` | 12.5 | [web] | 4 | 1 | 0 | 0 | 2 | 1 | 6 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/91n-night.js` | 2.6 | [draw] | 6 | 2 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/92-camera.js` | 16.8 | [web] | 16 | 0 | 22 | 15 | 4 | 4 | 0 | 0 | 4 | 0 | 0 |  |
| `src/93-anim.js` | 2.5 | [draw] | 5 | 2 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

- **The underground is `core/terrain/39-core-cavern.js`** ([G data], node-tested): the carved defs' void plans are records;
  the meshes export (Godot draws them; collision is a trimesh of them plus `walk.json`'s blocks). `40-zj-cave.js` holds the
  one shader to port: the rock blend (tuff raw, hewn, plastered, polished; basalt raw and polished; the tubes' lining and
  oxidised breakdown, the rare colours, the crusts) as one `.gdshader`, or StandardMaterial3D `uv1_triplanar` per material.
- 10-core.js's hash is core/rand's (`KRAND.h3`): no sin hashes on the CPU. The shaders' flicker hash (27-mat.js) is GPU-only.
