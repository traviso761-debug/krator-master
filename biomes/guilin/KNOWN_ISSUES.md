# guilin — known issues

- [ ] **Not placed on the scale model.** The kit is a showcase of the South China karst. Where Krator has such a plain
      (a wet subtropical lowland on limestone) is the owner's call. `biomes/WORLD.md` has the row.
      Stays open (2026-10-25): owner decision (where the plain sits).
- [x] **Cards of its own.** Closed 2026-10-26: every plant but the broadleaf share is a library card: rice (`card.crop.rice`, young, grown and ripe rows:
      items `riceyoung`, `rice`, `riceripe`), the bamboo leaf (`card.bamboo.giant`), the stone orchid (`card.orchid.dendrobium`), silvergrass and
      its plumes (`card.reed` cells), ferns (`card.fern.green`), moss (`card.moss`), the lotus (`card.lotus`, `card.lotus.bloom`). A slot the pack cuts
      takes the geometry's whole uv (`CU`). The camphor, osmanthus, banyan and oak still share `card.broadleaf` tinted (`card.osmanthus` is owed).
      The two new rice items cost two draw calls.
- [x] **The plain's grass** is `ground.grass.lush` (full colour, 1.5 m; a x0.95 multiplier in `47`), no longer `ground.leafy_grass` greened. Done 2026-10-26.
- [ ] **No catalog fruit for the pomelo, the osmanthus flowers or bamboo shoots** (`kits/catalog`
      `krator-master-furniture-generic-fruit.js`). They are listed in `FRUIT_NOT_DRAWN` (`99-host-take.js`). Adding them
      touches the catalog, and every build that takes it would need a rebuild.
      Stays open (2026-10-25): touches kits/catalog, which every furnished build takes (a wider rebuild).
- [ ] **A tree on a dome's slope can stand up to ~1 m proud of the wall** where a bed's chamfer pulls the mesh in. The
      layout's wall height is a straight line from foot to top, which is the mesh's to its notch and chamfer. The slopes'
      shrub skin hides it.
      Stays open (2026-10-25): the layout's wall is a straight line; the tower profile now in KSTACKS.tower keeps the rock unchanged, so the gap is the same. A design task.
- [ ] **The paddies are flat cards** (one per field, its state's colour), with tufts only near the LOD spine. From the
      air they read as a patchwork, as paddies do; up close they are cards.
      Stays open (2026-10-25): design task (fields as meshes); out of budget.
- [ ] **No villages, rafts or people.** It is a biome kit. A Li River village (the Zhuang and Yao), the bamboo rafts and
      the cormorant fishers would be a settlement on `core/city` and `core/hamlet`.
      Stays open (2026-10-25): a settlement on core/city and core/hamlet, not this kit.
- [ ] **No fauna.** Water buffalo in the paddies, egrets and cormorants on the river, macaques on the towers belong to
      `kits/fauna` (`biomes/README.md`, "A fauna kit").
      Stays open (2026-10-25): belongs to kits/fauna.
- [ ] **The horizon's towers are not records**: drawn for the view only, so an open world placing this kit must make
      its own.
      Stays open (2026-10-25): a design choice (view-only); an open world must make its own.
- [ ] **Not in Godot yet**: the rock is meshes made from KSTACKS records (exported as `GUILIN.records()`).
      Stays open (2026-10-25): the Godot port of KSTACKS meshes is a separate task (core/terrain).

## Open

- [ ] **The shared sky (SKY-PLAN.md section 9, 2026-10-26): the look to judge.** The painted dome and the giant mesh are
      gone; `89s-host-sky.js` calls `ATMOS.skyBiome` (core/atmos) on the host clock: the page opens at 06:00 on game start's
      day (dawn), `#hour=13` is about the old fixed light. It read the hyperjungle's dome in place; now its own shared sky
      with the hyperjungle's canopy lines (ridges). The night module (necanyons' 89n, read in place) keeps its hooks; the
      sky drives the lights, fog and exposure over it each frame. Draw calls at the default camera (verify.py --assert,
      GPU): 40 before, 38 after.

