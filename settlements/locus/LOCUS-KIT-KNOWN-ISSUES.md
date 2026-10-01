# Locus kit — known issues (first pass, Sep 2026)

- [ ] The horsehead is a box with a tapered nose, not the true arc face; the bridle therefore leans a few degrees
      off vertical through the stroke instead of hanging plumb from a tangent point. Reads fine at world scale.
- [ ] The cage ladders draw their hoops as flat discs (`F.disc`), which read as a stack of dark plates from a distance.
- [ ] The blunt towers flanking the Chapterhouse porch keep `BLUNT_TOWER`'s hard-coded blue mosaic band; the kit only
      changes the cap band to warm mosaic. Fully earth-toned towers would need an option on `BLUNT_TOWER`.
- [ ] The dome's outer skin is a 14-point lathe derived from the corbel rings, so it is faintly faceted in silhouette.
- [ ] Paddy water and the cooling trough are lime-wash boxes tinted `saltWater`; there is no reflective water on the sheet.
- [ ] The salt-rice farm registers ~130 plant sites per instance (the rice stands and reeds are real `buildPlant`
      calls, as the project rule asks); the world pass should place farms sparingly or thin the stands.
- [ ] `stilt_mid` variant C's second (side) stair lands beside the deck's left edge; the rail gap is there but there is
      no landing plank.
- [ ] The pavilion tent's rolled front wall is a plain rod of canvas; no ties or gathers.
- [x] No furniture was added for the new cultures (abyssal-desert, geomancer); interiors of the stilt houses are void. (Oct 2026: the interiors kit furnishes them, `?interiors=1`.)
- [ ] The generator's flywheel rim and hub are static; only the spokes and crank pin turn (they read as a turning wheel).
- [ ] The fuel station's pumps are hand-cranked cabinets with no moving crank; the hoses are three-point tubes.
- [ ] The generator house's exhaust stacks give no smoke.

## Furniture from the catalog (Oct 2026; `API.md` "Furniture")

- [ ] **Left as geometry, no catalog piece fits** (Oct 2026 second pass; nearest catalog piece in brackets): the LYING oil drums
      (`LOCUS.drum(..., true)`: refinery loading bay's row of four and the fitters' yard's one, the fuel station's cradle of
      three) [none: `pa_drum` only stands]; `prop_drum_stack` (the asset IS the stack: left drawn); the tent's 7.5 x 4.6
      polychrome rug and the bell tent's 5.5 m one [`eastabyss_court_carpet`, 3.0 x 2.1]; the farm's two sheaf-drying racks
      (3.4 m, sheaves hung) [`hl_rus_hay_rack` 5.1 m, rustic; `eastabyss_trade_hayrack` a 1.4 m fodder rack]; its winnowing
      basket (one 0.34 m tub) and reed mat (1.6 x 0.8) [`eastabyss_common_rug` 'Reed mat', 2.2 x 1.5]; its salt heap (a 3.2 m
      mound 1.0 high) [`abyss_salt_cone`, a 2.1 m cone 1.6 high] and the heap's two wooden tubs [`abyss_baskets`, a row of four
      wicker baskets of fish and rice]; the warehouse's three thatch bales (1.0 x 0.8 x 0.9) [`pa_hay_bales` 0.6 x 0.36 x 0.36;
      `br_h_hay_bales` 1.2 x 0.8 x 0.6, beast-rider, not in the bundle]; the fishing dock's two net-drying frames (2.4 m, a
      hung net) [`abyss_smoking_rack` 'nets and fish', four-post; `pa_fish_rack` 4.4 m] and its fish tray (a 1.2 x 0.7 plank
      tray) [none]; the poor stilt house's coiled-net stand; the chapterhouse gnomon (an instrument) and core rack (the trade
      sign); the fuel pumps, the control shed's battery boxes and the electric bracket lamps (fittings).
- [x] The STANDING oil drums are the catalog's `pa_drum` (scrap culture, sealed) through FURNISH: the warehouse plinth's six,
      the refinery fitters' yard's three and the loading bay's grid of fifteen with five stacked, the generator house's six.
      They take the catalog's painted colours (red, blue, olive, ochre, grey, mustard), not the kit's rust tones.
- [x] `stilt_mid` variant 2 (L-plan), `tent_pavilion` variants 1 and 2, `stilt_poor` variant 1 and `farm_saltrice` variant 1
      (its house is at x -16: the base item's room stood at +16, over the paddies) have their own `#n` items in
      `kits/interiors/sets/locus.js` (Oct 2026); the glue no longer falls back to the base item for a variant > 0.
- [ ] The catalog substitutes are not one-for-one: the rain jar is a group of three clay pots (`yuni_poor_clay_pots`),
      the two-post fish rack the four-post `abyss_smoking_rack`, the 4.4 m shade bench two 2.1 m `abyss_bench`es, the
      tent's ring of six cushions two `yuni_common_floor_seating` sets, the salt sacks two `yuni_common_grain_sacks`.
