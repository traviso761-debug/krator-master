# kits/eternian: known issues

- [ ] **No culture pack in core/sockets** (`FURN_CULTURE('eternian', {pack: null})`): the State's banners (the gold
      closed-eyed face on black, green highlights) want an `eternian` pack and a closed-eyed-face symbol in
      `core/sockets/80-cultures.js` and `38-symbols.js` (the owner's sign, `patterns/eternian/sign`, is its banner cloth).
      A core change every build that takes core/sockets would rebuild for: with P4's banners.
- [ ] **The mask over the door is the toolkit's few-plane stand-in** (`etMask`); the head generator (P2) replaces it.
- [ ] **The flutes are thin at a distance**: `etFlutes` draws half-round reeds of at most 0.16 m. The library's lime
      does not carry them either; a fluted-pier sheet would.
- [ ] **The pier bundle's piers read faintly in brick at a distance**: the projection is 0.25 m and the brick set is fine;
      a darker joint or a pier-edge band may be wanted when the ministries (P4) are built on it.
- [ ] **The catalog's `verify.py --assert` fails on two generic fruit pieces** (`generic_fruit_bell_pod`,
      `generic_fruit_cherry`: materials missing stone, timber). Not this kit's: it fails the same without the Eternian
      file (checked 2026-10-20).
- [ ] **The census trades not built yet** (`ET_TRADES`, `tools/check_trades.py`: 41 gaps; the owner's Islanders route
      means every one gets a building). By phase:
      P3: household service (`et_official_villa`).
      P4: town guard (`et_gate`), temple priests and servants (`et_ancestor_gallery`), shrine keepers (`et_shrine_niche`), power-house stokers and engineers (`et_tube_station`), soldiers (`et_barracks`), teachers and scholars (`et_examination_hall`), guild officers and clerks (`et_registry`), customs officers and clerks (`et_customs_house`), priests and undertakers (`et_mask_house`), monks and lay brothers (`et_historians_house`).
      P6: bakers (`et_bakehouse`), butchers (`et_butcher`), weavers and dyers (`et_weaver`), brewers (`et_brewhouse`), tanners (`et_tannery`), shipwrights and boatbuilders (`et_dock`), innkeepers and grooms (`et_inn`), coast guard (`et_quay`), shopkeepers and assistants (`et_shophouse`), smiths and craftsmen (`et_smithy`), innkeepers and servers (`et_tea_house`), porters and warehousemen (`et_warehouse`), industrial workers (`et_kiln`), healers and nurses (`et_healer`), lighthouse keepers (`et_lighthouse`), dockers and stevedores (`et_quay`), river bargemen and quay hands (`et_canal_landing`), fishers (`et_fish_landing`), market traders (`et_market_hall`), farmhands and ploughmen (`et_farmstead`), chinampa growers (`et_paddy`), orchardmen (`et_tea_garden`), miners (`et_mine`), quarrymen and masons (`et_quarry`), granary keepers and millers (`et_granary`), dairymen (`et_stock_pens`), swineherds and duck keepers (`et_stock_pens`), mushroom growers (`et_mushroom_cellar`), ferrymen (`et_ferry_landing`).
      And palace and canton staffs: the Sanctum (`kits/ancients/targets/sanctum`) houses them outside the kit; the
      kit's court defs come in P5. Tabled: envoys and embassy staff (Farport's page). Not here: beetles, elephant bugs.
