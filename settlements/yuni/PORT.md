# settlements/yuni: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 105 (10%) | 13 (1%) | 16 (2%) | 140 (14%) | 748 (73%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 5.9 | [web] | 0 | 0 | 4 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/05-palette.js` | 8.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/10-core.js` | 16.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/20-stage.js` | 12.8 | [web] | 21 | 6 | 1 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/21-sky.js` | 55.0 | [web] | 64 | 0 | 19 | 6 | 0 | 9 | 25 | 0 | 0 | 0 | 0 |  |
| `src/30-layout.js` | 33.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/40-ground.js` | 10.3 | [draw] | 0 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | canvas painters: TEX.def or bake |
| `src/45-kit.js` | 27.7 | [draw] | 40 | 0 | 0 | 0 | 0 | 15 | 15 | 2 | 0 | 0 | 0 |  |
| `src/47-texture.js` | 10.9 | [draw] | 3 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | canvas painters: TEX.def or bake |
| `src/50-structure.js` | 15.2 | [draw] | 8 | 0 | 0 | 0 | 0 | 14 | 0 | 0 | 0 | 0 | 0 |  |
| `src/51-fixtures.js` | 10.5 | [web] | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/52-vault.js` | 14.7 | [draw] | 0 | 0 | 0 | 0 | 0 | 19 | 0 | 0 | 0 | 0 | 0 |  |
| `src/53-assets.js` | 20.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 53 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/54-under.js` | 7.3 | [draw] | 0 | 0 | 0 | 0 | 0 | 8 | 2 | 0 | 0 | 0 | 0 |  |
| `src/55-mid-example.js` | 3.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 14 | 0 | 0 | 0 | 0 | 0 |  |
| `src/56-mid.js` | 63.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 298 | 0 | 0 | 0 | 0 | 0 |  |
| `src/57-poor.js` | 28.9 | [draw] | 0 | 0 | 0 | 0 | 0 | 153 | 0 | 0 | 0 | 0 | 0 |  |
| `src/58-rich.js` | 47.8 | [draw] | 0 | 0 | 0 | 0 | 0 | 212 | 0 | 0 | 0 | 0 | 0 |  |
| `src/59-civic.js` | 84.3 | [draw] | 0 | 0 | 0 | 0 | 0 | 448 | 0 | 0 | 0 | 0 | 0 |  |
| `src/60-flora.js` | 5.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/61a-ancients-kit.js` | 206.9 | [draw] | 244 | 17 | 0 | 0 | 0 | 179 | 10 | 11 | 0 | 0 | 0 |  |
| `src/61b-ancients-kit-tail.js` | 23.5 | [draw] | 14 | 1 | 0 | 0 | 0 | 9 | 0 | 0 | 0 | 0 | 0 |  |
| `src/61c-ancients-glue.js` | 12.8 | [G shader] | 21 | 0 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 | 0 |  |
| `src/61d-ancients-assets.js` | 13.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 36 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/61e-ancients-furniture.js` | 20.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 140 | 0 | 0 | 0 | 0 | 0 |  |
| `src/62-plants.js` | 4.7 | [draw] | 0 | 0 | 0 | 0 | 0 | 24 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/63-furniture.js` | 9.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 61 | 0 | 0 | 0 | 0 | 0 |  |
| `src/64-interiors.js` | 77.2 | [draw] | 2 | 0 | 0 | 0 | 0 | 77 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/65-summit.js` | 1.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/66-canal.js` | 7.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 20 | 0 | 0 | 0 | 0 | 0 |  |
| `src/68-place.js` | 39.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/70-sheet.js` | 3.0 | [draw] | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | canvas painters: TEX.def or bake |
| `src/71-catalog.js` | 3.6 | [draw] | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/72-lights.js` | 5.1 | [G native] | 0 | 0 | 0 | 0 | 0 | 7 | 0 | 0 | 0 | 0 | 0 |  |
| `src/75-terrain.js` | 16.1 | [draw] | 32 | 1 | 0 | 0 | 0 | 5 | 5 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/76-doors.js` | 25.8 | [web] | 15 | 0 | 5 | 1 | 0 | 1 | 6 | 2 | 0 | 0 | 0 | split: data inside host code |
| `src/80-camera.js` | 13.3 | [web] | 7 | 0 | 9 | 16 | 1 | 2 | 0 | 1 | 2 | 0 | 0 |  |
| `src/81-glow.js` | 4.7 | [G native] | 12 | 2 | 0 | 0 | 0 | 2 | 3 | 2 | 0 | 0 | 0 | shader hook inside |
| `src/82-daynight.js` | 6.2 | [G native] | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/84-life.js` | 29.0 | [draw] | 9 | 0 | 0 | 0 | 0 | 4 | 0 | 1 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/85-probe.js` | 1.2 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/86-inspect.js` | 3.9 | [web] | 0 | 0 | 7 | 2 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/87-pathviz.js` | 4.0 | [web] | 5 | 0 | 4 | 1 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/88-underview.js` | 3.2 | [web] | 3 | 0 | 2 | 1 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89-sheetui.js` | 4.1 | [web] | 1 | 0 | 10 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/98-start.js` | 0.3 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/99-tail.html` | 0.1 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

(none yet: the split lists and the overrides go here)
