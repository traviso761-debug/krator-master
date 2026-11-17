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
- [ ] **Walking in: the ground storeys only.** The Hall of Dreaming is in `core/walk` (`targets/isle/90ag-ad-walk.js`), its Foot
      Gallery up a stair through a hatch at the east end (`hall-walk-in` reaches it). The other buildings' ground storeys
      (`targets/isle/90ai-ad-interiors.js`, Qiblai's lot-interiors host over this page's places: kits/interiors' plans, the
      catalog's pieces) are built on demand and walked into through their drawn doors (`interiors`, `walk-in-rooms`); the great
      monastery's assembly hall and gate hall too, from the terrace through its gate (`90aj`, `great-rooms`). Not yet:
      upper storeys, the Order's own buildings that
      have no storey stacks (the waking range, the cup house, the fishermonks' house), and the villages' houses.
- [ ] **The Station's nights are a proposed rule.** The Hall's night runs on `core/sched` (`targets/isle/90ah-ad-night.js`), its
      wheels turn and are braked at the Lulling, and the Station's passes come from core/atmos's sky model. At 59.5 S the
      Station never stands overhead (its best passes peak near 66 degrees), so a Station's night is taken as one whose best lit
      pass peaks at 66.3 degrees or more (`AD_STATION_PEAK`: about 21 nights a year here, clustered). PLAN.md Q16 asks the owner.
      The page's own sky (KratorSky) does not draw the Station.
- [ ] **The flora is the Vale of Xanadu's biome over a mask** (`89zaa`'s `adBioMask`: woods on the open slopes, the shore zone by
      the water, nothing on pads, ways or footprints), bound on `BIO.host` as Qiblai's city binds it. The page's fields make the
      isle wooded lowland throughout (the owner, 2026-11-16: "a lot more foliage on this island"): `upland` is height over 5 km, so
      the biome's forest never fades out with height, and `wet` follows a slow noise (`AD_WOODN`), giving forest with glades. The
      far ground wears the same noise as a canopy's dark green. The woods cost triangles: the isle's scene is 10.3M of its 16M
      budget (2.7M before), the summit's 6.7M (0.9M), the floor pass the heaviest. Measured 2026-11-16 (`tools/perf_views.py`,
      the Arc 140T, the Overview, 30 frames): the isle 13.8 ms of GPU a frame (5.4M drawn), the summit 12.4 ms, East End 10.3
      ms, all inside 60 fps on the integrated GPU; nearer views draw less. Beyond the near ground the woods are a colour
      only, with no trees. The terraced orchards (`qb_ad_orchard`: the Vale apricot and the Frost persimmon, named from
      `kits/crops`) and the bee walls (`qb_ad_hives`) are drawn as the page's own builders, not as crop or biome records.
- [ ] **The sheets are redrawn from the pages by hand.** `export_records.py` writes `floors/page-isle.json` and
      `floors/page-summit.json` from the built pages, and `azure_blueprint.py` draws sheets G, W, S and the section from them;
      run both after a layout change (the build does not). H1 and H2 still draw the Hall from their own room data, and three
      rooms of sheet G are not on the page (listed on the sheet).
- [ ] **The Dream Road is on the pages at its two ends only:** its first 1.5 km out of the back gate (the isle's page, with its
      first chorten and the relay lamp) and its last 800 m (the summit's page, with the chorten at the kora). Its other six
      chortens and the Quiet Walk are on neither page. The signal line (the Station Watch, the relay, the Hall's lantern roof:
      `AD_SIGNAL`, `src/89zaa`) clears the 1:1 ground by a metre or two only, so a re-cut of the region can break it:
      `verify.py`'s `signal-lamp` and `signal-relay` say so. No far form of the summit is drawn from the cove (the dome hides it
      there), and the summit's page does not draw the monastery 9 km off.
- [ ] **The fishing villages stand where the 1:1 shore allows, not on the plan's pins.** At 1:1 most of the isle's coast is steep;
      a probe over the whole isle for ground dry and gentle 120 m round with the water near found 15 spots. West End is on the west
      coast (834.5, 1503.5: the tip itself is low islets), North Shore on the north-east coast (849.7, 1501.3), and East End on the
      south shore 5.4 km east of the cove (851.5, 1508.8): the true east end is a steep coast. The scale-model session's queue
      holds the old pins. The fishers' hall is the Farmers' Guild's (`xa_guild_farm`, a stand-in). East End's meadow for the
      Order's herds has its corral and pens but no animals. The footpath round the isle is drawn only on each village's near
      ground.
- [ ] **Not on the page:** the bay isle's Threshold Light, the people asleep in the
      Hall, the textures owed (`core/materials/PROMPTS-NEEDED.md` section 56: the ceiling is a deep-blue lacquer with gold stars
      until then).
