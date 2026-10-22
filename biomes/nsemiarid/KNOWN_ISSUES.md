# Krator biome kit — the northern semiarid country: known issues

Read before changing anything here. `build.py` prints the open count.

## Open

- [ ] **Most of what travels is still a frame.** Since 2026-10-22 the helicopter trumpets turn on core/atmos's wind
      (`86-host-variants.js`: a spin material turns the bell, its throat and its blades about the stalk's top) and the
      seeds fly: the trees round the camera let them go when the wind passes each one's hold (`89c-host-seeds.js`). Still
      drawn as a still frame: the furlers shut in bands where `gustAt` says a gust front is, the frills' fins (the shed
      plumes fly, the fins on the column stay as the frame's stage), the drift lanterns already aloft. The spin is the
      variants' only: `?unique=1` draws the trumpets still (the core's foliage shader has no spin).
- [ ] **The catalog owes the fruit.** Apples, walnuts, apricots, pears, pomegranates, pistachios and almonds are drawn
      (on the trees and as windfall) but `kits/catalog/krator-master-furniture-generic-fruit.js` has no piece for any
      of them, so `fruit` is null and the probe names them (`FRUIT_NOT_DRAWN`). Adding them is a catalog change: every
      build that takes the catalog rebuilds (CLAUDE.md). Pistachio and almond are not in `kits/crops` either.
- [ ] **No highland spurs.** 12% of the region is over 2.5 km (Dsb, Csb, Dfb, Cfb): `PLAN.md` reads nhighlands and
      ebadlands in place there. Not wired yet.
- [ ] **The small and weird are first passes**: lathed and card geometry at a few hundred triangles each, read from the
      owner's two reference boards. Judge them from the shots and say which to push further.
- [ ] **The overlays' plants are not here**: hulk gardens (the rust vine has its tag and item, nothing places it) and the
      pothole pools belong to `biomes/dambasins` and `biomes/scablands` (`PLAN.md` sections 5, 6).
- [ ] **Not in the open world yet.** The kit is ready for `WORLD_KITS` (a pass table, make/grow, record mode); the north
      basin's open world (`openworld/north-basin`, data only) is `PLAN.md` step 6.
- [ ] **The kit's own wind is a long average.** The page's moving wind is core/atmos's (`89b-host-atmos.js`), but what
      the kit places (the travellers' headings, the drifts, the crescents, the frills' shed side) reads `NSEMIARID.WIND`,
      set once by the host: a world with a veering wind should hand the kit its prevailing wind per region.
