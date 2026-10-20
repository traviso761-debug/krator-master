# kits/eternian: known issues

- [ ] **No culture pack in core/sockets** (`FURN_CULTURE('eternian', {pack: null})`): the State's banners (the gold
      closed-eyed face on black, green highlights) want an `eternian` pack and a closed-eyed-face symbol in
      `core/sockets/80-cultures.js` and `38-symbols.js` (the owner's sign, `patterns/eternian/sign`, is its banner cloth).
      A core change every build that takes core/sockets would rebuild for. P4's banners are the kit's own (`etBanner`, the
      owner's sign as cloth); the culture pack waits for the owner's word on that rebuild.
- [ ] **The Sanctum's kept page is over its per-type triangle guide** (`verify.py` `per-type-triangle-budget`: kept 417 k
      against the 250 k "medium" guide, a warning; the run reads OK): the generator's heads are about 450 triangles to
      the old stand-in's 190, some 85 k over the 322 heads. LOD culls them at a distance; a lower-detail head variant
      for the far rings would win most of it back.
- [ ] **The veils want a quality pass** (the owner, 2026-10-20): a veiled head is the head under a plain bronze cone
      (`etHead` `veiled`; the Sanctum's `snVeil`, a half-sphere); a draped veil with folds falling to the plinth, the
      face's planes faintly through it, would read as cloth over a person.
- [ ] **A figure's hands are blocks**: `etFigureGeo`'s arms are square beams ending in a flat block, read at the
      sheet's distance; a figure in a niche at eye level wants fingers or a sleeve's fold.
- [ ] **The onyx furniture is cut stone**: the ancestor niche and the visor case draw their onyx on the furniture's
      `stone` surface, which takes `f_stone`; giving them the owner's onyx wants a `FAMILY_SPLITS` row for the palette key
      `onyx` in `kits/catalog/krator-furniture-core.js` (a catalog core change every furnished build rebuilds for).
- [ ] **The canal street's water reflects the sky pale** at a low angle (the vendored `water` material); the canals
      read as water, but darker and less glossy would read deeper.
- [ ] **The relic hall's Ancient parts are drawn by the kit** (`et_relic_hall`: the turbine casing, the half-drum apse of
      white panels): PLAN.md section 6 wants a `relic` option that reads a part from the Ancient Port kit or the Ancients
      kit in place (a prow, a turbine casing, a ring segment); until then the parts are the kit's stand-ins.
- [ ] **The Clock parades once a minute on the sheet** (`91c-et-clock.js`, the record's `period`: 60 s); the page will
      tie the parade to its hour. The hands keep the sky's hour.
- [ ] **The gate's colossi use the figures' lintel pose**, whose arms spread wide; they hold the lintel at its quarter
      points, each over its own half of the road. A pose with the hands closer, or one colossus over the arch, would read
      more like arch-18.
- [ ] **The trade buildings share one generator** (`etTrade`): a street of them reads as one family; the trades' own
      features (the kilns, vats, racks, cranes) carry the difference. A second pass per trade could vary their massing.
- [ ] **The hexagonal roofs are plain cones** of tile, reed or celadon (`etTrade` 'pyramid'): a hip with tile rolls per
      face, as the rectangular roofs have, would read better close to.
- [ ] **Interiors still to plan** (`kits/interiors/sets/eternian.js` skips them with reasons): the ministry's offices
      inside its pier bundle, the examination hall's thirty cells, the kiln works' sheds round their court.
- [ ] **The export carries no meshes**: the Scyvoi engine registers records and materials with core/export, not its
      merged buckets, so the Godot case is records, materials and ground (the isle demo's profile). A buckets contributor
      for the engine would let a case draw the buildings.
- [ ] **Not in the Krator Worlds gallery yet**: the owner's call once the branch is on `main`.
- [ ] **The flutes are thin at a distance**: `etFlutes` draws half-round reeds of at most 0.16 m. The library's lime
      does not carry them either; a fluted-pier sheet would.
- [ ] **The pier bundle's piers read faintly in brick at a distance**: the projection is 0.25 m and the brick set is fine;
      a darker joint or a pier-edge band may be wanted when the ministries (P4) are built on it.
- [ ] **The catalog's `verify.py --assert` fails on two generic fruit pieces** (`generic_fruit_bell_pod`,
      `generic_fruit_cherry`: materials missing stone, timber). Not this kit's: it fails the same without the Eternian
      file (checked 2026-10-20).
- [ ] **The palace and canton staffs** are the census's one trade the kit does not carry: the Sanctum
      (`kits/ancients/targets/sanctum`) houses them. Tabled: envoys and embassy staff (Farport's page).
