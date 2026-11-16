# Grēṭ-Āil: known issues

The page's first pass (2026-11-16, the owner: "build the page next"). What it does not do yet, and the stand-ins it uses.

- [ ] **The cove's headlands are stamped by the page, not by core/world.** core/world's landform stamper
      (`core/world/41l-world-landforms.js`) is on the open-world line (`claude/openworld-sites-24defd`), not this branch.
      `src/89zaa-ad-ground.js` stamps the same two records (`lf_azure_cove_west`, `lf_azure_cove_east`) through
      `WORLD.landHook` with 41l's island profile, without its waterline's noise wobble. Take core/world when the page moves
      onto that line, and delete the page's copy.
- [ ] **The region cut came from the scale-model line**, with edit 517 and `tools/scale-model/edit_517_azure.py` applied on a
      scratch copy (`region/source` holds its inputs: the Xanadu regions dump with the site's box added, no settlements).
      Re-cut it when the scale-model line lands the cove's records (the cut does not carry landforms today).
- [ ] **Stand-ins among the buildings.** The Hall of Fasting is the grammarians' college (`qb_college`); the refectory and the
      dream-keepers' house are pilgrims' hostels (`qb_hostel`); the dairy is two workshops; the Lotus Garden is two Xanadu
      gardens (`xa_garden`) without its four still lotus ponds; the net loft is a Xanadu warehouse.
- [ ] **The dream cots are builder geometry** in `src/89qa-ad-hall.js`, until the catalog has `xanadu_common_dream_cot`
      (FURNITURE.md's NEW list). The same holds for the azure lamps, the censers, the turnings' screens, the Lulling dais and the
      Damsel's image.
- [ ] **Walking in: the Hall only.** The Hall of Dreaming is in `core/walk` (`targets/isle/90ag-ad-walk.js`: its floors, walls,
      columns, lattice, screens, cots; its two doors unlocked and blocking when shut; `verify.py`'s `hall-walk-in`). The Foot
      Gallery has no stair yet, and the other buildings' rooms (the waking range, the great monastery's halls, the hostels) are
      not walked into: Qiblai's city does that through its lot-interiors fragment (`settlements/qiblai` 90t, 90u), which this
      page does not take yet.
- [ ] **The flora is the Vale of Xanadu's biome over a mask** (`89zaa`'s `adBioMask`: woods on the open slopes, the shore zone by
      the water, nothing on pads, ways or footprints), bound on `BIO.host` as Qiblai's city binds it. The page's fields make the
      isle wooded lowland throughout (the owner, 2026-11-16: "a lot more foliage on this island"): `upland` is height over 5 km, so
      the biome's forest never fades out with height, and `wet` follows a slow noise (`AD_WOODN`), giving forest with glades. The
      far ground wears the same noise as a canopy's dark green. The woods cost triangles: the isle's scene is 10.3M of its 16M
      budget (2.7M before), the summit's 6.7M (0.9M), the floor pass the heaviest; no frame timing taken yet. Beyond the near
      ground the woods are a colour only, with no trees. The Lotus Garden's four ponds are on `core/water` (still). Still
      missing: the terraced orchards (apricot, persimmon: `kits/crops`) and the hives.
- [ ] **The sheets in `floors/` keep the first frame.** The page's layout was refitted to the 1:1 shore (the scarp's toe, PLAN.md
      section 1); the sheets still draw the plan's u (the precinct 120 m further up, the lower ward wider). Redraw them from
      `targets/isle/89zad`'s records when the layout settles.
- [ ] **The Dream Road is on the pages at its two ends only:** its first 1.5 km out of the back gate (the isle's page, with its
      first chorten and the relay lamp) and its last 800 m (the summit's page, with the chorten at the kora). Its other six
      chortens and the Quiet Walk are on neither page. The signal line (the Station Watch, the relay, the Hall's lantern roof:
      AD_SIGNAL, src/89zaa) clears the 1:1 ground by a metre or two only, so a re-cut of the region can break it:
      erify.py's signal-lamp and signal-relay say so. No far form of the summit is drawn from the
      cove yet (PLAN.md AD7), and the summit's page does not draw the monastery 9 km off.
- [ ] **The fishing villages stand where the 1:1 shore allows, not on the plan's pins.** At 1:1 most of the isle's coast is steep;
      a probe over the whole isle for ground dry and gentle 120 m round with the water near found 15 spots. West End is on the west
      coast (834.5, 1503.5: the tip itself is low islets), North Shore on the north-east coast (849.7, 1501.3), and East End on the
      south shore 5.4 km east of the cove (851.5, 1508.8): the true east end is a steep coast. The scale-model session's queue
      holds the old pins. The fishers' hall is the Farmers' Guild's (`xa_guild_farm`, a stand-in); East End's meadows for the
      Order's herds are not drawn; the footpath round the isle is drawn only on each village's near ground.
- [ ] **check_assembly reports `MISSING KCITY.stance` on all five pages (owner's call).** core/hamlet needs core/city's
      `33-city-strategies.js` (its `KCITY.prim.frontageRun` and `huntNear`); one of that fragment's street strategies, never
      run here, calls `KCITY.stance` from `15-city-ground.js`. That fragment needs `10-city-core.js`, whose top-level `clamp`
      clashes with the Xanadu page's `10-core.js`, so neither can be taken. Two ways out, neither taken: the five pages in
      `tools/check_assembly_baseline.json` as Ys is (a baseline edit was refused in this session), or a guard on the call in
      `core/city/33-city-strategies.js` (a shared file: merge the open-world line first, rebuild every build that takes it).
- [ ] **Not on the page:** the bay isle's Threshold Light, the people asleep in the
      Hall, the textures owed (`core/materials/PROMPTS-NEEDED.md` section 56: the ceiling is a deep-blue lacquer with gold stars
      until then).
