# settlements/ys: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 307 (16%) | 52 (3%) | 104 (5%) | 104 (5%) | 1351 (70%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 2.9 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/10-core.js` | 3.0 | [web] | 0 | 0 | 2 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/12-stats.js` | 1.2 | [web] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 1 | 0 | 0 | 0 |  |
| `src/30-kit.js` | 3.0 | [draw] | 9 | 0 | 0 | 0 | 0 | 2 | 2 | 5 | 0 | 0 | 0 |  |
| `src/32-surfaces.js` | 7.7 | [draw] | 16 | 0 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 | 0 |  |
| `src/34-kitdefs.js` | 9.0 | [draw] | 24 | 2 | 0 | 0 | 0 | 27 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/35-furn-frame.js` | 7.0 | [draw] | 2 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/36-decor.js` | 13.2 | [draw] | 12 | 0 | 0 | 0 | 0 | 3 | 0 | 1 | 0 | 0 | 0 |  |
| `src/38-helpers2.js` | 7.8 | [draw] | 14 | 0 | 0 | 0 | 0 | 9 | 0 | 0 | 0 | 0 | 0 |  |
| `src/42-offices.js` | 15.5 | [draw] | 12 | 0 | 0 | 0 | 0 | 11 | 0 | 2 | 0 | 0 | 0 |  |
| `src/46-bunker.js` | 4.7 | [draw] | 6 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 |  |
| `src/48-library.js` | 3.5 | [draw] | 4 | 0 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 | 0 |  |
| `src/50-registry.js` | 0.6 | [draw] | 3 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/52-sky-abc.js` | 31.1 | [G native] | 19 | 0 | 0 | 0 | 0 | 15 | 0 | 0 | 0 | 0 | 0 |  |
| `src/54-mat-concrete.js` | 4.4 | [draw] | 8 | 2 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/56-sky-d.js` | 5.9 | [G native] | 3 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/57-sky-e.js` | 3.8 | [G native] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/58-sky-f.js` | 5.6 | [G native] | 1 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 |  |
| `src/60-hyk-mat.js` | 10.0 | [G shader] | 20 | 6 | 0 | 0 | 0 | 13 | 3 | 0 | 0 | 0 | 0 |  |
| `src/60-ys-registries.js` | 3.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/61-hyk-shell.js` | 14.7 | [draw] | 15 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 |  |
| `src/62-hyk-helpers.js` | 23.0 | [draw] | 5 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/62-robotics.js` | 8.3 | [draw] | 7 | 0 | 0 | 0 | 0 | 7 | 0 | 1 | 0 | 0 | 0 |  |
| `src/64-houses-def.js` | 8.8 | [draw] | 4 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/64-hyk-accrete.js` | 16.3 | [draw] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/64b-ys-ruins.js` | 5.5 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/65-hyk-spans.js` | 27.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | draws through the Hykkousoi shell kit (hykPut, hykLathe, hykTube): no `THREE.` for the counts to see |
| `src/66-hyk-furniture.js` | 25.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 72 | 0 | 0 | 0 | 0 | 0 |  |
| `src/66-office-c.js` | 4.6 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/69-mat-salvage.js` | 15.6 | [draw] | 32 | 5 | 0 | 0 | 0 | 14 | 5 | 1 | 0 | 0 | 0 |  |
| `src/69b-vern-mat.js` | 14.0 | [G shader] | 27 | 8 | 0 | 0 | 0 | 25 | 0 | 0 | 0 | 0 | 0 |  |
| `src/69c-vern-helpers.js` | 22.0 | [draw] | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/69h-host-0-lib.js` | 7.5 | [draw] | 3 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/69h-host-a-facet.js` | 7.5 | [draw] | 3 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/69h-host-b-bastion.js` | 11.6 | [draw] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/69h-host-c-arcades.js` | 10.1 | [draw] | 9 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 |  |
| `src/69h-host-d-stalks.js` | 8.8 | [draw] | 6 | 0 | 0 | 0 | 0 | 9 | 0 | 0 | 0 | 0 | 0 |  |
| `src/69h-host-e-bellhall.js` | 12.5 | [draw] | 8 | 0 | 0 | 0 | 0 | 7 | 0 | 0 | 0 | 0 | 0 |  |
| `src/69i-host-ancients.js` | 12.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/69j-host-offices.js` | 5.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/69w-worn.js` | 12.3 | [draw] | 8 | 1 | 0 | 0 | 0 | 1 | 0 | 1 | 0 | 0 | 0 |  |
| `src/70-hl-tex.js` | 26.8 | [draw] | 0 | 19 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | canvas painters: TEX.def or bake |
| `src/70-hyk-housing.js` | 69.4 | [draw] | 6 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/70-port-core.js` | 38.0 | [draw] | 10 | 0 | 0 | 0 | 0 | 7 | 0 | 2 | 0 | 0 | 0 |  |
| `src/70-vern-dwellings.js` | 19.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/71-hl-mat.js` | 8.3 | [draw] | 15 | 0 | 0 | 0 | 0 | 25 | 0 | 0 | 0 | 0 | 0 |  |
| `src/71-hyk-shops.js` | 51.0 | [draw] | 2 | 0 | 0 | 0 | 0 | 39 | 0 | 0 | 0 | 0 | 0 |  |
| `src/71-port-terrain.js` | 22.2 | [draw] | 16 | 2 | 0 | 0 | 0 | 2 | 10 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/71-sky-h.js` | 5.4 | [G native] | 3 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/71-vern-trade.js` | 18.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/71b-hl-motif.js` | 32.9 | [draw] | 0 | 2 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | canvas painters: TEX.def or bake |
| `src/72-datacenter.js` | 7.8 | [draw] | 6 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 |  |
| `src/72-hl-helpers.js` | 14.1 | [draw] | 3 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/72-hyk-hospitality.js` | 33.9 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/72-port-kit.js` | 9.4 | [draw] | 44 | 4 | 0 | 0 | 0 | 31 | 0 | 0 | 0 | 0 | 0 |  |
| `src/73-hl-carve.js` | 32.0 | [draw] | 7 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/73-hyk-sacred.js` | 14.1 | [draw] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/73-police.js` | 4.7 | [draw] | 3 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 |  |
| `src/73-port-edges.js` | 17.2 | [draw] | 11 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/74-hospital.js` | 5.3 | [draw] | 3 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/74-port-dress.js` | 11.6 | [draw] | 24 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/74-rep-dwell.js` | 32.7 | [draw] | 4 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 |  |
| `src/74a-hyk-amphitriton.js` | 29.4 | [draw] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/74b-hyk-citadel.js` | 22.7 | [draw] | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | draws through the Hykkousoi shell kit (hykPut, hykLathe, hykTube): no `THREE.` for the counts to see |
| `src/74b2-hyk-arena.js` | 11.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/74c-hyk-tides.js` | 20.9 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/74d-hyk-winds.js` | 10.3 | [draw] | 1 | 0 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 | 0 |  |
| `src/74e-hyk-pharos.js` | 12.6 | [draw] | 7 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/74f-hyk-civic-minor.js` | 34.0 | [draw] | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/75-hotel.js` | 14.9 | [draw] | 10 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/75-hyk-harbour.js` | 36.9 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/75-port-embassy.js` | 23.6 | [draw] | 17 | 4 | 0 | 0 | 0 | 14 | 0 | 0 | 0 | 0 | 0 |  |
| `src/76-hyk-industry.js` | 45.8 | [draw] | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/76-port-chapterhouse.js` | 16.7 | [draw] | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/76b-hyk-warehouse-round.js` | 2.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/77-hyk-military.js` | 30.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | draws through the Hykkousoi shell kit (hykPut, hykLathe, hykTube): no `THREE.` for the counts to see |
| `src/78-hyk-agri.js` | 14.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | draws through the Hykkousoi shell kit (hykPut, hykLathe, hykTube): no `THREE.` for the counts to see |
| `src/79-government.js` | 7.7 | [draw] | 6 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 |  |
| `src/79-hyk-markets.js` | 18.3 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | draws through the Hykkousoi shell kit (hykPut, hykLathe, hykTube): no `THREE.` for the counts to see |
| `src/79z-ys-matlib.js` | 5.0 | [G shader] | 2 | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 |  |
| `src/80-aa-battery.js` | 1.2 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/81-sky.js` | 9.5 | [G native] | 23 | 4 | 0 | 0 | 0 | 3 | 6 | 0 | 0 | 0 | 0 | shader hook inside |
| `src/82-apartments.js` | 8.9 | [draw] | 6 | 0 | 0 | 0 | 0 | 7 | 0 | 0 | 0 | 0 | 0 |  |
| `src/86-bio-10-core-head.js` | 9.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/86-bio-20-core-kit.js` | 21.5 | [draw] | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 8 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/86-bio-30-core-foliage.js` | 16.5 | [G shader] | 1 | 4 | 0 | 0 | 0 | 5 | 10 | 0 | 0 | 0 | 0 |  |
| `src/86-bio-40-core-place.js` | 8.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/86-bio-50-biome-nwbay-species.js` | 43.8 | [draw] | 0 | 3 | 0 | 0 | 0 | 11 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/86-bio-55-biome-nwbay-trees.js` | 61.1 | [draw] | 0 | 1 | 0 | 0 | 0 | 28 | 0 | 0 | 0 | 0 | 0 |  |
| `src/86-bio-60-biome-nwbay-floor.js` | 18.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/86-bio-65-biome-nwbay-dress.js` | 9.6 | [draw] | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/86-bio-70-biome-nwbay.js` | 1.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/86-bio-75-biome-nwbay-fauna.js` | 12.7 | [draw] | 0 | 0 | 0 | 0 | 0 | 4 | 3 | 6 | 0 | 0 | 0 |  |
| `src/89-lab.js` | 6.8 | [draw] | 5 | 0 | 0 | 0 | 0 | 11 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89m-sky-k.js` | 42.2 | [G native] | 42 | 1 | 0 | 0 | 0 | 23 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8aj-alt-a-bole.js` | 15.0 | [draw] | 14 | 0 | 0 | 0 | 0 | 9 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8aj-alt-b-stack.js` | 9.9 | [draw] | 6 | 0 | 0 | 0 | 0 | 7 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8aj-alt-c-hotel.js` | 7.9 | [draw] | 4 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8ak-alt-a-houses.js` | 24.8 | [draw] | 28 | 0 | 0 | 0 | 0 | 9 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8al-alt-00-lib.js` | 10.0 | [draw] | 11 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8al-alt-01-office-terrace.js` | 6.9 | [draw] | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8al-alt-06-library.js` | 6.7 | [draw] | 4 | 0 | 0 | 0 | 0 | 4 | 0 | 1 | 0 | 0 | 0 |  |
| `src/90-ys-scene.js` | 6.2 | [web] | 8 | 0 | 1 | 0 | 0 | 3 | 0 | 1 | 0 | 0 | 0 |  |
| `src/91-ys-probe.js` | 8.1 | [web] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 |  |
| `src/92-camera.js` | 15.1 | [web] | 18 | 3 | 25 | 15 | 4 | 4 | 0 | 1 | 3 | 0 | 0 |  |
| `src/93-labels.js` | 6.2 | [G shader] | 7 | 2 | 0 | 0 | 0 | 1 | 3 | 0 | 0 | 0 | 0 |  |
| `src/93-ys-ui.js` | 3.6 | [web] | 5 | 0 | 3 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `targets/city/77-voth-townhouses.js` | 11.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/city/84-city-geo.js` | 12.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/city/84b-city-shore.js` | 8.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `targets/city/86-bio-45-city-init.js` | 1.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/city/86-city-edits.js` | 2.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/city/87-city-layout.js` | 14.1 | [G data] | 3 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | split: the layout is records; only the debug overlay draws (move it to its own fragment) |
| `targets/city/87b-city-nav.js` | 9.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `targets/city/87c-city-paint.js` | 5.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/city/87d-city-karst.js` | 5.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/city/88-city-place.js` | 64.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | pass 1 of P3: the placement as records on KRAND (blds, hosts with plates and pods, slots, moles); reads the layout and terrainH only |
| `targets/city/88-city-spans.js` | 17.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/city/88a-city-floors.js` | 5.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/city/88b-city-draw.js` | 16.2 | [draw] | 1 | 0 | 0 | 0 | 2 | 1 | 0 | 1 | 0 | 0 | 0 | the draw pass: reads PLACE and calls HYK.place, ysPlaceHost, HYK.placeOn; decides nothing |
| `targets/city/88c-city-foreign.js` | 14.4 | [web] | 3 | 0 | 0 | 0 | 2 | 0 | 1 | 1 | 0 | 0 | 0 |  |
| `targets/city/89-city-biome.js` | 13.8 | [web] | 1 | 0 | 0 | 0 | 2 | 3 | 0 | 1 | 0 | 0 | 0 |  |
| `targets/city/89z-rows.js` | 0.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/city/91z-views.js` | 10.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/city/93z-city-api.js` | 13.9 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the probe: _api.city.place()/records() and the city invariants on window._api |
| `targets/city/94-city-editor.js` | 21.5 | [web] | 8 | 0 | 19 | 4 | 0 | 1 | 1 | 4 | 1 | 0 | 0 |  |
| `targets/kit/84-kit-geo.js` | 0.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/kit/89z-rows.js` | 6.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/kit/91z-views.js` | 0.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/mock/84-mock-geo.js` | 0.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/mock/86-mock-houses.js` | 13.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/mock/88-mock-build.js` | 6.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/mock/89z-rows.js` | 0.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/mock/91z-views.js` | 1.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |

## Notes

(none yet: the split lists and the overrides go here)
