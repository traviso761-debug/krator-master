# Xanadu, Oidong and the High Rift: known issues

- [ ] **Route A is 244 km at the plan's pixels, not ~82 km.** The Twins plan's itinerary (`biomes/twins/PLAN.md` 3.1) gives
      A1 938,1496 > 978,1468 (98 km at 2 km a pixel; the plan says ~40 km) and its sprints 9 km each (the plan: 3-4 km). The tubes
      are laid at the plan's pixels as asked; the plan's kilometres read as if a pixel were ~0.8 km. Either the line or the text
      wants the owner's word before the recut.
- [ ] **The tubes' portals lie on the uncarved ground.** The Twins' sculpt is not on the map, so the mouths open wherever the
      model's ground is at the spec's points: the feeder's Strongbow portal is a ramp down into flat ground (a pit mouth), its SE
      Twin gasp climbs a steep flank as an open trench. The floors are laid at a depth, so they follow the sculpt;
      the portals' points may want moving to the sculpted brows (the spec's `at`), data only.
- [ ] **Up to 630 m of rock over a tube.** The floor keeps its 8 % grade under the uncarved ridges, so A1 and A2 run deep
      under the Godthrone's shield ramp in places; skylights are only drawn where the cover is under 60 m.
- [ ] **The tubes have no fixtures yet.** The Hall of the Tally-Marks is a hall with its roof crack; its carved cistern, the
      guides' iron torch brackets and the curb-ledge causeways' cairns are not drawn. No hazards (core/hazard) in the tubes (W5).
- [ ] **A square of tube costs ~170 ms of meshing** (1 m cells), spread over the frames at 5 ms a frame; the feeder's cliff
      portal, with seven holes, ~2 s. Running at Shift speed underground stays ahead of it; flying fast through a tube can
      outrun it (the far end of the streamed tube shows the dark).
- [ ] **The tubes are not in Godot yet.** The plan is data (42k) and the shape is KCAVERN's (its export and load); the
      drawing (88k) is the preview's. A Godot region would plan the same records and mesh the squares from KCAVERN's export.

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
- [ ] **Tiles are slow to place.** Measured 2026-11-11 (RTX 5060, a 5 x 5 block south of Erehwon): 99 ms a 512 m tile,
      43 % of it `WORLD.H`, which the Xanadu kit's `zones()` asked for every candidate though few passes read it. It now
      reads it lazily (`biomes/xanadu/src/55-biome-xanadu-trees.js`): 55 ms a tile, with the same 15,814 records (hash
      `ebd78a8d`). Settling the start view places its 95 tiles in 6.6 s, down from 11.6 s. What is left: the kit's
      fields and fbm per candidate, and the per-tree checks in core/world 85 (`WORLD.H`, `townW`, `roadD`). A cheaper
      ground read during placement would be core/world's change and would move trees slightly.
- [ ] **The villages stand at given bearings.** They are 6 to 12 km out round the towns (`src/48-world-site.js`), each
      searched for good ground within 3 km. busy-keller's hinterland survey, lifted into core, would place them by the
      land's fitness. They have no farmland yet.
- [ ] **The villages are not on core/simulation.**
- [ ] **Farmland is a reading, not a crop map.** The resources panel's farmland is warmth x water x flat x soil from the world's
      fields (core/world/49r-world-resources.js `farm`); it does not ask kits/crops what grows there (no climate-to-band
      mapper exists yet) and the scale model has no soil layer.
- [ ] **Proposals live in the browser until they are sent or exported.** `93-world-propose.js` keeps them in localStorage
      per region; clearing the site data loses unsent ones.
- [ ] **The world holds none of Erewhon's own relief.** The page (`settlements/xanadu`, target erewhon) faces as the world
      does and stands with its centre on the pin, unturned (`ER_WORLD`, the owner, 2026-11-11), and its shore runs within
      ~250 m of the world's. But the world's 1:1 ground there is the model's 2 km cells smoothed: a 4 % rise from the shore,
      no 90 m cliff, no palace plateau. Only a bake of the page's ground into the world as a town grid would give it that
      (`openworld/isle-demo/src/48t-world-towns.js` does this for the isles' towns); nothing here does yet.
- [ ] **The landform stamp is this region's, not core's.** `src/44-world-landforms.js` chains on `WORLD.landHook` after
      core/coast's `44c` (merged 2026-11-15), which also takes the islands into its coast field (`KCOAST.build({islands})`)
      for their beaches and cliffs; both read region.json's `landforms`. Lift the stamp into core/world or core/coast when a
      second region has landforms; the verify's island check catches a hook that does not chain.

- **The pitched camps (2026-11-23, `src/48t-world-camps.js`, `88t`; settlements/xanadu/WORKS-PLAN.md W2).** The Golden Tears'
  camp (`WORLD_CAMPS` in `src/48-world-site.js`, site `stearscamp01` in openworld/SITES.json) is outside this region's cut (60 km
  from its nearest cut ground), so the page reports it awaiting the recut and draws nothing; `tests/test-world-camps.js` proves
  its ring on synthetic ground. The camps are planned at load, not baked (core/world's 48s pitches only the Beast Riders' camps),
  and their tents are massing in their dress's colours (no Tents kit bundle for another world yet): TODO.md.
