# Reed Lake — known issues

Open items are `- [ ]` lines; build.py prints them.

- [x] (2026-10-15) Reed Lake on core/host (ROADMAP.md section 10, step 5; core/host/README.md): the camera, the controls, the walk (F),
      the frame loop, the panel, the probe's frame, the inspector (I hover, a click: core/tags records), marks (P, they replace the
      polygon tool) and the minimap (M) are core/host's on the kit page and the village, as on Highlands (host.FULL without
      core/space and core/edits). `src/92-camera.js` is re-vendored from Highlands (only ui, uiButton, setView, Labels stay;
      `--vendor-check`: 22 identical, 73-hl-carve.js adapted as before), `src/00-head.html` loses #cap, #insp, #poly and #hud,
      `src/99-start.js` is the take (FRAME_HOOKS as before, f(dt, ms), in a tick subscriber), `src/91t-reedlake-tags.js` reads REG
      into KTAGS.page (51 records on the kit page, 19 on the village; 0 unknown: 'reed-lake' is the vocabulary's 'reedlake').
      Proof: verify.py --assert passes the same six invariants with the same numbers on both pages; the scene census at four views
      of each matches the old pages exactly (two old runs match each other exactly too). Hostcheck: the inspector names "Great
      mudhif" from its record on both pages, minimap and marks work, the error panel is clean.
- [x] (2026-10-15) TICKS still runs nowhere: 69-mat-salvage.js's fire flicker (a tick reading the Ancients camera's NIGHT) is not handed to core/host, as it was never run by the old camera either. - 2026-10-20: handed over (`ticks:TICKS` in 99-start.js; `var NIGHT` defined there), so `FIRE_T` runs and the flame cards flicker. NIGHT stays false here, so the fire lights stay off; reading the page's night into it is the open part:
- [ ] (2026-10-20) The salvage fire lights (`FIRELIGHTS`, 69-mat-salvage.js) never light in Reed Lake: `NIGHT` in 99-start.js is a constant false. Set it from the page's own night (it has no night flag; a Reed Lake night is a design call).
- [ ] No reclaimed-metal variants yet (the Highlands round-3 `88-hl-dress.js` pass is not vendored; the lake's only salvage is at the smithy).
- [ ] Boats and islands do not bob. Since 2026-10-13 the lake is core/water's (`90w-rl-lake.js`) with a CPU twin (`WATER.heightAt`), but the boats, rafts and islands are baked into the kit's instanced sets, so nothing can ride it; the lake is kept calm instead (`RL_LAKE_FIELD` .12: at most 7 cm from `RL.WATER`, and the canoes' keels sit 9 cm under it). A boat that should ride needs its own group (`WATER.ride`, as the Ring Sea kit's hulls do).
- [ ] The loose-reed fringes stand across their edges instead of along them: `hnRLEaveFringe` and the island fringe in `hnRLIsland` (75-rl-helpers.js) turn the plane by `yaw = atan2(dx, dz)`, which lays a unit plane's width across the segment (the lattice in 78/79 adds `+ Math.PI/2`). Seen 2026-10-05 on the thatch hut's front eave: the fringe sticks out toward the viewer. `81-rl-tavern.js` lays its own fringe along the landing eaves. Fixing the helper changes every def's look: rebuild and look at every row.
- [ ] `81-rl-tavern.js` has no row in `PORT.md` yet (the port lint warns): it is `[draw]`, "split: the sign texture (canvas) and the builder" (rerun `tools/audit_port.py`, then set the tag).
- [x] `--vendor-check` reports drift in `73-hl-carve.js` and `91-probe.js` from `../highlands/src` (upstream changed 2026-10-01; seen 2026-10-05, not re-vendored).
      — 2026-10-13 (the Ancients re-vendor session): `91-probe.js` re-vendored from Highlands (its one new line counts
      `HLF.placed` furniture as volume samples; Reed Lake has no `HLF`, so it does nothing here and `verify --assert` is
      unchanged). `73-hl-carve.js` read hunk by hunk: every difference is Highlands' catalog-furniture conversion
      (`hnTotem`, `hnWoodpile`, `hnFirepit`, `hnMenhir` call `FURNISH`, plus `hlRngSkip`, `hnFurn` and the Iziz yard
      pieces), and Reed Lake loads no catalog furniture (no `89y-hl-furnish.js`, no `FURNISH`) while `hnRLHearth` and the
      tavern call `hnFirepit`. So it is kept behind on purpose and named in `ADAPTED` in build.py (see the open item below).
- [ ] (ADAPTED, 2026-10-13) `src/73-hl-carve.js` is Highlands' copy from before its catalog-furniture conversion (the drawn
      totem, woodpile, firepit and menhir). Re-vendor it when Reed Lake places furniture from the catalog (take
      `89y-hl-furnish.js` and the catalog runtime as Highlands does); until then `--vendor-check` reports it as
      "adapted on purpose".
- [ ] The reed beds round a pad are placed by angle from the pad centre, so a boat moored just off the landing can stand in reeds on a very irregular outline.
- [x] Row labels overlap in the whole-kit overview (the label atlas is the vendored Highlands one; per-row views are clean). 2026-10-01: the re-vendored `93-labels.js` brings Iziz's declutter (overlapping labels are hidden, landmarks and the nearest first); not yet checked against the whole-kit overview, so left open. - 2026-10-20: checked: the re-vendored declutter holds at the Overview (3 of 48 labels shown, none overlapping); closed.
- [x] Vendored fragments had drifted behind `../highlands/src` (`--vendor-check` listed 30-kit 36-decor 38-helpers2 54-mat-concrete 69-mat-salvage 69b-vern-mat 69c-vern-helpers 73-hl-carve 93-labels). — 2026-10-01: all re-vendored verbatim from Highlands, plus `71-hl-mat.js` (its `hWorldUV` fix); `--vendor-check`: all 23 identical. Brings the Iziz thatch dress, frame rails, `KIT.meshes`, the concrete topple fix, the `hnKryltso` run fix and the label declutter.
- [x] World-UV materials all drew at one K (the `vWorldUV` and `hWorldUV` closures gave every K the same shader program). — 2026-10-01: Reedlake takes the shared `vWorldUV` from `core/materials/opt/69a-world-uv.js` (`CORE_OPT_FILES` in build.py); its 69b no longer carries a copy, and `hWorldUV` (71-hl-mat) now calls the shared one with its second K.

## Level of detail (core/lod)

- [x] No LOD: `core/lod` now takes over both pages (README, "Level of detail"). The village is small: the overview
      drops from 223k to 78k triangles, close views by about 4%.
- [ ] (2026-10-06) The vernacular MAT keys take the material library (materials.json, Iziz's rows; src/88y-reedlake-matlib.js binds them through core/materials/record/26-matlib-bind.js). The build's own families (its patterns, bands and tiles) are not wired yet. verify --assert passes, as before.
- [x] **The Highlands families take the material library** (2026-10-06): logs, scale, rubbleW, bamboo, bmat (materials.json; tint.colour keeps the
      warm ones warm). Reed Lake's own reed surfaces too (rlMat, rlMatM, rlThatch, rlIsland, rlLayer, rlBundleX). ?mat=proc shows the old look.
- [x] **The Andean patterns take the material library** (2026-10-06): the band, the shield (chakana) and the hanging (chakana-textile-red, a
      diamond weave where the painter drew multi-colour stripes). The chakana cut-outs stay procedural; the fringe (`rlFringe`) and the mudhif lattice (`rlLattice`) take the owner's magenta cut-outs since 2026-10-14. ?mat=proc shows the old look.
- [ ] **Two hanging styles** (2026-10-06): hRLStyle.hanging (74-rl-mat.js) is 'chakana' (the library's red chakana weave, the default here)
      or 'stripe' (the procedural striped awayo, MAT.rlClothS, never bound). Mungo's reed village sets 'stripe'.

## Voth census trades (2026-10-19)

The table `RL_TRADES` (`src/82-rl-trades.js`) says which building carries each of the Voth city's 44 trades (`tools/trades_census.json`); `verify.py --assert` checks it (`voth-trades`). 13 carried, 3 partly, 10 gaps, 18 na of 44.

Missing buildings (gaps) and partly carried trades:

- [ ] bakers: a bake hut: reed-flour flatbread ovens on an island
- [ ] butchers: a fish and fowl smoking and butchering shed
- [ ] brewers: a brewing hut (reed beer, chicha)
- [ ] tanners: a hide-working island away from the houses
- [ ] shipwrights and boatbuilders: a reed-boat builder's island (the boats exist as furniture: rl_boat_canoe, rl_boat_great, rl_boat_raft)
- [ ] shopkeepers and assistants: a shop island or stall: the reed weaver's workshop and the warehouse are tagged market/shop but keep no counter
- [ ] teachers and scholars: a teaching hut (the lore keeper's school; the shaman's house keeps the sacred lore)
- [ ] market traders: a floating market raft where the villages trade
- [ ] dairymen: a dairy: the animal pen holds the stock but no milking shed
- [ ] ferrymen: a ferry landing: reed boats exist as furniture (rl_boat_canoe, rl_boat_great) but no ferry station
- [ ] weavers and dyers: no dye works: the weaver's workshop only works reed
- [ ] healers and nurses: a house of healing
- [ ] granary keepers and millers: no mill
