# Saphran (Saffron): a lake town of 1,800 on Erewhon's lake (plan, 2026-11-22)

One of the twenty lake towns of the shared target (`settlements/xanadu-lake/PLAN.md`: the target, the spec's shape, the
pieces, the verify and the Core adoption every town shares). This file is what is Saphran's own. The owner, 2026-11-16:
*"Lake towns over 500 can be laid out in full"*; 2026-11-22: one shared target and the regions draw them. Everything not
from the owner, the lore or the tune is *proposed*.

## 1. The record (`XAN_TUNE.lake`, read in place)

| Field | Value |
|---|---|
| Id | `lk.saffron` |
| Name | Saphran (Saffron) |
| px | 857,1519 (the 5.1 canvas, 2 km a pixel); in the xanadu-oidong-highrift frame x -668,000 m, z -100,000 m |
| People | 1,800 (about 327 households of 5.5) |
| Province | P1 (Lēk-Shor, the Lake Shore), hub Erehwon (`s57bkv9741`), 32 km by water (straight line) |
| Diet | `lake`: 225 t of grain a year, 81 t of fish, 14 t of fruit |
| Fishing | `lk.saffron.fishing`, the dugouts: crew 200, 281 t a year (`T.fishKgPerson` 260 kg a head x .6); it eats 81 t, and the road to the hub carries 55 % of the stock (`share`); its fishery `T.fishery`, half a year of catch in the water |
| Its make | `lk.saffron.saffron`: 900 kg of saffron a year, crew 200; the road to the hub carries 85 % of the stock (`share`) |
| Terraces | `lk.saffron.terraces`: crew 160 in the harvest, 135 t of grain (three fifths of what it eats); about 101 ha of terrace at 1.6 t/ha |
| From the hub | 90 t of grain a year by the round |
| The round | `round.south-east` (Erehwon's south-east round): call 3 of 7, after Wībhar, before Pāṭari |

## 2. The site and the ground

| | |
|---|---|
| The model's cell | -440 m, 11.6 % slope over its 2 km cell; the lake (-520 m) on the N; relief 1,146 m within 7 km; the highest ground within 7 km at 329 m (769 m above the town) |
| The shore | *proposed* coast class `shelf` at the landing (`core/coast`; L0's fit reads the region's `coast:<class>` field and keeps it if it disagrees) |
| Water | None within 8 km on the model. |
| The region | `xanadu-lake-shore`, site `sxanlksaffron01` (`openworld/SITES.json`, 6 km reach): cut, no town drawn yet |
| Footprint | *proposed* about 16 ha of town (110 people a ha in the lanes), a footprint radius of about 250 m round the landing, the terraces above it out to the band |

## 3. The town

The saffron town under the highest wall. Saphran makes 900 kg of saffron a year (`lk.saffron.saffron`), picked in the autumn bloom (year days 280-310): the crocus fields on its terraces turn violet for a month, and the whole town picks the stigmas before dawn and dries them in the lofts. Saffron is the Order's colour (LORE.md: the History Monks' saffron) and the Sultanate's richest crop by weight.

*Proposed* look: a small, well-to-do town for its size. The saffron houses (drying lofts over picking floors) in a row on the first bench, the crocus terraces in long violet strips above them, the houses tight below on a narrow shore under a wall that rises 770 m in 7 km. The saffron goes to Erehwon under guard: the factor's house by the landing is the strongest building after the temple.

**The quarters** (*proposed*; the spec's `quarters`, shares of the houses):

| Quarter | Role | Share | Where | What |
|---|---|---|---|---|
| `landing` | harbour | 10 % | shore | the landing, the factor's strong house |
| `town` | residential | 45 % | slope | the town packed on the narrow shore and the first slope |
| `houses` | industry | 15 % | bench | the saffron houses on the first bench |
| `fields` | farm | 20 % | bench | the crocus terraces and the pickers' houses among them |
| `temple` | civic | 10 % | slope | the temple and its court |

**The houses** (*proposed*): about 327, one a household: 45 % poor, 40 % middling, 15 % rich (about 147, 131 and 49), 25 % of them in the Andean set (87b) as Phēr takes a share.

**The landmarks** (the spec's `landmarks`):

- the saffron houses: `xa_saffron_house` (bench)
- the factor's strong house: `xa_warehouse with xa_watch` (shore)
- the temple of the Decree: `xa_temple` (slope)

**The boats** (*proposed*, `90s`): 50 dugouts (two to a dugout, the fishing crew's half afloat at a time), 2 launches, 1 barge at the landing.

## 4. Its pieces

| What | Key | How many (*proposed*) |
|---|---|---|
| saffron houses | `xa_saffron_house` | 8 |
| fish racks | `xa_fish_racks` | 6 |
| boat sheds | `xa_boatshed` | 3 |
| the temple of the Decree | `xa_temple` | 1 |
| wayside shrines (one a terrace stair) | `xa_wayside_shrine` | 3 |
| houses | `xa_poor_*`, `xa_mid_*`, `xa_rich_*`, `xa_andean_*` | 327 |

**Missing** (shared target section 5; each draws a stand-in until it lands): `xa_ghat`; `xa_governor`; crocus terraces as land (the farmland pass).

## 5. Core adoption

The shared table (`../PLAN.md` section 7) holds for every town: `core/world`, `core/coast`, `core/water`, `core/city` and
`core/space`, `core/rand`, `core/tags`, `core/mask`, `kits/xanadu`, `kits/interiors`, `core/atmos`, `core/charactermodels`,
`core/region`. What Saphran adds:

| Need | Module | How |
|---|---|---|
| Its ground | `core/world`, `89zp-xl-site.js` | `xlH('saffron', x, z)` fitted to the region's ground at 857,1519; shore bearing N; the wall's rise about 769 m in 7 km |
| The crops | `kits/crops` | `CROPS.at` for the crocus: its warmth and aridity range against the terraces' place, so the bloom is plausible where it is drawn |

## 6. Textures

the shared set (`../PLAN.md` section 8); `stone.ghat.wet` (section 59).

## 7. Pins (the scale-model queue; listed, not edited)

- A records-only town pin, `sxanlksaffron01`, "Saphran", type `town`, 857,1519, polity the Sultanate (the shared target's section 9 batch).

## 8. Open points (each with the default the build takes if the owner says nothing)

None beyond the shared target's.

## 9. Steps

Built in step **L3** of the shared target (`../PLAN.md` section 10): the spec row in `89zl-xl-specs.js`, the ground fitted
(`tools/fit_lake_town.py saffron`), the plan and its verify (`verify.py --assert ?town=saffron` on the GPU lane), its
`bake_towns.py` entry and tile, and the region drawing it. Done when the verify passes, `bake_towns.py saffron --check` reads
the same, the node tests hold its census to the tune, and `tools/check_core_use.py` passes.
