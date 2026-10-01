# Krator biome kit — the central hyperjungle: known issues

Read before changing anything here. `build.py` prints the open count.

## Open

- [ ] PUBLISH AFTER EVERY PASS. The claude.ai artifact is a separate copy of
      `dist/hyperjungle.html`; strip everything before `<title>` and the trailing
      `</body></html>` before publishing (00-head.html carries the page wrapper).
- [ ] The four older species' bark textures are pre-coloured, so 55-trees
      normalises each texture's mean before tinting (`texMean`). The mahogany
      and kapok canvases are painted near-grey and tinted from SPECIES.bark only;
      repaint the older four the same way. Until then, changing one of those
      canvases changes the rendered bole colour twice.
- [ ] Ghostwood limbs are slightly warmer than its near-white bole (the pale limb
      texture cannot be brightened past white).
- [ ] Faint horizontal seams where a bole's lathe sections change texture repeat
      (inherited from Girder).
- [ ] Saplings beyond 760 m from the origin have clumps on virtual arcs with no
      bough geometry; fine at that range, wrong if the LOD origin moves.
- [ ] The far impostor ring starts at heroR+30: a host preset that stands inside
      it sees blob crowns at close range. A host should keep cameras inside heroR
      or raise heroR (cost: ~12k tris per hero tree; this host runs 2000 m).
- [ ] The host's floor mesh is Lambert-lit with no shadow maps, so open floor
      between plants reads a shade too bright; the litter colour is painted dark
      to compensate. A world with shadows should lighten `MAT_GROUND`.
- [ ] `dress()` samples by triangle area: a structure with one huge roof plate
      and many small ledges puts most of its moss on the roof. Pass per-shell
      geometry lists (roof, floors, walls) with their own counts if that matters.
- [ ] Fauna: the herds' waypoints avoid boles, saplings, the host mask and its
      obstacles, but not logs or boulders (a strider can walk through a fallen
      trunk). The flyers' paths are tested against boles at their centre only:
      a wide orbit can clip a crown. No predators, nothing lands.
- [ ] Wings and legs move in the vertex shader but their lighting normals do not
      follow the hinge, so a flapping wing does not brighten and darken.
- [ ] Only the hyperjungle is built; the abyssal savannah, Yuni Valley, highlands
      and arctic biomes are to be written against the same core.
- [ ] **Put the biome fruit in the kit** (`biomes/FRUIT.md`): gatepod, mahogany nut, silkpod, pandan keys (the screwpine). Each has a catalog piece in
      `kits/catalog/krator-master-furniture-generic-fruit.js` (`biome: 'hyperjungle'`). The pods are drawn. Add harvest tags. The screwpine's "hanging fruit head" is drawn as an upside-down fungus item (60-floor.js): give it the pandan-key head (orange keys, green tips).

## Done

- [x] Leaf cards are Lambert with a two-sided light mix, an up-bent (or per-clump)
      normal and distance-boosted alpha — no white-out from below, no lace at range.
- [x] Colours are sRGB in / linear out at BIO.put and every bucket write.
- [x] Every biome fragment is grep-checked against the world kits' identifiers.
- [x] `standSp`'s hand-measured quantiles are gone: the stand field is sampled at
      build time and split at the quantiles for the target shares (six species).
- [x] Fauna (flocks, flitters, butterflies, motes, herds, sloths) as fragment 58
      on the same contract, with 35-core-anim as the one core extension.
