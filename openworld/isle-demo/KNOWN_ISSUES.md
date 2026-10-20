# openworld/isle-demo: known issues

- [x] **The Islanders' pieces tiled their textures 1.5x denser here than on the city page** (2026-10-20, found by M7's
      export comparison; fixed the same day). The scale here was the kit's own: `kits/islanders/materials.json`, which the
      kit's page reads (`TILE[k]` from `KMAT.packed('islanders', k).scale`, e.g. patWeave 1.6 m). The city page drew the
      kit without its pack: each Beast Riders town sealed in the CAT bundle (`kits/beast-riders/towns.py`) carried its own
      `core/materials/record`, whose last line set `window.KMAT`, so CAT replaced the page's KMAT and every pack
      registered before it. The city page loads ISK after CAT, so the kit fell back to its untextured keys and its
      painted sheets' canvas stand-ins (`28-is-paint.js`, patWeave 2.4 m); this page loads ISK before CAT, but lost the
      biome kits' packs and the Islanders' to the same swap (the export saw only `mavs` and `iziz`). The seal now keeps a
      town's KMAT and TEX in its closure and hands its pack to the page's KMAT. With every pack on the page, the export
      finds each material in its own kit's pack (`settlements/isle-demo/src/62` `ISLE.libraryOf`, from the pack `58`
      notes on each piece's materials), so the Islanders' maps go to Godot by reference, not as PNGs. Kautoa's export at
      `?town=Kautoa&simAt=362` (box 320,780,820,1220) now hashes the same on both pages in items, materials, buckets and
      textures (seen in the browser pane: items `5a5a30aa9dbc18b1`). Its city section still differs: this page exports one
      town's plan (the city page exports both), and the plans carry their timings (`stats.ms`). Stage, atmosphere and
      water are the world's own. Both Godot cases were cut again from the city page and pass `isle_test.gd`.
- [ ] **The towns are drawn, not lived in yet** (M7, 2026-10-20): the sim is declared and held on this page; running it
      on the world's clock (`HOST.clock`), the citizens near the camera and the canoe line's vessels (the city page's 57,
      59, 61) are next. The world's frame rate over Kautoa is low with the full flora and the near pieces together.
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
