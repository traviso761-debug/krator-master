# The Iziz cluster: the plan

`openworld/PLAN-SITES.md` is the plan for every site. This file says what this region takes and what is left.

## Core adoption

| Module | Use here |
|---|---|
| `core/world` | the runtime: the land, roads, terrain, water, flora, floor, camera and probe; the rasters as PNGs decoded in the page (`98-world-start.js`); `KSITES` and `bake_sites.py` (the sites' plan); `88s` (its drawing: camps and villages) |
| `core/rand` | every seed (the flora by cell, the camps' bands, the villages' houses, the hedges' runs) |
| `core/space` | the camps' and villages' boxes |
| `core/tags` | every camp, tent, pen, hedge, village and building registered before it is drawn |
| `core/camp` | the Beast Rider bands' camps round Mav's Refuge and Girder (`KCAMP.pitch`, `KCAMP.census`) |
| `core/hamlet` | Talia's villages (`KHAMLET.village`, the new `iziz` row: `21-hamlet-iziz.js`) |
| `core/city` | the hamlets' primitives (`33-city-strategies.js`, `15-city-ground.js`) |
| `core/biome` | the kits' trees and placement |
| `core/terrain` | the relief noise under `WORLD.H` (`KRELIEF`) |
| `core/atmos` | the sky and air |
| `core/water` | the rivers and lakes |
| `core/materials` | the kits' library packs, the Iziz pack the Vernacular draws with |
| `core/clock`, `core/shader` | the world's clock; the shader hooks |

Not taken, each with its reason:

| Module | Reason |
|---|---|
| `core/simulation` | the bands and villages are not declared on the sim yet (the isle demo's camp is: `48k simDeclare`) |
| `core/mask` | nothing is placed from a mask |
| `core/host` | the world has its own camera and probe (`core/world` 90, 91) |

## What is left

1. **Bridges.** The links are laid and the probe passes (every river station holds water), but where a link crosses a
   river the road rides it as a causeway (core/world 42). A bridge is a world piece still to make.
2. **Talia's own houses in its villages.** The Talei keep their own architecture (`kits/talia`); its villages are drawn
   with the Vernacular, the Empire's settlers' kit. Talia's kit has no bundle a world page can take yet.
3. **A shrine for the Vernacular** (`vern_shrine`, pending: a stand-in box in every village).
4. **The villages' names**: `core/hamlet` has no Izani name list (`tools/names/izani.py` names houses for the camps).
5. **The bands and villages on core/simulation**, and the towns' trade along the links.
6. **The savannah kit's world fragment** moves into `biomes/abyssal-savannah` (this region's and Pinnacle's `49` copy it).
7. **The overlay list in core** (`TODO.md`, "Ride along with the next all-builds rebuild"), then drop the shim in `47`.
