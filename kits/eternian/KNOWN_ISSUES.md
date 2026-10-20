# kits/eternian: known issues

- [ ] **No culture pack in core/sockets** (`FURN_CULTURE('eternian', {pack: null})`): the State's banners (the gold
      closed-eyed face on black, green highlights) want an `eternian` pack and a closed-eyed-face symbol in
      `core/sockets/80-cultures.js` and `38-symbols.js` (the owner's sign, `patterns/eternian/sign`, is its banner cloth).
      A core change every build that takes core/sockets would rebuild for: with P4's banners.
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
- [ ] **The flutes are thin at a distance**: `etFlutes` draws half-round reeds of at most 0.16 m. The library's lime
      does not carry them either; a fluted-pier sheet would.
- [ ] **The pier bundle's piers read faintly in brick at a distance**: the projection is 0.25 m and the brick set is fine;
      a darker joint or a pier-edge band may be wanted when the ministries (P4) are built on it.
- [ ] **The catalog's `verify.py --assert` fails on two generic fruit pieces** (`generic_fruit_bell_pod`,
      `generic_fruit_cherry`: materials missing stone, timber). Not this kit's: it fails the same without the Eternian
      file (checked 2026-10-20).
- [ ] **The census trades not built yet** (`ET_TRADES`, `tools/check_trades.py`: 40 gaps; the owner's Islanders route
      means every one gets a building). By phase:
      P4: town guard (`et_gate`), temple priests and servants (`et_ancestor_gallery`), shrine keepers (`et_shrine_niche`), power-house stokers and engineers (`et_tube_station`), soldiers (`et_barracks`), teachers and scholars (`et_examination_hall`), guild officers and clerks (`et_registry`), customs officers and clerks (`et_customs_house`), priests and undertakers (`et_mask_house`), monks and lay brothers (`et_historians_house`).
      P6: bakers (`et_bakehouse`), butchers (`et_butcher`), weavers and dyers (`et_weaver`), brewers (`et_brewhouse`), tanners (`et_tannery`), shipwrights and boatbuilders (`et_dock`), innkeepers and grooms (`et_inn`), coast guard (`et_quay`), shopkeepers and assistants (`et_shophouse`), smiths and craftsmen (`et_smithy`), innkeepers and servers (`et_tea_house`), porters and warehousemen (`et_warehouse`), industrial workers (`et_kiln`), healers and nurses (`et_healer`), lighthouse keepers (`et_lighthouse`), dockers and stevedores (`et_quay`), river bargemen and quay hands (`et_canal_landing`), fishers (`et_fish_landing`), market traders (`et_market_hall`), farmhands and ploughmen (`et_farmstead`), chinampa growers (`et_paddy`), orchardmen (`et_tea_garden`), miners (`et_mine`), quarrymen and masons (`et_quarry`), granary keepers and millers (`et_granary`), dairymen (`et_stock_pens`), swineherds and duck keepers (`et_stock_pens`), mushroom growers (`et_mushroom_cellar`), ferrymen (`et_ferry_landing`).
      And palace and canton staffs: the Sanctum (`kits/ancients/targets/sanctum`) houses them outside the kit; the
      kit's court defs come in P5. Tabled: envoys and embassy staff (Farport's page). Not here: beetles, elephant bugs.
