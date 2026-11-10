# Pinnacle: the plan

`openworld/PLAN-SITES.md` is the plan for every site. This file says what this region takes and what is left.

## Core adoption

| Module | Use here |
|---|---|
| `core/world` | the runtime: the land, roads, terrain, water, flora, floor, camera and probe; `world_data.py` (the rasters decoded at build time: no canvas read); `KSITES` and `bake_sites.py` (the site's plan); `88s` (its drawing) |
| `core/rand` | every seed (the flora by cell, the camps' bands, the hedges' runs) |
| `core/space` | the camps' boxes (`KCAMP.pitch`) |
| `core/tags` | every camp, tent, pen and hedge registered before it is drawn (build `pinnacle:sites`) |
| `core/camp` | the bands' camps (`KCAMP.pitch`, `KCAMP.census`) |
| `core/biome` | the kits' trees and placement |
| `core/terrain` | the relief noise under `WORLD.H` (`KRELIEF`) |
| `core/atmos` | the sky and air, as the isle demo's world page takes them |
| `core/water` | the rivers and lakes |
| `core/materials` | the kits' library packs |
| `core/clock`, `core/shader` | the world's clock; the shader hooks |

Not taken, each with its reason:

| Module | Reason |
|---|---|
| `core/city` | no town is planned here: the town on the mesa is `settlements/pinnacle-rock`'s own |
| `core/hamlet` | no Beast Rider hamlet row yet (`KHAMLET.CULTURES` has the Islanders' and Xanadu's) |
| `core/simulation` | the bands are not declared on the sim yet (the isle demo's camp is: `48k simDeclare`, to be lifted with the next site) |
| `core/mask` | nothing is placed from a mask |
| `core/host` | the world has its own camera and probe (`core/world` 90, 91), as the isle demo's does |

## What is left

1. **The mesa in the world.** The rock is the page's own landform, built from KSTACKS records out of its layout
   (`settlements/pinnacle-rock/src/40-pr-layout.js`). The world shows the knoll the model has, with the bands round it.
   Either draw the rock's records here, or carve the mesa into the land (core/terrain).
2. **The countryside farther out**, when a Beast Rider hamlet row exists: farming and ranching hamlets
   (`core/hamlet`, busy-keller's hinterland survey, lifted into core), and the roads between them.
3. **The bands on core/simulation** (the isle demo's `48k simDeclare`, lifted into `core/world` or `core/camp`).
4. **The savannah kit's world fragment** moves into `biomes/abyssal-savannah`, with its floor (`WORLD_FLOOR`).
5. **The planner page** for the region (`openworld/PLAN-SITES.md` section 4).
