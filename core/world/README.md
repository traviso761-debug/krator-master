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
| `41t-world-town-water.js` | [G data] | `WTOWN`: a town's own water with its ground (WORLD_DATA.towns, `bake_towns.py`): inside its footprint the town's water mask decides the water (`lakeWater`, `waterBodyAt`), its water joins the model's body at its level (one body, the mask taking it in), its river is served by `riverWater`, the model river it joins is cut outside the band and led in by a carved link; `drawn: false` keeps 41 from sinking the ground 3 m. `WTOWN.check()`: the shore against the page's trace, the river, one body. Listed right after 41 |
| `41l-world-landforms.js` | [G data] | `WLAND`: the scale model's landform records under a cell (`DATA.landforms`, carried by `extract_region.py` into region.json) stamped at 1:1 through the land hook: island, islet, stack, shoal; water (edit_513's forms page, narrows and strait as one field: the bed set to the record's profile, the coarse wet cells beside closed to its width; river left to 41's named river) and shelf (the page's bed for the water it names); `WLAND.check()` |
| `42-world-roads.js` | [G data] | `ROADS`: least-cost routing on the land at a held grade; the carriageway shaped into the ground |
| `44c-world-coast.js` | [G data] | the coasts on core/coast (`KCOAST`, `core/coast/README.md`): at init each water body gets a coast field, `landHook` is chained (the coast's profile, sign-safe, then the region's own hook), each body's mask is redrawn from the field, the fields `coast`, `coastC`, `coast:<class>` join `WORLD.FIELDS`, `WORLD.ground` takes the coast's colour bands; a town's ground and a region's `WORLD.coastKeeps()` keep their coast; the region's sub-cell `landforms` (region.json, from the scale model's `model/data/landforms.json`) are stamped as islands by the body they stand in. `WORLD.coast` {list, at, stats, check}. Listed after the region's `43-*`, with core/mask (25, 27) and core/coast (30) before 41 |
| `45-world-host.js` | [web] | the renderer, scene and frame loop the world draws into |
| `80-world-sky.js` | [G native] | the sky and light |
| `81-world-terrain.js` | [web] | the terrain tiles (the land drawn, coloured by `WORLD.ground`). The ground reads its strata only where the rock's weight can move the colour (over 0.004, 2026-11-16): 3-5 ms of the Arc 140T's frame over land without rock |
| `83-world-water.js` | [G data] | the water levels |
| `83w-world-seas.js` | [web] | the seas and lakes drawn; with core/water/farbed listed, each body's far bed (no straight edge at the shore window) |
| `84-world-nursery.js` | [web] | each kit's species grown as variants (`KIT.make`, `KIT.grow`) |
| `84i-world-impostors.js` | [web] | opt-in: a kit whose registry entry asks (`impostor: {lv, variants, grid, cell}`) draws its far level as the biome core's octahedral impostors (`core/biome/34`), baked once per species and variant from the tree the nursery grows at `lv`, written with the world's logarithmic depth. A region lists it after `84` (Pinnacle does, for the hyperjungle) |
| `85-world-flora.js` | [web] | the flora tile by tile, seeded by cell with `KRAND.hash` (the same tile in any order) |
| `86-world-floor.js` | [web] | the kits' floor patches under the zones |
| `87-world-places.js`, `88-world-towns.js` | [web] | the "Go to" list and the scale model's settlement markers |
| `48s-world-sites.js`, `88s-world-sites.js` | [G data], [web] | `KSITES`: a region's sites planned (camps, hamlets, roads, links and their stops); drawn |
| `42b-world-bridges.js`, `88b-world-bridges.js` | [G data], [draw] | `BRIDGES`: where a laid road crosses a named river, a span of deck the ground is not shaped under, so the river runs on (a BRIDGE record: slab, arch, a row of arches or a viaduct, by its length and height; its piers; its builders' culture); drawn in stone, tagged, checked (`_bridges.checks`) |
| `42k-world-caverns.js`, `88k-world-caverns.js` | [G data], [web] | `WTUBES`: a region's lava tubes (`SITE_SPEC.tubes`) planned as records under the ground and drawn with core/terrain's `KCAVERN` near the camera, the ground opened only at their portals and skylights; the walker (90's G) goes in and along them. Below, "Caverns" |
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

**A town's own ground** (`openworld/PLAN-VOTH.md` section 3, Layer 2; Voth the first case, 2026-11-11). A settlement whose
layout is keyed to its page's ground (its shore, its river) hands that ground to the world instead of being rebuilt on it:
- `python3 core/world/bake_towns.py voth` runs the page's terrain code in node, read only (Voth: `src/10-core.js`
  terrainH, the shore trace of `15-shore.js`, the site editor's edits replayed from `site/voth-site.json`), and writes
  `openworld/towns/<town>/`: the ground every 10 m (16-bit PNG), the water mask (the page's water polygon, the river's
  channel, the edited ground joined to them), `town.json` (frame, R, band, river, shore trace, stats). `--check` says
  whether the files are behind the page's sources;
- a region's build puts `bake_towns.record(town, region_meta)` in `WORLD_DATA.towns` and lists `41t` (and `41l`) after
  `41`; 41 already takes the ground (`buildTowns`, `townAt`), 41t the water, river and body;
- `node core/world/test-town-water.js` tests 41t and 41l on a made-up region (with negatives);
- `python3 core/world/town_view.py voth [--shots] [--reach-km 30] [--model <another checkout's model/data>]` cuts a scratch region round the pin, runs `WTOWN.check()` and
  `WLAND.check()` on the real town in node, builds a viewing page, and with `--shots` takes the same views on the town's
  page and in the world side by side (GPU, under the harness's lock). It writes nothing in the repo.

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

**Next** (`openworld/PLAN-SITES.md` section 6):
- `WORLD.H`'s land rule becomes core/terrain `KLAND` (Hook's lift on `claude/silly-hawking-929a87`, redone from this
  copy);
- the planners' generic steps (sample the land into a settlement's grid, hand the ground back) move here or into
  core/city.

**Godot:** `41`, `42` and `83` are the data the port takes. The rest is the preview's drawing, which Godot does
natively (`GODOT-PLAN.md` Phase 7, M7).
