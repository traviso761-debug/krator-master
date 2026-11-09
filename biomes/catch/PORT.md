# biomes/catch: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 1 (1%) | 0 (0%) | 0 (0%) | 54 (53%) | 48 (46%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/45-host-scene.js` | 9.9 | [web] | 10 | 0 | 3 | 1 | 1 | 2 | 0 | 3 | 0 | 0 | 0 | renderer, lights, helpers, fieldCache, bindStage, makePool, the camps |
| `src/45b-host-stage.js` | 11.3 | [web] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | station 1: the land, fields, STAGE (split: the landform and fields are data inside host code) |
| `src/45c-host-ground.js` | 8.5 | [draw] | 10 | 0 | 0 | 0 | 0 | 2 | 5 | 0 | 0 | 0 | 0 | the painted ground and its library layers |
| `src/46-host-rock.js` | 3.4 | [draw] | 6 | 0 | 0 | 0 | 0 | 2 | 0 | 1 | 0 | 0 | 0 | KSTACKS meshes, the camps drawn |
| `src/49z-host-sed-end.js` | 0.4 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | closes the sedesert registry |
| `src/50-biome-catch-species.js` | 15.2 | [draw] | 0 | 2 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | split: data (species, plants, oases) with the kit's items and materials |
| `src/55-biome-catch-trees.js` | 12.1 | [draw] | 0 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 | split: placement data with the builders |
| `src/60-biome-catch-floor.js` | 4.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: placement data with BIO.put |
| `src/70-biome-catch.js` | 0.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/80-host-stalkers.js` | 2.3 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the Stalker pair from the kits/mechs bundle |
| `src/88-host-build.js` | 4.2 | [web] | 1 | 0 | 0 | 0 | 2 | 1 | 0 | 0 | 0 | 0 | 0 | the build order |
| `src/89a-host-atmos.js` | 1.4 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | ATMOS.bindHost, the wind, the dust |
| `src/89s-host-sky.js` | 3.4 | [web] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | ATMOS.sky at the site, with the ridges |
| `src/89w-host-water.js` | 1.5 | [draw] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | core/water drawn |
| `src/89x-host-weather.js` | 0.6 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | ATMOS.bindWeather |
| `src/89y-host-storm.js` | 2.3 | [web] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the black storm composed from core/atmos (goes when core/atmos has a dust mode) |
| `src/89zz-host-core.js` | 7.7 | [web] | 1 | 0 | 0 | 0 | 2 | 0 | 3 | 0 | 0 | 0 | 0 |  |
| `src/98z-host-mirror.js` | 1.4 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the reflections switch: the renderer, scene and panel through WATER.mirrorSwitch |
| `src/99-host-take.js` | 10.0 | [web] | 3 | 0 | 0 | 0 | 0 | 1 | 0 | 2 | 0 | 0 | 0 | views, inspector, checks, KHOST.take |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

- The kit (`CATCH`) is the core biome kit's shape (species, trees, floor, build), as Korona's: its placement is seeded per cell (`CATCH.place`, KRAND) and its records are core/tags', so the export carries them. The stations' landforms (KBASIN, KSTACKS, the dunes, the fan) are plain functions of (x, z) on core/rand's noise (`KRAND.fbm`) and port as they are; they sit in host fragments today (split).
