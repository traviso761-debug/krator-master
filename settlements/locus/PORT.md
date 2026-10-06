# settlements/locus: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 94 (10%) | 0 (0%) | 16 (2%) | 161 (17%) | 678 (71%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 6.0 | [web] | 0 | 0 | 4 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/05-palette.js` | 13.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/10-core.js` | 16.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/20-stage.js` | 14.0 | [web] | 22 | 8 | 1 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/21-sky.js` | 56.4 | [web] | 67 | 0 | 19 | 6 | 0 | 9 | 26 | 0 | 0 | 0 | 0 |  |
| `src/30-layout.js` | 40.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/40-ground.js` | 7.4 | [draw] | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | canvas painters: TEX.def or bake |
| `src/45-kit.js` | 26.7 | [draw] | 40 | 0 | 0 | 0 | 0 | 13 | 15 | 2 | 0 | 0 | 0 |  |
| `src/47-texture.js` | 17.0 | [draw] | 4 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/50-structure.js` | 9.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 11 | 0 | 0 | 0 | 0 | 0 |  |
| `src/53-assets.js` | 17.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 53 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/55-mid-example.js` | 3.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 14 | 0 | 0 | 0 | 0 | 0 |  |
| `src/56-mid.js` | 63.3 | [draw] | 0 | 0 | 0 | 0 | 0 | 297 | 0 | 0 | 0 | 0 | 0 |  |
| `src/57-poor.js` | 25.8 | [draw] | 0 | 0 | 0 | 0 | 0 | 139 | 0 | 0 | 0 | 0 | 0 |  |
| `src/58-rich.js` | 47.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 212 | 0 | 0 | 0 | 0 | 0 |  |
| `src/59-civic.js` | 84.3 | [draw] | 0 | 0 | 0 | 0 | 0 | 449 | 0 | 0 | 0 | 0 | 0 |  |
| `src/60-flora.js` | 1.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/62-plants.js` | 4.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 24 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/63-furniture.js` | 9.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 61 | 0 | 0 | 0 | 0 | 0 |  |
| `src/64-locus-chapterhouse.js` | 13.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 58 | 0 | 0 | 0 | 0 | 0 |  |
| `src/64-locus-core.js` | 16.1 | [draw] | 0 | 0 | 0 | 0 | 0 | 68 | 0 | 0 | 0 | 0 | 0 |  |
| `src/64-locus-dwellings.js` | 19.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 56 | 0 | 0 | 0 | 0 | 0 |  |
| `src/64-locus-farm.js` | 10.3 | [draw] | 0 | 0 | 0 | 0 | 0 | 39 | 0 | 0 | 0 | 0 | 0 |  |
| `src/64-locus-infra.js` | 8.3 | [draw] | 0 | 0 | 0 | 0 | 0 | 17 | 0 | 0 | 0 | 0 | 0 |  |
| `src/64-locus-petroleum.js` | 22.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 86 | 0 | 0 | 0 | 0 | 0 |  |
| `src/64-locus-plants.js` | 3.8 | [draw] | 0 | 0 | 0 | 0 | 0 | 15 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/64-locus-power.js` | 17.7 | [draw] | 0 | 0 | 0 | 0 | 0 | 95 | 0 | 0 | 0 | 0 | 0 |  |
| `src/65-abyss-00-core.js` | 42.1 | [draw] | 0 | 0 | 0 | 0 | 0 | 103 | 0 | 0 | 0 | 0 | 0 |  |
| `src/65-abyss-20-plants.js` | 2.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 7 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/65-abyss-30-housing.js` | 21.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 64 | 0 | 0 | 0 | 0 | 0 |  |
| `src/65-abyss-40-shops.js` | 31.3 | [draw] | 0 | 0 | 0 | 0 | 0 | 63 | 0 | 0 | 0 | 0 | 0 |  |
| `src/65-abyss-50-civic.js` | 21.9 | [draw] | 0 | 0 | 0 | 0 | 0 | 41 | 0 | 0 | 0 | 0 | 0 |  |
| `src/65-abyss-60-temple.js` | 7.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 15 | 0 | 0 | 0 | 0 | 0 |  |
| `src/65-abyss-70-palace.js` | 8.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 14 | 0 | 0 | 0 | 0 | 0 |  |
| `src/65-abyss-75-verge.js` | 22.1 | [draw] | 0 | 0 | 0 | 0 | 0 | 95 | 0 | 0 | 0 | 0 | 0 |  |
| `src/65-abyss-80-military.js` | 13.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 32 | 0 | 0 | 0 | 0 | 0 |  |
| `src/65-abyss-90-farm.js` | 12.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 36 | 0 | 0 | 0 | 0 | 0 |  |
| `src/66-locus-furnish.js` | 8.0 | [draw] | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | the draw adapter onto core/furnish (2026-10-05): the placement pass is core/furnish/50-core-furnish.js. Kept here: the seed rule (frame seed and spot), the frame stack round every ASSET build, the open rooms deferred to the interiors, the interior-set item per variant, night lamps, inspector entries, the linear colours at the flush |
| `src/68-place.js` | 17.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/68c-locus-crossings.js` | 10.1 | [draw] | 0 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 |  |
| `src/69b-locus-biohost.js` | 3.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/69z-locus-flora.js` | 5.0 | [web] | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/70-sheet.js` | 3.7 | [draw] | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | canvas painters: TEX.def or bake |
| `src/71-catalog.js` | 3.6 | [draw] | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/71g-locus-grid.js` | 9.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 |  |
| `src/72-lights.js` | 5.1 | [G native] | 0 | 0 | 0 | 0 | 0 | 7 | 0 | 0 | 0 | 0 | 0 |  |
| `src/75-terrain.js` | 13.3 | [draw] | 23 | 1 | 0 | 0 | 0 | 3 | 6 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/76-locus-anim.js` | 8.7 | [draw] | 4 | 0 | 0 | 0 | 0 | 0 | 1 | 3 | 0 | 0 | 0 |  |
| `src/80-camera.js` | 12.7 | [web] | 7 | 0 | 10 | 16 | 1 | 2 | 0 | 1 | 2 | 0 | 0 |  |
| `src/81-glow.js` | 4.7 | [G native] | 12 | 2 | 0 | 0 | 0 | 2 | 3 | 2 | 0 | 0 | 0 | shader hook inside |
| `src/82-daynight.js` | 6.2 | [G native] | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/83-locus-fauna.js` | 12.4 | [draw] | 8 | 0 | 0 | 0 | 0 | 18 | 0 | 1 | 0 | 0 | 0 |  |
| `src/84-life.js` | 50.8 | [web] | 13 | 0 | 0 | 0 | 2 | 15 | 0 | 1 | 0 | 0 | 0 | split: data inside host code |
| `src/85-probe.js` | 1.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/86-inspect.js` | 3.9 | [web] | 0 | 0 | 7 | 2 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/87-pathviz.js` | 4.0 | [web] | 5 | 0 | 4 | 1 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/88b-locus-minimap.js` | 3.2 | [web] | 0 | 0 | 4 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/89-sheetui.js` | 4.1 | [web] | 1 | 0 | 10 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/90-atmos-host.js` | 1.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/98-start.js` | 0.3 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/99-tail.html` | 0.1 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

(none yet: the split lists and the overrides go here)
