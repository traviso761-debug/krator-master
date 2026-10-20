# openworld/isle-demo: known issues

- [ ] **The Islanders' pieces tile their textures 1.5x denser here than on the city page** (2026-10-20, found by M7's
      export comparison): `ISK.proto` gives the same pieces the same positions, normals and indices on both pages, but on
      15 of Kautoa's case's 285 items the UVs are exactly 1.5x the city page's. The kit is stable within a page, so it is
      the page's texture set-up the kit reads at load (its `TILE` from `KMAT.packed(KIT.pack, ...)` or its fallback; the
      two pages register different `KMAT.packs`). It predates M7 (the hamlets draw the same pieces). Find which scale is
      the kit's own and make both pages read it; until then the Godot cases stay cut from the city page.
- [x] **The towns lived in** (2026-10-20, `88c-world-life.js`): the sim on the world's clock, the citizens near the
      camera, the canoe line at its berths and under way on a sea route. Left: the world's light still ignores the clock
      (below), and the frame rate over Kautoa is low with the full flora, the near pieces and the citizens together.
- [ ] **The towns' streets and massing read pale** under the world's light (the city page's colours, drawn under a
      brighter sun and another exposure): a tone pass on 60's colours for the world, or the world's light, is owed.
- [ ] **Catching up costs a few seconds of slow frames** after load (the sim from midnight to the clock's 11:30, at
      most 14 ms a frame while more than an hour behind). A saved day (the sim's state at a minute) would remove it.
- [ ] **One registry per town** (M7): each town keeps its city-page registry in its own frame (so ids and the export
      match the city page); the hamlets keep theirs. A region registry in world coordinates is still to do.

- [ ] **The world's light ignores the clock** (2026-10-19). `core/clock` runs here now (the hamlets' felling reads it), but
      the sun (`HOST.SUN_DIR`) and the atmosphere (`ATMOS.init`'s `hour: () => 11.5`, little-demo's `83-world-water.js`)
      are still pinned at 11:30. Moving them onto `HOST.clock.hour` is little-demo's change, for both worlds.
- [ ] **The hamlets were seen in the browser only at the lumber village** (2026-10-19). The salt village, the mine and the
      ranch are checked by their data (`verify.py`'s hamlet check), not yet by eye.
- [ ] **The lumber village's stand is nearly all saplings** at the default felling rate (`core/hamlet/PLAN.md`, H4): a
      tuning call for the owner.

- [x] **The climate classes stepped along the 2 km pixel grid** (2026-10-15, seen from above in the site planner): the
      class weights (43-world-isles.js `classWeights`) now blend the four pixels round a warped point between their
      centres, so a boundary bends. The ground's colour and the flora's class weights both follow; the checks pass again
      (184,431 records at Kautoa).

- [x] **The flora** (P3b, 2026-10-15): the isles kit in the world through `RINGISLES.world()`, one entry per registry.
      little-demo's flora tiles now carry every `WORLD.FIELDS` field, and a kit without a floor lays none (both no-ops
      for little-demo).
- [ ] **The floor is sparse** next to the kit's own page: the world tiles 32 m patches of `buildFloor`, fewer plants
      a patch than the showcase lays. Tune the patch density or the kit's floor weights.
- [x] **Shallow-water flora** (2026-10-15): seagrass and coral heads, placed by `inWater` passes in their depth windows.
- [ ] **Flora tiles are slow with the water passes**: a 512 m tile takes up to about 16 s to fill near the coast, and
      the frame rate drops while the tiles fill. The seagrass pass (cell 4 m) is the heaviest.
- [x] **The coast as terrain** (2026-10-15, `WORLD.landHook`): lagoon, reef crest with passes, fore reef, mangrove
      flats. little-demo's height function gained the opt-in hook (null there).
- [ ] **The lagoon and the reef do not show through the water** near the camera: core/water has no depth absorption
      yet (ROADMAP section 9). They show in the surf on the crest and from above, where the ground's sea colour
      reads them.
- [x] **The geyser fields** (2026-10-15, `89-world-geysers.js`): laid at start, built per site when the camera comes
      near. Only the 14 vents of kind `geyser` count; the two without a kind are skipped.
- [ ] **The geyser sites' ground is a little yellow** next to the geyser kit's own page: the savanna's ground shows
      through where the sinter paint fades. The sinter's tone was turned down once (it read too bright).
- [x] **The sea at every height** (owner, 2026-10-15): the ground under the sea is coloured by its depth, so beyond
      the water window round the camera the sea still reads as sea. A lighter band shows where the window ends,
      seen from 260 km up.
- [ ] **Headless verify fails on this machine** (2026-10-15). SwiftShader throws "Cannot read properties of null
      (reading 'trim')" compiling the sky's capture (`ATMOS.skylight`'s PMREMGenerator, called from little-demo's
      `83w-world-seas.js`), so the page stops at start.
      - **The same happens to little-demo's own page here, committed sources included.** It comes from this machine,
        not from this build.
      - **In the browser pane (a real GPU) both pages load clean.** The isle's checks and negatives were run there,
        and little-demo's checks read as they did (its one failing check, the highways, is in its own
        KNOWN_ISSUES.md).
