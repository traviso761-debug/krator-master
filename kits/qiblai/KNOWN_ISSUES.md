# kits/qiblai: known issues

- [ ] **The culture `qiblai` is not in core/tags' vocabulary yet.** The kit tags its buildings `culture:'qiblai'` (the owner's brief);
  `core/tags/52-core-tags-vocab.js` does not list it, so `KTAGS.page.audit()` counts it as an unknown value (counted, never thrown).
  Adding it moves every page that takes core/tags, so it waits in `TODO.md`, "Ride along with the next all-builds rebuild".
- [ ] **The eight monasteries have no names beyond their colours** (PLAN.md section 9, item 1). Each has its own colour (the
  owner, 2026-11-11: crimson, saffron, gold, green, turquoise, blue, violet, white; `QSPOKE`, `src/89q0-qb-helpers.js`) and is called
  by it ("Great monastery (spoke 4, Green)"). The council is named: the Prismarchy, its abbots the Prismarchs, whose thrones and
  banners in the Hall of the Decree wear their colours; the Rainbow Temple's eight banners face their monasteries (spoke i on the
  bearing i x 45 degrees from north: the city's plan, Q7, must put each monastery on its spoke's bearing).
- [ ] **The mixed rich street leaves a 4 m alley after the Xanadu merchant's konak** (`xa_rich_c`): it draws 3.3 m past its plot's `w`
  (its cumba), which the street audit measures. A fix belongs in `kits/xanadu` (an honest `w`), not here.
- [ ] **Two Qiblai textures are owed** (the owner, 2026-11-11: "sure new textures"): the beaten-gold roof sheet and the prayer-wheel
  copper with mantra relief, `core/materials/PROMPTS-NEEDED.md` section 53. The dressed ashlar is in: `stone.sandstone.ashlar` as the
  kit's own family `qAshlar` (`materials.json`, `tex/`, bound by `src/89q0z-qb-matlib.js`) on the plinths, the walls' bases and the ghats.
- [ ] **kits/interiors: a fixture with a small front clearance blocks the wall pieces** (found 2026-11-11, a node probe on the
  interiors core): one room fixture whose `clearance.front` is under 0.4 m (0.2, 0 or absent) anywhere in a room leaves the placer
  unable to fit a required wall piece (the shrine's altar, the hall's table): "no-fit". The kit floors every fixture's front at 0.4 m
  (`qnRoomRec`, `src/89q5-qb-interiors.js`); the fix belongs in `kits/interiors/src/45-placer.js`.
- [ ] **No city yet (Q7).** The nested-squares site on core/city is the core/city session's work (PLAN.md section 7); the kit stops at Q6.
- [ ] **The Xanadu kit's own pages are behind main's core** (found 2026-11-11, not this kit's doing): a rebuild of `settlements/xanadu`
  today changes `dist/xanadu.html` and `dist/erewhon.html` (core/shader's `06-core-khook.js` and core/water's fragments moved on main
  without a Xanadu rebuild). The `--kit` option leaves those pages byte-identical to what the old `build.py` makes from the same tree.
