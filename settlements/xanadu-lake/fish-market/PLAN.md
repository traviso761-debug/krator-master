# Phish-Mārkiṭ (Fish Market): a lake town of 4,000 on Erewhon's lake (plan, 2026-11-22)

One of the twenty lake towns of the shared target (`settlements/xanadu-lake/PLAN.md`: the target, the spec's shape, the
pieces, the verify and the Core adoption every town shares). This file is what is Phish-Mārkiṭ's own. The owner, 2026-11-16:
*"Lake towns over 500 can be laid out in full"*; 2026-11-22: one shared target and the regions draw them. Everything not
from the owner, the lore or the tune is *proposed*.

## 1. The record (`XAN_TUNE.lake`, read in place)

| Field | Value |
|---|---|
| Id | `lk.fish-market` |
| Name | Phish-Mārkiṭ (Fish Market) |
| px | 815,1501 (the 5.1 canvas, 2 km a pixel); in the xanadu-oidong-highrift frame x -752,000 m, z -136,000 m |
| People | 4,000 (about 727 households of 5.5) |
| Province | P1 (Lēk-Shor, the Lake Shore), hub Erehwon (`s57bkv9741`), 61 km by water (straight line) |
| Diet | `lake`: 500 t of grain a year, 180 t of fish, 32 t of fruit |
| Fishing | `lk.fish-market.fishing`, the dugouts: crew 200, 624 t a year (`T.fishKgPerson` 260 kg a head x .6); it eats 180 t, and the road to the hub carries 55 % of the stock (`share`); its fishery `T.fishery`, half a year of catch in the water |
| Its make | none counted (its fish only) |
| Terraces | `lk.fish-market.terraces`: crew 160 in the harvest, 300 t of grain (three fifths of what it eats); about 225 ha of terrace at 1.6 t/ha |
| From the hub | 200 t of grain a year by the round |
| The round | `round.west` (Erehwon's west round): call 5 of 6, after Lōṭas, before Siṭāq |

## 2. The site and the ground

| | |
|---|---|
| The model's cell | -500 m, 4.8 % slope over its 2 km cell; the lake (-520 m) on the N; relief 754 m within 7 km; the highest ground within 7 km at 10 m (510 m above the town) |
| The shore | *proposed* coast class `sand` at the landing (`core/coast`; L0's fit reads the region's `coast:<class>` field and keeps it if it disagrees) |
| Water | None within 8 km on the model; the Bhon Ḍrāi (`r492`, a wadi) ends at 813,1491, 10 km north. |
| The region | `xanadu-lake-shore`, site `sxanlkfish01` (`openworld/SITES.json`, 6 km reach): cut, no town drawn yet |
| Footprint | *proposed* about 36 ha of town (110 people a ha in the lanes), a footprint radius of about 350 m round the landing, the terraces above it out to the band |

## 3. The town

The west shore's market town and the lake's fish market. Phish-Mārkiṭ, 4,000, is one of the two largest of the twenty, on the gentlest stretch of the west shore (5 %). The tune gives it no make of its own beyond its fish (`lk.fish-market.fishing`: the largest fleet of the twenty), but its market is where the west round's towns sell their catch to Erehwon's buyers, and where the west's roads come down to the lake.

*Proposed* look: Panajachel and Santiago Atitlán's market crowded together. A harbour with a mole (`xa_harbour_quay`, `xa_mole_run`), a covered fish market at the head of the quay, the smokehouses and racks along the shore, the market streets up the slope with their stalls, a caravanserai where the west road comes in, and a larger temple than the other towns'. The richest of the lake towns after Phēr.

**The quarters** (*proposed*; the spec's `quarters`, shares of the houses):

| Quarter | Role | Share | Where | What |
|---|---|---|---|---|
| `harbour` | harbour | 15 % | shore | the harbour, the mole, the fish market, the smokehouses |
| `market` | market | 15 % | shore | the market streets and stalls, the caravanserai |
| `old` | residential | 35 % | slope | the fishers' town up the slope |
| `merchants` | residential | 15 % | slope | the buyers' and merchants' houses |
| `bench` | residential | 15 % | bench | the terrace farmers' houses |
| `temple` | civic | 5 % | slope | the great temple and its court |

**The houses** (*proposed*): about 727, one a household: 45 % poor, 40 % middling, 15 % rich (about 327, 291 and 109), 20 % of them in the Andean set (87b) as Phēr takes a share.

**The landmarks** (the spec's `landmarks`):

- the fish market: `xa_stall rows under xa_harbour_warehouse` (shore)
- the harbour and mole: `xa_harbour_quay, xa_mole_run` (shore)
- the caravanserai: `xa_caravanserai` (shore)
- the great temple: `xa_temple (the larger: or xa_grand_temple)` (slope)

**The boats** (*proposed*, `90s`): 200 dugouts (two to a dugout, the fishing crew's half afloat at a time), 4 launches, 4 barges at the landing.

## 4. Its pieces

| What | Key | How many (*proposed*) |
|---|---|---|
| fish racks and smokehouses | `xa_fish_racks` | 24 |
| boat sheds | `xa_boatshed` | 10 |
| market stalls | `xa_stall` | 40 |
| warehouses | `xa_harbour_warehouse` | 4 |
| the temple of the Decree | `xa_temple` | 1 |
| wayside shrines (one a terrace stair) | `xa_wayside_shrine` | 6 |
| houses | `xa_poor_*`, `xa_mid_*`, `xa_rich_*`, `xa_andean_*` | 727 |

**Missing** (shared target section 5; each draws a stand-in until it lands): `xa_ghat`; `xa_governor`.

## 5. Core adoption

The shared table (`../PLAN.md` section 7) holds for every town: `core/world`, `core/coast`, `core/water`, `core/city` and
`core/space`, `core/rand`, `core/tags`, `core/mask`, `kits/xanadu`, `kits/interiors`, `core/atmos`, `core/charactermodels`,
`core/region`. What Phish-Mārkiṭ adds:

| Need | Module | How |
|---|---|---|
| Its ground | `core/world`, `89zp-xl-site.js` | `xlH('fish-market', x, z)` fitted to the region's ground at 815,1501; shore bearing N; the wall's rise about 510 m in 7 km |
| The west road | `core/world` (`ROADS`) | The road west over the rim: the region's road, its caravanserai at the town's gate |

## 6. Textures

the shared set (`../PLAN.md` section 8); `stone.ghat.wet` (section 59); `ground.lakebed.algal` (the harbour's floor).

## 7. Pins (the scale-model queue; listed, not edited)

- A records-only town pin, `sxanlkfish01`, "Phish-Mārkiṭ", type `town`, 815,1501, polity the Sultanate (the shared target's section 9 batch).

## 8. Open points (each with the default the build takes if the owner says nothing)

1. The larger temple: `xa_grand_temple` is Erehwon's. *Default:* the ordinary `xa_temple` at 1.3x, not the grand one.

## 9. Steps

Built in step **L4** of the shared target (`../PLAN.md` section 10): the spec row in `89zl-xl-specs.js`, the ground fitted
(`tools/fit_lake_town.py fish-market`), the plan and its verify (`verify.py --assert ?town=fish-market` on the GPU lane), its
`bake_towns.py` entry and tile, and the region drawing it. Done when the verify passes, `bake_towns.py fish-market --check` reads
the same, the node tests hold its census to the tune, and `tools/check_core_use.py` passes.
