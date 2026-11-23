# biomes/shroudhills: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 20 (13%) | 0 (0%) | 0 (0%) | 33 (21%) | 101 (66%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/20-shroudhills-defs.js` | 16.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | pure zone, Sister-Cup, Root-Hammock, Drum-Gall and Shroud-Ant physics; runs in node |
| `src/28-vstack-mipvar.js` | 1.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/30-shroudhills-mats.js` | 25.4 | [draw] | 0 | 1 | 0 | 0 | 0 | 17 | 3 | 0 | 0 | 0 | 0 | library material bindings, wind/chitin hooks, 3D geometries and BIO.def items |
| `src/44z-host-shell.js` | 2.0 | [web] | 9 | 0 | 3 | 1 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | renderer, scene, lights, error panel |
| `src/45-host-stage.js` | 6.2 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | default station 1 (cove) landform and STAGE |
| `src/46-vstack.js` | 0.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/47-host-land.js` | 11.9 | [draw] | 14 | 1 | 0 | 0 | 2 | 8 | 5 | 0 | 0 | 0 | 0 | KSTRATA, 5-layer KGROUND, 14 km KFAR and KHORIZON |
| `src/54-shroudhills-trees.js` | 22.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 7 | 0 | 0 | 0 | 0 | 0 | Buttressed Shroud-Mahogany, Weeping Amber-Podocarp, Ravine Tree-Fern and 34 impostors |
| `src/55-shroudhills-epiphytes.js` | 20.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | Sister-Cups, KSPACE Root-Hammocks, Drum-Galls, Shroud-Ants, Smudge-Myrtle and Cloak-Tors |
| `src/70-shroudhills-build.js` | 1.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | public BIOME-API build surface |
| `src/86-host-works.js` | 8.2 | [draw] | 23 | 1 | 0 | 0 | 0 | 18 | 0 | 0 | 0 | 0 | 0 | Yonni YC1 watch-drum plinth, smudge-cairns, braziers and coal-seam outcrops |
| `src/88-host-scene.js` | 2.1 | [web] | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | build orchestration, impostor bake and KSHADOW |
| `src/89a-host-atmos.js` | 0.4 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | ATMOS.bindHost |
| `src/89s-host-sky.js` | 2.0 | [web] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | ATMOS.sky at station 5.1 pixel and cloudShade |
| `src/89t-host-weather.js` | 1.9 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | wind, A2C, heightFog, fogBelt, rainCover, smudge smoke and weather |
| `src/89w-host-water.js` | 6.1 | [draw] | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | cove WATER.open, ravine WATER.flow, tarn and batched Sister-Cup WATER.still lenses |
| `src/89z9-vstack-post.js` | 6.1 | [draw] | 2 | 4 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | canvas painters: TEX.def or bake |
| `src/99-host-take.js` | 16.7 | [web] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | preset views, inspector, invariants and KHOST.take |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

- `src/20-shroudhills-defs.js` and `src/70-shroudhills-build.js` are engine-neutral `[G data]`: all species records, `KRAND` Sister-Cup reservoir calculations, `KSPACE` catenary Root-Hammock neighbor pairing, and `Khroma-Mira` Shroud-Ant territory/rattle state rules run standalone in Node (`tests/test-shroudhills.js`) and port directly to GDScript.
- Stations `canopy` (`stations/canopy/45-host-stage.js`) and `cloaktor` (`stations/cloaktor/45-host-stage.js`) swap only `45-host-stage.js` (`[web]`), sharing all `[G data]` and `[draw]` kit fragments unchanged.
