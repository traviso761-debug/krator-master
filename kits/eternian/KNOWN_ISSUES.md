# kits/eternian: known issues

- [ ] **No culture pack in core/sockets** (`FURN_CULTURE('eternian', {pack: null})`): the State's banners (the gold
      closed-eyed face on black, green highlights) want an `eternian` pack and a closed-eyed-face symbol in
      `core/sockets/80-cultures.js` and `38-symbols.js` (the owner's sign, `patterns/eternian/sign`, is its banner cloth).
      A core change every build that takes core/sockets would rebuild for. P4's banners are the kit's own (`etBanner`, the
      owner's sign as cloth); the culture pack waits for the owner's word on that rebuild.
- [ ] **The onyx furniture is cut stone**: the ancestor niche and the visor case draw their onyx on the furniture's
      `stone` surface, which takes `f_stone`; giving them the owner's onyx wants a `FAMILY_SPLITS` row for the palette key
      `onyx` in `kits/catalog/krator-furniture-core.js` (a catalog core change every furnished build rebuilds for).
- [ ] **The relic hall's Ancient parts are drawn by the kit** (`et_relic_hall`: the turbine casing, the half-drum apse of
      white panels): PLAN.md section 6 wants a `relic` option that reads a part from the Ancient Port kit or the Ancients
      kit in place (a prow, a turbine casing, a ring segment); until then the parts are the kit's stand-ins.
- [ ] **The Clock parades once a minute on the sheet** (`91c-et-clock.js`, the record's `period`: 60 s); the page will
      tie the parade to its hour. The hands keep the sky's hour.
- [ ] **The trade buildings share one generator** (`etTrade`): a street of them reads as one family; the trades' own
      features (the kilns, vats, racks, cranes) carry the difference. A second pass per trade could vary their massing.
- [x] **In the gallery (2026-10-20)**: its own artifact, https://claude.ai/artifact/VahvUzsCKyDZjtoZBu5Txu, linked from every
      part's index; the Sanctum and the kept hosts in The Ancients and the Port (`gallery/README.md`).
- [x] **(Passes again, 2026-10-22.) The catalog's `verify.py --assert` failed on two generic fruit pieces** (`generic_fruit_bell_pod`,
      `generic_fruit_cherry`: materials missing stone, timber). Not this kit's: it fails the same without the Eternian
      file (checked 2026-10-20).
- [ ] **The palace and canton staffs** are the census's one trade the kit does not carry: the Sanctum
      (`kits/ancients/targets/sanctum`) houses them. Tabled: envoys and embassy staff (Farport's page).
- [x] **Fixed 2026-10-20 (the owner's review):** the glaze vats' and basins' water was hidden in solid stone, or z-fought
      its top (`etBasin`, hollow); the shutters z-fought the window surrounds (now 2 cm proud of them); wall heads and pier
      caps showed through the roofs (every roof is lifted over the wall's outer edge by its own slope: `etRoofLift`;
      cornices 3 cm out); the hexagonal roofs' tiles ran straight across the hexagon (`etOgee` is drawn face by face, each
      face's courses along its own eave, as `etHexHip` and `etHip` already were).
- [ ] **The frontier fort (`et_fort`, 2026-10-22)**: the corner towers and the wall walk are solid (no rooms inside the
      towers; a door from the court on each, no stair up); the keep's three storeys have no stair between them (the
      interiors set does not plan the keep yet). Its gatehouse is the city gate, so the fort carries the gate's colossi.
