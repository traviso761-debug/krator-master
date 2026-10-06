# Eastern badlands — notes

## The brief (the owner, Oct 2026)

A biome to cover the eastern rim of the map: the 'e badlands' overlay of the Krator Scale Model, from the
abyss's gentle east rim to the airless outer rim. `openworld/little-demo/HANDOFF-EBADLANDS.md` is the handoff.

- A wide-ranging biome over several Köppen types: hot steppe and desert in the northern basins, milder humid
  subtropical and warm continental in the south where it is wetter (the valley of Yuni), boreal toward the
  airless rim. **Dryness and temperature are the better guide to placement than the Köppen class.**
- Inspired by the Great Basin of the US: badlands, rocky deserts, intermittent green valleys and plateaus.
  Zion and the lusher West are the guide for the green places.
- The north: more volcanic activity, sulphur pools like the Danakil; hotter, desolate outside small oases.
- The flora is relatively terrestrial, with some alien species (the 'alien' and 'alienflora' images).
- Toward the boreal peaks, pine woods take over.

The reference images are in the owner's `ebadlands.zip` (OneDrive, `Pictures/krator/ebadlands/`); three are
kept in `reference/` (`VISUAL-BAR.md`): the Zion river bend (the ground-level frame), the Badlands (the vista),
and the alien flora sheet.

## How the references became species

| reference | what it gave |
|---|---|
| Badlands NP, the Painted Hills, the striped mountain | banded mounds: the strata palette (pink, cream, gold, grey, maroon) and the 7 m bands painted by height |
| the green badlands (caption, kqv8, 3C82ED5D) | grass between the bands where it is wet: the vale zone on rock |
| Zion (river bend, Zion3, rich-martello, images) | the canyon with cottonwoods, maples, oaks on its floor and red walls |
| Great Basin NP | the tarn in a cirque under spruce and the ice crest |
| pinyon pictures | the pinyon's gnarled rounded crown on a rim; the Grand Canyon pinyon on slickrock |
| LA National Forest, istockphoto, Angeles | chaparral yucca with its spike, red buckwheat, phlox in flower |
| Smoky Mountain, Sequim, qbed94 | spruce-fir with aspens turning gold; snow on the high road |
| Danakil (three) | the sulphur flats: acid-green and yellow pools, chimneys, crust 'pancakes' |
| the desolate red desert | toadstool rocks and cracked ground in the hot waste |
| alienflora sheet | ember crown, sunspire, needle bloom, moonflower cactus, mirage grass, spiral mat, gold parasols |
| alien.jpg | the rose weeper |
| alien2.jpg | the stilt pod (and its tendrils) |
| alien3.jpg | the fan cups |
| alien4.jpg (hogweed from below) | the giant umbel |
| plants2 (corndoggy) | not used yet (a pink parasol tree with hanging beads would suit the vale) |

## The showcase transect

One 6.8 km transect compresses the region so every zone stands where a camera can reach it (`45-host-stage.js`):
the sulphur flats and the hot waste in the north-west, painted badlands in the basin (green in the south), a
260 m escarpment up to the sagebrush plateau, a Zion canyon 250 m deep through it, and the range climbing east
through ponderosa and aspen, spruce-fir and a tarn, the treeline at about 1,350 m, tundra, then ice past
1,650 m. The cold field is the height (the north 0.16 warmer), the wet field rises to the south and up the
range, plus the river.

## Acceptance frames (`VISUAL-BAR.md`)

- Ground level: **Zion, the river in the canyon** (against `reference/zion-river-bend.jpg`).
- Vista: **From afar** (the transect from the south-west, against `reference/badlands.jpg` for the banded basin).

`python3 verify.py dist/ebadlands.html --assert --views "Zion, the river in the canyon|From afar"`.

## Rules the owner added while it was built

- **No trees on layered cliff faces** (Oct 2026): the zones' `cliff` term (steep and rocky) zeroes every zone, so
  the canyon walls, the escarpment and the badland walls stay bare bedded rock. Checked by the probe.
