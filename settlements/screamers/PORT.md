# settlements/screamers: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 20 (3%) | 26 (5%) | 27 (5%) | 44 (8%) | 464 (80%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 2.3 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/10-core.js` | 2.9 | [web] | 0 | 0 | 2 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/12-stats.js` | 1.2 | [web] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 1 | 0 | 0 | 0 |  |
| `src/30-kit.js` | 3.3 | [draw] | 9 | 0 | 0 | 0 | 0 | 2 | 4 | 3 | 0 | 0 | 0 |  |
| `src/32-surfaces.js` | 6.7 | [draw] | 15 | 0 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 | 0 |  |
| `src/34-kitdefs.js` | 2.4 | [draw] | 16 | 0 | 0 | 0 | 0 | 22 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/36-decor.js` | 8.7 | [draw] | 8 | 0 | 0 | 0 | 0 | 2 | 0 | 1 | 0 | 0 | 0 |  |
| `src/38-helpers2.js` | 2.1 | [draw] | 5 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 |  |
| `src/40-factory-extras.js` | 2.8 | [draw] | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/42-offices.js` | 3.5 | [draw] | 5 | 0 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 | 0 |  |
| `src/44-starport.js` | 3.1 | [draw] | 5 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 |  |
| `src/46-bunker.js` | 2.9 | [draw] | 5 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/48-library.js` | 2.7 | [draw] | 4 | 0 | 0 | 0 | 0 | 7 | 0 | 0 | 0 | 0 | 0 |  |
| `src/50-registry.js` | 0.6 | [draw] | 3 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/52-sky-abc.js` | 11.3 | [G native] | 16 | 0 | 0 | 0 | 0 | 15 | 0 | 0 | 0 | 0 | 0 |  |
| `src/54-mat-concrete.js` | 3.8 | [draw] | 8 | 2 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/56-sky-d.js` | 2.7 | [G native] | 2 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/57-sky-e.js` | 2.8 | [G native] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/58-sky-f.js` | 3.0 | [G native] | 1 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/60-gate.js` | 4.9 | [draw] | 6 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/61-spire.js` | 14.6 | [draw] | 17 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/62-robotics.js` | 4.2 | [draw] | 1 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 |  |
| `src/63-canyon.js` | 15.1 | [draw] | 8 | 0 | 0 | 0 | 0 | 9 | 0 | 0 | 0 | 0 | 0 |  |
| `src/64-dalab.js` | 8.4 | [draw] | 1 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/64-houses-def.js` | 3.7 | [draw] | 2 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/65-veladiga.js` | 13.4 | [draw] | 2 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/66-office-c.js` | 2.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/67-cultural.js` | 4.1 | [draw] | 2 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 |  |
| `src/68-hexahedron.js` | 62.9 | [draw] | 15 | 0 | 0 | 0 | 0 | 23 | 0 | 0 | 0 | 0 | 0 |  |
| `src/69-mat-salvage.js` | 7.0 | [draw] | 16 | 3 | 0 | 0 | 0 | 10 | 0 | 0 | 0 | 0 | 0 |  |
| `src/70-hypertree.js` | 12.2 | [draw] | 11 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 |  |
| `src/70-sky-g.js` | 4.6 | [G native] | 3 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 |  |
| `src/70c-furniture.js` | 6.6 | [draw] | 17 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 |  |
| `src/71-sky-h.js` | 2.6 | [G native] | 2 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/71-village.js` | 45.1 | [draw] | 40 | 3 | 0 | 0 | 0 | 16 | 0 | 0 | 0 | 0 | 0 |  |
| `src/71a-apoc-homes.js` | 3.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | sites the salvage homes (data: a fixed ring round each smithy) and builds them through KratorPostApoc, a [draw] kit, with the interiors kit's rooms; Godot places the kit's exported buildings at SCREAM.homes |
| `src/71b-flora.js` | 39.3 | [draw] | 58 | 3 | 0 | 0 | 0 | 21 | 0 | 0 | 0 | 0 | 0 |  |
| `src/72-datacenter.js` | 3.2 | [draw] | 4 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 |  |
| `src/72a-wind.js` | 5.6 | [G shader] | 0 | 0 | 0 | 0 | 0 | 0 | 9 | 0 | 0 | 0 | 0 |  |
| `src/72c-matlib.js` | 7.4 | [G shader] | 1 | 0 | 0 | 0 | 0 | 2 | 10 | 1 | 0 | 0 | 0 | library maps by world-space triplanar projection (materials.json): StandardMaterial3D's triplanar mode, world space, at each family's tile size |
| `src/73-police.js` | 2.9 | [draw] | 2 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/74-hospital.js` | 3.1 | [draw] | 3 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/75-biome-10-core-head.js` | 4.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/75-biome-20-core-kit.js` | 13.5 | [draw] | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 5 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/75-biome-30-core-foliage.js` | 13.3 | [G shader] | 0 | 3 | 0 | 0 | 0 | 5 | 10 | 0 | 0 | 0 | 0 |  |
| `src/75-biome-40-core-place.js` | 5.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/75-biome-45-init.js` | 1.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/75-hotel.js` | 3.8 | [draw] | 3 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 |  |
| `src/76-50-biome-hyperjungle-species.js` | 13.7 | [draw] | 2 | 3 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/76-55-biome-hyperjungle-trees.js` | 24.2 | [draw] | 2 | 1 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 |  |
| `src/76-60-biome-hyperjungle-floor.js` | 27.1 | [draw] | 1 | 1 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 |  |
| `src/76-65-biome-hyperjungle-dress.js` | 6.7 | [draw] | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/76-70-biome-hyperjungle.js` | 0.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/76-campus.js` | 7.9 | [draw] | 4 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/77-dam.js` | 10.7 | [draw] | 4 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 |  |
| `src/78-factory-silo.js` | 2.0 | [draw] | 1 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/79-government.js` | 4.1 | [draw] | 4 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 |  |
| `src/80-aa-battery.js` | 0.9 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/81-houses-abc.js` | 4.1 | [draw] | 8 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 |  |
| `src/82-apartments.js` | 6.4 | [draw] | 5 | 0 | 0 | 0 | 0 | 7 | 0 | 0 | 0 | 0 | 0 |  |
| `src/83-amphitheater.js` | 7.1 | [draw] | 3 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/84-fuel.js` | 2.5 | [draw] | 2 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 |  |
| `src/85-radar.js` | 2.7 | [draw] | 3 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 |  |
| `src/86-dish.js` | 2.5 | [draw] | 4 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/87-mega.js` | 4.8 | [draw] | 4 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/88-factory.js` | 5.6 | [draw] | 5 | 0 | 0 | 0 | 0 | 7 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89-lab.js` | 5.9 | [draw] | 5 | 0 | 0 | 0 | 0 | 11 | 0 | 0 | 0 | 0 | 0 |  |
| `src/90-scene.js` | 16.4 | [web] | 27 | 2 | 1 | 0 | 0 | 6 | 6 | 0 | 0 | 0 | 0 |  |
| `src/91-probe.js` | 4.5 | [web] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 |  |
| `src/92-camera.js` | 5.3 | [web] | 5 | 0 | 6 | 8 | 3 | 0 | 0 | 2 | 2 | 0 | 0 |  |
| `src/93-polytool.js` | 6.9 | [web] | 10 | 0 | 12 | 6 | 0 | 3 | 0 | 1 | 1 | 0 | 0 |  |
| `src/94-life.js` | 10.7 | [draw] | 19 | 0 | 0 | 0 | 0 | 4 | 0 | 5 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/95-pathviz.js` | 4.4 | [web] | 10 | 0 | 4 | 2 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `targets/furniture/89z-rows.js` | 0.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/furniture/91z-views.js` | 0.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/screamers/89z-rows.js` | 0.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/screamers/91z-views.js` | 3.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |

## Notes

(none yet: the split lists and the overrides go here)
