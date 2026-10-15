# openworld/isle-demo: known issues

- [ ] **No flora yet** (P3b). The Ring Sea isles kit places its trees through its own showcase build (`RINGISLES.build`,
      the borrowed kits' trees by their own `make`/`grow`). The world's flora (little-demo's 84 nursery, 85 flora) wants
      every species as a growable prototype with a pass table.
- [ ] **little-demo's flora tiles sample a fixed list of fields** (`85-world-flora.js` `fieldGrid`: h, water, slope,
      wet...). For the isle fields to reach a flora tile, that list must be built from `WORLD.FIELDS`. This is a
      one-line change there, to make with the flora step; little-demo's values stay the same.
- [ ] **No shallow-water flora.** The world's mask (`45-world-host.js`) admits only land, so the isles kit's lagoon and
      reef passes cannot place yet.
- [ ] **The coast is the scale model's**, a 4 km grid's shore. The coast fields (beach, mangal, lagoon, reef, bench)
      are only as wide as its slope makes them. A fringing reef, lagoons and mangrove bays drawn as terrain belong to
      P3b.
- [ ] **No geyser fields.** The vents are in "Go to" and carry the `floor` field, but nothing draws a geyser there yet
      (the geyser kit's `GEYSER.cluster`, P3b).
- [ ] **From high up, the sea is the sea floor.** The water is drawn on a window round the camera (little-demo's
      `83w-world-seas.js`), so the overview shows the brown floor beyond it. This is the same in little-demo.
- [ ] **Headless verify fails on this machine** (2026-10-15). SwiftShader throws "Cannot read properties of null
      (reading 'trim')" compiling the sky's capture (`ATMOS.skylight`'s PMREMGenerator, called from little-demo's
      `83w-world-seas.js`), so the page stops at start.
      - **The same happens to little-demo's own page here, committed sources included.** It comes from this machine,
        not from this build.
      - **In the browser pane (a real GPU) both pages load clean.** The isle's checks and negatives were run there,
        and little-demo's checks read as they did (its one failing check, the highways, is in its own
        KNOWN_ISSUES.md).
