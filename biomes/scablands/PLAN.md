# The scablands: an overlay (plan)

The second of the north basin's two **overlays** (`biomes/nsemiarid/PLAN.md`, sections 3, 4 and 6; the other is
`biomes/dambasins`): the ground the dam break's flood tore down and is gone from. An overlay owns no ground: it lies over
the biome that is there (n semiarid; the flood lake's dry bed lies over NW lowlands too), shapes the land after the
biome's own detail, writes the fields the biome kits read, places its own objects, and has only the flora that means
nothing without it. Its weight comes from physics: the ground under the flood's water surface along `DATA.floods`.

## 1. What it is made of

| part | where it comes from | state |
|---|---|---|
| the channels' landforms: the scoured floor, butte-and-basin cut in steps of the basalt flows, dry falls and their plunge basins, potholes (kolks), bars with giant current ripples, streamlined loess islands | `core/terrain/41-core-scour.js` (`KSCOUR`), with its node test; a station's scales (`islandL`, `islandW`, `fan`) added 2026-10-23 | **built** |
| the rock the flood cut: flood basalt in flows 15 to 50 m thick (columns at a flow's foot, the hackly entablature over them, a red interbed on top) over sandstone and limestone; loess over all | `KSCOUR.strata` | **built** |
| the coulee itself (its walls stepped by the flows, the dry falls' horseshoe cliff) | the station's stage: in the open world the scale model's heights hold the channel at 4 km, so `KSCOUR.land` adds only what lies under a cell |**built** (2026-10-23) |
| the flora | the n semiarid kit, read in place; its zones read the fields (`rock`, `scour`, `slope`, `wet`): scoured basalt is near bare, the loess islands keep the steppe |**built** (2026-10-23) |
| the water: the plunge-pool lake under the falls (Dry Falls Lake), potholes holding rain | `core/water` still records |**built** (2026-10-23) |
| erratics: dam concrete with rebar, carried kilometres; basalt boulders | this build (`ERRATICS` in the stage, `87-host-erratics.js`; its own library pack) | **built** (2026-10-23) |
| its own flora: the pothole pools' plants (kolk lilies, pothole quills, seep sedge, spray ferns at the falls' foot) | this build (`72-biome-scablands-pools.js`, its own kit registry and pack) | **built** (2026-10-23) |
| the flood lake's high line and its rafted wreckage (station 2, over NW lowlands) | | later |

## 2. The engine

**The n semiarid kit is the engine**, read in place the way the dam bed reads the Ancient Port kit: `build.py` imports
`biomes/nsemiarid/build.py` and calls its `build(overlay=...)` with this folder's `src/` (which shadows the kit's
fragments by name and adds its own) and `core/terrain/41-core-scour.js`. Its pack of library textures is the kit's.

For that, n semiarid's page was split (2026-10-23) along the line a stage crosses:

- `45-host-scene.js`: the renderer, scene, haze, camera, lights, ticks, registry (the page's, any stage's);
- `45b-host-stage.js`: **the stage** (its map, terrain, water, fields, the biome binding, `STAGE_WATER`, `STAGE_GROUND`);
  this build's own `45b` is the station;
- `45c-host-ground.js`: the painted ground for any stage (its hooks: `STAGE_GROUND.rows`, a channel the mesh snaps to,
  and `STAGE_GROUND.tint`, an overlay's tint over the palette);
- `98-host-checks.js`: the kit's checks and inspector (`HCHK`), naming no place;
- `99-host-take.js`: the stage's views, its list of checks, and the page handed to `core/host`; this build's own `99`.

## 3. Stations

1. **`coulee`: a coulee and dry falls on the west breach** (over n semiarid). The west breach falls 417 m in 216 km;
   KSCOUR finds its dry fall at km 205 (110 m, where it meets the trough). The station is that reach in small (6.6 km
   square): the channel floor 2 km wide running north, scoured to butte-and-basin and potholes upstream; the dry falls,
   a horseshoe cliff ~107 m high across the coulee, with its plunge-pool lake; the lower coulee 260 m deep under the
   plateau, bars and giant current ripples on its margins, a loess island standing in it like Steamboat Rock; the
   plateau's steppe above the rims.
2. **`highline`: the flood lake's high line over NW lowlands** (later).

## 4. Order of work

- **S0** the split of n semiarid's page; the build; the coulee station (terrain, water, fields, tint, views); the checks.
- **S1** erratics; the pothole pools' own flora.
- **S2** the second station (needs NW lowlands' rock zone and bed response: `biomes/nsemiarid/PLAN.md` section 8).
- **S3** `WORLD_OVERLAYS` in the north-basin open world.

## 5. Checks (`verify.py --assert`: n semiarid's harness, on this page)

The kit's own checks that apply here (every species tagged, nothing drowned, no tree on a rock face, the wind and the
seeds, the variants), and the station's:

- **the falls**: a cliff across the coulee at KSCOUR's fall, its foot at least 90 m under its lip, the lip's horseshoe
  bowed upstream; the plunge lake at its foot;
- **the coulee's walls stepped by the flows**: benches on the walls at the strata's flow tops, more than chance;
- **the scour bare of trees**: the kit's trees and shrubs thinner on scoured rock than on the plateau's steppe (its small
  plants and stones it heaps on rock by design: reported, not judged);
- **the erratics sunk in the floor**: every one in the ground and out of it, none in the water, all on the coulee's floor;
- **the pools' flora in its places**: lilies on their pool's water, quills on the waterline, ferns at the falls' foot;
- **the water held**: the plunge lake's and every pothole pool's shore over its level all round;
- each with a broken input that must fail.
