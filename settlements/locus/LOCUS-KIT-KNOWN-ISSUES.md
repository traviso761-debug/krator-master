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

- [ ] **Left as geometry, no catalog piece fits** (needed keys in brackets): the oil drums everywhere (`LOCUS.drum`:
      warehouse plinth, refinery loading bay and fitters' yard, generator house, fuel station cradle; prop_drum_stack is
      an asset) [a standing / lying oil drum]; the tent's 7.5 m polychrome rug [a large rug]; the farm's sheaf-drying
      racks, winnowing basket and mat, salt heap and its two baskets [sheaf rack, winnowing basket, salt heap]; the
      warehouse's three thatch bales [bale]; the fishing dock's two net frames and fish tray [net-drying frame, fish
      tray]; the poor stilt house's coiled-net stand; the chapterhouse gnomon (an instrument) and core rack (the trade
      sign); the fuel pumps, the control shed's battery boxes and the electric bracket lamps (fittings).
- [ ] `stilt_mid` variant 2 (L-plan) and `tent_pavilion` variant 2 (round bell tent) have no `#n` item in
      `kits/interiors/sets/locus.js`, so `?interiors=1` plans variant 0's rectangle in them (the bell tent's room pokes
      through its round wall).
- [ ] The catalog substitutes are not one-for-one: the rain jar is a group of three clay pots (`yuni_poor_clay_pots`),
      the two-post fish rack the four-post `abyss_smoking_rack`, the 4.4 m shade bench two 2.1 m `abyss_bench`es, the
      tent's ring of six cushions two `yuni_common_floor_seating` sets, the salt sacks two `yuni_common_grain_sacks`.
