# Northern Highlands — known issues

## Open

- [ ] **Density against the budget.** The map is 43 km² of old growth; the canopy is closed
      only near the LOD spine (the stream, the tower, the old wood, a boreal stand, the crest).
      Beyond ~600 m the stands thin (the passes' `lodK`) and the impostors are drawn larger to
      make up for it. A world that shows a smaller area can raise the density (`quality`) there.
- [ ] **Memory.** ~26M triangles held (trees ~17M, floor ~9M), ~1.9M instances. Plain-array
      buckets crashed the page at ~16M; the core now stores Float32 (BIOME-API.md). Software GL
      (SwiftShader) takes ~25 s to build and 20–60 s a screenshot.
- [ ] **More deciduous trees at the lower elevations** (Travis). The temperate band reads conifer-heavy:
      raise the share of broadleaves there (moss maple, blue beech, mountain maple, alder; perhaps a
      new oak/lime/ash-like canopy species) against the great spruce and cedar.
- [ ] **The pines are not bushy enough** (Travis). The conifer builder's crowns (and the crag pine's
      pads) read thin and twiggy, especially at mid range: more and larger needle masses, fewer
      visible branch rods.
- [ ] **Optimization pass** (Travis): ~25M triangles held, ~27 s build, up to ~510 draw calls at the
      stream views. Candidates: merge small floor items per chunk, cheaper mid-range trees, fewer
      bulbs and pods far from the spine, smaller dome texture, a lower total budget.
- [ ] Fauna deferred (a stub, as in the other kits).
- [ ] The far country's lake shore is a little polygonal (its grid is ~460 m out there), and
      the Outer Wall reads as an even band (82-host-sky.js).
- [ ] The night is very dark on open ground away from the glow (by design: the glow carries it).
- [ ] **Snow reads as one band down the valley, not patches** (found in review, Oct 2026). `cold` includes valley
      cold-air pooling (`45-host-stage.js:155`) and snow is gated on `cold>.94*alpine` (`84-host-ground.js:50`), so the
      default SE-crest overview shows a continuous white band on the valley floor. Near trees also read as bare poles.
- [ ] **The test tower draws from a stream the mist reseeds** (found in review). `45-host-stage.js:24` hands the biome's
      `rng` to the host; the mist (`84-host-ground.js:128`) reseeds it and `buildTestTower` (`85-host-tower.js:20-38`)
      draws without its own reseed, so changing the mist changes the tower's missing panels and rubble. Reseed at the
      top of `buildTestTower` (this moves the current panels and rubble once).

## Done

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
