# Malbari (Mulberry): a lake town of 2,200 on Erewhon's lake (plan, 2026-11-22)

One of the twenty lake towns of the shared target (`settlements/xanadu-lake/PLAN.md`: the target, the spec's shape, the
pieces, the verify and the Core adoption every town shares). This file is what is Malbari's own. The owner, 2026-11-16:
*"Lake towns over 500 can be laid out in full"*; 2026-11-22: one shared target and the regions draw them. Everything not
from the owner, the lore or the tune is *proposed*.

## 1. The record (`XAN_TUNE.lake`, read in place)

| Field | Value |
|---|---|
| Id | `lk.mulberry` |
| Name | Malbari (Mulberry) |
| px | 825,1488 (the 5.1 canvas, 2 km a pixel); in the xanadu-oidong-highrift frame x -732,000 m, z -162,000 m |
| People | 2,200 (about 400 households of 5.5) |
| Province | P7 (Nōrth-Shor, the North Shore), hub Phēr (`xan.pher`), 36 km by water (straight line) |
| Diet | `lake`: 275 t of grain a year, 99 t of fish, 18 t of fruit |
| Fishing | `lk.mulberry.fishing`, the dugouts: crew 200, 343 t a year (`T.fishKgPerson` 260 kg a head x .6); it eats 99 t, and the road to the hub carries 55 % of the stock (`share`); its fishery `T.fishery`, half a year of catch in the water |
| Its make | `lk.mulberry.silk`: 16 t of silk a year, crew 200; the road to the hub carries 85 % of the stock (`share`) |
| Terraces | `lk.mulberry.terraces`: crew 160 in the harvest, 165 t of grain (three fifths of what it eats); about 132 ha of terrace at 1.5 t/ha |
| From the hub | 110 t of grain a year by the round |
| The round | `round.north-west` (Phēr's north-west round): call 3 of 4, after Nēṭ, before Hāibh |
| The fair | `T.loops`: the fair's west loop calls here two days a week |

## 2. The site and the ground

| | |
|---|---|
| The model's cell | -500 m, 3.9 % slope over its 2 km cell; the lake (-520 m) on the S; relief 743 m within 7 km; the highest ground within 7 km at -5 m (495 m above the town) |
| The shore | *proposed* coast class `marsh` at the landing (`core/coast`; L0's fit reads the region's `coast:<class>` field and keeps it if it disagrees) |
| Water | The Qol Siṭrīm (`r272`, perennial, 139.7 m³/s) reaches the lake at 824,1489, 2 km west of the pin: the town stands on its east bank, its mouth the harbour. |
| The region | `xanadu-north-shore` holds the ground (its box is px 808-884 by 1446-1514) but **no site yet**: step L2 adds it |
| Footprint | *proposed* about 20 ha of town (110 people a ha in the lanes), a footprint radius of about 250 m round the landing, the terraces above it out to the band |

## 3. The town

The silk town at the Qol Siṭrīm's mouth. Malbari makes 16 t of silk a year (`lk.mulberry.silk`, the spring rearing, year days 60-120) from the mulberry groves on the river's flat; the Qol Siṭrīm (`r272`, 139.7 m³/s) reaches the lake here, and the road to Thalaba starts up its valley (the Qol ford, 822.7,1480, is 9 km north-west). It hosts one of the fair week's days (Phēr's plan).

*Proposed* look: the north-west's largest town, on the flattest shore of the twenty (4 %). Mulberry groves on the river's flat, the reeling houses along the river where the water runs them, the rearing houses (long, shuttered) among the groves, the river bridge, and the start of the Qol road with its han. The silk goes to Wībhar by Phēr and Erehwon.

**The quarters** (*proposed*; the spec's `quarters`, shares of the houses):

| Quarter | Role | Share | Where | What |
|---|---|---|---|---|
| `river` | industry | 20 % | stream | the reeling houses and the watermills along the river |
| `landing` | harbour | 10 % | shore | the landing at the river mouth, the silk store |
| `town` | residential | 40 % | slope | the town on the river's east bank |
| `groves` | farm | 20 % | stream | the mulberry groves and the rearing houses on the flat |
| `road` | market | 10 % | stream | the bridge, the han at the road's start, the market |

**The houses** (*proposed*): about 400, one a household: 50 % poor, 38 % middling, 12 % rich (about 200, 152 and 48), 25 % of them in the Andean set (87b) as Phēr takes a share.

**The landmarks** (the spec's `landmarks`):

- the reeling houses: `xa_reeling_house` (stream)
- the Qol bridge: `xa_river_span` (stream). **The owner, 2026-11-23: "place bridge on map at open world step"**: the bridge is a
  map feature where the road crosses the Qol (`r272`, near its mouth at 824,1489), added by the scale-model re-run and drawn by
  `xanadu-north-shore` at the shared target's step L6 (`../PLAN.md` sections 9 and 10), seated on the region's banks with a check
  that the road meets the deck on both banks. Malbari's page stays as it is (the river is outside its footprint)
- the han: `xa_caravanserai` (stream)
- the temple of the Decree: `xa_temple` (slope)

**The boats** (*proposed*, `90s`): 70 dugouts (two to a dugout, the fishing crew's half afloat at a time), 2 launches, 2 barges at the landing.

## 4. Its pieces

| What | Key | How many (*proposed*) |
|---|---|---|
| reeling houses | `xa_reeling_house` | 6 |
| watermills | `xa_watermill` | 2 |
| rearing houses (a workshop each) | `xa_workshop` | 8 |
| fish racks | `xa_fish_racks` | 8 |
| boat sheds | `xa_boatshed` | 4 |
| the temple of the Decree | `xa_temple` | 1 |
| wayside shrines (one a terrace stair) | `xa_wayside_shrine` | 3 |
| houses | `xa_poor_*`, `xa_mid_*`, `xa_rich_*`, `xa_andean_*` | 400 |

**Missing** (shared target section 5; each draws a stand-in until it lands): `xa_ghat`; `xa_governor`; the orchard plot (the mulberry groves).

## 5. Core adoption

The shared table (`../PLAN.md` section 7) holds for every town: `core/world`, `core/coast`, `core/water`, `core/city` and
`core/space`, `core/rand`, `core/tags`, `core/mask`, `kits/xanadu`, `kits/interiors`, `core/atmos`, `core/charactermodels`,
`core/region`. What Malbari adds:

| Need | Module | How |
|---|---|---|
| Its ground | `core/world`, `89zp-xl-site.js` | `xlH('mulberry', x, z)` fitted to the region's ground at 825,1488; shore bearing S; the wall's rise about 495 m in 7 km |
| The river | `core/water` | The Qol Siṭrīm's bed and mouth from `rivers.json`; the town's water mask joins it (`41t-world-town-water.js`, as Voth's river) |
| The region's site and the road | `openworld/SITES.json`, `core/world` (`ROADS`) | A new site (`sxanlkmulberry01`, *proposed*) and corridors to Hāibh, Nēṭ and the Qol ford; the Thalaba road joined at the bridge (step L2) |

## 6. Textures

the shared set (`../PLAN.md` section 8); `stone.ghat.wet` (section 59).

## 7. Pins (the scale-model queue; listed, not edited)

- A records-only town pin, `sxanlkmulberry01`, "Malbari", type `town`, 825,1488, polity the Sultanate (the shared target's section 9 batch).

## 8. Open points (each with the default the build takes if the owner says nothing)

None beyond the shared target's.

## 9. Steps

Built in step **L2** of the shared target (`../PLAN.md` section 10): the spec row in `89zl-xl-specs.js`, the ground fitted
(`tools/fit_lake_town.py mulberry`), the plan and its verify (`verify.py --assert ?town=mulberry` on the GPU lane), its
`bake_towns.py` entry and tile, and the region drawing it. Done when the verify passes, `bake_towns.py mulberry --check` reads
the same, the node tests hold its census to the tune, and `tools/check_core_use.py` passes.
