# Pinnacle: known issues

- [ ] **The lakes keep the model's 2 km masks.** The smoothing (2026-11-12, `core/world/README.md`, "Smoothing") took
      the staircases, the streaks and the straight river cuts out of the land. The cross-shaped lake west of the K'etsaal
      Baatar's mouth still has square shores: the land round it lies under its level, so only the mask draws it.

- [x] **No mesa in the world** (2026-11-16, relief P4): `src/43p-world-rock.js` pins the rock's KSTACKS bodies, made from
      `settlements/pinnacle-rock`'s layout as its stage makes them, into core/world's landform records; the world's ground
      stands up into them (their tops and walls) and the bands' camps are planned round them. The page draws the same records
      with their overhangs; the world's are a heightfield (no overhang).
- [ ] **The frame rate over the camps** (about 1 fps) is being worked in its own session (pinnacle-perf, 2026-11-10).
- [x] **The savage hyperjungle grew nothing** while the rock stood on the rim. Since the move of 2026-11-10 the
      hyperjungle is in the registry on that overlay (little-demo's pass table). The cut's two overlays (the savage
      hyperjungle and the NE rim) both grow now.
- [ ] **Pinnacle Rock's own page has not moved.** `settlements/pinnacle-rock` still reads its 4.21 cut round the old
      pixel (755,351 on the old canvas, 1027,681 on 5.1). The model's record and this region moved on 2026-11-10; the page
      moves when it is next rebuilt (recut its `region/` at 1007,686, and recheck its rock against the new ground).
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
