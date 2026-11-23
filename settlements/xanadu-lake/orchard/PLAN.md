# Ōrcharḍ (Orchard): a lake town of 1,600 on Erewhon's lake (plan, 2026-11-22)

One of the twenty lake towns of the shared target (`settlements/xanadu-lake/PLAN.md`: the target, the spec's shape, the
pieces, the verify and the Core adoption every town shares). This file is what is Ōrcharḍ's own. The owner, 2026-11-16:
*"Lake towns over 500 can be laid out in full"*; 2026-11-22: one shared target and the regions draw them. Everything not
from the owner, the lore or the tune is *proposed*.

## 1. The record (`XAN_TUNE.lake`, read in place)

| Field | Value |
|---|---|
| Id | `lk.orchard` |
| Name | Ōrcharḍ (Orchard) |
| px | 827,1512 (the 5.1 canvas, 2 km a pixel); in the xanadu-oidong-highrift frame x -728,000 m, z -114,000 m |
| People | 1,600 (about 291 households of 5.5) |
| Province | P1 (Lēk-Shor, the Lake Shore), hub Erehwon (`s57bkv9741`), 30 km by water (straight line) |
| Diet | `lake`: 200 t of grain a year, 72 t of fish, 13 t of fruit |
| Fishing | `lk.orchard.fishing`, the dugouts: crew 200, 250 t a year (`T.fishKgPerson` 260 kg a head x .6); it eats 72 t, and the road to the hub carries 55 % of the stock (`share`); its fishery `T.fishery`, half a year of catch in the water |
| Its make | `lk.orchard.fruit`: 420 t of fruit a year, crew 200; the road to the hub carries 85 % of the stock (`share`) |
| Terraces | `lk.orchard.terraces`: crew 160 in the harvest, 120 t of grain (three fifths of what it eats); about 90 ha of terrace at 1.6 t/ha |
| From the hub | 80 t of grain a year by the round |
| The round | `round.west` (Erehwon's west round): call 3 of 6, after Qorī, before Lōṭas |

## 2. The site and the ground

| | |
|---|---|
| The model's cell | -440 m, 8.0 % slope over its 2 km cell; the lake (-520 m) on the N; relief 1,068 m within 7 km; the highest ground within 7 km at 242 m (682 m above the town) |
| The shore | *proposed* coast class `shingle` at the landing (`core/coast`; L0's fit reads the region's `coast:<class>` field and keeps it if it disagrees) |
| Water | None within 8 km on the model. |
| The region | `xanadu-lake-shore`, site `sxanlkorchard01` (`openworld/SITES.json`, 6 km reach): cut, no town drawn yet |
| Footprint | *proposed* about 15 ha of town (110 people a ha in the lanes), a footprint radius of about 200 m round the landing, the terraces above it out to the band |

## 3. The town

The orchard town of the south-west shore. Ōrcharḍ makes 420 t of fruit a year (`lk.orchard.fruit`), the most of any lake town: open orchards on broad terraces where the wall eases (8 %), with apiaries among the trees and a cacao fermentary for the groves on the warm lower slope.

*Proposed* look: Gārḍan's working cousin, no garden walls and no villas. Open orchards in rows up the benches, the packing sheds and drying racks by the landing, the fruit barges, and the hives along the orchard edges.

**The quarters** (*proposed*; the spec's `quarters`, shares of the houses):

| Quarter | Role | Share | Where | What |
|---|---|---|---|---|
| `landing` | harbour | 10 % | shore | the landing, the packing sheds |
| `town` | residential | 45 % | slope | the orchard men's houses |
| `orchards` | farm | 30 % | bench | the orchards and the farmsteads among them |
| `market` | market | 10 % | shore | the market and the temple |
| `hives` | farm | 5 % | bench | the apiaries at the orchards' edge |

**The houses** (*proposed*): about 291, one a household: 55 % poor, 35 % middling, 10 % rich (about 160, 102 and 29), 30 % of them in the Andean set (87b) as Phēr takes a share.

**The landmarks** (the spec's `landmarks`):

- the orchards: `the orchard plot (missing)` (bench)
- the fermentary: `xa_fermentary` (slope)
- the temple of the Decree: `xa_temple` (shore)

**The boats** (*proposed*, `90s`): 45 dugouts (two to a dugout, the fishing crew's half afloat at a time), 2 launches, 2 barges at the landing.

## 4. Its pieces

| What | Key | How many (*proposed*) |
|---|---|---|
| packing sheds | `xa_warehouse` | 3 |
| fermentary | `xa_fermentary` | 1 |
| apiaries | `xa_apiary` | 4 |
| farmsteads | `xa_farmhouse` | 12 |
| fish racks | `xa_fish_racks` | 6 |
| the temple of the Decree | `xa_temple` | 1 |
| wayside shrines (one a terrace stair) | `xa_wayside_shrine` | 2 |
| houses | `xa_poor_*`, `xa_mid_*`, `xa_rich_*`, `xa_andean_*` | 291 |

**Missing** (shared target section 5; each draws a stand-in until it lands): `xa_ghat`; `xa_governor`; the orchard plot.

## 5. Core adoption

The shared table (`../PLAN.md` section 7) holds for every town: `core/world`, `core/coast`, `core/water`, `core/city` and
`core/space`, `core/rand`, `core/tags`, `core/mask`, `kits/xanadu`, `kits/interiors`, `core/atmos`, `core/charactermodels`,
`core/region`. What Ōrcharḍ adds:

| Need | Module | How |
|---|---|---|
| Its ground | `core/world`, `89zp-xl-site.js` | `xlH('orchard', x, z)` fitted to the region's ground at 827,1512; shore bearing N; the wall's rise about 682 m in 7 km |
| The orchards | `core/hamlet` (`14-hamlet-farmland.js`), `kits/crops` | As Gārḍan |

## 6. Textures

the shared set (`../PLAN.md` section 8); `stone.ghat.wet` (section 59).

## 7. Pins (the scale-model queue; listed, not edited)

- A records-only town pin, `sxanlkorchard01`, "Ōrcharḍ", type `town`, 827,1512, polity the Sultanate (the shared target's section 9 batch).

## 8. Open points (each with the default the build takes if the owner says nothing)

None beyond the shared target's.

## 9. Steps

Built in step **L4** of the shared target (`../PLAN.md` section 10): the spec row in `89zl-xl-specs.js`, the ground fitted
(`tools/fit_lake_town.py orchard`), the plan and its verify (`verify.py --assert ?town=orchard` on the GPU lane), its
`bake_towns.py` entry and tile, and the region drawing it. Done when the verify passes, `bake_towns.py orchard --check` reads
the same, the node tests hold its census to the tune, and `tools/check_core_use.py` passes.
