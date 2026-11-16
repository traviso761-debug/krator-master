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
- [x] **The ground's dither is a copy** (the owner, 2026-10-26: "ground needs dithering"): `47-host-land.js` carried Korona's
  hex-cell bomb (`GDITHER`, from `biomes/korona/src/47-host-land.js`) whole. Two biomes had it: it belonged in core.
  Fixed 2026-10-26 (core workstream `foliage`, X4): `core/biome/31-core-dither.js` holds it as `BIO.DITHER` (the same text,
  character for character: `core/biome/test-foliage.js` holds its SHA-1); `GDITHER` is that string and `build.py` lists the
  fragment. The core ground shader (R4, `core/terrain`) is to take it over.
- [ ] **The page holds ~15M triangles** on the kelp coast (budget 16M, Korona's): the review's understorey and 3D coral added
  ~4M. The runtime LOD draws 8 to 12M of them at a view. A lighter far band for the floor would bring it down.

## The final rebuild (pair 10, 2026-11-04, `claude/rebuild-farside-cloud`)

- [ ] **Station 1 compresses the tsunami coast** (map 5.1): on the model the harbour (5.1 px 290,588) and Farport's plateau (294,588)
  are ~8 km apart and the bench is up to 12 km deep; the page draws the bench in ~700 m, the bluff in ~350 m and the plateau past
  ~1 km in. Heights are true (the bench to ~55 m with chevrons to ~+13 m, the run-up ceiling 100 m, the plateau 210-220 m).
- [ ] **The old city is a site, not drawn** (the owner's earlier rule: works only on a biome page). Its site on the plateau is held clear
  (an obstacle; grazed turf) and registered as a `landmark` record (`farport_city`), the factory quarter's by the quays likewise. The
  owner's eye: whether the plateau wants a stand-in skyline until the settlement build places the city.
- [ ] **The harbour's water and the sea meet in a seam** at the estuary's mouth: two surfaces at 0 m, the sea with its swell and
  shore grid (`STAGE.sea.land` stops it at the mouth), the harbour still (no breakers ring its quays). Look for the line at the mouth.
- [ ] **The tsunami's lines are ribbons on the ground** (red: the run-up ceiling, amber: the bench's top), a panel layer, on at load.
  An overlay, not a landform: the owner may want them off by default and the stones and the trimline to carry the reach alone.
- [ ] **The strand station lies on the tsunami's bench too** (re-sited to 5.1 px 293,573, 16 m) but draws no chevrons, chutes or line:
  its dunes were left as they were. A later pass could give it the bench's ground.
- [ ] **The front's pixel is 2,179 m** on 5.1 (Round 2 restored it), above the plan's band (~800-1,800 m). The page's ground is its own
  compressed function, so only the sky's air reads the pixel; re-site it if the owner wants the number in the band.
- [x] **KSHADOW is the page's own switch** (`88`: `SHADOW_SW`, the panel's `shadows` button, `?shadow=1`), off at load; core/shadow had
  no switch when this turn ran. When core/shadow gains one, the page should take it. Its cost here is not measured (no GPU).
  **Closed 2026-11-08:** `SHADOW_SW` is gone; `88`'s `SHADOW_ATTACH` (called from `99` once the page is built) attaches on core's own switch,
  off at load (core's button or `?shadow=1` on, `?shadow=0` none). Still not timed.
- [ ] **Station 1 is over its triangle budget**: 21.4M scene triangles against 16M (`farside/floor` 14.8M against 9M), measured in
  software GL on the rebuilt page (`verify.py --assert`; a warning, not a failure; the draw at a view is 10.8-11.9M, 93 calls). The bench's
  bare rock (`FIELD.rock`) brings the strand's floor (rock wrack, sea palms) onto ~700 m of bench where the kelp used to stand. A
  lighter far band for the floor (the item above) or a thinner bench pass would bring it down; left for the GPU measurement.
- [ ] **Not GPU-verified** in this turn (a cloud session, software GL only): `verify.py --assert --all-views` on the GPU is the
  coordinator's (HANDOFF-REBUILD.md, pair 10).

## Textures (2026-11-10)

- [ ] **The scour bench's grooves wander** (`ground.bench`, the ground's eighth layer, `47-host-land.js`): the set's grooves all run one
  way across the tile, but KGROUND turns every hex tile by up to 0.6 rad (one `hex.rot` for the whole hook), so at a few metres they
  read as a planed surface, not one direction. A per-layer `rot` in core/terrain 43 would keep them aligned to the tsunami's run (onshore,
  the north-wester); not taken here (a core change). The procedural salt-white tint on the bench (`SALT`) is drawn only without the set.
