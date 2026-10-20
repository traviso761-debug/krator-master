# guilin — known issues

- [ ] **Not placed on the scale model.** The kit is a showcase of the South China karst. Where Krator has such a plain
      (a wet subtropical lowland on limestone) is the owner's call. `biomes/WORLD.md` has the row.
- [ ] **No cards of its own.** The bamboo's narrow leaves, rice and silvergrass, ferns, moss, the lotus and the stone
      orchid are procedural canvas textures: the library has no bamboo-leaf, rice, lotus-from-above or Dendrobium card.
      The camphor, osmanthus, banyan and oak share `card.broadleaf` tinted. Prompts to add to
      `core/materials/PROMPTS-NEEDED.md` if the owner wants them: `card.bamboo.leaf`, `card.rice`, `card.lotus.pad`,
      `card.orchid.dendrobium`, `card.osmanthus`.
- [ ] **The plain's grass** is `ground.leafy_grass` greened in the ground's shader (`47`, `vec3(0.55,0.86,0.4)`): the
      library has no green paddy-country grass.
- [ ] **No catalog fruit for the pomelo, the osmanthus flowers or bamboo shoots** (`kits/catalog`
      `krator-master-furniture-generic-fruit.js`). They are listed in `FRUIT_NOT_DRAWN` (`99-host-take.js`). Adding them
      touches the catalog, and every build that takes it would need a rebuild.
- [ ] **A tree on a dome's slope can stand up to ~1 m proud of the wall** where a bed's chamfer pulls the mesh in. The
      layout's wall height is a straight line from foot to top, which is the mesh's to its notch and chamfer. The slopes'
      shrub skin hides it.
- [ ] **The paddies are flat cards** (one per field, its state's colour), with tufts only near the LOD spine. From the
      air they read as a patchwork, as paddies do; up close they are cards.
- [ ] **No villages, rafts or people.** It is a biome kit. A Li River village (the Zhuang and Yao), the bamboo rafts and
      the cormorant fishers would be a settlement on `core/city` and `core/hamlet`.
- [ ] **No fauna.** Water buffalo in the paddies, egrets and cormorants on the river, macaques on the towers belong to
      `kits/fauna` (`biomes/README.md`, "A fauna kit").
- [ ] **The horizon's towers are not records**: drawn for the view only, so an open world placing this kit must make
      its own.
- [ ] **Not in Godot yet**: the rock is meshes made from KSTACKS records (exported as `GUILIN.records()`).
