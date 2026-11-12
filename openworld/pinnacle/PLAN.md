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
| `core/hamlet`, `core/city` | the four clearings (the sim's S7: the spec's `beast-rider` row, drawn in the Beast Riders kit through 88s); core/city's primitives under them |

Not taken, each with its reason:

| Module | Reason |
|---|---|
| `core/simulation` | the page does not run the sim: Pinnacle Rock's year runs on core/region's valley host from this plan (`settlements/pinnacle-rock/src/15-pr-tune.js`, `tests/test-pr-economy.js`), its ventures on these links (core/world 48t KTRAVEL, core/camp 60) |
| `core/mask` | nothing is placed from a mask |
| `core/host` | the world has its own camera and probe (`core/world` 90, 91), as the isle demo's does |

## What is left

1. **The mesa in the world.** The rock is the page's own landform, built from KSTACKS records out of its layout
   (`settlements/pinnacle-rock/src/40-pr-layout.js`). The world shows the knoll the model has, with the bands round it.
   Either draw the rock's records here, or carve the mesa into the land (core/terrain).
2. **The countryside farther out**: the four clearings are planned (S7); ranching hamlets and the roads between them
   are not. The `beast-rider` row lives in this spec until a second region takes it into core/hamlet.
3. **The bands in the page.** Their year runs in node on this plan (`settlements/pinnacle-rock/tests/test-pr-economy.js`);
   the page draws their camps but does not run the sim.
4. **The savannah kit's world fragment** moves into `biomes/abyssal-savannah`, with its floor (`WORLD_FLOOR`).
5. **The planner page** for the region (`openworld/PLAN-SITES.md` section 4).
6. **The links' own culture.** The Izani highways take the Iziz Vernacular's stops and the Beast Rider trails the Beast
   Riders kit's; the bridges are Iziz's everywhere. The coyotemen and the Dasri have no kit, so the Beast Riders' posts stand
   in on their roads.
7. **The corridors east of the rock grow nothing.** The crater's east wall, the Nomad Country's sedesert and the Tiers by
   Coyote Canyon have no kit in the registry.
8. **The Dasri's northern village** (PROPOSAL-LONGSONG-PINNACLE.md section 6): when it is placed, the Shade road gains a
   nearer end (a link to it, or Shade's road rerouted by it).

## The corridors (2026-11-11)

The owner kept the 60 km cut for the rock; the sim's land logistics (S5) need its far legs laid. The cut gained the
partners' squares and a 10 km corridor along each road (`openworld/SITES.json`, `cut_site.py`'s `net` and `guide`), and
the spec its links (`src/48-world-site.js`). The frame's origin moved from the rock's pixel to the box's centre.
