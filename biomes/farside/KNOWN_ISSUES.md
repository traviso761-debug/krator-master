# biomes/farside: known issues

Open items are `- [ ]`; `build.py` counts them. Close an item when the fix is in and verified.

- [ ] **The animals are placeholders** (the owner, 2026-10-26): `FARSIDE.FAUNA_PLACEHOLDERS` holds the seven of PLAN.md
  section 5 as data; nothing is drawn. The Farside goat is a breed of `kits/fauna`'s goat; the lung octopus wants the new
  segment-chain builder and gait in `kits/fauna` (the owner's choice); the mudfish, whelk, sea hare, bloom slug and chiton
  ride the fauna kit's fish and slug chains. A fauna session builds them; this kit then places them by zone.
- [ ] **The works are drawn by the host** (`86-host-works.js`), simply, and tagged as Eternian furniture to be backported
  into `kits/eternian` the next time it is rebuilt (its `KNOWN_ISSUES.md`); then this page places the kit's pieces.
- [ ] **The native forest is thinner than a wet forest** in the fog belt: `biomes/nwlowlands` grows at its own stocking
  (`DENS .4`) times the station's `natives.q` (1.4 in the fog belt, 1.1 at the front), and its floor is its own. A denser
  canopy wants a higher q (triangles) or a stocking knob in that kit (not this kit's file).
- [ ] **The spray coral's terraces are coarse**: the ground mesh's ~7 m cells soften the 2.6 m treads into a stepped slope;
  since the owner's review (2026-10-26) 3D colonies (staghorn, plate shelves) and coral lips along the risers carry the look. A finer inset over the cove (a `KFIELD` inset, or a separate terrace mesh) would
  draw them crisp.
- [ ] **Wrack heaps are lumps** (`G.lobe` with `ground.wrack`): they read as wet heaps at a distance, as smooth domes close
  to. A heap of draped straps (the wrack card over a mound) would be truer.
- [ ] **The far country is generic**: the coast continues and the land lifts to the outer wall's foothills, but neither
  Farport nor the outer wall's own shape (the scale model's ridge) is on the horizon. The open world will replace it.
- [ ] **The front is compressed**: the real front is 15 km deep (10 to 25 km from the sea); the page draws its transition
  in 3 km so one view shows the kelp, the dead belt and the native forest together.
- [ ] **Not in the gallery yet**: a new biome goes in when it first reaches `main` (the main session's merge).
- [ ] **The ground's dither is a copy** (the owner, 2026-10-26: "ground needs dithering"): `47-host-land.js` carries Korona's
  hex-cell bomb (`GDITHER`, from `biomes/korona/src/47-host-land.js`) whole. Two biomes now have it: it belongs in core (a
  `core/materials` or `core/biome` GLSL chunk both take). A core change, not this kit's.
- [ ] **The page holds ~15M triangles** on the kelp coast (budget 16M, Korona's): the review's understorey and 3D coral added
  ~4M. The runtime LOD draws 8 to 12M of them at a view. A lighter far band for the floor would bring it down.
