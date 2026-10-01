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

## Done

- [x] The kit on the xanadu core + sedesert's `waterH` + `cold`/`rock` fields + harvest tags.
- [x] The flank, the stream (monotone, two falls, pools), the tarn, the six fields.
- [x] 24 tree species by habit, 27 understorey plants, all tagged; the trumpets (great,
      understorey colonies, boreal); the glow and `NHL.setNight`.
- [x] The Girder tower's hanging flora and its cold gradient; the crag pillars.
- [x] The Krator sky with the far lowlands, the snowy peaks, day / dawn / night.
- [x] The inspector (species, class, tags with harvest), the polygon and path tool.
- [x] verify.py asserts the biome's invariants (species, stream, water, cliffs, trumpets,
      glow, tower).
