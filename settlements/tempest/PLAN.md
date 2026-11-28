# The House of the Tempest: the build plan

The Order of the Violet Storm's mother house on the West Arm (scale model px 886,1619, pin `stempest0001`, the crest at 519 m;
its forward lookout `stempestlk01` on the west brow, 879,1618, 153 m). The blueprint, the owner's forks and the lore are in
`settlements/strongwall/tempest/` (`BLUEPRINT.md`, the sheets, `tempest_plan.json`); the site and the order in
`settlements/strongwall/PLAN.md` section 3a; the fort asset it is drawn with in that plan's section 5 and `kits/xanadu`.

The owner, 2026-11-23: "have beacon and tempest agents do steps 0-1 of their builds".

## Steps

| Step | What | State |
|---|---|---|
| **0** | **The layout as data**: `src/80t-tp-plan-data.js` (`TEMPEST`, `[G data]`): the two wards, their curtains, towers, gates, stairs and buildings in the Xanadui fort's record shape (XFORT, `kits/xanadu/src/80f-xa-fort-data.js`), so XFORT's rules and walks run on it unchanged; the rules a concentric house adds (the lists, the inner curtain commanding the outer, the utse astride the inner front, three gates, the monastery clear of its curtain, every building in its ward, the stables holding the war horses, gold in three places). `tests/test-tempest.js` (`tools/ktest.js`, 12 negatives) | **done** 2026-11-23 |
| **1** | **The page as a sheet**: the House drawn from that layout as a `--kit` target on Xanadu's page (`targets/house/`, `dist/tempest.html`), by the fort's own builders (80g) in two defs (the outer ward; the inner ward 4 m up on its talus) round the Qiblai kit's violet great monastery (`qb_monastery`, o.v 6); the scale model's ground round the pin; `verify.py` (`tempest-laid`, `tempest-rules`, `on-the-model`, `house-on-its-pad`, `house-walks`) | **done** 2026-11-23 (the verify: README) |
| **2** | **The damaged and ruined states**: both defs at three variants (o.v 0 kept, 1 damaged, 2 ruined), each ward's damage `XFORT.damage` on its own plan (a raid that reached the House: a breach, a tower's top fallen, the Main Gate burnt, a stable range's roof fired; abandoned: the curtains in stubs, the towers shells, the utse a storey or two, the ranges low walls, the rubble on KRUBBLE), no guns (the order takes no powder). A second target, `states` (`dist/tempest-states.html`): the two wards at their three states on Xanadu's sheet, the four ruins watched by `core/ruins`; the verify's `tempest-states` and the universal `ruins` | **done** 2026-11-23 |
| **3** | **Interiors**: the set `xanadu-tempest` (`src/80v-tp-interiors.js`, as the fort asset's `xanadu-fort`): every stack of both wards an inset body with its doors and a room programme per storey from sheets T1, T2 and U (the guard, the Sword Hall, the Marshal; the stables with the eight companies' halls and captains over them; the novices' school, refectory and dormitories; the Great Refectory, the kitchens and the lay brothers; the larder and the Cellarer; the infirmary; the smithy, the bowyers, the bath; the utse's five floors: the inner gate's keepers and the runners, the War Room, the Hall of the Banner, the Prismarch's audience room, cell and study, the signal codes), hollowed and furnished by Xanadu's interiors, on by default (`targets/house/89xs`); the ranges moved 2.5 m off the curtain so its stairs climb in an alley behind them; the inner ward's ground the talus top; the verify's `interiors-hollow-and-reach` over both wards | **done** 2026-11-23 |
| **4** | **The grounds and the crest** (sheet T0): `src/80w-tp-grounds-data.js` (`TP_GROUNDS`, `[G data]`: the fields, tracks and pieces, their rules node-tested with three negatives); the near ground's colour from them (90q: the barley terraces in bands, the tea garden, the Maydan, the paddock, the hay yard, the threshing floors, the middens, the Strongwall road and the two sally tracks); their pieces drawn on the drawn ground (`targets/house/90p`, `xa_tempest_grounds`: the remounts' paddock walls with their gate toward the House, the byres' and hay barns' open sheds, the hay ricks, the great tank, the threshing floors, the hives, the caravan halt's shed, the range's butts, the drill court's pells, the riders' targets on the Maydan); the verify's `tempest-grounds`; three views | **done** 2026-11-23 |
| **4b** | **Life on the crest** (what needs no people): `src/80x-tp-life-data.js` (`TP_LIFE`, `[G data]`): the herds (the 300 remounts and four companies' 146 horses at grass on the commons by day, in the walled paddock by night; the milking herd, 40 dri at the byres, *proposed*), each beast seeded from a hash through core/rand, and the chain of fires and mirrors (BLUEPRINT.md item 6); their rules node-tested with three negatives. `targets/house/90qt`: the herds from kits/fauna (the farm group's horse and yak, `gen/69u-tp-fauna.js`), stills instanced by coat and pose and a dozen alive; the Storm Tower's mirror flashing its code by day toward the brow, its fire and the utse's beacon by night (`?hour=21`); the brow lookout `stempestlk01` at its pin 14 km west (the fort asset's `xa_fort_post`, on the far land) with its fire and mirror; the verify's `tempest-life`; two views | **done** 2026-11-23 |
| **4c** | **Onto the fort asset's host-plan entry** (its five asks delivered, 22e3e68c2): both wards drawn by `xfDrawPlan` (80u's copies of `xfDraw`'s composition gone); the utse with the inner gate's passage through its foot (in at the muster court, out 4 m up on the inner court); the Storm Tower the fort asset's signal tower (its basket and four mirrors: 90qt lights its fire and flashes the mirror facing the brow); `TEMPEST.inner()` in its own frame now that `XFORT.walks` honours a ward's y | **done** 2026-11-23 |
| later | The people: the riders, the companies at drill, the horse-archery track ridden, the herdsmen (core/charactermodels' figures, and the riding work on its own branch); the relay between the brow and the Storm Tower (sited at 1:1 with step 5: on the model's ground no single site sees both ends, the best missing by 21 m, and the best pair misses by 4 m) | |
| 5 | The open world: the House on `openworld/xanadu-oidong-highrift`'s ground at 1:1, the lookout and its relay sited, the lines of sight to Strongwall and the watch posts rechecked (waits on the vertical stack: `settlements/xanadu/BUILD-PLAN.md`) | |

## Core adoption

The page is Xanadu's (`settlements/xanadu/build.py --kit`), so it takes what that page takes, and through `kit.json`:

| Need | Module | How |
|---|---|---|
| placement records, seeds | `core/rand` (`KRAND`), `core/tags` | Xanadu's page; every piece placed through `VERN.place` and registered (`vnReg`) before it is drawn |
| the fort's plan rules and walks | `kits/xanadu` XFORT (80f) | read in place (`kit.json` `external`); the House's plan is in its record shape |
| the fort's drawing | `kits/xanadu` 80g (`xfDrawPlan` for both wards, `xfKeep` with its passage for the utse, `xfCurtain` for the barbican) | read in place; not copied, not edited (`KNOWN_ISSUES.md`, "From the fort asset") |
| wall walks and stairs | `core/walk` (`KWALK`) | through `xfWalks`; the verify's `house-walks` (`xfReach`) |
| ruins (step 2) | `core/ruins`, `core/terrain` 37c (KRUBBLE) | taken now (`kit.json`) for the states to come |
| doors | `core/door` | Xanadu's page (`xnDoorway`) |
| the ground | the scale model via `tools/scale_ground.py` | baked at every build into `gen/69t-tp-ground.js`; no local noise, no `getImageData` |
| the sky | `KratorSky` | as Strongwall's page |
| the violet monastery | `kits/qiblai` (89q0 helpers, script, matlib; 89q3 sacred) | read in place, its pack (`packFrom`) |
