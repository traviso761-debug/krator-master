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
