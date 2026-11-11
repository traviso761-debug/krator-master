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
- [ ] **Backport Farside's works (the owner, 2026-10-26)** the next time this kit is rebuilt: `biomes/farside/src/86-host-works.js`
      draws the coast's works as Eternian furniture (core/tags class `furniture`, culture `eternian`, keys `farside_<kind>`,
      tag `backport: kits/eternian`): the **kelp kiln** (a stone-lined trench, ash, a drying heap, its smoke), the **lime kiln**
      (whitewashed, a draw-arch, coral rubble), the **wrack heap**, the **wrack cart**, the **walled terraces** (dry-stone
      walls on the contour), the **goat fold** and the **drying rack** (kelp and wine weed hung as kombu and nori). Simple
      host geometry on the library's `rock.old_stone_wall`, `plaster.white_stucco_02` and `wood.weathered_brown_planks`;
      the kit's own trades (`etTrade`, the kilns and racks) should draw them properly, and Farside then places the kit's.

## Doors, glass and the reachability audit (core/door, 2026-11-03)

The audit: every unlocked door opened, `KWALK.reach` (core/walk defaults: 0.4 m cells, a 0.45 m step, the ground walkable) flooded from each top-level building's door() records and front, bounded to its box grown 3 m; a floor counts as the building's by its walk tag. "Big" is an unreached floor of 2 m2 or more lying 1 m or more under the building's top.
- [x] Reached 215 of 998 floors before (the fixed leaf boxes stood in the doorways as blocks), 312 of 1000 after (the two declared below among them; 156 doors opened, 25 wall
      boxes cleared from doorways). The Registry's hall was still unreached: its podium and top step are 0.8 m boxes, which
      core/walk/box reads as blocks, so its door stood on nothing; their tops are declared floors now (`wkPad`), and the hall is reached.
- [ ] 688 unreached (276 big), nearly all upper storeys and roofs with no stair registered (the merchant house's three floors, the
      canal house's, the ministry's offices, the gate's and the clock's upper chambers) and the podium-borne halls whose podium
      is taller than 0.7 m (the ministry, the customs house, the ancestor gallery, the historians' house): their tops need
      `wkPad` like the Registry's, or core/walk/box a rule for a solid podium's top. The stairs are the interiors set's to plan.
- [x] **The stairs pass (2026-11-03): a stair to every storey.** Measured with `tools/walk_audit/reach_audit.py` (the audit above;
      core/walk's reach as fixed that day; the counts from `reach_dump.js --summary`, which leaves the climbs out: a stair's strip and
      landing, a ladder's rungs): 311 floors reached, 719 unreached (289 big) before; 366, 622 (256 big) after; of the unreached a
      walker could stand on (no floor within 1.2 m over them) 596 -> 497, of the big ones 217 -> 188. The stairs are
      core/engine's (`svStair`, `svStairCase`, `svWell`: open timber treads on stringers, solid stone or brick steps), every flight a
      `KWALK.strip`; no footprint grew (the ministry's steps stand 0.6 m past its declared depth, inside verify's 0.8 m). By kind,
      reached/unreached/big-standable before -> after: the merchant's house 5/12/3 -> 11/6/1 (a dog-leg a storey in the back right
      corner: the old flights climbed into the back wall), the canal house 38/50/12 -> 18/40/12 (one flight up the left wall meeting
      the back landing, the bay's upper floor carried to the room's; the counts fell with the treads, which are no floors now), the
      corner turret 2/22/11 -> 6/18/7, the canal row 1/19/2 -> 3/2/1 (its stair rose 0.5 m off the ground), the ministry 0/20/9 ->
      8/13/2 (solid podium steps, its top declared, a flank door into the hall, a dog-leg a storey), the trade buildings on `etTrade`
      (a flight a storey: rect plans up the left wall, hex plans along a face clear of furniture, the hex floors declared): the
      shophouse, printer, inn, paper mill, hex house and villa, warehouse, market hall, granary; the fort's platform, its wall walk
      (two dog-legs of solid brick out from the curtain, a landing bridging to the walk) and its keep (the fort 12/258/33 ->
      30/206/23); the ancestor gallery's keepers' door and podium steps (0/9/7 -> 2/8/6). `etWall`: a door on a plinth 0.45 to 1.2 m up gets stone
      steps; a gap with no sill given is a passage from the floor (it took a window's 0.95 m sill: the customs house's back gate).
- [ ] Left unreached after the stairs pass (256 big, 188 a walker could stand on), read with `reach_dump.js`: flat roofs behind
      parapets and the parapets' copings (the canal house, the corner turret, the shophouse, the barracks' ranges: a roof terrace
      would want its own stair or hatch), cornices under the hips, the solid bodies by design (the gate's towers, the wall towers,
      the clock's body and balcony, the withdrawal house, the kiln), the relic hall, which has no door at all (its gate is the turbine
      casing; the ancestor gallery, sealed the same way, has a keepers' door in its back wall now, with steps up its podium), the
      pier tops, and a few furniture-scale tops (the colossi's plinths, the villa's basin).
- [ ] 16 doors are locked: the facades on the pier bundles (`etWall` `o.solid`: the gate fronts, the harbour's), the ministry's and
      the faith house's civic doors on their bundles, the fort's six tower doors (solid towers). The onyx and alabaster lights stay
      stone; the mine shaft's and the reservoir mouth's dark boxes are not openings into a room and stay.
