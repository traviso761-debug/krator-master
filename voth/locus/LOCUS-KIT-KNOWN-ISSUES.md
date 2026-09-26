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
- [ ] No furniture was added for the new cultures (abyssal-desert, geomancer); interiors of the stilt houses are void.
- [ ] The generator's flywheel rim and hub are static; only the spokes and crank pin turn (they read as a turning wheel).
- [ ] The fuel station's pumps are hand-cranked cabinets with no moving crank; the hoses are three-point tubes.
- [ ] The generator house's exhaust stacks give no smoke.
