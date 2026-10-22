# Krator biome kit — the northern semiarid country: known issues

Read before changing anything here. `build.py` prints the open count.

## Open

- [ ] **Nothing moves yet.** The helicopter trumpet's funnel does not spin, the furlers do not shut as a gust passes, the
      frills do not shed and the drift lanterns do not lift: each is drawn as a still frame (a funnel at some angle,
      furlers shut in bands where `gustAt` says a gust front is, fins and bulbs already aloft downwind). The seed weather
      (`89-host-seeds.js`) is the one moving thing. Spin and furl on core/atmos's wind (`ATMOS.windAt`; in Godot
      `atm_wind`) are next: the funnel is one instanced item, so its spin is a per-instance rotation in its shader.
- [ ] **The catalog owes the fruit.** Apples, walnuts, apricots, pears, pomegranates, pistachios and almonds are drawn
      (on the trees and as windfall) but `kits/catalog/krator-master-furniture-generic-fruit.js` has no piece for any
      of them, so `fruit` is null and the probe names them (`FRUIT_NOT_DRAWN`). Adding them is a catalog change: every
      build that takes the catalog rebuilds (CLAUDE.md). Pistachio and almond are not in `kits/crops` either.
- [ ] **No highland spurs.** 12% of the region is over 2.5 km (Dsb, Csb, Dfb, Cfb): `PLAN.md` reads nhighlands and
      ebadlands in place there. Not wired yet.
- [ ] **The alien cards are procedural.** `materials.json` (2026-10-22) wires the library for the round, lobed, small,
      broom and blossom leaves, the litter, six barks and seven ground layers (`45-host-stage.js` `GL`). The frill's fins
      and the sail candelabra's blades (`fin`), the seed plumes (`pappus`), the feather grass (`stipa`) and the
      tumblers' tangle (`tangle`) have no library set and stay painted in code: their prompts are in
      `core/materials/PROMPTS-NEEDED.md`, section 7, with two optional surfaces (saxaul bark, the lake floor's shells).
- [ ] **The small and weird are first passes**: lathed and card geometry at a few hundred triangles each, read from the
      owner's two reference boards. Judge them from the shots and say which to push further.
- [ ] **The overlays' plants are not here**: hulk gardens (the rust vine has its tag and item, nothing places it) and the
      pothole pools belong to `biomes/dambasins` and `biomes/scablands` (`PLAN.md` sections 5, 6).
- [ ] **Not in the open world yet.** The kit is ready for `WORLD_KITS` (a pass table, make/grow, record mode); the north
      basin's open world (`openworld/north-basin`, data only) is `PLAN.md` step 6.
- [ ] **The wind is the kit's, not the world's.** `NSEMIARID.WIND` is set once by the host; a world with a veering wind
      should hand the kit its prevailing wind per region (the travellers' headings are a long average, not today's wind).
