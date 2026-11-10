# kits/talia: known issues

`build.py` prints the open ones (`- [ ]`) on every build.

- [x] No `materials.json` yet. **2026-10-18:** `materials.json` binds `taMarble` (stone.marble.ashlar), `taGilt` (metal.gold)
      and `taTile` (roof.clay_roof_tiles) (src/88yt-tal-matlib.js, packed into tex/); the honeycomb mosaic, meander, jali and
      rose window were owed in core/materials/PROMPTS-NEEDED.md.
- [x] **Delivered and wired 2026-10-18** (owner-tex2b batch): `taMosaic` (mosaic.orange.honeycomb: the paving medallions'
      disc, `tanMosaicRing`; the item `taVaultMo` is ready for the interiors' trumpet vaults), `taMeander` (the border band,
      the paving and terrace borders of `tanMeander`), `taRenderW` (render.orange.worn: the tenement's walls), `taJaliA` /
      `taJaliG` (the two jali cut-outs, chosen by place: the jharokha bays' front openings, `tanJali`), `taRose`
      (`tanRoseWindow`, ready for the temple). All full colour (keep 1). With `?mat=proc` the old strips, rings and bars draw.
- [ ] The wired sets leave the neighbours on the procedural look: the tenement's turret shaft and corbel stay burnt-orange
      plaster (a round post, the render set is on boxes), so the turret reads redder than the walls; the medallion's boss
      and the meander's colour are the sets' own (not the kit's `or`). `taRose` has no caller until the temple (P4), and
      the `taVaultMo` / the trumpet vault wait for `taliaint3`. The jali card repeats each metre (one tile a metre), so a
      wide screen shows the lattice's own edge bars as lines every metre.
- [ ] A loggia (`tanLoggia`) is a real recess only up to the arch's springing; the round head above it is a dark disc on
      the front plane, so from a high angle the head reads as a plate. A hollow body (the interiors set) would cut it.
- [ ] Arched windows elsewhere (`tanArch`) are fills on the wall plane, as the Vernacular's windows are, not recesses.
- [ ] The hill stack stands on a white retaining mass so it builds on the flat sheet; `o.slope` is not read yet. On the
      city page the site's terrain should carry the tiers (PLAN.md section 9: Talia is on a hill).
- [ ] `verify.py --assert` ends FAILED on `WebGL: CONTEXT_LOST_WEBGL` in the console: the same as Iziz's own pages and
      Pylon's (settlements/iziz/KNOWN_ISSUES.md, 2026-10-05). The harness's teardown, not the page.
- [ ] P4 (2026-10-18): the theatre's cavea stands on its own outer wall on flat ground; on the city's hill (PLAN.md 9b:
      "on the slope") the slope should carry the tiers and the outer arcade go into the ground.
- [ ] P6 (2026-10-19) furnishes 32 of 45 items. **2026-11-09: 35 of 45.** Done: the palace by its blueprint (below), the
      caravanserai (its five ranges: the court gallery's doors and windows cut the hollow walls; walls shut off the corner
      towers at the ranges' ends) and the stoa (the shops behind the colonnade, their fronts cut; a band closes the floor's
      gap between its two hollow storeys). Still owed, each with its reason in `kits/interiors/sets/talia.js` `skip`: the
      library's rotunda and the anatomy theatre (solid drums: the reading room, the gallery ring round the well and the
      tiers want the drums hollow, as the palace pavilions now are with `talpRing` / `talpDisc` in 74t, which could move
      to 69u for them; not done because the sheet is at 2.97M of its 3M triangles and the furniture counts), the
      glasshouse (planting, no room kind), and the works with no rooms (the theatre, the memorial, the gate, the wall and
      its towers, the fountain, the sky bridge). Also still owed from before: the odeon's cavea, the hospital's side and
      back ranges, the college and cloister ranges' planner doors (not cut).
- [ ] With an interior, the rounded whitewash cubes (cube house, hill stack, loggia house) draw square hollow bodies with
      round corner piers (69e draws four straight walls); without one they keep their rounded corners.
- [ ] To keep the sheet inside its budgets (the cloister came to 288k of 250k triangles, the sheet to 2.85M of 3M), P4
      made every column's base ring and capital volutes low-poly (`taRingMs`, `taRingGiS`, `taGiltNub`) and the baluster
      lathe eight-sided: P2 and P3 buildings changed with it (the sheet is now 2.36M). Judge the capitals at eye level.
- [ ] P5 (2026-10-18): the governor's palace (`tal_governor_palace`) is the heaviest type on the sheet, 228k of its 250k
      triangles (the sheet 2.59M of 3M): the 130 columns of the pavilions and the loggia, and the front balustrades, carry
      most of it. The sides, the back and the light courts take coped parapets, not balustrades, to stay inside. A sixth
      or seventh heavy type will want the pavilions' upper columns on a lower-poly lathe. **2026-11-09:** the civic dress
      had already taken it to 271.5k (verify reports OVER: a warning, not a failure); with its rooms it is 276k (the
      interior doors are plain leaves, the stairwells' rails parapets, only the vestibule gallery's rail a balustrade), and
      the sheet 2.97M of 3M. The lower-poly upper columns are the next saving.
      **Measured 2026-11-09** (`verify.py --assert`, SwiftShader, ends `OK`): the palace 278,068 (`OVER`, the warning), the
      sheet 2,993,058 of 3,000,000 (`showcase-triangle-budget` passes with 7k to spare): the next type added to the sheet
      needs that saving first.
- [ ] The palace's outside stair is one straight flight of 22 steps (0.30 m risers, as Pylon's): the blueprint's three
      runs of at most 16 steps with landings (`SKILL.md` 5j) do not fit its 10 m footprint as a straight flight.
- [x] **The palace's rooms (2026-11-09).** The blueprint's sheets G and U are 49 explicit rooms in `kits/interiors/sets/talia.js`
      (the item's `plan`: cells in the blueprint's (u, v), the edges between them, the doors, the pavilions); `talpInterior` (74t)
      draws from the same table the partitions (doors cut, core/door leaves, marble frames, gilt round the state doors), the rails
      round the hall's well and the stairwells, glass to the light courts, the upper floor (and its walk floors), the private and
      back stairs (orange treads, walk strips), the dais and the hall's orange coffered ceiling; the doors through the block's
      faces into the pavilions. The pavilions are hollow (a ring wall open at its arches, `talpRing`; the chhajja a disc less the
      block's corner, `talpDisc`) with a terrace door on core/door; the columns and windows that stood inside the block's corners
      are left out (fixes the old note that the front pavilions' inner columns stood in the block). The kitchen drum is hollow.
- [ ] The palace's plan leaves the sheets where the builder's arcades or a stair's run forced it: the rear range runs from
      u 17 (the side faces' last window there is gone), the customs and the clerk part at u 9.5 (a pilaster's line), the cabinet
      is 4 m wide (v -2..2, clear of the rear windows) with the private stair beside it as one straight steep flight (17 risers
      of .32 m: the 3 x 3 m stair box of the sheets holds no flight of 5.5 m), and the back stair runs along the servery's front
      wall up to the governor's bath (the residence's service side) instead of the steward's room; the steward is not lodged.
      The undercroft (sheet B: the archive, the treasury, the cells, the postern) and the signal room (sheet L) are not drawn;
      the guard pavilion's upper storey (the garrison commander) has no stair and stays solid. The private stair's rail over
      its well crosses the foot of one upper rear window.
- [x] No dark voids (2026-10-19): the Talia kit's openings are doors, panes and open portals. The Iziz Vernacular houses on
      the sheet (the mixed streets) drew the Vernacular's dark door recesses and dark glass where their walls were not hollow.
      **2026-11-03:** the Vernacular's openings are real (69e5: leaves in core/door, KGLASS glass over the room card) and come in
      with every rebuild of this kit; its remaining `vDarkB` are furnaces, wells and troughs (kits/iziz-vernacular/README.md).
      Still owed from the owner's TODO: any NEW Vernacular buildings added to the mixed streets (targets/kit/89z-rows.js).
- [ ] Lit windows (rich and civic) keep the warm lit pane (the Vernacular's `MAT.warmPane`, transparent since 69e5); their
      white glazing bars barely show on it by day.
- [x] P7's gallery update: Krator Worlds S-Z version 8 (2026-10-19) carries the current page and card (gallery/README.md).
- [x] Interiors showed from above and their floors flickered (the owner, 2026-10-19): a ceiling now closes every hollow body
      under its top, and a thin slab across a room (a string course, a band) is drawn as a ring round it
      (tanHollowTidy, 69u, run after each Talia builder).
- [ ] The glasshouse's planting is simple stand-ins drawn on the page (palms, bananas, shrubs, potted ferns); the botanic
      garden's species could come from a biome kit (as Voth's gardens take the swbay kit's).
- [x] The civic buildings' dress (the owner, 2026-10-19): the temple (coloured courses, a podium frieze, twin columns at the
      portal, mosaic icon panels, banners, statues, the gable's sunburst, gilt rings on the domes), the chapel (a porch, a
      cartouche, gilt ribs, bands, statues), the council house (a sculpted pediment, statues, banners), the palace (mosaic
      panels and a cartouche in the loggia, banners, roof statues), the great hall, the Senate, the library and the bourse
      (statues, banners, cartouches). Paid for by six-sided balusters and ten-sided column shafts.
- [x] Walking (F) follows the floors: core/walk is read in place, the floors, stairs and terraces are registered (69u).
      Walls are not blocks yet: a walker passes through them.
- [x] The governor's palace's hall block is hollow and furnished (a cut-away unit); its pavilions are solid drums.
- [x] The book spines and paintings (2026-10-19): the owner's delivery is in the library (`patterns/court/`), bound in Iziz's
      pack and laid on the Iziz court furniture and Talia's bookcase by Iziz's furnishing (95i, COURT_DECALS).
- [ ] 95i is also edited on the branch claude/pylon-interiors-export (the interiors as core/export's interiors section, not
      merged): whichever lands second keeps both; that export may want to carry the decals with the furniture pieces.
- [x] The court furniture textures (2026-10-19, second batch): sixteen Izani paintings, the gilt frame moulding, vase
      glazes, sun carpets, marquetry, brocade, opus sectile; bound in Iziz's pack and laid by 95i (COURT_DECALS, COURT_TRI).
- [x] The court textures in Godot (2026-10-19): the overlays export as parts of their pieces (95i courtParts, 94 ixFurniture),
      and the finishes as materials with hook 'triplanar' (tile, detail, gain), drawn by godot/shaders/library.gdshader through
      lib/triplanar.gdshaderinc in the piece's own frame; iziz_test.gd checks them; tests/export/court_shot.gd renders them.
- [x] **Real doors and real glass (the owner, 2026-11-03; core/door).** Windows are KGLASS's clear pane (`taWinB` is
      `MAT.izGlass`; it was the dark glass lifted to an opaque sky grey), the lit fill the warm pane, the cobalt the `stained` kind,
      in the cut on a hollow body and over the room card elsewhere; round heads and fanlights are half discs. Doors are real
      leaves (`tanDoorLeaves` through `IZDOOR.leaf`): operable on a hollow body, locked on a solid one; a door on a frontispiece
      standing forward of a hollow body (the great hall's, the Senate's and the faculty's centre pavilions) is the body's door in
      the wall behind (`tanDoorBehind`), the frontispiece opened round it (`tanPierBox`). The caravanserai's and the inn's gate blocks are opened through their
      arches (`tanPierBox`): the street gates open (`o.gate`), the court side is a clear arch (`o.open`). `tanWin` no longer lays a second pane
      over the Vernacular's; the jali's ground is the room card. The sheet before -> after: doors 96 -> 368 (locked 1 -> 135),
      panes 4631 (2291 of them opaque) -> 4521 (all transparent), room cards 38 -> 3014; `vWinGlass` 8 left (pools, basins).
- [x] Glazed double doors (2.4 m and wider) are plain timber leaves now: a `vDoorLeaf` is one box, so the glazing, the raised
      panels and the brass pulls of the old static leaves are gone. **Resolved (checked 2026-11-09):** the page carries core/door's
      leaf styles (`30-core-door-leaf.js`, KDOORLEAF), and `tanDoorLeaves` draws the 'glazed' leaf (frame, kick rail, bars, clear
      glass) from 2.4 m wide and the 'panel' leaf below that.
- [ ] Locked doors: 135, on the solid bodies of types the interiors set does not furnish (P6's owed list) and the walls' gates;
      they open once the type is furnished.
- [ ] Reachability (core/walk `KWALK.reach` from four points round each plot, every unlocked door open; 2026-11-03): 946 of
      1603 floors before, 1011 of 1612 after (the colleges, sealed before, 29 of 36 each; the faculty, the great hall and the
      inn one more each; the caravanserai stays 3 of 16 with its gate open: its court ranges are the planner's). Still sealed: the cloister (0/50: its ranges open through arches with no cut, P6's owed list), the
      theatre's tiers and the wall walks (no stair registered to them). Most of the rest are the 'solid top' floors (the tops of
      podiums, terraces and roofs registered by tanWalkSolids, many of them roofs nothing climbs to) and upper floors whose
      interiors stair is not met: the planner's and the walk registration's, not the doors'.
