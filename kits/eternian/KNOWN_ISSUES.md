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

## Doors, glass and the reachability audit (core/door, 2026-11-03)

The audit: every unlocked door opened, `KWALK.reach` (core/walk defaults: 0.4 m cells, a 0.45 m step, the ground walkable) flooded from each top-level building's door() records and front, bounded to its box grown 3 m; a floor counts as the building's by its walk tag. "Big" is an unreached floor of 2 m2 or more lying 1 m or more under the building's top.
- [x] Reached 215 of 998 floors before (the fixed leaf boxes stood in the doorways as blocks), 312 of 1000 after (the two declared below among them; 156 doors opened, 25 wall
      boxes cleared from doorways). The Registry's hall was still unreached: its podium and top step are 0.8 m boxes, which
      core/walk/box reads as blocks, so its door stood on nothing; their tops are declared floors now (`wkPad`), and the hall is reached.
- [ ] 688 unreached (276 big), nearly all upper storeys and roofs with no stair registered (the merchant house's three floors, the
      canal house's, the ministry's offices, the gate's and the clock's upper chambers) and the podium-borne halls whose podium
      is taller than 0.7 m (the ministry, the customs house, the ancestor gallery, the historians' house): their tops need
      `wkPad` like the Registry's, or core/walk/box a rule for a solid podium's top. The stairs are the interiors set's to plan.
- [ ] 16 doors are locked: the facades on the pier bundles (`etWall` `o.solid`: the gate fronts, the harbour's), the ministry's and
      the faith house's civic doors on their bundles, the fort's six tower doors (solid towers). The onyx and alabaster lights stay
      stone; the mine shaft's and the reservoir mouth's dark boxes are not openings into a room and stay.
