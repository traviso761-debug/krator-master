# Māuṭh (Mouth): a lake town of 1,500 on Erewhon's lake (plan, 2026-11-22)

One of the twenty lake towns of the shared target (`settlements/xanadu-lake/PLAN.md`: the target, the spec's shape, the
pieces, the verify and the Core adoption every town shares). This file is what is Māuṭh's own. The owner, 2026-11-16:
*"Lake towns over 500 can be laid out in full"*; 2026-11-22: one shared target and the regions draw them. Everything not
from the owner, the lore or the tune is *proposed*.

## 1. The record (`XAN_TUNE.lake`, read in place)

| Field | Value |
|---|---|
| Id | `lk.mouth` |
| Name | Māuṭh (Mouth) |
| px | 852,1494 (the 5.1 canvas, 2 km a pixel); in the xanadu-oidong-highrift frame x -678,000 m, z -150,000 m |
| People | 1,500 (about 273 households of 5.5) |
| Province | P7 (Nōrth-Shor, the North Shore), hub Phēr (`xan.pher`), 19 km by water (straight line) |
| Diet | `lake`: 188 t of grain a year, 68 t of fish, 12 t of fruit |
| Fishing | `lk.mouth.fishing`, the dugouts: crew 200, 234 t a year (`T.fishKgPerson` 260 kg a head x .6); it eats 68 t, and the road to the hub carries 55 % of the stock (`share`); its fishery `T.fishery`, half a year of catch in the water |
| Its make | none counted (its fish only) |
| Terraces | `lk.mouth.terraces`: crew 160 in the harvest, 112 t of grain (three fifths of what it eats); about 90 ha of terrace at 1.5 t/ha |
| From the hub | 75 t of grain a year by the round |
| The round | `round.north-east` (Phēr's north-east round): call 1 of 3, after Phēr, before Ōlḍ-Thalaba |
| The fair | `T.loops`: the fair's east loop calls here two days a week |

## 2. The site and the ground

| | |
|---|---|
| The model's cell | -500 m, 8.4 % slope over its 2 km cell; the lake (-520 m) on the S; relief 1,078 m within 7 km; the highest ground within 7 km at 10 m (510 m above the town) |
| The shore | *proposed* coast class `shingle` at the landing (`core/coast`; L0's fit reads the region's `coast:<class>` field and keeps it if it disagrees) |
| Water | None within 8 km on the model; the page's own stream (`xlStream('mouth')`) is *proposed*, a records-only stream for the queue if the owner wants the model to carry it. |
| The region | `xanadu-north-shore`, site `sxanmouth01` (`openworld/SITES.json`, 6 km reach): cut, no town drawn yet |
| Footprint | *proposed* about 14 ha of town (110 people a ha in the lanes), a footprint radius of about 200 m round the landing, the terraces above it out to the band |

## 3. The town

The first lake town to be built: a fishing town of 1,500 on the north shore, 18 km east of Phēr, the first call of Phēr's north-east round and a stop of the fair's east loop (`loop.pher.fair-east`). Its site is cut already (`sxanmouth01`, a 6 km square in `xanadu-north-shore`). The name is the mouth: *proposed*, of a stream down the rim plain (the model has none within 8 km: the page draws its own, as Phēr's stream was drawn before the model took it).

*Proposed* look: the plain lake town, the pattern the shared target is proved on. A quay and landing stair, the fish racks and boat sheds along the shore, a market square with the temple by the landing, the town on a gentle slope (8 %) with two terrace benches above, and the stream's ravine at its east edge with a footbridge. Every piece it draws is a piece every other town draws.

**The quarters** (*proposed*; the spec's `quarters`, shares of the houses):

| Quarter | Role | Share | Where | What |
|---|---|---|---|---|
| `landing` | harbour | 15 % | shore | the quay, the landing stair, the fish racks, the boat sheds |
| `market` | market | 10 % | shore | the market square, the temple, the headman's house |
| `town` | residential | 50 % | slope | the town up the slope |
| `bench` | farm | 15 % | bench | the terrace farmers' houses on the benches |
| `stream` | residential | 10 % | stream | the houses along the stream |

**The houses** (*proposed*): about 273, one a household: 55 % poor, 35 % middling, 10 % rich (about 150, 95 and 27), 25 % of them in the Andean set (87b) as Phēr takes a share.

**The landmarks** (the spec's `landmarks`):

- the temple of the Decree: `xa_temple` (shore)
- the market square: `xa_shops, xa_stall` (shore)
- the footbridge: `xa_bridge` (stream)

**The boats** (*proposed*, `90s`): 55 dugouts (two to a dugout, the fishing crew's half afloat at a time), 2 launches, 1 barge at the landing.

## 4. Its pieces

| What | Key | How many (*proposed*) |
|---|---|---|
| fish racks | `xa_fish_racks` | 8 |
| boat sheds | `xa_boatshed` | 4 |
| granary | `xa_granary` | 1 |
| smithy | `xa_smithy` | 1 |
| the temple of the Decree | `xa_temple` | 1 |
| wayside shrines (one a terrace stair) | `xa_wayside_shrine` | 2 |
| houses | `xa_poor_*`, `xa_mid_*`, `xa_rich_*`, `xa_andean_*` | 273 |

**Missing** (shared target section 5; each draws a stand-in until it lands): `xa_ghat`; `xa_governor`.

## 5. Core adoption

The shared table (`../PLAN.md` section 7) holds for every town: `core/world`, `core/coast`, `core/water`, `core/city` and
`core/space`, `core/rand`, `core/tags`, `core/mask`, `kits/xanadu`, `kits/interiors`, `core/atmos`, `core/charactermodels`,
`core/region`. What Māuṭh adds:

| Need | Module | How |
|---|---|---|
| Its ground | `core/world`, `89zp-xl-site.js` | `xlH('mouth', x, z)` fitted to the region's ground at 852,1494; shore bearing S; the wall's rise about 510 m in 7 km |
| (nothing else) | | |

## 6. Textures

the shared set (`../PLAN.md` section 8); `stone.ghat.wet` (section 59).

## 7. Pins (the scale-model queue; listed, not edited)

- A records-only town pin, `sxanmouth01`, "Māuṭh", type `town`, 852,1494, polity the Sultanate (the shared target's section 9 batch).

## 8. Open points (each with the default the build takes if the owner says nothing)

1. The stream the name asks for: the model has none. *Default:* the page draws a small stream (as Phēr's was before edit 517); the queue takes a stream record later only if the owner asks.

## 9. Steps

Built in step **L0** of the shared target (`../PLAN.md` section 10): the spec row in `89zl-xl-specs.js`, the ground fitted
(`tools/fit_lake_town.py mouth`), the plan and its verify (`verify.py --assert ?town=mouth` on the GPU lane), its
`bake_towns.py` entry and tile, and the region drawing it. Done when the verify passes, `bake_towns.py mouth --check` reads
the same, the node tests hold its census to the tune, and `tools/check_core_use.py` passes.
