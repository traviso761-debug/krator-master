# Xanadu — known issues

Open items are `- [ ]` lines; build.py prints them.

- [ ] (2026-11-10) **The Pleasure Dome's interior: what is not there yet.** Built hollow in the black-and-white pattern system
      (`citadel/PLEASURE-DOME.md` has the record and the table against the owner's twelve references). Open: the catalog
      furniture is still the court set's colours (a tint in core/furnish's draw is owed) and comes only with `?interiors=1`; both
      stones' sets (`stone.marble.black`, `stone.marble.calacatta`) and the op-art sheet (`patterns/xanadu/op-art-arcs`) arrived 2026-11-10
      and are packed (`xMarbleB`, `xMarbleW`, `xOpArt`), so the built page shows them at its next rebuild (until then it is on
      `rock.marble012` as `xMarble` and the shader's op-art): check their scale and the black stone's gloss then; no pierced
      plaster ceilings, round windows, rib vaults or pierced balustrades; the Sultan's lattice box and the Golden Way are not
      drawn; two stair halls are additions to the blueprint. The Dome of the Bay is hollow too (one rotunda, no furniture). The
      Dome's block overlaps the palace's and the temple's lots by a metre: the combined rebuild checks that seam.
- [ ] (2026-11-09, delivered 2026-11-10) **The citadel's textures: nine of the eleven owed sets are wired, the page not yet rebuilt.** Erewhon's
      citadel (kits/xanadu 78l-78n, the interior set kits/interiors/sets/xanadu-citadel.js) draws its surfaces through eleven MAT keys, each a
      family in materials.json (both copies). On 2026-11-10 the owner delivered ten of section 41's eleven (`core/materials/PLAN.md`, "Delivered
      2026-11-10") and nine families went onto their sets (`owed` dropped): xZel patterns/xanadu/zellige-star, xHaft patterns/xanadu/haft-rangi,
      xGiltC patterns/xanadu/mughal-gilt-ceiling, xYes stone.stucco.yeseria, xMuqT tile.muqarnas.turquoise, xBandR patterns/xanadu/peacock-band,
      xPietra stone.pietra-dura, xMarW stone.marble.calacatta, xMarK stone.marble.black (the Domes' xMarbleB, xMarbleW and xOpArt were already on
      those ids). Still a stand-in: xJaliC (patterns/xanadu/jali, `optional`: the procedural jali alpha until the card is delivered and keyed by
      tools/textures/cards.py). xSandR (red sandstone) is the library's own rock.sandstone.red, owed nothing. `wood.cedar.moorish` (the door
      leaves, shutters and painted beams) is in the library since 2026-11-10 but has no family yet: the leaves are core/door's panel leaf in the
      kit's dark wood and the beams flat paint until the kit takes it up. tex/ of both copies is packed; rebuild and verify Xanadu and Erewhon,
      and check the families' scales (haft-rangi and the peacock band tile a non-square period squeezed square) and the marbles' gloss.
- [ ] (2026-11-09) **Erewhon's citadel: what is built and what is not.** Built (kits/xanadu/src/78n-xa-citadel.js): the Sultan's
      palace (E1, E2a, E2b: 46 rooms, the forecourt, the two ranges, the palace block, the Sultan's floor, the roof terrace and
      the ochre block under the twin domes, the Ramp of the Sultan as two laps from the Hall of Gifts to the bath and the roof),
      the Grand Vizier's palace (E5a, E5b, the Divan, the pool garden), the Treasurer's, the Chancellor's and the Master of
      Mines' houses, the envoys' house and the barracks (Moorish dars round fountain courts), the court temple (its great iwan,
      the prayer hall under a star ceiling and a dome), the citadel kitchens; all hollow, walkable, storeyed. Not built: the
      Golden Way (the covered court between the Dome's north door and the palace's postern: the 6 m gap is open ground; the
      Pleasure Dome session owns its door), the citadel gate (xa_palace_gate, still the kit's solid piece, held), the curtain
      walk and the palace's north curtain (the palace is pinned on the Dome's axis with its back on the citadel wall, which is
      narrower there than the blueprint's 110 m curtain: CIT_SITES `at`), the corner towers' and the roof guard's rooms, the
      upper floors' windows onto the courts' porticoes as galleries. The blueprint's NEW furniture (the Great Divan, the
      palanquin, the hoist, the lattice boxes) is not in the catalog; the rooms take the catalog's xanadu court pieces by kind.
      The furniture follows the page's switch (?interiors=1), as the rest of Erewhon. The kit's own sheet (kits/xanadu/build.py)
      takes the citadel files (kxa.CITADEL) and the 'xanadu-citadel' interior set (2026-11-10, the combined rebuild). In Erewhon the
      palace's two back piers now stand inside the citadel wall's thickness (3 x 1.5 m, were 4 x 3: with the palace 2 m north they
      reached 1.5 to 2 m past the wall's outer face); its lot's back corners (z -307) lie outside CIT_POLY (6.9 m NW, 10.4 m NE of
      the wall line), but nothing of it is built there: the rooms' back (z -296) is 2.3 to 7 m inside the line.
- [x] (2026-11-10) **The seam between the palace and the Pleasure Dome: an 18 m step.** The palace's block is levelled at 153 m,
      the Dome's at 171 m. Fixed the same day by the owner's choice: the Golden Way built as a descending court in the slot
      between the two (kits/xanadu/src/78o-xa-golden-way.js; `citadel/PLEASURE-DOME.md`, "The Golden Way"): the ground there cut
      to the palace's level, the Dome's North Door moved 4 m in to its north face, the gate iwan's preset back in a court before
      it. Left: beyond the Way's end walls the slot keeps the terrain's 4 m slope between the two levels.
- [ ] (2026-11-10) **Interiors (`?interiors=1`): hollow walls, the set, the reachability audit.** The furnished defs are drawn
      hollow by the Vernacular's auto bodies (69e6) round the set's rooms (`kits/interiors/sets/xanadu.js`), their doors unlocked;
      `verify.py --interiors` runs `tools/ix_reach_audit.js`. Fixed 2026-11-10: a battered block up to 5 m wider a side than its
      INSET plan is drawn hollow (1.8 m before: the temples', guild halls' and manors' blocks stayed solid, their rooms sealed),
      the band between such a wall and the rooms is walk floor, and an iwan on a hollow building is a passage with the door in
      the wall behind it (89y; the held palace is never hollow, so untouched). The sheet: 3,671 of 3,972 floors reached (3,453
      before), 391 slivers beside stairwells counted apart; 43 buildings keep an unreached floor: the hillside manors and the
      konaks (`xa_rich_b`, `xa_rich_c`, their `_palopo`), the shop rows (`xa_shops`, `xa_shop_turk_a`), the monastery's hall,
      the grand temple (its door 7.2 m up its flights), the fortress's keep, the baths' rooms, the granary, the farmhouse: in
      each the builder's door is on a block the set's body does not match, or a raised door with no flight in core/walk. Erewhon
      (`verify.py dist/erewhon.html --assert --interiors`, the combined rebuild, 2026-11-10; OK): 53,240 of 54,985 floors
      reached. The citadel belongs to the citadel sessions (`-pleasuredome`, `-citadel`; 2026-11-09): every placement inside its
      wall (CIT_POLY) builds as before here, with no hollow walls and no rooms from this set (`XAF.held`: 116), EXCEPT the
      citadel's own buildings (`xa_cit_*`, 78n) and both Pleasure Domes, which take their items as on those sessions' pages
      (the hold had taken their furniture and planned floors: the citadel's audit, 133 floors, could not run). The citadel:
      133 of 133 floors reached (the palace 46, the Vizier's 13, the temple 6, the barracks, the Master of Mines', the
      Treasurer's, the Chancellor's and the envoys' 13 each, the kitchens 3). The Garden Pleasure Dome is built with the hollow
      wrap off and only furnished by its item (its walk is its builder's, 78d): `xdomeReach` 78 of 78. The furniture is textured (the catalog's detail maps, `tex=True`; the `tile` family on
      the library's `ceramic.glaze` since 2026-11-10).
- [ ] (2026-11-03) **Doors and glass: the kit's bodies are solid.** The kit takes core/door and the Vernacular's openings
      (69e5) and `kits/xanadu/src/71c-xa-openings.js` (kits/xanadu/README.md, "Doors and glass"): on the sheet 599 doors (each a
      real leaf in KDOOR, locked, with an id from its def and placement) and 5,912 panes where there were black plates and dark
      glass (vDarkB 2,425 -> 40: wells, a shaft, ovens and kilns; vWinGlass 1,996 -> 0); the arch heads and niches
      (xArcDark) are the room's dim back, the Grand Baths' coloured glass is transparent. What is left: no builder draws its walls
      hollow and the pages have no interiors and no core/walk, so every door is locked and there is nothing to audit for
      reachability; Erewhon's leaves are handed to the host chunk by chunk (90-xa-doors.js), as its items are emptied after each
      chunk (69e5's IZDOOR.finish/tick assume one bake). 69e5's room card is the plaster's light colour, which on these whitewashed
      faces read as no window: 71c recolours vnWin's (the fix belongs in 69e5). Longsong's XAK carries the doors (each proto's in
      `userData.doors`), but the protos are flattened, so its leaves are static. Proof: verify.py --assert keeps every check:
      the sheet as before (6 pass, the biome's triangle budget OVER as before), 88 -> 90 draw calls, 5.42 M -> 5.48 M scene
      triangles; Erewhon 7 of 7 (2,547 doors, 26,780 panes, vDarkB 38 left), 1,042 -> 1,045 calls, 21.12 M -> 21.39 M; Longsong
      (XAK) the same 72 passes, its draw-call OVER and its one FAIL as before (the stale interiors bake), 522 -> 527 calls.
- [x] (2026-10-15) Xanadu on core/host (ROADMAP.md section 10, step 5; core/host/README.md): the camera, the controls, the walk (F),
      the frame loop, the panel, the probe's frame, the inspector (I hover, a click: core/tags records), marks (P, they replace the
      polygon tool) and the minimap (M) are core/host's on the kit page and Erewhon, as on Iziz and Highlands (host.FULL without
      core/space and core/edits). `src/92-camera.js` is re-vendored from Highlands (only ui, uiButton, setView, Labels stay;
      `--vendor-check`: all 19 identical), `src/00-head.html` loses #cap, #insp, #poly and #hud, `src/99-start.js` is the take
      (FRAME_HOOKS as before, f(dt, ms), in a tick subscriber), `src/91t-xanadu-tags.js` reads REG into KTAGS.page (1,557 records
      on the kit page, 5,759 on Erewhon; 0 unknown: the Palopó twins' `paint` is a finish, the def's `kit` is said by its key, the
      biome's plants are flora). Proof: verify.py --assert passes the same invariants with the same numbers on both pages. The
      scene census at four views differs only in the biome's bark and leaf meshes, as the old page differs from itself: kit page,
      two old runs 2 names a view (xbark0 382,791 / 387,899 / 323,312 over three old runs), the new page 1 to 2 names, its xbark0
      323,312 one of the old values; Erewhon, two old runs 1 name a view, the new page 1 to 2 (xbark0, xbark2, within 3,410
      triangles). Hostcheck: the inspector names "Earth farmhouse (poor)" and "Jet allée" from their records, minimap and marks
      work, the error panel is clean.
- [x] (2026-10-15) TICKS still runs nowhere: 69-mat-salvage.js's fire flicker (a tick reading the Ancients camera's NIGHT) is not handed to core/host, as it was never run by the old camera either. - 2026-10-20: handed over (`ticks:TICKS` in 99-start.js; `var NIGHT` defined there), so `FIRE_T` runs and the flame cards flicker. NIGHT stays false here, so the fire lights stay off; reading the page's night into it is the open part:
- [x] (2026-10-20) The salvage fire lights (`FIRELIGHTS`, 69-mat-salvage.js) never lit in the city page: `NIGHT` was a constant false. - 2026-10-20: 99-start.js sets it from KratorSky's night (the sun below -0.105, dayF<0.05), so the lights come on at dusk on the city page; the kit pages have no night.
- [x] Vendored fragments are copied from `../highlands/src`, which itself carries the Iziz/Ancients drift noted in the Highlands KNOWN_ISSUES; re-vendor all three kits together. — 2026-10-01: re-vendored together. Highlands took `69b 69c 91-probe 93-labels` from Iziz (its showcase budget moved to `targets/highlands/91z-views.js`); Xanadu took `30-kit 36-decor 38-helpers2 54-mat-concrete 69-mat-salvage 69b 69c 91-probe 93-labels` from Highlands. `build.py --vendor-check` now compares `81-sky.js` with `../iziz/src` (Highlands has no src copy of it) and reports all 19 identical.
- [x] `vnStairs` (vendored) centres its run at `run/2` while treads span `steps*.32`; the kit uses its own solid `xnFlight` everywhere instead. — 2026-10-01: not a fault. As Highlands found (its round 10), `vnStairs` is self-consistent: `run` IS `steps*.32` and the treads sit at `run/2-run*t`, so the flight is centred on its z and spans exactly `run`. The Highlands bug was `hnKryltso` sizing its run from `rise`; Xanadu's one caller (`74-xa-dwell.js`) is unaffected.
- [x] (2026-10-13) `--vendor-check` reported `91-probe.js` drifted from `../highlands/src`. — The Ancients re-vendor
      session: re-vendored from Highlands. Its one new line counts `HLF.placed` catalog furniture as volume samples (a
      deliberate Highlands change); Xanadu has no `HLF`, so it does nothing here and `verify --assert` on both pages is
      unchanged (every assert and counter the same; the first stats line, sampled while core/lod is still building
      chunks, read 89 / 989k on Xanadu and 9.536 M on Erewhon before and 88 / 888k and 9.532 M after, and the assert's
      own count is 88 both times; Xanadu's opening shot is pixel-identical). `--vendor-check`: all 19 identical.
- [x] (2026-11-03) `--vendor-check` reported `69-mat-salvage.js` drifted from `../highlands/src` (Highlands took the
      Ancients kit's on 2026-10-23). Read: this copy was only behind; upstream adds `patchOpening` (the owner, 2026-10-19:
      an opening a later people filled with boards, sheet or plate), which only the Ancients builders Xanadu does not vendor
      call. Re-vendored. `verify.py --assert` before and after on both pages: every assert the same; the camera's first
      stats line moves between runs of the same page (Erewhon's 'before' page read 9.485 M and 9.511 M triangles on two runs),
      as the 2026-10-13 entry saw. The pages wait for the all-builds rebuild: they were behind their sources before this.
- [ ] Windows placed on a battered face sit on the base plane of the block, so on tall single blocks (the fortress tower, the strong room) the surround boards can be a few centimetres inside the lean; builders offset them by hand (`hw-.05`).
- [ ] (2026-10-06) The vernacular MAT keys take the material library (materials.json, Iziz's rows; src/88y-xanadu-matlib.js binds them through core/materials/record/26-matlib-bind.js). The build's own families (its patterns, bands and tiles) are not wired yet. verify --assert passes, as before.
- [x] **Xanadu's own families take the material library** (2026-10-06): xEarth, xWash, xTiles, xRubble, xRock (materials.json). The rammed
      earth (earth.adobe) has no lift lines, which the procedural map drew; a rammed-earth set would bring them back. ?mat=proc shows the old look.

- [ ] **Erewhon's water is not on core/water** (2026-10-13): the kit page's pools, basins and bowls are `WATER.still`
      (`targets/xanadu/90-xa-still.js`), but the city bakes per 480 m chunk (`90b-er-build.js` clears `KIT.items` after
      each) under its own sky (KratorSky), so its still records would be taken per chunk before the clear and its skylight
      captured from that sky. The rill ramps, the mill race and the falling sheets are running water: no record on the
      kit page (they draw with the boxes' still material), `MAT.xWater` on Erewhon; core/water's flow and fall would take them.

## Upstream: world-UV materials share one program (highlands, iziz, ancients) — fixed 2026-10-01
2026-10-01: fixed upstream. `vWorldUV` is one shared copy in `core/materials/opt/69a-world-uv.js` (built with
`Function()` plus `customProgramCacheKey`, an optional second K for v); Iziz, Highlands, Xanadu and the Ancients kit
(`izsWorldUV` is gone) opt in through `CORE_OPT_FILES`. `xUVKey`, `xWorldUV` and the re-hook loop are removed from
71-xa-mat.js. Reedlake and Dalab still carry the old closure (see core/README.md). The original note:

`vWorldUV` in 69b-vern-mat.js installs an `onBeforeCompile` closure whose `toString()` is the same for every K, and
three.js uses that string as the program cache key — so all world-UV materials render at the K of whichever compiled
first. Xanadu re-hooks them (`xUVKey`, 71-xa-mat.js); the vendored file is left byte-identical. Port upstream by
building the hook with `Function()` or by setting `mat.customProgramCacheKey=()=>'wuv'+K` (and carrying it across
the clone in `kbake`).

## Erewhon (round 9)
* The garden district's rectangle lies on 15–40° ground; its tiles are a stepped surface (no neighbour more than a
  waterfall apart) on levelled pads, so from the ring road the grid reads as a hanging garden of terraces rather than
  a lawn. A second pass could cut the whole rectangle as one bench (a retaining wall on its downhill side).
* Contour streets are painted but not built: no kerbs or steps yet, the stairs are a class in the paint only.
* Verification renders ~2 min a shot in SwiftShader at 7–16 M triangles; keep the view list short.
* The label atlas carries every REG volume (~4000): the garden tiles repeat their names, so most are skipped by the
  "seen 8+ times" rule, but a hovered view over the garden still shows a crowd of labels.

## Erewhon — open after round 9b (paused here, Travis)
**TODO**
* The steep central slopes (the dark-green class) carry streets and alleys but few houses: the frontage walker and
  the infill pass fail there (`_infill` 0 of ~thousands of tries). The live probe shows the slopes' mask buildable
  and the streets present; the failure is in the plot test on benched ground — to be traced with the probe
  (`scratchpad/probe.py` pattern: load the page, evaluate `planFront` step by step) and fixed. Suspect: the
  plot's front-edge test points fall inside the road's mask stroke, so every plot fails unless the road is wide.
  *2026-10-05:* not the soft edge. The mask is core/mask now (hard-edged, `core/mask/README.md`): placement rose from
  2794 to 2912 records and is the same on GPU and CPU canvas loads, but `_infill` is still 0. The cause is elsewhere in
  the plot test.
  *2026-10-06: fixed (round 9c).* Three faults. (1) `planFront` read its normal as plot → road, but both callers pass
  the road's outward normal, so on a real street the plot was set back onto the road stroke and the mask refused it;
  every genuine frontage and every infill try failed. (2) The frontage walker's arc length counted `acc` twice
  (`next=t;acc+=L;next-=L`), so after the first segment `t` ran negative and plots were laid along the segments'
  backward extensions, 10–70 m off any road: those were the 1017 that did stand. (3) A street's bench reached 10 m
  from its centre line, so a deep plot's back stood on the blend, climbing 8–20 m in 4 m; avenues and contour streets
  now bench to their edge plus a 13 m lot (`benchReach`), and overlapping benches blend across their midline.
  Now 1995 street buildings (277 by the infill), 1157 of them on the slopes; every front on its road's edge.
* ~~Building count is down to 973 + 0 infill~~ 1995 after round 9c.
* Door orientation: checked numerically in round 9c (every street building's front faces its nearest road); a look
  with the Doors overlay from overhead is still worth doing.
* The "Wealthy homes — the avenue" view (camera 232,165,661) stands on a stretch of the avenue outside `CITY_POLY`, on
  scree, so it shows no homes since round 9b's bounds. *Fixed in 9c:* the view now finds the in-bounds avenue
  stretch with the most rich frontage (the east district's centre lies outside the bounds).
* Alleys/stairs are painted and mask-blocked but not built (no treads, no kerbs).
* ~~The public-bath blocks in the garden show a bare batter under their pad on the downhill side.~~ Round 9c: the
  baths and the teahouse stand at their cells' mean on the re-levelled garden, no disc of their own. Still open:
  14 cell steps beside the blocks exceed the 3 m a cascade piece is drawn for; the garden's uphill edge is cut up to
  35 m into the hill (was 47).
* Travis, round 9c, not yet traced: "a lot of empty plots and misaligned buildings" in the garden overhead (the
  parterres, 150 of the 364 tiles, read bare from above?).
* The prison's pad floats a little off the cliff face.
* Run the full view set once the placement is fixed; republish.

**Done in 9b (unverified by a full render since the container restarted mid-run):** bounds polygon, street
thinning to ~34 m with alleys every ~40 m, the garden's stepped ground with retaining walls and the water pieces
standing the right way (verified: the garden renders as hanging terraces, the water falls), the stream into the
Caves of Ice (verified), a third Palopó, quays facing the lake (verified), the lake at −0.5 m (verified, no
z-fight), the Doors overlay.

## Voth census trades (2026-10-19)

The table `XA_TRADES` in `src/89-xa-trades.js` sets each of the Voth city's 44 census trades against this build's buildings (18 carried, 3 partly, 14 gaps, 9 na of 44). `tools/check_trades.py` and verify.py's `voth-trades` assert check it. Gaps to fill later:

- [ ] bakers: a bakery
- [ ] butchers: a butcher's shop
- [ ] weavers and dyers: a weaver's and dyer's workshop
- [ ] brewers: a brewhouse
- [ ] tanners: a tannery
- [ ] innkeepers and grooms: an inn or caravanserai with stables
- [ ] shrine keepers: a wayside shrine
- [ ] industrial workers: a works (smelter, mill or press) beyond the small workshops
- [ ] teachers and scholars: a school or madrasa
- [ ] healers and nurses: a hospital or healers' house (the baths are for bathing)
- [ ] priests and undertakers: a funerary temple or burial court (partly carried: xa_temple)
- [ ] fishers: a fishing dock on the bay
- [ ] orchardmen: an orchard plot
- [ ] miners: a mine head (only the Miners' Guild is drawn; the valley's gold mines are the lore) (partly carried: xa_guild_mine)
- [ ] quarrymen and masons: a stone quarry (partly carried: xa_guild_mason)
- [ ] dairymen: a dairy
- [ ] swineherds and duck keepers: animal pens and a coop

The `na` rows (sea trades on a landlocked build, trades the lore does not hold) are in the table with their reasons.
