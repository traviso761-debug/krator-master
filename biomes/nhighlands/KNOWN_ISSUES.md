# Northern Highlands — known issues

## Open

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
- [ ] The night is very dark on open ground away from the glow (by design: the glow carries it).
- [ ] **Snow reads as one band down the valley, not patches** (found in review, Oct 2026). `cold` includes valley
      cold-air pooling (`45-host-stage.js:155`) and snow is gated on `cold>.94*alpine` (`84-host-ground.js`, the snow lerp), so the
      default SE-crest overview shows a continuous white band on the valley floor. (The near trees there no longer read
      as bare poles: the bushy conifers, Oct 2026.)
- [ ] **Put the biome fruit in the kit** (`biomes/FRUIT.md`): yew-lantern arils, frost rowan, wall bilberries, lantern pods, beechmast and acorns. Each has a catalog piece in
      `kits/catalog/krator-master-furniture-generic-fruit.js` (`biome: 'nhighlands'`). The arils, rowan berries, bilberries and lantern pods are drawn and tagged. Draw beechmast on `bluebeech` and acorns on `gnarloak` (both tagged, neither drawn), and point the `HV()` notes at the catalog keys.

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
