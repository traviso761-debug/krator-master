# settlements/thalaba: known issues

- [x] ~~**The Dalab mission's pieces run on procedural maps.**~~ Done 2026-11-16: Dalab's pack trimmed to the six families
  only the mission's pieces need (`build.py` `DALAB_FAMILIES`: the rammed earth, the two reliefs, three murals; measured on the
  pieces sheet), `gen/69v-dalab-pack.js`, about 2.9 MB inline; its shared keys (wood, stone, plaster...) keep the Xanadu pack.
  The pages are about 13.9 MB.
- [ ] **Thalaba's own pieces are local.** `tb_devisers` and `tb_calcarone` (`src/89t1-tb-pieces.js`, on the Xanadu kit's
  contract, shown on `dist/thalaba-pieces.html`) start here, as Qiblai's started in its kit; they go upstream into
  `kits/xanadu` once the owner has seen them. Until then the open world's Salphar draws its calcaroni as the hamlet row's
  pending boxes (`openworld/xanadu-oidong-highrift/src/48-world-site.js`, row `xanadu-sulfur`). The road warden's watch house
  (`tb_watchhouse`, 2026-11-16) stands on the town page by the expedition road at the gorge's mouth (z -10,150, 20 m west of the
  road); no toll house (the owner). The bridge and the ranch village of Briḍj are the region's (core/world's bridge, the
  hamlet row), not drawn on the town page, so the watch house stands alone there.
- [ ] **Salphar's sulfur deposit is stamped, not yet merged here.** `lode:thalaba-sulfur` (px 841,1452, r 3 km) is stamped on
  `kits/resources/data/geology.json` on the resource-nodes branch (claude/resource-nodes-7ec053, 36f68df9c, 2026-11-16, the owner:
  "Bake now"): the node field places Thalaba's sulfur nodes there itself (3 more in the ledger). It reaches this branch when that
  branch merges. No page here uses the owner-node stand-in, so nothing is dropped then; Salphar's `sulfur` focus needs no node.
- [x] ~~**The page's far land still has the old lake.**~~ Done 2026-11-16: claude/openworld-sites-24defd merged into this
  branch (112c0ce32) brought the re-made lake (scale model 5.1 edit 7 re-run, 5f659c054: Phēr at 843,1491), and the page was
  rebuilt on it (`gen/69u-tb-ground.js`); the region `xanadu-oidong-highrift` came already cut on it.
- [ ] **The expedition road ends at the region's edge** (T6, 2026-11-16; the owner: "Grow the cut up the gorge"). The road is
  laid in the region (`openworld/xanadu-oidong-highrift`, `SITE_SPEC.ways`, core/world 48s's new opt-in road to a point): on from
  Salphar up Godshearth's gorge, past the Spillway (`xanaduspill`, px 845,1422), to the Rare Devisers' camp at the hot lake's
  outlet (px 839,1398, the owner's choice, `settlements/devisers-camp`): 35.8 km at 8 % with a bridge so far, ending at the
  cut's edge (px 842.8,1437.7, 80 km short of the camp in a straight line). The open-world session folds a corridor up the gorge into the region's recut
  (after the scale model's Twins sculpt and Gemini's reshaping); a re-bake then carries the road to the station.
- [ ] **The people are estimates.** `TB_PEOPLE` in `targets/town/89zt-tb-site.js` gives each building a household; the town
  holds about 2,500 against the plan's 2,400 (`verify.py` reports it as a budget).
- [ ] **The springs are the plan's.** The spring line at the riser's foot is the owner's choice and the plan's reasoning (the
  river's water out of the mouth's gravels); the model carries no spring records.
- [ ] **The far land is one coarse mesh** (500 m cells, coloured by height and slope) beyond the near ground (the town and the
  riser to the gorge's mouth, 10.4 km north): the gorge's walls read as a pale snowy ridge in the haze; Gāḍz-Phōl is a white
  streak along the Āirã Siṭrīm's steep reach, not a core/water fall. The model's rivers there lie on the gorge's east flank,
  not in its trough (PLAN.md section 8).
- [ ] **The Siṭēps' banks are painted.** The terraces' treads are stepped into the ground (1.8 m a step, 30-40 m treads on the
  riser's 4-7 %), but the 20 m mesh smooths each riser into a ramp, so the banks are drawn on the ground's canvas as contour
  lines (marching squares on the same heights). No retaining walls as pieces yet.
- [ ] **The flora is the Vale of Xanadu's**, bound as its open vale (parkland, orchards) for the bench's Cfb at 1,500 m; the
  page's own sprinkling of figures is Xanadu's. Godshearth's Hearths are up in the caldera, not here.
- [ ] **The walk-in houses are opt-in.** `?interiors=1` (as on Erewhon's page) hollows the Xanadu kit's buildings and plans and
  furnishes their rooms (311 buildings, 1,784 rooms, about 14,000 pieces; 82 doorways into core/walk); the page then takes
  about 18 s to build against 4 s. Thalaba's own pieces and the mission's healers' hall have their rooms (2026-11-16,
  `src/89t2-tb-interiors.js`, a `kits/interiors` set registered on the page): the Devisers' hall (counting room, clerks',
  library, two bedrooms; 8 rooms with the strongroom), the watch house (guard room, store, two bedrooms), the healers' hall (the
  sick room, the genepriests' study, the store). They use kits/interiors' existing kinds (the counting room a shop, the
  strongroom a store): a counting room, a strongroom or an infirmary of their own would be new kinds there. The mission's hall
  is furnished from the generic catalog (the page's bundle, Xanadu's 69d, has no Dalab culture file). The mission's granaries and
  compound are round huts drawn by the Dalab helpers (`dnGranary`, `dnRoundHouse`), which the hollow wrap does not reach: they
  stay solid (skipped in the set, with the reason). The set goes into `kits/interiors/sets/` with the pieces.
- [ ] **The people are a first cut** (T5, 2026-11-16: `targets/town/89zu-tb-people.js`, `90t-tb-life.js`). Every resident
  (2,591: the town's households, the Devisers' 40, the Two Horns' 20, the mission's 30, the warden's 6) is a core/simulation
  actor on lazy routes over the plan's ways; they farm the terraces and the Bēnch, keep the market, the yard, the counting room,
  the temple, the springs; the diggers walk out to Salphar and the road's men down to Phēr, half at a time. **The expedition season** (2026-11-16):
  the Devisers' 150 (30 of their house, 120 hired townsmen) and the Dalab party's 40 (6 genepriests, 34 hired) muster at
  Briḍj the week from year day 295 (late spring), are away up the gorge from 302 to 57 (the summer: the tune's `expedition`
  window turned to the southern year, as the owner asked; the tune itself is not turned yet, below), and unload at the Devisers' yard and the mission's stores for the Sultan's count
  the week from 57, their own roles the rest of the year (core/simulation's calendar, 77-sim-6-season.js, on core/clock's year). The page's clock holds day 0 (mid-spring, before the
  muster) unless it runs; the muster ground is a place, not drawn (no corrals or blessing shrine at the bridge yet), and the
  fields are farmed all year (no sowing or harvest windows). Still owed: the **bodies** (placeholder robes and heads, not core/charactermodels' people); the **court
  houses' doors** join their nearest street in a straight line (the courts have no lanes), so a walker may cross a yard or a
  roof; jobs are drawn over the whole town, not by household (a farmer's house may hold no farmer); the fields more than 600 m
  from a way are left to the ring's farmsteads. No needs, money or economy on the page: the town's books are the region's
  (`core/region`, `XAN_TUNE`).
- [ ] **The economy's calendar is not turned yet.** The owner asked (2026-11-22) for `XAN_TUNE`'s windows to be turned to the
  southern year: they were written on a northern one (the expedition 120-240 and the harvest 150-200 fall in core/clock's
  winter). Turning Xanadu's alone breaks the joined economies: one clock runs Xanadu's, Longsong's (`LS_TUNE`, already
  southern, opening on clock day 0) and the Catch's (`CATCH_TUNE`, whose pans also read northern). Opening Xanadu's economy
  half a year on starved Longsong (30 % short) and fired the dated grants twice; opening it at day 0 broke the stores' sizing and
  the Great Caravan's phase. The turn needs all three tunes re-phased together and the caravan's starting stop chosen: proposed
  as its own piece of work. This page already runs the expedition in the southern summer (302-57).
- [ ] **Not yet:** the Godot export, the gallery.
