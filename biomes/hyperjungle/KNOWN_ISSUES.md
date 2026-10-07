# Krator biome kit — the central hyperjungle: known issues

Read before changing anything here. `build.py` prints the open count.

## Open

- [ ] (2026-10-05) Fauna sheets are an opt-in hook, not a look: `HYPERJUNGLE.FAUNATEX = {wing, fur, hide, ray}` (THREE.Texture or image URL) set before
      58-biome-hyperjungle-fauna.js maps fur on the sloth, hide on the striders, skin on the sky rays and a wing cut-out on the butterflies. Unset, the fauna is
      exactly the vertex-coloured one. The dart/flitter material takes no texture (wing and body share UVs). Each part's UV repeats once over the part, so the
      fur is set to repeat 2x.
- [ ] (2026-10-05) Tree tints (55-biome-hyperjungle-trees.js): roots now take the trunk's tint at their height above the ground (band and moss), carried into limb space because they stay in the `limb` bucket (60-floor's `boleProfile` reads the bark bucket, so roots there would push the floor dress away), and limbs, boughs
      and twigs use the limb tint of the trunk's colour band at the attachment height. The limbs still use the shared pale `limb` texture; only their colour is
      matched to the trunk. Iziz carries a hand-patched copy.

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

- [x] `dress()` per shell (Oct 2026): `BIO.faceSamples` takes `{geos, share}` shells (roof, floors, walls), each
      sampled by area with its own share of the count (`core/biome/40-core-place.js`, `test-place.js`). A plain
      list draws as before; this host's tower still passes one.

- [x] On the shared core (`core/biome/`, Oct 2026), with the core's helpers as globals in
      `41-hyperjungle-globals.js`. Geometry checked by mesh fingerprints against the kit's own core:
      every pass's triangles and every item's count identical, trees, dress and fauna bit for bit. Eight
      floor items placed round the boles (fronds, moss mats, ribbons, fungus, rods, strands, blooms,
      under-cards) differ in 32-813 instances each: `boleProfile` now reads the bark bucket's Float32
      store (the GPU's precision) where it read doubles, so a ring or a keep-clear test can fall the
      other way and that plant lands elsewhere by its tree. `standQuantiles` and the fauna read
      `BIO.center()` (the core keeps `host.origin` as a list).

- [x] Leaf cards are Lambert with a two-sided light mix, an up-bent (or per-clump)
      normal and distance-boosted alpha — no white-out from below, no lace at range.
- [x] Colours are sRGB in / linear out at BIO.put and every bucket write.
- [x] Every biome fragment is grep-checked against the world kits' identifiers.
- [x] `standSp`'s hand-measured quantiles are gone: the stand field is sampled at
      build time and split at the quantiles for the target shares (six species).
- [x] Fauna (flocks, flitters, butterflies, motes, herds, sloths) as fragment 58
      on the same contract, with 35-core-anim as the one core extension.

- [ ] **Library barks are opt-in** (2026-10-06): `materials.json` and `tex/` hold each hypertree's library bark (Girder's
      settings; the crimson kapok takes `bark.plates.glossy`). A page that inlines the pack (the Throne's kipuka station)
      gets library boles and its roots, limbs and twigs on the same map (`HYPERJUNGLE.LIB`, buckets 'limb'+sp). This kit's own
      page carries no material record, so it still draws the procedural barks and the shared pale limb texture.
- [x] The screwpine's second-head stem rendered nearly white (an untextured rod given the textured trunk's tint): fixed
      2026-10-06 (60, `screwpine`).
