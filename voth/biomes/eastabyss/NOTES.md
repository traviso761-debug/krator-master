# Krator biome kit — the eastern abyss (Sep 2026)

## What this is
The second biome on the biome-core contract (BIOME-API.md): the EASTERN ABYSS master set —
salt flats, salt marsh and the abyssal forest / hypertropic jungle — as one ideal-type
artifact, "Krator biome — the eastern abyss". Same core as the central hyperjungle kit
(three additive extensions, see the API), same host conventions (Girder-quality flora,
one ruined Girder tower in the jungle strip for scale and for the growth-on-structures pass).

## The map (host, 45-host-stage.js)
6.8 km across, origin at the lake's centre, x east. The basin floor is a metre or two
above a water plane at y=0; the lake, the marsh pools and the basin reaches of both rivers
are simply where the floor dips under it. West of the lake: the salt flats, bare crust
with the west river crossing them (jade and rosettes along it, nothing else). East: the
marsh (knee-trees with beard moss, palmettos, reed beds, pools), the rain picking up
eastward, then the slope (70 m over the jungle strip, 190 m at the savannah) up to the
shelf. One gradient, dry to wet, west to east. Both rivers end in deltas. The sky
is the Krator dome with the abyssal shelf ringing the horizon, close and 15° high in the
east, a haze line elsewhere; sun WNW, gas giant NE as canon.

Everything the biome knows about the map arrives through four climate fields
(wet / salt / upland / flow) plus terrainH. A world that binds those fields gets the same
zoning without touching the biome.

## The lake colour
One hue (`EASTABYSS_LAKE.hue`, red here) drives the water, the crust's tinge, the samphire
and the red reed stands, the lily pads and every bloom (the complement), and the mosses'
tinge. Change the hue and the whole biome follows; the Vain fronds stay purple.

## The flora (50/55/60)
Fourteen tree species: two scale-trees (the sky scale-tree at 100–124 m, topping out at
about 80% of a Girder tower, its bark shimmering red-green with the view angle; the fork
scale-tree at 52–80 m), the bell-bark (a cauliflorous broadleaf canopy tree), crown ferns,
salt cycads, pipe reeds (giant horsetails), marsh knee-trees with beard moss and knees,
stilt-woods and tide lycopsids (scale-barked, on prop roots, long fronds drooping low)
standing in the shallows, fan palmettos, Sanfordacaulis (a pole with a ball of fine twigs,
mint and lavender) on wet ground, Calamophyton palms (leafless forking twig-fronds) on the
arid river banks, shelf umbrella-trees, and the jade shrub on the flats' river. Beard moss
hangs from any bough in proportion to the wet field. All the jungle species flower,
straight off the bark. The floor by zone: samphire / salt grass / rosettes on the flats,
reed beds / sedge / marsh shrub in the marsh, lily pads on still water, a three-colour
club-moss carpet + giant ferns + fallen scale-trees in the jungle, dry grass + Vain fronds
+ frond shrubs on the savannah. Fauna deferred, as for the hyperjungle.

## Lessons this build cost
- Near-grey bark canvases tinted from SPECIES.bark work (the hyperjungle's open issue);
  but a designer's bark colour renders ~2x brighter under the sun+hemisphere rig, so the
  palette has to be written a stop dark.
- A marsh must sit above the water plane except in its pools, or the whole west reads as
  lake. Base 1.4 m, pools -3.2 m, checked with an --eval profile along z=0.
- Register a tree by its real spread (fork tips), not its nominal crownR, or the probe
  finds "empty" volumes for trees whose crowns are all outside the cylinder.
- Water ripples in the fragment shader alias into a moiré past ~300 m; fade them by range.
- SwiftShader takes ~2.5 min per screenshot at 7M tris. Six views per run.
- A lathe bole must be closed with a near-zero ring or it is an open pipe from above --
  "the tops of the trees don't render". Every bole here ends in a dome ring.
- A painted sky dome cannot stand in front of real geometry (the gas giant). The shelf
  is painted twice: on the dome, and on a transparent overlay dome drawn after the giant.
- The inspector must prefer a plant's own item label; a map-wide registered volume
  otherwise swallows every click.

## Next
Fauna against this contract; the abyssal savannah proper (the slope's top is only sketched
here), Yuni Valley, highlands, arctic; drop an Ancients kit megastructure into the marsh
through `dress()`.
