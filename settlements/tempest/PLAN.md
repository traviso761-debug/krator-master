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
| 3 | Interiors: the utse's five floors (sheet U), the ranges' rooms (T1, T2), the monastery's (M1-MR) on the Qiblai kit's interiors | |
| 4 | The grounds and the crest (sheet T0): the muster court, the drill court and the range, the Maydan, the remounts' paddock, the hay barns, the terraces, the tea garden | |
| 5 | The open world: the House on `openworld/xanadu-oidong-highrift`'s ground at 1:1, the lookout and its relay sited, the lines of sight to Strongwall and the watch posts rechecked (waits on the vertical stack: `settlements/xanadu/BUILD-PLAN.md`) | |

## Core adoption

The page is Xanadu's (`settlements/xanadu/build.py --kit`), so it takes what that page takes, and through `kit.json`:

| Need | Module | How |
|---|---|---|
| placement records, seeds | `core/rand` (`KRAND`), `core/tags` | Xanadu's page; every piece placed through `VERN.place` and registered (`vnReg`) before it is drawn |
| the fort's plan rules and walks | `kits/xanadu` XFORT (80f) | read in place (`kit.json` `external`); the House's plan is in its record shape |
| the fort's drawing | `kits/xanadu` 80g (`xfCurtain`, `xfTower`, `xfGate`, `xfWalks`, `xfRange`, `xfSmall`, `xfKeep`) | read in place; not copied, not edited (`KNOWN_ISSUES.md` lists what the House needs added) |
| wall walks and stairs | `core/walk` (`KWALK`) | through `xfWalks`; the verify's `house-walks` (`xfReach`) |
| ruins (step 2) | `core/ruins`, `core/terrain` 37c (KRUBBLE) | taken now (`kit.json`) for the states to come |
| doors | `core/door` | Xanadu's page (`xnDoorway`) |
| the ground | the scale model via `tools/scale_ground.py` | baked at every build into `gen/69t-tp-ground.js`; no local noise, no `getImageData` |
| the sky | `KratorSky` | as Strongwall's page |
| the violet monastery | `kits/qiblai` (89q0 helpers, script, matlib; 89q3 sacred) | read in place, its pack (`packFrom`) |
