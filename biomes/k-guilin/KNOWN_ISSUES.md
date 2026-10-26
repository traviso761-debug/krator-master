# k-guilin — known issues

Forked from `biomes/guilin` (2026-10-26); the issues guilin carried that the fork keeps are listed again here, so this
file is the whole list for this kit.

- [x] **Roots hung off the stacks** (the owner's review, 2026-10-26): trees on a tower's top now keep their whole root
      spread on the rock (moved in, or not placed); the cliff figs, whose spread no top holds, stand at the towers' feet with
      their roots on the ground. Host check `roots stay on the rock or the ground` (6,973 trees on rock, 85 figs, 0 failing).
- [ ] **No root curtains.** With the figs at the feet nothing hangs down the faces but the kit's own creepers and the rock
      figs among the cliff points (guilin's). A fig that roots on a ledge and drops curtains would need a top wider than any
      here, or a smaller fig than nwbay's variants grow.
- [ ] **Trigon is not drawn.** The Hykkousoi city stands 5 km east of the page on the lake's south shore; there is no
      Hykkousoi building kit yet (`LORE.md` §6.16). PLAN.md question 3: draw it on the horizon when one exists.
- [ ] **The wet season only.** The model makes the plain tropical savanna (Aw: a wet season and a dry one); the page shows
      the wet season (water in the wadi's channel, green paddies). A dry-season state (the channel dry, stubble, straw
      grass) is a later view (PLAN.md section 7).
- [ ] **guilin's Earth trees in a +32 °C climate.** Masson and Yunnan pines, ring-cupped oaks and osmanthus are
      subtropical; they are kept as the owner asked (PLAN.md question 1 asks whether the pines give way to a Krator species).
- [ ] **151-159 draw calls** against guilin's 37-43: nwbay's borrowed species are drawn as its variants (one instanced
      item per variant part: nine species, six variants, two levels). Under the page's budget (220). nwbay's host option
      `bakeBark` (the bark baked into the kit's buckets) would take most of the bark's calls back if the page needs them.
- [ ] **nwbay read in place moves this page.** A change to nwbay's species, trees or variants (its `50`, `55`, `56`) or its
      pack changes k-guilin's borrowed trees; rebuild and verify k-guilin with nwbay (the owner chose this, 2026-10-26).
- [ ] **The lake's far shore is the model's, not drawn.** The open water runs north off the page into the haze; the far
      lake is flat water under the page's (`WATER.open` with a mask), the far ring's land follows the page's shore line.
- [ ] **The far ring and towers are view-only** (no records: an open world placing this kit must make its own).
- [ ] **No catalog fruit for the pomelo, the osmanthus flowers or bamboo shoots** (guilin's; `FRUIT_NOT_DRAWN` in
      `99-host-take.js`). Adding them touches `kits/catalog`, which every furnished build takes.
- [ ] **A tree on a dome's slope can stand up to ~1 m proud of the wall** where a bed's chamfer pulls the mesh in
      (guilin's: the layout's wall is a straight line from foot to top).
- [ ] **The paddies are flat cards** (one per field, its state's colour), with tufts only near the LOD spine (guilin's).
- [ ] **No villages, rafts or people; no fauna.** The bay people's farm villages would be `core/hamlet`; nwbay's fauna
      (soarers, darters) could be read in place as its species are.
- [ ] **Not in Godot yet**: the rock is meshes made from KSTACKS records (exported as `KGUILIN.records()`).
