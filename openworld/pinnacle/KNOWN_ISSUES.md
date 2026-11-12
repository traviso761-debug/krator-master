# Pinnacle: known issues

- [ ] **The frame's origin moved with the corridors** (2026-11-11): from the rock's pixel (1007,686) to the box's centre
      (1091,690). The rock is now at x -168 km, z -8 km. Anything that placed itself in this region's frame by offsets
      from the origin must add the rock's point: the camps' spec was already relative to the site, so nothing here moved.
      `settlements/pinnacle-rock` does not read this region (it has its own 4.21 cut); when it is rebuilt on the open
      world (the sim's S7), it takes the rock's point from `region.json`'s `sites`, not the origin.
- [ ] **The far roads' stops are the Beast Riders' own** (their roadside inn and a watch tower) on the coyotemen's and the
      Dasri's roads: neither people has a kit. `PLAN.md`, "What is left" 6.
- [ ] **The corridors east of the rock grow nothing** (the crater's east wall, the Nomad Country's sedesert, the Tiers):
      no kit for them in `src/47-world-kits.js`. `PLAN.md`, "What is left" 7.
- [ ] **Fort Kreia's road is a guide**, not the network's: the trunk to Kreia starts at the Crescent and crosses the
      Talon trail. If the network gains a Pinnacle-Kreia leg, switch the corridor to `net`.
- [ ] **The rasters are a file beside the page** (`dist/pinnacle.land.js`, 8.7 MB): written into the page they took it to
      98 % of its 16 MB cap. A page opened without that file has no land. Publishing must carry it (as the texture
      sidecars).

- [ ] **No mesa in the world.** The rock is `settlements/pinnacle-rock`'s own landform (KSTACKS records from its layout).
      The world's ground is the model's: the bands' camps stand round a knoll, not round a 500 m mesa. `PLAN.md`, "What is left" 1.
      On the list for the next scale-model run (the owner, 2026-11-10: `tools/scale-model/README.md`, "To do on the
      model", "Pinnacle Rock's mesa"): a landform record the cut carries and core/world stamps at 1:1.
- [ ] **The frame rate over the camps** (about 1 fps) is being worked in its own session (pinnacle-perf, 2026-11-10).
- [x] **The savage hyperjungle grew nothing** while the rock stood on the rim. Since the move of 2026-11-10 the
      hyperjungle is in the registry on that overlay (little-demo's pass table). The cut's two overlays (the savage
      hyperjungle and the NE rim) both grow now.
- [x] **Pinnacle Rock's own page has moved** (2026-11-12, phase S7 of `core/simulation/PROPOSAL-LONGSONG-PINNACLE.md`): its
      `region/` is re-cut from map 5.1 round px 1007,686, the same 120 km box at 2 km cells, so the page and this region stand
      on one spot.
- [ ] **The clearings are drawn in the Beast Riders kit's buildings on the world's ground** (2026-11-12: four farming
      villages, core/hamlet's `beast-rider` row in `src/48-world-site.js`; `core/world` 88s draws them through CAT). Their
      fields are core/hamlet's; no Beast Rider crop or terrace dressing is laid on them yet.
- [ ] **The live scale model has not taken the move.** The record is changed in the model's source
      (`tools/scale-model/model/src/60-settlements.js`: the default and `SETT_MOVED['5.1e2']`), but the published artifact
      and its database still hold the old pixel. Republishing the model is the owner's call.
- [x] **The NE rim's ground was the default desert's** (red, shaped as a desert). Fixed 2026-11-09: `core/world`
      `BIOME_STYLE` gained a 'savanna' style for the three savannah rims, coloured from the kit's own `GROUND` palette.
      The plan was rebaked on the new land (the stale check caught the move).
- [ ] **The hyperjungle's giants are heavy.** Over the threehorn camp on the RTX 5060 (verify's view 2, 120 m up),
      the frame drew 4,607 records (162 hero, 4,276 far), 17.8 M triangles, at about 1 fps. The isle demo's town HLOD has
      no equivalent here. The hyperjungle's far level and hero reach (`src/47-world-kits.js`, little-demo's numbers) want a
      performance pass before the region is looked at in motion.
- [ ] **No grass.** The kit's floor (its thatch, bunchgrass and vain fronds) is not on the world's floor yet, so the
      parkland reads as bare gold ground between the trees.
- [ ] **The savannah kit's world adapter lives here** (`src/49-world-absav.js`), not in the kit. A new fragment in
      `biomes/abyssal-savannah/src` would change that kit's page, so it moves when that kit's session takes it.
- [ ] **The tents come through `settlements/isle-demo/bundles.py`** (`cat_bundle`). The Beast Riders kit should own its
      bundle (as `kits/xanadu` owns `XAK`). Until it does, this build reads the isle demo's bundler and its piece
      instancer (`58-isle-protos.js`) in place: a lateral dependency, allow-listed.
- [ ] **No floor patches.** `floor: null` for both kits, so the world's floor skips them.
- [ ] **Farmland is a reading, not a crop map.** The resources panel's farmland is warmth x water x flat x soil from the world's
      fields (core/world/49r-world-resources.js `farm`); it does not ask kits/crops what grows there (no climate-to-band
      mapper exists yet) and the scale model has no soil layer.
- [ ] **Proposals live in the browser until they are sent or exported.** `93-world-propose.js` keeps them in localStorage
      per region; clearing the site data loses unsent ones.
