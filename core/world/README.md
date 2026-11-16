# core/world: the open world's runtime

The scale model's land at 1:1, streamed, with the biome kits' flora on it. This is one copy that every open-world region
(`openworld/<region>`) and every settlement placed on the map reads in place. It became a core module on 2026-11-09, at
the owner's word (`openworld/PLAN-SITES.md`, "The owner's answers"). It was moved unchanged from
`openworld/isle-demo/src/world/`, which had taken it from the retired `openworld/little-demo` in October 2026. Every
page that reads it came out byte-identical after the move.

| Fragment | Tag | What |
|---|---|---|
| `00-head.html` | [web] | the page shell; a region's `build.py` swaps in its title and caption |
| `40-world-smooth.js` | [G data] | `WSMOOTH`: the smoothing that takes the scale model's linear artifacts out of the land ("Smoothing" below): `heights` (along the contours, at the cut), `river` and `line` (the curves a smoothed region carves). A smoothed region's build lists it before `41` |
| `43-world-relief.js` | [G data] | `WRELIEF`: the land below the model's 2 km (`PLAN-RELIEF.md`). So far: terraces only on caprock (`bench`, P1) and the erosion filter (`erode`, P2); every overlay's style is `41`'s `BIOME_GROUND`. A region with region.json `relief` lists it before `41` |
| `44-world-streams.js` | [G data] | `WSTREAMS`: the small streams (`PLAN-RELIEF.md` P3): `trace` (the network on a grid, run by `bake_streams.py` after the cut), `decode`, `rebed`, `check`. A region whose region.json has `streams` lists it before `41`, which carves them (`WORLD.streams`, `streamAt`, `streamWater`) |
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
| `48s-world-sites.js`, `88s-world-sites.js` | [G data], [web] | `KSITES`: a region's sites planned (camps, hamlets, roads, links and their stops); drawn |
| `42b-world-bridges.js`, `88b-world-bridges.js` | [G data], [draw] | `BRIDGES`: where a laid road crosses a named river, a span of deck the ground is not shaped under, so the river runs on (a BRIDGE record: slab, arch, a row of arches or a viaduct, by its length and height; its piers; its builders' culture); drawn in stone, tagged, checked (`_bridges.checks`) |
| `49r-world-resources.js` | [G data] | `WRES`: the region's resources. The scale model's geology (`kits/resources/data/geology.json`, cropped to the region by `world_data.geology_crop`, read through `KRES`) and farmland from the world's fields: `census`, `markers` (the richest mining, farmland and unique spots), `layers`, `assess(x, z, reach)` |
| `89r-world-resources-map.js` | [web] | the "resources" panel: the census table, a map of any layer with the markers, the markers' list and beacons; the markers join `MAP_MARKS` ("Go to", the minimap) and the layers `MAP_LAYERS` (the minimap's overlays) |
| `90-world-camera.js` | [web] | the camera, the minimap (its overlays: Köppen, biome regions, a page's `MAP_LAYERS`), "Go to", the inspector, the polygon tool, `pick` |
| `91-world-probe.js` | [web] | the camera, the probe and its checks (`_api.hostChecks`: order-free seeding, land continuous, nothing in water, spacing across tiles, roads, towns, no NaN) |
| `93-world-propose.js` | [web] | "propose": place a new site on the ground or the minimap, name and type it, see its ground and resources (`WRES.assess`), keep it, export it or send it to the edit queue; `tools/scale-model/propose_site.py` takes it into `openworld/SITES.json` and the scale model |
| `98-world-start.js`, `99-tail.html` | [web] | start-up and the page's tail |

**Resources and proposals in a region's build:** list `('resgeo', 'geology')` (a generated fragment:
`world_data.geology_fragment(DATA)`), `world_data.RES_FRAGS` (kits/resources' `42r`, `45r`), `49r` and `89r` before
`90`, and `93` after `91`; its verify calls `verify_world.resources(pg, V, out, fails)` (the census and markers, the
proposal tool, each with a negative, and a shot of the panel). `python3 core/world/bake_sites.py <region> --resources`
writes the census and markers to `plan/resources.json` (what Godot reads).

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

**Bridges** (2026-11-11; `42b` plans, `88b` draws; `tools/tests/test_bridges.py`). A region opts in with
`SITE_SPEC.bridges` (`true` or the planner's options: `{culture, clear, approach, ...}`). Every road and link it lays is
then bridged where it crosses a named river:
- The stretch over the water and an approach each side become a SPAN. 41 keeps its distance (the flora keeps off) but
  neither shapes nor paints the ground under it. The approach is long enough that the bank off the last laid segment
  cannot reach down into the channel.
- The road's height over the span is a deck that clears the water by 4 m. The grade is re-held up its approaches.
- A bridged region's links may cross a river's band. The router's own price on water (40 times its length) makes them
  cross square.
- A via point whose two hops double back on each other is dropped.
- A link can follow a line rather than the straight one: `guide` (5.1 px, the spec's own) or `net` (a route of the
  Ancient network, `openworld/network-proposal/net51.json`, fed in by `world_data.net_fragment`).

The plan gains `bridges` and each bridged road its `spans`. The probe judges a deck's grade, not its height over the
ground. A region that does not ask plans exactly as before.

**Known debt, moved with it** (from `tools/core_use_baseline.json` and `check_source_baseline.json`, where these were
the isle demo's):
- `98-world-start.js` reads canvas pixels once (`getImageData`), to decode the rasters, not for placement;
- `91-world-probe.js` writes its own PRNG for the probe's samples;
- `80-world-sky.js` draws its own sky dome, not core/atmos's standard skybox;
- numeric defaults written with `||` in `41`, `84`, `85` and `88`.

## Smoothing

The owner, 2026-11-11, on a census map's hillshade of `openworld/xanadu-oidong-highrift`: "we might need a world module to
smooth over linear artifacts". Seen at the height grid's own resolution (`python3 core/world/hillshade.py <region>`), the
land had three kinds, each traced to its source:

| Artifact | Where it came from | The fix |
|---|---|---|
| **Staircases** along scarps and ridges | The model's 2 km pixels: a diagonal scarp is a run of pixel steps, and the cut's cubic upsample keeps them | The cut smooths the upsampled heights **along their contours** (`WSMOOTH.heights`) before its synthesis, so the synthesis's ledges follow clean contours. The scarps' levels (`scarpl`, `scarpu`) are upsampled by the B-spline, not bilinearly, so their 4 km seams go too |
| **Streaks** along the rows and columns | The cut clamped its cubic to the bilinear interpolation of 3x3 min and max boxes, whose squares and seams show; the model's own rows show through a cubic | The cut upsamples by the cubic B-spline, which cannot overshoot, so it needs no clamp; streaks across a slope's contours are smoothed with the stairs |
| **Ruler-straight river cuts** | The cut carved each river's trench along its polyline's straight 2 km runs, rounded to cells (dashed trenches at 500 m). The page carved along every fourth vertex (8 km) after two Chaikin passes. The model's traced rivers (`px` with `q_m3s`) are themselves D8 paths in axis and diagonal moves | Both carve along `WSMOOTH.river`: a centripetal Catmull-Rom through every vertex, with a traced river's zigzag relaxed first (one 1-2-1 pass, at most 400 m) and a little seeded meander (about its width, zero at every vertex). The page carves a smoothed region's rivers unwarped, so they lie on their curve through the model's vertices, not up to 250 m off (the offset seen at Longsong). The D8 drainage lines are relaxed into curves (`WSMOOTH.line`) |

**How the heights are smoothed.** A pass takes the structure tensor (Gaussians, the only kernel both separable and
round): at every cell the contour's direction and how sure it is. The new height is the weighted mean of the heights down
the streamline through the cell, followed both ways for 4 model pixels and bending with the contour, and blended in by
coherence. Across a contour nothing moves, so a cliff keeps its profile, and nothing is aligned to the grid, so there is
no axis or 45-degree bias. Two passes, at 3 model pixels' integration scale; about 1 s for 50,000 cells, about 15 s for a
million. A plain blur strong enough to fill the stairs widens a scarp by 70 %; this widens it by under 2 %.
`node core/world/test-smooth.js` proves it on synthetic land. Each check has a negative:
- a staircase is filled at every angle, and the staircase itself fails that check;
- the profile is kept, and the blur fails that check;
- a smooth scarp moves equally little at 24 angles;
- streaks across a slope go;
- a peak stays;
- the curves pass through their vertices with no corners, and the meander is seeded and the same in any cut.

**What it does not do.** A streak running *along* the contours reads as a terrace, so it stays. Lakes keep the model's
2 km masks: where the land round a lake lies under its level (pinnacle's), only the mask draws the shore. A follow-up
would draw shores from a finer source.

**Turning it on.** A region opts in with `"smooth": true` in `openworld/SITES.json`. Then:
1. `tools/scale-model/cut_site.py` passes `--smooth` to `extract_region.py`, which runs the JS in node
   (`core/world/smooth.py`), keeps every river vertex in region.json (two past the box at each end), and writes
   region.json's `smooth` record. A cut of 1.5 cells a model pixel or coarser is left alone (isle-demo, north-basin).
2. `41` reads the `smooth` record, and throws if `40` is not on the page. `WORLD.riverCourse()` gives each named
   river's carved line. The probe's river check (`91`) puts a smoothed river's stations on that line, since a curve
   can pass more than the 500 m it searches from a long chord's middle (593 m on the Rīfar al-Jadwal).
3. The region's `build.py` lists `40` before `41`. `core/world/bake_sites.py` always loads it.
4. Re-bake (`bake_sites.py <region>`, `--resources`), rebuild, GPU-verify.

Without the flag the cut is byte-identical to before (checked on pinnacle) and `41` takes the old path.

**Where it is on:**
- `openworld/pinnacle` (2026-11-12): re-cut, re-baked (its nine camps and tracks all stand), verified on the GPU.
- `openworld/oidong-highrift` (2026-11-12, after Longsong's move onto the Bīruk al-Ghaym): re-cut and re-baked. Its 23
  hamlets and 937 records are unchanged. It has 15 bridges where it had 18: the curved rivers cross three fewer roads.
  Longsong's pin stays on the south bank, 401 m from the river as the page draws it.

**Rollout to the other regions**, one region at a time, after the owner's word:

| Region | Cells | What it reaches | Notes |
|---|---|---|---|
| `xanadu-oidong-highrift` | 1789 x 589 at 1 km (2 a pixel) | its own page (Erehwon's and Qiblai's sites are in it) | Longsong and the valley moved to `oidong-highrift` (on now). Cut this one with the flag when Erehwon or Qiblai is next worked on; expect about 15 s of smoothing in the cut |
| `iziz-cluster` | 329 x 609 at 500 m | its own page | Girder, Mav's Refuge and Talia's ground. Re-bake its sites and check the corridors' roads |
| `isle-demo`, `north-basin` | 4 km cells (half a pixel) | `isle-demo`: its page and `settlements/isle-demo` | **Nothing to do.** Coarser than the model, so no stairs (the flag is ignored). `isle-demo`'s rivers could take `WSMOOTH.river` alone, but it is cut by hand, not by `cut_site.py` |

Each turn:
1. Re-cut the region without the flag first, to confirm it reproduces its committed data. A re-cut takes whatever the
   model holds now, such as pins moved since.
2. Cut it with the flag.
3. Run `hillshade.py` on the old and new `elev.png` with `--diff`.
4. Re-bake, rebuild what `tools/reach.py openworld/<region>/data/elev.png` lists, GPU-verify, and `port_baseline.py --update`
   the pages.

**Next** (`openworld/PLAN-SITES.md` section 6):
- `WORLD.H`'s land rule becomes core/terrain `KLAND` (Hook's lift on `claude/silly-hawking-929a87`, redone from this
  copy);
- the planners' generic steps (sample the land into a settlement's grid, hand the ground back) move here or into
  core/city.

**Godot:** `41`, `42` and `83` are the data the port takes. The rest is the preview's drawing, which Godot does
natively (`GODOT-PLAN.md` Phase 7, M7).
