# Krator biome kit — the southwestern lowlands (Sep 2026)

## What this is
The third biome on the biome-core contract (BIOME-API.md), and the first that is not
abyssal: the SOUTHWESTERN LOWLANDS master set, one ideal-type artifact, "Krator
Southwestern Lowlands". It covers the shore of the inland sea, a brief strip of rainforest
and bayou, a broad humid-subtropical plain, and Mediterranean hills. The core is the
eastern abyss kit's, unchanged. The host conventions are the same: Girder-quality flora,
one ruined Girder tower (in the oak plain) for scale and for the growth-on-structures pass.

## The brief
A more terrestrial country than the hyperjungle or the abyss, inspired first by the US
South. It becomes Californian toward the hills, with admixtures from the rest of the
tropical Americas. It must still read as not-Earth, in two ways:
1. WIDTH. The mature trees make you small by being wide rather than tall. A sprawl oak is
   16–26 m high and up to ~80 m across. A pillar fig is a grove on one bole. The parasol
   kapok carries a 60–80 m flat crown at two thirds of its height.
2. BARK. Brown, pale and blood red, in many shades and finishes (see the bark table in
   BIOME-API.md). That is fifteen looks, each one draw call, each carrying a second
   colour through a mask.

The reference boards (the user's photos and the climate/sw folder) that shaped
particular choices:
- Angel Oak and the Charleston live oaks: the limb that rests on the ground and rises again.
- A banyan: limbs across the ground, pillar roots.
- Manzanita in two lights, charred black over red and red under bright leaves.
- Madrone, and rainbow and red-and-white gums: the flayed and striped barks.
- Paperbark cherry: ringbark.
- Lipstick palm: the cane palm.
- Cork oak: its stripped foot is raw orange-red.
- Cedar of Lebanon: the tier cedar.
- A pale tree with gold-cracked bark and crimson cloud-pads: the crimson ghost.
- The carved ring-patterned trunks: the eyed beech.
- A mimosa with hanging red pods: the rattle-pod.
- The red-pompom cycad.
- Okefenokee and Caddo Lake: cypress with Spanish moss, lily pads, duckweed.
- Pine flatwoods over saw palmetto.
- The LA chaparral: yucca stalks and red scrub.
- Mediterranean gardens: poppies, salvia, mullein, feather grass, aloes, pincushions.
- The staghorn fern and the forking fern.

## The map (host, 45-host-stage.js)
6 km across, origin mid-lowland, x east. One axis does the work. s runs NW -> SE:
- s < ~-1900: the sea, on a sandy shelf; the shore has coves and a delta bulge.
- to ~-1150: the rainforest strip. The mangroves stand in the brackish shallows. Bayou
  pools and sloughs lie just above the water plane.
- to ~+700: the subtropical plain rises gently, with oxbow ponds by the river.
- beyond: the hills climb 60–150 m, cut by the river's valley.
One river comes down from the SE hills and reaches the sea through a delta. The river
is a ribbon where its bed stands above the water plane, and the plane itself below.
We are in Krator's SW quadrant. The Inner Wall stands on the NE horizon (5.5°) and the
Outer Wall on the SW (8.5°). Each sinks to the horizon toward the NW (the open sea) and
the SE, because both run parallel to the lowlands. The sun is WNW over the sea. The gas
giant sits NE (canon), over the Inner Wall and clear of it.

Everything the biome knows about the map arrives through six fields: wet, tropic, dry,
salt, flow and upland, plus terrainH. Köppen maps onto them directly: Af is
tropic+wet, Cfa is neither tropic nor dry, and Csb is dry.

## The flora (50/55/60)
Twenty-seven tree species, tagged, zoned from the fields (the table is in BIOME-API.md).
Most of them share one idea, the LIMB (`limbPts`). A limb is a sinuous tube that sags with
distance, can rise at its end, and RESTS on the ground where it meets it. The crown is
carried on short secondaries along the limbs, so a crown is as wide as its limbs are long.
The species in brief:
- Kapok: plank buttresses, spines, and a flat two-tier parasol with bromeliads.
- Fig: a fluted fused bole; thick and thin pillar roots drop from its limbs.
- Mangrove: a cage of arching lacquer-red prop roots.
- Cypress: a flared foot in the pools, knees, and heavy Spanish moss.
- Willow: curtains of hanging strands almost to the ground, a few of them golden.
- Tier cedar and crimson ghost: level limbs in tiers carrying flat pads.
- Cane palm: a clump of ringed stems, yellow below and lipstick-red at the crownshaft.
- Skirt palm: short, with a skirt of dead leaves and wide drooping fans; a quarter of
  them are silver-blue.

Floor by zone:
- Rainforest: elephant ears, heliconias, forking ferns, bromeliads, young cane palms.
- Bayou: palmetto, flag iris, ferns. Its water carries lily-pad carpets, hyacinth and
  duckweed.
- Plain: grass glades, a palmetto carpet under the pines, azaleas in flower, leaf litter.
- Hills: chaparral patches through golden grass, plus the garden set of poppy, lupin,
  salvia, mullein, feather grass, agave, aloe, pincushion and yucca.
Fauna deferred, as for the other kits.

## Second pass (the avenue)
- The sprawl oak got taller (22–30 m) and got the VAULT habit: `archPts` limbs, described
  by reach, peak and end height. They climb steeply, arch over at 40–55% of their reach
  and come down at the tips. Sweeping ground-resting limbs and upright leaders complete
  the crown.
- Foliage sits ON branches. `crownOn` puts a clump's centre within a third of its size of
  a real branch point, and `twigs` sprouts short tips for more to carry. Every crown top
  that had no branch under it gets a `leader`: fig, cypress, mangrove, madrone/sycamore,
  cork oak. Before this, several species hung their top clumps in the air.
- The host's oak avenue: a dirt road across the plain toward the tower, with 48 oaks
  planted by the biome (`avenues`). The road is its own ribbon mesh laid on the RENDERED
  ground (`meshH`). The ground mesh's 16 m cells ride over terrainH between vertices and
  swallowed a road laid on terrainH.
- Cork: only the harvested grove (`groves`, on the first hill slopes) is stripped to raw
  red-orange. Wild cork oaks keep their cork.
- Spanish moss was cut back and greyed. At full strength the curtains hid the limbs,
  which are what the avenue is for.

## Third pass (flowering, stocking)
- No cauliflory. The only flower-like things on bark were the perched bromeliads, which
  I had coloured in the heliconia reds; they read as flowers growing out of the trunks.
  They are grey-green now, and the oaks carry resurrection fern only.
- Three crown-flowering species were added. The flame parasol (royal poinciana): a
  very wide flat dome, scarlet over the top, long dark pods. The violet jacaranda: the
  same habit in lilac. The lantern magnolia: a grey column, glossy dome, big upright
  cream-white flowers at the branch ends. Their far impostors carry the flower colour.
- The showcase ceiling was raised to 10M (7.5M per pass). Tree stocking `DENS` went
  .55 -> .75 and the floor .47 -> .62; grass carpets are denser.

## Fourth pass (understorey)
- A shade layer under the crowns. The floor pass walks every near and mid tree and
  scatters plants over the ground its crown covers, clear of the bole. The count is
  scaled by crown AREA: up to 48 under a near tree, 8 under a mid one. The mix is
  heavier than the open floor's and follows the zone:
  - rainforest: elephant ears, giant and forking ferns, heliconias, shrubs, cane palms
  - bayou: palmetto, ferns, iris
  - plain: ferns, azaleas, shrubs, palmetto
  - hills: toyon-like berry shrubs, chaparral, sage, yucca
  Saplings (the next generation) grow everywhere. About 14k plants, ~1.9k of them saplings.
- Paid for from the open floor: the grass carpet was thinned and the far band thinned
  most, since it is barely seen.

## Fifth pass (quality, mass, coverage)
- The sprawl oak is ~50% more massive: 28–38 m high, boles 2.5–3.8 m, crowns 36–50 m in
  radius. It is the heaviest species (~1.0M triangles) and is still exempt from `DENS`.
- Three more trees to thicken the cover:
  - Sunburn tree (gumbo-limbo): peeling red-lacquer bark, a glossy spreading crown; warm
    subtropical plain into the rainforest edge.
  - Star gum: a tall cork-barked gum whose crown is flushed with red star-flowers; wet plain.
  - Bay laurel: a dense pale-barked dome; the hills and the dry edge of the plain.
- Magnolia flowers sit on twigs grown from the branch ends (they floated).
- Small species (manzanita, cane/skirt palms, pompom cycads, ringbark) now become 20-tri
  blob impostors beyond the detail ring instead of stopping (`buildFarSmall`).
- Softer algae on pale bark; finer willow strands; the road texture no longer stretches.
- Ceilings raised to 12M scene / 9M per pass.

## Sixth pass (runtime LOD, the impostors' bark)
- The core's runtime LOD, ported from xanadu. Every pass builds under `BIO.range`, so bake
  splits each item and bucket into one mesh per 1200 m chunk and range, and the host calls
  `BIO.lodTick(camera)` every frame. A hero tree (its foot keys all of it) is drawn within
  `SWLOW.LOD.tree` (1200 m) of its chunk and as a lite stand-in impostor past that; the
  avenue's and the grove's rows keep their full trees to 2000 m. The far trees beyond the
  spine's mid ring stay impostors only, always drawn. The floor's bands, the understorey,
  the logs and the dressing have their own ranges (BIOME-API.md). The ranges are kept to a
  few values because equal ranges share a mesh: each distinct one costs a draw call per item
  per chunk.
- The stand-ins draw no random numbers, so every hero is built exactly as before: the held
  scene grew by the stand-ins only (0.36M triangles over 6.2k heroes).
- The scene had drawn everything from every camera: the instanced items are not
  frustum-culled and every bucket's bounding sphere spans the map. Chunking gives both the
  range test and the frustum test, so even the near views draw ~40% less.
- The far impostors' trunks carry their bark: the second colour mixed in by the mean of the
  bark's mask (what the hero's texture averages to at range) and the gloss as the same sun
  highlight the bark hook adds, through `SWLOW.farMat` and the trunk's uv.x. A ribbon gum's
  stand-in is pale like the gum (it was the red of its stripes); a mangrove's shines.

## Lessons this build cost
- A two-channel canvas (relief in R, a mask in G) plus one uniform colour per bucket gives
  every bark two colours for one draw call. Normalise the relief by its own mean in the
  shader and fold the rig's 2x into a gain, and the palettes can be written as the bark
  should look.
- r128 `Texture` has no `userData`. Hang your own property on it.
- Shapes painted into a tiling canvas must take their wobble from their size, not their
  position, or the nine wrapped copies differ and the tile seams.
- Stocking must be budgeted per species, not per pass. The first full build was ~25M
  triangles and crashed the page. `trisBySpecies` in the build report is the tool:
  manzanita, cane palm and pine were cheap per tree and ruinous in count.
- A tree-spacing radius is not a floor radius. Giants keep each other apart by a share of
  their crown, but the floor asks only about the bole (`SWLOW.blocked` vs `blockedGround`),
  or nothing grows under an oak.
- Preset views are FOUND (`viewTree`): the nearest near-detail tree of a species, framed
  from the sun side. Placement changes never strand a view on empty ground.
- The pip Playwright here was newer than the sandbox's Chromium. `verify.py` now takes
  `KRATOR_CHROME=<path>` for an installed browser (unset, it behaves as before).

## Next
Fauna against this contract. The Inner Wall's foot and the lowlands' SE continuation.
A richer shore (dunes, a salt marsh on the delta's fringe). The hills rising into whatever
lies under the Outer Wall. Drop an Ancients kit megastructure into the oak plain through
`dress()`.
