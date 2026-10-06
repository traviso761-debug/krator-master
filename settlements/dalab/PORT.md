# settlements/dalab: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 151 (21%) | 40 (5%) | 10 (1%) | 38 (5%) | 492 (67%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 3.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/10-core.js` | 3.0 | [web] | 0 | 0 | 2 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/12-stats.js` | 1.2 | [web] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 1 | 0 | 0 | 0 |  |
| `src/30-kit.js` | 3.0 | [draw] | 9 | 0 | 0 | 0 | 0 | 2 | 2 | 5 | 0 | 0 | 0 |  |
| `src/32-surfaces.js` | 7.7 | [draw] | 16 | 0 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 | 0 |  |
| `src/34-kitdefs.js` | 9.0 | [draw] | 24 | 2 | 0 | 0 | 0 | 27 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/36-decor.js` | 13.2 | [draw] | 12 | 0 | 0 | 0 | 0 | 3 | 0 | 1 | 0 | 0 | 0 |  |
| `src/38-helpers2.js` | 7.8 | [draw] | 14 | 0 | 0 | 0 | 0 | 9 | 0 | 0 | 0 | 0 | 0 |  |
| `src/50-registry.js` | 0.6 | [draw] | 3 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/54-mat-concrete.js` | 4.2 | [draw] | 8 | 2 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/69-mat-salvage.js` | 15.6 | [draw] | 32 | 5 | 0 | 0 | 0 | 14 | 5 | 1 | 0 | 0 | 0 |  |
| `src/69b-vern-mat.js` | 14.1 | [G shader] | 26 | 8 | 0 | 0 | 0 | 25 | 2 | 0 | 0 | 0 | 0 |  |
| `src/69c-vern-helpers.js` | 19.3 | [draw] | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/69d-dalab-mat.js` | 22.1 | [draw] | 27 | 12 | 0 | 0 | 0 | 19 | 0 | 0 | 0 | 0 | 0 |  |
| `src/69e-dalab-helpers.js` | 26.3 | [draw] | 4 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/70-dalab-dwellings.js` | 11.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/70-hl-tex.js` | 26.8 | [draw] | 0 | 19 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | canvas painters: TEX.def or bake |
| `src/71-dalab-trade.js` | 18.4 | [draw] | 6 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/71-hl-mat.js` | 8.5 | [G shader] | 15 | 0 | 0 | 0 | 0 | 25 | 1 | 0 | 0 | 0 | 0 |  |
| `src/71b-hl-motif.js` | 32.9 | [draw] | 0 | 2 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | canvas painters: TEX.def or bake |
| `src/71c-dalab-town.js` | 17.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/72-dalab-civic.js` | 20.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/72-hl-helpers.js` | 14.1 | [draw] | 3 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/73-dalab-sacred.js` | 20.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/73-hl-carve.js` | 29.8 | [draw] | 7 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/74-dalab-ranch.js` | 5.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/74-rep-dwell.js` | 33.1 | [draw] | 4 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 |  |
| `src/75-port-embassy.js` | 23.6 | [draw] | 17 | 4 | 0 | 0 | 0 | 14 | 0 | 0 | 0 | 0 | 0 |  |
| `src/76-port-chapterhouse.js` | 16.7 | [draw] | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/81-sky.js` | 9.5 | [G native] | 23 | 4 | 0 | 0 | 0 | 3 | 6 | 0 | 0 | 0 | 0 | shader hook inside |
| `src/86-bio-10-core-head.js` | 5.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/86-bio-20-core-kit.js` | 15.3 | [draw] | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 5 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/86-bio-30-core-foliage.js` | 13.3 | [G shader] | 0 | 3 | 0 | 0 | 0 | 5 | 10 | 0 | 0 | 0 | 0 |  |
| `src/86-bio-40-core-place.js` | 6.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/86-bio-45-init.js` | 2.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/86-bio-50-biome-swlowlands-species.js` | 50.3 | [draw] | 0 | 8 | 0 | 0 | 0 | 6 | 8 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/86-bio-55-biome-swlowlands-trees.js` | 56.5 | [draw] | 0 | 1 | 0 | 0 | 0 | 38 | 0 | 0 | 0 | 0 | 0 |  |
| `src/86-bio-60-biome-swlowlands-floor.js` | 23.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/86-bio-65-biome-swlowlands-dress.js` | 7.7 | [draw] | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/86-bio-70-biome-swlowlands.js` | 0.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/88y-dalab-matlib.js` | 1.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/90-scene.js` | 3.4 | [web] | 14 | 1 | 1 | 0 | 0 | 3 | 3 | 0 | 0 | 0 | 0 |  |
| `src/91-probe.js` | 2.9 | [web] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 |  |
| `src/92-camera.js` | 9.8 | [web] | 12 | 0 | 20 | 14 | 4 | 2 | 0 | 1 | 3 | 0 | 0 |  |
| `src/93-labels.js` | 4.0 | [G shader] | 6 | 2 | 0 | 0 | 0 | 1 | 3 | 0 | 0 | 0 | 0 |  |
| `src/94-dalab-light.js` | 4.6 | [web] | 0 | 0 | 2 | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | split: data inside host code |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `targets/city/63-anc-dalab.js` | 11.2 | [draw] | 1 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `targets/city/84-city-geo.js` | 6.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/city/85-city-paint.js` | 6.1 | [draw] | 0 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | canvas painters: TEX.def or bake |
| `targets/city/87-city-layout.js` | 11.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `targets/city/88-city-place.js` | 8.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `targets/city/89z-rows.js` | 0.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/city/90a-city-world.js` | 8.1 | [web] | 12 | 3 | 0 | 0 | 1 | 5 | 0 | 0 | 0 | 0 | 0 |  |
| `targets/city/90b-city-build.js` | 12.0 | [draw] | 0 | 0 | 0 | 0 | 3 | 1 | 0 | 0 | 0 | 0 | 0 | split: the city's placement and build passes in one (markets and civic, nobles, frontage, farms, the biome): a [G data] pass that writes placement records, then the [draw] pass and bakes; timing reads go to the host. Was provisionally [web] |
| `targets/city/91z-views.js` | 2.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/city/93-city-ui.js` | 2.0 | [web] | 1 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `targets/city/95-city-life.js` | 8.6 | [draw] | 6 | 0 | 0 | 0 | 0 | 2 | 0 | 3 | 0 | 0 | 0 | split: data candidate that also draws |
| `targets/set/89z-rows.js` | 1.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/set/91z-views.js` | 4.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |

## Notes

(none yet: the split lists and the overrides go here)
