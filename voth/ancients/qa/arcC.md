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
