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
      the water, nothing on pads, ways or footprints), bound on `BIO.host` as Qiblai's city binds it. The Lotus Garden's four
      ponds are on `core/water` (still). Still missing: the terraced orchards (apricot, persimmon: `kits/crops`) and the hives.
- [ ] **The sheets in `floors/` keep the first frame.** The page's layout was refitted to the 1:1 shore (the scarp's toe, PLAN.md
      section 1); the sheets still draw the plan's u (the precinct 120 m further up, the lower ward wider). Redraw them from
      `targets/isle/89zad`'s records when the layout settles.
- [ ] **The summit's signal lamp cannot be seen from the monastery.** At 1:1 the isle's dome is convex: the ground 1.5-2.5 km
      above the Hall stands about 69 m over the straight line from the Station Watch's lamp (+322 m) to the monastery's back
      gate (+136 m), so the plan's "signal the monastery by lamp" (section 4e) does not work directly (`verify.py`'s
      `signal-lamp` reports the shortfall). A relay would: a lamp about 14 m up at the Dream Road's first chorten, 1 km above the
      back gate (+223 m), sees both within a few metres (probed over the region cut). That chorten is on neither page's near
      ground. For the owner (PLAN.md Q15).
- [ ] **The summit's page holds the Dream Road's last 800 m only** and one of its eight chortens (the one at the kora). The road's
      other seven kilometres, the back gate and the Quiet Walk are on neither page. No far form of the summit is drawn from the
      cove yet (PLAN.md AD7), and the summit's page does not draw the monastery 9 km off.
- [ ] **Not on the page:** the three fishing villages (`core/hamlet`), the bay isle's Threshold Light, the people asleep in the
      Hall, the textures owed (`core/materials/PROMPTS-NEEDED.md` section 56: the ceiling is a deep-blue lacquer with gold stars
      until then).
