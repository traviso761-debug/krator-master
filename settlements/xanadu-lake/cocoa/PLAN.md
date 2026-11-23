# Qōqō (Cocoa): a lake town of 1,800 on Erewhon's lake (plan, 2026-11-22)

One of the twenty lake towns of the shared target (`settlements/xanadu-lake/PLAN.md`: the target, the spec's shape, the
pieces, the verify and the Core adoption every town shares). This file is what is Qōqō's own. The owner, 2026-11-16:
*"Lake towns over 500 can be laid out in full"*; 2026-11-22: one shared target and the regions draw them. Everything not
from the owner, the lore or the tune is *proposed*.

## 1. The record (`XAN_TUNE.lake`, read in place)

| Field | Value |
|---|---|
| Id | `lk.cocoa` |
| Name | Qōqō (Cocoa) |
| px | 838,1489 (the 5.1 canvas, 2 km a pixel); in the xanadu-oidong-highrift frame x -706,000 m, z -160,000 m |
| People | 1,800 (about 327 households of 5.5) |
| Province | P7 (Nōrth-Shor, the North Shore), hub Phēr (`xan.pher`), 11 km by water (straight line) |
| Diet | `lake`: 225 t of grain a year, 81 t of fish, 14 t of fruit |
| Fishing | `lk.cocoa.fishing`, the dugouts: crew 200, 281 t a year (`T.fishKgPerson` 260 kg a head x .6); it eats 81 t, and the road to the hub carries 55 % of the stock (`share`); its fishery `T.fishery`, half a year of catch in the water |
| Its make | `lk.cocoa.cacao`: 50 t of cacao a year, crew 200; the road to the hub carries 85 % of the stock (`share`) |
| Terraces | `lk.cocoa.terraces`: crew 160 in the harvest, 135 t of grain (three fifths of what it eats); about 108 ha of terrace at 1.5 t/ha |
| From the hub | 90 t of grain a year by the round |
| The round | `round.north-west` (Phēr's north-west round): call 1 of 4, after Phēr, before Nēṭ |
| The fair | `T.loops`: the fair's west loop calls here two days a week |

## 2. The site and the ground

| | |
|---|---|
| The model's cell | -500 m, 8.4 % slope over its 2 km cell; the lake (-520 m) on the S; relief 1,022 m within 7 km; the highest ground within 7 km at 48 m (548 m above the town) |
| The shore | *proposed* coast class `sand` at the landing (`core/coast`; L0's fit reads the region's `coast:<class>` field and keeps it if it disagrees) |
| Water | The Swīṭ Siṭrīm (`r_pher_swit`, 2 m³/s), Phēr's stream, reaches the lake 8-10 km east. |
| The region | `xanadu-north-shore` holds the ground (its box is px 808-884 by 1446-1514) but **no site yet**: step L2 adds it |
| Footprint | *proposed* about 16 ha of town (110 people a ha in the lanes), a footprint radius of about 250 m round the landing, the terraces above it out to the band |

## 3. The town

The cacao town on the bend, 11 km west of Phēr. Qōqō makes 50 t of cacao a year (`lk.cocoa.cacao`, picked through the wet, year days 150-250): the beans are fermented here and go to Phēr's cacao house to be pressed into cakes (`T.chain.cacaoPress`). It is the north-west round's first call, at the shore cell where the coast turns (Phēr's plan, section 1.1: the bend's west side).

*Proposed* look: cacao groves under shade trees on the warm lower slope, the fermentaries with their sweating boxes and drying floors by the landing, and a busy landing for the short run to Phēr. The Swīṭ Siṭrīm (Phēr's stream, `r_pher_swit`) comes down 8 km east.

**The quarters** (*proposed*; the spec's `quarters`, shares of the houses):

| Quarter | Role | Share | Where | What |
|---|---|---|---|---|
| `landing` | harbour | 10 % | shore | the landing and the drying floors |
| `ferment` | industry | 15 % | shore | the fermentaries |
| `town` | residential | 45 % | slope | the town |
| `groves` | farm | 20 % | bench | the cacao groves under their shade trees |
| `market` | market | 10 % | slope | the market and the temple |

**The houses** (*proposed*): about 327, one a household: 50 % poor, 38 % middling, 12 % rich (about 164, 124 and 39), 25 % of them in the Andean set (87b) as Phēr takes a share.

**The landmarks** (the spec's `landmarks`):

- the fermentaries: `xa_fermentary` (shore)
- the temple of the Decree: `xa_temple` (slope)

**The boats** (*proposed*, `90s`): 50 dugouts (two to a dugout, the fishing crew's half afloat at a time), 3 launches, 1 barge at the landing.

## 4. Its pieces

| What | Key | How many (*proposed*) |
|---|---|---|
| fermentaries | `xa_fermentary` | 4 |
| drying floors (a farm yard each) | `xa_farm` | 4 |
| fish racks | `xa_fish_racks` | 6 |
| boat sheds | `xa_boatshed` | 3 |
| the temple of the Decree | `xa_temple` | 1 |
| wayside shrines (one a terrace stair) | `xa_wayside_shrine` | 3 |
| houses | `xa_poor_*`, `xa_mid_*`, `xa_rich_*`, `xa_andean_*` | 327 |

**Missing** (shared target section 5; each draws a stand-in until it lands): `xa_ghat`; `xa_governor`; the orchard plot (the cacao groves).

## 5. Core adoption

The shared table (`../PLAN.md` section 7) holds for every town: `core/world`, `core/coast`, `core/water`, `core/city` and
`core/space`, `core/rand`, `core/tags`, `core/mask`, `kits/xanadu`, `kits/interiors`, `core/atmos`, `core/charactermodels`,
`core/region`. What Qōqō adds:

| Need | Module | How |
|---|---|---|
| Its ground | `core/world`, `89zp-xl-site.js` | `xlH('cocoa', x, z)` fitted to the region's ground at 838,1489; shore bearing S; the wall's rise about 548 m in 7 km |
| The region's site | `openworld/SITES.json` | A new site (`sxanlkcocoa01`, *proposed*) with corridors to Nēṭ and Phēr's square (step L2) |

## 6. Textures

the shared set (`../PLAN.md` section 8); `stone.ghat.wet` (section 59).

## 7. Pins (the scale-model queue; listed, not edited)

- A records-only town pin, `sxanlkcocoa01`, "Qōqō", type `town`, 838,1489, polity the Sultanate (the shared target's section 9 batch).

## 8. Open points (each with the default the build takes if the owner says nothing)

1. The bend's headland may be Phēr's harbour instead (Phēr's plan, section 1.1). *Default:* Qōqō takes the bend's west side, Phēr keeps its own cove.

## 9. Steps

Built in step **L2** of the shared target (`../PLAN.md` section 10): the spec row in `89zl-xl-specs.js`, the ground fitted
(`tools/fit_lake_town.py cocoa`), the plan and its verify (`verify.py --assert ?town=cocoa` on the GPU lane), its
`bake_towns.py` entry and tile, and the region drawing it. Done when the verify passes, `bake_towns.py cocoa --check` reads
the same, the node tests hold its census to the tune, and `tools/check_core_use.py` passes.
