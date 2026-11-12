# Xanadu, Oidong and the High Rift: known issues

- [ ] **Most of the region grows nothing.** Only the Xanadu and Oidong overlays have kits here. The High Rift
      (21,261 px), the Godthrone's flank, the rift rim, the twins, Opal Valley and Godshearth are bare ground for now
      (`PLAN.md`, "What is left" 1).
- [ ] **The links between the towns are not laid.** Erehwon–Qiblai (415 km) and Qiblai–Longsong (568 km) are in
      `plan/sites.json` (`links`), but the build leaves them out of `WORLD_DATA.roads`. Laid, their fill buried a carved
      river channel at (-569 km, -70 km), near Theodiga: 27.6 m of road over the ground and a dry river station. The
      world has no bridge yet.
- [ ] **The Xanadu overlay's green is a wrapper.** core/world 41 has no style for the 'xanadu' overlay (it takes the desert's),
      so `src/43-world-xoh.js` re-colours `WORLD.ground` there by wetness. The land is still shaped as desert (terraces at
      55 m steps). The core fix is parked in `TODO.md` ("Ride along"). The High Rift, Godthrone, twins and the other
      kit-less overlays are still the desert's red.
- [ ] **The Xanadu kit's lake shore does not grow.** The kit reads its shore from the ground's absolute height (`Z.h`
      between 2.5 and 10 m, its page's lake at 0). In the world that is the real height, so `Z.shore` is 0 and its
      shore and river-mouth stands are missing.
- [ ] **The Xanadu kit's pass table is a copy.** `src/49-world-xanadu.js` copies the kit's `pass(...)` calls (31 passes
      and the diversity pass's 3). When the kit changes them, this copy does not follow; the kit should carry
      `XANADU.PASSES` as Oidong does. Its fairy rings, hornbeam arches and enchanted grove are not passes and are not
      placed.
- [ ] **No pale flats in the Oidong Valley.** The kit's `flat` field is 0 everywhere (`src/43-world-xoh.js`), so its
      flats and their plants (cloud pines leaning, peyote, stone-blooms) do not grow.
- [ ] **Tiles are slow to place.** About 166 ms a 512 m tile over Erehwon's villages: the Xanadu kit's zones and the
      villages' keep-clear test. They want a look in the performance pass.
- [ ] **The villages stand at given bearings.** They are 6 to 12 km out round the towns (`src/48-world-site.js`), each
      searched for good ground within 3 km. busy-keller's hinterland survey, lifted into core, would place them by the
      land's fitness. They have no farmland yet.
- [ ] **The villages are not on core/simulation.**
- [ ] **Farmland is a reading, not a crop map.** The resources panel's farmland is warmth x water x flat x soil from the world's
      fields (core/world/49r-world-resources.js `farm`); it does not ask kits/crops what grows there (no climate-to-band
      mapper exists yet) and the scale model has no soil layer.
- [ ] **Proposals live in the browser until they are sent or exported.** `93-world-propose.js` keeps them in localStorage
      per region; clearing the site data loses unsent ones.
- [ ] **The lake's small islands are records only.** Scale-model edit 5.1-512 wrote the Pleasure Dome's isle and a stack
      as landforms (`tools/scale-model/model/data/landforms.json`). Each one's cell is a 40 m shoal; core/world does not
      stamp them at 1:1 yet.
- [ ] **Erewhon's page and the world disagree on its ground.** The page (`settlements/xanadu`, target erewhon) draws its own
      terrain (lake at -0.5 m, its island at `ISLAND_C`). The world's town now stands on the caldera lake's south shore,
      with the lake to the north; the page has not been fitted to it.
