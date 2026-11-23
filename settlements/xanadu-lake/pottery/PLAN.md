# Pāṭari (Pottery): a lake town of 1,500 on Erewhon's lake (plan, 2026-11-22)

One of the twenty lake towns of the shared target (`settlements/xanadu-lake/PLAN.md`: the target, the spec's shape, the
pieces, the verify and the Core adoption every town shares). This file is what is Pāṭari's own. The owner, 2026-11-16:
*"Lake towns over 500 can be laid out in full"*; 2026-11-22: one shared target and the regions draw them. Everything not
from the owner, the lore or the tune is *proposed*.

## 1. The record (`XAN_TUNE.lake`, read in place)

| Field | Value |
|---|---|
| Id | `lk.pottery` |
| Name | Pāṭari (Pottery) |
| px | 865,1518 (the 5.1 canvas, 2 km a pixel); in the xanadu-oidong-highrift frame x -652,000 m, z -102,000 m |
| People | 1,500 (about 273 households of 5.5) |
| Province | P1 (Lēk-Shor, the Lake Shore), hub Erehwon (`s57bkv9741`), 48 km by water (straight line) |
| Diet | `lake`: 188 t of grain a year, 68 t of fish, 12 t of fruit |
| Fishing | none: `lk.pottery.store`, the landing (crew 10). It buys its fish |
| Its make | `lk.pottery.pottery`: 120 t of pottery a year, crew 200; the road to the hub carries 85 % of the stock (`share`) |
| Terraces | `lk.pottery.terraces`: crew 160 in the harvest, 112 t of grain (three fifths of what it eats); about 84 ha of terrace at 1.6 t/ha |
| From the hub | 75 t of grain a year by the round |
| The round | `round.south-east` (Erehwon's south-east round): call 4 of 7, after Saphran, before Ṭī-Ṭeras |

## 2. The site and the ground

| | |
|---|---|
| The model's cell | -316 m, 8.5 % slope over its 2 km cell; the lake (-520 m) on the NW; relief 808 m within 7 km; the highest ground within 7 km at 34 m (350 m above the town) |
| The shore | *proposed* coast class `shingle` at the landing (`core/coast`; L0's fit reads the region's `coast:<class>` field and keeps it if it disagrees) |
| Water | None within 8 km on the model; the kiln yards' ravine is the town's own stream, drawn by the page's ground (`xlStream`). |
| The region | `xanadu-lake-shore`, site `sxanlkpottery01` (`openworld/SITES.json`, 6 km reach): cut, no town drawn yet |
| Footprint | *proposed* about 14 ha of town (110 people a ha in the lanes), a footprint radius of about 200 m round the landing, the terraces above it out to the band |

## 3. The town

The potters' town. Pāṭari makes 120 t of pottery a year (`lk.pottery.pottery`): the pots, jars and tiles every lake household buys from the market boats (`T.diet.lake` 2 kg a head). It has no dugouts: its landing (`lk.pottery.store`) ships pots and takes in fish and grain.

*Proposed* look: smoke and red ground. The kiln yards stand in a row along the stream ravine above the town where the clay is dug, the throwing sheds beside them, the sherd heaps below; the town itself is built of its own seconds, roofs and walls patched with broken tile, the lanes paved with sherds. Its people are higher on the slope than any town's but Lōṭas (the model's cell is at -316 m, 200 m over the water): the landing is down a long stair. San Antonio Palopó's potters and terraced slopes on Atitlán are the pattern.

**The quarters** (*proposed*; the spec's `quarters`, shares of the houses):

| Quarter | Role | Share | Where | What |
|---|---|---|---|---|
| `landing` | harbour | 10 % | shore | the landing at the stair's foot, the pot sheds |
| `kilns` | industry | 25 % | stream | the kiln yards along the ravine, the clay pits above them |
| `town` | residential | 45 % | slope | the potters' houses up the slope |
| `market` | market | 10 % | slope | the market terrace and the temple, halfway up |
| `upper` | residential | 10 % | bench | the masters' houses on the bench |

**The houses** (*proposed*): about 273, one a household: 60 % poor, 32 % middling, 8 % rich (about 164, 87 and 22), 30 % of them in the Andean set (87b) as Phēr takes a share.

**The landmarks** (the spec's `landmarks`):

- the kiln yards: `xa_kiln_yard` (stream)
- the temple of the Decree: `xa_temple` (slope)
- the long stair to the landing: `xa_ghat (missing) and the stair street` (shore)

**The boats** (*proposed*, `90s`): no dugouts, 1 launch, 2 barges at the landing.

## 4. Its pieces

| What | Key | How many (*proposed*) |
|---|---|---|
| kiln yards | `xa_kiln_yard` | 8 |
| throwing sheds | `xa_workshop` | 8 |
| clay pits | `xa_clay_pit (missing)` | 3 |
| pot warehouses | `xa_warehouse` | 2 |
| the temple of the Decree | `xa_temple` | 1 |
| wayside shrines (one a terrace stair) | `xa_wayside_shrine` | 2 |
| houses | `xa_poor_*`, `xa_mid_*`, `xa_rich_*`, `xa_andean_*` | 273 |

**Missing** (shared target section 5; each draws a stand-in until it lands): `xa_ghat`; `xa_governor`; `xa_clay_pit`; sherd heaps (KRUBBLE heaps in sherd dress, *proposed*).

## 5. Core adoption

The shared table (`../PLAN.md` section 7) holds for every town: `core/world`, `core/coast`, `core/water`, `core/city` and
`core/space`, `core/rand`, `core/tags`, `core/mask`, `kits/xanadu`, `kits/interiors`, `core/atmos`, `core/charactermodels`,
`core/region`. What Pāṭari adds:

| Need | Module | How |
|---|---|---|
| Its ground | `core/world`, `89zp-xl-site.js` | `xlH('pottery', x, z)` fitted to the region's ground at 865,1518; shore bearing NW; the wall's rise about 350 m in 7 km |
| The sherd heaps | `core/ruins` (`KRUBBLE`) | The broken pots as rubble heaps in the sherd dress, not a box scatter |

## 6. Textures

the shared set (`../PLAN.md` section 8); `stone.ghat.wet` (section 59); `ground.sherds` (section 59, new); `ceramic.terracotta`; `ceramic.terracotta.sooty` (the kilns).

## 7. Pins (the scale-model queue; listed, not edited)

- A records-only town pin, `sxanlkpottery01`, "Pāṭari", type `town`, 865,1518, polity the Sultanate (the shared target's section 9 batch).

## 8. Open points (each with the default the build takes if the owner says nothing)

None beyond the shared target's.

## 9. Steps

Built in step **L3** of the shared target (`../PLAN.md` section 10): the spec row in `89zl-xl-specs.js`, the ground fitted
(`tools/fit_lake_town.py pottery`), the plan and its verify (`verify.py --assert ?town=pottery` on the GPU lane), its
`bake_towns.py` entry and tile, and the region drawing it. Done when the verify passes, `bake_towns.py pottery --check` reads
the same, the node tests hold its census to the tune, and `tools/check_core_use.py` passes.
