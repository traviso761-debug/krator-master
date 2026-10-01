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

- [x] **The leftovers are catalog pieces now** (Oct 2026 third pass): the catalog gained a Jobs category,
      `kits/catalog/krator-master-furniture-jobs.js` (work items by trade, `job` field), and the tent rug, and the kit places
      them through FURNISH at the same spots and headings: the LYING oil drums (`job_oil_drum_lying`: the refinery fitters'
      yard's one; `job_oil_drum_rack` variant 0: the loading bay's row of four; variant 1: the fuel station's cradle of three
      with its bearers and brass taps), the tent's 7.5 x 4.6 polychrome rug and the bell tent's 5.5 m one (`eastabyss_tent_rug`
      variants 0 and 1), the farm's two sheaf-drying racks (`job_sheaf_rack`), its winnowing tub and mat (`job_winnowing_tub`,
      `job_winnowing_mat`), its salt heap and the heap's two tubs (`job_salt_heap`, `job_salt_tub` heaped / empty), the
      warehouse's three thatch bales (`job_bales` variant 1), the fishing dock's two net-drying frames (`job_net_frame`) and its
      fish tray (`job_fish_tray` variant 1, with the catch). None of them drew from `F.rnd()`: no burn was needed.
- [ ] **Still left as geometry:** `prop_drum_stack` (the asset IS the stack); the poor stilt house's coiled-net stand; the
      chapterhouse gnomon (an instrument) and core rack (the trade sign); the fuel pumps, the control shed's battery boxes and
      the electric bracket lamps (fittings).
- [ ] **The Jobs pieces are not one-for-one either** (`kits/catalog/KNOWN_ISSUES.md`): the lying drums are 8-sided rods with
      the standing drum's hoops; the fuel station's back cradle bearer, 0.6 m behind the drums' ends in the kit, is under them;
      the bales have cords; the fish tray is a rimmed tray of fish (the kit's was a solid plank box); the salt heap is a smooth
      dome; the rugs draw the kit's `paintcol` painting in slabs, with a border, and stand 0.05 m (their top at 0.07, where the
      kit's box was).
- [x] The STANDING oil drums are the catalog's `pa_drum` (scrap culture, sealed) through FURNISH: the warehouse plinth's six,
      the refinery fitters' yard's three and the loading bay's grid of fifteen with five stacked, the generator house's six.
      They take the catalog's painted colours (red, blue, olive, ochre, grey, mustard), not the kit's rust tones.
- [x] `stilt_mid` variant 2 (L-plan), `tent_pavilion` variants 1 and 2, `stilt_poor` variant 1 and `farm_saltrice` variant 1
      (its house is at x -16: the base item's room stood at +16, over the paddies) have their own `#n` items in
      `kits/interiors/sets/locus.js` (Oct 2026); the glue no longer falls back to the base item for a variant > 0.
- [ ] The catalog substitutes are not one-for-one: the rain jar is a group of three clay pots (`yuni_poor_clay_pots`),
      the two-post fish rack the four-post `abyss_smoking_rack`, the 4.4 m shade bench two 2.1 m `abyss_bench`es, the
      tent's ring of six cushions two `yuni_common_floor_seating` sets, the salt sacks two `yuni_common_grain_sacks`.
