# kits/ancients: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 244 (10%) | 34 (1%) | 174 (7%) | 27 (1%) | 2057 (81%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 2.3 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/10-core.js` | 3.0 | [web] | 0 | 0 | 2 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/12-stats.js` | 1.2 | [web] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 1 | 0 | 0 | 0 |  |
| `src/30-kit.js` | 3.0 | [draw] | 9 | 0 | 0 | 0 | 0 | 2 | 2 | 5 | 0 | 0 | 0 |  |
| `src/32-surfaces.js` | 7.7 | [draw] | 16 | 0 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 | 0 |  |
| `src/34-kitdefs.js` | 9.0 | [draw] | 24 | 2 | 0 | 0 | 0 | 27 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/36-decor.js` | 13.2 | [draw] | 12 | 0 | 0 | 0 | 0 | 3 | 0 | 1 | 0 | 0 | 0 |  |
| `src/38-helpers2.js` | 7.8 | [draw] | 14 | 0 | 0 | 0 | 0 | 9 | 0 | 0 | 0 | 0 | 0 |  |
| `src/40-factory-extras.js` | 4.1 | [draw] | 0 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 |  |
| `src/42-offices.js` | 14.7 | [draw] | 11 | 0 | 0 | 0 | 0 | 11 | 0 | 2 | 0 | 0 | 0 |  |
| `src/44-starport.js` | 5.2 | [draw] | 8 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 |  |
| `src/46-bunker.js` | 4.7 | [draw] | 6 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 |  |
| `src/48-library.js` | 3.5 | [draw] | 4 | 0 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 | 0 |  |
| `src/50-registry.js` | 0.6 | [draw] | 3 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/52-sky-abc.js` | 28.9 | [G native] | 19 | 0 | 0 | 0 | 0 | 15 | 0 | 0 | 0 | 0 | 0 |  |
| `src/54-mat-concrete.js` | 4.2 | [draw] | 8 | 2 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/56-sky-d.js` | 5.8 | [G native] | 3 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/57-sky-e.js` | 3.4 | [G native] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/58-sky-f.js` | 4.7 | [G native] | 1 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/60-gate.js` | 7.2 | [draw] | 12 | 0 | 0 | 0 | 0 | 7 | 0 | 0 | 0 | 0 | 0 |  |
| `src/61-spire.js` | 29.8 | [draw] | 42 | 3 | 0 | 0 | 0 | 22 | 0 | 0 | 0 | 0 | 0 |  |
| `src/62-robotics.js` | 8.3 | [draw] | 7 | 0 | 0 | 0 | 0 | 7 | 0 | 1 | 0 | 0 | 0 |  |
| `src/63-canyon.js` | 18.2 | [draw] | 12 | 0 | 0 | 0 | 0 | 9 | 0 | 0 | 0 | 0 | 0 |  |
| `src/64-dalab.js` | 11.6 | [draw] | 1 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/64-houses-def.js` | 8.8 | [draw] | 4 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/65-veladiga.js` | 15.8 | [draw] | 2 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/66-office-c.js` | 2.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/66b-flatiron.js` | 7.8 | [draw] | 7 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/67-cultural.js` | 6.6 | [draw] | 2 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 |  |
| `src/68-hexahedron.js` | 39.4 | [draw] | 10 | 0 | 0 | 0 | 0 | 22 | 0 | 0 | 0 | 0 | 0 |  |
| `src/69-mat-salvage.js` | 15.6 | [G shader] | 32 | 5 | 0 | 0 | 0 | 14 | 5 | 1 | 0 | 0 | 0 |  |
| `src/69w-worn.js` | 12.3 | [draw] | 8 | 1 | 0 | 0 | 0 | 1 | 0 | 1 | 0 | 0 | 0 |  |
| `src/70-hypertree.js` | 12.2 | [draw] | 11 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 |  |
| `src/70-sky-g.js` | 8.1 | [G native] | 3 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 |  |
| `src/70b-perch.js` | 3.6 | [draw] | 1 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/71-sky-h.js` | 5.3 | [G native] | 3 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/71b-forest.js` | 48.6 | [draw] | 23 | 1 | 0 | 0 | 0 | 14 | 0 | 0 | 0 | 0 | 0 |  |
| `src/71c-ring.js` | 73.4 | [draw] | 30 | 1 | 0 | 0 | 0 | 18 | 0 | 0 | 0 | 0 | 0 |  |
| `src/72-datacenter.js` | 7.8 | [draw] | 6 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 |  |
| `src/73-police.js` | 4.7 | [draw] | 3 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 |  |
| `src/74-hospital.js` | 5.3 | [draw] | 3 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/75-biome-10-core-head.js` | 5.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/75-biome-20-core-kit.js` | 13.5 | [draw] | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 5 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/75-biome-30-core-foliage.js` | 13.3 | [G shader] | 0 | 3 | 0 | 0 | 0 | 5 | 10 | 0 | 0 | 0 | 0 |  |
| `src/75-biome-40-core-place.js` | 6.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/75-biome-45-bind.js` | 2.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/75-hotel.js` | 14.9 | [draw] | 10 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/76-50-biome-hyperjungle-species.js` | 13.7 | [draw] | 2 | 3 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/76-55-biome-hyperjungle-trees.js` | 24.2 | [draw] | 2 | 1 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 |  |
| `src/76-60-biome-hyperjungle-floor.js` | 27.1 | [draw] | 1 | 1 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 |  |
| `src/76-65-biome-hyperjungle-dress.js` | 6.7 | [draw] | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/76-70-biome-hyperjungle.js` | 0.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/76-campus.js` | 10.9 | [draw] | 5 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/77-dam.js` | 12.9 | [draw] | 3 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 |  |
| `src/77z-iziz-style.js` | 52.7 | [draw] | 37 | 1 | 0 | 0 | 0 | 32 | 3 | 0 | 0 | 0 | 0 |  |
| `src/78-factory-silo.js` | 2.0 | [draw] | 1 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/79-government.js` | 7.7 | [draw] | 6 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 |  |
| `src/80-aa-battery.js` | 1.2 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/81-houses-abc.js` | 6.3 | [draw] | 9 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 |  |
| `src/82-apartments.js` | 8.0 | [draw] | 6 | 0 | 0 | 0 | 0 | 7 | 0 | 0 | 0 | 0 | 0 |  |
| `src/83-amphitheater.js` | 8.3 | [draw] | 3 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/84-fuel.js` | 4.0 | [draw] | 3 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 |  |
| `src/85-radar.js` | 2.9 | [draw] | 3 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 |  |
| `src/86-dish.js` | 3.2 | [draw] | 4 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/86b-darco.js` | 26.7 | [draw] | 15 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 |  |
| `src/87-launch.js` | 72.8 | [draw] | 26 | 0 | 0 | 0 | 0 | 7 | 5 | 0 | 0 | 0 | 0 |  |
| `src/87-mega.js` | 10.2 | [draw] | 5 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 |  |
| `src/88-factory.js` | 9.1 | [draw] | 5 | 0 | 0 | 0 | 0 | 7 | 0 | 0 | 0 | 0 | 0 |  |
| `src/88-plymouth.js` | 58.4 | [draw] | 44 | 0 | 0 | 0 | 0 | 14 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89-arcbeam.js` | 59.3 | [draw] | 37 | 0 | 0 | 0 | 0 | 9 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89-lab.js` | 6.8 | [draw] | 5 | 0 | 0 | 0 | 0 | 11 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89b-arcoindian.js` | 81.3 | [draw] | 59 | 3 | 0 | 0 | 0 | 25 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89c-arcoindian2.js` | 81.9 | [draw] | 39 | 0 | 0 | 0 | 0 | 9 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89d-arcube.js` | 89.4 | [draw] | 81 | 3 | 0 | 0 | 0 | 16 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89e-hill.js` | 64.7 | [draw] | 38 | 3 | 0 | 0 | 0 | 6 | 3 | 1 | 0 | 0 | 0 |  |
| `src/89f-trigon.js` | 52.0 | [draw] | 73 | 4 | 0 | 0 | 0 | 13 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89g-monolith.js` | 49.1 | [draw] | 53 | 5 | 0 | 0 | 0 | 39 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89h-crescent.js` | 50.9 | [draw] | 65 | 6 | 0 | 0 | 0 | 12 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89i-ledge.js` | 51.7 | [draw] | 54 | 6 | 0 | 0 | 0 | 27 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89j-wheel.js` | 70.2 | [draw] | 42 | 7 | 0 | 0 | 0 | 31 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89k-sky-i.js` | 46.5 | [G native] | 37 | 2 | 0 | 0 | 0 | 9 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89l-sky-j.js` | 30.7 | [G native] | 21 | 2 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89m-sky-k.js` | 40.9 | [G native] | 42 | 1 | 0 | 0 | 0 | 23 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89n-lighthouse.js` | 42.6 | [draw] | 51 | 4 | 0 | 0 | 0 | 10 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8ae-wing.js` | 45.5 | [draw] | 38 | 8 | 0 | 0 | 0 | 11 | 2 | 0 | 0 | 0 | 0 |  |
| `src/8af-drum.js` | 48.5 | [draw] | 33 | 3 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8ag-blades.js` | 56.3 | [draw] | 60 | 9 | 0 | 0 | 0 | 25 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8ah-engines.js` | 32.9 | [draw] | 27 | 0 | 0 | 0 | 0 | 13 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8ai-engines2.js` | 19.3 | [draw] | 10 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8aj-alt-a-bole.js` | 15.0 | [draw] | 14 | 0 | 0 | 0 | 0 | 9 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8aj-alt-b-stack.js` | 9.3 | [draw] | 6 | 0 | 0 | 0 | 0 | 7 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8aj-alt-c-hotel.js` | 7.1 | [draw] | 3 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8aj-alt-d-flat.js` | 8.7 | [draw] | 2 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8aj-alt-e-perch.js` | 12.3 | [draw] | 4 | 0 | 0 | 0 | 0 | 7 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8aj-alt-f-cult.js` | 9.2 | [draw] | 7 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8ak-alt-a-houses.js` | 24.6 | [draw] | 28 | 0 | 0 | 0 | 0 | 9 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8ak-alt-b-civic.js` | 27.2 | [draw] | 22 | 0 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8ak-alt-c-works.js` | 20.0 | [draw] | 19 | 0 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8al-alt-00-lib.js` | 10.0 | [draw] | 11 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8al-alt-01-office-terrace.js` | 5.8 | [draw] | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8al-alt-02-office-stack.js` | 5.4 | [draw] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8al-alt-03-office-fins.js` | 5.2 | [draw] | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8al-alt-04-starport.js` | 7.5 | [draw] | 9 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8al-alt-05-bunker.js` | 5.1 | [draw] | 4 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8al-alt-06-library.js` | 5.3 | [draw] | 4 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8al-alt-07-gate.js` | 5.3 | [draw] | 6 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8al-alt-08-robotics.js` | 6.0 | [draw] | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8al-alt-09-datacenter.js` | 5.1 | [draw] | 2 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8al-alt-10-police.js` | 4.6 | [draw] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8al-alt-11-hospital.js` | 5.1 | [draw] | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8al-alt-12-campus.js` | 4.9 | [draw] | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8al-alt-13-government.js` | 4.8 | [draw] | 2 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8am-yv-a-quad.js` | 11.5 | [draw] | 3 | 0 | 0 | 0 | 0 | 7 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8am-yv-b-comb.js` | 6.0 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8am-yv-c-terrace.js` | 6.2 | [draw] | 5 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8am-yv-d-dish.js` | 4.9 | [draw] | 4 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8am-yv-e-hosp.js` | 5.5 | [draw] | 3 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8an-iz-stumps.js` | 14.1 | [draw] | 5 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8ao-iz-spaceport.js` | 36.2 | [draw] | 18 | 0 | 0 | 0 | 0 | 3 | 1 | 0 | 0 | 0 | 0 |  |
| `src/8ap-host-0-lib.js` | 7.5 | [draw] | 3 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 | split: the plan arithmetic (anhRayR, anhMeanR, anhInR, anhFaces, anhCross) is data; the rest draws |
| `src/8ap-host-a-facet.js` | 7.5 | [draw] | 3 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | split: HOSTSPEC_FACET and hfaPlan are data (the Ys host record) |
| `src/8ap-host-b-bastion.js` | 11.6 | [draw] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: HOSTSPEC_BASTION and hbaPlan are data (the Ys host record) |
| `src/8ap-host-c-arcades.js` | 10.1 | [draw] | 9 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 | split: HOSTSPEC_ARCADES and hacPlan are data (the Ys host record) |
| `src/8ap-host-d-stalks.js` | 8.7 | [draw] | 6 | 0 | 0 | 0 | 0 | 9 | 0 | 0 | 0 | 0 | 0 | split: HOSTSPEC_STALKS, hstSockets and hstRAt are data (the Ys host record and its sockets) |
| `src/8ap-host-e-bellhall.js` | 12.5 | [draw] | 8 | 0 | 0 | 0 | 0 | 7 | 0 | 0 | 0 | 0 | 0 | split: HOSTSPEC_BELLHALL and hbhRAt are data (the Ys host record) |
| `src/90-scene.js` | 8.5 | [web] | 14 | 2 | 1 | 0 | 0 | 3 | 4 | 0 | 0 | 0 | 0 |  |
| `src/91-probe.js` | 5.7 | [web] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 |  |
| `src/92-camera.js` | 6.3 | [web] | 5 | 0 | 6 | 8 | 3 | 0 | 0 | 2 | 2 | 0 | 0 |  |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `targets/alt-civic/89z-rows.js` | 2.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/alt-civic/91z-views.js` | 1.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/alt-domestic/89z-rows.js` | 1.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/alt-domestic/91z-views.js` | 1.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/alt-towers/89z-rows.js` | 1.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/alt-towers/91z-views.js` | 1.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/arcbeam/89z-rows.js` | 1.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/arcbeam/91z-views.js` | 7.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/arcoindian/89z-rows.js` | 2.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/arcoindian/91z-views.js` | 8.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/arcoindian2/89z-rows.js` | 2.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/arcoindian2/91z-views.js` | 9.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/arcube/89z-rows.js` | 1.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/arcube/91z-views.js` | 8.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/blades/89z-rows.js` | 0.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/blades/91z-views.js` | 6.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/canyon/89z-rows.js` | 0.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/canyon/91z-views.js` | 0.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/crescent/89z-rows.js` | 1.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/crescent/91z-views.js` | 3.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/dalab/89z-rows.js` | 0.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/dalab/91z-views.js` | 3.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/darco/89z-rows.js` | 0.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/darco/91z-views.js` | 1.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/drum/89z-rows.js` | 1.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/drum/91z-views.js` | 5.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/engines/89z-rows.js` | 1.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/engines/91z-views.js` | 3.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/forest/89z-rows.js` | 0.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/forest/91z-views.js` | 4.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/hexahedron/89z-rows.js` | 4.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 1 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/hexahedron/91z-views.js` | 3.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/hill/89z-rows.js` | 1.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/hill/91z-views.js` | 11.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/hosts/89z-rows.js` | 3.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/hosts/91z-views.js` | 1.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/iziz-style/89z-rows.js` | 5.3 | [G shader] | 3 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 |  |
| `targets/iziz-style/91z-views.js` | 0.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/iziz-variants/89z-rows.js` | 2.2 | [draw] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `targets/iziz-variants/91z-views.js` | 0.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/kit/89z-rows.js` | 14.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/kit/91z-views.js` | 11.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/launch/89z-rows.js` | 1.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/launch/91z-views.js` | 10.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/ledge/89z-rows.js` | 1.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/ledge/91z-views.js` | 4.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/lighthouse/89z-rows.js` | 0.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/lighthouse/91z-views.js` | 2.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/monolith/89z-rows.js` | 0.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/monolith/91z-views.js` | 3.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/plymouth/89z-rows.js` | 1.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/plymouth/91z-views.js` | 5.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/ring/89z-rows.js` | 1.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/ring/91z-views.js` | 8.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/skyi/89z-rows.js` | 0.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/skyi/91z-views.js` | 3.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/skyj/89z-rows.js` | 0.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/skyj/91z-views.js` | 2.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/skyk/89z-rows.js` | 0.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/skyk/91z-views.js` | 1.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/spaceport/89z-rows.js` | 0.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/spaceport/91z-views.js` | 1.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/spire/89z-rows.js` | 1.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/spire/91z-views.js` | 2.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/theodiga/89z-rows.js` | 0.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/theodiga/91z-views.js` | 0.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/trigon/89z-rows.js` | 1.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/trigon/91z-views.js` | 3.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/veladiga/89z-rows.js` | 0.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/veladiga/91z-views.js` | 0.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/wheel/89z-rows.js` | 1.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/wheel/91z-views.js` | 5.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/wing/89z-rows.js` | 0.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/wing/91z-views.js` | 3.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/worn/89z-rows.js` | 2.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/worn/91z-views.js` | 8.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/yuni-variants/89z-rows.js` | 1.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/yuni-variants/91z-views.js` | 1.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |

## Notes

(none yet: the split lists and the overrides go here)
