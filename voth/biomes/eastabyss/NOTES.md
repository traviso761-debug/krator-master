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
Twenty-one species (fourteen from the first pass, seven from the coal-swamp pass, below): two scale-trees (the sky scale-tree at 100–124 m, topping out at
about 80% of a Girder tower, its bark shimmering red-green with the view angle; the fork
scale-tree at 52–80 m), the bell-bark (a cauliflorous broadleaf canopy tree), crown ferns,
salt cycads, pipe reeds (giant horsetails), marsh knee-trees with beard moss and knees,
stilt-woods and tide lycopsids (scale-barked, on prop roots, long fronds drooping low)
standing in the shallows, fan palmettos, Sanfordacaulis (a pole with a ball of fine twigs,
mint and lavender) on wet ground, Calamophyton palms (leafless forking twig-fronds) on the
arid river banks, shelf umbrella-trees, and the jade shrub on the flats' river. Beard moss
hangs from any bough in proportion to the wet field.

The second pass (Sep 2026, from the reference plates: Carboniferous coal-swamp
reconstructions, salt-marsh and wetland aerials, a live oak in Spanish moss, monkey
puzzles) added: the SEAL-TREE (Sigillaria: a fluted unbranched pole, leaf scars in
vertical rows on its own bark kind, a pompom of grass-leaves with a hanging skirt,
cones under it, one dichotomy at most) in the wet marsh and the lower jungle; the
STRAP CORDAITE (a slender leaning trunk, rising boughs each ending in a tuft of
metre-long strap leaves, catkins, prop roots when it stands at the water) at the
shore and up the rivers; the SEED FERN (Medullosa: a stout trunk, a handful of huge
round-pinnuled fronds, seeds big as eggs) under the jungle canopy; the ROPE ARAUCARIA
(the monkey-puzzle habit: a ringed trunk and tiers of rope-like branches sheathed in
scale leaves, one instanced 'rope' per branch) on the upper slope; the BEARD OAK (a
short leaning bole, huge sagging boughs held out of the mud, dense small dark leaves,
beards, moss and resurrection ferns along every limb) on the marsh hummocks -- a noise
field, `EASTABYSS.hummock`, the seal-trees avoid; the WATER PALM (stemless, a rhizome at
the water line, feather fronds rising steeply) in the shallows; and the MAT REED, a
totora-type bulrush in pure beds of 7-18 m on still shallow water, stems 3-5 m all of a
height -- the reed one cuts for mats, thatch and boats. The beds are laid by their own
pass (`EASTABYSS.buildReedBeds`, charged to `abyss/reeds`), exported in
`EASTABYSS.REEDBEDS` and registered, so a world can site a reed-cutters' camp on one.
The big boles now carry epiphyte ferns where it is wet, lianas hang from the canopy,
the marsh floor has cordgrass meadows (a noise field), and the still water carries
rafts of floating leaves with the odd water hyacinth where the raft field says so. All the jungle species flower,
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
- A branch that is one instanced tube (the araucaria's rope) costs ~100 tris and
  reads better than a chain of beams; the droop is baked into the geometry and the
  tier's pitch is the only thing that varies. Cheap enough to give every tree 40.
- A bough on a low tree must be clamped above the ground along its whole length
  (the beard oak's sag), or half of it lies in the mud.
- verify.py needs a local three.min.js (not committed) beside it and, on a machine
  with a preinstalled Chromium, `CHROME_PATH` pointing at the binary.

## Next
Fauna against this contract; a reed-cutters' camp on a `REEDBEDS` bank (Ancients or
Girder kit); the abyssal savannah proper (the slope's top is only sketched
here), Yuni Valley, highlands, arctic; drop an Ancients kit megastructure into the marsh
through `dress()`.
