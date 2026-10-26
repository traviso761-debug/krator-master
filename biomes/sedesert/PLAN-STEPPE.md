# sedesert: the steppe fringe (station 3, detailed plan, 2026-10-26)

**The steppe fringe** is the half of the sedesert polygon that is desert-steppe rather than desert (`PLAN-STATIONS.md`): 145k km²
of BSh at ~670 m, ~1.5 atm, ~330 mm, mean +22 °C, against the desert proper's ~170 mm. It is **station 3 of the sedesert kit**
(`python3 build.py --station steppe` -> `dist/sedesert-steppe.html`, `stations/steppe/`), built on the Bowl's station code.

**Status (2026-10-26): planned with the owner; building.**

## 0. What the owner asked (2026-10-26)

- **A steppe-ified Socotran flora**: the kit's Socotran species in their steppe forms, and their steppe kin from the Horn of
  Africa and Dhofar.
- **Rare plants of Earth**, each in a Krator form: **Welwitschia**, **Dorstenia gigas**, **living stones**.
- **Unusual landforms**: **fairy circles**, **kopjes and tors**, and **honeycomb (tafoni) weathering** on their faces.
- **At least two alien plants**: **sun-dials**, **whistle reeds** and **drift lanterns** (all three).
- The site **provisional**: station-local ground on the survey's figures; the exact pixel is fixed when the model is surveyed.

## 1. The ground

| | |
|---|---|
| Climate | BSh: a hot steppe, ~330 mm in one short wet season; the grass green after the rains, gold the rest of the year |
| Height, air | ~670 m, ~1.5 atm (the sky's preset) |
| Site | provisional: on the sedesert polygon's steppe half north of the Bowl, toward Arcbeam's rim (px ~800,690); **to check on the scale model** |
| Neighbours | the kit's red desert (its mesas and hoodoos thin out at the station's edge), the Bowl's rim to the south-east |

## 2. The station's map (x east, z south; R 3000)

| Zone | Where | Ground | What grows |
|---|---|---|---|
| `grass` | the body of the map | low rolling ground, red-brown loam under bunchgrass | bunchgrass, the steppe's trees scattered, the alien plants |
| `circles` | patches in the grass (two or three fields, ~600 m each) | **fairy circles**: bare discs 3-10 m across in a near-hexagonal lattice, a ring of taller grass round each | nothing in the discs |
| `kopje` | three or four granite domes and boulder hills (20-60 m high) | pink-grey granite, **tors** (balancing stacks of rounded boulders) on their tops, **honeycomb (tafoni)** in their faces, **gnamma pools** (rock basins that hold the rain) | **Dorstenia** on the faces, bottle trees and the kit's candelabras in the clefts, dew-fed moss at the pools |
| `pan` | a shallow seasonal pan (~500 m) | cracked clay, a sheet of water after the rains, a green rim | **living stones** on its gravel margin, glasswort-like fringe, the whistle reeds at its edge |
| `wadi` | a dry sandy wadi crossing the map | sand and cobbles, a band of trees along it | umbrella thorns, frankincense, the steppe dragons |
| `pavement` | gravel plains in the west | desert pavement (dark varnished pebbles) | **Welwitschia**, living stones, sparse grass |
| `edge` | the north-west | the kit's red desert: a mesa and hoodoos thinning out | the kit's own flora |

## 3. The flora

**The kit's species in their steppe forms** (a habit, `SEDESERT.STEPPE`, as the Bowl's dense-air one): the **dragon tree** shorter
and many-stemmed (Dracaena ombet, the Horn of Africa's), the **desert rose** in the grass with a smaller caudex, the **bottle tree**
on the kopjes, the **candelabra** and the **cardon** sparse in the clefts and at the desert edge, the **frankincense** (built for
Mantis's forest) as Boswellia sacra of the Dhofar steppe, multi-stemmed from the ground.

**New for the steppe** (Earth models named):

| Key | Name | Model | Where |
|---|---|---|---|
| `thorn` | Umbrella thorn | Vachellia tortilis: a flat-topped crown on a short forked trunk | grass, wadi |
| `myrrh` | Myrrh | Commiphora myrrha: a spiny, peeling, many-stemmed small tree; the resin a trade good | grass, kopje feet |
| `twoleaf` | **Old twoleaf** | **Welwitschia mirabilis**: two strap leaves that never stop growing, torn into ribbons over the centuries, lying on the gravel round a woody crown; the oldest a heap eight metres across | pavement, pan margin |
| `rockfig` | **Rock fig** | **Dorstenia gigas** of Socotra: a swollen grey-white caudex clinging to a bare rock face, a few short branches, leaf rosettes at their tips | kopje faces |
| `pebbles` | **Pebble plants** | **Lithops** (living stones): pairs of leaves like split pebbles, mottled to match the gravel, flowering yellow and white after rain | pan margin, pavement |

**The alien plants** (Krator's own):

| Key | Name | What it is | Where |
|---|---|---|---|
| `sundial` | **Sun-dial** | a flat disc on a jointed stalk that turns through the day to face the sun and folds shut at night (driven by the sky's sun) | grass, in loose drifts |
| `whistle` | **Whistle reed** | stands of hollow, glassy, ringed silica tubes that pipe in the wind | pan edge, wadi |
| `lantern` | **Drift lantern** | ribbed, papery seed-globes on short stems; ripe ones break off and roll across the steppe on the wind, fetching up against the tors and in the fairy circles' rings | grass; loose ones everywhere downwind |

Grass: bunchgrass (Aristida, Stipa-like) in tussocks, the rank grass on the wetter ground, blooms after the rain. Crops
(`kits/crops`): `sedesert` gains a `steppe` zone (warmth [4, 5], arid [1, 2]); myrrh joins the records.

## 4. Textures

In the library: `ground.sand.dune`, `ground.playa.red` and `ground.clay.popcorn` for the pan, `rock.sandstone.bedded.red` for the
desert edge, the Bowl's and Mantis's cards (rank grass, blooms, ferns), the kit's own sets. **To source** (prompts into
`core/materials/PROMPTS-NEEDED.md` if no set fits): a granite tafoni (honeycomb) surface, a desert pavement (dark varnished pebbles),
a bunchgrass card, a Welwitschia ribbon card.

## 5. Order of work

- **S0.** This plan; the owner's answers (above).
- **S1.** The ground: the rolling plain, the kopjes and tors with their tafoni and gnamma pools, the fairy circles, the pan, the dry
  wadi, the pavement, the desert edge.
- **S2.** The flora: the steppe forms, the umbrella thorn and the myrrh, the rare three, the grass.
- **S3.** The alien plants (the sun-dials turning with the sun, the whistle reeds, the drift lanterns rolling on the wind).
- **S4.** Views, checks, `verify.py --assert`, docs; the crops wiring; the site checked on the model.
