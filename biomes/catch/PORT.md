# biomes/catch: port audit

*Written by hand on 2026-10-26 in the shape `tools/audit_port.py` writes (rerun it to fill the per-family counts; it keeps the Tag and Note cells).*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | - | - | - | - | - | - | - | - | - | - | - | page shell |
| `src/45-host-scene.js` | 9.4 | [web] | - | - | - | - | - | - | - | - | - | - | - | renderer, lights, helpers, fieldCache, bindStage, makePool, the camps |
| `src/45b-host-stage.js` | 11.1 | [web] | - | - | - | - | - | - | - | - | - | - | - | station 1: the land, fields, STAGE (split: the landform and fields are data inside host code) |
| `src/45c-host-ground.js` | 5.0 | [draw] | - | - | - | - | - | - | - | - | - | - | - | the painted ground and its library layers |
| `src/46-host-rock.js` | 3.3 | [draw] | - | - | - | - | - | - | - | - | - | - | - | KSTACKS meshes, the camps drawn |
| `src/49z-host-sed-end.js` | 0.4 | [web] | - | - | - | - | - | - | - | - | - | - | - | closes the sedesert registry |
| `src/50-biome-catch-species.js` | 15.2 | [draw] | - | - | - | - | - | - | - | - | - | - | - | split: data (species, plants, oases) with the kit's items and materials |
| `src/55-biome-catch-trees.js` | 10.0 | [draw] | - | - | - | - | - | - | - | - | - | - | - | split: placement data with the builders |
| `src/60-biome-catch-floor.js` | 4.4 | [draw] | - | - | - | - | - | - | - | - | - | - | - | split: placement data with BIO.put |
| `src/70-biome-catch.js` | 0.8 | [G data] | - | - | - | - | - | - | - | - | - | - | - | no three.js, no geometry, no DOM |
| `src/80-host-stalkers.js` | 1.4 | [draw] | - | - | - | - | - | - | - | - | - | - | - | the Stalker pair from the kits/mechs bundle |
| `src/88-host-build.js` | 2.2 | [web] | - | - | - | - | - | - | - | - | - | - | - | the build order |
| `src/89a-host-atmos.js` | 1.4 | [web] | - | - | - | - | - | - | - | - | - | - | - | ATMOS.bindHost, the wind, the dust |
| `src/89s-host-sky.js` | 2.3 | [web] | - | - | - | - | - | - | - | - | - | - | - | ATMOS.sky at the site, with the ridges |
| `src/89w-host-water.js` | 1.5 | [draw] | - | - | - | - | - | - | - | - | - | - | - | core/water drawn |
| `src/89x-host-weather.js` | 0.6 | [web] | - | - | - | - | - | - | - | - | - | - | - | ATMOS.bindWeather |
| `src/99-host-take.js` | 9.1 | [web] | - | - | - | - | - | - | - | - | - | - | - | views, inspector, checks, KHOST.take |
| `src/99-tail.html` | 0.0 | [web] | - | - | - | - | - | - | - | - | - | - | - | page shell |
| `stations/oasis/45b-host-stage.js` | 11.4 | [web] | - | - | - | - | - | - | - | - | - | - | - | station 2 (split as station 1's) |
| `stations/lake/45b-host-stage.js` | 10.9 | [web] | - | - | - | - | - | - | - | - | - | - | - | station 3 (split as station 1's) |
| `stations/fan/45b-host-stage.js` | 7.9 | [web] | - | - | - | - | - | - | - | - | - | - | - | station 4 (split as station 1's) |

## Notes

- The kit (`CATCH`) is the core biome kit's shape (species, trees, floor, build), as Korona's: its placement is seeded per cell (`CATCH.place`, KRAND) and its records are core/tags', so the export carries them. The stations' landforms (KBASIN, KSTACKS, the dunes, the fan) are plain functions of (x, z) on core/rand's noise (`KRAND.fbm`) and port as they are; they sit in host fragments today (split).
