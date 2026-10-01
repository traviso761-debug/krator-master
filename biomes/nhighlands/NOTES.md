# Krator biome kit — the Northern Highlands (Oct 2026)

## What this is
The north and north-western highlands of the Inner Wall: the range's outer flank, climbing
out of the north-western lowlands toward the crest. Old-growth temperate forest low down,
boreal forest high up, a stream down the middle. One ideal-type artifact, "Krator Northern
Highlands", on the biome core (xanadu's, with the runtime LOD, plus sedesert's descending
water and two new climate fields: see BIOME-API.md). The brief is `BRIEF.md`; the reference
board is `refs/` (numbered in the order of the user's zip, contact sheets `refs/sheet0..3.jpg`).

A first attempt (an external agent, Sep 2026) copied the north-western lowlands kit and
changed about a tenth of it. Nothing of it is in this build except the polygon / path tool
(itself the Screamers' `93-polytool.js`) and the shape of the night-glow switch.

## The brief, in one line each
- The inspirations: the Pacific North-West (Hoh, the redwoods), the Black Forest, the primeval
  woods of eastern Europe and Scandinavia; Fangorn; the woods north of the Wall.
- Trees are large and form great canopies. Moss and ferns are everywhere. Mist is common.
- Ancient, gnarled in places, never unfriendly.
- Every green; dark blues and purples seep into the understorey only.
- The alien touches: the trumpet trees (bigger and more gnarled than the Rift's, and a large
  part of the understorey), and hanging epiphytes that glow faintly at night.
- A Girder tower to show the hanging flora; a stream to show the riparian strip; colder and
  more boreal to the SE; the Krator sky, the north-western lowlands in view to the NW.

## The map (45-host-stage.js)
6.6 km square, x east, z SOUTH. One axis, `s = (x+z)/√2`, runs from the low NW corner
(~0 m, the top of the lowlands' foothills) to the high SE corner (~1400 m); `t` runs across.
- **The ramp** is a quarter-sine in s. **Spurs and side valleys**: ridged noise in t, the ridges
  running down the axis, deeper higher up (relief ~150–250 m).
- **Two crag steps** cross the slope (s≈+350, 40 m; s≈+1900, 27 m), broken into gaps by noise and
  whole where the stream crosses them.
- **The stream** rises in a **tarn** at s≈+2700 (1175 m) and runs 7.45 km down its own valley
  to leave by the NW corner. Its bed comes from the terrain along the line, clamped never to
  rise; where the line crosses a crag step the bed drops with it: **the two falls** (47 m and
  57 m). A plunge pool is dug below every drop and a riffle-pool rhythm between, the water
  deepened by the same amount so the surface stays monotone. The banks rise from the bed
  WITHOUT the pools (a pool is deeper water, never a flooded bank). `waterH` is the stream's
  level across its channel, the tarn's in its bowl, `-1e9` elsewhere.
- **The fields**: `cold` = altitude + 150 m on the north faces + cold-air pooling in the valley
  + noise, over 380..1340 m (so ~40% temperate, ~25% montane, ~35% boreal); `rock` = the
  steep faces and the boulder fields of the middle band; `mist` = the hollows, the water, a
  cloud band up high; `wet`, `flow`, `upland` as the other kits. All cached on an 18 m lattice.
- The **Girder tower** stands on a levelled bench above the stream in the temperate band; six
  **crag pillars** stand under the crag steps.
- **The sky** (82): the Krator dome (giant NE, sun WNW). To the NW a real far country (the
  skirt) falls onto the lowland plain at -330 m with its jade lake 12–28 km out and the Outer
  Wall low beyond; to the SE the skirt climbs to ~3300 m and the dome paints the Inner Wall's
  snowy peaks; NE and SW, receding blue ridges. Day, dawn and night modes.

## The flora
Twenty-five tree species by habit (55):
- **conifer** (one builder, the form record makes the difference): the great spruce (60–90 m,
  buttressed, fluted, plated rust-to-teal bark), the cathedral cedar (fibrous red bole,
  drooping sprays, a candelabra top), the shadow hemlock (a nodding leader), the silver fir
  (a flat "stork's nest" top when old), the Norway spruce (curtain branchlets), the spire spruce
  and frost fir (the narrow boreal spires), the larch. Dead lower branches under the crown hung
  with moss (temperate) or beard lichen (boreal); snow on the upper side of the high crowns.
  BUSHY, NOT TWIGGY (Oct 2026, Travis): a needle mass round the bole at every tier, four to six
  arms a tier clothed to the bole in large overlapping masses, the arm itself (a rod) only on the
  long ones and only part-way out; the mid-range (lv1) trees at 2.2x the hero's tier step.
- **broad**: the moss maple (the Hoh's bigleaf: wide gnarled boughs mossed on top and hung with
  curtains of moss), the blue beech (ref 18), the mountain maple, the grey alder, the rowan, and the
  **forest lime** (Bialowieza's lime, Oct 2026: a tall clean bole into a high dome, a skirt of
  suckers round its foot).
- **Broadleaf country low down** (Oct 2026, Travis): at the foot of the temperate band (`low` in
  `NHL.zones`, 1 below cold ~.12, 0 above ~.34) the conifer giants thin to emergents over a
  broadleaf canopy (lime, moss maple, blue beech, mountain maple, alder in the wet hollows).
  Broadleaves are ~56% of the temperate and montane trees by count (29% before); higher in the
  band the mix returns to the conifers. The montane and boreal weights did not change, and the
  boreal band draws its placement from its own stream, so the lower bands' mix never moves it.
- **gnarl**: the gnarled oak (Wistman's Wood) and the fog laurel (the laurisilva); the **yew**
  (a hollow, fluted, purple-red bole, near-black needles).
- **birch** (white stems in stands, in the boreal band and on the old burn), the **crag pine**
  (orange above, umbrella pads; on the crags and the pillars), the **burn snag**, the **wind
  spruce** (krummholz, flagged, snowed on), the **brook willow**.
- **THE TRUMPETS.** The great trumpet: a short, massive, buttressed bole that twists as it
  climbs, three to seven writhing arms, a ribbed funnel 4–9 m across on each with a fringe of
  fins round the rim and violet down the throat; moss on the arms; bell-bulbs and lantern pods
  under the rims. The understorey trumpet: a leaning, kinked stalk (two or three from a foot
  now and then), one funnel, in COLONIES of 5–30. The boreal trumpet: squat, narrow and deep,
  a blue-grey bloom on the rim.

The floor (60) by zone: sword and lady ferns, moss mats and cushions, wood sorrel, shrubs, the
**lace fern** (a recursive frond, brighter than any terrestrial green); the dark accents in
patches (black grass, smoke bush, dark spurge, purple millet, teal aroids, ≤15%); mountain cane;
a rare zebra rosette; glades of bluebells, bracken and **disc stalks**; the banks' **red-stem
fans**, mossy boulders and stepping stones in the stream; the old wood's boulder fields; heath,
bilberry, reindeer lichen and fly agarics up high, fireweed in the burn; fallen giants with
their root plates, mossed, saplings on their backs.

The glow (50): bell-bulbs (pale amber) and lantern pods (violet), Lambert with an emissive the
night raises; a small, dim additive halo on half the clusters, at night only.

The tower (65) is the hanging-flora demo: hanging moss graded by length off every soffit and
ledge (the slab's lit edge most), trailing vine, bell-bulb strings and lantern pods; ferns,
moss cushions, trumpet saplings and seedlings on the ledges; moss and ferns on the walls. Going
up it, beard lichen replaces moss and the seedlings turn boreal (the probe counts both).

## Reference choices
- 25 (alienflora): the great trumpet (top-left), the lace fern (top-middle), the bell-bulbs
  (top-right), the red-stem fans (bottom-left), the disc stalks (bottom-right).
- 05: the lantern pods. 37, 36: the moss maple's curtains, the tower's.
- 21, 26, 30, 29: the giants' columns, plated and fibrous bark, the cathedral.
- 04, 10, 13, 32, 33, 34: the gnarled oak, the fog laurel, the boulder-field old wood.
- 18: the blue beech. 38, 39: the birch stands. 08: the crag pillars and their pines.
- 14, 23: the burn (snags over fireweed). 22, 40, 41: the boreal spires, the mist, the snow.
- 01, 07, 11, 12, 15, 44: the dark accents. 24: the bluebell glades. 16: the heath.
- 28, 35: mountain cane, in small patches only. 02, 31: the stream. 06, 03: the morning fog.

## The budget
~26M triangles held (trees ~17M with their stand-ins, floor ~9M), ~1.9M instances, ~1450 LOD
chunk meshes; 5–13M triangles and 200–480 draw calls at the preset views. Build ~27 s under
SwiftShader. 35k trees: ~15k heroes near the spine, the rest impostors.

## Lessons this build cost
- **A big map makes everything a hero.** With 22 spine points and a 1 km mid radius nearly every
  tree on 43 km² was built in full (62k trees, 12k full heroes) and the page crashed. Fewer spine
  points (13), hero/mid radii of 280/560 m, density that falls off with distance (`lodK`) and
  impostors drawn larger where the stands thin.
- **Plain JS arrays crash first.** Bucket vertices and instance matrices as arrays of doubles (8
  bytes a float, plus a key string a triangle) killed the tab at ~16M triangles. Growable
  Float32Arrays with the same `push()` halved it; the builders did not change.
- **Count the tessellation of the small things.** A moss cushion was a 154-triangle sphere, a
  boulder 320, a capped twig 24, a lantern pod 160: 4.3M triangles of cushions alone. Measure by
  item (`BIO.baked` grouped by name) before cutting trees.
- **An opaque funnel is black from below.** A wide lathe flaring upward has its outer normal
  pointing at the ground; from under the canopy every trumpet was a black disc. The funnels are
  their own bucket on the core's foliage material (normal bent skyward, back face lit through):
  they read as thin pale leaf, which is what they are.
- **A stream narrower than the ground mesh is cut into slabs.** At 9 m a vertex the ground's
  triangles bridged the 4–13 m channel over the water. The ground is held under the surface across
  the whole ribbon, and the ribbon is wider than the channel.
- **A pool must not flood its banks.** The plunge pools lower the bed; the banks are built from the
  bed without them.
- **A mountain stream's mean gradient is already foam.** ~.17 on average: foam keyed to the drop
  turned the whole stream white. Foam starts at .2 and is full only at the falls.
- **Water is unlit in a ShaderMaterial.** It glowed at night until a light uniform followed the
  mode.
- **Horizontal mist sheets on an open crest read as snow from above.** Sheets only in the hollows;
  sprites elsewhere.
- **Tint every textured solid by its texture's mean** (boulders went black, then white, before
  they went through `tint(colour, means().rock)`).
- r128 names the fog varying `fogDepth`, not `vFogDepth`: a fog patch keyed to the newer name
  silently does nothing.
- **A foliage card must hold its alpha down the mips.** The needle card was thin strokes (1.8 px
  on 512): two mip levels down they averaged under the alpha test, and at mid range every conifer
  was a pole with a few twigs, its full-length arm rods (solid, never alpha-tested) the most
  visible thing on it. Each tuft now has a shaded core under its needles, so a card stays a mass
  at range, and the rods stop inside the masses.
