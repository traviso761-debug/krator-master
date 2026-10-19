# Highlands — known issues

Open items are `- [ ]` lines; build.py prints them.

- [x] (2026-10-15) Highlands and Roketstad on core/host (ROADMAP.md section 10, step 3), as Iziz: `src/92-camera.js` re-vendored from
      Iziz's (the camera layer), `src/00-head.html` the same, `src/99-start.js` the take, and `src/91h-hl-tags.js` adds every REG site
      to the core/tags registry the furniture is in (so the inspector and minimap read the buildings too), mapping Highlands'
      spellings onto the vocabulary (the branch cultures onto republican, rustic and painted; guild, warehouse, fuel to industry,
      storage and spaceport to infrastructure, garden to farm; a ruin or salvage yard a state): 0 unknowns on both pages. Proof:
      verify.py --assert unchanged; the rows' census matches exactly at four views (the old page's furniture batch differs run to
      run, the new one's matched its first run); Roketstad differs run to run on the old page too (3,727 to 3,749 registered
      volumes, 546 draw calls over three old runs; the new page 3,729 to 3,749, 546 to 548). TICKS is not handed over (its fire
      flicker reads NIGHT, which no Highlands page defines).
- [ ] Deliberate vendor drift (Oct 2026): `src/91-probe.js` (vendored from settlements/iziz) counts each placed catalog furniture piece as a sample of the volume it stands in, so Roketstad's open-air markets, whose goods are now one page-wide furniture mesh, are not reported empty. Upstream Iziz places no catalog furniture, so the change stays local until it does. 2026-10-13 (the re-vendor session): kept, and named in `ADAPTED` in build.py, so `--vendor-check` reports it as "adapted on purpose" instead of DRIFT; Xanadu and Reed Lake take this copy (the line is inert without `HLF`).
- [x] Vendored Ancients fragments `30-kit 36-decor 38-helpers2 54-mat-concrete 69-mat-salvage` were copied from `../iziz/src` and differ from `../ancients/src` (the drift Iziz already carries); re-vendor both kits together. — closed round 10b: after merging main, all five re-vendored verbatim from main's `../ancients/src` (brings `KIT.meshes`, `cellD`, the `bodyGroup` topple fix, `biomeN`/`BIOME` and the firelight kit); both targets build and pass `--assert`. Iziz keeps its own copies.
- [x] `vnStairs` (vendored from Iziz) centres its run at `run/2` while treads span `steps*.32`, so the top treads can end inside the wall; `hnKryltso` inherits it (R-A works around it with `hnRAKryltso`). — round 10: `vnStairs` is self-consistent (its run IS `steps*.32`, centred on z); the fault was `hnKryltso` sizing its run as `rise*1.3`. It now takes the treads' own run, foot at `run`, top at the wall. Vendored file untouched.
- [x] Vendored Iziz fragments `69b-vern-mat 69c-vern-helpers 91-probe 93-labels` had drifted behind `../iziz/src` (`--vendor-check iziz` reported all four). — 2026-10-01: re-vendored verbatim from Iziz (brings the thatch dress and fringe, the frame rails that no longer cross at the corners, the ridge fill, `CHIMNEYS`, `vnSkirtGeo`, the label declutter). The showcase budget this build had written into its copy of `91-probe.js` (4.5 M / 450) now sits in `targets/highlands/91z-views.js`, the way roketstad sets its own. `--vendor-check`: ancients 13 identical, iziz 5 identical.
- [x] World-UV materials all drew at one K (the `vWorldUV` closure gave every K the same program key, so stone, plaster and the panels tiled at whichever compiled first). — 2026-10-01: `vWorldUV` moved to `core/materials/opt/69a-world-uv.js`, one program per K; this build opts in through `CORE_OPT_FILES`. Stone (K .25) and the white/rust panels (.125) now tile at their own, coarser scales.
- [x] `hWorldUV` (71-hl-mat, the Ku/Kv world UV for the lace, frieze, lattice and rail maps) was the same kind of closure, so all its materials shared one program. — 2026-10-01: it now calls the shared `vWorldUV(mat,Ku,Kv)`; the frieze, valance, balustrade, lattice and rail maps tile at their own sizes. Reedlake (vendored) took the fix; Dalab's copy still has the closure.
- [x] Steep `hnGable` roofs drop the eave low; dougong placed under such eaves disappear or poke through — packages put brackets on porches, loggias and galleries instead. — closed round 10: the frame (73b) lifts every storey roof by its bracket height (`hlLift`) and places the sets in `hlFrameFlush`, so storey eaves carry their dougong; the remaining explicit `hnDougong` calls are all on galleries, porches or curved roofs.
- [ ] Furniture placed from the catalog (FURNISH, round 11): the Rustic and Tribal builders (80, 81, 81b, 84, 85, 85b), the Republican builders (74–79f) and the shared yard helpers of 73 are converted. `hnTotem` still draws the Republic's carved column (the catalog's pillar is 6.8 m; the Republic's totems reach 12.5 m). Left drawn because the catalog has no matching piece: yard banner poles (`vnBannerPole`), the Republic's flag masts (`hnRBFlag`), hazard pennants and bunting; Rustic and Tribal: the Einhof dung heap, the scrap-iron market's sheets leaning for sale, the hull naust's longboat, the warrior hall's spears leaning on its front, the long-dwelling's drying poles under its veranda and the herbs under the shaman's eaves, the shaman's cairns, the granary's flail, the tribal smithy's tools on the back wall, the scrap forge's sheet racks and wheels; Republican: the goods on the shop row's shutter counters, the wheelwright's iron tyres, the cooper's staves and hoops, the Ancient panels leaning on the small smithy, the coal, spoil and rubble heaps (`hnRCHeap`), the Salvagers' sorted heaps, the Forgehouse yard's leaning plates, the shipbreakers' hull segments, ring section and engines on sledges, the fallen arcology's debris, the mustering ground's field guns, the salvage garage's wrecked car, the hull-breaker's pipe rack, the mine's pit props, the silo house's porch pots, the roof washing lines, the hay in the loft doors and in the pole hay barn, and machinery (cranes, jibs, derricks, the bellows house, the generator's dynamo, clock gears). Removed as indoor (the interiors' rooms): the two-room log house's lean-to crate and barrel, the large smithy's hearths, anvils, troughs and bar-stock racks (its two iron stacks still rise from the roof), the lantern stall's shelves and counter, the salvage garage's tool chest (it stood inside the tower's walls); the Forgehouse hearths stand in their doorways, against the dark (`hl_rep_wall_forge`). The great plank-house's entrance pole stays drawn on purpose: its mouth is the door. Sizes are the catalog's: a helper asked for an odd size gets the nearest variant (a 8 m woodpile is 6 m, the warrior hall's shield rail is 5 + 3 shields). A piece's seed is its place in `HLF.placed`, so adding placements shifts the seeds (shades, small random details) of the pieces placed after them.

## Roketstad's mask (2026-10-05)
- [x] The buildable mask and street classes are core/mask grids (`KMASK.canvas`, hard-edged; `core/mask/README.md`):
      placement went from 3348 to 3482 records (soft road edges no longer block plots), the same on GPU and CPU
      canvas loads; checked with a screenshot pair from the opening view.
- [ ] (2026-10-06) The vernacular MAT keys take the material library (materials.json, Iziz's rows; src/88y-highlands-matlib.js binds them through core/materials/record/26-matlib-bind.js). The build's own families (its patterns, bands and tiles) are not wired yet. verify --assert passes, as before.
- [ ] **The Highlands families take the material library** (2026-10-06): logs, scale, rubbleW, bamboo, bmat (materials.json; tint.colour keeps the
      warm ones warm). ?mat=proc shows the old look.
- [ ] **The colour pattern sheets take the material library** (2026-10-06): the glazed tile of the Temple of the Pantheon and the wall towers
      (hTile*), the green harlequin dome and the arcology's labyrinth; 88y keeps each map's own repeat (MATLIB_REPEAT). The world-UV tile twins
      (88-hl-dress.js) still clone the procedural tile. ?mat=proc shows the old look.
- [ ] **The owner's 2026-10-14 sheets**: the red and dark harlequins (hHarlR, hHarlGt), the painted beams (hCaihua, mapped once per
      bay) and the frieze boards (formF: `patterns/tribal/formline`, a 0.5 m panel). The formline sheet is not periodic (it is
      mirror-symmetric): a doubled eye pair shows at its repeat on a long frieze. ?mat=proc shows the old look.

## Roketstad's forest: the North Highlands kit (2026-10-14)
- [x] Roketstad vendored the north-west lowlands biome and an old copy of the biome core (`targets/roketstad/86-bio-10..70`,
      core version `eastabyss-1`; `--vendor-check` never covered them). It now reads `core/space`, `core/biome` and
      `biomes/nhighlands` in place (build.py `TARGET_BIO`); only the host binding `86-bio-45-init.js` is local, and
      `--vendor-check` says what the band reads. The mask is the same function (core/mask grids, no canvas pixels); the
      climate fields' noise is KRAND's; the host seed is `KRAND.child(SEED_RK,'nhighlands')` (the kit's passes reseed
      themselves from their own constants, as on its own page). The town is unchanged: the same 2308 town volumes, 852,845
      kit instances, plots, streets and placements; `verify.py --assert` passes before and after. Counts, before -> after:
      trees 4325 (1243 hero, 3082 far) -> 7366 (1715 hero, 5651 far; 33 trumpet colonies); biome instances 93.5k -> 311k;
      biome triangles held 1.87 M -> 4.10 M (scene 17.3 M -> 19.5 M of the 32 M budget); `REG` 3482 -> 3700 (the old
      kit put 1174 hero trees in it, the new binding 1392); the build 18.9 s -> 22.6 s (biome 6.1 -> 10.6 s), on a busy
      machine. The numbers per view are in README.md.
- [ ] **The forest's detail is decided at placement, round the spine** (the kit's rule, biomes/WORLD.md item 8): a tree
      past ~560 m of the N, S or W gate or the port is only ever an impostor, so the forest off the town's NE and SE
      flanks is impostors up close. A ring of eight spine points round the wall gave hero trees all along the edge but
      held ~4.6 M more triangles and drew 40% more at the opening view; the three gates were the trade.
- [ ] **Draw calls are up** (~400 to ~570 with LOD on, from ~290 to ~400): the kit's near floor is ~30 item types, one
      call per chunk in range (the kit's own KNOWN_ISSUES, "the near-band floor"). Under the 1200 budget.
- [ ] **The understorey trumpets are not in `REG`** (they are core/tags records): a colony's small stems are drawn
      merged, and the probe found no sample inside seven of them, so `registered-volumes-non-empty` failed with them in.
- [ ] Fallen logs test the mask every ~4 m along their length (the kit's `log()`), so a log could in principle bridge a
      lane narrower than that; none was seen in the screenshots.

## Roketstad's determinism (2026-10-15)
- [x] **The same page placed different towns from load to load** (6066 furniture records once, 5994 the next; Republic houses
      switching between a def and its `_reclaimed` twin). Cause: two shuffles in `targets/roketstad/90b-rk-build.js` were
      `.sort(()=>rng()-.5)` (the row fallback in `frontageAlong` and the back-row candidates in `backRows`). A random comparator
      is inconsistent, and V8 does not order an array the same way twice under one: traced in the browser, the same array
      with the same `rng` state came out of the sort in a different order (or after a different number of comparator calls)
      on another load, shifting the stream and every `kitKey()` reclaimed pick after it. Fixed with `rkShuffle` (a seeded
      Fisher-Yates on `rng`); five loads in a row now give the same 1797 buildings and 5738 furniture records, and the
      furniture fingerprint was rewritten. The shuffle draws differently, so the town's layout shifted once (same rules).
      Never shuffle with a random comparator in any build.
- [ ] `src/34-kitdefs.js` (vendored) paints `TEX.leafCard` with `Math.random`: the leaf card's pixels differ per load. It is
      a texture, not placement, so the layout and the fingerprint are unaffected; fix it upstream and re-vendor.
