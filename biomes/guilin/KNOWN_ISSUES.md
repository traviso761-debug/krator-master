# guilin — known issues

- [ ] **Not placed on the scale model.** The kit is a showcase of the South China karst. Where Krator has such a plain
      (a wet subtropical lowland on limestone) is the owner's call. `biomes/WORLD.md` has the row.
      Stays open (2026-10-25): owner decision (where the plain sits).
- [ ] **No cards of its own.** The bamboo's narrow leaves, rice and silvergrass, ferns, moss, the lotus and the stone
      orchid are procedural canvas textures: the library has no bamboo-leaf, rice, lotus-from-above or Dendrobium card.
      The camphor, osmanthus, banyan and oak share `card.broadleaf` tinted. Prompts to add to
      `core/materials/PROMPTS-NEEDED.md` if the owner wants them: `card.bamboo.leaf`, `card.rice`, `card.lotus.pad`,
      `card.orchid.dendrobium`, `card.osmanthus`.
      Stays open (2026-10-25): textures owed (prompts for the owner, PROMPTS-NEEDED.md).
- [ ] **The plain's grass** is `ground.leafy_grass` greened in the ground's shader (`47`, `vec3(0.55,0.86,0.4)`): the
      library has no green paddy-country grass.
      Stays open (2026-10-25): texture owed (no green paddy grass in the library).
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
