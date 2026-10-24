# Northern Highlands — known issues

## Open

- [ ] **The new flora (HANDOFF-FLORA.md, 2026-10-18): procedural, and what to look at again.** Everything new is painted
      in code: the fan-leaf cards (the staghorn and the sun-wheel took the owner's `card.staghorn` and `card.sunwheel` on 2026-10-19), the moss sleeves (the moss cushion's skin as a bark), the
      ghost alder (the birch bark tinted grey), the serpentwood's and the banyan's bark (the kit's furrowed and smooth
      kinds). Textures wanted: `core/materials/PROMPTS-NEEDED.md` and `HANDOFF-FLORA-REPORT.md`. Cut from the plan to
      hold the 32 M budget: the fern sea's cell is 5 m (the plan's 3 m held 9.8 M triangles of fronds), the ghost
      alder's weight is a fifth of the plan's (12.8k trees), spore lamps sit on about one hummock in seven with 8-22
      pins (the plan's two in five with 10-40 held 2.6 M), and the hummocks' weight is .6 of the plan's. Moss collars
      are cushions round the bole: on a fluted or buttressed giant they can show a gap, and they read as rings from
      far. The hummocks are the 49-triangle cushion scaled to 4 m: faceted close up. **Roketstad** reads these
      fragments in place but calls `NHL.buildTrees` itself: it gets none of the new flora until its build passes
      `{flora:true}` and calls `NHL.buildNewFlora` (the owner: when Roketstad goes into the open world).

- [ ] **Density against the budget.** The map is 43 km² of old growth; the canopy is closed
      only near the LOD spine (the stream, the tower, the old wood, a boreal stand, the crest).
      Beyond ~600 m the stands thin (the passes' `lodK`) and the impostors are drawn larger to
      make up for it. A world that shows a smaller area can raise the density (`quality`) there.
- [ ] **Memory.** ~24M triangles held (trees ~16M, floor ~8M), ~2.0M instances. Plain-array
      buckets crashed the page at ~16M; the core now stores Float32 (BIOME-API.md). Software GL
      (SwiftShader) takes ~22 s to build on a quiet machine (`window._phases`: trees ~10 s, the
      core's bake ~5 s, floor ~4 s, ground ~2 s) and 20–60 s a screenshot.
- [ ] **Draw calls: the near-band floor.** ~330–380 calls at the stream views (from ~480–510), most of
      them the near floor's ~30 item types times the chunks within 650 m. Four pairs of items share
      geometry and material (black grass and grass, dark spurge and heath, smoke bush and moss
      cushions, mountain cane and rods) and could merge, four calls a chunk, but the inspector names
      a small plant by its item's label: that needs a per-instance label in the core first.
- [ ] **Mid-range broadleaves are thin.** The broad builder's lv1 trees (three boughs as rods, one
      clump a spot) read sparse at 100–300 m, now that there are twice as many of them low down (the
      low-band view from the NW corner). The conifers' treatment (more, larger masses at lv1) would fit.
- [ ] **The boreal spires read near-black against the light.** The denser needle masses carry the
      spire spruce's dark palette (`PAL.conifer` x .82) further; judge it in review, lighten if wanted.
- [ ] **Placement evaluates the zones for every cell of every pass** (~2 s of the trees' ~10 s): a
      zone lattice (like the host's field cache) would halve it.
- [ ] Fauna deferred (a stub, as in the other kits).
- [ ] The far country's lake shore is a little polygonal (its grid is ~460 m out there), and
      the Outer Wall reads as an even band (82-host-sky.js).
- [x] The night is very dark on open ground away from the glow (by design: the glow carries it). - 2026-10-20: by design, nothing open.
- [ ] **Snow reads as one band down the valley, not patches** (found in review, Oct 2026). `cold` includes valley
      cold-air pooling (`45-host-stage.js:155`) and snow is gated on `cold>.94*alpine` (`84-host-ground.js`, the snow lerp), so the
      default SE-crest overview shows a continuous white band on the valley floor. (The near trees there no longer read
      as bare poles: the bushy conifers, Oct 2026.)
- [x] **Put the biome fruit in the kit** (`biomes/FRUIT.md`; 2026-10-06): yew-lantern arils, frost rowan, wall bilberries, lantern pods, beechmast and acorns.
      `HV()` carries `fruit` (the catalog key) on `elderyew`, `rowan`, `bluebeech`, `gnarloak` and the bilberry and lantern-pod plants; `NHL.FRUIT_KEYS` lists them.
      Beechmast (`bluebeech`) and acorns (`gnarloak`) are now drawn: the `mast` item, a tetrahedron (4 triangles) in three-nut clusters at hero-level leaf
      spots (17,064 instances, about 68k triangles). The probe's host check `fruit tagged, catalogued and drawn` (with two negatives) guards it.
- [ ] (Travis, Oct 2 2026) **Floating forest: lime foliage.** The floating forest's foliage reads lime green against
      the rest of the kit; retune it to the kit's palette.

## Done

- [x] **More deciduous trees at the lower elevations** (Travis, Oct 2026). A `low` zone weight (the foot of
      the temperate band); a new canopy broadleaf, the forest lime; more moss maple, blue beech, mountain
      maple, alder in the wet hollows; fewer great spruce, cedar, hemlock and silver fir low down.
      Broadleaves 29% -> ~56% of the temperate and montane trees. Montane and boreal weights unchanged; the
      boreal band places from its own stream and every tree builds from its own seed.
- [x] **The pines bushy** (Travis, Oct 2026). The needle card has shaded cores under its needles (it held
      no alpha two mips down); a needle mass round the bole at every tier, four to six arms a tier with
      larger overlapping masses, the arm rod only on long arms and only part-way out; mid-range tiers at
      2.2x the step (3x); cedar and hemlock sprays close-set and twice as broad; the crag pine's pads five
      to eight masses with a darker layer under them.
- [x] **Optimization pass** (Travis, Oct 2026). Held 25.3M -> 24.4M triangles with the two items above in;
      draw calls at the stream views 477/511/461 -> ~330/380/330, drawn triangles ~10.8/12.7/12.7M ->
      ~9.7/12.0/11.8M (The stream / Night: the stream / The tower); LOD chunk meshes 1461 -> 1172; build
      26.0 -> 22.1 s (same machine, back to back). How: the far floor (lv 0) carries 8 item types, not
      ~30, and is drawn to 2.4 km, not 3.2; bell-bulbs and lantern pods thin past 150 m of the spine and
      draw within 650 m (`NHL.LOD.glow`; the halos keep the tree's range); cheaper cushions, discs, pleat
      fans, bulbs, lantern pods and small funnels; two mushrooms and four-frond ferns past the near band;
      the 20-triangle impostor blob past 700 m of the spine (1000); the placement grids skip cells off the
      map (`NHL.build({box})`); the ground painted at half size and scaled up, allocation-free, its noises
      on lattices (~4x faster). Not done: the dome texture (4096 wide, ~1.5 s; halving it softens the painted
      peaks) and a lower density (visible).
- [x] **The test tower's own stream.** `buildTestTower` reseeds at its top; its panels and rubble moved once.
- [x] **The boreal trumpet had no weight of its own** (found in this pass): 21 trees, all from the temperate
      band's upper edge, and the placement box removed them (every-species-placed failed). A small colony
      weight in the boreal band (~60 now).

- [x] Core drift from upstream: the kit reads the one shared core (`core/biome/`, Oct 2026), which carries
      every addition this kit made (waterH/depth/register, cold/rock, Float32 stores, `opt.depth`) and hashes 6
      words in the vertex merge again (same output). Geometry proven unchanged by mesh fingerprints.

- [x] The kit on the xanadu core + sedesert's `waterH` + `cold`/`rock` fields + harvest tags.
- [x] The flank, the stream (monotone, two falls, pools), the tarn, the six fields.
- [x] 24 tree species by habit, 27 understorey plants, all tagged; the trumpets (great,
      understorey colonies, boreal); the glow and `NHL.setNight`.
- [x] The Girder tower's hanging flora and its cold gradient; the crag pillars.
- [x] The Krator sky with the far lowlands, the snowy peaks, day / dawn / night.
- [x] The inspector (species, class, tags with harvest), the polygon and path tool.
- [x] verify.py asserts the biome's invariants (species, stream, water, cliffs, trumpets,
      glow, tower).
- [x] (2026-10-06) The showcase takes the material library (materials.json, tex/, the 44 pack; BIO.libSwap after the MAT table): barks, rock, wood and the leaf, frond and ground-plant cards, brightness matched to the measured procedural maps; single-plant slots show one cell of their sheet. Slots not in materials.json stay procedural (the 2026-10-06 sweep lists them in core/materials/PLAN.md). verify --assert passes, before and after.

## Export profile: sections left out (2026-10-18)

EXPORT_PROFILE in verify.py leaves out: atmos (the page has no core/atmos export: the section reads empty; sedesert fills it with 89-atmos-8-export.js); water (no core/water surface meets the box: the section reads empty). Add each back when the kit fills it.

2026-10-20: `atmos` is now bound and in the profile (migration phase 0: `89a-host-atmos.js` calls `ATMOS.bindHost`, build.py lists core/atmos's core, presets, export, waves and skylight plus `core/atmos/host/89-atmos-c-hostbind.js`; the binding alone draws nothing, and the page's own sky, fog, sun and water are unchanged). `water` waits for its phase: no core/water surface is drawn here yet.

2026-10-20: checked, nothing to wire. This page binds neither core/atmos nor core/water (its water, where it has any, is the host's own MAT_WATER shader), so there is nothing for the two sections to export and both stay out of the profile. The shared pieces are in place for the day it does: core/export's adapters (`09`) fill `atmos` from `ATMOS.export` and `water` from `WATER.surfaces`, and a kit that binds core/atmos lists `89-atmos-8-export.js` in its `CORE_ATMOS` and adds `atmos` to `EXPORT_PROFILE` (geyser, ringisles, sedesert, the Throne's stations).

2026-10-20 (migration phase 2): `water` is now in the profile (the box [-1500,-1200,-1200,-900] holds the stream near -1230,-1060). The stream, its two falls and the tarn are core/water's. In `45-host-stage.js`: `STREAM_FLOW` (a `WATER.flow` along STREAM.P at STREAM.level, 12 m, as wide as the old ribbon's visible water: 2 (halfW + 4.5)), `STREAM_FALLS` (`WATER.fallsOf(STREAM_FLOW, {steep: .5, minDrop: 8})`: the 30 m and 23 m chutes, each `WATER.fall` with its lip speed raised to run / time of fall so the curtain lands at the foot of the chute and stays over its water) and `TARN_STILL` (a `WATER.still` disc, r + 4, at the tarn's level); drawn in `89w-host-water.js` (`drawFlow`, `drawFall` with their plunge pools, `drawStill`; `ATMOS.skylight` on a capture of the dome and giant, recaptured at each light mode, given to the water only). `84-host-ground.js` lost its water shader, ribbon and disc; the mist stays its sprites. `BIO.waterH` and `terrainH` are unchanged. build.py lists `CORE_WATER` (20, 21, 22, 50, 51). Cost, same cameras, before -> after (calls, triangles): The stream 360 -> 364, 12.94 M -> 12.95 M; The waterfall 275 -> 279, 7.96 M -> 7.97 M; The upper fall 189 -> 191, 6.57 M -> 6.58 M; The tarn 292 -> 296, 7.43 M -> 7.44 M; Night: the stream 415 -> 419, 15.77 M -> 15.78 M (the ceilings are 22 M triangles per type; nothing near). Look: bluer-green and glossier than the old grey-brown, which was an unlit shader reading its colours straight; night keeps the page's lights (the old shader's 0.14 multiplier is gone) and picks up a glint. Two things the page had to do about core/water, recorded in `core/water/README.md` "Open gaps": (1) the flow's white water is a **global preset** (`WATER.PRESETS.flow.rapids`, a 1.5% to 12% grade): this stream falls 17% on average and came out white end to end, so `89w` sets the preset to `[.2, 1]` (the old foam's band); there is no per-flow setting. (2) `WATER.drawStill` takes one colour, so the tarn lost its peat rim running into deep blue (it is one mean colour, 0x3a4640); it is a disc, not the old per-vertex gradient.
