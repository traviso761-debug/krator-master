# QA pass — group `towers` (2026-09-29)

Fragments: `52-sky-abc` (A, B, C, Project A), `56-sky-d` (D, Project D),
`57-sky-e`, `58-sky-f`, `70-sky-g`, `71-sky-h` (H, Project H), `89k-sky-i`,
`89l-sky-j`, `89m-sky-k`, `75-hotel`, `66b-flatiron`, `70b-perch`,
`67-cultural`; targets `kit` (these rows only), `skyi`, `skyj`, `skyk`.
Seeds unchanged. Every builder still opens with its own reseed.

Verified: `build.py --target kit|skyi|skyj|skyk`, `jscheck.py` on each
(PARSES OK), `verify.py --assert` on each (error panel clean, every invariant
PASS; the kit's showcase total is OVER as before, by the user's choice). Shots
were taken of every decay of every type (0-3, and 4 for A/D/H) through a
scratch target holding only these rows at their kit positions, and read.

Kit showcase: **9 967 649 -> 10 017 541** scene triangles (+0.5%; 37 476 of it
is the new toppled Flatiron). Worst draw calls seen 874 / 900 (the `Skyscraper D` row shot; it was 886 before).

## KNOWN_ISSUES items — tick these

**The Flatiron**
- FIXED "Decay 2 shortens it but does not topple it" — decay 2 is now the
  full 250 m tower broken at the 8th setback: the stump stands ragged with dark
  rooms in its eaten roof, and the upper 11 storeys lie on the plain on a broad
  side face, tipped by their own taper so both ends bear, in rubble. The kit
  row gained `t:1200` and a `Toppled Flatiron` preset. Its level-1 ruin also
  lost the top three setbacks and the crown and gained a collapse scar (it
  was the intact silhouette in rust).

**The Hotel**
- FIXED "The lens is now too small for the idea" — a glazed barrel vault
  following the arc of the top slab for 105 m on a concrete kerb, ribbed
  every 4.4 m, solid ends, hedges and a warm line at night; the ruin keeps
  some ribs and rags of dead glass.
- FIXED "The porte-cochère canopy is 40 x 24 m" — it laps back onto the
  curtain wall and stands on four columns along its front edge, with a fascia.
- FIXED "The two lift towers at the horns are blank cones" — tapering fluted
  shafts with a glazed lift slot facing the court every storey, stair windows,
  banding rings, a machine-room head with lid (ruin: ragged top, no head).
- FIXED "The pool deck is a bare 130 m disc" — a lagoon on the court's arc
  with coping, loungers and parasols, court trees and planters; on the south
  lawn a lap pool, a fountain and a clipped parterre. The single old pool
  also stood in the foot of the west lift tower; it is gone. Ruin: silted
  green floors, beds run wild.
- Also: the level-1 ruin now loses its east horn in a stepped collapse (13th
  storey down to the 3rd) with a talus of rubble and slabs; before, it was
  the intact silhouette minus a storey. The vault stops short of it.

**Cutaways**
- FIXED "Only Skyscraper A was done" — B, C and G now have the punched
  lining (same hole predicate, finer grid) and pale plates with dark soffits.
  D and H already had it in code. E's lining is its lens's inner skin and was
  already punched; F's 9.5 m core has nothing to section.

**Plinths**
- FIXED "`figures()` at the foot of each tower" — Skyscraper G was the one
  still at a hardcoded `(-100,140)`; it is `(-PR, PR*1.28)` now.
- OPEN "Skyscraper G cannot shrink" and "A, B and C are limited by their own
  legs" — both are stance changes (moving the block stack, pulling the
  splay in); not taken unasked, as before.

**The Project**
- OPEN "The fire does not light anything" — one PointLight per territory
  recompiles every material in the scene and the fire code lives in the
  shared `69-mat-salvage.js`. Needs a coordinator decision.
- OPEN "The fires do not flicker" — needs a per-frame hook in the shared
  `92-camera.js` loop. Request: an `ANIM` array of callbacks the frame loop
  calls with `t`; `fireWindow`/`firePit` would register a uniform tick.
- OPEN "The Project's plinth can only come in to 110" — the struts (stance).

**Non-ground placement**
- OPEN "Only these two builders take the parameters" — only the Perch needs
  them; adding `gy/noPlinth` to A-D, G, H without a caller is dead code.
  Fixed a Perch bug it did expose (below).

**Rehabilitated (decay 3)**
- OPEN "The row presets had to be pulled in" — the fix is row spacing in z
  for the whole kit (shared layout). Related, fixed for my rows: with a third
  building at x=0, rows whose `s` was sized for two overlapped. cult 400->640
  (the rehabilitated Wheel sat over a third of the intact one), perch
  430->520, flat 300->380, hotel 260->300; their presets derive from `s`.
- OPEN "The repaired pass dresses every type identically" / "Patches sample
  the wall faces" — shared `69-mat-salvage.js`, not mine.

**Found by the split** — none of its items touch these types.

## targets/<type>/NOTES.md weaknesses

- **skyI, the Braid.** FIXED "reads as a twisting spire ... more than heavy
  braided masses": ~25 clinging houses per standing variant (slope-topped
  blocks in the inhabited-wall skin on corbels, set-back rooms, shade
  soffits, lit slots) placed clear of both strands, and the strands'
  projecting bays are twice as frequent, deeper and real geometry with roofs
  and soffits; the shaft stone is a deeper ochre so the pale braid reads
  against it. FIXED "Fallen pieces ... read as masonry blocks": the 14 clean
  instanced boxes on the plain are now broken blocks of the tower's own
  fabric (irregular plan, a section-textured break on top, rolled, half
  buried), plus spill round each fallen strand piece. OPEN: soffits read
  brown (hemisphere ground colour, shared lighting); 'On the street' framing.
- **skyJ, the Whorl.** FIXED "oval voids narrow": the rib wobble period is
  92 m (was 58), so the ovals are ~46 m tall and legible from the hero shot.
  FIXED "the fallen body reads as a cage of vertical discs": each fallen
  plate is tilted up to ~12 degrees, broken into sectors, and crushed and
  splayed where it meets the ground. OPEN: rib junctions intersect; the
  spire fragment is small in 'Toppled'; night glow tone.
- **skyK, the Sail.** FIXED "Hall roof is a single-sided shell": a second
  skin 0.9 m inside, punched by the same predicate, makes the ceiling and
  turns each tear into a sectioned slab. OPEN: belly reads only in oblique
  light; window grid regular; rib section frame (z-up) twists slightly.

## Found by reading the shots (not in any list)

- **Level-1 ruins of A, B, C, D and H were "intact with patches"** — fbm holes
  a few metres across on a 300-420 m tower. A shared helper `skyScarHole`
  (in `52-sky-abc.js`) wraps each tower's hole predicate with a V-shaped
  collapse scar from ~40% of the height to the break, facing the row camera;
  the lining shares it, so the scar shows the floor stack. Light strips and
  glass bands stop at the scar's foot so none hang across it.
- **Toppled C fell through its own leg**: a random bearing within 0.5 rad of
  east crossed the leg at 30 degrees. `toppledUpper` takes an optional fixed
  bearing (the rng draw is kept, so the stream is unchanged); C falls at
  -30 degrees, between two legs.
- **The Perch's shoulder was inside the podium**: centred at 123 m in a drum
  still 141 m in radius at 42 m up, so 48 m of Skyscraper F was buried and
  its trays came out through the podium wall. Shoulder at `R0*1.2`, F at
  slim .62. And its rehabilitated F stood back up to the full 290 m: an
  explicit `hcut` now also holds at level 3 (`58-sky-f.js`).
- **The Perch podium was 90 m of blank masonry**: four tiers of window slots
  following the 24-flute profile (the first try was buried in the crests),
  string courses, a cornice.
- **The Cultural centre's ruin kept the intact skyline**: level 1 breaks the
  great dome at 62% and most campaniles and ~45% of halls at 40-75% height,
  uncapped. Its drums had seven small arched windows each and read blank;
  now two or three tiers of tall dark-glass slots in the flute troughs,
  cheaper than the extruded arches (cult/0 89 316 -> 62 436).

## Triangles per type/decay (kit, before -> after)

| | 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|
| skyA | 101 460 | 114 814 -> 107 212 | 156 130 | 144 742 | 140 918 |
| skyB | 241 492 | 184 142 -> 182 038 | 247 536 -> 261 528 | 261 994 -> 275 330 | |
| skyC | 189 384 | 178 612 -> 179 796 | 203 666 -> 212 454 | 214 124 -> 223 326 | |
| skyD | 65 184 | 78 032 -> 74 716 | 96 092 | 107 206 | 104 276 |
| skyE / skyF | unchanged | | | | |
| skyG | 80 676 | 89 292 -> 97 356 | 99 868 -> 109 276 | 105 462 -> 115 062 | |
| skyH | 98 184 | 95 500 -> 90 594 | 128 774 | 142 304 | 171 408 |
| skyI | 38 980 -> 40 716 | 65 844 -> 67 044 | 69 746 -> 71 166 | 71 468 -> 73 174 | |
| skyJ | 175 520 | 114 292 | 133 290 -> 116 976 | 173 834 | |
| skyK | 160 499 -> 162 787 | 174 692 -> 175 894 | 229 042 -> 230 244 | 197 700 -> 199 892 | |
| hotel | 67 808 -> 87 412 | 67 840 -> 79 744 | | 75 552 -> 91 546 | |
| flat | 33 148 | 39 532 -> 29 630 | new: 37 476 | 42 224 | |
| perch | 84 080 -> 89 184 | 72 564 -> 77 032 | | 111 076 -> 94 976 | |
| cult | 89 316 -> 62 436 | 91 918 -> 64 808 | | 90 134 -> 73 190 | |

The Hotel is +29% on its own (it closed four open items); the group as a
whole is +0.5% of the showcase. skyI stays far under its class: the massing
was bought with flat-shaded quads, not triangles.

## Requests for shared code
- `92-camera.js`: an animation hook (for fire flicker).
- `36-decor.js`/lighting: the red-brown hemisphere ground colour paints every
  soffit in the kit brown (skyI, skyJ, the Hotel's eaves); a per-material
  "soffit" option or a bluer ground colour would fix it kit-wide.
- `KNOWN_ISSUES.md`: the "figures()" plinth item and the Cutaways item can be
  ticked; the Rehabilitated row-preset item wants a z-spacing decision.

---

# Round 2 (2026-10-01)

Rendered on two scratch targets holding only this group's kit rows at their
kit positions (A-D, G, H; then E, F, Hotel, Cultural, Perch, Flatiron, I, J,
K); shots read for every changed type/decay. Every invariant PASS, error
panel clean, `jscheck` PARSES OK on each. Seeds unchanged and no new rng()
draws anywhere (everything added is placed by position hash or derived), so
nothing already placed moved except where a stance was changed on purpose.

## Shared-file edits (please merge)

- `src/10-core.js` + `src/92-camera.js`: **the frame hook `TICKS`/`tick(fn)`**.
  It did not exist on this branch; I applied the lighthouse patch's hunks
  (commit 3897037 on `ancients-resume`) **byte for byte**, so merging with
  that branch should leave one copy. Nothing else in either file.
- `src/69-mat-salvage.js`, FIRELIGHT section only (appended after `firePit`):
  flicker shader, `fireLightMark`/`fireLights`, one `tick`. `repairPass` untouched.
- `KNOWN_ISSUES.md`: ticked the round-1 and round-2 fixes listed here.

## OPEN items from round 1

- FIXED **"The fires do not flicker"**: `MAT.flame` and `MAT.ember` get an
  `onBeforeCompile` (kbake re-attaches it to its clones) reading one shared
  time uniform; each instance takes its phase from its own position, so no
  two windows pulse together. Driven by `tick`.
- FIXED **"The fire does not light anything"**: each Project gets 3
  PointLights at k-means centroids of its own burning windows and pits
  (`fireLightMark()` at the builder's start, `fireLights(mark,3)` at its end),
  16 m off the facade, warm, flickering. `visible=false` by day, so day views
  pay nothing; the first switch to night compiles one extra program variant
  per material and later switches reuse it. 9 lights in the kit. In the
  Project night shots the fabric round the burning floors and the podium is
  lit orange now, not hemisphere-grey. Project A barely shows it: its skin is
  `MAT.rust`, metalness 1 (no diffuse term), so a point light only gives it a
  rough specular. D and H (concrete) read clearly. Lights sit on each
  cluster's mean bearing at its mean radius + 16 m (a centroid of windows
  wrapping a round tower lies inside it).
- FIXED **"The Project's plinth can only come in to 110"** and **"A, B and C
  are limited by their own legs"** (stance changes, now asked for): A's strut
  feet 98 -> 80, podium 110 -> 92 (also the Project's); B's legs 70 -> 56,
  podium 82 -> 66; C's legs 62 -> 50 (their heads still meet the shaft at
  r=20, so they stand steeper; the sky bridges follow), podium 96 -> 80.
  Registered radii A 130 -> 110, B 120 -> 100.
- FIXED **"Skyscraper G cannot shrink"**: the stack and the drum moved toward
  each other (stack centre x 70 -> 50, drum -70 -> -52; bridges 67 -> 29 m),
  outer stilts at r=99.6, block corners at 104.2; podium 130 -> 116. The
  podium bar at z=90 still runs past the podium at both ends, on the ground,
  as before.
- PARTLY **"The repaired pass dresses every type identically"**: the towers
  carry their own accretion at decay 3, in their own builders (`skyHoist`,
  52-sky-abc.js): a gantry off the top, a cable with a load on it, a winch
  house at the foot, and two scaffold cages (poles and plank decks) up the
  face; on A, B, C, D, G (about the drum's own axis) and H. `repairPass`
  itself is untouched; the Hotel, Cultural centre, Perch and Flatiron are
  still dressed only by it.
- STILL OPEN: "Patches sample the wall faces" (shared `repairPass`); "The row
  presets had to be pulled in" (kit row spacing in z, shared layout); "Only
  these two builders take the parameters" (no caller, would be dead code).

## Kit-wide detail items, for these types

- **Glass shards in ruined window openings** — DONE. `skyShardMark()` at a
  builder's start, `skyShards(mark, frac)` at its end put the civic group's
  `civShardAt` teeth in every dead opening placed in between (`winSmD`,
  `winD`, `winBigD`, `ovalD`, `paneD`, `cellD`, K's `skWinD`), including those
  the shared `windowsOnLathe` places, without touching it. Half the openings
  at decay 1/2, a quarter at 3, none on the Projects. A, B, C, D, G, H,
  Hotel, Cultural, Flatiron, K. (E and F have no instanced dead openings; I
  and J bake their windows into merged meshes.)
- **Dead cells were pale grey at night**: A's and G's dead window cells were
  `cell` in the `DEAD` colour (MeshBasic, ~60/255 whatever the light); they
  are `cellD` now, dark at night as by day.
- **Interiors visible behind openings** — DONE for A, B, C, D, G, H
  (`skyRooms`): per storey, ONLY in bays where the shell is open or next to
  an open bay, a ceiling fitting under the soffit (5% lit warm in a ruin, 22%
  rehabilitated), cabinets and machine silhouettes, a radial partition every
  third bay, conduit risers, the odd dead touch panel. The scars now read as
  rooms rather than a bare stack of plates.
- **Mouldings**: the Hotel's court windows have a projecting sill and a hood
  (a shadow line per opening on the brick court elevation); the Cultural
  centre's halls have a cornice band under the cap and a string course
  between window tiers (a lathed 18-sided band, 108 triangles: the first cut
  used the kit's torus ring and nearly doubled the type).
- skyJ **night glow** (NOTES weakness): the terrace-lip emissive was
  `0xff9440` at .6, which tone-maps to cream; `0xff5212` at .85 reads amber.

## Not changed, and why

- skyK "rib section swept with a z-up frame twists": the frame is orthonormal
  (N = z x T, B = T x N) and keeps the rib's broad axis in the xy plane by
  construction, which is the intended read. Left.
- skyI/skyJ/Hotel soffits brown: the hemisphere ground colour (shared lighting).
- Toppled A's fallen body is tilted 5 degrees by `toppledUpper` (shared by
  the eight towers), so its crown end bears only on its strut ring. Left.
- skyJ rib junctions, small spire fragment; skyK belly / regular grid: design
  passes, not QA fixes.

## Triangles per type/decay (scratch targets, round 1 -> round 2)

| | 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|
| cult | 62 436 -> 74 532 | 64 808 -> 71 270 |  | 73 190 -> 81 062 |  |
| flat | 33 148 | 29 630 -> 31 466 | 37 476 -> 39 474 | 42 224 -> 42 938 |  |
| hotel | 87 412 -> 95 476 | 79 744 -> 86 836 |  | 91 546 -> 99 658 |  |
| perch | 89 184 | 77 032 |  | 94 976 |  |
| skyA | 101 460 | 107 212 -> 122 790 | 156 130 -> 173 414 | 144 742 -> 150 230 | 140 918 -> 142 458 |
| skyB | 241 492 | 182 038 -> 195 764 | 261 528 -> 273 006 | 275 330 -> 277 454 |  |
| skyC | 189 384 -> 186 264 | 179 796 -> 187 572 | 212 454 -> 217 372 | 223 326 -> 221 338 |  |
| skyD | 65 184 | 74 716 -> 83 136 | 96 092 -> 104 138 | 107 206 -> 107 802 | 104 276 -> 104 444 |
| skyE | 66 108 | 63 558 | 75 714 | 79 002 |  |
| skyF | 74 052 | 65 854 | 81 308 | 80 302 |  |
| skyG | 80 676 -> 80 292 | 97 356 -> 102 970 | 109 276 -> 115 122 | 115 062 -> 115 070 |  |
| skyH | 98 184 | 90 594 -> 98 540 | 128 774 -> 134 602 | 142 304 -> 143 170 | 171 408 |
| skyI | 40 716 | 67 044 | 71 166 | 73 174 |  |
| skyJ | 175 520 | 114 292 | 116 976 | 173 834 |  |
| skyK | 162 787 | 175 894 -> 179 218 | 230 244 -> 233 634 | 199 892 -> 201 860 |  |

Group total 6 947 161 -> 7 127 847 (+180 686, +2.6%); about +1.8% of the kit
showcase. The biggest single line is Toppled A (+17k: interiors in both the
stump and the fallen body). Draw calls: +2 never-culled kit meshes (civShard
was already there; cultBandW/R are new). The 9 PointLights cost nothing by day;
at night they add per-fragment lighting cost, not draw calls.

---

# Design pass (I, J, K) (2026-10-01)

Design work the QA rounds left open: J's rib junctions and crown, K's belly
and window grid, and a scrutiny of I at hero, close and ruin range. Fragments
`89k-sky-i.js`, `89l-sky-j.js`, `89m-sky-k.js` only; no shared file touched.
Seeds unchanged. Nothing new draws from rng: J's junctions and crown and I's
crown are derived from the existing geometry, and K's new facade is placed by
position hash after the OLD window grid's rng draws are replayed draw for draw,
so every later draw (the rose's ruin, campanile, houses, the toppled pieces)
lands where it did (K's podium and houses are identical in the before/after
ruin shots). Every target: `build.py`, `jscheck.py` PARSES OK, `verify.py
--assert` error panel clean, all six invariants PASS.

## J, the Whorl
- **Junctions.** A lens-shaped clasp with a boss wherever two neighbouring
  ribs kiss (the old crease where two tubes ran through each other); a collar
  where a rib passes each terrace plate, the base roof's lip and each spire
  hoop; a flared shoe where a rib roots. All derived from the ribs' paths, so
  the ruin keeps only those on the pieces it keeps.
- **Crown.** Coronet at the roof plate; four hoops, each clasping every rib;
  a 57 m glazed lantern banded every two storeys (lit at night); a stone
  spindle to the knot; an ovoid boss on the knot; a banded needle to 457 m
  (was a thin 2.4 m cone to 436). The toppled spire fragment is now the whole
  crown, broken, instead of bare ribs and one hoop.
- Lighthouse: it keeps its own copy of the Whorl's body code and calls only
  `sjGrid/sjSweep/sjPlate/SJ_PT/SJ_PM`, none of which changed; rebuilt and
  verified (PASS, panel clean), shots unchanged in character.

## K, the Sail
- **Facade** with a rhythm that changes with height: two-storey openings under
  hoods at the base; bays of three under sunshades with piers, a loggia band
  every third storey, bays shifting half a bay every six storeys, through the
  belly; nearly blank round the rose; staggered slits above; blank prow. The
  flat back has banded vertical strips. Margins widen with height; nothing
  sits on a batten.
- **Belly**: a keel blade (to 7 m deep) along the draft line from the porch
  apex to the prow, broken by the rose collar; bolt ropes along luff and
  leech. Square-on from the south the belly's crest is now drawn by the keel
  and its shadow.

## I, the Braid
Looked at the hero, row, braid, crown, foot, ruined, rehabilitated, toppled
and along-the-fallen-body views. The weakest part was the top third: a bare
needle with two pale fins and a lit box on the apex. Now a corbelled collar
gathers both strand fins at 386-398 m on two-step brackets from the shaft,
with a cornice, three stepped tiers under the knife, pinnacles, lit slots and
a slim crystal finial. It stands on the intact and rehabilitated towers and
lies at the end of the toppled body; the ruin (snapped at 336 m) has none.

## Stumps
`stumpI/J/K` rebuilt through a scratch copy of `iziz-variants` holding only
I, J and K (not committed): all read, J's stump carries the collars and
clasps on its ribs, K's the new facade. stumpI 56 898 / 54 036, stumpJ
101 843 / 123 112, stumpK 127 596 / 134 915 (decay 0 / 3).

## Triangles per type/decay (target scene, before -> after)

| | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| skyI | 40 716 -> 41 700 | 67 044 -> 67 044 | 71 166 -> 72 078 | 73 174 -> 74 086 |
| skyJ | 175 520 -> 202 456 | 114 292 -> 124 140 | 116 976 -> 139 520 | 173 834 -> 197 852 |
| skyK | 162 787 -> 164 851 | 179 326 -> 181 764 | 233 682 -> 235 974 | 202 022 -> 204 860 |
| lighthouse (after only: its code path did not change) | 117 568 | 90 460 | 118 678 | 118 560 |

All far under the 400 k 'sky' class. (K's "before" for 1-3 is the current
branch measured from a HEAD build, a few hundred off round 2's table.)

## Shots looked at
Before (HEAD build): J The Whorl, Ruined, Toppled; K Skyscraper K, Ruined K,
Toppled K, The rose, The fallen sail, Rehabilitated K; I Skyscraper I, Ruined,
Toppled, The braid, The crown. After: J The Whorl, Ruined, Toppled, The
lattice, The crown, The fallen body; K Skyscraper K (twice), Ruined K,
Toppled K, The rose, a square-on south view and a low SW view of the belly;
I Skyscraper I, The crown (twice), Toppled, Along the fallen body,
Rehabilitated; stumps I/J/K and the J row; lighthouse The lighthouse,
Toppled, The lantern.

## Still open
- J: the fallen spire lies near the body's own line, so 'Toppled' sees it
  end-on (its yaw is rng-drawn; left).
- K: the dead-window glass teeth (`skyShards`, shared) read as V marks in the
  big base openings of the ruin at row range.
- I/J soffits still brown from the hemisphere ground colour (shared lighting).
