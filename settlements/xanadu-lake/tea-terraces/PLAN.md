# Ṭī-Ṭeras (Tea Terraces): a lake town of 2,000 on Erewhon's lake (plan, 2026-11-22)

One of the twenty lake towns of the shared target (`settlements/xanadu-lake/PLAN.md`: the target, the spec's shape, the
pieces, the verify and the Core adoption every town shares). This file is what is Ṭī-Ṭeras's own. The owner, 2026-11-16:
*"Lake towns over 500 can be laid out in full"*; 2026-11-22: one shared target and the regions draw them. Everything not
from the owner, the lore or the tune is *proposed*.

## 1. The record (`XAN_TUNE.lake`, read in place)

| Field | Value |
|---|---|
| Id | `lk.tea-terraces` |
| Name | Ṭī-Ṭeras (Tea Terraces) |
| px | 872,1517 (the 5.1 canvas, 2 km a pixel); in the xanadu-oidong-highrift frame x -638,000 m, z -104,000 m |
| People | 2,000 (about 364 households of 5.5) |
| Province | P1 (Lēk-Shor, the Lake Shore), hub Erehwon (`s57bkv9741`), 62 km by water (straight line) |
| Diet | `lake`: 250 t of grain a year, 90 t of fish, 16 t of fruit |
| Fishing | `lk.tea-terraces.fishing`, the dugouts: crew 200, 312 t a year (`T.fishKgPerson` 260 kg a head x .6); it eats 90 t, and the road to the hub carries 55 % of the stock (`share`); its fishery `T.fishery`, half a year of catch in the water |
| Its make | `lk.tea-terraces.tea`: 45 t of tea a year, crew 200; the road to the hub carries 85 % of the stock (`share`) |
| Terraces | `lk.tea-terraces.terraces`: crew 160 in the harvest, 150 t of grain (three fifths of what it eats); about 112 ha of terrace at 1.6 t/ha |
| From the hub | 100 t of grain a year by the round |
| The round | `round.south-east` (Erehwon's south-east round): call 5 of 7, after Pāṭari, before Hoṭ-Bāṭh |

## 2. The site and the ground

| | |
|---|---|
| The model's cell | -440 m, 11.1 % slope over its 2 km cell; the lake (-520 m) on the N; relief 906 m within 7 km; the highest ground within 7 km at 125 m (565 m above the town) |
| The shore | *proposed* coast class `shelf` at the landing (`core/coast`; L0's fit reads the region's `coast:<class>` field and keeps it if it disagrees) |
| Water | None within 8 km on the model. |
| The region | `xanadu-lake-shore`, site `sxanlktea01` (`openworld/SITES.json`, 6 km reach): cut, no town drawn yet |
| Footprint | *proposed* about 18 ha of town (110 people a ha in the lanes), a footprint radius of about 250 m round the landing, the terraces above it out to the band |

## 3. The town

The tea town on the steep south-east wall. Ṭī-Ṭeras makes 45 t of tea a year (`lk.tea-terraces.tea`, picked in the spring flush, year days 40-130) from gardens terraced up a wall that rises 565 m within 7 km. It is also the landing for the Flashing Eye's head house: the tune sends the Red Monastery's grain by launch to Ṭī-Ṭeras and up the west road, and its tea by want (`T.flashingeye`, 62 km by the lake, 45 by road).

*Proposed* look: a town of stairs. The tea factory by the landing where the leaf comes down, the houses in rows along the contour benches, and the gardens above in narrow bench terraces to the rim, with the pickers' paths zigzagging up them. The pilgrims' road to the Red Monastery leaves from its upper gate.

**The quarters** (*proposed*; the spec's `quarters`, shares of the houses):

| Quarter | Role | Share | Where | What |
|---|---|---|---|---|
| `landing` | harbour | 15 % | shore | the landing, the tea factory, the warehouses |
| `market` | market | 10 % | shore | the market and the temple |
| `rows` | residential | 45 % | bench | the houses on three contour benches joined by stairs |
| `gardens` | farm | 20 % | bench | the pickers' houses among the tea gardens |
| `gate` | civic | 10 % | bench | the upper gate, the pilgrims' inn, the road to the Flashing Eye |

**The houses** (*proposed*): about 364, one a household: 55 % poor, 35 % middling, 10 % rich (about 200, 127 and 36), 30 % of them in the Andean set (87b) as Phēr takes a share.

**The landmarks** (the spec's `landmarks`):

- the tea factory: `xa_tea_factory` (shore)
- the temple of the Decree: `xa_temple` (shore)
- the pilgrims' inn at the upper gate: `xa_caravanserai (small) or xa_teahouse` (bench)

**The boats** (*proposed*, `90s`): 55 dugouts (two to a dugout, the fishing crew's half afloat at a time), 2 launches, 1 barge at the landing.

## 4. Its pieces

| What | Key | How many (*proposed*) |
|---|---|---|
| tea factories | `xa_tea_factory` | 2 |
| withering sheds (a workshop each) | `xa_workshop` | 4 |
| fish racks | `xa_fish_racks` | 6 |
| boat sheds | `xa_boatshed` | 3 |
| the temple of the Decree | `xa_temple` | 1 |
| wayside shrines (one a terrace stair) | `xa_wayside_shrine` | 3 |
| houses | `xa_poor_*`, `xa_mid_*`, `xa_rich_*`, `xa_andean_*` | 364 |

**Missing** (shared target section 5; each draws a stand-in until it lands): `xa_ghat`; `xa_governor`; tea garden terraces as land (the farmland pass on the benches).

## 5. Core adoption

The shared table (`../PLAN.md` section 7) holds for every town: `core/world`, `core/coast`, `core/water`, `core/city` and
`core/space`, `core/rand`, `core/tags`, `core/mask`, `kits/xanadu`, `kits/interiors`, `core/atmos`, `core/charactermodels`,
`core/region`. What Ṭī-Ṭeras adds:

| Need | Module | How |
|---|---|---|
| Its ground | `core/world`, `89zp-xl-site.js` | `xlH('tea-terraces', x, z)` fitted to the region's ground at 872,1517; shore bearing N; the wall's rise about 565 m in 7 km |
| The road to the Flashing Eye | `core/world` (`ROADS`) | The west road up the wall to the Red Monastery (881,1527, 45 km by road): the region's road from the upper gate |

## 6. Textures

the shared set (`../PLAN.md` section 8); `stone.ghat.wet` (section 59); the tea gardens' rows (the farmland pass's crop texture: `kits/crops` `tea`).

## 7. Pins (the scale-model queue; listed, not edited)

- A records-only town pin, `sxanlktea01`, "Ṭī-Ṭeras", type `town`, 872,1517, polity the Sultanate (the shared target's section 9 batch).

## 8. Open points (each with the default the build takes if the owner says nothing)

None beyond the shared target's.

## 9. Steps

Built in step **L3** of the shared target (`../PLAN.md` section 10): the spec row in `89zl-xl-specs.js`, the ground fitted
(`tools/fit_lake_town.py tea-terraces`), the plan and its verify (`verify.py --assert ?town=tea-terraces` on the GPU lane), its
`bake_towns.py` entry and tile, and the region drawing it. Done when the verify passes, `bake_towns.py tea-terraces --check` reads
the same, the node tests hold its census to the tune, and `tools/check_core_use.py` passes.
