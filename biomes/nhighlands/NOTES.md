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
Twenty-four tree species by habit (55):
- **conifer** (one builder, the form record makes the difference): the great spruce (60–90 m,
  buttressed, fluted, plated rust-to-teal bark), the cathedral cedar (fibrous red bole,
  drooping sprays, a candelabra top), the shadow hemlock (a nodding leader), the silver fir
  (a flat "stork's nest" top when old), the Norway spruce (curtain branchlets), the spire spruce
  and frost fir (the narrow boreal spires), the larch. Dead lower branches under the crown hung
  with moss (temperate) or beard lichen (boreal); snow on the upper side of the high crowns.
- **broad**: the moss maple (the Hoh's bigleaf: wide gnarled boughs mossed on top and hung with
  curtains of moss), the blue beech (ref 18), the mountain maple, the grey alder, the rowan.
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

## Lessons this build cost
(see the end of this file)
