# The Hanging City — the lattice pyramid (`--target spire`)

Replaces **Vashtir, the recursive spire** (round 3, user request: "weak"). The
builder keeps its file (`src/61-spire.js`), its function name (`buildSpire`),
its type key (`spire`), its target name and its seed range; git keeps the old
code. The display name is new: **The Hanging City**.

## References

User-supplied (round 3), Shimizu Mega-City Pyramid (an unbuilt 2004 proposal
for Tokyo Bay):

- labelled diagram: skyscrapers hung inside the lattice, robots, nodes,
  inclinators, megatrusses, personal rapid transit, piers, and stepped
  pyramidal podium blocks on a grid over water at the base;
- render beside the Burj Khalifa: huge tubular megatrusses meeting at spherical
  nodes, an octahedral/tetrahedral lattice, tall slab and cylinder skyscrapers
  and small pyramids suspended within the frame, stepped terraces.

What is taken: the octet-truss pyramid, tube-and-sphere joints, the hung city,
inclinators, PRT, piers, the podium blocks on a grid, the water. What is not:
Shimizu's scale (2 km tall, 2.8 km base, eight tiers) and its exact tier
count. House style holds: white panelled metal and blue glass intact, rust and
dead glass ruined.

## Scale

| | |
|---|---|
| lattice | octet truss, N = 6 cells, every member A = 180 m |
| base | 1 080 m node to node (1 450 m across the podium ring corners) |
| height | apex node 804 m (= YB + 6 A / sqrt 2), ~880 m to the mast tip |
| proportion | 0.74 of the base (Shimizu's ~0.71; the 40 m pier storey adds the rest) |
| members | 588 tubes, r 5 m, sleeved at both ends, two dark bands each |
| nodes | 140 spheres, r 13 m, darker steel than the tubes |
| cells | 55 octahedral cells (layers 1-5) + 36 half-cells at the base |
| lagoon | 1 800 m square, water at 3 m, a 6.5 m concrete quay and a turf slope; site 1 940 m, rows at s = 2 100 |

Against the neighbours: Plymouth 732 x 524 x 267 m, the Crescent 1 112 m
tall, Arcube a 1 km cube. The Hanging City sits between them: wider than any
of them at the base, shorter than the Crescent, and much lighter, because it is
a frame you see through.

## How it is built

- **Lattice**: layer k (0 = apex) is a (k+1)^2 grid of nodes; each node ties to
  its grid neighbours and the four nodes of the square below. Every member is
  the same length, so the tube kdef is built at its real size with real-metre
  UVs and placed at scale 1 — no stretched panels.
- **Hung city**: the octahedral cells are empty in an octet truss, so each takes
  a building on its vertical axis. The four diagonals out of the apex node run at
  45 degrees, so the cell is clear to a square of half-width 0.707 s at depth s;
  a tower of half-diagonal rho stops (rho + 4) * 1.42 m short of each apex, and a
  tapering head (a frustum for a cylinder, a pyramid for a slab) carries it up
  to the node it hangs from. Kinds: 40% cylinder, 26% slab, 22% deck slung from
  the equator nodes with a stepped or smooth pyramid on it, 12% void.
- **Base**: the 16 inner half-cells hold towers standing in the water on
  plinths, the 20 perimeter half-cells stepped podium blocks; 49 piers carry the
  bottom nodes; a ring of 24 stepped blocks and 4 corner blocks stands outside
  the frame on the grid; causeways cross the lagoon on the four axes.
- **Movement**: inclinator rails up all four arrises and ~30% of the face
  diagonals, with level cabs; PRT glass tubes under every horizontal from layer
  1 down, rail, hangers and pods; yellow maintenance robots and gantries on ~25%
  of the outer members.
- **Draw calls**: everything repeated is a kdef (one InstancedMesh each); the
  city is four merged meshes (facade, roofs, steel heads, dark cores); the
  lagoon and quay are a sibling group (three meshes). Intact: 41 calls for the
  whole target at the hero camera.

## Decays

The layout comes from its own stream (`shzRng(9317)`), consumed identically at
every decay, so the ruin is the same building. The collapse debris comes from a
second stream (`9319`) so ruined and rehabilitated lose the same sector.

- **0 intact**: white tubes, steel nodes, cyan node lamps, lit curtain walls
  (warm, a few cool office whites), PRT glass, cabs, robots.
- **1 ruined**: rust (the rust tube's UVs are swapped so the drip bands run
  along the member; wrapped round it they read as a corrugated hose). The
  north-east corner round CC = (400, 250, -400), r 300, has failed from the
  piers to ~420 m: its nodes and every member through it gone, stubs drooping
  at the surviving nodes, the corner piers snapped, the corner podium blocks
  crushed to two steps, and the members, nodes and the towers that stood or hung
  in it lying in the lagoon outside (towers broken in two, eaten through). A
  hole in the middle of a face was tried first (rounds 2-3) and did not read:
  the octet lattice is so redundant that the layers behind fill it in. A missing
  corner changes the silhouette: it is the hero's right-hand foot. 8.5% of the other members
  snapped into drooping stubs; one in five of the other hung towers gone (its
  head remains), one in six swung off plumb; glass gone, towers holed through
  to dark cores and floor plates; the lagoon green with algae mats; vines off
  the horizontals, moss on the nodes, trees on every terrace and outside the quay.
- **3 rehabilitated**: the same collapse and debris, 3.5% snapped members, one
  in ten towers lost, warm lights back in the panes that kept their glass, fish
  pens and warm lamps on the causeways, and the shared `repairPass` salvage on
  every mesh (towers, podium blocks, decks). The lagoon is a sibling group, so
  no shanties float on the water.
- 2 is not used (no `t` column; the type has no toppled state).

## Triangles (scene content, `verify.py --assert`)

| decay | before (Vashtir) | after |
|---|---|---|
| 0 intact | 125 438 | 289 060 (6 376 instances, 7 meshes) |
| 1 ruined | 86 410 | 316 134 (7 066 instances, 52 meshes) |
| 3 rehabilitated | (not shown) | 314 034 (6 486 instances, 52 meshes) |

Budget class `mega`, 700 000. Draw calls for the whole target: 57 at the
intact hero, 52 close in, worst 164 at the ruined hero (three sites in view;
each fallen tower piece is its own group of up to four meshes).

## Weaknesses (open)

- **Debris only lands on water.** A piece that would fall on a podium block is
  moved (rejection sampling) rather than laid across it, so nothing is seen
  crushed except the corner blocks, which are cut down by rule.
- **Fallen tower pieces cost draw calls**: ~12 pieces x up to 4 meshes. Merging
  them needs their transforms baked; not done.
- **The ruin's collapse is the one event.** Elsewhere the ruin is snapped stubs
  and missing towers, which read close up, not from the hero distance.
- **'Fallen in the lagoon' preset** stands low among the podium blocks; the
  debris is at the left of the frame, and the podium dominates.
- **Night**: the cyan node lamps are small (2.6 m) and barely read at the hero
  distance; the lit curtain walls carry the night shot.
- **The rehabilitated state reads close up only**: from the hero it is the ruin
  with cleaner water. repairPass dresses the meshes (towers, podium, decks),
  not the instanced lattice, so the frame itself carries no salvage.
- No interiors beyond a dark core and floor plates behind a ruined tower's holes.
- Not placed in the `kit` target (Vashtir never was).

## Vendored copies

`settlements/screamers/src/61-spire.js` is an independent fork of the OLD
Vashtir builder (it defines `buildSpire` but places no `spire` row; only its
`91-probe.js` budget table names the type). Yuni dropped `61-spire` from its
slice (`settlements/yuni/ANCIENTS-SYNC.md`). Neither was edited.
