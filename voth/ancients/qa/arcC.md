# QA pass — group arcC

Types: Trigon (89f), Monolith (89g), Crescent (89h), Arcube (89d), Ledge (89i),
Wheel (89j), Wing (8ae), Drum (8af), Blades (8ag). All standalone targets,
`DECAYS=[0,1]`, seeds unchanged. Open items were the "Weaknesses"/"Known issues"
in each `targets/<type>/NOTES.md` (none of these types has a KNOWN_ISSUES
section, so there is nothing there for the coordinator to tick).

## Shared by the nine: `krShard()` and `krSeam()` (in `src/89d-arcube.js`)

Two hoisted helper functions, top of the Arcube fragment because it sorts first
of the nine (order does not matter; they are function declarations).

* `krShard({w,l,t,layers,brk,bite,tile,seg})` — a SHATTERED piece instead of a
  box: a star-shaped outline sampled by angle, straight on the edges that were
  skin and bitten on the edges named in `brk`, stacked in `layers` storeys each
  torn back further than the one below (so the floor plates step out along the
  break). Returns flat-shaded geometries by role (`top`, `bot`, `side`, `brk`),
  `rim` points along the torn edges with normals and step depths (for plate
  tongues and bars), `inside()`, `low(q)`/`high(q)` for bedding. Uses the
  caller's `rng()`, so it is deterministic under the builder's own reseed.
* `krSeam(geos,h,step,fn)` — calls `fn` at vertices of placed geometry within
  `h` of the ground: used to pile a fallen piece's own fragments along its
  contact line so it is bedded in what it crushed.

A request, not done (shared code is not mine): these belong in `38-helpers2.js`
if another group wants them.

## Trigon (89f) — DONE
Before 242 517 / 281 731 → after 299 725 / 358 944 triangles (d0/d1).
* FIXED "Under the 450-650 k target; headroom unspent (more riser detail would
  be the place)": every 92 m riser now has pilasters every 12.8 m, string
  courses every 7 storeys and runs of real balconies decided per 25.6 m group
  (neighbourhoods, not a grid), planted intact / vined in the ruin; the portal
  face's panel relief went from 900 to 2 400 pieces. Still under 450 k by
  choice: more would be filler.
* FIXED "Balcony chevrons read as vertical ochre stripes": the bands were
  |s|/half-width (lines converging on the apex); they are now bands of constant
  y + 1.35|s| — nested inverted Vs, a third ochre. They read as chevrons from
  1.5 km ('The balcony face', 'Up the arris').
* FIXED "The fallen apex pieces float/bury slightly where the jagged skirt
  meets the plain": every face point of a fallen piece within ~9 m of the
  ground gets rubble piled against it (the crushed seam), and nine torn plates
  of cladding (krShard, portal ochre and balcony stone) are thrown either side.
  Stairs on a fallen piece are only kept when both ends are on the piece.
  "Its tip piece is messy close up" — left: it is the pyramidion's bent ribs,
  and it now sits in a bed of rubble; not worth a redesign.
* FIXED "Paving disc around the plinth is pale and plain": paved ring, stone
  kerbs, three avenues on the stair axes, lawns between (raised to 0.48-0.62 m
  so they do not z-fight the ground at 1.5 km).
* FIXED "'Up the arris' is mostly sky; the plinth corner is out of frame":
  camera 560 m off, 6 degrees round toward the balcony face, target 150 m up
  the arris: plinth, stair and arris all in frame.
* REMAINS: new kdefs/textures load in every target (shared src/ — not mine to
  change).
Best shots: `shots/qa_trigon/view_The_balcony_face.png`, `view_The_terraces.png`,
`view_The_fallen_apex.png`, `shots/qa_trigon2/view_Up_the_arris.png`.

## Monolith (89g) — DONE
Before 385 304 / 374 108 → after 398 244 / 416 340.
* FIXED "The fallen slab fragments are clean boxes": the six corner slabs are
  krShards (torn on 3-4 edges, 3-5 storeys stepping back), section map on the
  tear, the orange skin only on what is left of the upper face, plate tongues
  and bars out of every step, a crushed skirt of their own fragments; the 120
  scattered boxes are now 150 thin broken plates of skin and stone.
* FIXED "Night is dim apart from scattered window points; the oculi do not
  glow": a night-only kit class `mnGlow` (pushed on FIREKIT) lines every oculus
  bore with warm cards, brighter on the lower half; a third of the dark slit
  windows on the orange face are lit at night.
* PARTLY "~300 k triangles of headroom per decay is unspent": the court round
  the foot is laid out (pale radial bands every 15 degrees, three kerbs,
  benches and planting; broken in the ruin). The rest is left unspent — the
  faces are already dense and more would be filler.
Best shots: `shots/qa_monolith/view_The_fallen_corner.png` (vs
`shots/qa_monolith_base/`), `view_Night.png`, `view_Monolith.png`.

## Crescent (89h) — DONE
Before 232 400 / 321 048 → after 311 016 / 381 208.
* FIXED "The side faces are the largest surfaces and are still mostly
  texture": pilasters on every 30 m window tile between the existing 15 m
  ledges make the faces a grid of bays, and about one bay in four carries a
  stack of real balconies (clustered per bay), planted intact. This is also
  where the unspent budget went ("Budget: ~230 k intact / ~320 k ruined ...").
* FIXED "Fallen pieces ... rubble is scattered, not modelled as crushed plaza
  under them": each horn piece is bedded by krSeam (rubble along every line it
  meets the plain), sits on a torn skirt of broken paving, and has twelve torn
  plates of its bronze/verdigris skin thrown clear (krShard); the fifty green
  boxes on the forecourt are torn floor slabs (krShard) now.
* REMAINS, by design or not worth it: the top ~70 m of the concave above the
  last terrace is smooth soffit; the belly is dark bronze (it faces away from
  the sun and the shell is meant to be dark); the basin reflects nothing (no
  env map in the kit); floor plates behind missing shell plates are
  axis-aligned boxes.
Best shots: `shots/qa_crescent/view_The_side_elevation.png`,
`view_The_fallen_horn.png`, `view_The_Crescent.png`.

## Arcube (89d) — DONE
Before 403 694 / 323 792 → after 403 694 / 353 816 (intact untouched).
* FIXED "The ruin's outline is still mostly a whole diamond": the broken-corner
  bite now runs the WHOLE south vertex line (it started at x = -150), 280 m
  deep at the west end growing to 400 m at the east, so both end elevations have
  lost their south corner and the flank has a stepped fracture its full length
  (same BRr/biteP machinery, so faces, end bands and fracture still agree). New
  preset 'The ruined elevation' (the diamond elevation's camera on the ruin)
  shows it.
* FIXED "The fallen heliport tower is small in its own preset": camera 700 m
  off instead of 2 km; the tower fills the frame.
* ALSO (theme): the fallen pier, tower pieces, crown and the corner's 26 blocks
  are krShards (torn ends / torn edges, storeys stepping back, acBreak on the
  tear, plate tongues and bars); the ~100 scattered boxes are rubble.
* REMAINS: ~300 k headroom per decay left unspent (the faces are already the
  whole drawing); the corner notch is a chamfer of uniform character along the
  length — a second failure (the ridge) would change the outline more.
Best shots: `shots/qa_arcube2/view_The_ruined_elevation.png`,
`shots/qa_arcube/view_Ruined.png`, `view_The_fallen_tower.png`, `view_The_fallen_pier.png`.

## Drum (8af) — DONE
Before 241 620 / 329 692 → after 285 374 / 467 650.
* FIXED "Fallen pieces are boxes laid down, not broken shapes; they do not
  crush the lawn under them": the fallen blocks and fin slabs are krShards
  (torn on three sides, storeys stepping back, section on the tear, slab tongues
  and bars), each on a torn skirt of crushed earth (new MAT.drScar, also the only
  contact shadow). Lantern and coronet arcs stay boxes.
* FIXED "Fin side faces are plain board-marked concrete (no openings)": in every
  gap between tiers both flanks of every fin carry storey rows of deep window
  openings (a third lit, warm) and a balcony slab every fourth row.
* FIXED "'The ruined court' stands just outside the kerb on bare soil": the eye
  search is limited to r 380-535 (the court is 560).
* REMAINS: intact concrete reads pale under the kit's sun; the lean reads best
  in 'The lean'/'The fracture'; windows on the blocks are still texture.
Best shots: `shots/qa_drum2/view_A_tier_close.png`, `view_The_ruined_court.png`,
`shots/qa_drum/view_The_fallen_top.png`.

## Wing (8ae) — DONE
Before 309 952 / 276 804 → after 316 268 / 318 928.
* FIXED "Downward faces still read warm-brown": the soffits carry painted
  bounce light like the Ledge's (emissive through the concrete map), multiplied
  by the vertex colour so the gaps' painted occlusion still darkens it
  (`wgBounce`, an onBeforeCompile on the two soffit materials), and dimmed at
  night by `ldNightDim()` — so the "glowed white at night" failure is gone.
* FIXED (mostly) "the three pieces read more 'blocks' than 'shattered wing'":
  every break (stump and pieces, shared predicate) is staggered slab by slab
  (±20-36 m per slab), so ends are ragged rows of slab ends; pieces are bedded
  in a crushed seam, eight torn concrete plates each are thrown round them, and
  the 120 scattered boxes are rubble. From 'The fallen wing' the middle piece
  still reads as a row of standing slabs (it is a stack on its back).
* FIXED "the pedestal is a box": buttress ribs every 8 m on all four faces and
  rows of deep slots between.
* ALSO: transverse soffit ribs every 9 m under every cantilever, lamp slots on
  alternate ribs ('Under the cantilever').
* REMAINS: headroom unspent (316 k); the pancaked west tip is a smooth vertex
  deformation; coffer loss can read as a pinwheel.
Best shots: `shots/qa_wing/view_Under_the_cantilever.png`, `view_The_stump.png`,
`shots/qa_wing2/view_The_fallen_wing.png`.
