# Pinnacle: the plan

`openworld/PLAN-SITES.md` is the plan for every site. This file says what this region takes and what is left.

## Core adoption

| Module | Use here |
|---|---|
| `core/world` | the runtime: the land, roads, terrain, water, flora, floor, camera and probe; the rasters as PNGs decoded in the page (`98-world-start.js`; since the corridors, in `dist/pinnacle.land.js`); `KSITES` and `bake_sites.py` (the site's plan and its links); `42b`, `88b` (the links' bridges); `88s` (its drawing) |
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
6. **The links' own culture.** The stops are the Iziz Vernacular's, and the bridges Iziz's. The Beast Rider trails
   (Talon, Mav's Refuge) and the far roads (Coyote Canyon, Shade) want their builders' own inns: the Beast Riders' roadside
   inn (`br_bldg_riders_inn`) once core/world 88s draws a stop from that kit; the coyotemen and the Dasri have no kit.
7. **The corridors east of the rock grow nothing.** The crater's east wall, the Nomad Country's sedesert and the Tiers by
   Coyote Canyon have no kit in the registry.
8. **The Dasri's northern village** (PROPOSAL-LONGSONG-PINNACLE.md section 6): when it is placed, the Shade road gains a
   nearer end (a link to it, or Shade's road rerouted by it).

## The corridors (2026-11-11)

The owner kept the 60 km cut for the rock; the sim's land logistics (S5) need its far legs laid. The cut gained the
partners' squares and a 10 km corridor along each road (`openworld/SITES.json`, `cut_site.py`'s `net` and `guide`), and
the spec its links (`src/48-world-site.js`). The frame's origin moved from the rock's pixel to the box's centre.
