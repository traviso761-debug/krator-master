# The Labyrinth: known issues

- [ ] **The flora is a stand-in.** Station 1 reads the NW lowlands' kit in place (PLAN-GATE.md section 6). On this page's fields it
  grows grass trees, banksias, needle cypress and she-oak on the floor, with a few birches, poplars and glow-willows: an
  Australian-looking parkland, not the mammoth steppe of PLAN.md section 3. The Labyrinth's own flora (steppe grasses and
  forbs, larch, birch, poplar, willow, dwarf scrub, the wild melon) is a kit still to make.
- [ ] **The GPU verify fails one assert: the core attach audit** (2026-11-11, RTX lane): 97 of 7,302 cards above the ground float,
  1.33% against a 1% limit (biome:bloom 92/916, biome:drape 5/1,084; worst about 0.85 m off with 0.57 m tolerance). Every other
  assert and every negative control passes. These are the NW lowlands kit's blooms, scattered round a shrub's centre with no hold
  (`biomes/nwlowlands/src/60-biome-nwlowlands-floor.js`, `blooms()`; core/biome README, "the residual floaters": `BIO.holdTo` or
  `{onLeaf:true}`). The kit's quality does not move it (0.7: 1.35%, 1: 1.33%). The fix is in that shared kit and reaches every page
  that reads it, so it is not made from here; it goes away anyway when the Labyrinth's own flora replaces the stand-in.
- [ ] **No animals yet.** The megafauna wait for `kits/fauna` (PLAN.md section 4); no herd, trail or wallow is drawn.
- [ ] **No hazards.** `core/hazard` is not taken yet: station 1 draws no fall at the stacks' walls and no charge (PLAN.md section 7,
  amendment 2).
- [ ] **The Hall's materials are re-made on this page** (`src/89g-host-gate.js`). The Ancients kit's Standard materials drew
  near-black here: the same map on a fresh MeshStandardMaterial drew correctly, the kit's own (map plus its packed roughness
  canvas) did not, and stripping the atmosphere's hooks did not change it. The cause was not found. The page re-makes each
  once (colour, map, emissive, side, a scalar roughness of .88) and lifts the colour 2.2x (`?lift=`), because the kit's ruin
  palette is toned for its sheet's brighter lights. Find the cause before another world hosts an Ancients builder this way.
- [ ] **The walls past the square are the model's 2 km cells**, given spurs and gullies by noise in proportion to their rise
  (`45`, `landH`). They read as smooth slopes from the floor; KSTRATA's bedding is not on them.
- [ ] **The knobs and stacks carry no planting.** Their terraces and galleries are bare on the page (the kit's sheet plants
  boxes); `BIO.upFaces` dressing is not run on them.
- [ ] **The Kimr's pueblo** (PLAN.md section 5, a village on a knob above the gate) is not on this station: the Kimr keep away
  from the Hall (PLAN-GATE.md section 9). It wants `core/hamlet`'s defended platform (PLAN.md section 7, amendment 4).
