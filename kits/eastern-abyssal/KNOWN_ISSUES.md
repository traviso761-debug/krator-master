# Eastern Abyssal kit — known issues (first pass, Oct 2026)

- [x] **The eight reference images were not available** to the first pass — closed 2026-10-01: they are now in
      `refs/abyss/` (commit e818561); each is described and compared with the kit in `ABYSS-KIT-NOTES.md` ("The reference
      images"), and the clearest mismatches were fixed (umbrellas, recycled tower detail, silo colour, ridge spines,
      salvage pipe, pale cone thatch). What is still off is listed below under "Against the reference images".
- [x] **Stuck on "Laying out the abyssal kit…" in Claude's viewer** — fixed. The viewer (an about:srcdoc frame) injects
      the page's scripts one by one after the document has loaded, so three.js arrived first, readyState already said
      'complete', and the loader called BUILD() before the BUILD script existed ('BUILD is not defined'). The error was
      also hidden under the loading screen. Now three.js's onload and the BUILD script's tail (`window._krGo`) hand off,
      whichever comes second starts the build, and ERR() takes the loading screen down. Reproduced and checked with a
      page that re-injects the scripts after load. Headless runs take the FAST path (`navigator.webdriver`); mask it to
      test the full path.
- [ ] **The ruler's title** is a placeholder: "the Headman" (palace and plaza names). 2026-10-01: none of the eight
      reference images names a ruler (the Leopard hall's caption, 豹族, names a clan, not a title), so it stays.
- [ ] **Hospitality lighting is a judgement call:** the inn, tavern and caravanserai burn lit oil lanterns (public
      houses open at night); the brief lights only rich, civic, sacred and palace buildings. Say if they should be unlit.
- [ ] `ind_oil_tank` variant C is "banco-clad in the Yuni manner" and sits on this sheet as the brief allows; it is not
      abyssal in style. Left unchanged.
- [x] **Fixed (Oct 2026): `verify.py`'s world invariants are Locus's own (highways, crossings, schedule, life, farms, pumpjacks); `--assert` passes.** `locus.html --assert` crashes in `verify.py` (`A.GATES` is undefined: the Yuni-inherited world invariants), on the
      commit before this kit as well as after. The world was checked by its counters instead (identical).
- [ ] A long dark line can cross the sheet near the palace and plaza in high views: it is not geometry (nothing long
      stands there; checked by walking the instance matrices) — most likely the sun's shadow-map edge on the large sheet.
- [ ] Swoop roofs, sails and cone shells are vertex-coloured merged meshes with their own smooth normals; the ridge tube
      and horns are 8-sided, so a horn reads faceted up close.
- [ ] The cone shell's arch is cut cleanly, but the reveals are single quads per row, so a very low `arch.h` on a steep
      cone shows a stepped edge.
- [ ] `ABYSS.vessel` windows on tanks and silos are flat panes on a curved wall (they stand 0.02 m proud at the centre);
      at a raking angle their corners float a hand's width off the wall.
- [ ] Drum houses' end doors stand ~0.75 m above the deck (inside the drum's curve), reached by a plank step.
- [ ] The windpump blades are flat (no twist): a real wheel's blades are pitched. The rim rings are static (they are round).
- [ ] The tin-mirror family is Phong; under the night volume it lights like the Lambert families but its specular
      glint follows only the sun and moon, not the lamps.
- [ ] The amphitheatre's aisle stairs are stacked blocks (one per tier), not individual treads.
- [ ] The palace and plaza are 92 m wide; the sheet's whole-sheet view shows them small. Use the row button.
- [ ] Wall pieces are a straight-line system only (segments on one line, 90° corners); there is no angled joint piece.
- [x] The citadel's corner towers stand partly over the edge of the mound's top (the mound's top is 55 m, the circuit
      48 m plus tower radii). 2026-10-01: the mound is 70 m at the foot (`fr8` battered 0.84, so 58.8 m on top); the
      corner towers' rubble bases (r 4.5 at ±24) end 0.9 m inside its edge.
- [ ] No interiors: houses, inn rooms and containers are closed volumes with doors and windows (shops, the library, the
      tavern and the temple are open and furnished).
- [ ] Furniture has no sheet of its own; it is seen where buildings place it (and in the helper demo for the altar pair).
- [ ] The `abyss_helpers_demo` and `abyss_wall_run` assets are sheet-only demos (tag `demo`); the world must not place them.

## Found in review (Oct 2026) — fixed 2026-10-01

Geometry checked against the source; file:line as of 36e1afb (the lines have since moved).

- [x] **Warehouse roof pitched upside down** (`65-abyss-90-farm.js:100`): the front half is tilted by `s*-0.32`, but in
      this kit a positive pitch lowers the front, so the eave rises 1.21 m and the ridge sinks into the shed (a V roof
      with the gable triangles at :101 standing out of it). `ABYSS.corrRoof` uses the correct sign.
      2026-10-01: each panel is pitched `s*atan(2.2/(D/2))` and centred on the slope from the 2.2 m ridge to a 0.6 m eave
      overhang, so the two meet at the gable triangles' apex.
- [x] **`ABYSS.trim` frames sit half their height low.** The helper centres the frame on `y` (`00-core.js:223`), but 4 of
      5 callers pass the opening's bottom: `70-palace.js:30` (the great door: frame half in the plinth, gilded top bar
      across the door), `70-palace.js:28` (lattices), `30-housing.js:167` and `:177`, and the demo at `00-core.js:367`.
      Only `40-shops.js:52` passes the centre.
      2026-10-01: the helper now takes the opening's BOTTOM (as `F.door`'s `ly`), with a 9th argument `door` that drops
      the sill strip. Callers: the demo, the palace lattices and the tower-house windows were already right; the palace
      great door and the tower-house annex door (which framed nothing: y 2.0, 1.6 high, over a 2.3 m door) now pass
      `door=true` and the door's own size; the armourer's opening (`40-shops.js`) now passes its bottom, `H1+0.1`.
- [x] **Tower-house windows buried** (`30-housing.js:166`): the window radius is a straight lerp 4.6→2.5 against a
      four-point profile, so all 7 windows sit 0.1–0.23 m inside the plaster and tin-mirror skin.
      2026-10-01: the radius is read from the lathe profile itself (`rAt(y)` + the 0.03 m skin); each window stands in a
      salvaged casing box whose back is inside the wall at the window's head and whose face is 0.1 m proud at its sill,
      so neither the pane nor the frame cuts the sloping wall.
- [x] **Inn stairs miss the galleries** (`50-civic.js:26`, `:38`): lower flights at x ±5.2/±4.8, galleries start at
      ±5.9/±5.5 (lands ~0.2 m beyond the rail); the second flight starts in mid-air at gallery height.
      2026-10-01: `innStairs()` in the inn: the ground flight now runs ACROSS the court onto the left gallery's inner
      edge, through a gap in its rail; the upper flight is a dog-leg off the right gallery's open front end (half a
      storey out over the deck, a landing on two posts, half a storey back onto the second gallery). Both variants. The
      court sail's front masts moved to z 8.9 and the second lantern string to z 2.2 to clear them.
- [x] **Citadel stair stops short** (`80-military.js:84`): ends at z 29.4, the mound top ends at 27.7; the last tread is
      1.7 m short and ~1.3 m above the slope. Start it at about z 32.3.
      2026-10-01: it starts at `MT/2 + M*1.15` (MT = the mound's top width), so its top tread lands on the top's edge
      (z 29.4 on the enlarged mound).
- [x] **Wall system** (`80-military.js`): the walkway over the gate (:53–54, 6.25–6.4 m) is inside the 6.5 m opening;
      it runs into the solid 10.5 m gate towers (:51); tower doors sit on the wall's centre line, z 0, not over the
      walkway, z −1 (:38), half buried in the parapet.
      2026-10-01: the gate is 6.0 m high, with a lintel up to the walkway's underside; the gate towers rise full height
      only on their outer half (z 0..3.5), so the walkway runs on as a 2.5 m gallery behind them and over the gate, with
      a rail and a door into each tower. Silo-tower doors stand on the walkway's line (1 m inside the axis, radial).
      The citadel's joint towers are now turned with their segments (back PI, left −PI/2), so their doors face inward.
- [x] **Stairs that don't land:** the tavern's upper flight ends 0.57 m short of the deck (`50-civic.js:73`); the
      stacked-container house's outside stair lands outside the balcony rail (`30-housing.js:61–63`).
      2026-10-01: the tavern flight starts at `-3.5 + (H2-H)*1.15`, so it ends on the deck's edge (the table that stood
      on it moves to (4.6, 0.6) in that variant). The container house's flight runs clear of the balcony's edge (z 0)
      onto a 1.4 m landing on a post, through a gap in the balcony rail, railed on its open sides.
- [x] **Interpenetrations:** loggia outer front masts inside the front corner towers (`70-palace.js:43` vs `:38`); back
      pavilions cut the great hall's plinth (`:49` vs `:25`); the temple's front covered walk starts inside the gate
      pylons (`60-temple.js:24` vs `:47–48`); second-floor containers overlap ~0.6 × 1.4 m (`30-housing.js:57–58`);
      the cone variant's cone floats 0.9 m over the deck and overhangs its back edge by 1.1 m (`30-housing.js:127` vs
      `:117`); the library's small cones are centred on the plinth edge (`50-civic.js:140–141`); the granary catwalk
      runs inside the silos (`90-farm.js:49`); the blue tarps' back corners have no support (`90-farm.js:52–53`).
      2026-10-01: loggias 18 m wide at x ±20.5 (outer masts at ±29.5, 1 m clear of the towers' bases); back pavilions
      8 x 8 at x ±26 (x 22..30: clear of the plinth at ±21.5, and of the back towers, which they also cut); the temple's
      front walk starts at the gate plinth's ends (x ±15), clear of pylons and claws, with a short precinct wall on the
      plinth from pylon to walk; the second-floor containers moved apart (x 2.9 and −3.4: 0.1 m gap); the great cone
      stands on the deck (y0 = H, 0.9 m taller to keep its peak and arch) and the deck runs back to z −12.4, the two
      tin cones moved to (±8.8, −10.2) clear of it; the library's lesser cones are r 2.6 on the plinth at (±13.2,
      −16.2), clear of the great cone, and the creepers moved off the plinth; the catwalk runs along the silos' fronts
      (z −1.1..−0.1) with a bracket to each; the tarps' back corners stand on poles.
- [x] Minor: the alchemist's flue starts ~0.18 m above the tank roof (`40-shops.js:110`).
      2026-10-01: it starts at H+5.3, 0.12 m into the roof cone (top unchanged).

## Furniture from the catalog (Oct 2026; `API.md` "Furniture")

- [x] **Interior-set variants** (fixed Oct 2026). Every multi-variant abyss building now has its own `#n` item in
      `kits/interiors/sets/abyss.js` (`abyss_shop_weapons#1` the smithy under the sail, `_armor#1` the tin shed,
      `_general#1` the two-storey cabin, `_alchemy#1` like variant 0, `_salvage#1` the tank store, `_salt#1` the reed shed,
      `_sailmaker#1` the plank loft, `abyss_inn#1` 27 rooms in the pastel wings and the court, `abyss_tavern#1` the main and
      the raised deck, `abyss_warehouse#1` the five ground containers) or a `skip` (`abyss_shop_food#1`,
      `abyss_farmhouse#1`: drums with no floor; `kits/interiors/sets/GEOMETRY.md`), and the glue no longer falls back to
      the base item for a variant > 0 (`API.md` "Furniture": a variant with no item is not furnished, `LOCF.unfurnished`).
      Builder pieces that stand in the newly planned open rooms became `setting:'room'` (the variant-1 forge, the tavern's
      raised-deck tables); the variant-1 tavern bar under the raised deck is `'indoor'` (not planned).
- [x] **Lying drums** (fixed Oct 2026): the warehouse (variant 1) yard's two are the catalog's `job_oil_drum_lying` (the
      Jobs category, `kits/catalog/krator-master-furniture-jobs.js`; eastabyss, the kit's rust tones), each drawn drum's colour
      pick burnt (`ABYSS.burn(F, 1)`). The standing ones, the tavern bar's three and the yard's six, are the catalog's
      `pa_drum` (scrap culture, 'Oil drum', sealed; its painted colours, not the kit's rust; each colour pick burnt).
- [ ] `abyss_tavern` variant 1: a pile of the raised back deck stands in the bar's counter (x -4.1, z -6.0), the space under
      the raised deck is about 1.9 m clear, and the kitchen drum rises 0.15 m through the raised deck.
- [ ] The catalog's `abyss_hanging_lantern` carries its own 0.3 m hanger and ceiling plate: on a mast arm
      (`ABYSS.mast { lantern }`) the stub shows above the arm.
- [ ] The propeller-lanterns on sail masts are the catalog's free-standing `abyss_propeller_mast` set 6 m down the mast,
      so its own pole hides inside the mast (a few hidden triangles each).
- [ ] The salvage yard's drums: the catalog's `abyss_scrap_stock` variant 2 groups four standing drums with a lying stack
      at the row's END (the kit drew the stack in front of the row); placed turned so the standing row stays where it
      stood, the stack now sits in the yard's back corner.
- [ ] The catalog's `source` fields still name `settlements/locus/src/65-abyss-10-furniture.js`, now deleted (it is in
      git history); the catalog's owner may point them at the commit.
- [ ] Lit catalog pieces carry their own lamps: the abyss sheet has 244 night lamps, 5 more than before (strings and
      canopies the kit drew without one).

## The builders' yard (`abyss_shop_builder`, 2026-10-05)

- [ ] **No `building` job.** `FURN_JOBS` (`kits/catalog/krator-furniture-core.js`) has `carpentry` but nothing for masonry or
      thatch: the timber pieces (`job_pole_rack`, `job_plank_stack`, `job_saw_bench`) are in the Jobs file as `carpentry`;
      the bricks, lime and reed (`abyss_brick_stack`, `abyss_lime_sacks`, `abyss_reed_bundles`) are plain eastabyss pieces
      on the catalog's Outdoor page. A `building` job would move them to the Jobs page.
- [ ] **`sim` takes one activity:** the yard is `TRADE`; the lumberjacks' timber deliveries (a drop-off, `STORE`-like) are
      not recorded. Nothing reads `sim` yet.
- [ ] The saw pictograph is drawn by the shops fragment's own `sawSign()` (a bare `ABYSS.sign` board with the saw on it),
      not by `ABYSS.sign` (`65-abyss-00-core.js`, not this pass's file): another trade cannot ask the core for `'saw'`.
- [ ] The derrick (variant 1), its winch and the log hung in its sling are drawn inline as structure (like the salvage
      dealer's derrick), not catalog pieces; the hung log's bark is a literal colour (the biome's scale-tree `0x505c48`).
- [ ] Variant 0's sail sags to about 2.7 m over the deck at its front edge's middle; the interiors plan the shop under it
      2.6 m high.
- [ ] The heaviest shop on the sheet (15.7 k triangles, variant 0): most of it is the yard's stock (the stickered plank
      stack and the mud-brick stack are 40–50 boxes each, the pole racks a rod and two end discs per pole).

## Against the reference images (2026-10-01), not fixed

- [ ] **Tin-mirror reads as smooth grey sheet at sheet distance.** `recycled_house_closeup.jpg` is a patchwork of
      bright cans, gold-painted panels, mirror tiles and studded seams; the `tinmirror` texture (in the shared
      `47-texture.js`) is too fine and too even to show at more than ~20 m. The tower house now carries a gold band and
      stud rows, but the texture itself (bigger tiles, more gold and white panels) was left alone: it is in a Locus
      fragment another agent may be working on.
- [ ] **Swoop-and-horn thatch is clean.** The Leopard hall (`679e…jpg`) has dark, mossy, layered thatch with
      stepped eave tiers and bone-like ribs; the kit's roofs are one smooth `THATCHC` sheet with a fascia (the new
      `fins` spines on the palace and temple gate are a nod to its ridge). No moss tint, no tiered eaves.
- [ ] **No big salvage pipes or power poles in general use.** `2285…jpg` (the salvage house) is held together by
      elbowed pipes, a ring-balconied tank on top, an outside AC box and a wooden power pole with wires; the kit has one
      elbowed pipe (the alchemist's tank house) and cables, but no pipe helper and no power-pole piece.
- [ ] **No floating or terraced-garden forms.** `46f8…jpg` is a deck on a cliff edge with propellers under it, and
      `wq.jpg`'s great cone has green planted terraces spilling out of its arch and a pool; the library's terraces are
      bare plank (the rich cone house plants herbs on its terraces).
- [ ] **The umbrella canopy is a 10 m bay**, not a street-long run between facades as in `umbrellas.jpg`; place several
      in a row along a street to get the effect.
