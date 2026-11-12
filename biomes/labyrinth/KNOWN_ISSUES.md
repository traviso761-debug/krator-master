# The Labyrinth: known issues

- [ ] **The flora is a stand-in.** Station 1 reads the NW lowlands' kit in place (PLAN-GATE.md section 6). On this page's fields it
  grows grass trees, banksias, needle cypress and she-oak on the floor, with a few birches, poplars and glow-willows: an
  Australian-looking parkland, not the mammoth steppe of PLAN.md section 3. The Labyrinth's own flora (steppe grasses and
  forbs, larch, birch, poplar, willow, dwarf scrub, the wild melon) is a kit still to make.
- [ ] **The GPU verify fails one assert: the core attach audit** (2026-11-11, RTX lane): 97 of 7,302 cards above the ground float,
  1.33% against a 1% limit (biome:bloom 92/916, biome:drape 5/1,084; worst about 0.85 m off with 0.57 m tolerance). Every other
  assert and every negative control passes. After the NW lowlands floor fix (ground bloom clusters on the ground, rhodo blooms held
  in the shrub's cards; branch `claude/infallible-pike-2c68d9`, merged here 2026-11-11) the floaters are the grass trees' flower-spike
  blooms (`biomes/nwlowlands/src/55-biome-nwlowlands-trees.js`, `B.grasstree`), 0.1 m off the spike's rod: a false positive of
  `BIO.attachAudit` (`core/biome/20-core-kit.js` 646-650), which measures an instanced item at points 2 m apart along its axis, not to
  the segment as `core/biome/README.md` says. The audit fix rebuilds every biome page, so it is parked in `TODO.md` ("Ride along with
  the next all-builds rebuild"). The rock's growth adds a little: the NW lowlands' growth pass puts some blooms up to 7 m off any card
  on the ledges (`65-biome-nwlowlands-dress.js`); its flowered curtains (ledge edges, soffits) are off here because they floated worse.
  It stays until the core fix lands, or until the Labyrinth's own flora replaces the stand-in.
- [ ] **No animals yet.** The megafauna wait for `kits/fauna` (PLAN.md section 4); no herd, trail or wallow is drawn.
- [x] **Hazards** (2026-11-11, `src/89h-host-hazards.js`, core/hazard). 178 records:
  - **fall:** every stack's and knob's rim (a 6 m band of boxes along the top outline, so a top's middle is safe), the torn bridge ends, the Hall's broken upper slab and its sheared column;
  - **slip:** the Kimr's rope bridge;
  - **drown:** the pond and the river.

  A host check probes rim, middle and pond, with a negative control. **Still open:** a charge (a herd that runs, a Two-Snout's dropped rock) waits for `kits/fauna`'s herds (PLAN.md section 7, amendment 2).
- [x] **The Hall's materials "drew near-black"** (resolved 2026-11-11). Not a material fault: the kit's own materials, measured by
  readPixels on an 800 x 600 frame, give the Hall's face 53,57,59 against the floor's 124,117,75. The ruin palette (`MAT.ac*R`, the
  darkened instance colours) is toned for the kit sheet's brighter lights. The earlier "near-black" probe readings came from a
  1 x 1 drawing buffer: with the browser pane hidden the window is 0 x 0, so set `renderer.setSize(800,600,false)` before probing.
  `src/89g-host-gate.js` now only clones the kit's materials and lifts their colour 1.7x (`?lift=1` for the kit's own; 2.2x blew the sunlit cells white).
- [x] **The far walls are bedded** (2026-11-11, `src/85-host-far.js`). From 1,700 m up their colour takes KSTRATA's beds (the Rift's
  recipe with its red taken out, dipping east). **Still open:** the walls are the model's 2 km cells with noise spurs and gullies,
  so their shape is soft; their real relief waits for the open world's cut of this region.
- [x] **The knobs, the stacks and the Hall's decks are overgrown** (2026-11-11, `src/89z-host-build.js`): the stand-in flora kit's
  growth on structures (`NWLOW.dress`: moss and plants on the ledges, hanging moss under the soffits, roots and curtains down the
  walls), about 30,000 instances and 360,000 triangles, `?dress=0` to leave them out. Its species change with the flora (above).
- [x] **The Hall read as a black block in the hero view** (2026-11-11). Two causes:
  - **The light:** at 11:00 the sun stands north-north-east here, so the old hero view from the south-west saw only shadowed faces.
    The hero now looks from the east-north-east; the old view is kept as "The Hall from the south bank".
  - **The palette:** the Ancients kit's ruin palette is toned for the kit sheet's brighter lights, so its colours are lifted 1.7x
    on this page (`?lift=`), except the stacks' rock.
- [ ] **The Kimr's pueblo** (PLAN.md section 5, a village on a knob above the gate) is not on this station: the Kimr keep away
  from the Hall (PLAN-GATE.md section 9). It wants `core/hamlet`'s defended platform (PLAN.md section 7, amendment 4).
