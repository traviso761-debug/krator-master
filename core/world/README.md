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
| `43-world-relief.js` | [G data] | `WRELIEF`: the land below the model's 2 km (`PLAN-RELIEF.md`). So far: terraces only on caprock (`bench`, P1), the erosion filter (`erode`, P2) and the peaks (`peaks`, P5: by the style's `peak` and 41's `PEAK` grid); every overlay's style is `41`'s `BIOME_GROUND`. A region with region.json `relief` lists it before `41` |
| `43b-world-landforms.js` | [G data] | `WLAND`: landform records (`PLAN-RELIEF.md` P4): KSTACKS bodies placed per 2 km cell by the land style (buttes on caprock, kopjes, inselbergs, hoodoos, towers; by overlay, the High Rift's tension fissures, carved) and a region's pins (`WLAND.pin`: Pinnacle's rock), folded into `H` from per-body rasters. A relief region lists `core/terrain/37-core-stacks.js` and it before `41`; its bakes read them through `world_data.py` `LAND_JS`, `PINS` |
| `44-world-streams.js` | [G data] | `WSTREAMS`: the small streams (`PLAN-RELIEF.md` P3): `trace` (the network on a grid, run by `bake_streams.py` after the cut), `decode`, `rebed`, `check`. A region whose region.json has `streams` lists it before `41`, which carves them (`WORLD.streams`, `streamAt`, `streamWater`) |
| `golden-relief.json` | data | the relief modules' golden vectors (`PLAN-RELIEF.md` P9: 40, 43, 44, 43b on fixed inputs, to 1e-6), checked by `test-golden-relief.js` (`--write` after a change meant to move the land): the bar a Godot port meets |
| `43m-world-micro.js`, `wmicro.gd`, `test-micro.js`, `PLAN-MICRO.md` | [G data] | `WMICRO`: the land a DEM shows below ~1 km (the owner, 2026-11-16, with the World Menagerie's DEM builds as the bar): hills by style (`hill`, gradient noise), the drainage (the erosion filter in six octaves 800 m to 25 m, replacing `WRELIEF.erode` in a relief region, flat floors), the grain by the slope. A relief region takes it by listing it after `43-world-relief.js` (`relief.micro: false` turns it off) |
| `wrelief.gd`, `wsmooth.gd`, `wstreams.gd`, `wland.gd`, `wrelief_test.gd` | GDScript | the twins of `43-world-relief.js`, `40-world-smooth.js`, `44-world-streams.js` and `43b-world-landforms.js` (on `core/terrain/kstacks.gd`) (`PLAN-RELIEF.md` P15), every key of `golden-relief.json` checked in Godot 4.7.2: copies in `godot/tests/relief/` (`godot/tools/sync_core.py`), `godot --headless --path godot --script res://tests/relief/wrelief_test.gd` |
| `41-world-fields.js` | [G data] | `WORLD`: the region's rasters decoded into the land. It holds:<ul><li>`WORLD.H(x, z, minWave)`: the model's heights, synthesized relief, scarps, river channels and `landHook`;</li><li>the water (`water`, `lakeWater`, `riverWater`);</li><li>the fields every kit reads (`at`, `fieldsFrom`);</li><li>`townW`, `clearHook`, the climate's colour.</li></ul> |
| `41t-world-town-water.js` | [G data] | `WTOWN`: a town's own water with its ground (WORLD_DATA.towns, `bake_towns.py`): inside its footprint the town's water mask decides the water (`lakeWater`, `waterBodyAt`), its water joins the model's body at its level (one body, the mask taking it in), its river is served by `riverWater`, the model river it joins is cut outside the band and led in by a carved link; `drawn: false` keeps 41 from sinking the ground 3 m. `WTOWN.check()`: the shore against the page's trace, the river, one body. Listed right after 41 |
| `41l-world-landforms.js` | [G data] | `WLAND`: the scale model's landform records under a cell (`DATA.landforms`, carried by `extract_region.py` into region.json) stamped at 1:1 through the land hook: island, islet, stack, shoal; water (edit_513's forms page, narrows and strait as one field: the bed set to the record's profile, the coarse wet cells beside closed to its width; river left to 41's named river) and shelf (the page's bed for the water it names); `WLAND.check()` |
| `42-world-roads.js` | [G data] | `ROADS`: least-cost routing on the land at a held grade; the carriageway shaped into the ground |
| `44c-world-coast.js` | [G data] | the coasts on core/coast (`KCOAST`, `core/coast/README.md`): at init each water body gets a coast field, `landHook` is chained (the coast's profile, sign-safe, then the region's own hook), each body's mask is redrawn from the field, the fields `coast`, `coastC`, `coast:<class>` join `WORLD.FIELDS`, `WORLD.ground` takes the coast's colour bands; a town's ground and a region's `WORLD.coastKeeps()` keep their coast; the region's sub-cell `landforms` (region.json, from the scale model's `model/data/landforms.json`) are stamped as islands by the body they stand in. `WORLD.coast` {list, at, stats, check}. Listed after the region's `43-*`, with core/mask (25, 27) and core/coast (30) before 41 |
| `45-world-host.js` | [web] | the renderer, scene and frame loop the world draws into |
| `80-world-sky.js` | [G native] | the sky and light |
| `81-world-terrain.js` | [web] | the terrain tiles (the land drawn, coloured by `WORLD.ground`). The ground reads its strata only where the rock's weight can move the colour (over 0.004, 2026-11-16): 3-5 ms of the Arc 140T's frame over land without rock |
| `83-world-water.js` | [G data] | the water levels |
| `83w-world-seas.js` | [web] | the seas and lakes drawn; with core/water/farbed listed, each body's far bed (no straight edge at the shore window) |
| `83s-world-streams.js` | [web] | a relief region's wet streams drawn: core/water flow ribbons built a kilometre piece at a time near the camera (`STREAMW`; `PLAN-RELIEF.md` P3). A build with streams lists it after `83w` |
| `88l-world-landforms.js` | [web] | a relief region's landform records in core/tags (class `feature`) and on the minimap (`PLAN-RELIEF.md` P10). A build with records lists it after `88s` |
| `84-world-nursery.js` | [web] | each kit's species grown as variants (`KIT.make`, `KIT.grow`) |
| `84i-world-impostors.js` | [web] | opt-in: a kit whose registry entry asks (`impostor: {lv, variants, grid, cell}`) draws its far level as the biome core's octahedral impostors (`core/biome/34`), baked once per species and variant from the tree the nursery grows at `lv`, written with the world's logarithmic depth. A region lists it after `84` (Pinnacle does, for the hyperjungle) |
| `85p-world-pregrow.js` | [web] | opt-in: every prototype the region's kits can ask the nursery for (species, variants, levels, saplings) queued at load behind the streaming's requests, so the loading curtain waits for them and no flight stalls on a kit's first tree. A region lists it after `85` (Pinnacle: 152 prototypes, 0.7 M triangles, under a second) |
| `85-world-flora.js` | [web] | the flora tile by tile, seeded by cell with `KRAND.hash` (the same tile in any order) |
| `86-world-floor.js` | [web] | the kits' floor patches under the zones |
| `87-world-places.js`, `88-world-towns.js` | [web] | the "Go to" list and the scale model's settlement markers |
| `48s-world-sites.js`, `88s-world-sites.js` | [G data], [web] | `KSITES`: a region's sites planned (camps, hamlets, roads, links and their stops, ways to a point); drawn |
| `42b-world-bridges.js`, `88b-world-bridges.js` | [G data], [draw] | `BRIDGES`: where a laid road crosses a named river, a span of deck the ground is not shaped under, so the river runs on (a BRIDGE record: slab, arch, a row of arches or a viaduct, by its length and height; its piers; its builders' culture); drawn in stone, tagged, checked (`_bridges.checks`) |
| `42k-world-caverns.js`, `88k-world-caverns.js` | [G data], [web] | `WTUBES`: a region's lava tubes (`SITE_SPEC.tubes`) planned as records under the ground and drawn with core/terrain's `KCAVERN` near the camera, the ground opened only at their portals and skylights; the walker (90's G) goes in and along them. Below, "Caverns" |
| `49r-world-resources.js` | [G data] | `WRES`: the region's resources. The scale model's geology (`kits/resources/data/geology.json`, cropped to the region by `world_data.geology_crop`, read through `KRES`) and farmland from the world's fields: `census`, `markers` (the richest mining, farmland and unique spots), `layers`, `assess(x, z, reach)` |
| `89r-world-resources-map.js` | [web] | the "resources" panel: the census table, a map of any layer with the markers, the markers' list and beacons; the markers join `MAP_MARKS` ("Go to", the minimap) and the layers `MAP_LAYERS` (the minimap's overlays) |
| `90-world-camera.js` | [web] | the camera, the minimap (its overlays: Köppen, biome regions, a page's `MAP_LAYERS`), "Go to", the inspector, the polygon tool, `pick` |
| `91-world-probe.js` | [web] | the camera, the probe and its checks (`_api.hostChecks`: order-free seeding, land continuous, nothing in water, spacing across tiles, roads, towns, no NaN) |
| `93-world-propose.js` | [web] | "propose": place a new site on the ground or the minimap, name and type it, see its ground and resources (`WRES.assess`), keep it, export it or send it to the edit queue; `tools/scale-model/propose_site.py` takes it into `openworld/SITES.json` and the scale model |
| `94-world-export.js` | [web] | the region through core/export (GODOT-PLAN.md M7, opt-in: a build lists it after core/export 07, 09, 10): the parts' registries (88s, 88b) as one page registry (ids `<part>:<id>`), the terrain (WORLD.H and WORLD.water on a grid `WORLD_EXPORT.step` apart), and the scene in the box as items and buckets (the villages' pieces, the bridges by their records, the flora round the camera; not the terrain, water, sky or beacons). A floating origin (2026-11-16): the meshes are written about the case's own origin, the flora's floating origin (85) where it is drawn near the box, else the box's centre (`WORLD_EXPORT.origin`; core/export README, "origin"). The flora's pools (85) are core/tags item sets in a `flora` part, registered when the export reads them, so every plant carries its uid (`KTAGS.uid('flora', key, position)`). `openworld/oidong-highrift/tools/godot_case.py` drives it (`tools/harness.py export --before`) |
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
through the isle demo's `IZV` bundle and its instancer) and roads, joined or not, and `links` between its towns, and `ways` (opt-in, 2026-11-16: a road from a town, or one of its villages, to a point, routed as a kept link and ending at the cut's edge, `short`, while the point lies outside it; Thalaba's expedition road toward Godshearth's Spillway) (`keep`: routed in hops inside the polygon, off rivers' beds; `stops`: an inn every
`every` m of road and a rest stop between, drawn as one-building villages; a stop with no ground is a `gap`). The bake
reads the kits' declared boxes from their source (`ASSET`, `XA.def`, `VERN.def`); a new village kit adds its records
there and an entry in `VK`. The bake plans on the land the page draws: 41l and 44c (the coasts) only when the region's
`build.py` lists them (2026-11-16: oidong-highrift takes no coast, and planning on coasts it never drew made the bake and
the page's plan differ). A region's own shaping of its land that the plan must see (a `WORLD.landHook`) goes in its
`src/48-world-site.js`, which the bake reads (oidong-highrift's OHR_CUT: Strongbow's face).
there and an entry in `VK`. A hamlet's spot may be `px` (the 5.1 canvas) as well as `near` or a bearing. **A village its own
page laid** (opt-in, 2026-11-22: Gihon's Landing on core/city, over core/hamlet's 500) is a hamlet with `laid` (its records and
lanes in its own frame), `px`, `shift` and `turn`: `48s` `laidVillage` puts it on the world as it is, searches nothing, keeps each
record where the world's ground takes it and lists the rest as `dropped`; a record `on: 'water'` (a pier's run, a light, a boat)
stands on the water at the village's `level` (`88s`: its deck over it, a footing to the bed, a run stretched to its `len`). The
bake loads a region's `src/NN-site-*.js` (such records, generated) before its spec, and the Xanadu row by name
(core/hamlet/xanadu/23), which a spec registers as a row of its own.

**A town's own ground** (`openworld/PLAN-VOTH.md` section 3, Layer 2; Voth the first case, 2026-11-11). A settlement whose
layout is keyed to its page's ground (its shore, its river) hands that ground to the world instead of being rebuilt on it:
- `python3 core/world/bake_towns.py voth` runs the page's terrain code in node, read only (Voth: `src/10-core.js`
  terrainH, the shore trace of `15-shore.js`, the site editor's edits replayed from `site/voth-site.json`), and writes
  `openworld/towns/<town>/`: the ground every 10 m (16-bit PNG), the water mask (the page's water polygon, the river's
  channel, the edited ground joined to them), `town.json` (frame, R, band, river, shore trace, stats). `--check` says
  whether the files are behind the page's sources;
- a **closed** town (`'kind': 'closed'`, 2026-11-16: Phēr, `settlements/pher`) has its ground as a closed-form function of
  its page: the bake runs only the page's own fragment and reads its `ground` (height, the water at 0), `frameFn` (the turn
  `rot`, the page point on the pin `centre`, the lift `y0`), `shoreFn` and `streamFn`; the grid stands round the centre, the
  shore trace is where the ground crosses the level, the stream is the town's river. Its record carries `rot` and `y0`
  (41 buildTowns takes a fixed lift: the page's heights over its water at 0);
- a town's river marked **`over`** (2026-11-16: Phēr's Swīṭ Siṭrīm, down its wall) runs above the town's water at its own
  height: 41t sets its water 0.6 m over the world's ground at each point (never climbing downstream), serves it in its
  channel (`riverWater`, its half-widths) and draws it as its own line (`riverLines`, or on down the link when joined).
  A join needs the model river's water at the cut over the stream's head: where it is not, `WTOWN.check` counts the link
  a climb and fails. An over-level river's link holds its water just over the band's eased ground (41 eases the band after the
  link's carve) and falls to the town's stream at its end, a cascade into its gorge. A town's `linkOut` (default 300 m) moves the cut further out than R + band: Phēr's 2,300 m, where
  the model's 2 km cells have not yet begun its stream's fall to the wall's lip;
- a region's build puts `bake_towns.record(town, region_meta)` in `WORLD_DATA.towns` and lists `41t` (and `41l`) after
  `41`; 41 already takes the ground (`buildTowns`, `townAt`), 41t the water, river and body. A region that names its towns
  in `openworld/SITES.json` (its row's `"towns"`) has them in `core/world/bake_sites.py`'s plan too (`towns_data`), so the
  villages and roads are planned on the town's ground as the page draws it (opt-in, as `41l` is: a build that lists it);
- `node core/world/test-town-water.js` tests 41t and 41l on a made-up region (with negatives);
- `python3 core/world/town_view.py voth [--shots] [--reach-km 30] [--model <another checkout's model/data>]` cuts a scratch region round the pin, runs `WTOWN.check()` and
  `WLAND.check()` on the real town in node, builds a viewing page, and with `--shots` takes the same views on the town's
  page and in the world side by side (GPU, under the harness's lock). It writes nothing in the repo.

**The world's ground under a town's page** (the other way round; Lāiṭwāl the first case, 2026-11-23). A town page that draws
its own near ground on the region's: `python3 core/world/bake_ground.py <region> --site <id>` (and `bake_ground.bake`,
`fragment`, `key` for a build) runs the region's own land chain in node, in its `build.py`'s order (core/rand, core/terrain's
relief, the rasters with the baked plan's roads and the model's landforms as the page's `WORLD_DATA` has them, core/mask,
core/coast, 41 and its land fragments up to 45, the region's `SITE_SPEC` for 44c's kept coasts, the geology), then samples
`WORLD.H` on nested grids round the site (uint16, 5 cm steps; a coarse level at its own minWave) and checks them, bilinear,
against `WORLD.H` at 400 points each. The page's fragment (`fragment(...)`: `H(x, z)` in world metres at metres from the
site, `water` at the points named) carries a few hundred KB, not the region's rasters. `settlements/lightwall/build.py` is
the worked example: it bakes at build into its `gen/`, skipping the node run (~30 s: the coasts' init) while the key holds.

A town with no tile (`drawn: false`) is kept by `98-world-start.js` when the tiles cannot be fetched, and `88-world-towns.js`
draws only the towns that have one (2026-11-12).

41t and 41l are new fragments so that 41's reach (eight builds) is untouched; folding them into 41 waits for the next
all-builds rebuild (`TODO.md`).

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

**Caverns** (2026-11-16; `42k` plans, `88k` draws; `node core/world/test-tubes.js`; step W3 of
`openworld/xanadu-oidong-highrift/PLAN-TWINS-CROSSING.md`, the owner: "Build open world caverns now"). A region opts in by
listing core/terrain's `39-core-cavern.js` and `host/39e-core-cavern-draw.js`, `42k` after `42`, its spec fragment
(`SITE_SPEC.tubes = [...]`, after `48-world-site.js`) and `88k` after `88s`; `tools/fragment_needs.json` holds the order.
- **The spec is the region's, the shape is KCAVERN's.** Each tube is a polyline in scale-model pixels (the region's `fromPx`),
  a width and floor-to-crown height per span, a DEPTH (the floor under the ground, never a height: a sculpt can land under it),
  its openings (`portal`: the floor ramps up to the ground at its mouth; `skylight`: a shaft through the roof), halls, and
  chokes and skylights drawn by cell (`KRAND` on the cell and the index along the tube, never on draw order). Why
  `SITE_SPEC` and not the scale model's `tubes` (region.json): those are the map's records, generated and edited only through the
  scale-model queue, and their lines are not the ways walked (Route A is the Twins plan's itinerary, not `tube_xanadu_nw_09`'s line);
  the spec names the model record it details (`model`), as `SITE_SPEC.bridges` opts a region into bridges. More tubes are rows.
- **The plan** (`WTUBES.plan`, about 0.3 s for 244 km): stations every 24 m (6 m within 350 m of a portal), meandering by a
  position-seeded noise; the floor is the ground smoothed along the tube less the depth, lowered until every wall's ground holds
  the roof and the cover (4 m) over it, its grade held (8 %), and raised up a 25 % ramp to the ground at each portal. Each opening
  carries its holes (circles where the ground opens) and the stations whose cover it waives. `WTUBES.check` reads it all against
  the ground as it is now, so a sculpt that lands under a tube shows up as a failed check, not a hole in a hill.
- **Branches** (`join: {tube, at}`, 2026-11-16: the Strongbow feeder into A3 at the Hall of the Tally-Marks). A tube's end can run
  into another tube underground: the end point moves onto the other tube's nearest station, the floor is held level at that
  station's floor across the other's void (its half-width, or its hall's radius, plus 8 m: the walker treads the lowest floor
  there) and graded away from it. The joined tube is planned first whatever the spec's order; a check holds the two on one floor.
- **The ground as drawn.** The cavern is cut against `WTUBES.drawnGround(WORLD.H)`: 81's finest chunks exactly (H at 3 m detail on
  the 2 m lattice, each cell split on 81's diagonal). The terrain's finest chunks drop their triangles wholly inside a hole as they
  are built (88k watches `TERRAIN.meshes()`); the cavern meshes the ground inside each hole's rim and 88k draws it with the
  terrain's own material and attributes, its rim sunk a hand under the terrain's straddling triangles. Nowhere else does the ground
  open, and the checks say so.
- **Streaming.** 128 m square columns, each a KCAVERN of its own in the square's own frame (no float jitter a million metres
  out; every square samples one world lattice, so the seams meet: the node test welds two), built a few chunks a frame (5 ms) round
  the camera when it is in a tube or within 700 m of an opening, and round every opening within 1.6 km; dropped when not wanted.
  About 170 ms of meshing a square (1 m cells, 16 m chunks), 5-20 k triangles.
- **The walker.** `WTUBES.walk` (a pure function: the ground, or the tube floor, or a wall) under 90's `CAM.update`, wrapped by
  88k; flying, the camera stays in a tube it is in, and the rock stops it. The pick reaches the rock (`TERRAIN.meshes` wrapped)
  and the inspector names the tube. Inside: the walker's lamp, the haze turned to the tube's dark, the sky hidden. 81 and 90 are
  not edited.

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
| `xanadu-oidong-highrift` | 1789 x 589 at 1 km (2 a pixel) | its own page (Erehwon's and Qiblai's sites are in it) | On, with relief (2026-11-16, `PLAN-RELIEF.md` P8): re-cut, streams traced at 400 m, Erehwon's farm-1 moved off the smoothed lake shore |
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
