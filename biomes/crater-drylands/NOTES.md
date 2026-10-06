# Crater drylands — notes

## The brief (the owner, Oct 2026)

The two 'crater drylands' regions of the Krator Scale Model (`rmuqlfgh1u6d8`, about 53,000 km² north and west of the
Throne round the Ring Sea's west side, with the Scyvoi cultural region on its western end; and `rmuqlgonah5tp`, about
8,000 km² south of the volcano between SW Bay and the southern highlands). They border SW Bay and the savannah south of
the hyperjungle. They are the floor of the central crater in the volcano's rain shadow: about 1.9 atm, hot, dry.

**Kiln country, which is also bloom country.** What the dense air does to a desert (worked out with the owner):

- Plants lose about half the water an Earth plant would (transpiration goes as the vapour gap over the total
  pressure), so a rain shadow carries more cover than its rain suggests: a scrubland, not dunes.
- With about 0.4 atm of oxygen, dry scrub burns fast and hot. The land is shaped by fire.
- Evaporative cooling works worse and the nights stay warm: heat kills here, not thirst.
- The light is that of a 2.7x air column: a milky zenith, a white horizon, a yellow sun, soft blue shadows, distance
  fading fast, strong mirages (`biomes/WORLD.md`, "Dense air lights the world differently").

The owner's additions:

- Many species of fire-hardened succulents and other plants that bloom and sprout in a frenzy after a wildfire. **The
  post-fire tracts are the ones most bursting with life.**
- Trees that have evolved long trunks to keep their foliage above the flames.
- The **frill-tree** explodes in a fire and throws its fireproof seed far and wide.
- A **prism mallee**: a much smaller relative of the hyperjungle's prism gum, iridescent green, orange and red.
- Fire is an environmental hazard. The **Scyvoi**, human riders of theropod-like lizards, do not overheat easily. They
  live on the rocky outcrops, come down to reap what blossoms after a fire, and the most daring use the flames to trap
  game.

The owner's reference images (19, in the chat of 2026-10-05): a painting of banded frond pillars, chaparral with yucca,
an orange pincushion tree, an iridescent selaginella, propeller crassula, a red jade tree, a fire lily on char,
celosia, fireweed in two burns, a tree aloe, a eucalypt, stone pines with broom, a fresh burn among boulders, a king
protea, a silversword, two superblooms (lupine; poppies under a Joshua tree). Three are kept in `reference/`
(`VISUAL-BAR.md`): the painting, the poppy bloom, the fresh burn.

## How the references became species

| reference | what it gave |
|---|---|
| the painting (banded frond pillars) | the **pyre pillar**: a banded teal and gold column plumed with stiff feather fronds |
| prism gum (the hyperjungle) | the **prism mallee**: multi-stemmed from a lignotuber, strip bark, lance leaves green to orange-red |
| chaparral with yucca (Angeles NF) | the chaparral, the yucca, the red buckwheat |
| orange pincushion tree | the **pincushion tree** (the ember crown's builder, recoloured) |
| iridescent selaginella | the **prism fern** in the kopjes' clefts and the washes' shade (iridescent: blue-violet to copper) |
| propeller crassula | the crassula clumps on the granite |
| red jade tree | the **ember jade** on the kopjes |
| fire lily on char | the fire lilies flowering in the char |
| celosia | the **flame plume** drifts in the bloom |
| fireweed (two) | the fireweed drifts; charred snags standing in the bloom |
| tree aloe | the **tree aloe** with its orange candles |
| eucalypt | the **ghost gum** along the washes, with epicormic shoots after a fire |
| stone pine with broom | the **parasol pine** (a long bare trunk, the crown above the flames) and the ash broom |
| fresh burn among boulders | the char stage: black ground, grey ash, charred shrubs, boulders |
| king protea | the crater protea in the regrowth |
| silversword | the **sword spire**: a silver rosette that flowers once, in the bloom after a fire |
| superblooms (lupine; poppies and Joshua tree) | the bloom's drifts, one colour each; the **Joshua tree** |

## The fire mosaic

`52-biome-craterdry-fire.js` makes the land: fifteen fires over about fifty years, oldest first, each a shortest-time
spread on a 20 m grid (wind from the Throne, uphill faster, no fire over bare granite, little over wash sand, and none
through ground burnt in the last year). Each fire stops where the fresh burns before it stop it, so the burns tile the
map in patches of different ages. The stages the kit draws:

| stage | age | what stands there |
|---|---|---|
| char | under ~half a year | black ground and grey ash, charred shrub skeletons, burnt stubble, black logs; fire lilies flowering; the mallees' dead stems with red shoots at their root crowns; the frill-trees burst; the survivors charred below the flame height |
| bloom | half a year to ~2.5 | drifts of fireweed, ash poppies, lupine, goldfields and flame plumes over a green flush; the sword spires in flower; the frill-trees' seedlings in rings round their snags; epicormic shoots on the ghost gums |
| regrowth | ~2.5 to ~7 | young chaparral, ash broom in flower, proteas, red buckwheat, bunchgrass; the mallees growing back |
| old scrub | older | dense old chaparral, straw grass, litter and silver dead wood: the fuel of the next fire |

The kopjes (granite tors) and the washes are the refuges the fires go round: the probe checks that no kopje summit ever
burned. `CRATERDRY.frontAt(x,z)` is the newest fire's arrival-time map, 0 at its ignition to 1 at its last cell: the
data a live fire effect would sweep through (see "A live fire", below).

## The showcase

One 5.2 km disc of the crater floor (`45-host-stage.js`): red-soil plain with low swells, eight granite kopjes (the
biggest, at -700,-260, is the Scyvoi Rock), two dry washes, a seep at the Scyvoi Rock's foot. The host lights the last
six fires where cameras can reach them (`FIRES`: three weeks, five months, a year, two years, three and a half, five and
a half); the kit lights nine older ones at random. The sky (`82-host-sky.js`) carries the dense-air light: a milky
zenith, a white horizon, a yellow sun, the Throne far in the south-south-east, the Ring Sea's silver line, a far
wildfire's smoke. The light itself is the stage's: a warm key, a strong blue hemisphere fill, a pale haze.

## Acceptance frames (`VISUAL-BAR.md`)

- Ground level: **The bloom** (against `reference/bloom-joshua-poppies.webp`).
- Vista: **The mosaic from above**.

`python3 verify.py dist/crater-drylands.html --assert --views "The bloom|The mosaic from above"`.

## The live fire (built 2026-10-06)

The owner asked for an atmosphere effect that leaves a trail of devastation behind it. Light a fire anywhere (F, then
click the ground; or the view "A wildfire running", which lights one four minutes in and frames its head):

- **The data** (52, [G data]): `CRATERDRY.fireRun({x, z, wind})` spreads one fire now by the history's own rule through
  the fuel the history left. Ground burnt in the last year will not carry it; bare granite, wash sand and the seep stop
  it. Every 20 m cell gets an arrival time in seconds (`FIRE_SEC` turns the model's units into a front of about 2 m/s
  downwind in old scrub, a crawl into the wind).
- **The look** (89, the shader text [G shader], the rest [web]): the arrival map is a half-float texture (R the
  arrival, G the ground's height) every patched shader reads with the fire's clock. The ground (84) shows a broken band
  of burning fuel at the front, char spreading behind it, embers smouldering for a few minutes. Every plant material is
  patched over its own hook: foliage below the flame height (`CRATERDRY.FLAME_H`, 12 m) glows, blackens and burns away,
  crowns above it scorch brown and survive (the parasol pines, the ghost gums, the pillars' upper fronds), trunks and
  stems blacken. Flame tongues (instanced quads, two or three to a burning cell) stand along the front, smoke columns
  rise and lean downwind, a warm point light follows the head of the fire.
- **The clock** is the fire's own, seconds since ignition times a speed (x1, x10, x60). Nothing is rebuilt: the trail
  is the map and the clock, so any point can be asked how it stands (`FIREFX.state(x,z)`: unburnt, burning,
  smouldering, burnt), which is what a game needs from a fire (a hazard, a way through, the Scyvoi's fire-hunting).
- **Where it goes next:** this is the prototype of a `core/atmos` fire module (`89-atmos-c-fire.js`): the data and the
  shader text are already split from the host code; the foliage patch would become a hook in `core/biome`'s foliage
  material. Not done here because it changes every build that takes core/atmos or core/biome.

## Rules the owner has given that this kit follows

- **No trees on cliff faces** (Oct 2026): `zones()` multiplies every zone by `1 - cliff` (steep granite); the probe
  checks it with a negative control.
