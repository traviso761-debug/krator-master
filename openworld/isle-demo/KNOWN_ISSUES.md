# openworld/isle-demo: known issues

- [x] **The flora** (P3b, 2026-10-15): the isles kit in the world through `RINGISLES.world()`, one entry per registry.
      little-demo's flora tiles now carry every `WORLD.FIELDS` field, and a kit without a floor lays none (both no-ops
      for little-demo).
- [ ] **The floor is sparse** next to the kit's own page: the world tiles 32 m patches of `buildFloor`, fewer plants
      a patch than the showcase lays. Tune the patch density or the kit's floor weights.
- [ ] **No shallow-water flora.** The world's mask (`45-world-host.js`) admits only land, so the isles kit's lagoon and
      reef passes cannot place yet.
- [x] **The coast as terrain** (2026-10-15, `WORLD.landHook`): lagoon, reef crest with passes, fore reef, mangrove
      flats. little-demo's height function gained the opt-in hook (null there).
- [ ] **The lagoon and the reef do not show through the water** near the camera: core/water has no depth absorption
      yet (ROADMAP section 9). They show in the surf on the crest and from above, where the ground's sea colour
      reads them.
- [ ] **No geyser fields.** The vents are in "Go to" and carry the `floor` field, but nothing draws a geyser there yet
      (the geyser kit's `GEYSER.cluster`, P3b).
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
