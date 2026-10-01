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

## Verified 2026-10-01 (recovered patch, then the finishing pass)
The paused agent's patch was recovered onto `ancients-resume` and checked
before anything was changed: builds, `jscheck` PARSES OK, `verify.py --assert`
all six invariants PASS, error panel clean. **The beacon turns:** a probe read
`LH_BEACONS[0].g.rotation.y` three times ~1.2 s apart (wall clock; SwiftShader
frames are slow, so each frame's `dt` is clamped to 0.1 s) and it advanced
-3.330 -> -3.420 -> -3.464 at night with the beams visible, and kept advancing
by day with them hidden. `TICKS.length` is 2 (the beacon and the biome wind).

Fixed in the finishing pass:
- **The berm was cut off short of its foot in a 4 m staircase.** The ground
  mesh culled every quad under WL-.7 as "under the sea, never seen", and that
  also took the berm's OUTER slope (it falls from WL+2 to 0 over q 10..38), so
  the sand rim ended along its 1.8 m contour with a sawtooth edge (wireframe
  confirmed). The cull now applies only inside the basin (q<0); the rim runs
  smoothly down to the plain on its foot circle.
- **The ravine path is a cliff stair.** The knoll stands 27 m over the cove on
  a ~50 degree slope, and the old path was flagstones draped on it, reading as
  loose tiles. Now three flights zigzag across the cove (LEGS) from the knoll's
  rim to the jetty's deck at an even ~25 degrees: solid stone steps (~.32 m
  risers) sunk in a terrace that `landH` carves along the centreline (flat
  4.5 m either side so the 4 m grid cannot poke through, blended out by 9 m),
  a landing at each turn, a post rail on the sea side. The ruin loses ~30% of
  steps (h3, no PRNG) and most posts. Figures stand on `PATH[i][3]`.
- **Floating items** (a downward-ray probe over every instanced item, see
  below): the ruined gallery's rail posts and lens shards hung over holes in
  the roof plate (the gallery plate now stays whole in a ruin); lodge chimneys
  stood on holed ruined roofs 8 m over the floor (the stack now rises from the
  floor through the roof, same top); the toppled tower's last rubble rings
  reached 30 m past the cliff edge at cliff-top height (each ring now stops at
  the edge; same calls and counts, so the PRNG stream is unchanged); the
  mole-head lamp stood off the rounded end cap over the water (moved one point
  in).
- The toppled site's ruin greening (RUINS radius 420) showed past its berm as
  a yellow-green smear; 300 in this target keeps it under the sand.
- Presets added: 'The cliff stair' (day, close), 'The lantern at night'
  (night, close: the lit lens, the beam roots).

What moved: the carve changes the ground mesh on the cove slope, so
`upFaces` samples differently there and the trees and moss after it are drawn
in different places (their positions, and everything later in the PRNG
stream, shift). Nothing on the tower moved.

## Ground and water check
WL=2.5. The island's ground mesh drops to WL-.9 at the cliff foot; the sea is
an opaque surface at WL over the basin (berm crest WL+1.5..2). Boulders sit at
clamp(islH, WL-.8, WL+3); the jetty deck is WL+2.5, the mole's WL+3.4, both
standing on the seabed shelf. Hulls ride at WL+.8..+.9 (intact/rehab) or lie
sunk at WL-.6 (ruins); the wreck is on its skerry at WL+.6..2.2.

Float probe (an `--eval` in the scratchpad, not in `91-probe.js`): for every
instanced item in the row, a ray down from its top onto every opaque mesh;
reports items whose underside is > 1.5 m over what is beneath. After the fixes
the remaining hits are all accounted for: repair patches on the rehabilitated
tower's walls (wall-mounted, the ray finds the floor below), tree leaf cards,
and the rail posts of the toppled lantern lying on its side in the sea
(attached to the gallery, now vertical). Submerged boulder bases are skipped.

## Measured (verify.py --assert, standalone target, 2026-10-01)
Triangles per decay 0/1/2/3: before 113 906 / 87 180 / 114 544 / 116 992,
after **117 568 / 90 460 / 118 678 / 118 560** (budget 400 000; the berm skirt
and the stair added ~3 000). Meshes per decay 20/17/24/17. Worst draw calls
over 16 presets: 104 (Lighthouse at night, all four sites in view).

## Presets
Lighthouse island (row), The lighthouse, Ruined, Rehabilitated, Toppled, The
lantern, The smashed lantern, The harbour, The cove, The cliff stair, The
wreck, Looking up, The fallen tower, Lighthouse at night, The lantern at
night, The fire basket at night. Day: the row and hero views; night: 'at
night' x3; close: the lanterns, the cliff stair, the harbour, the wreck.
Kit: 'Lighthouse', 'Lighthouse at night'.

## Weaknesses
- The stair's terrace is cut with a 4 m ground grid: between flights the
  ground falls as a steep stretched face (it reads as cut rock, not as built
  retaining walls). The flights have no parapet, only posts.
- Cliffs are a 4 m heightfield: steep but smooth, no overhangs or sea stacks.
- The sea is Lambert (a GGX sea blazed white with the fill light), so it has
  no sun glint; ripples are a tiled texture; only the beams move.
- The ruined lantern's astragals stand as loose bronze helices.
- Beams re-aim whenever the camera jumps > 250 m in one frame (fast WASD at a
  large orbit radius counts as a jump).
- Adding the row moves the kit's 'Skyscraper K' camera from 900 to 710 m
  (ROWV caps the distance 90 m short of the next row).
- In the kit target the toppled site's RUINS radius is still 420 (computed
  from ROWS in the shared `targets/kit/89z-rows.js`), so the greening smear
  can show there.
