# Krator biome kit — Xanadu, the East Rift Highlands (Sep 2026)

> In Xanadu did Kubla Khan / A stately pleasure-dome decree: / Where Alph, the sacred river, ran

## What this is
The highlands the Rift kit's notes promised as their own kit: the Vale of Xanadu, an
enclosed mountain lake in the East Rift Highlands, longer east-west than north-south,
draining over a cataract off the map to the south-east, and the vale on its south shore
where the sacred river comes down from a chasm in the mountains. Oceanic and
Mediterranean at once. One ideal-type artifact, "Krator biome — Xanadu", on the same
core as the Rift (plus one additive thing, a runtime LOD) and the same host conventions (a test structure to dress,
the fields as the only way the biome learns the map).

The vibe is more poetic, and more psychedelic, than the earlier biomes. It is a
wilderness, but it grows as if somebody kept it: bonsai and topiary habits nobody
trimmed, whorled and striped bark, wood the colours of petrified wood although it is
alive, trees standing in rings like fairy circles, pairs whose boughs lace into
arches, and flowers of every colour and shape at once.

## The map (host, 45-host-stage.js)
The Vale of Xanadu scale model, read off the map image as a grid of classes (8 px cells,
5.5 m a pixel, so 44 m a cell and 6.4 x 5.6 km in all; x east, z south, origin at the
image's centre), run-length encoded into the host. Lake (north, running on off the map),
shore plain, green slopes and vale floor, the brown uplands (the promontory where the
palace and the pleasure dome will stand, the ridges round the vale, the eastern
plateau), the grey cliffs and the mountains to the south. The map's thin light-grey
lines are escarpments, not mountains: a W cell with few W neighbours takes its
neighbours' class. Heights are built from the distance to the lake (the vale climbs
5.8 m per 100 m inland), plus a relief per class (uplands +58 m; cliffs and mountains
rising with the distance into them), blurred, plus fbm texture (ridged on the
mountains). The island is found as the land not joined to the map's south edge and
made a knoll.

The sacred river is traced off the map's blue line: it rises at the chasm at the cliff
foot in the south-west, runs east along the cliff foot, turns north through the vale and
meets the lake at the dockyard. It is resampled every 20 m with a meander added, its
bed made monotone (never climbing), 34 m deep in the chasm and a few metres in the vale,
with two cascades in the chasm. The water is its own ribbon at the bed's level (foam
where it drops); the lake is a plane at y=0. The fountain at its head is a particle
system on the host, in bursts ("momently was forced").

Everything the biome knows about the map arrives through the fields (wet / upland /
flow / mist; salt is 0, the lake is fresh) plus terrainH.

## The flora (50/55/60)
Thirty-one species. Unique to the Vale:

- **Dawn redwood** — a fluted, buttressed column and tiers of copper feathers that turn
  green away from the sun (iridescent orange-green). Some stand in the lake's shallows.
- **Ginkgo** — a whorled column, ascending boughs, rosettes of little fans; one in five
  already gold.
- **Lotus trumpet** — the Rift's trumpet tree gone branching (the trumpet1 / trumpet2
  references): a fat fluted bole, arms that climb to different heights, and on every
  arm a trumpet flaring into a wide shallow cup, green inside, with a fringe of lotus
  flowers round its rim and lotus flowers in the cup; aerial roots hang from the arms.
- **Cloud pine** — a bonsai nobody trimmed: a whorled S-trunk, level boughs, a flat pad
  of needles on every tip. On the crags they lean away from the wind; on the uplands
  they also stand in rings.
- **Cushion tree** — braided stems spreading from one foot under a lumpy dome of smooth
  leafy cushions, as if clipped (the "whimsical" topiary reference).
- **Whorl olive** — a short bole wrung like a cloth, deep flutes winding round it,
  striped cream and umber (the twisted-trunk references), a silver-sage crown.
- **Agate tree** — a tall bole banded rust, ochre, violet, slate and cream like cut
  agate (the petrified-wood reference, alive), which shimmers; a vase of boughs; jade leaves.
- **Ring beech** — slender silver boles that grow in fairy circles: each leans a little
  out of its ring, its crown grows away from the lawn, one bough reaches back over it.
- **Arch hornbeam** — pairs across an alley, leaning together until the main limbs arc
  over and lace with the partner's: tunnels of vaults (the Hyrcanian path reference).
- **Wisteria tree** — two stems wound round each other, an umbrella of low boughs,
  curtains of racemes in violet, cornflower and white.
- **Persian ironwood** (Hyrcanian) — a vase of mottled stems, every spray a jewel.
- **Chestnut-leaved oak** (Hyrcanian) — the flanks' great dark-domed tree.
- **Caucasian wingnut** (Hyrcanian) — leaning over the water, hung with catkin chains.
- **Cacao** — a slim tree with the pods straight off the trunk (maroon, gold, orange).
- **Pitaya** — a fountain of three-winged stems, dragon fruit at the tips.
- **Prickly pear** — pads on pads, orange and red fruit along the top edges.
- **Bottle palm** — a swollen foot, forks, mops of drooping blades, pink plumes.
- **Desert rose** — a fat twisted caudex and ruffled flowers (red edged black, and others).
- **Haze blossom** — a gnarled umbrella wholly in blossom, now and then all violet;
  petals lying round its foot.
- **Frost willow** — silver curtains that go lavender away from the sun.
- **Traveller's palm** — a flat fan of great paddle leaves, all in one plane.
- **Violet plantain** — purple paddles, and a spike of purple bracts over yellow hands.
- **Wollemi pine** — tall multi-stemmed, dark cords, spiky cones up top.

From the Rift ridge, altered: the cloud tree-fern, the lantern tree (its lanterns now in
the psychedelic set), the fan tree as a silver fan palm (flat wheels), the barrel frill
(crowned with star flowers), the silver scrub, the frill tree as the chasm frill (a
fraction of the height, orchids on it), the beard tree (whorled, orchids in the forks)
and the anemone stalk as the serpent stalk of the dry red ground.

The floor: meadow going gold where it is dry; drifts of flowers of one two-tone pair
each (painted orchids, swirl lilies, ruffles, stars, lotus, plain blooms: the orchid,
swirl and stapelia references, coloured from `PAL.psyPair`); blood grass; pampas
plumes; box domes that look clipped; baneberry spikes (the doll's eyes); cobra lilies in
the damp; mushrooms; ferns and giant ferns; moss; iris and reeds; lotus pads and lotus
flowers on the still water; the garrigue's silver tufts and thyme; prickly-pear
seedlings; limestone; fallen trees whose wood already looks petrified. The fairy rings'
lawns carry a ring of mushrooms and a ring of flowers.

## Colour
The wood is drawn from one petrified-wood palette (`PAL.agate`) for every species. The
flowers are deliberately every colour (`PAL.psy`, and `PAL.psyPair` for the two-tone
ones; the second colour rides the iridescence hook, so a painted orchid shows its
second colour as the light moves). The lake's hue (jade here) only tinges the quiet
things: mosses, reeds, the jade second colour of some foliage; its complement is the
coral the lotus fringes lean to.

## The budget and the runtime LOD
The Rift's LOD is decided at build time round a spine of origins: full detail near it,
impostors far from it. On a map this compact with a spine this wide (the promontory, the
river from mouth to fountain, the vale, both flanks) nearly every tree came out a hero:
42M triangles, every one drawn from every camera. The core now also has a runtime LOD
(BIOME-API.md): meshes are baked per 1.2 km chunk and per range, and `BIO.lodTick(camera)`
draws a chunk only while the camera is near enough and it is in the view. Every hero
tree also gets a cheap stand-in impostor that shows only past its range. The scene holds
~22.5M triangles and draws 3–14.5M at the preset views (100–460 draw calls).

## Lessons this build cost
- A map read as a class grid is enough terrain: distance to the lake for the slope, a
  relief per class, a blur, fbm on top. The thin lines on a painted map (escarpments) are
  not regions: filter them by how many of their own class surround them.
- A river cut into a height field needs a monotone bed or it pools and climbs; build the
  bed from the terrain along the line, then clamp it never to rise.
- An fbm patch mask (mean .5, sd ~.11) cannot make groves: its range is too narrow. A
  thresholded fbm field (smooth(.45,.58,...)) shared by all the vale's species can.
- Anything that writes into a merged bucket by hand must carry its LOD key per triangle,
  or it lands in the always-drawn group (the stand-ins showed up close until it did).
- An untextured rod must take the designer's bark colour, never the texture tint (a tint
  divides by the texture's mean and turns the rod near white).
- Preset views written before the terrain exists end up inside hillsides and trunks; the
  close views are now found in the built scene (a ring, an alley, a species' nearest tree).
- verify.py needs Python Playwright; where only Node Playwright is installed, drive the
  same Chromium from Node (the ideal type loads in ~70 s under SwiftShader at q=1).

## Next
Fauna; the city on this map as its own kit, clearing its footprints through the mask;
the cataract as geometry; a second pass on the uplands (denser garrigue, terraces).
