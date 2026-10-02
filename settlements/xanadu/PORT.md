# settlements/xanadu: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 437 (49%) | 19 (2%) | 10 (1%) | 56 (6%) | 365 (41%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 3.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/10-core.js` | 2.5 | [web] | 0 | 0 | 2 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/12-stats.js` | 1.2 | [web] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 1 | 0 | 0 | 0 |  |
| `src/30-kit.js` | 3.0 | [draw] | 9 | 0 | 0 | 0 | 0 | 2 | 2 | 5 | 0 | 0 | 0 |  |
| `src/32-surfaces.js` | 6.7 | [draw] | 15 | 0 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 | 0 |  |
| `src/34-kitdefs.js` | 6.8 | [draw] | 23 | 1 | 0 | 0 | 0 | 26 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/36-decor.js` | 13.1 | [draw] | 12 | 0 | 0 | 0 | 0 | 3 | 0 | 1 | 0 | 0 | 0 |  |
| `src/38-helpers2.js` | 2.7 | [draw] | 6 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 |  |
| `src/50-registry.js` | 0.6 | [draw] | 3 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/54-mat-concrete.js` | 4.2 | [draw] | 8 | 2 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/69-mat-salvage.js` | 12.1 | [draw] | 31 | 5 | 0 | 0 | 0 | 14 | 0 | 1 | 0 | 0 | 0 |  |
| `src/69b-vern-mat.js` | 14.0 | [draw] | 27 | 8 | 0 | 0 | 0 | 25 | 0 | 0 | 0 | 0 | 0 |  |
| `src/69c-vern-helpers.js` | 22.0 | [draw] | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/70-xa-tex.js` | 10.1 | [draw] | 0 | 13 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | canvas painters: TEX.def or bake |
| `src/71-xa-mat.js` | 9.8 | [draw] | 16 | 0 | 0 | 0 | 0 | 30 | 0 | 0 | 0 | 0 | 0 |  |
| `src/72-xa-helpers.js` | 32.2 | [draw] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/74-xa-dwell.js` | 25.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/75-xa-trade.js` | 8.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/76-xa-farm.js` | 14.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/77-xa-sacred.js` | 11.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/78-xa-palace.js` | 11.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/79-xa-guild.js` | 17.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/80-xa-military.js` | 15.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/81-sky.js` | 9.5 | [G native] | 23 | 4 | 0 | 0 | 0 | 3 | 6 | 0 | 0 | 0 | 0 | shader hook inside |
| `src/81-xa-public.js` | 11.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/82-xa-hill.js` | 2.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/83-xa-turk.js` | 23.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/84-xa-grandbath.js` | 10.1 | [draw] | 2 | 2 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/85-xa-water.js` | 11.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/85b-xa-garden.js` | 20.2 | [draw] | 0 | 6 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | canvas painters: TEX.def or bake |
| `src/86-bio-10-core-head.js` | 5.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/86-bio-20-core-kit.js` | 17.0 | [draw] | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 5 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/86-bio-30-core-foliage.js` | 13.3 | [G shader] | 0 | 3 | 0 | 0 | 0 | 5 | 10 | 0 | 0 | 0 | 0 |  |
| `src/86-bio-40-core-place.js` | 6.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/86-bio-45-init.js` | 1.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/86-bio-50-biome-xanadu-species.js` | 52.4 | [draw] | 0 | 4 | 0 | 0 | 0 | 16 | 5 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/86-bio-55-biome-xanadu-trees.js` | 66.0 | [draw] | 0 | 1 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 | 0 |  |
| `src/86-bio-60-biome-xanadu-floor.js` | 19.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 |  |
| `src/86-bio-65-biome-xanadu-dress.js` | 5.4 | [draw] | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/86-bio-70-biome-xanadu.js` | 0.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/86-xa-vizier.js` | 8.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/86b-xa-plants.js` | 1.8 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/87-xa-spicer.js` | 9.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/87b-xa-andean.js` | 12.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/87c-xa-erewhon.js` | 19.2 | [draw] | 5 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/88-xa-dress.js` | 11.8 | [draw] | 4 | 6 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | canvas painters: TEX.def or bake |
| `src/90-scene.js` | 6.8 | [web] | 14 | 1 | 1 | 0 | 0 | 3 | 3 | 0 | 0 | 0 | 0 |  |
| `src/91-probe.js` | 2.9 | [web] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 |  |
| `src/92-camera.js` | 9.8 | [web] | 12 | 0 | 20 | 14 | 4 | 2 | 0 | 1 | 3 | 0 | 0 |  |
| `src/93-labels.js` | 6.2 | [G shader] | 7 | 2 | 0 | 0 | 0 | 1 | 3 | 0 | 0 | 0 | 0 |  |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `targets/erewhon/83-er-data.js` | 208.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `targets/erewhon/84-er-geo.js` | 5.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/erewhon/85-er-paint.js` | 4.4 | [draw] | 0 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | canvas painters: TEX.def or bake |
| `targets/erewhon/86-bio-46-er-init.js` | 1.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/erewhon/87-er-layout.js` | 15.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `targets/erewhon/88-er-place.js` | 4.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `targets/erewhon/89z-rows.js` | 0.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/erewhon/90a-er-world.js` | 5.9 | [web] | 7 | 1 | 0 | 0 | 2 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `targets/erewhon/90b-er-build.js` | 20.6 | [web] | 7 | 0 | 0 | 0 | 2 | 3 | 0 | 0 | 0 | 0 | 0 |  |
| `targets/erewhon/91z-views.js` | 2.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/erewhon/93-er-ui.js` | 2.8 | [web] | 2 | 2 | 2 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `targets/xanadu/89z-rows.js` | 0.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/xanadu/91z-views.js` | 0.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |

## Notes

(none yet: the split lists and the overrides go here)
