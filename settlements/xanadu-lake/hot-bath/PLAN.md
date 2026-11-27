# Hoṭ-Bāṭh (Hot Bath): a lake town of 1,800 on Erewhon's lake (plan, 2026-11-22)

One of the twenty lake towns of the shared target (`settlements/xanadu-lake/PLAN.md`: the target, the spec's shape, the
pieces, the verify and the Core adoption every town shares). This file is what is Hoṭ-Bāṭh's own. The owner, 2026-11-16:
*"Lake towns over 500 can be laid out in full"*; 2026-11-22: one shared target and the regions draw them. Everything not
from the owner, the lore or the tune is *proposed*.

## 1. The record (`XAN_TUNE.lake`, read in place)

| Field | Value |
|---|---|
| Id | `lk.hot-bath` |
| Name | Hoṭ-Bāṭh (Hot Bath) |
| px | 876,1513 (the 5.1 canvas, 2 km a pixel); in the xanadu-oidong-highrift frame x -630,000 m, z -112,000 m |
| People | 1,800 (about 327 households of 5.5) |
| Province | P1 (Lēk-Shor, the Lake Shore), hub Erehwon (`s57bkv9741`), 70 km by water (straight line) |
| Diet | `lake`: 225 t of grain a year, 81 t of fish, 14 t of fruit |
| Fishing | `lk.hot-bath.fishing`, the dugouts: crew 200, 281 t a year (`T.fishKgPerson` 260 kg a head x .6); it eats 81 t, and the road to the hub carries 55 % of the stock (`share`); its fishery `T.fishery`, half a year of catch in the water |
| Its make | `lk.hot-bath.sulfur`: 40 t of sulfur a year, crew 200; the road to the hub carries 85 % of the stock (`share`) |
| Terraces | `lk.hot-bath.terraces`: crew 160 in the harvest, 135 t of grain (three fifths of what it eats); about 101 ha of terrace at 1.6 t/ha |
| From the hub | 90 t of grain a year by the round |
| The round | `round.south-east` (Erehwon's south-east round): call 6 of 7, after Ṭī-Ṭeras, before Ālph-Hēḍ |

## 2. The site and the ground

| | |
|---|---|
| The model's cell | -447 m, 7.8 % slope over its 2 km cell; the lake (-520 m) on the NW; relief 646 m within 7 km; the highest ground within 7 km at -20 m (427 m above the town) |
| The shore | *proposed* coast class `shelf` at the landing (`core/coast`; L0's fit reads the region's `coast:<class>` field and keeps it if it disagrees) |
| Water | The Ālph (`r070`, perennial, 520 m³/s), the lake's outflow, leaves 3 km north-east of the town at 876.9,1511.7 and runs east to Qiblai's lake. The town takes its bridge. |
| The region | `xanadu-lake-shore`, site `sxanlkhotbath01` (`openworld/SITES.json`, 6 km reach): cut, no town drawn yet |
| Footprint | *proposed* about 16 ha of town (110 people a ha in the lanes), a footprint radius of about 250 m round the landing, the terraces above it out to the band |

## 3. The town

The baths at the Ālph's outflow. Hoṭ-Bāṭh stands on the south-east shore where the lake drains into the Ālph (`r070` leaves at 876.9,1511.7, 3 km north-east of the town), on warm ground: a hot spring on the caldera's flank gives the town its baths and its 40 t of sulfur a year (`lk.hot-bath.sulfur`), scraped from the spring's crust.

*Proposed* look: a spa town for Erehwon's court and its merchants, half bath and half works. The bath house over the spring with its pools stepped down to the lake, the sulfur works upstream of it where the crust forms, the inns and teahouses along the shore road, and the first bridge over the Ālph (`xa_river_span`) at the outflow, which every road south and east crosses.

**The quarters** (*proposed*; the spec's `quarters`, shares of the houses):

| Quarter | Role | Share | Where | What |
|---|---|---|---|---|
| `baths` | civic | 15 % | shore | the bath house over the spring, its terraced pools, the inns and teahouses |
| `bridge` | market | 15 % | stream | the bridge over the Ālph, the toll house, the market at the bridge foot |
| `town` | residential | 40 % | slope | the town up the slope behind the baths |
| `works` | industry | 15 % | slope | the sulfur works on the crust beds, apart and downwind |
| `fishers` | residential | 15 % | shore | the fishers' row by the landing |

**The houses** (*proposed*): about 327, one a household: 45 % poor, 40 % middling, 15 % rich (about 147, 131 and 49), 20 % of them in the Andean set (87b) as Phēr takes a share.

**The landmarks** (the spec's `landmarks`):

- the bath house: `xa_bath (with the pools stepped to the lake)` (shore)
- the Ālph bridge: `xa_river_span` (stream)
- the temple of the Decree: `xa_temple` (shore)
- the sulfur works: `xa_sulfur_works` (slope)

**The boats** (*proposed*, `90s`): 50 dugouts (two to a dugout, the fishing crew's half afloat at a time), 2 launches, 1 barge at the landing.

## 4. Its pieces

| What | Key | How many (*proposed*) |
|---|---|---|
| sulfur works | `xa_sulfur_works` | 3 |
| bath house | `xa_bath` | 2 |
| fish racks | `xa_fish_racks` | 6 |
| boat sheds | `xa_boatshed` | 3 |
| teahouses | `xa_teahouse` | 4 |
| the temple of the Decree | `xa_temple` | 1 |
| wayside shrines (one a terrace stair) | `xa_wayside_shrine` | 3 |
| houses | `xa_poor_*`, `xa_mid_*`, `xa_rich_*`, `xa_andean_*` | 327 |

**Missing** (shared target section 5; each draws a stand-in until it lands): `xa_ghat`; `xa_governor`; a spring house over the source (the bath stands in).

## 5. Core adoption

The shared table (`../PLAN.md` section 7) holds for every town: `core/world`, `core/coast`, `core/water`, `core/city` and
`core/space`, `core/rand`, `core/tags`, `core/mask`, `kits/xanadu`, `kits/interiors`, `core/atmos`, `core/charactermodels`,
`core/region`. What Hoṭ-Bāṭh adds:

| Need | Module | How |
|---|---|---|
| Its ground | `core/world`, `89zp-xl-site.js` | `xlH('hot-bath', x, z)` fitted to the region's ground at 876,1513; shore bearing NW; the wall's rise about 427 m in 7 km |
| The spring | `core/water`, `core/terrain` | The spring's pools as still water stepped down the slope; their basins carved (`core/terrain/36-core-carve.js` through `CORE_TERRAIN`) |
| The vent | `core/world` (vents) | A hot spring as a vent record on the region (`vents.json` has none here): *proposed* for the queue, records-only |

## 6. Textures

the shared set (`../PLAN.md` section 8); `stone.ghat.wet` (section 59); `ground.sulfur.crust` (section 58, owed); `ground.sinter.opaline` (the spring's apron).

## 7. Pins (the scale-model queue; listed, not edited)

- A records-only town pin, `sxanlkhotbath01`, "Hoṭ-Bāṭh", type `town`, 876,1513, polity the Sultanate (the shared target's section 9 batch).
- A hot spring as a vent record on the region (`vents.json` has none here): *proposed* for the queue, records-only

## 8. Open points (each with the default the build takes if the owner says nothing)

1. The spring: the model has no vent here. *Default:* a records-only vent in the queue's next batch (section 6), and the page draws the spring from its own spec meanwhile.

## 9. Steps

Built in step **L3** of the shared target (`../PLAN.md` section 10): the spec row in `89zl-xl-specs.js`, the ground fitted
(`tools/fit_lake_town.py hot-bath`), the plan and its verify (`verify.py --assert ?town=hot-bath` on the GPU lane), its
`bake_towns.py` entry and tile, and the region drawing it. Done when the verify passes, `bake_towns.py hot-bath --check` reads
the same, the node tests hold its census to the tune, and `tools/check_core_use.py` passes.

**Held 2026-11-23** (step L3): the spec row is written, but the fit's 40 m rest grid cannot carry the 50 m inlet 800 m west
of the landing, so the shore check fails by 100 m there (`../KNOWN_ISSUES.md`). The town waits for a finer rest grid along the
shore in `tools/fit_lake_town.py`; its Ālph crossing is the region's at step L6 (`../PLAN.md` section 10).
