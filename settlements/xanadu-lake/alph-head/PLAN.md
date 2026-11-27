# Ālph-Hēḍ (Alph Head): a lake town of 4,000 on Erewhon's lake (plan, 2026-11-22)

One of the twenty lake towns of the shared target (`settlements/xanadu-lake/PLAN.md`: the target, the spec's shape, the
pieces, the verify and the Core adoption every town shares). This file is what is Ālph-Hēḍ's own. The owner, 2026-11-16:
*"Lake towns over 500 can be laid out in full"*; 2026-11-22: one shared target and the regions draw them. Everything not
from the owner, the lore or the tune is *proposed*.

## 1. The record (`XAN_TUNE.lake`, read in place)

| Field | Value |
|---|---|
| Id | `lk.alph-head` |
| Name | Ālph-Hēḍ (Alph Head) |
| px | 876,1503 (the 5.1 canvas, 2 km a pixel); in the xanadu-oidong-highrift frame x -630,000 m, z -132,000 m |
| People | 4,000 (about 727 households of 5.5) |
| Province | P1 (Lēk-Shor, the Lake Shore), hub Erehwon (`s57bkv9741`), 75 km by water (straight line) |
| Diet | `lake`: 500 t of grain a year, 180 t of fish, 32 t of fruit |
| Fishing | `lk.alph-head.fishing`, the dugouts: crew 200, 624 t a year (`T.fishKgPerson` 260 kg a head x .6); it eats 180 t, and the road to the hub carries 55 % of the stock (`share`); its fishery `T.fishery`, half a year of catch in the water |
| Its make | `lk.alph-head.grain`: 900 t of grain a year, crew 200; the road to the hub carries 60 % of the stock (`share`) |
| Terraces | `lk.alph-head.terraces`: crew 160 in the harvest, 300 t of grain (three fifths of what it eats); about 225 ha of terrace at 1.6 t/ha |
| From the hub | nothing: its own grain covers it, and it sends three fifths of its make (`sh.grain .6`) |
| The round | `round.south-east` (Erehwon's south-east round): call 7 of 7, after Hoṭ-Bāṭh, before Erehwon |

## 2. The site and the ground

| | |
|---|---|
| The model's cell | -500 m, 5.4 % slope over its 2 km cell; the lake (-520 m) on the W; relief 924 m within 7 km; the highest ground within 7 km at -3 m (497 m above the town) |
| The shore | *proposed* coast class `shingle` at the landing (`core/coast`; L0's fit reads the region's `coast:<class>` field and keeps it if it disagrees) |
| Water | None within 8 km on the model. The Ālph (`r070`, 520 m³/s) leaves the lake 17 km south at Hoṭ-Bāṭh. The Sakāi Ḍrāi (`r488`, a wadi, 5.8 m³/s) ends at 881,1506, 10 km south-east: a dry ravine the mills' road crosses. |
| The region | `xanadu-lake-shore`, site `sxanlkalph01` (`openworld/SITES.json`, 6 km reach): cut, no town drawn yet |
| Footprint | *proposed* about 36 ha of town (110 people a ha in the lanes), a footprint radius of about 350 m round the landing, the terraces above it out to the band |

## 3. The town

The Vale's granary on the lake. Ālph-Hēḍ stands on the east shore where the wall is lowest, the one stretch where the lake's rim opens onto the Vale's floor (the relief behind it is the gentlest of the south and east shore). Its 900 t of grain a year (`lk.alph-head.grain`) is the only lake grain the tune counts beyond a town's own: it feeds itself and sends three fifths of its make to Erehwon (`sh.grain .6`), so the south-east round's barges load their heaviest here, last on the round.

*Proposed* look: the largest of the twenty with Phish-Mārkiṭ, built as the Vale's farm towns are, wide rather than tall. A long grain quay with the barges' slips, a row of great granaries along it, threshing floors on the first bench, and windmills on the rim where the wind comes over from the Vale. The name says the Ālph's head; the model's outflow (`r070`) leaves the lake at 876.9,1511.7, 17 km south, beside Hoṭ-Bāṭh (open point 1).

**The quarters** (*proposed*; the spec's `quarters`, shares of the houses):

| Quarter | Role | Share | Where | What |
|---|---|---|---|---|
| `quay` | harbour | 15 % | shore | the grain quay, the granaries, the barge slips, the porters' lanes |
| `market` | market | 15 % | shore | the market square behind the quay, the temple, the governor's house, the teahouses |
| `old` | residential | 30 % | slope | the old town up the first slope: the fishers' and the porters' houses |
| `bench` | residential | 25 % | bench | the farmers' houses on the first bench among the threshing floors |
| `mills` | industry | 15 % | bench | the mill row on the rim: windmills, the smithy, the cartwrights for the Vale road |

**The houses** (*proposed*): about 727, one a household: 50 % poor, 38 % middling, 12 % rich (about 364, 276 and 87), 20 % of them in the Andean set (87b) as Phēr takes a share.

**The landmarks** (the spec's `landmarks`):

- the temple of the Decree by the landing: `xa_temple` (shore)
- the governor's house: `xa_governor (missing: xa_rich_c and xa_watch stand in)` (shore)
- the great granaries (six): `xa_granary` (shore)
- the windmills on the rim (four): `xa_windmill` (bench)

**The boats** (*proposed*, `90s`): 110 dugouts (two to a dugout, the fishing crew's half afloat at a time), 3 launches, 8 barges at the landing.

## 4. Its pieces

| What | Key | How many (*proposed*) |
|---|---|---|
| granaries | `xa_granary` | 10 |
| threshing floors and farmsteads | `xa_farm, xa_farmhouse` | 30 |
| windmills | `xa_windmill` | 4 |
| barge slips | `xa_slip` | 3 |
| fish racks | `xa_fish_racks` | 12 |
| boat sheds | `xa_boatshed` | 6 |
| the temple of the Decree | `xa_temple` | 1 |
| wayside shrines (one a terrace stair) | `xa_wayside_shrine` | 6 |
| houses | `xa_poor_*`, `xa_mid_*`, `xa_rich_*`, `xa_andean_*` | 727 |

**Missing** (shared target section 5; each draws a stand-in until it lands): `xa_ghat`; `xa_governor`; the orchard plot (none here).

## 5. Core adoption

The shared table (`../PLAN.md` section 7) holds for every town: `core/world`, `core/coast`, `core/water`, `core/city` and
`core/space`, `core/rand`, `core/tags`, `core/mask`, `kits/xanadu`, `kits/interiors`, `core/atmos`, `core/charactermodels`,
`core/region`. What Ālph-Hēḍ adds:

| Need | Module | How |
|---|---|---|
| Its ground | `core/world`, `89zp-xl-site.js` | `xlH('alph-head', x, z)` fitted to the region's ground at 876,1503; shore bearing W; the wall's rise about 497 m in 7 km |
| The Vale road | `core/world` (`ROADS`) | The road east over the rim to Theodiga (the Vale's seat, 908,1535): the region's road, joined at the town's gate |

## 6. Textures

the shared set (`../PLAN.md` section 8); `stone.ghat.wet` (section 59); `ground.ash.soil` (the threshing floors; or `ground.steppe`).

## 7. Pins (the scale-model queue; listed, not edited)

- A records-only town pin, `sxanlkalph01`, "Ālph-Hēḍ", type `town`, 876,1503, polity the Sultanate (the shared target's section 9 batch).

## 8. Open points (each with the default the build takes if the owner says nothing)

1. The name says the head of the Ālph, but the outflow is 17 km south by Hoṭ-Bāṭh. *Default:* the name stays (the Ālph's head is the lake itself, which the Ālph drains); no move.
2. Its grain: the tune counts 900 t from its own fields beyond the terraces. *Default:* the fields lie on the Vale side of the rim, outside the town's footprint, drawn by the region as farmland (core/hamlet's farmland on the farm mask), not by the page.

## 9. Steps

Built in step **L3** of the shared target (`../PLAN.md` section 10): the spec row in `89zl-xl-specs.js`, the ground fitted
(`tools/fit_lake_town.py alph-head`), the plan and its verify (`verify.py --assert ?town=alph-head` on the GPU lane), its
`bake_towns.py` entry and tile, and the region drawing it. Done when the verify passes, `bake_towns.py alph-head --check` reads
the same, the node tests hold its census to the tune, and `tools/check_core_use.py` passes.
