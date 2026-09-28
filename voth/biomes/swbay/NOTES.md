# Krator biome kit — the southwest bay (Sep 2026)

## What this is
The third biome on the biome-core contract (BIOME-API.md): the SOUTHWEST BAY of the
inner crater — the relatively drier part of it — as one ideal-type artifact, "Krator
biome — the southwest bay". A small bay in the SW, the volcano to the NE; the bay ringed
by a hyperjungle of its own kind and by tropical rainforest, and as the ground rises to
the highlands, quickly, the parasol savannah. Same core as the eastern abyss kit
(unchanged), same host conventions (Girder-quality flora, one ruined Girder tower in the
jungle ring for scale and for the growth-on-structures pass).

## The map (host, 45-host-stage.js)
5 km across, the map's centre 400 m NE of the bay's NE shore; x east, z south. The bay is
an inlet in the SW quadrant, open toward the SW edge; the ground round it is a metre or
two above a water plane at y=0. From the shore: 0–600 m the bay jungle, 500–1300 m the
rainforest as the rise begins, 1200 m+ the savannah where the rise steepens (24 m over
the jungle, 120 m over the rainforest, 250 m at the far highlands, tilted up toward the
NE). One river comes down from the NE highlands into the bay's NE shore through a small
delta. Beyond the map a coarse FAR COUNTRY mesh (18 km, 100 m cells) carries what the
edge would cut off: the volcano 8 km NE of the bay (a 1.9 km concave-flanked cone with a
notched summit, a parasitic cone, ash gullies, a plume of soft globes leaning east), the
crater rim ringing the horizon at ~7 km, and the water the bay opens into in the SW. Inside
the map it duplicates terrainH two metres down. Nothing is painted in front of the gas
giant any more. Sun WNW, gas giant NE as canon.

Everything the biome knows about the map arrives through the four climate fields
(wet / salt / upland / flow) plus terrainH.

On the slope the river's bed climbs in five-metre steps, so the cataracts fall. A ruined
stone jetty runs 150 m out from the bay's NE shore, the second structure the dress pass
grows on.

## The vibe
A variation of the established hyperjungle, but not as tall: the tallest trees top out
at the height of the Voth temple (`SWBAY_TEMPLE_H`, 110 m placeholder — the canon figure
is not in this kit). The baobabs and the prism gums of the megaflora belt are still seen,
scaled to that ceiling; the rest of the flora is new and FUNGOID: giant mushrooms as
canopy trees, and trees and shrubs whose foliage is a splay of wide fronds. Epiphytes are
everywhere and trend to red and purple. On the savannah the parasol theme: parasol
mushrooms, umbrella monkey puzzles, dragon trees, baobabs in avenues.

## The flora (50/55/60)
Thirteen tree species:
- Prism gum (84–110 m, the ceiling): fluted bole in shed strips cycling through six bark
  colours; long near-level boughs; iridescent lance-leaf fans (green to the sun, violet
  away from it); epiphyte rosettes up the bole.
- Gate baobab (46–76 m): bottle bole, the crown is the top, palmate leaves, hanging pods.
  At the jungle's edge and in stands and avenues across the savannah.
- Cap-tree (30–62 m): a giant mushroom. Pale stipe with an annulus skirt, a domed cap in
  ochre / rust / amber / wine with cream warts (the cap texture), gills under it (a
  radial texture on an inverted cone), a tiered variant with a shelf lower down, epiphyte
  chains hanging off the rim, a ring of mushrooms at the foot.
- Fan-crown (36–66 m): a pale bole, thick boughs rising steeply, each opening into a
  splayed fan of huge paddle fronds (the wide-frond geometry + the veined paddle texture);
  the most epiphyte-laden tree here.
- Umbrella monkey puzzle (18–42 m): a long scaly bole and a PARASOL on top: eleven to
  fifteen long near-level branches curving up into a rim, their foliage filled into one flat disc;
  two or three drooping whorls of six to eight below it, dead stubs under those.
- Dragon tree (7–18 m): fat pale trunk forking twice, every tip a head of stiff
  blue-green sword leaves, the whole a flat umbrella.
- Parasol mushroom (4–14 m): one instanced parasol, a ring of young ones round it.
- Crown fern (10–26 m): the eastern abyss's tree fern, in the rainforest and along the river.
- Splay shrub (2.5–7 m): a stub trunk and a splayed rosette of upright paddle fronds.
- Ironbark (70–102 m, the hyperjungle's, scaled to the ceiling): fluted buttressed bole in
  furrowed red-brown bark, surface roots off every buttress, level tiers of boughs with
  drooping tips, a top tuft, combed needle sprays. In stands with the prism gums.
- Bracket tree (12–30 m): a dark dead-looking bole carrying tiers of huge half-disc shelf
  fungi (a lathe whose radius collapses to the trunk on the back side), a few leaves left
  at the top, epiphyte chains off the shelves. On the wet slope and along the river.
- Coral fungus (1.5–4.5 m): a shrub of forking fleshy branches in orange, pink and violet,
  paler at the tips. In the jungle's shade.
- Umbrella thorn (6–15 m): a short gnarled trunk, crooked boughs rising and flattening out,
  one wide flat crown of fine leaflets. The savannah's other parasol.
Epiphytes (red and purple rosettes clinging to the bark, hanging fleshy chains with
flower spikes, blooms in the axils) go on every bole and bough in proportion to `wet`.
The floor by zone: ferns, giant ferns, splay-lets, mushroom troops in patches, moss and
club-moss, fallen blooms, mossed logs with brackets and mushrooms in the jungle; the same
greener in the rainforest; dry grass, small parasols and FAIRY RINGS, dragon saplings,
rosettes, puffballs, termite mounds and lava boulders on the savannah; reeds in the bay's
own blue-green on the shore. Fauna deferred, as before.

## The fauna (75)
The first fauna on the contract, three kinds, all alive and all cheap (one draw call each,
a few hundred matrix writes a frame, ~6k triangles): BAY SOARERS wheeling in loops over
the water on broad wings (ten flocks), CANOPY DARTERS flickering in tight loops round the
crowns (fourteen flocks), one HERD of plains grazers wandering the savannah (a centre on a
random walk, the animals in a loose ring, turning back at the savannah's edge and away
from trunks) with one or two SAVANNAH STALKERS trailing it ninety metres back, pods of BAY
SWIMMERS cruising the deep water in slow arcs with their backs and fins breaking the
surface, and BLOOM GLINTS, swarms of insects as Points orbiting under the epiphyte-laden
crowns; SAVANNAH GLIDERS in wide slow circles in the thermals, barely a wingbeat; CAP MOTHS
in tight clouds under the cap-trees. The soarers' loops are set above the canopy under them
and above anything the host registered (the tower, the jetty); the darters' loops sit
beside their bole. Through the host's optional `eye` hook the fauna leaves everything
beyond 1.6 km of the viewer alone. Wing-beats
and leg-swings are done in the vertex shader from a per-instance phase; the meshes are
the biome's own (added to the host's scene, ticked through BIO.host.ticks), not baked.
`SWBAY.build({fauna:false})` leaves them out. Species carry the same tags plus `diet`.

## Lessons this build cost
- A river that only slopes is a ribbon; step the BED (treads and risers) and the same
  ribbon becomes a staircase of pools and falls without any new geometry.
- A line comment appended to a minified line eats the code after it; use block comments
  inside one-line builders.
- A river ribbon reads as a river only where it is white: foam cards on the steep reaches
  (a streaky alpha canvas scrolling downstream) are what make the descent a cataract.
- Animated instances need their phase as a per-instance ATTRIBUTE; deriving it from the
  instance position (the wind hook's trick) jitters as soon as the instance moves.
- A parasol crown reads as one when the branches are level and the foliage is filled in
  BETWEEN them into a disc; whorled tiers of tufts read as a conifer whatever the top does.
- A cap is two lathes: the dome (rings rising, radius shrinking to a near-zero ring) and
  the gills (rings falling inward). The lathe's normals follow the ring order, and the
  Lambert bucket is double-sided, so both light correctly from below without a flip.
- The gill texture must be coarse (a stripe every 4 px, 2–6 repeats round the cap) or it
  aliases to grey at fifty metres.
- The wide frond needs its own geometry: the core's frond is a fern (16% blade); a paddle
  is 50% and arches less.
- A far mesh that duplicates the near one must sit BELOW it (2 m here) and rise to meet
  it only in a band at the edge, or the coarse one z-fights through the fine one.
- The verify harness needs the browser Playwright is pinned to; `VERIFY_CHROME` lets it
  launch whichever Chromium is installed.

## Next
More fauna (fish under the surface, something that climbs the boles); a road up the volcano's flank; the canon
temple height; Yuni Valley, highlands, arctic.
