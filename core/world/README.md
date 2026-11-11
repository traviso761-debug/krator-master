# core/world: the open world's runtime

The scale model's land at 1:1, streamed, with the biome kits' flora on it. This is one copy that every open-world region
(`openworld/<region>`) and every settlement placed on the map reads in place. It became a core module on 2026-11-09, at
the owner's word (`openworld/PLAN-SITES.md`, "The owner's answers"). It was moved unchanged from
`openworld/isle-demo/src/world/`, which had taken it from the retired `openworld/little-demo` in October 2026. Every
page that reads it came out byte-identical after the move.

| Fragment | Tag | What |
|---|---|---|
| `00-head.html` | [web] | the page shell; a region's `build.py` swaps in its title and caption |
| `41-world-fields.js` | [G data] | `WORLD`: the region's rasters decoded into the land. It holds:<ul><li>`WORLD.H(x, z, minWave)`: the model's heights, synthesized relief, scarps, river channels and `landHook`;</li><li>the water (`water`, `lakeWater`, `riverWater`);</li><li>the fields every kit reads (`at`, `fieldsFrom`);</li><li>`townW`, `clearHook`, the climate's colour.</li></ul> |
| `42-world-roads.js` | [G data] | `ROADS`: least-cost routing on the land at a held grade; the carriageway shaped into the ground |
| `45-world-host.js` | [web] | the renderer, scene and frame loop the world draws into |
| `80-world-sky.js` | [G native] | the sky and light |
| `81-world-terrain.js` | [web] | the terrain tiles (the land drawn, coloured by `WORLD.ground`) |
| `83-world-water.js` | [G data] | the water levels |
| `83w-world-seas.js` | [web] | the seas and lakes drawn |
| `84-world-nursery.js` | [web] | each kit's species grown as variants (`KIT.make`, `KIT.grow`) |
| `85-world-flora.js` | [web] | the flora tile by tile, seeded by cell with `KRAND.hash` (the same tile in any order) |
| `86-world-floor.js` | [web] | the kits' floor patches under the zones |
| `87-world-places.js`, `88-world-towns.js` | [web] | the "Go to" list and the scale model's settlement markers |
| `90-world-camera.js` | [web] | the camera |
| `91-world-probe.js` | [web] | the camera, the probe and its checks (`_api.hostChecks`: order-free seeding, land continuous, nothing in water, spacing across tiles, roads, towns, no NaN) |
| `98-world-start.js`, `99-tail.html` | [web] | start-up and the page's tail |

**Who reads it:**
- `openworld/isle-demo/build.py`: all of it (`WORLD_SRC`);
- `settlements/isle-demo/build.py` (the site planner and the city page): `41`, `42`;
- `settlements/pinnacle-rock/build.py` and `settlements/longsong/build.py`: `41`.

A new region's build lists it the same way.

**How a region uses it.** A region supplies:
- its data: `region.json` and the rasters, written by `tools/scale-model/extract_region.py`;
- its fields (the isle demo's `43-world-isles.js`);
- its config (`46`: the settlements, "Go to", views);
- its kits (`47`).

Settlements change the land only through `WORLD.landHook` (ground deltas, eased at their edge) and keep the flora off
through `WORLD.clearHook`. `openworld/PLAN-SITES.md` section 3 has the plan.

**Sites** (`48s` plans, `bake_sites.py` bakes, `88s` draws): a region's `SITE_SPEC` names camps (core/camp, the Beast
Riders' `BR_CAMP`), hamlets (core/hamlet: a row's `kit` picks the drawing, `88s` `VK`: `xanadu` through `XAK`, `iziz`
through the isle demo's `IZV` bundle and its instancer) and roads, joined or not, and `links` between its towns (`keep`: routed in hops inside the polygon, off rivers' beds; `stops`: an inn every
`every` m of road and a rest stop between, drawn as one-building villages; a stop with no ground is a `gap`). The bake
reads the kits' declared boxes from their source (`ASSET`, `XA.def`, `VERN.def`); a new village kit adds its records
there and an entry in `VK`.

**Known debt, moved with it** (from `tools/core_use_baseline.json` and `check_source_baseline.json`, where these were
the isle demo's):
- `98-world-start.js` reads canvas pixels once (`getImageData`), to decode the rasters, not for placement;
- `91-world-probe.js` writes its own PRNG for the probe's samples;
- `80-world-sky.js` draws its own sky dome, not core/atmos's standard skybox;
- numeric defaults written with `||` in `41`, `84`, `85` and `88`.

**Next** (`openworld/PLAN-SITES.md` section 6):
- `WORLD.H`'s land rule becomes core/terrain `KLAND` (Hook's lift on `claude/silly-hawking-929a87`, redone from this
  copy);
- the planners' generic steps (sample the land into a settlement's grid, hand the ground back) move here or into
  core/city.

**Godot:** `41`, `42` and `83` are the data the port takes. The rest is the preview's drawing, which Godot does
natively (`GODOT-PLAN.md` Phase 7, M7).
