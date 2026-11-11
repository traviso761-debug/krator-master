# k-guilin — known issues

Forked from `biomes/guilin` (2026-10-26); the issues guilin carried that the fork keeps are listed again here, so this
file is the whole list for this kit.

- [x] **Roots hung off the stacks** (the owner's review, 2026-10-26): trees on a tower's top now keep their whole root
      spread on the rock (moved in, or not placed); the cliff figs, whose spread no top holds, stand at the towers' feet with
      their roots on the ground. Host check `roots stay on the rock or the ground` (6,973 trees on rock, 85 figs, 0 failing).
- [ ] **No root curtains.** With the figs at the feet nothing hangs down the faces but the kit's own creepers and the rock
      figs among the cliff points (guilin's). A fig that roots on a ledge and drops curtains would need a top wider than any
      here, or a smaller fig than nwbay's variants grow.
- [ ] **Trigon is not drawn.** The Hykkousoi city stands 5 km east of the page on the lake's south shore; there is no
      Hykkousoi building kit yet (`LORE.md` §6.16). PLAN.md question 3: draw it on the horizon when one exists.
- [ ] **The wet season only.** The model makes the plain tropical savanna (Aw: a wet season and a dry one); the page shows
      the wet season (water in the wadi's channel, green paddies). A dry-season state (the channel dry, stubble, straw
      grass) is a later view (PLAN.md section 7).
- [ ] **guilin's Earth trees in a +32 °C climate.** Masson and Yunnan pines, ring-cupped oaks and osmanthus are
      subtropical; they are kept as the owner asked (PLAN.md question 1 asks whether the pines give way to a Krator species).
- [ ] **151-159 draw calls** against guilin's 37-43: nwbay's borrowed species are drawn as its variants (one instanced
      item per variant part: nine species, six variants, two levels). Under the page's budget (220). nwbay's host option
      `bakeBark` (the bark baked into the kit's buckets) would take most of the bark's calls back if the page needs them.
- [ ] **nwbay read in place moves this page.** A change to nwbay's species, trees or variants (its `50`, `55`, `56`) or its
      pack changes k-guilin's borrowed trees; rebuild and verify k-guilin with nwbay (the owner chose this, 2026-10-26).
- [ ] **The lake's far shore is the model's, not drawn.** The open water runs north off the page into the haze; the far
      lake is flat water under the page's (`WATER.open` with a mask), the far ring's land follows the page's shore line.
- [ ] **The far ring and towers are view-only** (no records: an open world placing this kit must make its own).
- [ ] **No catalog fruit for the pomelo, the osmanthus flowers or bamboo shoots** (guilin's; `FRUIT_NOT_DRAWN` in
      `99-host-take.js`). Adding them touches `kits/catalog`, which every furnished build takes.
- [ ] **A tree on a dome's slope can stand up to ~1 m proud of the wall** where a bed's chamfer pulls the mesh in
      (guilin's: the layout's wall is a straight line from foot to top).
- [ ] **The paddies are flat cards** (one per field, its state's colour), with tufts only near the LOD spine (guilin's).
- [ ] **No villages, rafts or people; no fauna.** The bay people's farm villages would be `core/hamlet`; nwbay's fauna
      (soarers, darters) could be read in place as its species are.
- [ ] **Not in Godot yet**: the rock is meshes made from KSTACKS records (exported as `KGUILIN.records()`).
- [x] **Crowns floating off their limbs** (2026-11-09; the GPU verify's core attach audit: 3783 of 11257 cards, 33.61%, oakleaf,
      pomeloleaf, osmleaf, camphorleaf; then scrub, bambooleaf, osmbloom under them). `crown()` (55) scatters clumps over a dome
      round the tree's middle, not on the limbs; the cliff scrub's stem stood .35 of the cushion out from the wall. Now
      `KGUILIN.held(fn)` (55) logs each builder's spans (`BIO.segs`) and `holdP` brings a card past the audit's reach toward the
      nearest one (`BIO.snapSeg`, `BIO.holdTo`: .55 of its size centred, .2 of it + .3 m for a stem card); wraps bamboo, banyan,
      camphor, osmanthus, pomelo, oak (not the pines) and the rock figs (57, with their grip on the wall as a span); the osmanthus
      blooms sit on the twigs; the scrub's stem is .2 m inside the layout's wall. No draw added or moved; `?hold=0` for the old
      crowns. Audit after: 71 of 10048 (0.71%; left: orchidbloom 42/165, needle, fernleaf, lotus 6 each). The crowns are tighter
      round their limbs: the look moved, not yet judged by the owner.

## The final rebuild (pair 13, 2026-11-09; cloud session, no GPU: built and CPU-checked only)

Branch `claude/rebuild-k-guilin-cloud`, cut from `claude/integration-b91c04`. The page is rebuilt on the universal set (`PLAN.md`
section 5, "The final rebuild"); every change is in `src/`, `build.py` and `materials.json` (with `tex/pack.json` from `pack.py`).
**Not verified on a GPU or in software GL:** `verify.py` was not run. CPU checks: `tools/build.py biomes/k-guilin` (syntax OK),
`check_assembly` (k-guilin's five baselined MISSING, `BIO.leafOn`/`leafQ`/`impostorItem`/`impostorPut`/`impostorSet`, are gone; nothing
new), `check_core_use` (none new), `check_port` (ok), `check_source` (none over the baseline), `check_cells --ratchet` (k-guilin 5 to 0).
One load in headless Chromium on software GL (a scratch script, not `verify.py`, no asserts): the error panel stayed empty and the console had
no errors; built in 23.6 s; `KGROUND` on the ground, `KSTRATA` on the rock, `KHORIZON` baked (256 texels, 61 materials shaded), height fog and
rain cover on, the mirror switch made (off), KSHADOW not attached, `impTrees` items in both registries (kguilin, nwbay).

**What changed on the page:**
- `build.py`: core/biome 31b, 31j, 32, 33, 34, 41; core/terrain 35 (+35z), 43, 45 (+ its shade); core/shadow; core/atmos's height fog
  (sky 89-atmos-j-fog, host j-heightfog), rain cover, lightning; core/water ext 57, 58; `build_sources` (`--list-sources`, `report()`);
  `--station <name>` (no station exists); LF writes for the page and `.syntax.js`; the FORBID scan skips core/ paths.
- the far trees: this kit's bamboo, banyan, camphor, Masson and Yunnan pines and nwbay's borrowed trees are octahedral impostors
  (`?diet=0` brings the blobs back); `BIO.impostorLook` gain 2.2 (nwbay's).
- nwbay's species read in place now take nwbay's attach fixes (`NWBAY_LOOK.joints`, `.holds`): their limbs flare into their parents and
  their blooms and crown clumps are held to their limbs, so **the borrowed trees' shapes move** (keys, indices and placement kept).
- card cells (`check_cells --fix`): `scrub`, `pomeloleaf`, `pineleaf`, `bambooleaf` crowns held by their stems, `lotusbloom`'s cell
  widened to the whole flower: these crowns' look moves.
- the towers' walls and the blades carry the limestone's beds (KSTRATA, nwbay's recipe as `kguilin-karst`); the plain's litter, sand and mud
  are KGROUND layers over the grass; KHORIZON's terrain shadows at a low sun; KSHADOW only with `?shadow=1`.
- the air: height fog with a dawn valley mist, the rain cover, the wind on the foliage, A2C.
- the lake: no surf and no breakers (BACKPORT.md's still-water rule; `?breakers=1` to compare); the reflections switch, off at load.

**For the coordinator's GPU verify (`verify.py dist/k-guilin.html --assert --all-views`):**
- [ ] the impostors: `BIO.bakeImpostors` must finish (library maps decoded) and the far tiers read as trees, not cards; their light against
      the near crowns (`?impgain=`), and the instance cap (no `capWhy` was added: if `impTrees` or a borrowed item trips it, say why or lower it).
      2026-11-08, checked against the owner's rule (dense foliage that is meant declares `{cap, capWhy}`): no cap is recorded as tripped, and
      `impTrees` is one instance per far tree of five species (kit trees on 1.5 km of 5-70 m cells behind keep-clear pads; 6,973 trees stand on rock), far
      under 250k, so no `capWhy` and no coarsening. The harness's `BIO.capReport` check on the GPU verify still confirms it.
- [ ] the attach audit with nwbay's joints and holds on and the stems on the crowns: the borrowed species were drawn without them before
- [ ] shader-programs and shader-errors: the ground now chains KGROUND, KHORIZON, cloudShade, the weather's wetting and the height fog on one
      Lambert material (four KGROUND samplers + the horizon's two); the rock walls chain KSTRATA, KHORIZON, cloudShade and the height fog
- [ ] the look: the beds on the towers (the bands should read under the rain streaks, not over them), the KGROUND plain at distance, the
      valley mist at dawn (`#hour=5.5`) and gone by 10:00, the towers' shadows at a low sun, the lake without its white edge
- [ ] KSHADOW's cost with `?shadow=1` (off by default, so the default page costs nothing)
- [ ] `?mirror=probe` on the lake: the towers in the lake and the bay's shore in the reflection

**Recheck when ehighlands' turn (pair 13, the other session) merges:** nothing reads ehighlands on this page (`build-inputs.json`: only
nwbay's 50/55/56 and pack and the hyperjungle's 41 are read in place), so its merge moves no k-guilin text; `tools/reach.py` on ehighlands'
`src/` should still not name this page. **When nwbay moves** (its species, trees, variants or pack), rebuild this page with it, as before.

**Owed (not this turn):**
- [ ] `KSTACKS.contour` and `KSTACKS.weather` on the towers and blades (BACKPORT.md's row): the cliff points, drapes and orchids are placed on the
      records' walls (46 `KGUILIN.wall`), so a worn mesh needs a seat pass on the drawn wall first (korona's staghorn seat, 89z there).
- [ ] KFAR: not taken; the page's own karst beyond (47) stands in. A KFAR lattice from the scale model would need the ring's towers kept off it.
- [ ] wet ground and puddles (R9): waits on the black-ground finding on a KGROUND floor (oidong, korona).
- [ ] BACKPORT's karst springs (clear-water look), the wadi's confluence with the lake (`WATER.join`), tall falls, `BIO.bamboo` for the
      phoenix-tail bamboo (the owner's note: k-guilin takes a bamboo variant) and karst site 1's caverns: features for a later pass.
- [x] core findings, for core's owners: KGROUND's distance on a Lambert ground reads `cameraPosition` (0 there); this page redirects it to
      `kEye()` with a define, as korona does: `core/terrain/43-core-ground.js` should read `kEye` itself.
      2026-11-08: closed by the core fix of 2026-11-08: `43-core-ground.js` and `30-core-foliage.js` take the eye from `viewMatrix` (the page's define is now redundant but harmless).
