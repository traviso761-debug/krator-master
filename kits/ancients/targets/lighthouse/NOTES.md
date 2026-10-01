# Lighthouse island — notes

Fragment `src/89n-lighthouse.js`, builder `buildLighthouse(scene,gx,gz,d)`,
seed `reseed(9790+d)`, prefix `LH`/`lh`. Target `lighthouse`; kit row
`lighthouse:{z:28800,s:320,r:300,t:1250}`.

## What it is
Skyscraper J (the Whorl) re-proportioned as a 234 m lighthouse: the Whorl's
undulating floor plates and six swept ribs (a turn and a quarter up the
shaft), the ribs carrying on past a broad gallery into a spiralling cage over
the lantern, a copper dome, vent ball and needle. Two red daymark bands of
plates; a double-helix stair slot glazed up a solid stone core. It calls the
Whorl's `sjGrid sjSweep sjPlate SJ_PT SJ_PM` and materials; 89l is untouched.

The island (~260-300 m) has cliffs, a cove to the south with a ravine path,
beach, mole, jetty, boathouse, keeper's house and fog-signal house, skerries.
The sea is an opaque vertex-coloured surface at y=2.5 inside a sand berm that
grades into the plain; adjacent sites of the row build only their own Voronoi
cell of the union of basins, so -320/0/+320 read as one channel.

## Animation hook (shared change)
`TICKS`/`tick(fn)` in `src/10-core.js`, called from the frame loop in
`src/92-camera.js` as `fn(dt, t)` (Screamers' order, which the biome binding
already expects — so the biome wind now animates too). Documented in API.md
"Animation". The beams re-aim on a camera jump (preset), so shots are stable.

## Decay
0 lit, beams at night; 1 lantern smashed, lens shards, ribs broken, island
overgrown, wreck on the western skerry; 2 broken at 88 m, the upper tower lies
along the island in a trench, broke again at the cliff and its head slid into
the sea; 3 HOLES .55, fire basket on the gallery (FIREKIT: night only),
repairPass on the tower group (island + sea are a sibling group).

## Measured (verify.py --assert, standalone target)
Triangles per decay 0/1/2/3: 113 906 / 87 180 / 114 544 / 116 992 (budget
400 000). Meshes per decay 20/17/24/17. Worst draw calls over the presets:
104 (Lighthouse at night, all four sites in view). All invariants pass.

## Presets
Lighthouse island (row), The lighthouse, Ruined, Rehabilitated, Toppled, The
lantern, The smashed lantern, The harbour, The cove, The wreck, Looking up,
The fallen tower, Lighthouse at night, The fire basket at night.
Kit: 'Lighthouse', 'Lighthouse at night'.

## Weaknesses
- The cove's ravine is narrow; from the sea the mole hides the beach.
- Cliffs are a 4 m heightfield: steep but smooth, no overhangs or sea stacks.
- The sea is Lambert (a GGX sea blazed white with the fill light), so it has
  no sun glint; ripples are a tiled texture; only the beams move.
- The ruined lantern's astragals stand as loose bronze helices.
- Beams re-aim whenever the camera jumps > 250 m in one frame (fast WASD at a
  large orbit radius counts as a jump).
- Adding the row moves the kit's 'Skyscraper K' camera from 900 to 710 m
  (ROWV caps the distance 90 m short of the next row).
