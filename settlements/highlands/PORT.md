# settlements/highlands: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 216 (20%) | 19 (2%) | 13 (1%) | 77 (7%) | 752 (70%) |

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
| `src/70-hl-tex.js` | 26.8 | [draw] | 0 | 19 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | canvas painters: TEX.def or bake |
| `src/71-hl-mat.js` | 8.3 | [draw] | 15 | 0 | 0 | 0 | 0 | 25 | 0 | 0 | 0 | 0 | 0 |  |
| `src/71b-hl-motif.js` | 32.9 | [draw] | 0 | 2 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | canvas painters: TEX.def or bake |
| `src/72-hl-helpers.js` | 14.1 | [draw] | 3 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/73-hl-carve.js` | 32.0 | [draw] | 7 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/73b-hl-frame.js` | 31.3 | [draw] | 3 | 6 | 0 | 0 | 0 | 10 | 0 | 0 | 0 | 0 | 0 |  |
| `src/74-rep-dwell.js` | 32.7 | [draw] | 4 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 |  |
| `src/75-rep-trade.js` | 48.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/76-rep-civic.js` | 45.2 | [draw] | 12 | 0 | 0 | 0 | 0 | 14 | 0 | 0 | 0 | 0 | 0 |  |
| `src/76c-rep-capital.js` | 7.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/77-rep-guild.js` | 20.3 | [draw] | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 |  |
| `src/77b-rep-guild2.js` | 16.6 | [draw] | 14 | 1 | 0 | 0 | 0 | 7 | 0 | 0 | 0 | 0 | 0 |  |
| `src/78-rep-grand.js` | 52.9 | [draw] | 3 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/79-rep-land.js` | 30.1 | [draw] | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/79b-rep-salvage.js` | 14.8 | [draw] | 3 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 |  |
| `src/79c-rep-apoc.js` | 25.3 | [draw] | 2 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/79d-rep-scrap2.js` | 9.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/79e-rep-arco.js` | 12.9 | [draw] | 6 | 2 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 | 0 |  |
| `src/79f-rep-shipbreak.js` | 7.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/80-rus-dwell.js` | 24.5 | [draw] | 1 | 0 | 0 | 0 | 0 | 7 | 0 | 0 | 0 | 0 | 0 |  |
| `src/81-rus-village.js` | 29.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/81b-rus-salvage.js` | 11.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/84-tri-dwell.js` | 32.6 | [draw] | 6 | 4 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 | 0 |  |
| `src/85-tri-village.js` | 26.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/85b-tri-salvage.js` | 10.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/88-hl-dress.js` | 10.4 | [draw] | 4 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89y-hl-furnish.js` | 4.1 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | the draw adapter onto core/furnish (2026-10-05): the placement pass is core/furnish/50-core-furnish.js. Kept here: the seed rule (place in the list), the VERN frame, the murals' keep-clear boxes, full detail outside, world-placed town furniture (Roketstad), the shader colour step at kbake |
| `src/90-scene.js` | 6.3 | [web] | 14 | 1 | 1 | 0 | 0 | 3 | 3 | 0 | 0 | 0 | 0 |  |
| `src/91-probe.js` | 3.1 | [web] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 |  |
| `src/92-camera.js` | 9.8 | [web] | 12 | 0 | 20 | 14 | 4 | 2 | 0 | 1 | 3 | 0 | 0 |  |
| `src/93-labels.js` | 6.2 | [G shader] | 7 | 2 | 0 | 0 | 0 | 1 | 3 | 0 | 0 | 0 | 0 |  |
| `src/94-hl-anim.js` | 2.0 | [draw] | 4 | 0 | 0 | 0 | 0 | 1 | 0 | 1 | 0 | 0 | 0 |  |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `targets/highlands/89z-rows.js` | 0.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/highlands/91z-views.js` | 0.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/roketstad/81-rk-sky.js` | 9.6 | [G native] | 23 | 4 | 0 | 0 | 0 | 3 | 6 | 0 | 0 | 0 | 0 | shader hook inside |
| `targets/roketstad/82a-anc-fuel.js` | 2.5 | [draw] | 2 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 |  |
| `targets/roketstad/82b-anc-starport.js` | 3.1 | [draw] | 5 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 |  |
| `targets/roketstad/82c-anc-launch.js` | 67.2 | [draw] | 25 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 |  |
| `targets/roketstad/82d-anc-bunker.js` | 2.9 | [draw] | 5 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `targets/roketstad/82e-anc-aa.js` | 0.9 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `targets/roketstad/84-rk-geo.js` | 7.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/roketstad/85-rk-paint.js` | 5.2 | [draw] | 0 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | canvas painters: TEX.def or bake |
| `targets/roketstad/86-bio-10-core-head.js` | 5.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `targets/roketstad/86-bio-20-core-kit.js` | 13.5 | [draw] | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 5 | 0 | 0 | 0 | split: data candidate that also draws |
| `targets/roketstad/86-bio-30-core-foliage.js` | 13.3 | [G shader] | 0 | 3 | 0 | 0 | 0 | 5 | 10 | 0 | 0 | 0 | 0 |  |
| `targets/roketstad/86-bio-40-core-place.js` | 6.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `targets/roketstad/86-bio-45-init.js` | 2.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/roketstad/86-bio-50-biome-nwlowlands-species.js` | 56.3 | [draw] | 0 | 11 | 0 | 0 | 0 | 10 | 8 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `targets/roketstad/86-bio-55-biome-nwlowlands-trees.js` | 37.9 | [draw] | 0 | 1 | 0 | 0 | 0 | 19 | 0 | 0 | 0 | 0 | 0 |  |
| `targets/roketstad/86-bio-60-biome-nwlowlands-floor.js` | 15.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/roketstad/86-bio-65-biome-nwlowlands-dress.js` | 7.5 | [draw] | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `targets/roketstad/86-bio-70-biome-nwlowlands.js` | 0.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/roketstad/87-rk-layout.js` | 7.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `targets/roketstad/88-rk-place.js` | 12.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `targets/roketstad/89z-rows.js` | 0.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/roketstad/90a-rk-world.js` | 7.9 | [web] | 9 | 1 | 0 | 0 | 2 | 3 | 3 | 0 | 0 | 0 | 0 |  |
| `targets/roketstad/90b-rk-build.js` | 40.5 | [web] | 7 | 0 | 0 | 0 | 4 | 6 | 0 | 0 | 0 | 0 | 0 |  |
| `targets/roketstad/91z-views.js` | 6.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/roketstad/93-rk-ui.js` | 2.4 | [web] | 1 | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `targets/roketstad/93b-rk-lod.js` | 3.2 | [G native] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 |  |

## Notes

(none yet: the split lists and the overrides go here)
