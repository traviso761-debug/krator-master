# Krator biome kit — the northwestern lowlands (Sep 2026)

## What this is
The fourth biome on the biome-core contract, and a sibling of the southwestern lowlands:
the same climate sequence (a brief rainforest strip at the water, a long humid-subtropical
tract, Mediterranean toward the hills), laid on the same NW->SE axis, in another quadrant
of Krator and another flora. Artifact: "Krator Northwestern Lowlands". The core is
unchanged. There is one ruined Girder tower (for scale and the dress pass) and a pale
road lined with ghost gums.

## The brief
Asian and Australian in inspiration. The player is made small by VERTICALITY:
- Heights ~1.5x the Earth kin. Meranti emergents reach 70–90 m and tower ash 80–105 m.
- Thin habits: clean boles, few low limbs, crowns high on steep limbs, spindles and
  spires. The eye is led up.
- The glow-willow is the exception: wide, weeping, and lit.
- Bamboo grows in GROVES: a sub-biome with its own floor and a hard edge, not a scatter.
- Bark from pale white to blue-grey, green-grey and blue-green, with only a little brown.
- SEA PENS for shrubs: upright feathers, clubs and whips.
- The glow-willow's hanging LANTERN BLOSSOMS light themselves.

The reference board (climate/nw, numbered by the zip's order) and the choices it shaped:
- 3, 4, 15: the glow-willow and its lanterns.
- 2, 12, 17, 25, 26: the sky-bamboo groves.
- 19: Buddha-belly bamboo.
- 7, 10: coil cane.
- 5, 14, 16: clean vertical boles.
- 13, 22: the meranti emergents.
- 20, 21, 23: birch and ghost-gum whites, and the avenue.
- 8: crag pines.
- 9, 18: blue-teal plated bark.
- 11: the sea pens.
- 1, 6, 16: lavender, teal aroids, bluebell carpets.

## The map (host, 45-host-stage.js)
6 km across, origin mid-lowland, one axis s running NW -> SE:
- s < ~-1900: the LAKE (fresh, jade over sand).
- to ~-1250: the rainforest strip, with paperbark swamps and lotus ponds.
- to ~+900: the long subtropical tract.
- beyond: Mediterranean foothills rising to ~350 m toward the Inner Wall.
One river comes down from the SE. The sky shows the Outer Wall low and far across the lake
to the NW (3°), and the Inner Wall as a jagged mountain range to the SE (16°). Both sink
toward the NE and SW, where the country is open. The gas giant stays NE (canon), clear of
the range.

## The flora
23 species (20 trees and 3 bamboos), zoned from the fields. The builders are by HABIT, not
per species:
- `column`: the gums, meranti, kauri, tower ash, birch (multi-stem), paperbark, she-oak
  (drapes), wattle (gold flowers).
- `fastigiate`: ginkgo, poplar.
- `spire`: spire cedar; needle cypress (a narrow flame); crag pine (a bare pole and flat
  pads at the top).
- `palm`, `fern`, `pandan`, `willow` (lanterns), `grasstree`, `banksia` (upright candles).
The groves: sky bamboo culms rise in tight clumps, taller in the interior than at the
rim, with the leaf mass shared at the top of each clump. Buddha-belly and coil cane fringe
the wet rims. Far off, a grove is a blob canopy. The floor:
- Sea pens everywhere.
- Rainforest: teal aroids, torch ginger, ferns.
- Plain: bluebell carpets, rhododendrons, lilies.
- Groves: litter and shoots.
- Hills: tussock, kangaroo paw, saltbush.
- The water carries lotus.
- An understorey pass under the crowns.

## Second pass (runtime LOD)
- The core's runtime LOD, ported from swlowlands (this kit is its clone). Every pass builds
  under `BIO.range`, so bake splits each item and bucket into one mesh per 1200 m chunk and
  range, and the host calls `BIO.lodTick(camera)` every frame. A hero tree (its foot keys all of
  it) is drawn within `NWLOW.LOD.tree` (1200 m) of its chunk and as a lite stand-in impostor past
  that; the ghost-gum avenue's row keeps its full trees to 2000 m. The far trees beyond the
  spine's mid ring stay impostors only, always drawn. The floor's bands, the understorey, the
  logs and the dressing have their own ranges (BIOME-API.md), kept to a few values because
  equal ranges share a mesh.
- The groves are this kit's own case. Their near and mid culms and leaf are drawn within
  `NWLOW.LOD.grove` (1200 m) by their own chunk; behind them stands one lite blob per 22 m cell
  (the far band's spacing) where a sky-bamboo clump stood, recorded while the grove was built,
  so the stand-ins draw no random numbers. A leaf-green floating canopy (the far band's look)
  read wrong from the foothills where the culms had read pale, so the stand-in runs from the
  ground to the culm tops in the culm colour with a little leaf in it.
- The stand-ins draw no random numbers (a small species' colour from its seed, a grove's from
  its cell), so every hero is built exactly as before: the held scene grew by the stand-ins
  only (0.17M). 20-triangle blobs (the 80-triangle one for crowns over 16 m) on a one-band bole.
- Measured at four presets (1280x800): drawn 9.94M in 62-64 calls at every view -> 1.2-6.4M in
  89-284 calls; 960 chunk meshes; build ~20 s either way.

## Lessons this build cost
- A pass that writes a bucket raw (`buildFar`, `buildFarSmall`, `farGrove`) must push the LOD
  key per triangle itself, or bake's grouping shifts every later triangle of that bucket.
- A stand-in must look like the thing at the distance it stands in, not like the far impostor
  of the same thing: the far band's grove blob is a canopy, but a near grove seen from 1.5 km
  is its culms.
- Stocking is set by counts, not by the budget knob. The first full build (q=.3) was
  already 10M. Bamboo at 33k culms and birch stands at 1.2k multi-stem trees were the
  weight. Groves were made rarer and their culms clumped, sharing the foliage (which is
  the cost) per clump.
- Lanterns are cheap only if their geometry is: a 10x8 lathe per lantern at ~3.6k
  lanterns was ~0.6M. They are now 7x5.
- An additive halo at full strength reads as fog in daylight. Keep it small and dim; the
  lantern itself is the light.

## Next
The Inner Wall's foothills proper (rock pillars with crag pines, as in the reference), a
night sky for the lanterns, and fauna.
