# Krator biome kit — the eastern high desert (Sep 2026)

## What this is
The third biome on the biome-core contract (BIOME-API.md): the EASTERN HIGH DESERT master
set — red desert like the American south-west with Socotran flora — as one ideal-type
artifact, "Krator biome — the eastern high desert". Same core as the eastern abyss kit
(two additive extensions, see the API), same host conventions (Girder-quality flora, one
ruined Girder tower on the canyon's north rim for scale and for the growth-on-structures
pass).

## The map (host, 45-host-stage.js)
6.8 km across, origin at the map's centre, x east. To the west the Inner Wall mountains
rise (900 m at the edge, and on into the sky dome). To the north and south, past about
2 km, the trackless red desert: dune fields where nothing roots. The main body is red
desert — scrub in stands, badland patches with hoodoos and stepped terraces, ten mesas
and buttes of the Wile E. Coyote kind. The river runs west to east through the middle in
a shallow canyon (30 m deep, ~250 m wide on the plateau, a gorge 90 m deep where it
issues from the mountains): two stepped benches down each wall, a flat gravel floor, the
channel cut a further 2.6 m; the water surface DESCENDS with the floor (`WL(x)`), which is
what the core's new `waterH` is for. The wide butte south of the river (620 m across,
135 m high) has the rain-shadow pond in a hollow on its north-western foot, 4.6 m deep,
with its oasis ring and a cracked playa rim. At x=3130 the plateau ends: the Abyss, a
cliff 740 m down to a hazed floor. The river leaves through its notch as a cataract — a
streaked curtain with sprites of mist rising at the plunge.

Everything the biome knows about the map arrives through ten climate fields (wet / flow /
upland / canyon / rim / rock / dune / oasis / slope / abyss) plus terrainH and waterH.
A world that binds those fields gets the same zoning without touching the biome.

## The water colour
One hue (`SEDESERT_WATER.hue`, a wadi-pool teal here) drives the river, the pond, the
cataract, the reed accents, the twist-candles' tint, and every bloom (the complement:
the desert rose's pink). Change the hue and those follow; the red desert stays red.

## The flora (50/55/60)
Thirteen tree-scale species: the dragon tree (a pale bole, an umbrella of dichotomous
forks, dense sword-leaf tufts, resin bleeding on the bark) wherever the water table
allows — the canyon rim and benches, the pond, the mountain-foot seeps; the giant
candelabra (a ribbed trunk, arms, and a dome of a hundred ribbed columns, 22–44 m) and
the cardon (a woody trunk and a vase of thick blue-grey columns) in stands across the
scrub with the Joshua tree; the bottle tree (a swollen spiny bottle, strap tufts, pink
blooms) and the boojum (a bristled tapering pole with a yellow plume) on the harder
ground; the quiver tree (gold peeling bark, a dome of forks, fat aloe rosettes) on the
rocky slopes under the Wall; the mesquite, one species that reads `wet` for its size —
16 m and pod-hung on the banks, a 4 m multi-stemmed shrub 500 m out; the wadi palm on
the floor and at the pond; the desert rose on the walls and the rock; the giant puya
and the mountain agave with their flower spikes; and the twist-candles, three-lobed
pastel columns twisting up out of the shallows with small mint ones glowing at their
feet — the one alien note. The floor by zone: spinifex hummocks on the red soil (the
character of the scrub), dry grass, creosote and saltbush, stands of the tower of
jewels, agaves, barrel cacti, prickly pear, cholla, hoodia in pink flower; hoodoos and
rubble in the badlands; reeds and sedge at the water, bleached fallen mesquites on the
canyon floor; grey scree on the mountain slopes. And the first FAUNA layer on the contract (75): desert kites in thermals over the high
ground, wadi swifts over the water, sand striders pacing the canyon floor in bands, rock
lizards on the boulders -- the moving kinds are dynamic instanced meshes the biome drives
itself through one BIO.tick.

## Lessons this build cost
- A river that descends cannot live on a water plane: the water level is a function of
  x, the biome reads depth through `BIO.depth`, and the host's mask, the shallows passes
  and the reed grids all go through it. The pond has its own level (the ground at its
  centre + 4.6 m).
- The canyon floor must be flat ACROSS the canyon relative to the water, or the floor's
  undulation puts the riparian floor under the river in places: the undulation is
  multiplied by (1 − wall) and the floor is mixed toward `floorC(x)`.
- The climate fields cost several terrainH calls each; cached at 19 m and the slope
  taken from the cached heights, not from finite differences of live calls.
- The Inner Wall is in the west and the gas giant in the north-east, so the abyss kit's
  overlay dome (the wall in front of the giant) is not needed here; 16 MB of texture saved.

## The quality pass (Sep 2026)
Four reviews (reuse, simplification, efficiency, altitude) over the kit, applied: the
merged buckets and instance stores are typed and growable (half the build was JS array
pushes), terrain and the field cache are memoised one point deep, the colour maths moved
into the core (BIO.col), the impostors are species data, the species passes are a table,
blooms / leaf colours / registration / ring scatter are one helper each, the host's wall,
Abyss and tower maths are defined once, the camera's five map sweeps are one, and the
world's register / lod / windows are host hooks instead of numbers in the biome.

## The undercut lip (Oct 2026)

The cataract used to leave the river ribbon 30 m out over the Abyss: the face below the
plateau's edge is ~8:1, and a curtain falling from the edge itself runs 2-3 m inside the rock
for most of its 700 m. A carve patch only takes rock away, so the lip first had to come out:
the canyon floor runs on as a sheer promontory (`lipD`, a rounded box, its front 1-3 m behind
the fall's start), then the cave is carved under its cap. Lessons:
- **The ground's cell sets the patch's pad.** The ground here is 17.8 m; the window round the
  lip is split 12 ways (1.5 m), or the 3 m sheer faces and the recess are not resolved.
- **A wide margin duplicates whatever face is beside the patch.** At 21 m the patch's rock
  covered the Abyss face beside the promontory, where 1.5 m ground cells cannot match its
  exact surface: cross-hatching. The recess now climbs at 12:1, so the margin is 10 m.
- **Take the ground's own rock weight.** Forcing a patch's steep faces to the strata showed a
  seam against the painted Abyss wall below it.

## The candles' impostor (Oct 2026)

The twist-candles were the one species with no far form: past the mid radius (1.3 km for the
small species) a clump was simply not placed. This host's spine runs the river, so no candle
gets that far here (176 clumps, all heroes, none 500 m from it); a world whose spine sits
elsewhere lost its candles at range. A blob on a pole reads neither the habit nor the water,
so `far:{spires:n}` is a second impostor kind (`spiresOf` / `farSpires` in 55):
- **The habit.** n spires set out as the hero sets its columns (the main one at the clump's
  foot, the rest round it, the same height and width draws), each three-sided with its corners
  on the lobes, turning 1.2 rad over the height as the hero's lobes do: 9 triangles, ~25 a clump.
- **The water.** A spire stands where the hero's column does: rooted in the bed, its top at the
  bed + h, so what shows above `BIO.waterH` (the local level: the river descends, the pond has
  its own) is the hero's. The water decides what is built: a spire it drowns, or that shows
  less than 0.8 m over the water and the ground, is not. A first version footed the spires
  half a metre under the water to save the hidden part; that saves no triangles (a spire is
  9 whatever its length) and floats them wherever a host draws its water clear, or (here, see
  KNOWN_ISSUES) not at all. The foot has a 1.5 m skirt, because a host draws its ground coarser
  than terrainH (the 17.8 m triangles here dip up to ~1.5 m under it on the channel's banks).
- **Its own hash.** The draws come from the tree's seed, not the biome's stream, so a far clump
  moves nothing else, and `SEDESERT.spiresOf(T)` is the layout as data: the probe lays it out
  for every clump, heroes included, and checks it against the ground as drawn.

Tested on a copy of the page with the spine cut to the pond: 72 of 139 clumps are impostors
(182 spires, +1,638 triangles), no foot over the drawn ground, every top at least 0.88 m
clear of the water and the ground. From the floor at x = -1244 the old page shows no candles
down the river, the new one a clump of spires 26 m off and more beyond it; from the north
rim across the mid radius (x = -905) the candles run on past it.

## Next
The Inner Wall's foothills proper (the slope's top is only
sketched here — it is meant to be its own kit); drop an Ancients kit megastructure onto
the canyon floor through `dress()`; the abyssal floor seen from the rim.
