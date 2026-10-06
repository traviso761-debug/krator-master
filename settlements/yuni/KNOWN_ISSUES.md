# Yuni — known issues (printed by build.py; tell the user before making changes)

- [x] The INNER CITY is placed: 15 scheduled plots (9 Ancient groups, the Emir's Palace, the Library of Yuni and
      the Order's Archive, Chapter house and School) plus 184 infill buildings packed as rows along each ring
      street, every one oriented to the best street within 55 m. Invariants: `inner-city-placement-sane`,
      `plot-schedule-built`.
- [x] The WESTERN half outside the wall is placed: the prosperous quarter (clock 6:30-10) and the market district
      (10-12), 821 buildings, plus the caravanserai and the great market circle with four halls and four rings of
      stalls. Everything reads the painted mask, so nothing stands on a street, in a park or on the farm belt.
- [x] The WHOLE ring outside the wall is placed: prosperous quarter, market district, and the poorer half from
      clock 12 round to 6, thinning to mud and thatch against the talus. 1,479 district buildings in all.
- [x] NOTHING STANDS IN THE ROAD AND NOTHING GROWS THROUGH A BUILDING. The clearance tests were point
      tests: 399 buildings had a box over a street edge (worst six metres, a market hall in its own
      boulevard) and 31 avenue trees stood inside buildings. `boxStreetPen()` and `treeClearBox()` ask
      the real oriented rectangle, inside `gridRy()` so the nudge table can fix it, with half a metre
      of tolerance for a doorstep. Now four (all scheduled landmarks, about a metre) and zero. Both are
      bucketed into uniform grids, which also took minutes off the build. Invariant:
      `nothing-in-the-road-or-through-a-tree`. Cost: 1,820 buildings became 1,765.
- [x] The four market halls hunt round the market circle instead of sitting on fixed cross axes; two
      of them had been refused by the new box test and vanished from the market entirely.
- [x] Scheduled plots may slide a few metres along their own radius to clear the ring street.
- [x] Where a district's chaos is above 0.3, a refused house may take a free yaw facing the nearest
      street. Those are tagged `free` and excluded from the on-grid count rather than loosening it.
- [x] EVERY NON-ANCIENT ASSET IN THE KIT NOW SPAWNS. An audit of PLACED against ASSETS found nine that had
      never once been built. Three — the family compound (26 m deep), the painted terrace apartments (22) and the
      Hall of Records (40) — are deeper than half a ring band, and both packers filter on `f.d <= allow` where
      allow is half the band (18-20 m inside the wall, 17 outside), so every row of every band silently dropped
      them despite two of them carrying the heaviest weights in the list. `packDeep()` now sweeps each band that
      is 34 m or wider FIRST, giving a deep landmark the band's whole depth on its mid-radius; the two ordinary
      rows then pack round it. The other six were the whole Parc Guell family, which had no placement path at
      all: `famWeights()` has no `park` key, so `districtFabric()` dropped them, and park ground is mask code 3,
      which every fabric pass refuses. Section 3b of `68-place.js` is their own pass — the only one that ignores
      the mask, because inside a park polygon that reserved ground is exactly where they belong — placing the
      signature piece in the middle of each park, two gate lodges at its edge, the fountain roundel off to one
      side and the viaduct along a flank. 15 park pieces; `60-flora.js` leaves the middle of a park unplanted
      (trees are laid down eight fragments before placement and can never be taken out again).
- [x] FARM_PLOTS carries farmsteads: one plot in five takes a walled compound with its granary, well and stock pen.
- [x] The summit carries the starport ruin plus three ruined dishes and a ruined radar mast, hand-placed.
- [ ] The budget was raised to 190 draw calls / 7.0 M triangles / 460 k instances to take the full city. The world
      now sits at 116 calls and 4.53 M triangles. There is still no LOD: everything is drawn at full detail at
      every distance, which is why the frame rate is what it is on a soft renderer.
- [ ] 778 district candidates were refused outright because no grid axis fitted them. That is the slums crowding
      themselves; it reads fine, but a relaxation pass would recover some of that density.
- [ ] The inner-city fill is wealthy fabric only (rich + civic). It reads right for the core, but the density is
      about 6 buildings per hectare — honest for compounds with courtyards, thin if you want 10,000 people in there.
- [ ] Triangle costs: houses 570-980, wealthy compounds 1.7-2.1k, Emir's Palace 11.6k, caravanserai 12.3k (54% over
      its 8k landmark budget), Ancient factory 47-58k (after the kit sync). ~3000 buildings at these costs is a lot — thin or add an LOD
      before placing the whole city.
- [ ] The gas giant still hangs in the NORTH-EAST while the valley now opens NORTH-WEST. That is deliberate: the
      giant's position is fixed by Yuni's longitude on a tidally locked moon and must agree with Mav's Refuge and
      Girder. Say so if it reads oddly.
- [ ] A daytime "airlight" floor was added to the giant's shader (21-sky.js, search YUNI) so its unlit side is
      sky-coloured rather than black in this thinner 1.3 atm air. A deviation from the shared Krator sky — confirm.
- [ ] The canal commands the land by 0.5-1.5 m, which is right, but the embankment on the NW half is only read from
      close up; from the air the canal can look like a ditch rather than a raised channel.
- [ ] Ancient "worn" variants are full height, so several are much taller than their ruins (Conocylinder 165 m);
      check that against the 640 m walled city when placing.
- [x] Ancient weathering: a rust-tinted stain pass now runs from every ledge, seam and fastener, moss and vines
      are gone from the worn state except a trace on the four tall towers, and the worn skin is its own texture.
- [x] Ancient robotics dressing: the wall sampler now bins by face normal, so long rectangular buildings take it.
- [x] THE ANCIENTS PORT IS SYNCED TO THE LIVE KIT (2026-10-01; map in `ANCIENTS-SYNC.md`). `tools/gen_ancients.py`
      now cuts the slice from `kits/ancients/src` + `core/materials` instead of an uncommitted 2026-09-26 file, so
      the kit's QA rounds 1-2 are in: ruin silhouettes (comb wall bite, fuel canopy slip, dish torn from the rim,
      data-vault section), glass shards, rooms behind openings, mouldings, the shrunk tower plinths, the new
      aprons. Yuni's variants (worn, dish intact, compact lab, four-ward hospital, roofed terrace stack, the
      Cloisters, the comb block) are re-merged. Sheet 109 calls / 1.557 M -> 109 / 1.733 M tris (ancients 1.167 M ->
      1.344 M); world 127 calls / 4.399 M -> 127 / 4.408 M (ancients 290 k -> 299 k).
- [ ] Towers cost more after the sync (sheet only; none is placed in the city): Conocylinder ruin 28.6k -> 52.2k,
      patched 26k -> 54k; Monolith 17k -> 23-27k; Warden 26k -> 31-33k (cut sections, rooms, shards). Thin them
      before placing a tower inside the wall.
- [ ] The kit's cut sections end in pale floor plates (0xbdb7ad). From Yuni's aerial views the top plate of a
      patched or ruined tower reads as a white lid. The kit's design; tint it in Yuni if it bothers.
- [ ] The kit's new graded aprons poke out of three Yuni footprints: radar 4.5 m, dish 2.4 m, toppled Sail 5.1 m
      (`window._anc.over`). The radar's pad already overhung its plot by ~2.7 m before the sync. They are ground
      skirts and the plots sit in 104 m superblocks, so nothing collides; re-centre `cx/cz` if one is ever packed
      tight.
- [ ] The kit's tower plinths shrank (Conocylinder 110 -> 92, Scallop 82 -> 66, Monolith -> 48, Warden -> 56 kit
      units). Yuni's tower scales (0.34-0.37) were chosen to fit the OLD plinths in a 100 m plot; they could rise
      ~15% now, or the plots shrink.
- [ ] Fire flicker / firelight: the kit's `tick` hook and NIGHT flag are driven from Yuni's frame loop, but the kit
      only places fires at decay 4 (the Projects), which no Yuni variant uses, so nothing flickers. If a variant
      ever places fire, ANC_finish merges it into a Lambert bucket: it would need its own MeshBasic bucket, and
      the merged mesh has no per-instance phase.
- [ ] The Library of Yuni is over its triangle budget (~18k est.), most of it shelving. The interior only reads
      from on or near the entrance axis; from an oblique angle you see the facade, not the books.
- [ ] The watch tower's bell reads to about 55 m and goes to a dark hole beyond that.
- [ ] Djenné town house variant A reads weakest of the three; the Musgum door surround is still a flat slab.
- [ ] Underground rooms are lit by the sun in FAST/headless mode (no shadows there); on a real GPU the butte should
      shadow them. Not yet checked on real hardware.
- [ ] `ancient_starport_ruin` uses `districts:['summit']`, which is outside the contract's district list.
- [ ] The Grand Vault was rebuilt (second design): Sagrada Familia — six leaning star-section pillars carrying a
      stepped canopy, tilted buttresses, one stone throughout, ornament from arch and geometry, colour only in the
      electric light. The screen's string courses still read as thin rails from 200 m out.
- [ ] Furniture is folded into the master catalog (`kits/catalog/`, as `yuni_*`); the `furn` sheet is retired, though
      `YUNI_TARGET='furn'` still works if set by hand. Every piece is tagged with a culture;
      plants likewise (yuni-plants.html) with a climate band and a preferred aridity. Only the Order's furniture is
      wired back into a building so far (the library and the school build from the registry); everything else in
      the city still draws its own.
- [ ] `F.lantern` is a fixed 0.5 m hanging lantern, too big for anything standing on a table. The ancients agent
      wrote a local `oilLamp()` helper; consider promoting it to the contract as `F.oillamp`.
- [x] THE LIFE LAYER is in: 454 people and 53 carts and caravans walking the NAV graph — ramblers, factory
      workers, academics, saffron-robed monks of the Order and market merchants, each with a day and a home.
      Invariant `life-layer-alive`.
- [x] The caravanserai now renders. It never had: the district fill packed houses into its reserved yard before
      the caravanserai was asked for, so the clearance test refused it silently. Reserved yards (the caravanserai,
      the market circle, the new Vault depot) are claimed BEFORE the fill now.
- [x] DOORSTEPS. Every POI now carries the door points `buildAsset` collected, and an agent walks a final leg off
      the street to the nearest door within 70 m (or, in an open place, to a point inside it). People stand at a
      doorway now, not on the centre line outside it.
- [x] Every population's routes are their own PATHVIZ layer — `Life: pedestrians`, `merchants`, `factory workers`,
      `academics`, `monks of the Order`, `carts and caravans` — each accumulating the edges it has actually
      travelled, in its own colour (monks saffron). The life fragment was renamed 84-life.js so it registers with
      PATHVIZ before 87-pathviz.js builds the dropdown; at 90 it registered too late and none of it appeared.
- [x] The path devtool draws RIBBONS, not lines. WebGL ignores LineBasicMaterial.linewidth on every desktop
      driver, so a route was one pixel wide and unreadable over a city this dense. Each corridor is now a flat
      2.8 m quad ribbon laid on the ground with depth testing off, so the layers read as an overlay map.
- [x] `any()` was being used as a UNION when it is a fallback chain: because `lab` was non-empty, every academic
      in the city walked to the Reliquary and to nothing else. `pool()` takes the real union. Academics went from
      0 corridors to 15, merchants from 46 to 72.
- [x] The last-leg check sat BELOW the no-path check in `step()`, so an agent crossing to a doorstep looked
      path-less and was sent to ask for a new destination instead of finishing. Carts went 20 → 57 corridors.
- [x] `gridRy` gained an 11-entry nudge table (along and across the frontage). Refused district candidates fell
      from 667 to 165 and the city grew from 1700 to 1822 buildings.
- [ ] The life layer has no collision between agents.
- [x] WORKING DOORS AND INTERIORS. Doors swing, open doorways show the room behind them, and 60 of the
      sheet's buildings get a planned interior: rooms, partitions with doors, a stair or ladder to a second level,
      furniture by layout, and a walk graph. Walk mode goes in through the door and up the stairs. Townspeople open
      doors and go inside. Everything is tagged for Blender and Godot (`GAME_EXPORT.md`).
- [ ] Interiors are only planned for the Yuni vernacular (poor, mid, trade, rich, civic), the lean-tos built
      against the Ancients and the caravanserai. The Ancients megastructures themselves, the parks, the props,
      the Library and the School (which draw their own interiors) and the Emir's palace get none. Open-sided
      sheds (smithy, craft shed, market hall) have no body to fit a room in. (2026-10-01: every one of them
      still has its beds and containers as a data-only minimal kit, `buildingKit()`.)
- [ ] Only the body behind each door is furnished. A compound's other wings, and upper floors reached only from
      a roof terrace, are solid. Two levels at most, and only in rectangular bodies.
- [ ] Rooms are fitted inside the captured body with a flat ceiling. Domes and cones read as a plain drum with a
      beamed ceiling inside, and rounded corners (`rbody`) can leave a corner of a room a few centimetres
      outside the shell. You only see that from inside, since the portal limits the view from outside.
- [ ] The doorway portal is a rectangle. Parabolic arch heads show a little of the dark plug above it.
- [ ] Interior lighting is a uniform indoor term (dimmed sun by day, warm lamp glow by night). Interior hearths
      and braziers are exported as lights but do not light the room individually.
- [ ] The egg hut's registered opening is its forecourt gap, so it has no interior. Its mouth needs an F.opening.
- [ ] Walk-mode collision outside uses the captured bodies only. Compound walls and fences can be walked through.
- [x] DARK FLOORS. Many interiors read as a black floor: the floor slab's colour and texture are lost
      under the dimmed indoor light, and on dark plinths ("black podiums") the floor and the plinth merge.
      Every floor needs a finish that reads: floor tile, beaten-earth pattern or planks, and a rug or mat in
      the main room. Check it from inside, through the doorway and in cutaway.
      2026-10-01: two causes. (1) In the cutaway the "black floor" was not the floor at all: the tarred
      base band most houses draw (a 0.9 m box over the whole footprint) has its top face above the room's
      floor. buildAsset now records such low full-footprint boxes as PLINTHS (`b._plinths`, 53-assets.js)
      and 76-doors.js hides them while the cutaway shows that interior. (2) Each FINISH now has a floor
      `pattern` by culture and class — `earth` (swept patches, or rings in a round hut) for the poor, the
      Sahelian banco and the salvage lean-tos, `plank` boards for the plain common house, `tile` with grout
      for the washed townhouse, a cream `mosaic` with a blue border and medallion for the court, `flag`stones
      for the Order and the Ancients — on the light end of each palette, with a border band and a darker
      threshold. Floors draw in interior-only `fl-` families that the indoor shader lifts (`uFloorLift`,
      0.30 by day, 0.14 at night), so they read at a quarter of the sun. The entered room of every group
      gets a rug or mat (`poor_reed_mat`, `common_kilim`, `court_carpet`). Rooms export `floor`.
      Checked inside, through the doorway and in cutaway (shots/2026-10-01-floors-*.png).
- [x] SHACKS NEED A DETAIL PASS, especially the lean-tos and salvage shacks built against reclaimed Ancient
      buildings. They have no captured body, so no interior. Their join to the host building is not modelled,
      and they read thin up close.
      2026-10-01: `poor_shack` (57-poor.js) was rebuilt tall enough to stand in, on a timber frame (corner
      posts, top plate, sill rail, mud kerb) with walls of real thickness, a roof on purlins with seam cover
      strips, lashings and stones, and a mud fillet sealing the roof to its back wall; it declares its room
      with `F.mass`, so it gets a planned, furnished interior. The lean-tos against the Ancients (61d,
      `ancDress`) now have mud fillets in both angles with the host wall, a mud roll sealing the roof to it,
      a render patch where the wall was made good above, a stone footing course and a drip stain. Their
      captured bodies are planned as salvage dwellings (`planView(b,'ancients-salvage')`, finish
      `salvage_mud`, layouts `living_salvage` / `hut_salvage`): 2-10 furnished rooms per Ancient building.
- [x] EVERY DWELLING NEEDS A MINIMUM KIT. Each residential building (types `dwelling-single` / `dwelling-multi`)
      must have at least one slot each for a BED, a FOOD CONTAINER and an ITEM CONTAINER, and more where it
      makes sense: one bed per bedroom, more in multi-family buildings, a larger store in compounds. Today a
      layout may drop optional pieces when a room is tight, and a dwelling with no planned interior has
      no slots at all.
      2026-10-01: `kitNeeds` / `ensureKit` / `buildingKit` in 64-interiors.js. A required bed or container that
      misses its layout anchor goes wherever it fits in its room (`fitAnywhere`); after every room is
      furnished `ensureKit` tops up a bed per bedroom (min 1, 2 multi-family), food (2 in a compound or a
      wealthy house, from a `common_grain_bin` down to a `poor_food_pot`) and items (2 in a compound), from
      the culture's `KIT_PIECES`, largest first. A slot no room can hold is kept as data, `virtual:true`.
      A dwelling with no planned interior gets a minimal data-only kit. `window._kitAudit` reads 0
      `dwellingsMissingKit` over 1,144 dwellings. Still drawn nowhere: about 75 virtual slots in 39 planned
      dwellings, almost all in the tiny round huts of `poor_compound` and `poor_cone_cluster` (a 1.2-1.5 m
      hut holds a bed or a pot, not both) — see the open item below.
- [x] CONTAINER TAGS. Furniture `type` has no `container-item` / `container-food` distinction yet. Add those
      tags. Then every building, residential or not, gets at least one item container, and more where it makes
      sense. Food containers go where food is kept or served: kitchens, stores, shops, taverns, granaries,
      farmsteads, and the caravanserai (which has no interior plan yet). The slot must exist in the plan data,
      so it exports for the game (loot and inventory), even where the building has no furnished room to draw it in.
      2026-10-01: the `storage` type is gone: chests, baskets, presses, cell walls and the mat rack are
      `container-item`, sacks, pots, jars and the grain bin `container-food`, each with a `capacity` (API.md).
      Every building has an item container and every kitchen / store / shop / tavern room and every shop,
      tavern, inn or farm building a food container (audit: 0 missing of 1,770). Granaries, pens and other
      unplanned buildings carry them in their minimal kit. The caravanserai has a hand-written plan
      (`INTERIOR_CUSTOM.trade_caravanserai`): 14 cells behind the gallery doorways — stores, a kitchen, a
      common room, guest rooms — with 8 beds, 25 food and 12 item containers. Exported as
      `KRATOR_EXPORT.building(id).kit` and in each interior's furniture (GAME_EXPORT.md).
- [x] CARAVANS DO NOT MOVE. Nine are spawned and drawn as four-beast carts with a caravanserai bias, but they
      register zero corridors and `want` reads null even on the cart code path they now share. Tried: their own
      `destFn`, a synchronous vehicle route, an off-map road-end state machine, and finally unifying them onto
      the cart path — none produced a corridor. Left as decorated carts; needs a fresh look.
      2026-10-01: found by stepping one caravan in the page. Two faults, neither in the state machine:
      (1) vehicles had no `off` field, which `step()` multiplies into the position to keep a walker off the
      centre line, so the first metre of any route turned x and z into NaN and the vehicle vanished for good
      (carts too: every cart stopped after its first set-out); (2) `LIFE.sim`, the headless fast-forward
      every test used, never stepped vehicles at all, and their initial waits of up to 30 s outlast a
      headless run at 0.04 sim-s per real second, so `want` was still null. Vehicles now carry `off`/`step`,
      `LIFE.sim` steps them, a NaN position raises an ERR, and a caravan runs a loop held as data (`next`):
      in from a highway road end 1.3-2.1 km out, through the caravanserai's gate into its court, a long
      stand, sometimes the market circle, then out to a road end, off the map for a while, and back.
      `window._life.caravans()` shows it; after 10 simulated minutes all nine are under way, 0 vehicle route
      failures (`vehicleRouteFailures()`). Carts no longer drive in at doors.
- [x] No LOD: everything was drawn at full detail at every distance. `core/lod` now takes over the
      scene (see "Level of detail (core/lod)" below).
- [ ] Tiny round huts (`poor_compound`, `poor_cone_cluster`, R 1.2-1.5 m) cannot hold a whole kit: about 75
      kit slots there are `virtual` (data, no mesh) — mostly a compound's second bed and second basket. A
      compound furnishes only the hut behind its door; furnishing its other huts would place them.
- [ ] Over a long headless fast-forward (`_life.sim(1200)`) pedestrian route failures climb into the
      hundreds (939 in 20 simulated minutes); `life-layer-alive` only checks them at load. Not looked into.
- [x] Night at 21:00 is too bright under the gas giant (21-sky / 82-daynight)
      2026-10-01: the Mav's Refuge / Girder fix, ported. Night floors hemi 0.30 -> 0.07, ambient 0.22 -> 0.035,
      planetshine fill 0.15/0.08 -> 0.07/0.03; a separate eclipse fill (DN_ECL_HEMI/AMB 0.16/0.10) so an
      eclipse still reads as twilight; the night fill lerps to a cool blue-grey sky (0x5f7193) over dark sand
      (0x2e2519) instead of a dimmed day colour; the giant's key 0.44 -> 0.18 x phase (SKY_SHINE_KEY); a full
      giant cuts the lamps by 8 % instead of 28 % (DN_SHINE_NL_CUT 0.28 -> 0.08). 21:00 under a full giant:
      hemi ~0.44 -> 0.136, ambient ~0.31 -> 0.073, key ~0.58 -> 0.238, nightK 0.72 -> 0.92. Noon unchanged.

## Level of detail (core/lod)

The page takes the shared LOD from `core/lod/` (read `core/lod/README.md`): `build.py` adds `09-lod.js` and
`97-lod-auto.js` to the fragment list, and 97 applies it to the finished scene. Big merged meshes are cut into chunks
that switch to clustered proxies with distance and are drawn combined (one draw per level in view); instanced sets keep
one draw call, drop their smallest instances by screen size and switch detailed shapes to a simplified version far off.
The originals stay the raycast targets, so the inspector and `_api` see full detail (checked: the inspector names the
same thing at nine screen points per view with LOD on and off). The panel (`l`, `measure`) reads draw calls and
triangles; `LOD.enabled=false` or `?lod=0` puts back the exact scene. `verify.py --assert` passes with LOD on.

Left out by default: the life layer's bodies (their instance matrices are `DynamicDrawUsage`), door leaves and overlays
(`noPick`). The cutaway (`_doors.cutaway`) sets clipping planes on the originals' materials, which the copies share, and
the underground view hides scene children, LOD's group among them, so both work unchanged (checked by screenshot);
interiors are built after LOD applies and are not managed; walking collides with data, not meshes.

Measured 2026-10-01, 1000x640, SwiftShader (`LOD.flush()` then `LOD.measure()`: one render of the main scene, so
calls and triangles as three.js counts them; sky passes not included):

| View | LOD off: calls / triangles | LOD on: calls / triangles |
|---|---|---|
| Yuni from the north (opening) | 120 / 4.40 M | 118 / 2.94 M |
| Street life: market | 122 / 4.43 M | 130 / 3.46 M |

Draw calls at verify's opening view: 113 with LOD, within the budget.

## Core modules (2026-10-05)

`build.py` reads `core/clock`, `core/sched`, `core/minimap` and `core/materials/record` beside `core/lod`, `core/rand` and `core/tags` (`CORE_MODULES`; a `src/` copy with
the same name overrides). The core files are upstream and tested there, so the reseed, palette and shared-scope rules
skip them and none is grouped with a `src/` fragment that shares its number (`20-core-clock.js` with `20-stage.js`).

- **The world clock** (`KCLOCK`, `GODOT-PLAN.md` Phase 1) is `YCLOCK` in `21-sky.js`, in place of the sky's own
  `SKY_T`. `skyHour()`, `skySetHour()` and `skyDayOfYear()` keep their names, so nothing that reads them changed.
  **Behaviour change:** the page used to run time from load at 5 real seconds per hour; it now opens HELD at 10:00,
  as every preview page does. The button is Run time / Hold time (a 72-minute world day); the sky panel's rate row
  is hold / 1x / 60x / 600x of that day; `#hour=H` and `#time=run` in the URL set it (as in Mungo). `SKY.secPerHour`,
  `SKY.timeScale` and `SKY.paused` are gone; `_sky.clock()`, `_sky.rate()`, `_sky.setRate(k)` replace them, and
  `verify.py`, `verify_heavy.py` and `verify_walk.py --hour` hold the clock through `_sky.setRate(0)`.
- **The volcano's cycle** (`20-stage.js`) is `KSCHED.eruption` (active 9 s in every 45 s) on the clock's motion time,
  no longer `Math.random()` and `setTimeout`; the texture swaps only when the state changes. `window._volcano`.
  Both bakes are still the same 'idle' paint, so nothing visible changes until an 'active' bake is made.
- **The minimap** (`88b-yuni-minimap.js`): the Map button or M. Relief from `terrainH`, the river, canal and basin,
  the street graph by class, the highways, the wall and gates, the butte, the reserved sites and every
  `FIX.buildings` footprint by family. Hover names; click looks there (not while walking). Draws nothing in the
  scene: draw calls unchanged. `window._minimap.export()`. The panel sits bottom left over the lower view buttons
  while it is open, as Voth's does.

Not taken, and why:
- `core/rand`: **an exception, by the owner's decision (2026-10-05).** Yuni's `rnd()` is Park-Miller
  (`seed*16807 % 2147483647`), not the mulberry32 stream `KRAND` reproduces, so moving onto `KRAND.stream` would move
  every placement in the city, and the noise (`h2`/`vn`/`fbm`, `phash` on `Math.sin`) the ground. Yuni keeps its own;
  its port carries the generator as it is or bakes the placements (`GODOT-PLAN.md` Phase 2, item 1).
- [ ] `core/simulation`: the life layer moves onto `SIM` in `core/simulation/PLAN.md` Phase 3b, after Locus (the
      mobility reference); its `deep` edges become `climb`/`underground` layers, the caravan loop a route's segments.
- `core/atmos`: the wave field is for open water (the river flows). The sky's light (`ATMOS.skylight`) now has standard
  materials to reach (the library families below) and is the next step for the library look; not taken in this pass.
  `core/walk`: the walker collides with captured, turned bodies, which `KWALK`'s axis-aligned blocks would coarsen.
  `core/terrain`, `core/biome`, `core/sockets` and the Ancients `core/materials` (already in `61a`, cut by
  `tools/gen_ancients.py`) do not apply or are already in.

## Material library (2026-10-05)

Yuni takes the material library the way Girder does (`core/materials/PLAN.md`, "How a build adopts the library"):
`materials.json` is the adapter, `python3 tools/textures/pack.py settlements/yuni` writes `tex/` (commit it), and
`build.py` reads `core/materials/record` and generates `46-matlib-pack.js` from `tex/`. `47-texture.js` turns every
painter into a `TEX.def` kind (`yuni.<family>`, the same pixels), `45-kit.js famMaterial()` gives a library family a
`MeshStandardMaterial` with colour, normal and roughness maps (plus the specular and tiling break-up hooks), and the
valley floor (`75-terrain.js`) takes the `ground` set the same way. `?mat=proc` is the look before, pixel for pixel;
`window._materials` is the material table. Geometry, draw calls (113) and the invariants are unchanged; the page grows
from 1.1 MB to 4.3 MB (the maps inlined). Each set's `tint.mean` is the mean brightness of the procedural map it
replaces (measured in the page), so the palette and lights keep their tuning: no tone mapping was needed.

| Family | Set | Tile (m) | Keep |
|---|---|---|---|
| adobe | `earth.banco` | 3 | 0 (palette ochre, red, dark) |
| plaster | `plaster` | 3 | 0 (whitewash, the blue washes, warm stone) |
| concrete | `concrete.board` | 3 | 0.15 |
| tile | `roof.tile` | 1.6 | 0 (terracotta from the palette) |
| timber, plank, thatch, cloth, rock, rust | Girder's sets (`wood.medieval_wood`, `wood.weathered_brown_planks`, `roof.thatch.neutral`, `cloth.weave.plain`, `rock.rock_face`, `metal.rusty_metal_04`) with Girder's numbers | | |
| bark | `bark.bark_brown_01` | 1.2 x 1.8 | 0, contrast 1.2 |
| ground (valley floor) | `earth.floor.packed` | 4 | 0 |

| mosaic | `mosaic.trencadis` (delivered 2026-10-05) | 1.6 | 0 (the domes' blues, warms and greens) |
| paintbw, paintcol | `patterns/yuni/paintbw`, `patterns/yuni/paintcol` (delivered) | 3.2; 4 x 4.3 | 1 (their own colour) |
| relief | `patterns/yuni/relief` (delivered) | 3 | 0 |
| metal | `metal.ancient.white` (delivered) | 4 (2 x 1 m panels) | 0 (white, tarnish, brass and gilt from the palette) |
| column (the butte, `50-structure.js`) | `rock.columnar` (delivered) | 40 x 64 | 0.15 |

- [x] The six sets the library lacked were generated by the owner on 2026-10-05 and processed with
      `tools/textures/batches/chatgpt-2026-10f-yuni.json` (sources in the owner's `texture/chatgpt-2026-10f-yuni/`).
      The Hausa panel was cropped to 4 x 4 whole cells first (its motifs cycle every 4 columns and 2 rows; the
      period search alone cut a row in half). `glass` (an opaque stand-in), `leafy`, `dark` and `glowmat` stay procedural.

**The interiors (2026-10-05).** `76-doors.js intMat` builds every interior material through `famMaterial`, so walls,
floors, ceilings and furniture take the library maps with their normal and roughness, the specular and break-up
hooks; the indoor light dims the sun's specular with its diffuse (no highlight through a wall). New families, each
with a library set and, under `?mat=proc`, the procedural map and scale of the family it was drawn with before
(`proc` in `05-palette.js`), so the old look is unchanged:

| Family | Set | Was | Used by |
|---|---|---|---|
| clay | `ceramic.terracotta` | tile | pots and jars (`64-interiors.js`: hearth, shelves, counter, tavern, clay pots, food pot; `63-furniture.js`: water jars, three-stone hearth) |
| rug | `cloth.rug.pile` (delivered 2026-10-05; was `cloth.rug.wool`) | cloth | the knotted carpet, the kilim, the rug pile |
| reedmat | `fibre.reedmat` | thatch | reed mats, the sleeping mat and platform |
| basket | `fibre.coil` (delivered 2026-10-05) | thatch | the lidded basket, the food pot's lid |
| fl-adobe | `earth.floor.packed` | adobe | packed-earth floors (the mud finishes) |
| fl-tile | `ceramic.terracotta` | tile | the blue-wash houses' terracotta floor tiles |

`intMat` takes `FAMMAT['fl-<fam>']` for a floor when it exists, else `<fam>` as before. The pots and jars used the
roof-tile family for its colour, which on the library put roof courses on a pot. Draw calls in the city are unchanged
(112); the furniture pieces placed outdoors (water jars, counters) now draw in `clay`. The page is 7.1 MB with 23
families inlined (Girder's is 12.9 MB).
- [ ] `kits/catalog` harvested these pieces with the old family strings: re-harvest after the catalog learns `clay`,
      `rug` and `reedmat` (it already lacks the interiors pass's pieces: "Open after merging main" below).
- [x] The interiors' last three sets were generated by the owner on 2026-10-05 and processed with
      `tools/textures/batches/chatgpt-2026-10g-yuni-interiors.json`: `wood.beam` now carries the `timber` family
      everywhere (beams, posts, toron, furniture legs, outdoors too; 1.2 x 2.4 m), `cloth.rug.pile` the rugs (0.6 m),
      `fibre.coil` the new `basket` family (0.35 m). Girder keeps `wood.medieval_wood` for its own timber.
- The Ancients ruins (`61a`) keep the Ancients kit's own `MAT`/`TEX`.

## The eastern badlands biome (2026-10-06)

The wild valley is planted by the eastern badlands kit (`biomes/ebadlands`), read in place like Locus reads the
eastern-abyss kit: `build.py`'s `BIO_CANON` puts `core/biome` and the kit's fragments at `69a*` and `69c*`, after the
placement pass, with the host binding (`69b-yuni-biohost.js`) between them and the planting (`69z-yuni-badlands.js`)
last. The kit's own BIOME-API.md places "the valley of Yuni" in the region's humid south; the owner's note (a valley,
so the Zion side of the kit) sets the fields: `cold` .24 on the floor rising with height, `wet` .5 (a slow patchwork
for drier benches) rising by the river and the canal, `flow` a 90 m band along the river, `rock` on steep ground and the
butte's talus. So the floor is `vale` and `rip` (gambel oak, bigtooth maple, cottonwoods, rose weepers, giant umbels,
grass and wildflowers), pinyon-juniper on the drier patches, ponderosa and aspen up the walls, a little spruce and fir
on the crests. The butte is dressed with Zion's hanging gardens (`EBADLANDS.dress`: maidenhair curtains with
monkeyflower and columbine, grape curtains, moss and lichen, ledge plants).

- **What stays Yuni's own** (`60-flora.js`): what people planted, the cypress avenues, the park trees and the olive
  groves. Its first-pass stand-ins for the wild flora (pine woods, scrub, riverside cypress and olive, the butte's pine
  ring) are gone. The kit's mask keeps off the town inside the wall, every street and verge, every building footprint,
  the planted trees (`TREE_SITES`), the canal corridor, the basin and the butte, and is thin (.12) in the districts'
  yards and on the farm belt.
- **Numbers** (quality .9, R 3.9 km; `window._biome`): about 43,500 trees (7,600 built in full near the LOD spine, the
  rest far impostors), 280 k biome instances, 8 M biome triangles before culling; about 10 s of the page's start-up.
  The LOD spine is eight points where the views look (the town's edges, the butte, the north approach, the weir, the
  valley mouth, the basin); a spine across the whole valley built every tree in full (12 M triangles).
- **The triangle budget is raised 7 M -> 10 M** (`05-palette.js`), as Locus raised its own for its biome. verify.py runs
  the page in FAST mode (quality .5: about 24,600 trees, 160 k instances); there `--assert` passes at 147 draw calls and
  7.2 M triangles. The full page draws more (the HUD read 11 to 14 M triangles with the shadow pass, at 60 fps on the
  owner's GPU). verify.py's `instances` counts Yuni's kit only, not the biome's (`window._biome.totals.inst`).
- [ ] From high above (the "The valley" view, 1.8 km up) the trees are specks and the floor reads as meadow with the
      kit's wildflowers; at ground level it reads as woodland. Denser woods cost triangles the budget does not have.
- [ ] The biome is not in the minimap, and its plants are not registered in `core/tags` (the inspector names them by
      their meshes' labels, as in Locus).
- [ ] Trees are kept off footprints and streets by a 2.5 m raster round the trunk; boughs are not tested against roofs
      (Locus's open item too).

## Catalog verify-pass sync (2026-10)
- [x] kits/catalog's verify pass found the plants and furniture it harvested from Yuni built bigger than they
      were declared. Yuni's own entries were measured on yuni-plants.html and yuni-furniture.html over four sheet
      seeds (every vertex, centred on the origin) and raised to what they build: cypress_yuni, pine_maritime,
      olive_valley, scrub_thorn, date_palm, canal_poplar and oleander_hedge (62-plants), ancient_socket_rack d
      (61e, and tools/anc_furniture.js which 61e is a copy of), and order_mat_rack w and h (59-civic). These
      sizes only set the sheet cells and the inspector records. No world placement reads them, so yuni.html and
      yuni-assets.html build identical geometry: the scene digest matched before and after. The plant and
      furniture sheets reflow. fig_courtyard and salvage_hearth_hood already fitted, so they were not changed.
      Nothing was recentred. The catalog's F.shift offsets come from its rewritten geometry, and Yuni's own
      pieces sit within 0.07 m of centre, except the mat rack (next item).
- [ ] order_mat_rack: each mat roll is an F.cyl turned [0,0,PI/2], which grows from its base along -x, so every
      roll hangs 0.29 m out of the rack's left end (it builds x -1.20..+0.87). The fix is to move the rolls +0.29
      in x. That moves geometry in the School, so the catalog sync left it alone.
- [ ] More furniture builds bigger than it declares (same measurement; h can include a lamp's glow ball):
      common_floor_seating w (4.0 vs 2.4), common_shop_counter w h, common_wall_shelves d h, nomad_rug_pile w d,
      order_bookcase w, order_reading_desk w h, order_shelf_run w h, ancient_cell_wall d h, court_mosaic_divan d h,
      salvage_locker_press d h; h only: ancient_glass_console, ancient_refectory_run, court_brass_brazier,
      common_tavern_table, order_reading_table, order_master_chair, salvage_strut_bed, salvage_lamp_stand.
      The interiors planner (64-interiors tryAt) places LAYOUT furniture by w and d, so raising those values
      moves furniture in the world. Re-check every room after such a change.

## Open after merging main (2026-10-01): not addressed
- [ ] The catalog has not collected the furniture added by the interiors pass. Main retired `yuni-furniture.html`
      (Yuni's pieces live in kits/catalog), but `kits/catalog/krator-master-furniture.js` was harvested before
      2026-10-01, so it lacks `poor_lidded_basket`, `poor_food_pot`, `poor_sleeping_mat`, `common_grain_bin`,
      `poor_reed_mat` and `common_kilim` (64-interiors), and its Yuni pieces still carry the retired `storage` type
      instead of `container-item` / `container-food` with `capacity`. Re-harvest Yuni into the catalog.
