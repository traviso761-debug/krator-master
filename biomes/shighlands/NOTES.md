# Southern highlands — notes

## The brief (the owner, Oct 2026)

The southern highlands (`shighlands` in `biomes/WORLD.md`): the Inner Wall's southern flank, bordering the hyperjungle
(steep), SW Bay (steep), the SW lowlands and the eastern high desert. The owner wanted a biome distinct from the rest
of the world, and chose (in the chat of 2026-10-06):

- **A cloud forest** dominated by **rosettes and groundsels** (the tropical-alpine giant rosettes of the paramo and
  the Afroalpine), above a **cloud sea**: the hyperjungle's dense air pools below the Wall as a permanent white deck.
- **The spiral biome.** Everything must have some kind of spiral growth habit. The owner's folder of spiraloid plants
  (29 references, `refs/`) is the source.
- Two named trees: a **spiral frill tree** whose frills grow in a rosette pattern, and a **spiral trumpet tree** with
  long, fluted trumpets.
- **Every spiral turns the same way** (right-handed); a mirror-handed plant is rare and valued.

## The four kinds of spiral

Every species and floor plant carries `tags.spiral`, one of:

| kind | what it is | who shows it |
|---|---|---|
| whorl | leaves set round a centre at a fixed angle (the golden angle, 137.5 degrees, or near it) | spiral frill tree, ruffle-crown, giant groundsel, spiral lobelia, spiral aloe (five ranks: 144 degrees less a little), silver rosettes, star moss, spiral-eye daisies |
| twist | a helix | coilbark, spiral trumpet, screw palm, corkscrew cereus, spiral ginger, braid spears, swirl tussock, corkscrew bells |
| coil | a fiddlehead's curl | crozier tree fern, fiddlehead fern, sundew coils, corkscrew rush, corkscrew albuca, coral coil-shrub |
| shell | a flat logarithmic spiral | volute tree, escargot begonia, rosette lichen |

The probe checks it (`every plant tagged with its spiral`), with a negative control for a missing and a made-up kind.

## One hand

`SHIGH.HAND` is +1. Every builder turns by its tree's own `T.hand`: a lathe's ridges wind by it (`twistTrunk`), a
limb's corkscrew turns by it (`corkscrew`), leaves are set round by it, and every spiral item (built right-handed) is
put with its x scale times it. About one tree in `MIRROR_EVERY` (320) is mirror-handed, and the host asks for one where
a camera finds it (`SHIGH.mirrorAt`, preset "The mirror-handed coilbark"). The inspector says which hand a tree has.
The probe checks that there is at least one mirror and that they stay under 2%.

The floor plants are all right-handed. Spiral items that are planar (the begonia's printed spiral, the daisy's eye)
take no hand.

## How the references became species

| ref | what it gave |
|---|---|
| 00 sundew coils | the **sundew coils** in the bogs (the crozier item, red) |
| 01 spiral leaf whorls | **spiral ginger**: leaves in one spiral up the stem |
| 02, 24 fern croziers, unfurling | the **fiddlehead fern**; the croziers at the tree fern's heart |
| 03 the spiral canopy painting | the **volute tree**: limbs ending in leafy log-spiral scrolls |
| 04, 10 boards of spiral plants | the mood; the trumpet's fluting; the coral shrubs |
| 05, 21 corkscrew albuca | the **corkscrew albuca** on the crags and the dry side |
| 06 hanging bulbs | **corkscrew bells**: bells on a helical thread (made a spiral, so not a copy of the north's bell-bulbs) |
| 07 frilled leaf edges, 08 spiral fan palm | the **ruffle-crown**'s leaves and its crown |
| 09 spiral cereus | the **corkscrew cereus** |
| 11, 12 spiral aloe | the **spiral aloe** (Aloe polyphylla: a real mountain plant, Lesotho, 2000-2500 m) |
| 13, 18, 20 begonias | the **escargot begonia** on the forest floor (full-colour texture) |
| 15 helix fruiting | the bells' helix |
| 16 spiral rosette tree | the ruffle-crown's habit (a rosette held up on a trunk) |
| biomes/rift's frill tree | the **spiral frill tree** (2026-10-06, the owner: "a real frill tree"): the Rift's ribbed, finned, iridescent column, its fins set at the golden angle so they climb in spirals, a whorl of long fins round the bud. The first version of the frill tree, a rosette on a trunk, stayed as the ruffle-crown |
| 17 spiral trunk from below, 19 malachite moss bark | the **coilbark**: a wrung trunk, moss streaks |
| 22 giant groundsels | the **giant groundsel** |
| 23 twisted sansevieria | **braid spears** |
| 25, 26 rosette, Lobelia telekii | the **spiral lobelia** |
| 27 painted forest | the PALETTE: chartreuse moss, sage-teal canopy, mauve trunks, coral and rose accents, fog |
| 28 screw palm | the **screw palm** in the ravines |
| 14 fractal fern | not used (the north's lace fern covers it) |

## The showcase

One 5.2 km piece of the Wall (`45-host-stage.js`): the rim runs east-west across the north third; north of it the
scarp falls through the cloud deck (`CLOUD_Y` 1120 m); three ravines cut back into the plateau, each with a stream;
the paramo plateau (1400-1600 m) has five bogs, a tarn, six granite tors, and the **Whorl Stone**, a tor whose ledges
join into one ledge spiralling to its top. The south-east dries toward the desert.

The host's `fog` field (how often the ground stands in cloud) zones the kit: high on the scarp at the deck, carried
up the ravines, pooled a little in the bogs. Nothing roots under the deck (`rootMask`: that ground is the
hyperjungle's).

The cloud sea is **core/atmos's cloud deck** (`89-atmos-d-clouddeck.js`, bound in `89z-host-atmos.js`; the owner asked
on 2026-10-06 for a cloud that survives the move to Godot). Its relief is billow noise on a repeating lattice with an
integer hash, written from `PRESETS.clouddeck` (heaped billows up to 44 m over `CLOUD_Y` and 26 m under it, warped by a
second noise so they change shape, with finer detail for the shading; the first version, a sum of plane waves, drew
parallel lines), so the generated Godot include draws the same cloud (`core/atmos/GODOT.md`, "The cloud deck"). It is a grid
that follows the camera, thinning where the ground (the stage's cached height) rises through it; the mist sprites along
its edge and up the ravines are this host's own (`84-host-ground.js`) and are not exported.

The paramo's tussocks are printed into the ground (`TEX_TUFT`, laid by the vertex weight `aPar`) and modelled only in
the near band, so the field of small whirlpools reads at every distance for no triangles.

The sky (`82-host-sky.js`): ~1 atm, a true blue zenith and a white sun; the cloud sea to the northern horizon with
towering cumulus on it and the Throne standing out of it at azimuth 8; the Inner Wall's ridges east and west; the land
falling away south into haze.

## Acceptance frames

- Ground level: **The paramo**.
- Vista: **Above the cloud sea**.

`python3 verify.py dist/shighlands.html --assert --views "The paramo|Above the cloud sea"`.

## Rules the owner has given that this kit follows

- **No trees on cliff faces** (Oct 2026): `zones()` multiplies every zone by `1 - cliff`; the probe checks it with a
  negative control.
- **Ask for textures** rather than papering over a gap: the owner generated `bark.wrung`, `bark.skirt` and
  `ground.sphagnum` for this kit on 2026-10-06 (`materials.json`); `KNOWN_ISSUES.md` lists the surfaces still procedural.
